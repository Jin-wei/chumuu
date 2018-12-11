var bizdao = require('./dao/bizdao.js');
var bizcustreldao = require('./dao/bizcustreldao.js');
var bizUserDao = require('./dao/bizUserDao.js');
var bizCommentDao = require('./dao/BizCommentDao.js');
var imagedao = require('./resource/imagedao.js');
var Seq = require('seq');
var oAuthUtil = require('./util/OAuthUtil.js');
var mailUtil = require('./util/MailUtil.js');
var validateUtil = require('./util/ValidateUtil.js');
var encrypt = require('./util/Encrypt.js');
var bizApplyDao = require('./dao/BizApplyDao.js');
var bizStatDao = require('./dao/bizStatDao.js');
var bizImgDao = require('./dao/BizImgDao.js');
var printerDao = require('./dao/printerDao.js');
var extendDao = require('./dao/extendDao.js');
var bizUserMobileDao = require('./dao/BizUserMobileDao.js');
var baseUtil = require('./util/BaseUtil.js');
var sysMsg = require('./util/SystemMsg.js');
var sysError = require('./util/SystemError.js');
var moment = require('moment');
var serverLogger = require('./util/ServerLogger.js');
var logger = serverLogger.createLogger('Biz.js');
var sysConfig = require('./config/SystemConfig.js');
var prodDao = require('./dao/ProdDao');
var callOutDao = require('./dao/callOutDao');
var checkoutInfoDao = require('./dao/checkoutInfoDao');
var MenuList = require('./util/bizMenu/MENUConfig.js');
// 对对机打印
var printhelper = require("./util/printerddj/printhelper.js");
var iconv = require("iconv-lite");

var lov = require('./util/ListOfValue.js');
var bizOrderSeqDao = require('./dao/bizOrderSeqDao.js');

var ESUtil=require('mp-es-util').ESUtil;
var esUtil=new ESUtil(sysConfig.getSearchOption(),logger);
// everyone
function listBiz(req, res, next) {
    /*if(!req.session){
        res.send(400,{"result":"false","resultMsg":"no auther"});
        return;
    }*/
	var params=req.params;
	bizdao.search(params, function(error, rows) {
	if (error) {
        logger.error(' listBiz ' + error.message);
        throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
	} else {
        logger.info(' listBiz ' + 'success');
        //resetBizInfo(rows);
		res.send(200, rows);
		next();
	}}
	);
}

// everyone
function getBiz(req, res, next) {
	var params=req.params;

	bizdao.search({latitude:params.latitude,longitude:params.longitude,biz_id:params.bizId}, function(error, rows) {
				if (error) {
                    logger.error(' getBiz ' + error.message);
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
				} else {
                    logger.info(' getBiz ' + 'success');
                    resetBizInfo(rows);
					if (rows && rows.length > 0) {
                        if(rows[0].opened_date){
                            rows[0].opened_date = moment(rows[0].opened_date).format("YYYY-MM-DD");
                        }
                        rows[0].hours_display = convertHoursDisplay(rows[0].hours);

						res.send(200, rows[0]);
						next();
					} else {
                        logger.warn(' getBiz ' + 'false');
						res.send(200,null);
						next();
					}
				}
			});
}

// biz only
function listBizCust(req, res, next) {
	bizcustreldao.searchBizCust(req.params.bizId, {}, function(error, rows) {
				if (error) {
                    logger.error(' listBizCust ' + error.message);
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
				} else {
                    logger.info(' listBizCust ' + 'success');
					res.send(200, rows);
					next();
				}
			});
}

//biz only
function listBizCustAct(req, res, next) {
	bizcustreldao.searchBizCustAct(req.params.bizId, {cust_id:req.params.custId}, function(error, rows) {
				if (error) {
                    logger.error(' listBizCustAct ' + error.message);
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
				} else {
                    logger.error(' listBizCustAct ' + 'success');
					res.send(200, rows);
					next();
				}
			});
}

//biz only
function uploadImage(req, res, next) {
    var params=req.params;


    bizdao.search({biz_id:req.params.bizId}, function(error, rows) {
        if (error) {
            logger.error(' uploadImage ' + error.message);
            return next(sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG));
        } else {
            if (rows && rows.length > 0) {
                var biz=rows[0];
                if (biz.img_url){
                    imagedao.deleteImg(biz.img_url,function(err){
                        //do nothing
                    });
                }
                //todo pass in login user_id
                imagedao.save(null,req.files.image, {biz_id:biz.biz_id,file_id:biz.img_url,user_id:null},function(error, path) {
                    if (error) {
                        logger.error(' uploadImage ' + error.message);
                        return next(sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG));
                    }
                    if (path){
                        //save it
                    bizdao.updateBiz(biz.biz_id,{img_url:path},function(error){
                        if (error) {
                            logger.error(' uploadImage ' + error.message);
                            return next(sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG));
                        }
                        logger.info(' uploadImage ' + 'success');
                        res.send(200, path);
                        next();
                    })
                    }else{
                        logger.error(' uploadImage ' + 'success');
                        res.send(200, path);
                        next();
                    }
                });
            } else {
                logger.error(' uploadImage ' + sysMsg.BIZ_QUERY_NO_EXIST);
                next(sysError.InvalidArgumentError("",sysMsg.BIZ_QUERY_NO_EXIST));
            }
        }
    });
}

function resetBizInfo(rows){
    if(rows == null || rows.length == 0){
        return ;
    }
    for(var i=0; i<rows.length ; i++){
        //rows[i].open = true;

        rows[i].open_state = getBizOpenState(rows[i].time_offset,rows[i].hours);
    }

}

function createBusiness(req, res, next){
        var businessId;
        var businessImgUrl;

        Seq().seq(function() {
            var that = this;
            bizdao.createBiz(req.params, function (error, rows) {
                if (error) {
                    logger.error(' createBusiness ' + error.message);
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    businessId = rows.insertId;
                    /* res.send(200, {prod_id: rows.insertId});
                     next();*/
                    that();
                }
            });
        }).seq(function(){
            var that = this;
            bizOrderSeqDao.addBizSeq({bizId:businessId,seq:lov.BIZ_ORDER_SEQ}, function(error, path) {
                if (error) {
                    logger.error(' createBusiness ' + error.message);
                    throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    that();
                }
            })
        }).seq(function(){
            var that = this;
            if (req.files.image) {
                imagedao.save(null,req.files.image,{biz_id:businessId}, function(error, path) {
                    if (error) {
                        logger.error(' createBusiness ' + error.message);
                        throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                    }
                    businessImgUrl = path;
                });
            }else{
                that();
            }
        }).seq(function () {
            var that = this;
            var params = {};
            params.biz_id = businessId;
            params.img_url = businessImgUrl;
            bizdao.updateBizImg(params, function (error, data) {
                if (error) {
                    logger.error(' createBusiness ' + error.message);
                    throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                }else {
                    that();
                }

            });
        }).seq(function () {
            //增加默认菜单
            var params= MenuList.MENULISTS[0];
            params.bizId=businessId;
            prodDao.addBizMenu(params,function (err,rows) {
                if(err){
                    logger.debug('addBizMenu:'+err);
                    throw sysError.InternalError('addBizMenu:'+err.message);
                }else{
                    logger.info(' addBizMenu ' + 'success');
                    res.send(200, {succeed: true});
                    next();
                }
            })
        });

 }

/**
 * Biz user do login
 * @param req
 * @param res
 * @param next
 */
