/**
 * Created by Cici on 2018/2/9.
 */

var sysError = require('./util/SystemError.js');
var sysMsg = require('./util/SystemMsg.js');
var serverLogger = require('./util/ServerLogger.js');
var wechatUtil = require("./util/WechatUtil.js");
var WechatDao= require("./dao/WechatDao.js");
var orderDao = require('./dao/orderDao.js');
var logger = serverLogger.createLogger('WeiXinApi.js');
var https = require("https");
var http = require("http");
var Seq = require('seq');
var systemConfig = require('./config/SystemConfig');

var WXPay = require('weixin-pay');
var fs = require('fs');
var request=require('request');
var path = require('path');
var crypto = require("crypto");
const xml2js = require('xml2js');
var db=require('./db.js');

var appId = wechatUtil.WECHAT_APPID;
var secret = wechatUtil.WECHAT_SECRET;

//获取微信用户access_token
function getWeiXinAccessToken(req, res, next) {
    var code = req.params.code;
    var refreshToken = req.params.refreshToken;
    var url = '';
    logger.trace('clientAuth:', req.params);
    if (!code) {
        logger.error(' getWeiXinAccessToken ' + sysMsg.WEIXIN_ACCESSENTOKEN_CODE_ERROR);
        next(sysError.InternalError("", sysMsg.WEIXIN_ACCESSENTOKEN_CODE_ERROR));
    }
    var wsd = {
        tokenUrl: 'https://api.weixin.qq.com/sns/oauth2/access_token',
        refreshUrl: 'https://api.weixin.qq.com/sns/oauth2/refresh_token',
        appid: appId,
        secret: secret,
        code: code
    }

    //refreshToken 存在刷新access_token 不存在获得access_token
    /*if (refreshToken != 'null') {
        url = wsd.refreshUrl + '?appid=' + wsd.appid + '&grant_type=refresh_token&refresh_token=' + refreshToken;
    } else {
        url = wsd.tokenUrl + '?appid=' + wsd.appid + '&secret=' + wsd.secret + '&code=' + wsd.code + '&grant_type=authorization_code';
    }*/
    url = wsd.tokenUrl + '?appid=' + wsd.appid + '&secret=' + wsd.secret + '&code=' + wsd.code + '&grant_type=authorization_code';
    logger.info("getWeiXinAccessTokenUrl:" + url);
    https.get(url, function (result) {
        var data = "";
        result.on('data', function (d) {
            data += d;
        }).on('end', function () {
            var resObj = eval("(" + data + ")");
            if (!resObj.errcode) {
                var temy = {
                    access_token: resObj.access_token,
                    expires_in: resObj.expires_in,
                    refresh_token: resObj.refresh_token,
                    openid: resObj.openid,
                    scope: resObj.scope
                }
                logger.info("getWeiXinAccessToken " + resObj.access_token);
                res.send(200, temy);
                next();
            } else {
                logger.error("getWeiXinAccessToken " + resObj.errmsg);
                next(sysError.InternalError(resObj.errmsg, resObj.errmsg));
            }
        });
    }).on('error', function (e) {
        logger.error("getWeiXinAccessToken " + e.message);
        next(sysError.InternalError("getWeiXinAccessToken", e.message));
    })
}

