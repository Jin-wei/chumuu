/**
 * Created by ling xue on 15-6-3.
 */
var wechatUtil = require("../util/WechatUtil.js");
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('WechatDao.js');
var https = require("https");
var custDao = require("./custdao.js");
var prodDao = require("./ProdDao.js");
var Seq = require('seq');
var appId = wechatUtil.WECHAT_APPID;
var secret = wechatUtil.WECHAT_SECRET;
var db=require('../db');
var wechatToken = {
    info : "",
    expired : ""
};
var wechatTicket = {
    info : "",
    expired : ""
}
function getWechatToken(params,callback){
    if(wechatToken == null || wechatToken.info.length==0 || wechatToken.expired >( new Date()).getTime()){
        var url = "https://api.weixin.qq.com/cgi-bin/token?"
        url = url +"grant_type=client_credential&appid="+appId+"&secret="+secret;
        https.get(url,function(result){
            var data = "";
            result.on('data', function(d) {
                data += d;
            }).on('end',function(){

                    var resObj = eval("(" + data + ")");
                    logger.info("getWechatToken "+ resObj.access_token);
                    wechatToken.info = resObj.access_token;
                    wechatToken.expired = (new Date()).getTime() + wechatUtil.WECHAT_EXPIRED_TIME;
                    createApiTicket({token:resObj.access_token},function(error,ticket){
                        if(error){
                            logger.error("getWechatToken create ticket "+ error.message);
                        }else{
                            logger.info("getWechatToken create ticket  "+ ticket);
                        }
                    });
                    callback(null,resObj.access_token);
                });

        }).on('error', function(e) {
                logger.error("getWechatToken "+ e.message);
                callback(e,null);
            })
    }else{
        logger.info("getWechatToken "+ wechatToken.info);
        callback(null,wechatToken.info);
    }

}

function createApiTicket(params,callback){
    var url = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?type=jsapi&access_token="
    url = url +params.token;

    https.get(url,function(result){
        var data = "";
        result.on('data', function(d) {
            data += d;
        }).on('end',function(){
                var resObj = eval("(" + data + ")");
                logger.info('createApiTicke '+resObj);
                wechatTicket.info = resObj.ticket;
                wechatTicket.expired = (new Date()).getTime() + wechatUtil.WECHAT_EXPIRED_TIME;
                callback(null,resObj.ticket);
            }).on('error', function(e) {
                logger.info('createApiTicke '+ e.message);
                callback(e,null);
            });

    }).on('error', function(e) {
            logger.info('createApiTicke '+ e.message);
            callback(e,null);
        });
}

function getApiTicket(params,callback){
    if(wechatTicket == null || wechatTicket.info.length==0 || wechatTicket.expired >( new Date()).getTime()){
        getWechatToken(params,function(err,token){
            if(err){
                logger.error("getApiTicket "+ err.message);
            }else{
                var url = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?type=jsapi&access_token="
                url = url +token;

                https.get(url,function(result){
                    var data = "";
                    result.on('data', function(d) {
                        data += d;
                    }).on('end',function(){
                            var resObj = eval("(" + data + ")");
                            logger.info('getApiTicket '+resObj);
                            wechatTicket.info = resObj.ticket;
                            wechatTicket.expired = (new Date()).getTime() + wechatUtil.WECHAT_EXPIRED_TIME;
                            callback(null,resObj.ticket);
                        }).on('error', function(e) {
                            logger.info('getApiTicket '+ e.message);
                            callback(e,null);
                        });

                }).on('error', function(e) {
                    logger.info('getApiTicket '+ e.message);
                    callback(e,null);
                });
            }
        })
    }else{
        logger.info("getWechatToken "+ wechatTicket.info);
        callback(null,wechatTicket.info);
    }
}

function getUserIdByCode(params,callback){
    var url = "https://api.weixin.qq.com/sns/oauth2/access_token?grant_type=authorization_code";
    url = url + "&appid="+wechatUtil.WECHAT_APPID ;
    url = url + "&secret=" + wechatUtil.WECHAT_SECRET ;
    url = url + "&code=" + params.code
    https.get(url,function(result){
        var data = "";
        result.on('data', function(d) {
            data += d;
        }).on('end',function(){
                var resObj = eval("(" + data + ")");
                logger.info("getUserIdByCode "+resObj);
                callback(null,resObj);
            });

    }).on('error', function(e) {
            logger.error("getUserIdByCode "+ e.message);
            callback(e,null)
        });
}

function getUserInfo(params,callback){
    getWechatToken(params,function(err,token){
        if(err){
            logger.error("getUserInfo "+ err.message);
        }else{
            var url = "https://api.weixin.qq.com/cgi-bin/user/info?access_token="
            url = url +token+"&openid="+params.openId;
            https.get(url,function(result){
                var data = "";
                result.on('data', function(d) {
                    data += d;
                }).on('end',function(){
                        var resObj = eval("(" + data + ")");
                        logger.info("getUserInfo "+resObj);
                        callback(null,resObj);
                    });

            }).on('error', function(e) {
                    logger.error("getUserInfo "+ e.message);
                    callback(e,null)
                });
        }

    })
}