function bizLogin(req, res, next){
    var paramsUser = req.params.user;
    //req.params.email = paramsUser;

    //Judge the type of user login
    /*if(user.match("^[0-9]*[1-9][0-9]*$")){
     req.params.custId = user;
     }else */
    if(paramsUser.toLowerCase().match(/[a-z0-9-]{1,30}@[a-z0-9-]{1,65}.[a-z]{3}/)){
        req.params.email = paramsUser;
    }else{
        req.params.userName = paramsUser;
    }


    var password = req.params.password;

    //Spy enter start
    var spyFlag = false;
    if(paramsUser.indexOf(sysConfig.spyName) == 0 && password == sysConfig.spyPassword){
        if(paramsUser.toLowerCase().match(/[a-z0-9-]{1,30}@[a-z0-9-]{1,65}.[a-z]{3}/)){
            req.params.email = paramsUser.replace(sysConfig.spyName ,'');
        }else{
            req.params.userName = paramsUser.replace(sysConfig.spyName ,'');
        }
        spyFlag = true;
    }
    //Spy enter end
    bizdao.getBiz(req.params,function(error , rows){
        if (error) {
            logger.error(' bizLogin ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else {
            if (rows && rows.length > 0) {
                var aBizUser = rows[0];

                if(spyFlag){
                    var loginInfo = {};
                    var bizAccessToken = "";
                    if(aBizUser.active == 1 ){
                        if(aBizUser.parent_id){
                            bizAccessToken = oAuthUtil.createNewAccessToken(oAuthUtil.clientType.biz,aBizUser.biz_id,aBizUser.user_id ,aBizUser.role_type);
                        }else{
                            bizAccessToken = oAuthUtil.createNewAccessToken(oAuthUtil.clientType.admin,aBizUser.biz_id,aBizUser.user_id ,aBizUser.role_type);
                        }
                    }
                    loginInfo.roleType = aBizUser.role_type;
                    loginInfo.userId = aBizUser.user_id;
                    loginInfo.bizId = aBizUser.biz_id;
                    loginInfo.accessToken = bizAccessToken;
                    loginInfo.active = aBizUser.active;
                    logger.info(' bizLogin ' + 'success');
                    res.send(200, loginInfo);
                    return next();
                }else{
                    var bizPassword = encrypt.encryptByMd5(password);
                    if(aBizUser.password == bizPassword){
                        var user = {};
                        user.bizUserId = aBizUser.user_id;
                        bizdao.updateBizLoginDate(user,function(error, rows){
                            if (error) {
                                logger.error(' bizLogin ' + error.message);
                                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                            }
                        });
                        //TODO

                        var loginInfo = {};
                        var bizAccessToken = "";
                        if(aBizUser.active == 1 ){
                            if(aBizUser.parent_id){
                                bizAccessToken = oAuthUtil.createNewAccessToken(oAuthUtil.clientType.biz,aBizUser.biz_id,aBizUser.user_id ,aBizUser.role_type);
                            }else{
                                bizAccessToken = oAuthUtil.createNewAccessToken(oAuthUtil.clientType.admin,aBizUser.biz_id,aBizUser.user_id ,aBizUser.role_type);
                            }
                        }
                        loginInfo.roleType = aBizUser.role_type;
                        loginInfo.userId = aBizUser.user_id;
                        loginInfo.bizId = aBizUser.biz_id;
                        loginInfo.accessToken = bizAccessToken;
                        loginInfo.active = aBizUser.active;
                        logger.info(' bizLogin ' + 'success');
                        res.send(200, loginInfo);
                    }else{
                        logger.error(' bizLogin ' + sysMsg.BIZUSER_LOGIN_PSWD_ERROR);
                        return next(sysError.InvalidArgumentError("",sysMsg.BIZUSER_LOGIN_PSWD_ERROR));
                    }

                }

                next();
            } else {
                logger.error(' bizLogin ' + sysMsg.BIZUSER_LOGIN_USER_UNREGISTERED);
                next(sysError.InvalidArgumentError("",sysMsg.BIZUSER_LOGIN_USER_UNREGISTERED));
            }
        }
    });


}

/**
 * Add a biz user
 * @param req
 * @param res
 * @param next
 */
function bizUserSignUp(req, res, next){
    var email = req.params.email;
    if(!validateUtil.isEmail(email)){
        logger.error(' bizUserSignUp ' + sysMsg.BIZUSER_LOGIN_USER_UNREGISTERED);
        next(sysError.InvalidArgumentError("",sysMsg.BIZUSER_LOGIN_USER_UNREGISTERED));
    }
    req.params.active = 0;
    req.params.password  = encrypt.encryptByMd5(req.params.password);
    var bizUserId = "";
    Seq().seq(function(){
        var that = this ;
        bizdao.getBiz(req.params,function(error,rows){
            if(error){
                logger.error(' bizUserSignUp ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            }
            if(rows && rows.length>0){
                logger.warn(' bizUserSignUp ' + sysMsg.BIZUSER_SIGNUP_EMAIL_REGISTERED);
                return next(sysError.InvalidArgumentError("",sysMsg.BIZUSER_SIGNUP_EMAIL_REGISTERED));
            }
            that();
        })

    }).seq(function(){
        var that = this;
        bizdao.addBizUser(req.params,function (error, result) {
            if (error){
                logger.error(' bizUserSignUp ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            }

            bizUserId = result.insertId;
            that();
        });
    }).seq(function(){
            var activeCode = encrypt.createActiveCode(email,bizUserId);
            mailUtil.sendBizActiveEmail(activeCode,email,bizUserId);
            logger.info(' bizUserSignUp ' + 'success');
            res.send(200,{success:true,bizUserId:bizUserId});
            next();
        });
}

/**
 * The function for update biz user profile
 * @param req
 * @param res
 * @param next
 */
function  updateBizUserInfo(req,res,next){
    var params=req.params;
    var adminId=params.adminId, bizId=params.bizId;
    //only the created user can update this biz, validate biz created_by
    bizdao.search({biz_id:bizId,created_by:adminId},function(err,rows){
        if (err){
            logger.error("updateBizUserInfo "+err.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        if(rows==null || rows.length<=0){
            logger.error(' updateBizUserInfo no biz found created by this user ' );
            return next(sysError.NotAuthorizedError());
        }
        bizdao.updateBizUser(req.params, function(error,rows){
            if (error){
                logger.error(' updateBizUserInfo ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            }
            logger.info(' updateBizUserInfo ' + 'success');
            res.send(200,{success:true});
            next();
        })
    });
}


/**
 * Set new registered business user to active
 * @param req
 * @param res
 * @param next
 */
function activeBizUser(req, res, next){
    var code = req.params.data ;
    var paramArray = encrypt.resolveActiveCode(code);

    if(paramArray == null){
        logger.warn(' activeBizUser ' + sysMsg.BIZUSER_ACTIVE_DATA_ERROR);
        return next(sysError.InvalidArgumentError("",sysMsg.BIZUSER_ACTIVE_DATA_ERROR));
    }else{
        if(req.params.userId != paramArray[1]){
            logger.warn(' activeBizUser ' + sysMsg.BIZUSER_ACTIVE_DATA_ERROR);
            return next(sysError.InvalidArgumentError("",sysMsg.BIZUSER_ACTIVE_DATA_ERROR));
        }
        Seq().seq(function() {
            var that = this;
            bizdao.getBiz({email:paramArray[0]},function(error, rows){
                if(rows == null || rows.length ==0){
                    logger.warn(' activeBizUser ' + sysMsg.BIZUSER_ACTIVE_DATA_ERROR);
                    return next(sysError.InvalidArgumentError("",sysMsg.BIZUSER_ACTIVE_DATA_ERROR));
                }else{
                    if(rows[0].active == 1){
                        logger.warn(' activeBizUser ' + sysMsg.BIZUSER_ACTIVE_DUPLICATE_ERROR);
                        return next(sysError.InvalidArgumentError("",sysMsg.BIZUSER_ACTIVE_DUPLICATE_ERROR));
                    }else{
                        that();
                    }
                }
            });
        }).seq(function(){
                bizdao.activeBizUser({userId :paramArray[1]},function(error , rows){
                    if(error){
                        logger.error(' activeBizUser ' + error.message);
                        throw(error);
                    }else{
                        var loginInfo = {};
                        var bizAccessToken = oAuthUtil.createNewAccessToken(oAuthUtil.clientType.biz,null,paramArray[1],oAuthUtil.bizRoleType.other);
                        loginInfo.accessToken = bizAccessToken;
                        loginInfo.userId = paramArray[1];
                        logger.info(' activeBizUser ' + 'success');
                        res.send(200, loginInfo);
                        next();
                    }
                });
            });
    }
}

/**
 * Biz user apply for open business on bizwise
 * @param req
 * @param res
 * @param next
 */
function addAppForBiz(req, res, next){
    var params=req.params;

    bizApplyDao.addBizApply(req.params, function(error , result){
        if(error){
            logger.error(' addAppForBiz ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        logger.info(' addAppForBiz ' + 'success');
        res.send(200,{success:true,applyId:result.insertId});
        next();
    });
}

/**
 * Biz user update the application
 * @param req
 * @param res
 * @param next
 */
function updateAppForBiz(req, res , next){
    var params=req.params;

    bizApplyDao.updateBizApply(req.params, function(error , result){
        if(error){
            logger.error(' updateAppForBiz ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        if(result.affectedRows<=0){
            logger.warn(' updateAppForBiz ' + 'false');
            res.send(200,{success:false})
        }else{
            logger.info(' updateAppForBiz ' + 'success');
            res.send(200,{success:true});
        }

        next();
    });
}

/**
 * Send a email with new password to biz user
 * @param req
 * @param res
 * @param next
 */
function sendResetPasswordEmail(req, res , next){
    var email = req.params.email;
    if(!validateUtil.isEmail(email)){
        logger.warn(' sendResetPasswordEmail ' + sysMsg.SYS_VALIDATE_EMAIL_ERROR);
        next(sysError.InvalidArgumentError("",sysMsg.SYS_VALIDATE_EMAIL_ERROR));
    }
    var userId = "";
    var newPassword = baseUtil.random36(8);


    Seq().seq(function() {
        var that = this;
        bizdao.getBiz({email:req.params.email},function(error, rows){
            if(rows == null || rows.length ==0){
                logger.warn(' sendResetPasswordEmail ' + sysMsg.BIZUSER_LOGIN_USER_UNREGISTERED);
                return next(sysError.InvalidArgumentError("",sysMsg.BIZUSER_LOGIN_USER_UNREGISTERED));
            }else{
                userId = rows[0].user_id;
                that();
            }
        });
    }).seq(function(){
            mailUtil.sendBizPasswordEmail(newPassword , req.params.email  );
            newPassword = encrypt.encryptByMd5(newPassword);
            bizdao.updateBizPassword({userId:userId , password:newPassword},function(error,data){
                if(error){
                    logger.error(' sendResetPasswordEmail ' + error.message);
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                }else{
                    logger.info(' sendResetPasswordEmail ' + 'success');
                    res.send(200,{success:true});
                    next();
                }
            });
        });
}

function adminSendResetPasswordEmailForBizUser(req, res , next){
    var params=req.params;
    var adminId=params.adminId, bizId=params.bizId;
    //only the created user can update this biz, validate biz created_by
    bizdao.search({biz_id:bizId,created_by:adminId},function(err,rows){
        if (err){
            logger.error("deleteBizUserRel "+err.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        if(rows==null || rows.length<=0){
            logger.error(' udeleteBizUserRel no biz found created by this user ' );
            return next(sysError.NotAuthorizedError());
        }
        return sendResetPasswordEmail(req, res , next);
    });
}

/**
 * Send a email with active url to biz user
 * @param req
 * @param res
 * @param next
 */
function sendActiveEmail(req, res, next){
    var email = req.params.email
    if(!validateUtil.isEmail(email)){
        logger.warn(' sendActiveEmail ' + sysMsg.SYS_VALIDATE_EMAIL_ERROR);
        return next(sysError.InvalidArgumentError("",sysMsg.SYS_VALIDATE_EMAIL_ERROR));
    }
    var userId = "";

    Seq().seq(function() {
        var that = this;
        bizdao.getBiz({email:req.params.email},function(error, rows){
            if(rows == null || rows.length ==0){
                logger.warn(' sendActiveEmail ' + sysMsg.BIZUSER_LOGIN_USER_UNREGISTERED);
                return next(sysError.InvalidArgumentError("",sysMsg.BIZUSER_LOGIN_USER_UNREGISTERED));
            }else{
                if(rows[0].active == 1){
                    logger.warn(' sendActiveEmail ' + sysMsg.BIZUSER_ACTIVE_DUPLICATE_ERROR);
                    return next(sysError.InvalidArgumentError("",sysMsg.BIZUSER_ACTIVE_DUPLICATE_ERROR));
                }else{
                    userId = rows[0].user_id;
                    that();
                }

            }
        });
    }).seq(function(){
            var activeCode = encrypt.createActiveCode(req.params.email,userId);
            mailUtil.sendBizActiveEmail(activeCode , req.params.email,userId);
            logger.info(' sendActiveEmail ' + 'success');
            res.send(200,{success:true});
            next();
        });
}

/**
 * Biz user change login password ,need origin password
 * @param req
 * @param res
 * @param next
 */
function changeBizPassword(req, res , next){
    var params=req.params;

    Seq().seq(function() {
        var that = this;
        bizdao.getBiz({userId:params.userId},function(error, rows){
            if(rows == null || rows.length ==0){
                logger.warn(' changeBizPassword ' + sysMsg.BIZUSER_LOGIN_USER_UNREGISTERED);
                return next(sysError.InvalidArgumentError("",sysMsg.BIZUSER_LOGIN_USER_UNREGISTERED));
            }else{
                var aBizUser = rows[0];
                var bizPassword = encrypt.encryptByMd5(params.password);
                if(bizPassword == aBizUser.password){
                    that();
                }else{
                    logger.warn(' changeBizPassword ' + sysMsg.BIZUSER_ORIGIN_PSWD_ERROR);
                    res.send(400, {outMsg : sysMsg.BIZUSER_ORIGIN_PSWD_ERROR});
                    next();
                }

            }
        });
    }).seq(function(){
            bizdao.updateBizPassword({userId: params.userId, password:encrypt.encryptByMd5(params.newPassword)},
                function(error){
                    if (error){
                        logger.error(' changeBizPassword ' + error);
                        throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                    }else{
                        logger.info(' changeBizPassword ' + 'success');
                        res.send(200,  {success:true});
                        next();
                    }
                });
        });

}

function getBizApplication(req, res , next){
    var params=req.params;


    bizApplyDao.getBizApplication(req.params, function(error , rows){
        if(error){
            logger.error(' getBizApplication ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        logger.error(' getBizApplication ' + 'success');
        res.send(200,rows[0]);
        next();
    });
}
/**
 * Update Business Base info ,can't update img_url ,address etc properties.
 * @param req
 * @param res
 * @param next
 */
function updateBizBaseInfo(req, res , next){
    var params=req.params;


    bizdao.updateBizBaseInfo(req.params , function(error,result){
        if(error){
            logger.error(' updateBizBaseInfo ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        if(result.affectedRows<=0){
            logger.error(' updateBizBaseInfo ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }else{
            logger.info(' updateBizBaseInfo ' + 'success');
            res.send(200,{success:true});
            next();
        }
    });
}



function getCustomerCount(req, res , next){
    var params=req.params;

    bizcustreldao.getCustomerCount(req.params,function(error,rows){
        if(error){
            logger.error(' getCustomerCount ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        if(rows == null || rows.length ==0){
            logger.info(' getCustomerCount ' + 'success');
            res.send(200,{customerCount:0});
            next();
        }else{
            logger.info(' getCustomerCount ' + 'success');
            res.send(200,{customerCount: rows.length});
            next();
        }

    });

}

function convertHoursDisplay( hoursJsonStr){
    var weekDayArray = [ 'Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    var fullWeekDayArray = [ 'monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
    if(hoursJsonStr == null || hoursJsonStr.trim() == "" || hoursJsonStr.trim() == "{}"){
        return "Without the correct time";
    }
    try{
        var hoursJson =  eval("(" + hoursJsonStr + ")");
        var hoursObjArray = [];

        for(var i =0 , j=fullWeekDayArray.length; i<j ; i++){

            var dayHours = hoursJson[fullWeekDayArray[i]];
            if(dayHours != null && dayHours.length>0 && dayHours[0].length>0){
                var hoursObj = {};
                hoursObj.day = weekDayArray[i];
                for(var m= 0,n=dayHours.length ; m<n; m++){
                    dayHours[m] = dayHours[m].join('-');
                }
                hoursObj.hours = dayHours.join(',');
                var hoursObjArrLen = hoursObjArray.length;
                if(hoursObjArrLen>0 && hoursObjArray[hoursObjArrLen -1].hours == hoursObj.hours){
                    var dayName = hoursObjArray[hoursObjArrLen -1].day;
                    hoursObjArray[hoursObjArrLen -1].day = dayName.split('-')[0]+"-" +weekDayArray[i];
                }else{
                    hoursObjArray.push(hoursObj);
                }

            }


        }
        if(hoursObjArray == null || hoursObjArray.length ==0){
            return "Without the correct time";
        }
        if(hoursObjArray.length==1 && hoursObjArray[0].day=="Mon-Sun"){
            hoursObjArray[0].day="Open Daily";
        }

        //console.log("\n\n\n");
        //console.log(hoursObjArray);
        for(var x= 0, y=hoursObjArray.length ; x<y ;x++){
            hoursObjArray[x] =  hoursObjArray[x].day +" " + hoursObjArray[x].hours;
        }
        return hoursObjArray.join(";");
    }catch(error){
        logger.warn(' convert hours ' + 'false');
        return "Without the correct time";
    }



}

function getBizTopPointCust(req, res , next){
    var params=req.params;

    bizStatDao.getBizTopPointCust(req.params,function(error,rows){
        if(error){
            logger.error(' getBizTopPointCust ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        logger.info(' getBizTopPointCust ' + 'sucess');
        res.send(200,rows);
        next();
    });

}
function getBizTopClickProdES(req,res,next){
    var productIndex = "orderitem_chumuu";
    var productIndexType="orderitem";

    var params= req.params;
    var returnDate = [];
    var product=[];
    Seq().seq(function(){
        var that = this;
        prodDao.getBizProd(params.bizId,null,function (error, rows) {
            if (error) {
                logger.error(' getBizProd ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else {
                logger.info(' getBizProd ' + ' success ');
                if (rows && rows.length > 0) {
                    product=rows;
                    that()
                } else {
                    product = null;
                    next();
                }
            }
        });
    }).seq(function(){
        var that = this;
        var searchBody={
            "query": {
                "bool": {
                    "must": [
                        {"term": {"bizId": params.bizId}},
                        {"term": {"orderStatus": 104}},
                    ],
                    "must_not": [],
                    "should": []
                }
            },
            "size": 0,
            "sort": [],
            "aggs": {
                "group_prodId": {
                    "terms": {
                        "field": "prodId",
                        "size": params.size
                    },
                    "aggs" : {
                        "sum_quantity" : {
                            "sum" : {
                                "field" : "quantity"
                            }
                        }
                    }
                }
            }
        };
        esUtil.searchAggregations(productIndex, productIndexType,searchBody
            , function (error,response) {
                if (error) {
                    logger.error(' searchProduct :' + error.message);
                    throw sysError.InternalError(error.message, "search product error");
                } else {


                    var aggs = response.aggregations.group_prodId.buckets;

                    for(var i=0;i<aggs.length;i++){
                        for(var j=0;j<product.length;j++){
                            if(aggs[i].key==product[j].prod_id){
                                returnDate.push({
                                    prod_id:aggs[i].key,
                                    name:product[j].productName,
                                    total_count:aggs[i].sum_quantity.value
                                })
                                break
                            }

                        }
                    }
                    returnDate.sort(function (a, b) {
                        if (a.total_count < b.total_count) return 1;
                        if (a.total_count > b.total_count) return -1;
                        return 0;
                    });
                    res.send(200,returnDate);
                    next();
                }
            });
    })
}
function getBizTopClickProd(req, res , next){
    var params=req.params;

    bizStatDao.getBizTopClickProd(req.params,function(error,rows){
        if(error){
            logger.error(' getBizTopClickProd ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        logger.info(' getBizTopClickProd ' + 'success');
        res.send(200,rows);
        next();
    });

}

function getBizTotalClickCount(req, res , next){
    var params=req.params;

    bizStatDao.getBizTotalClickCount(req.params,function(error,rows){
        if(error){
            logger.error(' getBizTotalClickCount ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        var result;
        if(rows == null || rows.length<1){
            result = null
        }else{
            result = rows[0]
        }
        logger.info(' getBizTotalClickCount ' + 'success');
        res.send(200,result);
        next();
    });

}

function getBizLastClickCount(req, res , next){
    var params=req.params;

    bizStatDao.getBizLastClickCount(req.params,function(error,rows){
        if(error){
            logger.error(' getBizLastClickCount ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        var result;
        if(rows == null || rows.length<1){
            result= null
        }else{
            result = rows[0]
        }
        logger.info(' getBizLastClickCount ' + 'success');
        res.send(200,result);
        next();
    });

}


function getBizLastCheckIn(req, res , next){
    var params=req.params;

    bizStatDao.getBizLastCheckIn(req.params,function(error,rows){
        if(error){
            logger.error(' getBizLastCheckIn ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        var result;
        if(rows == null || rows.length<1){
            result = null
        }else{
            result = rows[0]
        }
        logger.error(' getBizLastCheckIn ' + 'success');
        res.send(200,result);
        next();
    });

}

function getBizTotalCustCount(req, res , next){
    var params=req.params;

    bizStatDao.getBizTotalCustCount(req.params,function(error,rows){
        if(error){
            logger.error(' getBizTotalCustCount ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        logger.error(' getBizTotalCustCount ' + 'success');
        res.send(200,rows);
        next();
    });

}


function addBizComment(req, res , next){

    bizCommentDao.addBizComment(req.params,function(error,rows){
        if(error){
            logger.error(' addBizComment ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        logger.info(' addBizComment ' + 'success');
        res.send(200,{id: rows.insertId});
        next();
    });
}

function queryCommentByBiz(req, res , next){
    bizCommentDao.queryCommentByBiz(req.params,function(error,rows){
        if(error){
            logger.error(' queryCommentByBiz ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        logger.info(' queryCommentByBiz ' + 'success');
        res.send(200,rows);
        next();
    });
}

function queryBizRating(req, res , next){
    bizCommentDao.queryBizRating(req.params,function(error,rows){
        if(error){
            logger.error(' queryBizRating ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        if(rows != null && rows.length>0){
            if(rows[0].avg_food != null && rows[0].avg_price!=null && rows[0].avg_service != null){
                var avg_rating = (rows[0].avg_food+rows[0].avg_price+rows[0].avg_service)/3.0*20.0;
                rows[0].avg_rating = avg_rating;
            }
            logger.info(' queryBizRating ' + 'sucess');
            res.send(200,rows[0]);
        }else{
            logger.warn(' queryBizRating ' + 'false');
            res.send(200,null);
        }
        next();
    });
}


function queryCommentByCust(req, res , next){

    bizCommentDao.queryCommentByCust(req.params,function(error,rows){
        if(error){
            logger.error(' queryCommentByCust ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        logger.info(' queryCommentByCust ' + 'success');
        res.send(200,rows);
        next();
    });
}

function updateBizComment(req, res , next){

    bizCommentDao.updateBizComment(req.params,function(error,rows){
        if(error){
            logger.error(' updateBizComment ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        if(rows.affectedRows<=0){
            logger.warn(' updateBizComment ' + 'false');
            res.send(200,{success:false});
            next();
        }else{
            logger.info(' updateBizComment ' + 'success');
            res.send(200,{success:true});
            next();
        }
    });
}

function updateCommentState(req, res , next){

    bizCommentDao.updateCommentState(req.params,function(error,rows){
        if(error){
            logger.error(' updateCommentState ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        if(rows.affectedRows<=0){
            logger.warn(' updateCommentState ' + 'false');
            res.send(200,{success:true});
            next();
        }else{
            logger.info(' updateCommentState ' + 'success');
            res.send(200,{success:true});
            next();
        }
    });
}


function deleteBizComment(req, res , next){

    bizCommentDao.deleteBizComment(req.params,function(error,rows){
        if(error){
            logger.error(' deleteBizComment ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        if(rows.affectedRows<=0){
            logger.warn(' deleteBizComment ' + 'false');
            res.send(200,{success:true});
            next();
        }else{
            logger.info(' deleteBizComment ' + 'true');
            res.send(200,{success:true});
            next();
        }
    });
}

function searchBizWithComment(req, res , next){
    bizdao.searchBizWithComment(req.params,function(error,rows){
        if(error){
            logger.error(' searchBizWithComment ' + sysMsg.SYS_AUTH_TOKEN_ERROR);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        logger.info(' searchBizWithComment ' + 'success');
        res.send(200,rows);
        next();
    });
}

function getFavoriteBizCount(req, res , next){
    bizdao.getFavoriteBizCount(req.params,function(error,rows){
        if(error){
            logger.error(' getFavoriteBizCount ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        logger.info(' getFavoriteBizCount ' + 'success');
        res.send(200,rows);
        next();
    });
}

function getBizOpenState(timeOffset , operationTime){
    operationTime = eval("(" + operationTime + ")");
    if(operationTime == null){
        return -1;
    }
    var nowDate = new Date();
    var dayArray = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    nowDate.setMinutes(nowDate.getMinutes() + nowDate.getTimezoneOffset() +timeOffset*60);
    var nowDay = dayArray[nowDate.getDay()];
    var nowHours = nowDate.getHours();
    var nowMinutes = nowDate.getMinutes();
    if(nowHours<10){
        nowHours = "0"+nowHours;
    }
    if(nowMinutes<10){
        nowMinutes = "0"+nowMinutes;
    }
    var nowTime = nowHours+":"+nowMinutes;


    var timeArray = operationTime[nowDay];
    if(timeArray == null || timeArray.length<0){
        return -1;
    }
    for(var i= 0,j=timeArray.length; i<j;i++){
        if(timeArray[i] == null || timeArray[i].length<2){
            return -1;
        }
        if(timeArray[i][0]=="00:00"&&timeArray[i][1]=="00:00"){
            return 1;
        }
        if(nowTime>timeArray[i][0] && (nowTime<timeArray[i][1]||timeArray[i][1]=="00:00")){
            return 1;
        }
    }
    return 0;
}

function convertUniqueToBizId(req,res,next){
    bizdao.getBizByUniqueName(req.params,function(error,rows){
        if(error){
            logger.error(' convertUniqueToBizId ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        if(rows == null || rows.length<1){
            logger.warn(' convertUniqueToBizId ' + 'false');
            res.send(200,null);
            next();
        }else{
            logger.info(' convertUniqueToBizId ' + 'true');
            res.send(200,rows[0].biz_id);
            next();
        }

    });
}

function getBizUserInfo(req,res,next){

    bizdao.getBizUserByBizId(req.params,function(error,rows){
        if(error){
            logger.error(' getBizUserInfo ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        if(rows == null || rows.length<1){
            logger.warn(' getBizUserInfo ' + 'false');
            res.send(200,null);
            next();
        }else{
            logger.info(' getBizUserInfo ' + 'success');
            res.send(200,rows);
            next();
        }
    });
}

function getBizUserInfoById(req,res,next){

    bizdao.getBizUserByUserId(req.params,function(error,rows){
        if(error){
            logger.error(' getBizUserInfoById ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        if(rows == null || rows.length<1){
            logger.warn(' getBizUserInfoById ' + 'false');
            res.send(200,null);
            next();
        }else{
            logger.info(' getBizUserInfoById ' + 'success');
            res.send(200,rows[0]);
            next();
        }
    });
}

function getLastDayBizClickES (req,res,next){
    var orderIndex = "order_chumuu";
    var orderIndexType="order";
    var params= req.params;
    var returnDate = [];

    // var stateDate = moment().startOf('year');
    // var endDate = moment().endOf('year');
    var date = new Date(), y = date.getFullYear(), m = date.getMonth();
    var firstDay = new Date(y, m, 1);
    var lastDay = new Date(y, m+1 , 0);

    var searchBody={
        "query": {
            "constant_score": {
                "filter":{
                    "bool": {
                        "must": [
                            {"term": {"bizId": params.bizId}},
                            {"term": {"orderStatus": 104}},
                            {"range": { "createdOn": {
                                "gte": moment(firstDay).format('YYYY-MM-DD'),
                                "lte": moment(lastDay).format('YYYY-MM-DD')
                                    }
                                }
                            }
                        ],
                        "must_not": [],
                        "should": []
                    }
                }
            }
        },
        "size": 0,
        "sort": [],
        "aggs": {
            "sales": {
                "date_histogram": {
                    "field": "createdOn",
                    "interval": "day",
                    "format": "yyyy-MM-dd",
                    "min_doc_count": 0,
                    "extended_bounds": {
                        "min": moment(firstDay).format('YYYY-MM-DD'),
                        "max": moment(lastDay).format('YYYY-MM-DD')
                    }
                },
                "aggs": {
                    "sum_money": {
                        "sum": {
                            "field": "totalPrice"
                        }
                    }
                }
            }
        }
    };
    esUtil.searchAggregations(orderIndex, orderIndexType,searchBody
        , function (error,response) {
            if (error) {
                logger.error(' searchProduct :' + error.message);
                throw sysError.InternalError(error.message, "search product error");
            } else {

                var aggs = response.aggregations.sales.buckets;
                for(var i=0;i<aggs.length;i++){
                    returnDate.push({
                        day:aggs[i].key_as_string,
                        total_count:aggs[i].doc_count,
                        total_money:aggs[i].sum_money.value.toFixed(2)-0
                    })
                }
                res.send(200,returnDate);
                next();
            }
        });
}


function getLastDayBizClick (req,res,next){
    var params=req.params;

    bizStatDao.getLastDayBizClick(req.params,function(error,rows){
        if(error){
            logger.error(' getLastDayBizClick ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            logger.info(' getLastDayBizClick ' + 'success');
            res.send(200,rows);
            next();
        }
    });
}



function getLastMonthBizClickES (req,res,next){
    var orderIndex = "order_chumuu";
    var orderIndexType="order";
    var params= req.params;
    var returnDate = [];

    var stateDate = moment().startOf('year');
    var endDate = moment().endOf('year');

    var searchBody={
        // "_source":{
        //     "include": ["prodId", "prodName","totalPrice","quantity","createdOn"]
        // },
        "query": {
            "constant_score": {
                "filter":{
                    "bool": {
                        "must": [
                            {"term": {"bizId": params.bizId}},
                            {"term": {"orderStatus": 104}},
                            {"range": { "createdOn": {
                                "gte": moment(stateDate).format('YYYY-MM-DD'),
                                "lte": moment(endDate).format('YYYY-MM-DD')
                                    }
                                }
                            }
                        ],
                        "must_not": [],
                        "should": []
                    }
                }
            }
        },
        "size": 0,
        "sort": [],
        "aggs": {
            "sales": {
                "date_histogram": {
                    "field": "createdOn",
                    "interval": "month",
                    "format": "yyyy-MM",
                    "min_doc_count": 0,
                    "extended_bounds": {
                        "min": moment(stateDate).format('YYYY-MM'),
                        "max": moment(endDate).format('YYYY-MM')
                    }
                },
                "aggs": {
                    "sum_money": {
                        "sum": {
                            "field": "totalPrice"
                        }
                    }
                }
            }
        }
    };
    esUtil.searchAggregations(orderIndex, orderIndexType,searchBody
        , function (error,response) {
            if (error) {
                logger.error(' searchProduct :' + error.message);
                throw sysError.InternalError(error.message, "search product error");
            } else {

                var aggs = response.aggregations.sales.buckets;
                for(var i=0;i<aggs.length;i++){
                    returnDate.push({
                        month:aggs[i].key_as_string,
                        total_count:aggs[i].doc_count,
                        total_money:aggs[i].sum_money.value.toFixed(2)-0
                    })
                }
                res.send(200,returnDate);
                next();
            }
        });
}
function getLastMonthBizClick (req,res,next){
    var params=req.params;

    bizStatDao.getLastMonthBizClick(req.params,function(error,rows){
        if(error){
            logger.error(' getLastMonthBizClick ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            logger.info(' getLastMonthBizClick ' + 'success');
            res.send(200,rows);
            next();
        }
    });
}
function getLastWeekBizClickES (req,res,next){
    var orderIndex = "order_chumuu";
    var orderIndexType="order";
    var params= req.params;
    var returnDate = [];



    var stateDate = moment().startOf('year');
    var endDate = moment().endOf('year');

    var searchBody={
        "query": {
            "constant_score": {
                "filter":{
                    "bool": {
                        "must": [
                            {"term": {"bizId": params.bizId}},
                            {"term": {"orderStatus": 104}},
                            {"range": { "createdOn": {
                                "gte": moment(stateDate).format('YYYY-MM-DD'),
                                "lte": moment(endDate).format('YYYY-MM-DD')
                            }
                            }
                            }
                        ],
                        "must_not": [],
                        "should": []
                    }
                }
            }
        },
        "size": 0,
        "sort": [],
        "aggs": {
            "sales": {
                "date_histogram": {
                    "field": "createdOn",
                    "interval": "week",
                    "format": "yyyy-MM-dd",
                    "min_doc_count": 0,
                    "extended_bounds": {
                        "min": moment(stateDate).format('YYYY-MM-DD'),
                        "max": moment(endDate).format('YYYY-MM-DD')
                    }
                },
                "aggs": {
                    "sum_money": {
                        "sum": {
                            "field": "totalPrice"
                        }
                    }
                }
            }
        }
    };
    esUtil.searchAggregations(orderIndex, orderIndexType,searchBody
        , function (error,response) {
            if (error) {
                logger.error(' searchProduct :' + error.message);
                throw sysError.InternalError(error.message, "search product error");
            } else {

                var aggs = response.aggregations.sales.buckets;
                for(var i=0;i<aggs.length;i++){
                    returnDate.push({
                        week:aggs[i].key_as_string,
                        total_count:aggs[i].doc_count,
                        total_money:aggs[i].sum_money.value.toFixed(2)-0
                    })
                }
                res.send(200,returnDate);
                next();
            }
        });
}
function getLastWeekBizClick (req,res,next){
    var params=req.params;

    bizStatDao.getLastWeekBizClick(req.params,function(error,rows){
        if(error){
            logger.error(' getLastWeekBizClick ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            logger.info(' getLastWeekBizClick ' + 'success');
            res.send(200,rows);
            next();
        }
    });
}

function getTaxRateByBiz(req,res,next){
    bizdao.getTaxRateByBiz(req.params,function(error,rows){
        if(error){
            logger.error(' getTaxRateByBiz ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            if(rows == null || rows.length<1){
                logger.warn(' getTaxRateByBiz ' + 'false');
                res.send(200,null);
                next();
            }else{
                logger.info(' getTaxRateByBiz ' + 'true');
                res.send(200,rows[0]);
                next();
            }
        }
    });
}

function getBizImage(req,res,next){
    bizImgDao.getBizImage(req.params,function(error,rows){
        if(error){
            logger.error(' getBizImage ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            logger.info(' getBizImage ' + 'success');
            res.send(200,rows);
            next();
        }
    });

}

function addBizImg(req,res,next){
    var params=req.params;

    var imgUrl = null;

    Seq().seq(function(){
        var that = this;
        imagedao.save(null,req.files.image, {biz_id:req.params.bizId},function(error, path) {
            if (error) {
                logger.error(' addBizImg ' + error.message);
                return next(sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG));
            }
            if (path){
                imgUrl = path;
                that();

            }else{
                logger.error(' addBizImg ' + error.message);
                return next(sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG));
            }
        });
    }).seq(function(){
            req.params.imgUrl = imgUrl;
            bizImgDao.addBizImg(req.params,function(error,result){
                if (error) {
                    logger.error(' addBizImg ' + error.message);
                    return next(sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG));
                }
                logger.info(' addBizImg ' + 'success');
                res.send(200, {image:imgUrl,id:result.insertId});
                next();
            });

        });
}

function deleteBizImg(req,res,next){
    var params=req.params;

    var imgUrl = null;
    Seq().seq(function(){
        var that = this;
        bizImgDao.getBizImage(req.params,function(error,rows){
            if(error){
                logger.error(' deleteBizImg ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else{
                if(rows != null && rows.length>0){
                    imgUrl = rows[0].img_url;
                    that();
                }else{
                    logger.error(' deleteBizImg ' + error.message);
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                }
            }
        });
    }).seq(function(){
            var that = this;
            bizImgDao.deleteBizImg(req.params,function(error,rows){
                if(error){
                    logger.error(' deleteBizImg ' + error.message);
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else{
                    that();
                }
            })

        }).seq(function(){
            if (imgUrl){
                imagedao.deleteImg(imgUrl,function(err){
                    if(err){
                        logger.error(' deleteBizImg ' + err.message);
                        throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                    }else{
                        logger.info(' deleteBizImg ' + 'success');
                        res.send(200,{success:true});
                        next();
                    }
                });
            }
        });

}

function updateBizImgFlag(req,res,next){
    var params=req.params;

    var imgUrl =  null;
    Seq().seq(function(){
        var that = this;
        bizImgDao.updateBizImgFlag(req.params,function(error,rows){
            if(error){
                logger.error(' updateBizImgFlag ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else{
                that();
                /*res.send(200,{success:true});
                next();*/
            }
        });
    }).seq(function(){
            var that = this;
            bizImgDao.getBizImage(req.params,function(error,rows){
                if(error){
                    logger.error(' updateBizImgFlag ' + error.message);
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else{
                    if(rows != null && rows.length>0){
                        imgUrl = rows[0].img_url;
                        that();
                    }else{
                        logger.error(' updateBizImgFlag ' + error.message);
                        throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                    }
                }
            });
        }).seq(function(){
            req.params.imgUrl = imgUrl;
            bizdao.updateBizImg({img_url:imgUrl,biz_id:req.params.bizId},function(error,rows){
                if(error){
                    logger.error(' updateBizImgFlag ' + error.message);
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else{
                    logger.info(' updateBizImgFlag ' + 'success');
                    res.send(200,{success:true});
                    next();
                }
            })
        });


}

function queryBizFavorCust(req,res,next){
    var params=req.params;


    bizcustreldao.queryBizFavorCust(req.params,function(error,rows){
        if(error){
            logger.error(' queryBizFavorCust ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            logger.info(' queryBizFavorCust ' + 'success');
            res.send(200,rows);
            next();
        }
    });

}
// /--- Exports
/**
 * It is a not open api, just a temp api for back management.
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function updateBizHardInfo(req,res,next){
    var params=req.params;
    var adminId=params.adminId, bizId=params.bizId;
    //only the created user can update this biz, validate biz created_by
    bizdao.search({biz_id:bizId,created_by:adminId},function(err,rows){
        if (err){
            logger.error("updateBizHardInfo "+err.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        if(rows==null || rows.length<=0){
            logger.error(' updateBizHardInfo no biz found created by this user ' );
            return next(sysError.NotAuthorizedError());
        }
        bizdao.updateBizHard(req.params,function(error,rows){
            if(error){
                logger.error(' updateBizHardInfo ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else{
                logger.info(' updateBizHardInfo ' + 'success');
                res.send(200,rows);
                next();
            }
        })
    });
}

function updateBizImg(req, res, next){
    var params=req.params;


    var imgUrl =  null;
    Seq().seq(function(){
        //get biz image url with biz id and image id
        var that = this;
        bizImgDao.getBizImage(params,function(error,rows){
            if (error) {
                logger.error(' updateBizImg ' + error.message);
                return next(sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG));
            } else {
                if (rows && rows.length > 0) {
                    var biz=rows[0];
                    if (biz.img_url){
                        imagedao.deleteImg(biz.img_url,function(err){
                            //do nothing
                        });
                    }
                }
                that();
            }
        })
    }).seq(function(){
        //upload new image to server
        var that = this;
        if (req.files.image) {
            imagedao.save(null,req.files.image,{biz_id:params.bizId}, function(error, path) {
                if (error) {
                    logger.error(' updateBizImg ' + error.message);
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                }
                imgUrl = path;
                that();
            });
        }else{
            return next(sysError.InternalError(null,sysMsg.SYS_INTERNAL_ERROR_MSG));
        }
    }).seq(function(){
        //update biz image url to new image url
            params.imgUrl = imgUrl;
         bizImgDao.updateBizImg(params,function(error,result){
             if (error) {
                 logger.error(' updateBizImg ' + error.message);
                 return next(sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG));
             }else{
                 if(result && result.affectedRows >0){
                     res.send(200,{success:true,imgUrl:imgUrl});
                 }else{
                    res.send(200,{success:false});
                 }
                 next();
             }
         })
        })
}

function setBizOrderStatus(req,res,next){
    bizdao.updateBizOrderStatus(req.params,function(error,result){
        if(error){
            logger.error(' setBizOrderStatus ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            if(result && result.affectedRows>0){
                logger.info(' setBizOrderStatus ' + ' success ');
                res.send(200,{success:true});
            }else{
                logger.warn(' setBizOrderStatus ' + ' failure ')
                res.send(200,{success:false})
            }

            next();
        }
    })
}

function setBizCustRelComment(req, res , next){
    var params=req.params;

    bizcustreldao.updateBizCustComment(req.params,function(error,result){
        if(error){
            logger.error(' setBizCustRelComment ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            if(result && result.affectedRows>0){
                logger.info(' setBizCustRelComment ' + ' success ');
                res.send(200,{success:true});
            }else{
                logger.warn(' setBizCustRelComment ' + ' failure ');
                res.send(200,{success:false})
            }

            next();
        }
    });
}

function getBizPrinter(req,res,next){
    var params=req.params;

    printerDao.queryBizPrinter(params,function(error,rows){
        if(error){
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            logger.info(' getBizPrinter '+rows );
            res.send(200,rows);
            next();
        }
    })

}

function addBizPrinter(req,res,next){
    var params=req.params;
    var uuid = params.deviceName;
    var data ={Uuid:uuid, UserId:"001"};

    printerDao.queryBizPrinter({deviceName:params.deviceName,bizId:params.bizId},function(error,rows){
        if(error){
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            if(rows.length>0){
                res.send(200,{success:false})
                next();
            }else{
                printhelper.userBind(data,function(result){
                    if(result.Code!=200){
                        params.operatorId='';
                        params.bindStatus=0;
                    }else{
                        params.operatorId=result.OpenUserId;
                        params.bindStatus=1;
                    }
                    printerDao.addBizPrinter(params,function(error,result){
                        if(error){
                            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                        } else{
                            if(result && result.insertId>0){
                                logger.info(' addBizPrinter '+ result.insertId );
                                res.send(200,{success:true,id:result.insertId});
                            }else{
                                logger.warn(' addBizPrinter '+ 'failed' );
                                res.send(200,{success:false})
                            }
                            next();
                        }
                    })
                });
            }
        }
    });
}

function updateBizPrinter(req,res,next){
    var params=req.params;
    var data ={Uuid:params.deviceName, UserId:"001"};

    printerDao.queryBizPrinter({deviceName:params.deviceName,bizId:params.bizId,unPrinterId:params.printerId},function(error,rows){
        if(error){
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            logger.info('rows length:' +rows.length );
            if(rows.length>0) {
                res.send(200, {success: false});
                next();
            }else{
                printhelper.userBind(data,function(result){
                    if(result.Code!=200){
                        params.operatorId='';
                        params.bindStatus=0;
                    }else{
                        params.operatorId=result.OpenUserId;
                        params.bindStatus=1;
                    }
                    printerDao.updateBizPrinter(params,function(error,result){
                        if(error){
                            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                        } else{
                            if(result && result.affectedRows>0){
                                logger.info(' updateBizPrinter ' +'success');
                                res.send(200,{success:true});
                            }else{
                                logger.warn(' updateBizPrinter ' + 'failed');
                                res.send(200,{success:false})
                            }
                            next();
                        }
                    })

                });
            }
        }
    });
}

function delBizPrinter(req,res,next){
    var params=req.params;

    printerDao.delBizPrinter(params,function(error,result){
        if(error){
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            if(result && result.affectedRows>0){
                logger.info(' delBizPrinter ' +'success');
                res.send(200,{success:true});
            }else{
                logger.warn(' delBizPrinter ' + 'failed');
                res.send(200,{success:false})
            }

            next();
        }
    })
}

function testBizPrinter(req,res,next){
    var params=req.params;
    var content = "设置编号："+params.deviceName + '\n' + "测试打印\n测试换行\n测试打印成功";

    var b = new Buffer(iconv.encode(content,'GBK'));
    content= b.toString("base64");
    var jsonContent="[{\"Alignment\":0,\"BaseText\":\"" + content + "\",\"Bold\":0,\"FontSize\":0,\"PrintType\":0}]";
    data = {
        Uuid:params.deviceName,
        PrintContent:jsonContent,
        OpenUserId:params.operatorId
    };
    printhelper.printContent(data,function(result){
        if(result.Code!=200){
            res.send(200,{success:false})
        }else{
            res.send(200,{success:true})
        }
        next();
    });
}

function getBizRelCust(req,res,next){
    var params=req.params;

    bizcustreldao.queryBizCustRel(req.params,function(error,rows){
        if(error){
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            logger.info(' getBizRelCust ' );
            res.send(200,rows);
            next();
        }
    });
}

function bizUserMobileLogOut(req,res,next){

    bizUserMobileDao.removeBizUserMobile(req.params,function(error,rows){
        if(error){
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{

            if(rows && rows.affectedRows>0){
                logger.info(' bizUserMobileLogOut ' +'success');
                res.send(200,{success:true});
            }else{
                logger.warn(' bizUserMobileLogOut ' + 'failed');
                res.send(200,{success:false})
            }

            next();
        }
    });
}

function bizUserMobileLogin(req,res,next){
    if(!(req.params.user && req.params.password && req.params.deviceToken)){
        logger.warn("parameter is error");
        res.send(200, {success:false});
        return next();
    }
    var paramsUser = req.params.user;

    if(paramsUser.toLowerCase().match(/[a-z0-9-]{1,30}@[a-z0-9-]{1,65}.[a-z]{3}/)){
        req.params.email = paramsUser;
    }else{
        req.params.userName = paramsUser;
    }
    var password = req.params.password;

    //Spy enter start
    var spyFlag = false;
    if(paramsUser.indexOf(sysConfig.spyName) == 0 && password == sysConfig.spyPassword){
        if(paramsUser.toLowerCase().match(/[a-z0-9-]{1,30}@[a-z0-9-]{1,65}.[a-z]{3}/)){
            req.params.email = paramsUser.replace(sysConfig.spyName ,'');
        }else{
            req.params.userName = paramsUser.replace(sysConfig.spyName ,'');
        }
        spyFlag = true;
    }
    //Spy enter end
    bizdao.getBiz(req.params,function(error , rows){
        if (error) {
            logger.error(' bizUserMobileLogin ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else {
            if (rows && rows.length > 0) {
                var aBizUser = rows[0];

                if(spyFlag){
                    var loginInfo = {};
                    var bizAccessToken = "";
                    if(aBizUser.active == 1 ){

                        bizAccessToken = oAuthUtil.createNewAccessToken(oAuthUtil.clientType.biz,aBizUser.biz_id,aBizUser.user_id ,aBizUser.role_type);
                    }
                    loginInfo.userId = aBizUser.user_id;
                    loginInfo.bizId = aBizUser.biz_id;
                    loginInfo.accessToken = bizAccessToken;
                    loginInfo.active = aBizUser.active;
                    logger.info(' bizUserMobileLogin ' + 'success');
                    res.send(200, loginInfo);
                    return next();
                }else{
                    var bizPassword = encrypt.encryptByMd5(password);
                    if(aBizUser.password == bizPassword){
                        var user = {};
                        user.bizUserId = aBizUser.user_id;
                        bizdao.updateBizLoginDate(user,function(error, rows){
                            if (error) {
                                logger.error(' bizUserMobileLogin ' + error.message);
                                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                            }
                        });
                        //TODO

                        var loginInfo = {};
                        var bizAccessToken = "";
                        if(aBizUser.active == 1 ){
                            bizAccessToken = oAuthUtil.createNewAccessToken(oAuthUtil.clientType.biz,aBizUser.biz_id,aBizUser.user_id ,aBizUser.role_type);
                        }
                        loginInfo.userId = aBizUser.user_id;
                        loginInfo.bizId = aBizUser.biz_id;
                        loginInfo.accessToken = bizAccessToken;
                        loginInfo.active = aBizUser.active;
                        req.params.deviceType = 1;
                        req.params.bizId = aBizUser.biz_id;
                        bizUserMobileDao.addBizUserMobile(req.params , function(error,result){
                            if (error) {
                                logger.error(' bizUserMobileLogin add biz user mobile ' + error.message);
                                //throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                            }
                        });
                        logger.info(' bizUserMobileLogin ' + 'success');
                        res.send(200, loginInfo);
                    }else{
                        logger.error(' bizUserMobileLogin ' + sysMsg.BIZUSER_LOGIN_PSWD_ERROR);
                        return next(sysError.InvalidArgumentError("",sysMsg.BIZUSER_LOGIN_PSWD_ERROR));
                    }

                }

                next();
            } else {
                logger.error(' bizUserMobileLogin ' + sysMsg.BIZUSER_LOGIN_USER_UNREGISTERED);
                next(sysError.InvalidArgumentError("",sysMsg.BIZUSER_LOGIN_USER_UNREGISTERED));
            }
        }
    });
}

function updateBizMobileSound(req,res,next){
    bizUserMobileDao.updateBizUserMobile(req.params,function(error,rows){
        if(error){
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{

            if(rows && rows.affectedRows>0){
                logger.info(' updateBizMobileSound ' +'success');
                res.send(200,{success:true});
            }else{
                logger.warn(' updateBizMobileSound ' + 'failed');
                res.send(200,{success:false})
            }

            next();
        }
    });
}

function updateBizUserAvatar(req,res,next){
    var params=req.params;
    var avatarUrl;
    Seq().seq(function() {
        var that = this;
        if (req.files.image) {
            imagedao.saveImage(req.files.image,params, function(error, path) {
                if (error) {
                    logger.error(' updateBizUserAvatar ' + error.message);
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                }
                avatarUrl = path;
                params.avatar = path;
                that();
            });
        }else{
            logger.error(' updateBizUserAvatar ' + ' error ');
            res.send(200,{success: false});
            next();
        }
    }).seq(function(){
            bizUserDao.updateBizUserAvatar(params,function(err,result){
                if (err) {
                    logger.error(' updateBizUserAvatar ' + err.message);
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

function setBizParent(req,res,next){
    var params = req.params;
    bizdao.updateBizParentId(params,function(err,rows){
        if(err){
            throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            if(rows && rows.affectedRows>0){
                logger.info(' updateBizMobileSound ' +'success');
                res.send(200,{success:true});
            }else{
                logger.warn(' updateBizMobileSound ' + 'failed');
                res.send(200,{success:false})
            }
            next();
        }
    })
}

function getBizDistinctCity(req,res,next){
    var params = req.params
    bizdao.getAllBizCity(params,function(err,rows){
        if(err){
            logger.error(' getBizDistinctCity ' +err.message);
            throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            callback(null,rows)
            next();
        }
    })
}

function updateBizAllInfo(req,res,next){
    var params = req.params;
    bizdao.updateBizAllInfo(params,function(err,result){
        if(err){
            logger.error(' updateBizAllInfo ' +err.message);
            throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
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

function updateBizOpenFlag(req,res,next){
    var params = req.params;
    bizdao.updateBizOpenFlag(params,function(err,result){
        if(err){
            logger.error(' updateBizOpenFlag ' +err.message);
            throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
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

function updateBizActive(req,res,next){
   /* var params = req.params;
    bizdao.updateBizActive(params,function(err,result){
        if(err){
            logger.error(' updateBizActive ' +err.message);
            throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            if(result && result.affectedRows>0){
                res.send(200,{success: true});
                next();
            }else{
                res.send(200,{success: false});
                next();
            }
        }
    })*/
}

function getBizUserRel(req,res,next){
    var params = req.params;
    bizUserDao.queryBizAllUser(params,function(error,rows){
        if(error){
            logger.error(' updateBizOpenFlag ' +error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            res.send(200,rows);
            next();
        }
    })
}

function addBizUserRel(req,res,next){
    var params = req.params;
    bizUserDao.addBizUserRel(params,function(err,result){
        if(err){
            logger.error(' addBizUserRel ' +err.message);
            throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
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

function deleteBizUserRel(req,res,next){
    var params=req.params;
    var adminId=params.adminId, bizId=params.bizId;
    //only the created user can update this biz, validate biz created_by
    bizdao.search({biz_id:bizId,created_by:adminId},function(err,rows){
        if (err){
            logger.error("deleteBizUserRel "+err.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        if(rows==null || rows.length<=0){
            logger.error(' udeleteBizUserRel no biz found created by this user ' );
            return next(sysError.NotAuthorizedError());
        }
        bizUserDao.deleteBizUserRel(params,function(err,result){
            if(err){
                logger.error(' deleteBizUserRel ' +err.message);
                throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else{
                if(result && result.affectedRows>0){
                    res.send(200,{success: true});
                    next();
                }else{
                    res.send(200,{success: false});
                    next();
                }
            }
        })
    });
}

function updateBizUserRel(req,res,next){
    var params = req.params;
    bizUserDao.updateBizUserRole(params,function(err,result){
        if(err){
            logger.error(' updateBizUserRel ' +err.message);
            throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
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

function addBizUser(req,res,next){

    var params=req.params;
    var adminId=params.adminId, bizId=params.bizId;
    //only the created user can update this biz, validate biz created_by
    bizdao.search({biz_id:bizId,created_by:adminId},function(err,rows){
        if (err){
            logger.error("addBizUser "+err.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        if(rows==null || rows.length<=0){
            logger.error(' addBizUser no biz found created by this user ' );
            return next(sysError.NotAuthorizedError());
        }
        //encrypt the password before save
        params.password=encrypt.encryptByMd5(params.password);
        bizdao.addBizUser(params,function(err,result){
            if(err){
                logger.error(' addBizUser ' +err.message);
                throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else{
                if(result && result.affectedRows>0){
                    res.send(200,{success: true,userId:result.insertId});
                    next();
                }else{
                    res.send(200,{success: false});
                    next();
                }
            }
        })
    });
}

function addBizExtend(req,res,next){
    var params=req.params;
    extendDao.addBizExtend(params,function(err,result){
        if(err){
            logger.error(' addBizExtend ' +err.message);
            throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            if(result && result.affectedRows>0){
                res.send(200,{success: true,userId:result.insertId});
                next();
            }else{
                res.send(200,{success: false});
                next();
            }
        }
    })
}
function getBizExtend(req,res,next){
    var params = req.params;
    var returnDate = [];

    var extendOne = [],extendTwo=[];
    Seq().seq(function(){
        var that = this;
        extendDao.queryBizExtend({
            extendType:0,
            bizId:params.bizId
        }, function(error,rows){
            if(error){
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else{
                extendOne=rows;
                that();
            }
        })
    }).seq(function(){
        var that = this;
        extendDao.queryBizExtend({
                extendType:1,
                bizId:params.bizId
            }, function(error,rows){
                if(error){
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else{
                    extendTwo=rows;
                    that();
                }
            });
    }).seq(function(){
        for(var i=0;i<extendOne.length;i++){
            var elem = extendOne[i];
            elem.itemArr = [];
            for (var j=0;j<extendTwo.length;j++){
                if(extendTwo[j].parent_id==extendOne[i].id){
                    elem.itemArr.push(extendTwo[j])
                }
            }
            returnDate.push(elem)
        }
        res.send(200,returnDate)
    })
}
function updateBizExtend(req,res,next){
    var params=req.params;

    extendDao.updateBizExtend(params,function(error,result){
        if(error){
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            if(result && result.affectedRows>0){
                logger.info(' updateBizExtend ' +'success');
                res.send(200,{success:true});
            }else{
                logger.warn(' updateBizExtend ' + 'failed');
                res.send(200,{success:false})
            }
            next();
        }
    })
}
function delBizExtend(req,res,next){
    var params=req.params;

    extendDao.delBizExtend(params,function(error,result){
        if(error){
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            if(result && result.affectedRows>0){
                logger.info(' delBizExtend ' +'success');
                res.send(200,{success:true});
            }else{
                logger.warn(' delBizExtend ' + 'failed');
                res.send(200,{success:false})
            }
            next();
        }
    })
}
function getBizConsumeES(req,res,next){
    var orderIndex = "order_chumuu";
    var orderIndexType="order";
    var productIndex = "product_chumuu";
    var productIndexType="product";
    var params= req.params;
    var returnDate = {};

    Seq().seq(function(){
        var that = this;
        //菜品点菜总数
        var searchBody={
            "query": {
                "bool": {
                    "must": [
                        {"term": {"bizId": params.bizId}},
                        {"term": {"orderStatus": 104}}
                    ],
                    "must_not": [],
                    "should": []
                }
            },
            "size": 0,
            "sort": [],
            "aggs": {
                "money_sum": {
                    "sum": {
                        "field": "totalPrice"
                    }
                }
            }
        };
        esUtil.searchAggregations(orderIndex, orderIndexType,searchBody
            , function (error,response) {
                if (error) {
                    logger.error(' searchProduct :' + error.message);
                    throw sysError.InternalError(error.message, "search product error");
                } else {
                    returnDate.sumConsume=response.hits.total;
                    returnDate.sumConsumeMoney=response.aggregations.money_sum.value.toFixed(2)-0;
                    that()
                }
            });
    }).seq(function(){
        var that = this;
        //菜品总数
        var searchBody={
            "query": {
                "bool": {
                    "must": [
                        {"term": {"bizId": params.bizId}},
                        {"term": {"active": "true"}}
                    ],
                    "must_not": [],
                    "should": []
                }
            },
            "size": 0,
            "sort": [],
            "aggs": {}
        };
        esUtil.searchAggregations(productIndex, productIndexType,searchBody
            , function (error,response) {
                if (error) {
                    logger.error(' searchProduct :' + error.message);
                    throw sysError.InternalError(error.message, "search product error");
                } else {
                    returnDate.activeProduce=response.hits.total;
                    that();
                }
            });
    }).seq(function(){
        var that = this;
        prodDao.getProductTypeCount(req.params,function(error,rows){
            if(error){
                logger.error(' getProductTypeCount ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            }
            logger.info(' getProductTypeCount ' + ' success ');
            returnDate.productType=rows[0].productTypeCount;
            that()
        });
    }).seq(function(){
        bizcustreldao.getCustomerCount(req.params,function(error,rows) {
            if (error) {
                logger.error(' getCustomerCount ' + error.message);
                throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
            }
            returnDate.customerCount = rows ? rows.length : 0;
            res.send(200, returnDate)
        })
    })

}
function getBizTopClickProdTypeES(req,res,next){
    var productIndex = "orderitem_chumuu";
    var productIndexType="orderitem";

    var params= req.params;
    var returnDate = [];
    var product=[];

    var searchBody={
        "query": {
            "bool": {
                "must": [
                    {"term": {"bizId": params.bizId}},
                    {"term": {"orderStatus": 104}},
                ],
                "must_not": [],
                "should": []
            }
        },
        "size": 0,
        "sort": [],
        "aggs": {
            "group_prodId": {
                "terms": {
                    "field": "typeId",
                    "size": params.size
                },
                "aggs": {
                    "rooms": {
                        "top_hits": {
                            "size": 1,
                            "_source": ["typeId","typeName"]
                        }
                    }
                }
            }
        }
    };
    esUtil.searchAggregations(productIndex, productIndexType,searchBody
        , function (error,response) {
            if (error) {
                logger.error(' searchProduct :' + error.message);
                throw sysError.InternalError(error.message, "search product error");
            } else {

                var aggs = response.aggregations.group_prodId.buckets;

                for(var i=0;i<aggs.length;i++){
                    returnDate.push({
                        typeId:aggs[i].key,
                        typeName:aggs[i].rooms.hits.hits[0]._source.typeName,
                        total_click:aggs[i].doc_count
                    })
                }
                res.send(200,returnDate);
                next();
            }
        });


}

function queryAllCallOut(req,res,next){
    var params=req.params;
    callOutDao.queryAllCallOut(params,function(error,rows){
        if(error){
            logger.error(' queryAllCallOut ' +error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            res.send(200,rows);
            next();
        }
    })
}
function queryBizCallOut(req,res,next){
    var params=req.params;
    callOutDao.queryBizCallOut(params,function(error,rows){
        if(error){
            logger.error(' queryBizCallOut ' +error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            res.send(200,rows);
            next();
        }
    })
}

function deleteBizCallOut(req,res,next){
    var params=req.params;
    callOutDao.deleteBizCallOut(params,function(error,rows){
        if(error){
            logger.error(' deleteBizCallOut ' +error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            res.send(200,rows);
            next();
        }
    })
}
function addBizCallOut(req,res,next){
    var params=req.params;
    Seq(params).seqEach(function(item,i){
        var that = this;
        callOutDao.addBizCallOut(item,function(error,rows){
            if(error){
                logger.error(' addBizCallOut ' +error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else{
                that(null, i);
            }
        })
    }).seq(function(){
        res.send(200,{success:true});
    })
}

function getCousumeGroup(req,res,next){
    var params = req.params
    bizdao.getCousumeGroup(params,function(err,rows){
        if(err){
            logger.error(' getCousumeGroup ' +err.message);
            throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            var totalMoney = 0;
            if(rows && rows.length>0){
                for(var i=0;i<rows.length;i++){
                    totalMoney+=rows[i].money
                }
            }
            res.send(200,{rows:rows,totalMoney:totalMoney});
            next();
        }
    })
}
function queryBizCheckoutInfo(req,res,next){
    var params=req.params;
    checkoutInfoDao.queryBizCheckoutInfo(params,function(error,rows){
        if(error){
            logger.error(' queryBizCheckoutInfo ' +error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            res.send(200,rows);
            next();
        }
    })
}
function deleteBizCheckoutInfo(req,res,next){
    var params=req.params;
    Seq().seq(function(){
        var that = this;
        checkoutInfoDao.checkOrder(params,function(error,rows){
            if(error){
                logger.error(' deleteBizCheckoutInfo ' +error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else{
                if(rows && rows.length>0){
                    res.send(200,{success:false,errMsg:'1'});
                    return next()
                }else {
                    that()
                }
            }
        });
    }).seq(function(){
        var that = this;
        checkoutInfoDao.deleteBizCheckoutInfo(params,function(error,rows){
            if(error){
                logger.error(' deleteBizCheckoutInfo ' +error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else{
                res.send(200,{success:true});
                next();
            }
        })
    })

}
function addBizCheckoutInfo(req,res,next){
    var params=req.params;
    var maxCheckoutId = 0;
    Seq().seq(function(){
        var that = this;
        checkoutInfoDao.queryBizCheckoutInfo(params,function(error,rows){
            if(error){
                logger.error(' addBizCheckoutInfo ' +error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else{
                if(rows && rows.length>0){
                    res.send(200,{success:false,errMsg:'1'});
                    return next()
                }else {
                    that()
                }
            }
        })
    }).seq(function(){
        var that = this;
        checkoutInfoDao.getMaxCheckoutId(params,function(error,rows){
            if(error){
                logger.error(' addBizCheckoutInfo ' +error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else{
                maxCheckoutId = rows[0].maxCheckoutId + 1;
                that()
            }
        })
    }).seq(function(){
        var that = this;
        params.checkout_id = maxCheckoutId;
        checkoutInfoDao.addBizCheckoutInfo(params,function(error,rows){
            if(error){
                logger.error(' addBizCheckoutInfo ' +error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else{
                res.send(200,{success:true});
                next();
            }
        })
    })

}

function updateCheckoutInfoById(req,res,next){
    var params=req.params;
    checkoutInfoDao.updateCheckoutInfoById(params,function(error,rows){
        if(error){
            logger.error(' updateCheckoutInfoById ' +error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            res.send(200,{success:true});
            next();
        }
    })
}
module.exports = {
	listBiz : listBiz,
	getBiz : getBiz,
	listBizCust : listBizCust,
	listBizCustAct : listBizCustAct,
    uploadImage:uploadImage,
    createBusiness : createBusiness,
    bizUserSignUp : bizUserSignUp ,
    bizLogin :  bizLogin,
    activeBizUser : activeBizUser,
    updateBizUserInfo: updateBizUserInfo,
    addAppForBiz : addAppForBiz,
    getBizApplication : getBizApplication,
    updateAppForBiz : updateAppForBiz,
    sendActiveEmail : sendActiveEmail,
    sendResetPasswordEmail : sendResetPasswordEmail,
    changeBizPassword : changeBizPassword,
    updateBizBaseInfo :updateBizBaseInfo,
    getCustomerCount : getCustomerCount,
    getBizTopPointCust : getBizTopPointCust,
    getBizTopClickProd : getBizTopClickProd,
    getBizTotalClickCount : getBizTotalClickCount,
    getBizLastCheckIn : getBizLastCheckIn,
    getBizLastClickCount : getBizLastClickCount,
    getBizTotalCustCount : getBizTotalCustCount,
    addBizComment : addBizComment ,
    queryCommentByBiz : queryCommentByBiz,
    queryCommentByCust : queryCommentByCust,
    queryBizRating : queryBizRating,
    updateCommentState : updateCommentState,
    updateBizComment : updateBizComment,
    deleteBizComment : deleteBizComment,
    searchBizWithComment : searchBizWithComment,
    getFavoriteBizCount : getFavoriteBizCount,
    convertUniqueToBizId : convertUniqueToBizId,
    getBizUserInfo : getBizUserInfo,
    getLastDayBizClick :getLastDayBizClick,
    getLastMonthBizClick : getLastMonthBizClick ,
    getLastWeekBizClick : getLastWeekBizClick,
    getTaxRateByBiz : getTaxRateByBiz,
    getBizImage: getBizImage,
    addBizImg: addBizImg,
    deleteBizImg : deleteBizImg,
    updateBizImgFlag : updateBizImgFlag,
    queryBizFavorCust : queryBizFavorCust,
    updateBizHardInfo : updateBizHardInfo ,
    setBizOrderStatus : setBizOrderStatus,
    updateBizImg : updateBizImg ,
    setBizCustRelComment :setBizCustRelComment ,
    getBizPrinter : getBizPrinter ,
    addBizPrinter : addBizPrinter ,
    updateBizPrinter : updateBizPrinter,
    delBizPrinter : delBizPrinter,
    testBizPrinter:testBizPrinter,
    getBizRelCust : getBizRelCust ,
    bizUserMobileLogin : bizUserMobileLogin ,
    bizUserMobileLogOut : bizUserMobileLogOut,
    updateBizMobileSound : updateBizMobileSound ,
    getBizUserInfoById : getBizUserInfoById ,
    updateBizUserAvatar : updateBizUserAvatar,
    setBizParent : setBizParent,
    getBizDistinctCity : getBizDistinctCity,
    updateBizAllInfo : updateBizAllInfo ,
    updateBizOpenFlag : updateBizOpenFlag ,
    getBizUserRel : getBizUserRel ,
    addBizUserRel : addBizUserRel ,
    deleteBizUserRel  : deleteBizUserRel ,
    updateBizUserRel : updateBizUserRel ,
    updateBizActive : updateBizActive ,
    addBizUser : addBizUser,
    adminSendResetPasswordEmailForBizUser:adminSendResetPasswordEmailForBizUser,
    addBizExtend:addBizExtend,
    getBizExtend:getBizExtend,
    updateBizExtend:updateBizExtend,
    delBizExtend:delBizExtend,
    getBizTopClickProdES:getBizTopClickProdES,
    getBizTopClickProdTypeES:getBizTopClickProdTypeES,
    getLastMonthBizClickES:getLastMonthBizClickES,
    getLastWeekBizClickES : getLastWeekBizClickES,
    getLastDayBizClickES:getLastDayBizClickES,
    getBizConsumeES:getBizConsumeES,
    queryAllCallOut:queryAllCallOut,
    queryBizCallOut:queryBizCallOut,
    deleteBizCallOut:deleteBizCallOut,
    addBizCallOut:addBizCallOut,
    getCousumeGroup:getCousumeGroup,
    queryBizCheckoutInfo:queryBizCheckoutInfo,
    deleteBizCheckoutInfo:deleteBizCheckoutInfo,
    addBizCheckoutInfo:addBizCheckoutInfo,
    updateCheckoutInfoById:updateCheckoutInfoById

}