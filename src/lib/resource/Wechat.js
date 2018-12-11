/**
 * Created by ling xue  on 15-5-28.
 */
var https = require("https");
var http = require("http");
var crypto = require("crypto");
var wechatDao = require("../dao/WechatDao.js");
var custGiftDao = require("../dao/CustGiftDao.js");
var wechatUtil = require("../util/WechatUtil.js");
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('Wechat.js');
var custDao = require('../dao/custdao.js');
var sysError = require('../util/SystemError.js');
var encrypt = require('../util/Encrypt.js');
var fs = require('fs');
var sysMsg = require('../util/SystemMsg.js');
var sysError = require('../util/SystemError.js');

var appId = wechatUtil.WECHAT_APPID;
var secret = wechatUtil.WECHAT_SECRET;
var wechatToken = {
    info : "",
    expired : ""
};
var wechatTicket = {
    info : "",
    expired : ""
}
var Seq = require("seq");
//var parser = require('xml2json');

function wechatMain(req,res,next){


    var reqJson = {};
    if(req.body){
        reqJson = JSON.parse(parser.toJson(req.body));
    }
    console.log(reqJson.xml.MsgType +"-->"+reqJson.xml.Event);

    if(reqJson.xml){
        console.log(reqJson.xml)
        if(reqJson.xml.MsgType ==wechatUtil.WECHAT_POST_MSG_TYPE){
            console.log('get post event')
            if(reqJson.xml.Event == wechatUtil.WECHAT_EVENT_UNSUB_TYPE){
                //user unsubscribe
                wechatDao.wechatUnsubscribe(reqJson,res,next);
            }else if(reqJson.xml.Event == wechatUtil.WECHAT_EVENT_SUB_TYPE){
                //user sbuscribe
                wechatDao.wechatSubscribe(reqJson,res,next);
            }
            //var queryString = "sn="+req.params.signature+"&ts="+req.params.timestamp+"&nc="+req.params.nonce;
            //res.end("<html><body>test</body></html>");

        }else if(reqJson.xml.MsgType == wechatUtil.WECHAT_MSG_TYPE_TEXT ||
            reqJson.xml.MsgType == wechatUtil.WECHAT_MSG_TYPE_VOICE || reqJson.xml.MsgType == wechatUtil.WECHAT_MSG_TYPE_IMAGE){
            console.log("receive log");
            wechatDao.sendProdMsg({openId : reqJson.xml.FromUserName,bizId:2},function(err,result){
                console.log(JSON.stringify(err||result))

            })
        }else{
            /*wechatDao.sendProdMsg({openId : reqJson.xml.FromUserName},function(err,result){
                res.setHeader('Content-Type', 'text/html');
                res.writeHead(200);
                res.end({success:true});
                return next();
            })*/
            res.send(200)
            return next();
        }
    }else{
        res.setHeader('Content-Type', 'text/html');
        res.writeHead(200);
        res.end(req.params.echostr);
        return next();
    }
}


function createWechatMenu(req,res,next){
    wechatDao.getWechatToken(req.params,function(err,token){
        if(err){
            logger.error("createWechatMenu "+ err.message);
        }else{
            var url = "/cgi-bin/menu/create?access_token="
            url = url +token;
            var menu = wechatUtil.WECHAT_MENU;
            var postData = JSON.stringify(menu);
            var options = {
                host: 'api.weixin.qq.com',
                port: 443,
                path: url,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length' : Buffer.byteLength(postData, 'utf8')
                }
            }
            var httpsReq = https.request(options,function(result){
                var data = "";
                result.on('data', function(d) {
                    data += d;
                }).on('end',function(){
                        var resObj = eval("(" + data + ")");
                        logger.info('createWechatMenu '+resObj);
                        res.send(200,resObj);
                        return next();
                    }).on('error', function(e) {
                        logger.info('createWechatMenu '+ e.message);
                        res.send(500,e);
                        return next();
                    });

            });
            httpsReq.write(postData,"utf-8");
            httpsReq.end();
            httpsReq.on('error', function(e) {
                logger.info('createWechatMenu '+ e.message);
                res.send(500,e);
                return next();
            });
        }

    })
}

function sendTestMsg(req,res,next){
    var params = req.params;
    var paramObj = {
        openId : params.openId,
        msg : wechatUtil.WECHAT_INFO_WELCOME_CONST
    }
    //console.log(paramObj);
    //console.log(wechatDao);
    /*wechatDao.getUserInfo(paramObj,function(err,result){
        console.log(err);
        console.log(result);
    })*/
    wechatDao.sendMsg(paramObj,function(err,result){
        if(err){
            logger.error("send user welcome msg "+ err.message);
        }else{
            logger.info("send user welcome msg "+ result);
        }
        res.send(200,{success:true});
        return next();
    });
}

