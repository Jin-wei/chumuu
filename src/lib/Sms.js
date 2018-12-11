/**
 * Created by Josh on 16-3-10.
 */
var custUserDao = require('./dao/custdao.js');
var smsDao = require('./dao/SmsDao.js');
var Seq = require('seq');
var queueCon = require('./dao/connection/QueueCon.js');
var encrypt = require('./util/Encrypt.js');
var sysMsg = require('./util/SystemMsg.js');
var sysError = require('./util/SystemError.js');
var listOfValue = require('./util/ListOfValue.js');
var messageType = require('./util/MessageType.js');
var serverLogger = require('./util/ServerLogger.js');
var logger = serverLogger.createLogger('Sms.js');
//var smsUtil = require('./util/SMSUtil.js');

/**
 * send random key sms to new user phone,before check user phone .
 * @param req
 * @param res
 * @param next
 */
function sendSignInSms(req,res,next){
    var params = req.params;
    params.smsType = listOfValue.SMS_REG_TYPE;
    var captchaKey = "";
    var insertFlag = true;
    Seq().seq(function(){
        var that = this;
        custUserDao.queryCustUser(params,function(error,rows){
            if (error) {
                logger.error(' sendSignInSms ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else {
                if(rows && rows.length>0){
                    logger.warn(' sendSignInSms ' +params.phone+ sysMsg.CUST_SIGNUP_PHONE_REGISTERED);
                    res.send(200,{success:false,errMsg:sysMsg.CUST_SIGNUP_PHONE_REGISTERED});
                    return next();
                }else{
                    that();
                }
            }
        })
    }).seq(function(){
        captchaKey = encrypt.getSmsRandomKey();
        var that = this;
        smsDao.querySms(params,function(error,rows){
            if (error) {
                logger.error(' sendSignInSms ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else {
                if(rows && rows.length>0){
                    insertFlag = false;
                }else{
                    insertFlag = true;
                }
                that();
            }
        })
    }).seq(function(){
        var that = this;
        params.code = captchaKey;
        var msgJson = {
            type : messageType.MESSAGE_TYPE_SMS ,
            subType : messageType.MESSAGE_SUB_TYPE_SIGNIN,
            phone : params.phone,
            code : captchaKey
        }
        queueCon.sendTopicMsg(msgJson,function(error,result){
            if (error) {
                logger.error(' sendSignInSms ' + "Rabbit connect error");
                throw sysError.InternalError("Rabbit connect error",sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else {
                that();
            }
        })
    }).seq(function(){

        if(insertFlag){
            //Add new phone and captcha
            smsDao.addSms(params,function(error,result){
                if (error) {
                    logger.error(' sendSignInSms ' + error.message);
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    if(result && result.affectedRows >0){
                        logger.info(' sendSignInSms ' + 'success');
                        res.send(200,  {success:true});

                    }else{
                        logger.warn(' sendSignInSms ' + 'success');
                        res.send(200,  {success:false});
                    }
                    next();
                }
            });
        }else{
            //Update phone and captcha
            smsDao.updateSms(params,function(error,result){
                if (error) {
                    logger.error(' sendSignInSms ' + error.message);
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    if(result && result.affectedRows >0){
                        logger.info(' sendSignInSms ' + 'success');
                        res.send(200,  {success:true});
                    }else{
                        logger.warn(' sendSignInSms ' + 'false');
                        res.send(200,  {success:false});
                    }
                    next();
                }
            })
        }
    })
}

/**
 * send captcha sms to user phone ,before check user phone.
 * @param req
 * @param res
 * @param next
 */
function sendPasswordSms(req,res,next){
    var params = req.params;
    params.smsType = listOfValue.SMS_PSWD_TYPE;
    var captchaKey = "";
    var insertFlag = true;
    Seq().seq(function(){
        var that = this;
        custUserDao.queryCustUser(params,function(error,rows){
            if (error) {
                logger.error(' sendPasswordSms ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else {
                if(rows && rows.length<1){
                    logger.warn(' sendPasswordSms ' +params.phone+ sysMsg.CUST_LOGIN_USER_PHONE_UNREGISTERED);
                    res.send(200,{success:false,errMsg:sysMsg.CUST_LOGIN_USER_PHONE_UNREGISTERED});
                    return next();
                }else{
                    that();
                }
            }
        })
    }).seq(function(){
        captchaKey = encrypt.getSmsRandomKey();
        var that = this;
        smsDao.querySms(params,function(error,rows){
            if (error) {
                logger.error(' sendPasswordSms ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else {
                if(rows && rows.length>0){
                    insertFlag = false;
                }else{
                    insertFlag = true;
                }
                that();
            }
        })
    }).seq(function(){
        var that = this;
        params.code = captchaKey;
        var msgJson = {
            type : messageType.MESSAGE_TYPE_SMS ,
            subType : messageType.MESSAGE_SUB_TYPE_PASSWORD,
            phone : params.phone,
            code : captchaKey
        }
        queueCon.sendTopicMsg(msgJson,function(error,result){
            if (error) {
                logger.error(' sendPasswordSms ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else {
                that();
            }
        })

    }).seq(function(){

        if(insertFlag){
            //Add new phone and captcha
            smsDao.addSms(params,function(error,result){
                if (error) {
                    logger.error(' sendPasswordSms ' + error.message);
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    if(result && result.affectedRows >0){
                        logger.info(' sendPasswordSms ' + 'success');
                        res.send(200,  {success:true});

                    }else{
                        logger.warn(' sendPasswordSms ' + 'success');
                        res.send(200,  {success:false});
                    }
                    next();
                }
            });
        }else{
            //Update phone and captcha
            smsDao.updateSms(params,function(error,result){
                if (error) {
                    logger.error(' sendPasswordSms ' + error.message);
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    if(result && result.affectedRows >0){
                        logger.info(' sendPasswordSms ' + 'success');
                        res.send(200,  {success:true});
                    }else{
                        logger.warn(' sendPasswordSms ' + 'false');
                        res.send(200,  {success:false});
                    }
                    next();
                }
            })
        }
    })

}

module.exports = {
    sendSignInSms : sendSignInSms ,
    sendPasswordSms : sendPasswordSms
};