/**
 * Created by ling xue on 15-12-23.
 */
var sysMsg = require('./util/SystemMsg.js');
var sysError = require('./util/SystemError.js');
var encrypt = require('./util/Encrypt.js');
var Seq = require('seq');
var listOfValue = require('./util/ListOfValue.js');
var oAuthUtil = require('./util/OAuthUtil.js');
var adminUserDao = require('./dao/AdminUserDAO.js');
var serverLogger = require('./util/ServerLogger.js');
var logger = serverLogger.createLogger('admin.js');
//liling
var fs = require("fs");


function adminUserLogin(req,res,next){
    var params = req.params;

    adminUserDao.queryAdminUser(params,function(error,rows){
        if (error) {
            logger.error(' adminUserLogin ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else {
            if(rows && rows.length<1){
                logger.warn(' adminUserLogin ' +params.username+ sysMsg.ADMIN_LOGIN_USER_UNREGISTERED);
                //res.send(200, {success:false,errMsg:sysMsg.ADMIN_LOGIN_USER_UNREGISTERED});
                res.send(200,{success:false,msg:sysMsg.ADMIN_LOGIN_USER_UNREGISTERED});
                return next();
            }else{
                var passwordMd5 = encrypt.encryptByMd5(params.password);
                if(passwordMd5 != rows[0].password){
                    logger.warn(' adminUserLogin ' +params.phone+ sysMsg.CUST_LOGIN_PSWD_ERROR);
                    res.send(200, {success:false,errMsg:sysMsg.CUST_LOGIN_PSWD_ERROR});
                    return next();

                }else{
                    if(rows[0].admin_status == listOfValue.ADMIN_USER_STATUS_NOT_ACTIVE){
                        //Admin User status is not verified return user id
                        var user = {
                            userId : rows[0].id,
                            userStatus : rows[0].admin_status
                        }
                        logger.info('adminUserLogin' +params.username+ " not verified");
                        res.send(200,user);
                        return next();
                    }else{
                        //admin user status is active,return token
                        var user = {
                            userId : rows[0].id,
                            userStatus : rows[0].admin_status
                        }
                        user.accessToken = oAuthUtil.createNewAccessToken(oAuthUtil.clientType.sa,user.userId);
                        logger.info('adminUserLogin' +params.username+ " success");
                        res.send(200,user);
                        return next();
                    }
                }
            }
        }
    })
}

function updateAdminInfo (req,res,next){
    var params = req.params;
    adminUserDao.updateInfo(params,function(error,result){
        if (error) {
            logger.error(' updateAdminInfo ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else {
            logger.info(' updateAdminInfo ' + 'success');
            if(result && result.affectedRows>0){
                res.send(200,{success : true});
            }else{
                res.send(200,{success : false,msg:errMsg});
            }
            return next();
        }
    })
}

function getAdminUserInfo(req,res,next){
    var params = req.params;
    adminUserDao.queryAdminUser(params,function(error,rows){
        if (error) {
            logger.error(' getAdminUserInfo ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else {
            if(rows && rows.length>0){
                logger.info(' getAdminUserInfo ' + 'success');
                rows[0].password = null;
                res.send(200,  rows[0]);
            }else{
                logger.warn(' getAdminUserInfo ' + 'false');
                res.send(200,  null);
            }
            return next();
        }
    })
}

function changeAdminPassword(req,res,next){
    var params = req.params;

    Seq().seq(function(){
        var that = this;
        adminUserDao.queryAdminUser(params,function(error,rows){
            if (error) {
                logger.error(' changeAdminPassword ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else {
                if(rows && rows.length<1){
                    logger.warn(' changeAdminPassword ' + sysMsg.ADMIN_LOGIN_USER_UNREGISTERED);


                    res.send(200, {success:false,errMsg:sysMsg.ADMIN_LOGIN_USER_UNREGISTERED});
                    return next();
                }else if(encrypt.encryptByMd5(params.originPassword) != rows[0].password){
                    logger.warn(' changeAdminPassword ' + sysMsg.CUST_ORIGIN_PSWD_ERROR);
                    res.send(200, {success:false,errMsg:sysMsg.CUST_ORIGIN_PSWD_ERROR});
                    return next();
                }else{
                    that();
                }
            }
        })
    }).seq(function(){
            params.password = encrypt.encryptByMd5(params.newPassword);
            adminUserDao.updatePassword(params,function(error,result){
                if (error) {
                    logger.error(' changeAdminPassword ' + error.message);
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    logger.info(' changeAdminPassword ' + 'success');
                    if(result && result.insertId){
                        res.send(200,{success : true,id:result.insertId});
                    }else{
                        res.send(200,{success : false,msg:sysMsg.SYS_INTERNAL_ERROR_MSG});
                    }
                    return next();
                }
            })
        })
}

//liling
function importFile(req, res, next){

    //Converter Class
    var mysql = require('mysql');
    var Converter=require("csvtojson").Converter;
    var paramsBizId=req.params;

    var csvFileName = req.files.image.path;
    var fileStream = fs.createReadStream(csvFileName);
//new converter instance
    var csvConverter=new Converter({constructResult:true});

    var target_biz_id = paramsBizId.bizId;
    var new_prod = true;
    var new_type = true;
    var product_type_id = 0 ;
    var product_id = 0;

    var new_type_count = 0;
    var new_prod_count = 0;
    var update_prod_count = 0;

    var menuIndex = 1;
    var new_type_obj = {};
    var new_prod_obj = {};

    var faileCase=[];
    var faileCaseIndex=0;

    var priceFaileCase=[];
    var priceFaileCaseIndex=0;

    //end_parsed will be emitted once parsing finished
    csvConverter.on("end_parsed",function(jsonObj){
        if (target_biz_id) {
            Seq(jsonObj).seqEach(function (obj, i) {
                var that = this;
                menuIndex++;
                Seq().seq(function () {
                    var that = this;
                    adminUserDao.getProdName({bizId: target_biz_id ,name:obj.name}, function (error, rows) {
                        if(error) {
                            logger.error(' getProdName ' + error.message);
                            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                        }else{
                            if (rows && rows.length>0) {
                                new_prod = false;
                                product_id = rows[0].prod_id;
                            }else{
                                new_prod = true;
                            }
                            that();
                        }
                    });
                }).seq(function () {
                    var that = this;
                    adminUserDao.getProdTypeName({bizId: target_biz_id , name:obj.type_name},  function(error , rows){
                        if(error){
                            logger.error(' getProdTypeName ' + error.message);
                            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                        }else{
                            if(rows && rows.length>0){
                                new_type = false;
                                product_type_id = rows[0].type_id;
                            }else{
                                new_type = true;
                            }
                            that();
                        }
                    });
                }).seq(function () {
                    var that = this;
                    if (new_type){
                        new_type_obj.name = obj.type_name;
                        new_type_obj.name_lang = obj.type_name_lang;
                        new_type_obj.bizId = target_biz_id;
                        if(obj.type_name){
                            adminUserDao.insertNewType(new_type_obj,function(error,result){
                                if (error){
                                    logger.error(' getProdName ' + error.message);
                                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                                } else {
                                    new_type_count++;
                                    product_type_id = result.insertId;
                                }
                                that();
                            });
                        }else{
                            that();
                        }
                    }
                    else
                        that();
                }).seq(function () {
                    var that = this;
                    new_prod_obj = obj;
                    new_prod_obj.type_id = product_type_id;
                    new_prod_obj.biz_id = target_biz_id;
                    if (new_prod) {//it`s a new production
                        if(obj.name && obj.type_name){
                            if(isNaN(obj.price) || obj.price === 0){
                                priceFaileCase[priceFaileCaseIndex]=menuIndex;//sysMsg.ADMIN_FAILED_INSERT_PRODUCT_ERROR + menuIndex +sysMsg.ADMIN_INPUT_DATA_PRICE_ERROR;
                                priceFaileCaseIndex++;
                                that();
                            }else{
                                adminUserDao.insertNewProd(new_prod_obj, function (error, result) {
                                    if (error) {
                                        logger.error(' getProdName ' + error.message);
                                        throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                                    }
                                    else {
                                        new_prod_count++;
                                    }
                                    that();
                                });
                            }
                            that();
                        }
                        else{
                            faileCase[faileCaseIndex]=menuIndex;//sysMsg.ADMIN_FAILED_INSERT_PRODUCT_ERROR + menuIndex + " due to content is empty!";
                            faileCaseIndex++;
                            that();
                        }
                    } else {

                        if(obj.name && obj.type_name){
                            if(isNaN(obj.price) || obj.price === 0){
                                priceFaileCase[priceFaileCaseIndex]=menuIndex;//sysMsg.ADMIN_FAILED_UPDATE_PRODUCT_ERROR + menuIndex + sysMsg.ADMIN_INPUT_DATA_PRICE_ERROR;
                                priceFaileCaseIndex++;
                                that();
                            }else{
                                new_prod_obj.prod_id = product_id;
                                adminUserDao.updateProd(new_prod_obj,function(error,result){
                                    if (error){
                                        logger.error(' getProdName ' + error.message);
                                        throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                                    }
                                    else {
                                        update_prod_count++;
                                    }
                                    that();
                                });
                            }
                            that();
                        }
                        else{
                            faileCase[faileCaseIndex]=menuIndex;//sysMsg.ADMIN_FAILED_UPDATE_PRODUCT_ERROR + menuIndex + " due to content is empty! ";
                            faileCaseIndex++;
                            that();
                        }
                    }
                }).seq(function(){
                    that(null, i);
                });
            }).seq(function(){
                res.send(200, {success:false, insertNewType:new_type_count, insertNewProd:new_prod_count,
                    updateProd:update_prod_count, faileCase:faileCase ,priceFaileCase:priceFaileCase});
            });
        }
    });
    fileStream.pipe(csvConverter);
}

module.exports = {
    adminUserLogin : adminUserLogin ,
    updateAdminInfo : updateAdminInfo ,
    changeAdminPassword : changeAdminPassword ,
    getAdminUserInfo  : getAdminUserInfo,
    //liling
    importFile : importFile
};