function getApiTicket(req,res,next){
    wechatDao.getApiTicket(req.params,function(err,ticket){
        if(err){
            logger.error("getApiTicket "+ err.message);
        }else{
            //ticket = "sM4AOVdWfPE4DxkXGEs8VC3z89AWA7INFGIbOLm3my0XFMp1CHf7I9Xjj0F4t1L6L9SiWsYnaT_8qTFzT3NAig";
            console.log(req.params.url);
            req.params.url = decodeURIComponent(req.params.url);
            //req.params.url = "http://m.yipincaidan.com/coffee/coffee_order.html";
            var timestamp = parseInt((new Date()).getTime()/1000);
            var noncestr = wechatUtil.WECHAT_NONCESTR;
            var sha1 = crypto.createHash('sha1');

            var shaStr = "jsapi_ticket="+ticket;
            shaStr = shaStr + "&noncestr=" + noncestr;
            shaStr = shaStr + "&timestamp=" + timestamp;
            shaStr = shaStr + "&url=" + req.params.url;
            console.log(shaStr);
            sha1.update(shaStr);
            var sign = sha1.digest('hex');
            var result ={
                timestamp: timestamp,
                nonceStr: noncestr,
                signature: sign
            }
            res.send(200,result);
            return next();
        }

    })
}

function getUserInfo(req,res,next){
    wechatDao.getUserInfo(req.params,function(err,result){
        if(err){
            logger.error("getUserInfo"+ err.message);
            throw sysError.InternalError(err.message,err.message);
            return ;
        }else{
            logger.info("getUserInfo :success");
            res.send(200,result);
            return next();
        }
    })
}

function getUserInfoByCode(req,res,next){
    wechatDao.getUserIdByCode(req.params,function(error,result){
        if(error){
            logger.error("getUserInfoByCode "+ error.message);
            throw sysError.InternalError(error.message,error.message);
            return ;
        }else{
            console.log(result);
            logger.info("getUserInfoByCode "+result.openid);
            wechatDao.getUserInfo({openId : result.openid},function(err,result){
                if(err){
                    logger.error("getUserInfoByCode User Info"+ err.message);
                    throw sysError.InternalError(err.message,err.message);
                    return ;
                }else{
                    res.send(200,result);
                    return next();
                }
            })

        }
    })

}

function wechatPayment(req,res,next){
    var params = req.params;
    params.totalPrice = params.totalPrice*100;
    params.orderId = parseInt((new Date()).getTime()/1000)+params.orderId+"";
    var signStr = "appid="+wechatUtil.WECHAT_APPID+"&attach=test&body=test&mch_id="+wechatUtil.WECHAT_MCH_ID
    + "&nonce_str="+wechatUtil.WECHAT_NONCESTR+"&notify_url="+wechatUtil.WECHAT_PAYMENT_CALLBACK+"&openid="+params.openId
    + "&out_trade_no="+params.orderId+"&spbill_create_ip="+req.connection.remoteAddress+"&total_fee=" +params.totalPrice
    + "&trade_type=JSAPI&key="+wechatUtil.WECHAT_PAYMENT_KEY;
    /*var paramsObj = {
        xml:{
            appid:{appid:wechatUtil.WECHAT_APPID},
            attach:params.attach,
            body:params.body,
            mch_id :wechatUtil.WECHAT_MCH_ID,
            nonce_str: wechatUtil.WECHAT_NONCESTR,
            notify_url:wechatUtil.WECHAT_PAYMENT_CALLBACK,
            openid:params.openId,
            out_trade_no:params.orderId,
            spbill_create_ip:req.connection.remoteAddress,
            total_fee:params.totalPrice,
            trade_type:'JSAPI',
            sign:encrypt.encryptByMd5(signStr)
        }

    }*/
    console.log(signStr);
    var signByMd = encrypt.encryptByMd5NoKey(signStr);
    var reqBody = '<xml><appid>'+wechatUtil.WECHAT_APPID+'</appid><attach>'+'test'+'</attach><body>test</body>'
        +'<mch_id>'+wechatUtil.WECHAT_MCH_ID+'</mch_id><nonce_str>'+wechatUtil.WECHAT_NONCESTR+'</nonce_str>' +
        '<notify_url>'+wechatUtil.WECHAT_PAYMENT_CALLBACK+'</notify_url><openid>'+params.openId+'</openid>' +
        '<out_trade_no>'+params.orderId+'</out_trade_no><spbill_create_ip>'+req.connection.remoteAddress+'</spbill_create_ip><total_fee>'+params.totalPrice+'</total_fee>' +
        '<trade_type>JSAPI</trade_type><sign>'+signByMd+'</sign></xml>';

    console.log(parser.toJson(reqBody));
    console.log(reqBody);
    var url="/pay/unifiedorder";
    var options = {
        host: 'api.mch.weixin.qq.com',
        port: 443,
        path: url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length' : Buffer.byteLength(reqBody, 'utf8')
        }
    }
    var httpsReq = https.request(options,function(result){
        var data = "";
        result.on('data', function(d) {
            data += d;
        }).on('end',function(){
                var resObj = JSON.parse(parser.toJson(data));
                console.log(resObj);
                console.log(data);
                var resParams = {};
                resParams.prepayId = resObj.xml.prepay_id;
                resParams.nonceStr = wechatUtil.WECHAT_NONCESTR;
                resParams.appId = wechatUtil.WECHAT_APPID;
                var resTimestamp = (new Date()).getTime();
                resParams.timeStamp = parseInt(resTimestamp/1000);
                var paySignStr = "appId="+wechatUtil.WECHAT_APPID+"&nonceStr="+wechatUtil.WECHAT_NONCESTR+"&package=prepay_id="+resParams.prepayId+
                    "&signType=MD5&timeStamp="+resParams.timeStamp+"&key="+wechatUtil.WECHAT_SECRET;
                console.log(paySignStr);
                resParams.sign = encrypt.encryptByMd5NoKey(paySignStr);
                logger.info('wechatPayment '+resParams);

                res.send(200,resParams);
                return next();
            }).on('error', function(e) {
                logger.info('wechatPayment '+ e.message);
                res.send(500,e);
                return next();
            });

    });
    httpsReq.write(reqBody,"utf-8");
    httpsReq.end();
    httpsReq.on('error', function(e) {
        logger.info('wechatPayment '+ e.message);
        res.send(500,e);
        return next();
    });


}