function getUserList(params,callback){
    getWechatToken(params,function(err,token){
        if(err){
            logger.error("getUserList "+ err.message);
        }else{
            var url = "https://api.weixin.qq.com/cgi-bin/user/get?access_token="
            url = url +token;
            https.get(url,function(result){
                var data = "";
                result.on('data', function(d) {
                    data += d;
                }).on('end',function(){
                        var resObj = eval("(" + data + ")");
                        logger.info("getUserList "+resObj);
                        callback(null,resObj);

                    });

            }).on('error', function(e) {
                    logger.error("getUserList "+ e.message);
                    callback(null,e);
                })
        }

    })
}


function sendMsg(params,callback){
    getWechatToken(params,function(err,token){
        if(err){
            console.log(err);
        }else{
            //var url = "https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token="
            var url = "/cgi-bin/message/custom/send?access_token="

            url = url +token;

            console.log(token);
            console.log(params);
            var msg ={
                "touser":params.openId,
                "msgtype":params.msg.type
            };
            if(params.msg.type == wechatUtil.WECHAT_MSG_TYPE_TEXT){
                msg.text = {
                    "content" : params.msg.text
                }
            }else if(params.msg.type == wechatUtil.WECHAT_MSG_TYPE_NEWS){
                var articles = [];
                var contentArray = params.msg.articles;
                for(var i=0;i<contentArray.length;i++){
                    var obj = {
                        title:contentArray[i].title ,
                        description: contentArray[i].content,
                        url: contentArray[i].url,
                        picurl: contentArray[i].picUrl,
                        encoding : "utf-8"
                    }
                    articles.push(obj);
                }
                msg.news = {
                    articles : articles
                }
            }else{
                //Other type no support temp
            }

            console.log(msg);
            var postData = JSON.stringify(msg);
            var options = {
                host: 'api.weixin.qq.com',
                port: 443,
                path: url,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf8',
                    'Content-Length' : Buffer.byteLength(postData, 'utf8')
                }
            }
            console.log(postData);
            var httpsReq = https.request(options,function(result){
                var data = "";
                result.setEncoding('utf8');
                result.on('data', function(d) {
                    data += d;
                }).on('end',function(){
                        var resObj = eval("(" + data + ")");
                        logger.info("sendMsg "+resObj);
                        callback(null,resObj);
                    }).on('error', function(e) {
                        logger.error("sendMsg "+ e.message);
                        callback(e,null);
                    });

            });

            httpsReq.write(postData+"\n",'utf-8');
            httpsReq.end();
            httpsReq.on('error', function(e) {
                callback(e,null)
            });
        }

    })
}

function sendProdMsg(params,callback){

    getWechatToken(params,function(err,token){
        if(err){
            console.log(err);
        }else{

            var url = "/cgi-bin/message/custom/send?access_token="
            url = url +token;
            var msg ={
                "touser":params.openId,
                "msgtype":"news"
            };
            var articles = [];
            Seq().seq(function(){
                var  that = this;
                prodDao.searchBizProdBase(params,function(error,rows){
                    if(error){
                        logger.error("sendProdMsg " + error.message)
                    }else{
                        if(rows && rows.length>0){
                            for(var i=0;i<rows.length;i++){
                                var obj = {
                                    title:rows[i].name ,
                                    description: rows[i].description,
                                    url: 'http://m.yipincaidan.com/restaurant/'+rows[i].biz_id+"/menu-item/"+rows[i].prod_id,
                                    picurl: 'http://m.yipincaidan.com/api/image/'+rows[i].img_url+'/l',
                                    encoding : "utf-8"
                                }
                                articles.push(obj);
                            }
                        }
                    }
                    that()
                });
            }).seq(function(){
                    msg.news = {
                        articles : articles
                    }
                    var postData = JSON.stringify(msg);
                    var options = {
                        host: 'api.weixin.qq.com',
                        port: 443,
                        path: url,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json; charset=utf8',
                            'Content-Length' : Buffer.byteLength(postData, 'utf8')
                        }
                    }
                    console.log(postData);
                    var httpsReq = https.request(options,function(result){
                        var data = "";
                        result.setEncoding('utf8');
                        result.on('data', function(d) {
                            data += d;
                        }).on('end',function(){
                                var resObj = eval("(" + data + ")");
                                logger.info("sendMsg "+resObj);
                                callback(null,resObj);
                            }).on('error', function(e) {
                                logger.error("sendMsg "+ e.message);
                                callback(e,null);
                            });

                    });

                    httpsReq.write(postData+"\n",'utf-8');
                    httpsReq.end();
                    httpsReq.on('error', function(e) {
                        callback(e,null)
                    });
                })
        }

    })
}