//获取微信用户信息
function getWeiXinUser(req, res, next) {
    var wsd = {
        userUrl: "https://api.weixin.qq.com/sns/userinfo",
        openid: req.params.openid,
        access_token: req.params.access_token
    }
    if (!wsd.openid || !wsd.access_token) {
        logger.error(' getWeiXinUser ' + sysMsg.WEIXIN_USER_DATA_ERROR);
        next(sysError.InternalError("", sysMsg.WEIXIN_USER_DATA_ERROR));
    }
    var url = wsd.userUrl + '?access_token=' + wsd.access_token + '&openid=' + wsd.openid + '&lang=zh_CN';
    https.get(url, function (result) {
        var data = "";
        result.on('data', function (d) {
            data += d;
        }).on('end', function () {
            var resObj = eval("(" + data + ")");
            if (!resObj.errcode) {
                var temy = {
                    openid: resObj.openid,
                    nickname: resObj.nickname,
                    sex: resObj.sex,//1时是男性，值为2时是女性，值为0时是未知
                    province: resObj.province,
                    city: resObj.city,
                    country: resObj.country,
                    headimgurl: resObj.headimgurl,
                    privilege: resObj.privilege,
                    unionid: resObj.unionid,
                    ip:req.params.ip,
                    user_agent:req.params.user_agent
                }
                logger.info("getWeiXinUser " + resObj.access_token);
                addWeixinOperatorUser(temy,res);

            } else {
                logger.error("getWeiXinUser " + resObj.errmsg);
                next(sysError.InternalError(resObj.errmsg, resObj.errmsg));
            }
        });
    }).on('error', function (e) {
        logger.error("getWeiXinUser " + e.message);
        next(sysError.InternalError("getWeiXinUser", e.message));
    })

}