function wechatPaymentCallback(req,res,next){
    console.log(req.body);
    console.log(req.params);
    res.send(200);
    return next();
}

function receiveGift(req,res,next){
    var params = req.params;
    var giftCode = params.giftCode;
    var giftCodeArray = encrypt.resolveGiftCode(giftCode);
    var code = params.code;
    console.log(code);
    console.log(giftCodeArray);
    var openId = "";
    if(code ){
        if( giftCodeArray && giftCodeArray.length ==2){
            Seq().seq(function(){
                var that = this
                wechatDao.getUserIdByCode(params,function(error,result){
                    if(error){
                        logger.error(' receiveGift ' + error.message);
                        throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                    }else{
                        if(result){
                            openId = result.openid;
                            that();
                        }else{
                            logger.error(' receiveGift can not get open id' );
                            throw sysError.InternalError('can not get user info',sysMsg.SYS_INTERNAL_ERROR_MSG);
                        }
                    }
                })
            }).seq(function(){

                    var giftObj = {
                        giftId : giftCodeArray[1],
                        custId : giftCodeArray[0],
                        openId : openId
                    }
                    custGiftDao.updateGiftReceiver(giftObj,function(error,result){
                        if(error){
                            logger.error(' receiveGift ' + error.message);
                            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                        }else{
                            if(result && result.affectedRows > 0){
                                res.send(200 ,{success:true});
                                return next();
                            }else{
                                logger.error(' eGift has been received' );
                                res.send(200 ,{success:false});
                                return next();
                            }
                        }
                    })
                })
        }else{
            res.send(200 ,{success:false,msg:'gift code is error'});
            return next();
        }

    }else{
        //code is null;
        res.send(200 ,{success:false,msg:'user do not subscribe the service'});
        return next();
    }

}

function getUserInfoById(req,res,next){
    var params = req.params;
    var openId = "";
    Seq().seq(function(){
        var that = this;
        custDao.getCustomerBaseInfo({customerId:params.custId},function(error,rows){
            if(error){
                logger.error(' getUserInfoById ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            }else{
                if(rows && rows.length>0 && rows[0].wechat_id){
                    openId = rows[0].wechat_id;
                    logger.info(' getUserInfoById '+ openId);
                    that();
                }
            }

        })
    }).seq(function(){
            wechatDao.getUserInfo({openId:openId},function(err,result){
                if(err){
                    logger.error("getUserInfoById"+ err.message);
                    throw sysError.InternalError(err.message,err.message);
                    return ;
                }else{
                    logger.info("getUserInfoById :success");
                    res.send(200,result);
                    return next();
                }
            })
        })

}

module.exports = {
    wechatMain : wechatMain,
    createWechatMenu : createWechatMenu ,
    sendTestMsg : sendTestMsg,
    getApiTicket: getApiTicket,
    getUserInfoByCode : getUserInfoByCode,
    getUserInfoById : getUserInfoById,
    getUserInfo : getUserInfo,
    wechatPayment : wechatPayment,
    wechatPaymentCallback :wechatPaymentCallback,
    receiveGift: receiveGift
}