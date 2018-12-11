/**
 * Created by ling xue on 2016/3/2.
 */
var userInfoDAO = require('./dao/UserInfoDAO.js');
var sysMsg = require('./util/SystemMsg.js');
var sysError = require('./util/SystemError.js');
var serverLogger = require('./util/ServerLogger.js');
var listOfvalue = require('./util/ListOfValue.js');
var logger = serverLogger.createLogger('UserInfo.js');
var Seq = require('seq');

function addUser(req,res,next){
    var params = req.params;
    var userId;
    Seq().seq(function(){
        var that = this;
        userInfoDAO.getUser(params ,function(error,rows){
            if(error){
                logger.error(' addUser ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            }
            if(rows && rows.length>0){
                logger.warn(' addUser ' + sysMsg.CUST_SIGNUP_EMAIL_REGISTERED);
                return next( sysError.InvalidArgumentError("",sysMsg.CUST_SIGNUP_EMAIL_REGISTERED));
            }
            that();
        });

    }).seq(function(){
        var that = this;
        params.password = encrypt.encryptByMd5(params.password);
        params.status = listOfvalue.USER_STATUS_ACTIVE;
        if(params.email){
            //TODO send active email;
            params.status = listOfvalue.NO_USER_STATUS_ACTIVE;
        }
        userInfoDAO.createUser(params,function (error, result) {
            if (error){
                logger.error(' addUser ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            }
            userId = result.insertId;
            that();
        });
    }).seq(function(){
        //TODO create user access token
        res.send(200,{success:true,userId:userId});
        return next();
    });
}


function userLogin(req,res,next){
    var params = req.params;
    userInfoDAO.getUser(params,function(error , rows){
        if (error) {
            logger.error(' userLogin ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else {
            if (rows && rows.length > 0) {
                var userTemp = rows[0];
                var userPassword = encrypt.encryptByMd5(params.password);
                var user = {};
                user.userId = userTemp.id;
                if(params.wechatId){
                    //TODO create user access token access
                    //user.accessToken = '';
                }else{
                    if(userTemp.password == userPassword){

                        if(userTemp.status == listOfvalue.USER_STATUS_NO_ACTIVE){
                            logger.warn(' userLogin ' + sysMsg.CUST_ACTIVE_STATE_ERROR);
                            return next(sysError.InvalidArgumentError("",sysMsg.CUST_ACTIVE_STATE_ERROR));
                        }else{
                            //TODO create user access token access
                            //user.accessToken = '';
                            res.send(200, user);
                            return next();
                        }
                    }else{
                        logger.warn(' userLogin ' + sysMsg.CUST_LOGIN_PSWD_ERROR);
                        return next(sysError.InvalidArgumentError("",sysMsg.CUST_LOGIN_PSWD_ERROR));
                    }
                }
            } else {
                //res.send(400, {outMsg:sysMsg.CUST_LOGIN_USER_UNREGISTERED});
                logger.warn(' userLogin ' + sysMsg.CUST_LOGIN_USER_UNREGISTERED);
                return next(sysError.InvalidArgumentError("",sysMsg.CUST_LOGIN_USER_UNREGISTERED));
            }
        }
    });
}


module.exports = {
    addUser : addUser ,
    userLogin : userLogin
}