// 增加微信用户
function addWeixinOperatorUser(req, res) {
    var addParams = req.params || req;
    addParams.type = 1;//1微信
    if(addParams.privilege){
        if(addParams.privilege.length>0){
            var str='';
            for(var i in addParams.privilege){
                str=str+addParams.privilege[i];
            }
            addParams.privilege=str;
        }else{
            addParams.privilege='';
        }
    }
    Seq().seq(function () {
        var that = this;
        WechatDao.searchDBOperator(addParams, function (error, rows) {
            if (error) {
                logger.error(' searchOperation ' + error.message);
                throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else {
                if (rows && rows.length >= 1) {
                    var operator_id=rows[0].operator_id;
                    WechatDao.updateDBOperatorUser(addParams, function (error, rows) {
                        if (error) {
                            logger.error(' updateOperationUser ' + error.message);
                            res.send(200, {success: false, errMsg: sysMsg.SYS_INTERNAL_ERROR_MSG})
                            return next();
                        } else {
                            var temy=[];
                            temy.push(addParams);
                            temy[0].operator_id=operator_id;
                            temy[0].type=1;
                            res.send(200, {success: true, result: temy});
                            return next();
                        }
                    })
                } else {
                    WechatDao.addDBOperatorUser(addParams, function (error, rows) {
                        if (error) {
                            logger.error(' addOperatorUser ' + error.message);
                            res.send(200, {success: false, errMsg: sysMsg.SYS_INTERNAL_ERROR_MSG})
                            return next();
                        } else {
                            var temy=[];
                            temy.push(addParams);
                            temy[0].type=1;
                            temy[0].operator_id=rows.insertId
                            res.send(200, {success: true, result: temy})
                            return next();
                        }
                    })
                }
            }
        })
    })
}

//增加用户操作历史 operation 1登录 2下单
function addOperatorHistory(req, res) {
    var history = req.params;
    if(history.operation==1){
        history.operation='login'
    }else if(history.operation==2){
        history.operation='scan'
    }
    Seq().seq(function () {
        var that = this;
        WechatDao.addDBOperatorHistory(history, function (error, rows) {
            if (error) {
                logger.error(' addOperatorHistory ' + error.message);
                res.send(200, {success: false, errMsg: sysMsg.SYS_INTERNAL_ERROR_MSG})
                return next();
            } else {
                var temy=history;
                temy.operator_id=rows.insertId
                res.send(200, {success: true, data: temy})
                return next();
            }
        })
    })
}


// 增加其他用户
function addOperatorUser(req, res) {
    var addParams = req.params || req;
    addParams.type = 2;//2其他
    Seq().seq(function () {
        var that = this;
        WechatDao.addDBOperatorUser(addParams, function (error, rows) {
            if (error) {
                logger.error(' addOperationUser ' + error.message);
                res.send(200, {success: false, errMsg: sysMsg.SYS_INTERNAL_ERROR_MSG})
                return next();
            } else {
                var temy=[];
                temy.push(addParams);
                temy[0].type=2;
                temy[0].operator_id=rows.insertId;
                res.send(200, {success: true, result: temy})
                return next();
            }
        })
    })
}

//获得微信SDK的access_token
function getWxSDKAccessToken(req,res, next) {
    var url="https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + appId+ "&secret=" + secret;
    https.get(url, function (result) {
        var data = "";
        result.on('data', function (d) {
            data += d;
        }).on('end', function () {
            var resObj = eval("(" + data + ")");
            if (!resObj.errcode) {
                var temy = {
                    access_token: resObj.access_token,
                    token_expires_in: resObj.expires_in,
                }
                getWxSDKTicket(temy, res, next);
            } else {
                logger.error("getWxSDKAccessToken fail" + resObj.errmsg);
                next(sysError.InternalError(resObj.errmsg, resObj.errmsg));
            }
        });
    }).on('error', function (e) {
        logger.error("getWxSDKAccessToken fail " + e.message);
        next(sysError.InternalError("getWxSDKAccessToken fail", e.message));
    })
}

function getWxSDKTicket(req, res, next) {
    var accessToken = req.access_token;
    if(!accessToken){
        logger.error(' getWxSDKTicket ' + sysMsg.WEIXIN_ACCESSENTOKEN_ERROR);
        next(sysError.InternalError("", sysMsg.WEIXIN_ACCESSENTOKEN_ERROR));
    }
    var url= "https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=" +accessToken +"&type=jsapi";
    https.get(url, function (result) {
        var data = "";
        result.on('data', function (d) {
            data += d;
        }).on('end', function () {
            var resObj = eval("(" + data + ")");
            if (!resObj.errcode) {
                var temy = {
                    jsapi_ticket: resObj.ticket,
                    ticket_expires_in: resObj.expires_in,
                }
                logger.info("getWxSDKTicket success： " + resObj.jsapi_ticket);
                res.send(200,{success:true,result:temy});
                next();
            } else {
                logger.error("getWxSDKTicket fail" + resObj.errmsg);
                next(sysError.InternalError(resObj.errmsg, resObj.errmsg));
            }
        });
    }).on('error', function (e) {
        logger.error("getWxSDKTicket fail " + e.message);
        next(sysError.InternalError("getWxSDKTicket fail", e.message));
    })
}


function getWXPayParams(req,res){
    try {
        var code = req.query.code;
        var orderId = req.query.orderId;
        var access_token,openid,wxpay,totalPrice,bizName,bizId;


        logger.info(orderId);
        Seq().seq(function(){
            var that = this;
            var query = "select o.total_price,b.biz_id,b.name " +
                "from order_info o " +
                "left join business b on o.biz_id=b.biz_id " +
                "where o.id="+orderId;
            logger.info(query);
            db.dbQuery(query,[],function(error,rows){
                if(rows && rows.length>0){
                    totalPrice = rows[0].total_price;
                    bizName = rows[0].name;
                    bizId = rows[0].biz_id;
                    that()
                }else{
                    res.send(200, {success: false});
                    return next();
                }
            });
        }).seq(function(){
            var that = this;
            var url = 'https://api.weixin.qq.com/sns/oauth2/access_token?' +
                'appid='+ systemConfig.weixinConfig.app_id  +
                '&secret='+ systemConfig.weixinConfig.appsecret +
                '&code=' + code + '&grant_type=authorization_code ';
            logger.info("url:"+url);
            request.get({url:url},function(error,response,body){
                {
                    if(response.statusCode==200){
                        var data =JSON.parse(body);
                        access_token = data.access_token;
                        openid = data.openid;
                        logger.info({access_token:data.access_token,openid:data.openid});
                        that()
                    }
                }
            })
        }).seq(function(){
            var that = this;
            var loggerParams = {
                openid:openid,
                notify_url:systemConfig.weixinConfig.notify_url,
                body:bizName,
                attach:bizName,
                spbill_create_ip:systemConfig.weixinConfig.spbill_create_ip,
                out_trade_no:orderId,
                total_fee:totalPrice*100,
                scene_info:JSON.stringify({
                    "store_info" :
                        {
                            "id": bizId,
                            "name": bizName
                        }
                })
            }
            logger.info(loggerParams)
            var wxpay = WXPay({
                appid:systemConfig.weixinConfig.app_id,
                mch_id:systemConfig.weixinConfig.mch_id,
                partner_key:systemConfig.weixinConfig.partner_key,
                pfx:fs.readFileSync(path.join(__dirname, '../cert/apiclient_cert.p12'))
            })
            wxpay.getBrandWCPayRequestParams({
                openid:openid,
                notify_url:systemConfig.weixinConfig.notify_url,
                body:bizName,
                attach:bizName,
                spbill_create_ip:systemConfig.weixinConfig.spbill_create_ip,
                out_trade_no:orderId,
                total_fee:totalPrice*100,
                scene_info:JSON.stringify({
                    "store_info" :
                        {
                            "id": bizId,
                            "name": bizName
                        }
                })
            },function(err,result){
                logger.info(result);
                res.send(200,result)
            })
        });
    }catch (error){
        res.send(200,error)
    }
}

function wxPayResource(req,res){
    logger.info('wxPayResource req.body:' + req.body);
    logger.info('wxPayResource req.params:' + req.params);
    res.success = function() {
        res.end(buildXML({
            xml: {
                return_code: 'SUCCESS'
            }
        }));
    };
    res.fail = function() {
        res.end(buildXML({
            xml: {
                return_code: 'FAIL'
            }
        }));
    };

    parseXML(req.body,function(err, result){
        logger.info('result---------------');
        logger.info(result);
        logger.info('result---------------');
        if(result.result_code =='SUCCESS'){
            var bizId = '';
            Seq().seq(function(){
                var that = this;
                var query = " update order_info set pay_state = 1 where id = " + result.out_trade_no;
                db.dbQuery(query,[],function(error,rows){
                    // logger.debug('update order pay_state ');
                    // res.success();
                    that()
                });
            }).seq(function(){
                var that = this;
                var query = " select biz_id from order_info where id = " + result.out_trade_no;
                db.dbQuery(query,[],function(error,rows){
                    bizId = rows[0].biz_id;
                    that()
                });
            }).seq(function(){
                var orderMoneyParams = {};
                orderMoneyParams.bizId = bizId;
                orderMoneyParams.order_id = result.out_trade_no;
                orderMoneyParams.payment_type = 3;
                orderMoneyParams.payment_money = (result.total_fee-0)/100;
                orderDao.addOrderMoney(orderMoneyParams,function(error,rows){
                    logger.debug('update order pay_state ');
                    res.success();
                })
            })

        }
    });
}
function buildXML(json) {
    var builder = new xml2js.Builder();
    return builder.buildObject(json);
};

function parseXML(xml,fn) {
    var parser = new xml2js.Parser({ trim:true, explicitArray:false, explicitRoot:false });
    parser.parseString(xml, fn||function(err, result){});
};
module.exports = {
    getWeiXinAccessToken: getWeiXinAccessToken,
    getWeiXinUser: getWeiXinUser,
    addOperatorUser: addOperatorUser,
    addOperatorHistory:addOperatorHistory,
    addWeixinOperatorUser:addWeixinOperatorUser,
    getWxSDKAccessToken:getWxSDKAccessToken,
    getWxSDKTicket:getWxSDKTicket,
    wxPayResource:wxPayResource,
    getWXPayParams:getWXPayParams
}