function wechatSubscribe(params,res,next){
    var paramObj = {
        openId : params.xml.FromUserName,
        msg : wechatUtil.WECHAT_INFO_WELCOME_CONST
    }
    sendMsg(paramObj,function(err,result){
        if(err){
            logger.error("send user welcome msg "+ err.message);
        }else{
            logger.info("send user welcome msg "+ result);
        }
    });
    custDao.saveWechatUser(paramObj,function(err,result){
        if(err){
            logger.error("save wechat user error "+ err.message);
        }else{
            if(result && result.affectedRows>0){
                logger.warn("save wechat user  failed "+ result.insertId);
            }else{
                logger.info("save wechat user  success "+ result.insertId);
            }
        }
        res.send(200,{success:true});
        next();
    })
}

function wechatUnsubscribe(params,res,next){
    var paramObj = {
        openId : params.xml.FromUserName,
        wechatStatus : wechatUtil.WECHAT_USER_STATUS_NO_ACTIVE
    }
    custDao.updateWechatUserStatus(paramObj,function(error,result){
        if(error){
            logger.error("wechat user unsubscribe error "+ error.message);
        }else{
            if(result && result.affectedRows>0){
                logger.warn("wechat user unsubscribe  failed ");
            }else{
                logger.info("wechat user unsubscribe success ");
            }
        }
        res.send(200,{success:true});
        next();
    })
}


function searchDBOperator(params,callback){
    var query = " select * from operator_user where openid = ? ";
    var paramArray=[],i=0;
    paramArray[i++]=params.openid;

    db.dbQuery(query,paramArray,function(error,rows){
        logger.debug('queryOperation');
        return callback(error,rows);
    });
}

function addDBOperatorUser(params,callback){
    var query = " insert into operator_user " +
        "(openid,nickname,sex,province,city,country,headimgurl,privilege,unionid,type,ip,user_agent) " +
        "values (?,?,?,?,?,?,?,?,?,?,?,?) ";
    var paramArray = [], i = 0;
    paramArray[i++]=params.openid;
    paramArray[i++]=params.nickname;
    paramArray[i++]=params.sex;
    paramArray[i++]=params.province;
    paramArray[i++]=params.city;
    paramArray[i++]=params.country;
    paramArray[i++]=params.headimgurl;
    paramArray[i++]=params.unionid;
    paramArray[i++]=params.privilege;
    paramArray[i++]=params.type;
    paramArray[i++]=params.ip;
    paramArray[i++]=params.user_agent;

    db.dbQuery(query,paramArray,function(error,rows){
        logger.debug('addDBOperator');
        return callback(error,rows);
    });
}

function updateDBOperatorUser(params,callback){
    var query='update operator_user set nickname=? , sex=? , province=? ,city=? ,' +
        ' country=? , headimgurl=? , unionid=? , privilege=? , type=? , ip=? , user_agent=? where openid = ? ';

    var paramArray = [], i = 0;
    paramArray[i++]=params.nickname;
    paramArray[i++]=params.sex;
    paramArray[i++]=params.province;
    paramArray[i++]=params.city;
    paramArray[i++]=params.country;
    paramArray[i++]=params.headimgurl;
    paramArray[i++]=params.unionid;
    paramArray[i++]=params.privilege;
    paramArray[i++]=params.type;
    paramArray[i++]=params.ip;
    paramArray[i++]=params.user_agent;
    paramArray[i++]=params.openid;

    db.dbQuery(query,paramArray,function(error,rows){
        logger.debug('updateDBOperatorUser');
        return callback(error,rows);
    });
}

function addDBOperatorHistory(params,callback){
    var query = " insert into operator_history (operator_id,operation,customer_id) values (?,?,?) ";
    var paramArray=[],i=0;
    paramArray[i++]=params.operator_id;
    paramArray[i++]=params.operation;
    paramArray[i++]=params.customer_id;

    db.dbQuery(query,paramArray,function(error,rows){
        logger.debug('addDBOperatorHistory');
        return callback(error,rows);
    });
}





module.exports = {
    getWechatToken : getWechatToken,
    getUserInfo : getUserInfo,
    getUserList: getUserList,
    sendMsg : sendMsg,
    sendProdMsg : sendProdMsg,
    wechatSubscribe :wechatSubscribe ,
    wechatUnsubscribe: wechatUnsubscribe,
    getApiTicket : getApiTicket,
    getUserIdByCode : getUserIdByCode,
    searchDBOperator:searchDBOperator,
    addDBOperatorUser:addDBOperatorUser,
    addDBOperatorHistory:addDBOperatorHistory,
    updateDBOperatorUser:updateDBOperatorUser
}