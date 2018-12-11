/**
 * Created by ibm on 15-1-16.
 */

var oAuthUtil = require('./util/OAuthUtil.js');
var sysMsg = require('./util/SystemMsg.js');
var sysError = require('./util/SystemError.js');
var bizTaxDao = require('./dao/bizTaxDao.js');
var serverLogger = require('./util/ServerLogger.js');
var logger = serverLogger.createLogger('Tax.js');


//TODO The business logic need open for admin
function addTax(req,res ,next){
    var params = req.params;
    bizTaxDao.addTax(params,function(error,result){
        if(error){
            logger.error(' addTax ' + error.message);
            if(error.message && error.message.indexOf('ER_DUP_ENTRY')>=0){
                throw sysError.InternalError(error.message , sysMsg.SYS_TAX_DUPLICATE_ERROR_MSG);
            }else{
                throw sysError.InternalError(error.message , sysMsg.SYS_INTERNAL_ERROR_MSG);
            }

        }else{
            if(result.insertId && result.insertId>0){
                logger.info(' addTax ' + ' success ');
                res.send(200,{success:true,taxId:result.insertId});
                next();
            }else{
                logger.warn(' addTax ' + ' failure');
                res.send(200,{success:false});
                next();
            }
        }
    })
}

function updateTax(req,res,next){
    var params=req.params;
    bizTaxDao.updateTax(params,function(error,result){
        if(error){
            logger.error(' updateTax ' + error.message);
            throw sysError.InternalError(error.message , sysMsg.SYS_INTERNAL_ERROR_MSG);
        }else{
            if(result.affectedRows && result.affectedRows>0){
                logger.error(' updateTax ' + ' success ');
                res.send(200,{success:true});
                next();
            }else{
                logger.error(' updateTax ' + ' failure ');
                res.send(200,{success:false});
                next();
            }
        }
    })
}

function deleteTax(req,res,next){
    var params=req.params;
    bizTaxDao.deleteTax(params,function(error,result){
        if(error){
            logger.error(' deleteTax ' + error.message);
            throw sysError.InternalError(error.message , sysMsg.SYS_INTERNAL_ERROR_MSG);
        }else{
            if(result.affectedRows && result.affectedRows>0){
                logger.info(' deleteTax ' + 'success');
                res.send(200,{success:true});
                next();
            }else{
                logger.warn(' deleteTax ' + ' failure');
                res.send(200,{success:false});
                next();
            }
        }
    })
}

function queryTax(req,res,next){
    bizTaxDao.queryTax(req.params,function(error,rows){
        if(error){
            logger.error(' queryTax ' + error.message);
            throw sysError.InternalError(error.message , sysMsg.SYS_INTERNAL_ERROR_MSG);
        }else{
            logger.info(' queryTax ' + ' success');
            res.send(200,rows);
            next();
        }
    })
}
