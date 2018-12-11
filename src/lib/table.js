/**
 * Created by ling xue on 14-11-5.
 */

var oAuthUtil = require('./util/OAuthUtil.js');
var sysMsg = require('./util/SystemMsg.js');
var sysError = require('./util/SystemError.js');
var tableDao = require('./dao/TableDao.js');
var custDao = require('./dao/custdao.js');
var tableQrDao = require('./dao/TableQrcodeDao.js');
var serverLogger = require('./util/ServerLogger.js');
var logger = serverLogger.createLogger('Table.js');
var encrypt = require('./util/Encrypt.js');
var randomString = require('random-string');
var Seq = require('seq');

function addBizTable(req,res ,next){
    var params=req.params;
    var bizId=params.bizId, tableId,tPhone, tPassword,ePassword;
    //random generate a password
    tPassword = randomString({
        length: 8,
        numeric: true,
        letters: true,
        special: false
    });
    params.pass=tPassword;
    Seq().seq(function() {
        var that=this;
        tableDao.addBizTable(params, function (error, result) {
            if (error) {
                logger.error(' addBizTable ' + error.message);
                if (error.message && error.message.indexOf('ER_DUP_ENTRY') >= 0) {
                    throw sysError.InternalError(error.message, sysMsg.SYS_TABLE_DUPLICATE_ERROR_MSG);
                } else {
                    throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                }

            } else {
                if (result.insertId && result.insertId > 0) {
                    logger.info(' addBizTable ' + ' success ');
                    tableId=result.insertId;
                    that();
                } else {
                    logger.warn(' addBizTable ' + ' failure');
                    res.send(200, {success: false});
                    return next();
                }
            }
        })
    }).seq(function(){
        var that=this;
        //add special customer for the table to make order
        //use unique table id to be phone number
        tPhone="t"+tableId;
        ePassword = encrypt.encryptByMd5(tPassword);
        custDao.create({password:ePassword,phone_no:tPhone,biz_id:bizId, table_id:tableId,active:1},function(error,result){
            if (error) {
                logger.error(' addUser ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else {
                if(result && result.insertId>0){
                    logger.info(' addTableUser ' + 'success');
                    that();
                }else{
                    logger.warn(' addTableUser ' + 'failed');
                    res.send(200,  {success:false,errMsg:sysMsg.SYS_INTERNAL_ERROR_MSG});
                    return next();
                }
            }
        })
    }).seq(function(){
        //link the table with QR code proxy
        var pickedSeq=params.tableQrSeq;
        tableQrDao.linkBizTable({tableId:tableId,seqId:pickedSeq},function(err, result){
            if (err){
                logger.error(' lineTableQR failed: ' + err.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            }else{
                if (result){
                    res.send(200, {success: true, tableId: tableId});
                    return next();
                }
            }
        })
    })
}

function updateBizTableInfo(req,res,next){
    var params=req.params;

    tableDao.updateBizTableInfo(params,function(error,result){
        if(error){
            logger.error(' updateBizTableInfo ' + error.message);
            throw sysError.InternalError(error.message , sysMsg.SYS_INTERNAL_ERROR_MSG);
        }else{
            if(result.affectedRows && result.affectedRows>0){
                logger.error(' updateBizTableInfo ' + ' success ');
                res.send(200,{success:true});
                next();
            }else{
                logger.error(' updateBizTableInfo ' + ' failure ');
                res.send(200,{success:false});
                next();
            }
        }
    })
}

function updateBizTableStatus(req,res,next){
    var params=req.params;

    tableDao.updateBizTableStatus(params,function(error,result){
        if(error){
            logger.error(' updateBizTableStatus ' + error.message);
            throw sysError.InternalError(error.message , sysMsg.SYS_INTERNAL_ERROR_MSG);
        }else{
            if(result.affectedRows && result.affectedRows>0){
                logger.info(' updateBizTableStatus ' + ' success ');
                res.send(200,{success:true});
                next();
            }else{
                logger.warn(' updateBizTableStatus ' + ' failure ');
                res.send(200,{success:false});
                next();
            }
        }
    })
}

function deleteBizTable(req,res,next){
    var params=req.params;
    var bizId=params.bizId, tableId=params.tableId;
    Seq().seq(function(){
        var that=this;
        //delete related user
        custDao.del({tableId:tableId, bizId:bizId},function(error,result){
            if(error){
                logger.error(' deleteBizTableUser ' + error.message);
                throw sysError.InternalError(error.message , sysMsg.SYS_INTERNAL_ERROR_MSG);
            }else{
                logger.info('deleteBizTableUser succeed');
                that();
            }
        })
    }).seq(function(){
        var that=this;
        tableQrDao.unlinkBizTable(params,function(error,result){
            if(error){
                logger.error(' unlinkBizTable with qr code ' + error.message);
                throw sysError.InternalError(error.message , sysMsg.SYS_INTERNAL_ERROR_MSG);
            }else{
               that();
            }
        })
    }).seq(function(){
            tableDao.deleteBizTable(params,function(error,result){
                if(error){
                    logger.error(' deleteBizTable ' + error.message);
                    throw sysError.InternalError(error.message , sysMsg.SYS_INTERNAL_ERROR_MSG);
                }else{
                    if(result.affectedRows && result.affectedRows>0){
                        logger.info(' deleteBizTable ' + 'success');
                        res.send(200,{success:true});
                        return next()
                    }else{
                        logger.warn(' deleteBizTable ' + ' failure');
                        res.send(200,{success:false});
                        return next();
                    }
                }
            })
        })
}

function queryBizTable(req,res,next){
    tableDao.queryBizTable(req.params,function(error,rows){
        if(error){
            logger.error(' queryBizTable ' + error.message);
            throw sysError.InternalError(error.message , sysMsg.SYS_INTERNAL_ERROR_MSG);
        }else{
            logger.info(' queryBizTable ' + ' success');
            res.send(200,rows);
            next();
        }
    })
}

function queryUsedTableQrCode(req,res,next){
    var params=req.params;
    params.inUse=1;
    _queryTableQrCode(params,function(error,rows){
        if(error){
            logger.error(' queryUsedTableQrCode ' + error.message);
            throw sysError.InternalError(error.message , sysMsg.SYS_INTERNAL_ERROR_MSG);
        }else{
            logger.info(' queryUsedTableQrCode ' + ' success');
            res.send(200,rows);
            next();
        }
    })
}

function queryAvailableTableQrCode(req,res,next){
    var params=req.params;
    params.inUse=0;
    _queryTableQrCode(params,function(error,rows){
        if(error){
            logger.error(' queryAvailableTableQrCode ' + error.message);
            throw sysError.InternalError(error.message , sysMsg.SYS_INTERNAL_ERROR_MSG);
        }else{
            logger.info(' queryAvailableTableQrCode ' + ' success');
            res.send(200,rows);
            next();
        }
    })
}

function _queryTableQrCode(params,callback){
    tableQrDao.queryTableQr(params,function(error,rows){
       return callback(error,rows);
    })
}


module.exports = {
    addBizTable : addBizTable ,
    updateBizTableInfo : updateBizTableInfo ,
    updateBizTableStatus : updateBizTableStatus ,
    deleteBizTable : deleteBizTable ,
    queryBizTable : queryBizTable,
    queryUsedTableQrCode:queryUsedTableQrCode,
    queryAvailableTableQrCode:queryAvailableTableQrCode
}