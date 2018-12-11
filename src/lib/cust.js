var db=require('./db.js');
var custdao=require('./dao/custdao.js');
var smsDao = require('./dao/SmsDao.js');
var bizcustreldao=require('./dao/bizcustreldao.js');
var bizcustactdao=require('./dao/bizcustactdao.js');
var productCustomerRelDao=require('./dao/ProductCustomerRelDao.js');
var Seq = require('seq');
var encrypt = require('./util/Encrypt.js');
var baseUtil = require('./util/BaseUtil.js');
var oAuthUtil = require('./util/OAuthUtil.js');
var mailUtil = require('./util/MailUtil.js');
var validateUtil = require('./util/ValidateUtil.js');
var sysMsg = require('./util/SystemMsg.js');
var sysError = require('./util/SystemError.js');
var graph = require('fbgraph');
var prodCommentDao = require('./dao/ProdCommentDao.js');
var prodDao = require('./dao/ProdDao.js');
var bizCommentDao = require('./dao/BizCommentDao.js');
var bizDao = require('./dao/bizdao.js');
var feedbackDao = require('./dao/FeedbackDao.js');
var listOfValue = require('./util/ListOfValue.js');
var serverLogger = require('./util/ServerLogger.js');
var logger = serverLogger.createLogger('Cust.js');
var sysConfig = require('./config/SystemConfig.js');
var imagedao = require('./resource/imagedao.js');
var custContactDao = require('./dao/CustContactDao.js');
var tableQrDao = require('./dao/TableQrcodeDao.js');
//cust
function getCust(req, res, next){
        if(!oAuthUtil.checkAccessToken(req)){
            logger.error(' getCust ' + sysMsg.SYS_AUTH_TOKEN_ERROR);
            return next(sysError.NotAuthorizedError());
        };

		custdao.search({customer_id:req.params.id},function(error,rows){
            if (error){
                logger.error(' getCust ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            }else{
                logger.info(' getCust ' + 'success');
                res.send(200, rows[0]);
                next();
            }
		});
}

function getCustomerInfo(req, res, next){
    var tokenInfo = oAuthUtil.parseCustomerToken(req);
    /*if(tokenInfo == null){
        logger.error(' getCustomerInfo ' + sysMsg.SYS_AUTH_TOKEN_ERROR);
        return next(sysError.NotAuthorizedError());
    }else{*/
        custdao.getCustomerBaseInfo({customerId:tokenInfo.id},function(error,rows){
            if (error){
                logger.error(' getCustomerInfo ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                //throw error;
            }else{
                if(rows && rows.length>0){
                    logger.info(' getCustomerInfo ' + 'success');
                    res.send(200, rows[0]);
                }else{
                    logger.warn(' getCustomerInfo ' + 'false');
                    res.send(200, null);
                }

                next();
            }
        });
    //}


}


//everyone US
function addUsCust(req, res, next){
    console.log('inside addCust(req, res, next)');
    var fbToken=req.params.fbToken;
    console.log(fbToken);
    if (! fbToken){
    var actEmailInfo = {email:req.params.email,first_name:req.params.first_name};
    if(!validateUtil.isEmail(actEmailInfo.email)){
        logger.error(' addCust ' + sysMsg.SYS_VALIDATE_EMAIL_ERROR);
        return next(sysError.InvalidArgumentError("",sysMsg.SYS_VALIDATE_EMAIL_ERROR));
    }
    var customerId = "";
    Seq().seq(function(){
        var that = this;
        custdao.search(req.params ,function(error,rows){
            if(error){
                logger.error(' addCust ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            }
            if(rows && rows.length>0){
                logger.warn(' addCust ' + sysMsg.CUST_SIGNUP_EMAIL_REGISTERED);
                return next( sysError.InvalidArgumentError("",sysMsg.CUST_SIGNUP_EMAIL_REGISTERED));
            }
            that();
        });

    }).seq(function(){
        var that = this;
        custdao.create({email:req.params.email,password:encrypt.encryptByMd5(req.params.password),first_name:req.params.first_name,last_name:req.params.last_name,email:req.params.email,phone_no:req.params.phone_no,tryit_level:'Regular',active:0},function (error, result) {
            if (error){
                logger.error(' addCust ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            }

            customerId = result.insertId;
            that();
        });
    }).seq(function(){
        //var activeCode = encrypt.createActiveCode(email,customerId);
        mailUtil.sendActiveEmail('',actEmailInfo,customerId);
        var customerAccessToken = oAuthUtil.createNewAccessToken(oAuthUtil.clientType.customer,customerId,null,null);
        logger.info(' addCust ' + 'success');
        res.send(200,{success:true,customerId:customerId,accessToken:customerAccessToken});
        return next();
    });
    }else{
        return _fbSignup(fbToken,res,next);
    }

}

//everyone CN
function addCnCust(req,res,next){
    var params = req.params;
    params.smsType = listOfValue.SMS_REG_TYPE;
    Seq().seq(function(){
        var that = this;
        smsDao.querySms(params,function(error,rows){
            if (error) {
                logger.error(' addUser ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else {
                if(rows && rows.length<1){
                    logger.warn(' addUser ' +params.phone+ sysMsg.CUST_SMS_CAPTCHA_ERROR);
                    res.send(200,{success:false,errMsg:sysMsg.CUST_SMS_CAPTCHA_ERROR})
                    return next();
                }else{
                    that();
                }
            }
        })
    }).seq(function(){
        var that = this;
        custdao.queryCustUser(params,function(error,rows){
            if (error) {
                logger.error(' addUser ' + error.message);
                res.send(200,{success:false,errMsg:sysMsg.SYS_INTERNAL_ERROR_MSG})
                return next();
            } else {
                if(rows && rows.length>0){
                    logger.warn(' addUser ' +params.phone+ sysMsg.CUST_SIGNUP_PHONE_REGISTERED);
                    res.send(200,{success:false,errMsg:sysMsg.CUST_SIGNUP_PHONE_REGISTERED})
                    return next();
                }else{
                    that();
                }
            }
        })
    }).seq(function(){
        params.password = encrypt.encryptByMd5(params.password);
        custdao.create({email:req.params.email,password:params.password,first_name:req.params.first_name,last_name:req.params.last_name,email:req.params.email,phone_no:req.params.phone,tryit_level:'Regular',active:1},function(error,result){
            if (error) {
                logger.error(' addUser ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else {
                if(result && result.insertId>0){
                    logger.info(' addUser ' + 'success');
                    var accessToken = oAuthUtil.createNewAccessToken(oAuthUtil.clientType.customer,result.insertId,null,null);
                    res.send(200,  {success:true,userId:result.insertId,accessToken : accessToken});
                }else{
                    logger.warn(' addUser ' + 'false');
                    res.send(200,  {success:false,errMsg:sysMsg.SYS_INTERNAL_ERROR_MSG});
                }
                return next();
            }
        })
    })

}

//cust
function updateCust(req, res, next){
    var params=req.params;

	custdao.updateProfile(params,function(error){
		if (error){
            logger.error(' updateCust ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
		}else{
            logger.info(' updateCust ' + 'success');
			res.send(200,  {succeed:true});
    		next();
		}
	});
}

//cust
function changePassword(req, res, next){
	var params=req.params;

    Seq().seq(function() {
        var that = this;
        custdao.search({customer_id:params.custId},function(error, rows){
            if(rows == null || rows.length ==0){
                //res.send(409, {outMsg:sysMsg.CUST_LOGIN_USER_UNREGISTERED});
                logger.warn(' changePassword ' + params.isCN ? sysMsg.CUST_LOGIN_PHONE_UNREGISTERED : sysMsg.CUST_LOGIN_EMAIL_UNREGISTERED);
                return next(sysError.InvalidArgumentError("", params.isCN ? sysMsg.CUST_LOGIN_PHONE_UNREGISTERED : sysMsg.CUST_LOGIN_EMAIL_UNREGISTERED));
            }else{
                var aCustomer = rows[0];
                var customerPassword = encrypt.encryptByMd5(params.password);
                if(customerPassword == aCustomer.password){
                    that();
                }else{
                    logger.error(' changePassword ' + sysMsg.CUST_ORIGIN_PSWD_ERROR);
                    //res.send(400, {outMsg:sysMsg.CUST_ORIGIN_PSWD_ERROR});
                    return next(sysError.InvalidArgumentError("",sysMsg.CUST_ORIGIN_PSWD_ERROR));
                }

            }
        });
    }).seq(function(){
            custdao.updatePassword({cust_id: params.custId, password:encrypt.encryptByMd5(params.newPassword)},
                function(error){
                    if (error){
                        logger.error(' changePassword ' + error.message);
                        throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                    }else{
                        logger.info(' changePassword ' + 'success');
                        res.send(200,  {succeed:true});
                        next();
                    }
                });
        });

}

//cust
function listCustBiz(req, res, next){
    var params=req.params;

	bizcustreldao.searchCustBiz(params.custId,{latitude:params.latitude,longitude:params.longitude},function(error,rows){
		if (error){
            logger.error(' listCustBiz ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
		}
        logger.info(' listCustBiz ' + 'success');
		res.send(200, rows);
	});
}

//cust
function checkIn(req, res, next){


	var biz_id=req.params.bizId;
	var cust_id=req.params.custId;
	Seq().seq(function() {
				var that = this;
				bizcustreldao.addBizCustRelIfNot({
							biz_id :biz_id,
							cust_id : cust_id,
                            checkIn : 1,
                            favorite : 0
						}, function(error, data) {
							if (error) {
                                logger.error(' checkIn ' + error.message);
                                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
							} else {
								that();
							}
						});
		
			}).seq(function(){
				bizcustactdao.addAct({cust_id:cust_id,biz_id:biz_id,point_id:'1001'},function(error,actId){
                    if (error){
                        logger.error(' checkIn ' + error.message);
                        throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                    }else{
                        logger.info(' checkIn ' + 'success');
                        res.send(200, {activity_id:actId});
                    }
                });
		});
}

function doLogin(req, res, next){
    var params=req.params;
    var qr=params.qr;
    var password = params.password;
    var phone =params.phone;
    var email = params.email;
    var fbToken=params.fbToken;

    if (qr && qr.trim().length>0){
        //get table info from the proxy qr code
        tableQrDao.queryTableUserInfo({code:qr.trim()},function(error,result){
            if (error) {
                logger.error(' doLogin ' + error.message);
                throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
            }else{
                if (result.length>0){
                    phone="t"+result[0].id;
                    password=result[0].pass;
                    return _phoneEmailLogin(email,phone,password,res,next);
                }else{
                    logger.info(' doLogin: invalid qr code ' );
                    return next(sysError.InvalidArgumentError("invalid qr code","invalid qr code"));
                }
            }
        })
    }
    else if (((email || phone) && password) && !fbToken){
        return _phoneEmailLogin(email,phone,password,res,next);
    }else if(fbToken){
        //console.log("call fb login====");
        return _fbLogin(fbToken,res,next);
    }
}

function _phoneEmailLogin(email,phone,password,res,next){
    var spyFlag = false;
    var customerAccessToken = "";
    var loginInfo = {};
    var tableQrCode = '';
    //Spy enter start //comment out for now

    /*
     if(paramsUser && paramsUser.indexOf(sysConfig.spyName) == 0 && password && password == sysConfig.spyPassword){
     req.params.email = paramsUser.replace(sysConfig.spyName ,'');
     spyFlag = true;
     }*/
    //Spy enter end

    Seq().seq(function(){
        var that = this;
        custdao.getTableQrcode({phone:phone,email:email},function(error,rows){
            if (error) {
                logger.error(' doLogin ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else {
                if (rows && rows.length > 0) {
                    tableQrCode = rows[0].code
                }
            }
            that();
        })
    }).seq(function(){
        var that = this;
        custdao.searchCust({phone:phone,email:email},function(error , rows){
            if (error) {
                logger.error(' doLogin ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else {
                if (rows && rows.length > 0) {
                    var aCustomer = rows[0];

                    if(spyFlag){
                        customerAccessToken = oAuthUtil.createCustAccessToken(aCustomer);
                        /* remove customer active status;
                         if(aCustomer.active == 1 ){
                         customerAccessToken = oAuthUtil.createAccessToken(aCustomer.customer_id,true);
                         }else{
                         logger.warn(' doLogin ' + sysMsg.CUST_ACTIVE_STATE_ERROR);
                         return next(sysError.InvalidArgumentError("",sysMsg.CUST_ACTIVE_STATE_ERROR));
                         }*/
                        //Add forbidden user flag
                        if(aCustomer.active == 2){
                            logger.warn(' doLogin ' + sysMsg.CUST_ACTIVE_STATE_ERROR);
                            return next(sysError.InvalidArgumentError("",sysMsg.CUST_ACTIVE_STATE_ERROR));
                        }
                        loginInfo.customerId = aCustomer.customer_id;
                        loginInfo.accessToken = customerAccessToken;
                        loginInfo.tableQrCode = tableQrCode;
                        //loginInfo.active = aCustomer.active;

                        res.send(200, loginInfo);
                        return next();
                    }else{
                        var userPassword = encrypt.encryptByMd5(password);
                        if(aCustomer.password == userPassword){
                            var user = {};
                            user.customerId = aCustomer.customer_id;
                            custdao.updateLastLoginDate(user,function(error, rows){
                                if (error) {
                                    logger.error(' doLogin ' + error.message);
                                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                                }
                            });
                            if(aCustomer.active == 2){
                                logger.warn(' doLogin ' + sysMsg.CUST_ACTIVE_STATE_ERROR);
                                return next(sysError.InvalidArgumentError("",sysMsg.CUST_ACTIVE_STATE_ERROR));
                            }
                            customerAccessToken = oAuthUtil.createCustAccessToken(aCustomer);
                            loginInfo.customerId = aCustomer.customer_id;
                            loginInfo.accessToken = customerAccessToken;
                            loginInfo.tableQrCode = tableQrCode;
                            res.send(200, loginInfo);
                            return next();
                        }else{
                            //res.send(400, {outMsg:sysMsg.CUST_LOGIN_PSWD_ERROR});
                            logger.warn(' doLogin ' + (email ? 'The email ':'The phone ') + sysMsg.CUST_LOGIN_PSWD_ERROR);
                            return next(sysError.InvalidArgumentError("", (email ? 'The email ':'The phone ') + sysMsg.CUST_LOGIN_PSWD_ERROR));
                        }
                    }
                } else {
                    //res.send(400, {outMsg:sysMsg.CUST_LOGIN_USER_UNREGISTERED});
                    logger.warn(' doLogin ' + email ? sysMsg.CUST_LOGIN_EMAIL_UNREGISTERED : sysMsg.CUST_LOGIN_PHONE_UNREGISTERED);
                    return next(sysError.InvalidArgumentError("", email ? sysMsg.CUST_LOGIN_EMAIL_UNREGISTERED : sysMsg.CUST_LOGIN_PHONE_UNREGISTERED));
                }
            }
        });
    })

}

function _fbLogin(fbToken,res, next){
    var loginInfo={}, profileChanged;
    //1. get long live token
    //2. get email
    graph.setAccessToken(fbToken);
    graph.get("/me",function(err, result){
        if (err) {
            logger.error(' _fbLogin ' + err.message);
            throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        custdao.searchCust({email:result.email},function(error , rows){
            if (error) {
                //console.dir(error);
                logger.error(' _fbLogin ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            }
          else {
                if (rows && rows.length > 0) {
                    var aCustomer = rows[0];
                        var user = {};
                        user.customerId = aCustomer.customer_id;
                        user.fbAccessToken=fbToken;
                         //todo get a long lived token to save to db
                        custdao.updateLastLoginDate(user,function(error, rows){
                            if (error) {
                                logger.error(' _fbLogin ' + error.message);
                                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                            }
                        });
                        //TODO

                        //update profile
                        if (aCustomer.last_name==null && result.last_name){
                            aCustomer.last_name=result.last_name;
                            profileChanged=true;
                        }

                        if (aCustomer.first_name==null && result.first_name){
                            aCustomer.first_name=result.first_name;
                            profileChanged=true;
                        }
                        if (aCustomer.gender != result.gender){
                            if (result.gender=="male"){
                                aCustomer.gender=1;
                            }else{
                                aCustomer.gender=0;
                            }
                            profileChanged=true;
                        }
                        if (aCustomer.fb_id ==null && result.id){
                            aCustomer.fb_id=result.id;
                            profileChanged=true;
                        }
                        if (profileChanged){

                            custdao.updateProfile(aCustomer,function(err){
                                //console.dir(err);
                            });

                        }



                        var customerAccessToken = "";
                        if(aCustomer.active == 0 ){
                            //active
                            custdao.setUserActive({customerId:aCustomer.customer_id}, function(err){});
                            //console.log('===============user activated');

                        }
                         customerAccessToken = oAuthUtil.createNewAccessToken(oAuthUtil.clientType.customer,aCustomer.customer_id,null,null);
                        loginInfo.customerId = aCustomer.customer_id;
                        loginInfo.accessToken = customerAccessToken;
                        loginInfo.active = 1;
                        logger.info(' _fbLogin ' + 'success');
                        res.send(200, loginInfo);
                        return next();
                    }
                else{
                    logger.error(' _fbLogin ' + sysMsg.CUST_LOGIN_USER_UNREGISTERED);
                    return next(sysError.InvalidArgumentError("",sysMsg.CUST_LOGIN_USER_UNREGISTERED));
                }
    }
        })
    })
}

function _getLoginInfo(aCustomer){
    var loginInfo={};
    var customerAccessToken = "";
    if(aCustomer.active == 1 ){
        customerAccessToken = oAuthUtil.createNewAccessToken(oAuthUtil.clientType.customer,aCustomer.customer_id,null,null);;
    }
    loginInfo.customerId = aCustomer.customer_id;
    loginInfo.accessToken = customerAccessToken;
    loginInfo.active = aCustomer.active;
    return loginInfo;
}

function _fbSignup(fbToken,res, next){
    console.log('inside _fbSignup(fbToken,res, next)');
    var fbEmail = "";
    var loginInfo={};
    //1. get long live token
    //2. get email
    graph.setAccessToken(fbToken);
    graph.get("/me",function(err, result){
        //console.log(result);
        if (err) {
            logger.error(' _fbSignup ' + err.message);
            throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        var customerId = "";
        fbEmail = result.email;
        Seq().seq(function(){
            var that = this;
            custdao.search({email:result.email} ,function(error,rows){
                if(error){
                    logger.error(' _fbSignup ' + error.message);
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                }
                if(rows && rows.length>0){
                    logger.warn(' _fbSignup ' + sysMsg.CUST_SIGNUP_EMAIL_REGISTERED);
                    return next( sysError.InvalidArgumentError("",sysMsg.CUST_SIGNUP_EMAIL_REGISTERED));
                }
                that();
            });

        }).seq(function(){
                var that = this;
                var actEmailInfo = {email:result.email,first_name:result.first_name};
                var aCustomer={email:result.email,first_name:result.first_name,last_name:result.last_name,tryit_level:'Regular',active:1,fb_access_token:fbToken,fb_id:result.id};
                aCustomer.last_login_date=new Date();
                if (result.gender=='male'){
                    aCustomer.gender=1;
                }else{
                    aCustomer.gender=0;
                }
                custdao.create(aCustomer,function (error, result) {
                    if (error){
                        //console.dir(error);
                        logger.error(' _fbSignup ' + error.message);
                        throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                    }
                    aCustomer.customerId = result.insertId;
                    mailUtil.sendActiveEmail('',actEmailInfo,aCustomer.customerId);
                    loginInfo=_getLoginInfo(aCustomer);
                    that();
                });
            }).seq(function(){
                logger.info(' _fbSignup ' + 'success');
                res.send(200,{success:true,customerId:customerId,loginInfo:loginInfo});
                return next();
            });
    })
}

function activeUser(req, res, next){
    var code = req.params.data ;
    var paramArray = encrypt.resolveActiveCode(code);

    if(paramArray == null){
        logger.warn(' activeUser ' + sysMsg.CUST_ACTIVE_DATA_ERROR);
        next(sysError.InvalidArgumentError("",sysMsg.CUST_ACTIVE_DATA_ERROR));
    }else{
        if(req.params.custId != paramArray[1]){
            logger.warn(' activeUser ' + sysMsg.CUST_ACTIVE_DATA_ERROR);
            return next(sysError.InvalidArgumentError("",sysMsg.CUST_ACTIVE_DATA_ERROR));
        }
        Seq().seq(function() {
            var that = this;
            custdao.searchCust({email:paramArray[0]},function(error, rows){
                if(rows == null || rows.length ==0){
                    logger.warn(' activeUser ' + sysMsg.CUST_ACTIVE_DATA_ERROR);
                    return next(sysError.InvalidArgumentError("",sysMsg.CUST_ACTIVE_DATA_ERROR));
                }else{
                    if(rows[0].active == 1){
                        logger.warn(' activeUser ' + sysMsg.CUST_ACTIVE_DUPLICATE_ERROR);
                        return next(sysError.InvalidArgumentError("",sysMsg.CUST_ACTIVE_DUPLICATE_ERROR));
                    }else{
                        that();
                    }
                }
            });
        }).seq(function(){
            custdao.setUserActive({customerId :paramArray[1]},function(error , rows){
                if(error){
                    logger.warn(' activeUser ' + error.message);
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                }else{
                    var loginInfo = {};
                    var customerAccessToken = oAuthUtil.createNewAccessToken(oAuthUtil.clientType.customer,paramArray[1],null,null);
                    loginInfo.accessToken = customerAccessToken;
                    loginInfo.customerId = paramArray[1];
                    if(baseUtil.isIOSRequest(req)){
                        var mobileUrl = 'trumenu://active/' + customerAccessToken;
                        res.writeHead(302, {
                            'Location': mobileUrl
                        });
                        res.end();
                    }else{
                        logger.info(' activeUser ' + 'success');
                        res.send(200, loginInfo);
                        next();
                    }
                }
            });
        });
    }


}

/**
 * Send a mail with active url to user
 * For unexpected mail error
 */
function sendActiveEmail(req, res, next){
    var email = req.params.email
    if(!validateUtil.isEmail(email)){
        logger.warn(' sendActiveEmail ' + sysMsg.SYS_VALIDATE_EMAIL_ERROR);
        return next(sysError.InvalidArgumentError("",sysMsg.SYS_VALIDATE_EMAIL_ERROR));
    }
    var customerId = "";

    Seq().seq(function() {
        var that = this;
        custdao.searchCust({email:req.params.email},function(error, rows){
            if(rows == null || rows.length ==0){
                logger.warn(' sendActiveEmail ' + sysMsg.CUST_LOGIN_USER_UNREGISTERED);
                return next(sysError.InvalidArgumentError("",sysMsg.CUST_LOGIN_USER_UNREGISTERED));
            }else{
                customerId = rows[0].customer_id;
                that();
            }
        });
    }).seq(function(){
            var activeCode = encrypt.createActiveCode(req.params.email,customerId);
            var actEmailInfo = {email:req.params.email,first_name:req.params.first_name};
            mailUtil.sendActiveEmail(activeCode, actEmailInfo, customerId);
            logger.info(' sendActiveEmail ' + 'success');
            res.send(200,{success:true});
            next();
        });

}

/**
 * Send a mail with active url to user
 * For unexpected mail error
 */
function sendPasswordEmail(req, res, next){
    var email = req.params.email;
    if(!validateUtil.isEmail(email)){
        logger.warn(' sendActiveEmail ' + sysMsg.SYS_VALIDATE_EMAIL_ERROR);
        return next(sysError.InvalidArgumentError("",sysMsg.SYS_VALIDATE_EMAIL_ERROR));
    }
    var customerId = "";
    var newPassword = baseUtil.random36(8);


    Seq().seq(function() {
        var that = this;
        custdao.searchCust({email:req.params.email},function(error, rows){
            if(rows == null || rows.length ==0){
                logger.warn(' sendActiveEmail ' + sysMsg.CUST_LOGIN_EMAIL_UNREGISTERED);
                return next(sysError.InvalidArgumentError("",sysMsg.CUST_LOGIN_EMAIL_UNREGISTERED));
            }else{
                customerId = rows[0].customer_id;
                that();
            }
        });
    }).seq(function(){
            mailUtil.sendResetPasswordMail(newPassword , req.params.email  );
            newPassword = encrypt.encryptByMd5(newPassword);
            custdao.updatePassword({cust_id:customerId , password:newPassword},function(error,data){
                if(error){
                    logger.error(' sendActiveEmail ' + error.message);
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                }else{
                    logger.info(' sendActiveEmail ' + 'success');
                    res.send(200,{success:true});
                    next();
                }
            });
        });

}

/**
 * For customer in China reset password ,need phone ,new password and captcha
 */
function resetCustPswd(req,res,next){
    var params = req.params;
    params.smsType = listOfValue.SMS_PSWD_TYPE;
    Seq().seq(function(){
        var that = this;
        smsDao.querySms(params,function(error,rows){
            if (error) {
                logger.error(' resetCustPswd ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else {
                if(rows && rows.length<1){
                    logger.warn(' resetCustPswd ' +params.phone+ sysMsg.CUST_SMS_CAPTCHA_ERROR);
                    res.send(200,{errMsg:sysMsg.CUST_SMS_CAPTCHA_ERROR})
                    return next();
                }else{
                    that();
                }
            }
        })
    }).seq(function(){
        params.password = encrypt.encryptByMd5(params.password);
        custdao.updatePassword(params,function(error,result){
            if (error) {
                logger.error(' resetCustPswd ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else {
                if(result && result.affectedRows>0){
                    logger.info(' resetCustPswd ' + 'success');
                    res.send(200,  {success:true,userId:result.insertId});
                }else{
                    logger.warn(' resetCustPswd ' + 'false');
                    res.send(200,  {success:false});
                }
                return next();
            }
        })
    })
}

function updateFavoriteBiz(req,res,next){


    bizcustreldao.saveFavoriteBiz(req.params,function(error,rows){
        if (error){
            logger.error(' updateFavoriteBiz ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }else{
            logger.info(' updateFavoriteBiz ' + 'success');
            res.send(200, rows);
            next();
        }
    });
}

function getFavoriteBiz(req,res,next){

    var favorBizArray = [];
    Seq().seq(function(){
        var that = this;
        bizcustreldao.getFavoriteBiz(req.params,function(error,rows){
            if (error){
                logger.error(' getFavoriteBiz ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            }else{
                favorBizArray = rows;
                that();
            }
        });

    }).seq(function(){
            Seq(favorBizArray).seqEach(function(prod,i){
                var that =  this;
                //get the biz comment and rating info
                bizCommentDao.queryBizRating({bizId: favorBizArray[i].biz_id}, function (err, rows) {
                    if (err) {
                        logger.error(' getFavoriteBiz ' + err.message);
                        throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                    } else {

                        if(rows[0].avg_food != null && rows[0].avg_price!=null && rows[0].avg_service != null){
                            var avg_rating = (rows[0].avg_food+rows[0].avg_price+rows[0].avg_service)/3.0*20.0;
                            rows[0].avg_rating = avg_rating;
                        }
                        favorBizArray[i].commentRating = rows[0];
                        that(null,i);
                    }
                });

            }).seqEach(function(prod,i){
                    var that =  this;
                    //get the biz favoriate info
                    bizDao.getFavoriteBizCount({bizId: favorBizArray[i].biz_id}, function (err, rows) {
                        if (err) {
                            logger.error(' getFavoriteBiz ' + err.message);
                            throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                        } else {
                            favorBizArray[i].favorite = rows.favorite_count;
                            that(null,i);
                        }
                    });

                }).seq(function(){
                    logger.info(' getFavoriteBiz ' + 'success');
                    res.send(200,favorBizArray);
                    next();
                });
        });


}

function addProdCustRel(req,res,next){

    productCustomerRelDao.addProdCustRel(req.params,function(error,rows){
        if (error){
            logger.error(' addProdCustRel ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }else{
            logger.info(' addProdCustRel ' +'success');
            res.send(200, rows);
            next();
        }
    });
}

function deleteProdCustRel(req,res,next){

    productCustomerRelDao.deleteProdCustRel(req.params,function(error,rows){
        if (error){
            logger.error(' deleteProdCustRel ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }else{
            logger.info(' deleteProdCustRel ' + 'success');
            res.send(200, rows);
            next();
        }
    });
}

function getFavoriteProduct(req,res,next){

    var favoriteProdArray = [];
    Seq().seq(function(){
        var that = this;
        productCustomerRelDao.queryRelByCustomer(req.params,function(error,rows){
            if (error){
                logger.error(' getFavoriteProduct ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            }else{
                favoriteProdArray = rows;
                that();
            }
        });
    }).seq(function(){
            Seq(favoriteProdArray).seqEach(function(prod,i){
                var that =  this;
                //get the product comment and rating info
                prodCommentDao.queryProductRating({productId: favoriteProdArray[i].prod_id}, function (err, rows) {
                    if (err) {
                        logger.error(' getFavoriteProduct ' + err.message);
                        throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                    } else {
                        favoriteProdArray[i].commentRating = rows[0];
                        that(null,i);
                    }
                });

            }).seqEach(function(prod,i){
                    var that =  this;
                    //get the product favoriate info
                    prodDao.getProductFavoriteCount({productId: favoriteProdArray[i].prod_id}, function (err, rows) {
                        if (err) {
                            logger.error(' getFavoriteProduct ' + err.message);
                            throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                        } else {
                            favoriteProdArray[i].favorite = rows.favorite_count;
                            that(null,i);
                        }
                    });

                }).seq(function(){
                    logger.info(' getFavoriteProduct ' + 'success');
                    res.send(200,favoriteProdArray);
                    next();
                });
        });

}


function addFeedback(req,res,next){
    //It is special process in feedback ,allow add feedback without token

    feedbackDao.addFeedback(req.params,function(error,rows){
        if (error){
            logger.error(' addFeedback ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }else{
            if(rows != null){
                logger.info(' addFeedback ' + 'success');
                res.send(200, {success:true});
                next();
            }else{
                logger.warn(' addFeedback ' + 'false');
                res.send(200, {success:false});
                next();
            }

        }
    });
}

function qureyFeedback(req,res,next){

    feedbackDao.queryFeedback(req.params,function(error,rows){
        if (error){
            logger.error(' qureyFeedback ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }else{
            logger.info(' qureyFeedback ' + 'success');
            res.send(200, rows);
            next();
        }
    });
}

function createBizRelByCust(req,res,next){

    var params = req.params;
    params.biz_id = params.bizId;
    params.cust_id =params.custId;
    bizcustreldao.addBizCustRelIfNot(req.params,function(error,resutl){
        if (error){
            logger.error(' createBizRelByCust ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }else{
            logger.info(' createBizRelByCust ' + 'success');
            res.send(200, {success:true});
            next();
        }
    })
}

function sendUpdateEmailUrl(req ,res ,next){
    var tokenInfo = oAuthUtil.checkAccessToken(req);
    if(tokenInfo == null || req.params.custId != tokenInfo.id){
        logger.error(' sendUpdateEmailUrl ' + sysMsg.SYS_AUTH_TOKEN_ERROR);
        return next(sysError.NotAuthorizedError());
    }
    var encodeData  = "";
    Seq().seq(function(){
        var that = this;
        custdao.search({email:req.params.newEmail} ,function(error,rows){
            if(error){
                logger.error(' sendUpdateEmailUrl ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            }
            if(rows && rows.length>0){
                logger.warn(' sendUpdateEmailUrl ' + sysMsg.CUST_SIGNUP_EMAIL_REGISTERED);
                return next( sysError.InvalidArgumentError("",sysMsg.CUST_SIGNUP_EMAIL_REGISTERED));
            }
            that();
        });

    }).seq(function(){

            custdao.search({customer_id:req.params.custId},function(error,rows){
                if(error){
                    logger.error(' sendUpdateEmailUrl ' + error.message);
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                }
                encodeData = encrypt.createLoginEmailCode(rows[0].email,req.params.newEmail,req.params.custId)
                //send email with encode data to user new email;
                logger.info(' sendUpdateEmailUrl ' + 'success');
                res.send(200,{encodeData:encodeData});
                next();
            })
        });
}
function updateLoginEmail(req ,res ,next){

    Seq().seq(function(){
        var that = this;
        custdao.searchCust(req.params,function(error , rows){
            if (error) {
                logger.error(' updateLoginEmail ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else {
                if (rows && rows.length > 0) {
                    var aCustomer = rows[0]
                    var userPassword = encrypt.encryptByMd5(req.params.password);
                    if(aCustomer.password == userPassword){
                        that();
                    }else{
                        logger.warn(' updateLoginEmail ' + sysMsg.CUST_LOGIN_PSWD_ERROR);
                        return next(sysError.InvalidArgumentError("",sysMsg.CUST_LOGIN_PSWD_ERROR));
                    }
                } else {
                    logger.warn(' updateLoginEmail ' + sysMsg.CUST_LOGIN_EMAIL_UNREGISTERED);
                    return next(sysError.InvalidArgumentError("",sysMsg.CUST_LOGIN_EMAIL_UNREGISTERED));
                }
            }
        });

    }).seq(function(){
            var that = this;
            custdao.search({email:req.params.newEmail} ,function(error,rows){
                if(error){
                    logger.error(' sendUpdateEmailUrl ' + error.message);
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                }
                if(rows && rows.length>0){
                    logger.warn(' sendUpdateEmailUrl ' + sysMsg.CUST_SIGNUP_EMAIL_REGISTERED);
                    return next( sysError.InvalidArgumentError("",sysMsg.CUST_SIGNUP_EMAIL_REGISTERED));
                }else{
                    that();
                }

            });
        }).seq(function(){
            var that = this;
            custdao.updateCustomerEmail({email :req.params.newEmail ,custId:req.params.custId},function(error,result){
                if(error){
                    logger.error(' updateLoginEmail ' + error.message);
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                }
                if(result.affectedRows<=0){
                    logger.error(' updateLoginEmail ' + 'false');
                    return next( sysError.InvalidArgumentError("",sysMsg.SYS_INTERNAL_ERROR_MSG));
                }else{
                    logger.info(' updateLoginEmail ' + 'success');
                    mailUtil.sendChangeAccountEmail(req.params);
                    res.send(200,{success:true});
                    next();
                }
            });
        })
}

function updateCustAvatar(req,res,next){
    var params=req.params;
    var avatarUrl;
    Seq().seq(function() {
        var that = this;
        if (req.files.image) {
            imagedao.saveImage(req.files.image,params, function(error, path) {
                if (error) {
                    logger.error(' uploadCustAvatar ' + error.message);
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                }
                avatarUrl = path;
                params.avatar = path;
                that();
            });
        }else{
            logger.error(' uploadCustAvatar ' + ' error ');
            res.send(200,{success: false});
            next();
        }
    }).seq(function(){
            custdao.updateCustAvatar(params,function(err,result){
                if (err) {
                    logger.error(' uploadCustAvatar ' + err.message);
                    throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                }else{
                    if(result && result.affectedRows>0){
                        res.send(200,{success: true,avatar:params.avatar});
                        next();
                    }else{
                        res.send(200,{success: false});
                        next();
                    }
                }
            })
        })
}

function addCustContact(req,res,next){
    var params = req.param;
    custContactDao.addCustContact(params,function(err,result){
        if (err) {
            logger.error(' addCustContact ' + err.message);
            throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }else{
            if(result && result.insertId>0){
                res.send(200,{success: true,id:result.insertId});
                next();
            }else{
                res.send(200,{success: false});
                next();
            }
        }
    })
}

function updateCustContact(req,res,next){
    var params = req.param;
    custContactDao.updateCustContact(params,function(err,result){
        if (err) {
            logger.error(' updateCustContact ' + err.message);
            throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }else{
            if(result && result.affectedRows>0){
                res.send(200,{success: true});
                next();
            }else{
                res.send(200,{success: false});
                next();
            }
        }
    })
}

function getCustContact(req,res,next){
    var params = req.param;
    custContactDao.getCustContact(params,function(err,rows){
        if (err) {
            logger.error(' getCustContact ' + err.message);
            throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }else{
            res.send(200,rows);
            next();
        }
    })
}

function delCustContact(req,res,next){
    var params = req.param;
    custContactDao.delCustContact(params,function(err,result){
        if (err) {
            logger.error(' delCustContact ' + err.message);
            throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }else{
            if(result && result.affectedRows>0){
                res.send(200,{success: true});
                next();
            }else{
                res.send(200,{success: false});
                next();
            }
        }
    })
}

function getTokenByWechat(req,res,next){
    var params = req.params;
    custdao.search(params,function(err,rows){
        if (err) {
            logger.error(' getTokenByWechat ' + err.message);
            throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }else{
            if(rows && rows.length>0){
                var loginInfo = {};
                loginInfo.customerId = rows[0].customer_id;
                loginInfo.accessToken = oAuthUtil.createNewAccessToken(oAuthUtil.clientType.customer,loginInfo.customerId,null,null);

                res.send(200,loginInfo);
                next();
            }else{
                logger.warn(' getTokenByWechat failed' );
                res.send(200,null);
                next();
            }
        }
    })
}
function getConnectState(req,res,next){
    res.send(200,{success: true});
}
///--- Exports
module.exports = {
    getConnectState:getConnectState,
    listCustBiz: listCustBiz,
    getCust: getCust,
    getCustomerInfo : getCustomerInfo,
    addUsCust: addUsCust,
    addCnCust: addCnCust,
    updateCust: updateCust,
    checkIn:checkIn,
    changePassword:changePassword,
    doLogin : doLogin,
    activeUser : activeUser,
    sendActiveEmail : sendActiveEmail,
    sendPasswordEmail : sendPasswordEmail,
    resetCustPswd : resetCustPswd,
    updateFavoriteBiz : updateFavoriteBiz,
    getFavoriteBiz : getFavoriteBiz ,
    addProdCustRel : addProdCustRel,
    deleteProdCustRel: deleteProdCustRel,
    getFavoriteProduct : getFavoriteProduct,
    addFeedback : addFeedback,
    qureyFeedback : qureyFeedback,
    createBizRelByCust : createBizRelByCust,
    sendUpdateEmailUrl : sendUpdateEmailUrl ,
    updateLoginEmail : updateLoginEmail ,
    updateCustAvatar : updateCustAvatar ,
    addCustContact : addCustContact ,
    updateCustContact : updateCustContact ,
    getCustContact : getCustContact ,
    delCustContact : delCustContact ,
    getTokenByWechat : getTokenByWechat,
    getConnectState:getConnectState
};