/**
 * Created by ling xue on 15-2-6.
 */

var oAuthUtil = require('./util/OAuthUtil.js');
var sysMsg = require('./util/SystemMsg.js');
var sysError = require('./util/SystemError.js');
var serverLogger = require('./util/ServerLogger.js');
var logger = serverLogger.createLogger('RoleBase.js');
var bizUserDao = require('./dao/bizUserDao.js');


function checkCustomerToken(req ,res, next){
    var tokenInfo = oAuthUtil.parseCustomerToken(req);
    if(tokenInfo != null && req.params.custId == tokenInfo.id){
        next();
    }else{
        logger.error( req.url +" \t "+ sysMsg.SYS_AUTH_TOKEN_ERROR);
        throw sysError.InternalError(sysMsg.SYS_AUTH_TOKEN_ERROR,sysMsg.SYS_AUTH_TOKEN_ERROR);
    }
}

/**
 * Check customer request auth token for brain tree
 * @param req
 * @param res
 * @param next
 */
function checkCTokenForBT(req,res,next){
    var tokenInfo = oAuthUtil.parseCustomerCookieToken(req);
    if(tokenInfo != null && req.params.custId == tokenInfo.id){
        next();
    }else{
        logger.error( req.url +" \t "+ sysMsg.SYS_AUTH_TOKEN_ERROR);
        throw sysError.InternalError(sysMsg.SYS_AUTH_TOKEN_ERROR,sysMsg.SYS_AUTH_TOKEN_ERROR);
    }
}

/**
 * Check business request auth token for brain tree
 * @param req
 * @param res
 * @param next
 */
function checkBTokenForBT(req,res,next){
    var tokenInfo = oAuthUtil.parseBizCookieToken(req);
    if(tokenInfo != null && req.params.custId == tokenInfo.id){
        next();
    }else{
        logger.error( req.url +" \t "+ sysMsg.SYS_AUTH_TOKEN_ERROR);
        throw sysError.InternalError(sysMsg.SYS_AUTH_TOKEN_ERROR,sysMsg.SYS_AUTH_TOKEN_ERROR);
    }
}


function checkBizOwnerToken(req,res,next){
    var tokenInfo = oAuthUtil.parseBizToken(req);
    if(tokenInfo != null && tokenInfo.type == oAuthUtil.clientType.admin){
        return next();
    }
    if(tokenInfo != null && req.params.bizId == tokenInfo.id && tokenInfo.roleType>= oAuthUtil.bizRoleType.owner){
        next();
    }else{
        logger.error( req.url +" \t "+ sysMsg.SYS_AUTH_TOKEN_ERROR);
        throw sysError.InternalError(sysMsg.SYS_AUTH_TOKEN_ERROR,sysMsg.SYS_AUTH_TOKEN_ERROR);
    }
}

function checkBizManagerToken(req ,res, next){
    var tokenInfo = oAuthUtil.parseBizToken(req);
    if(tokenInfo != null && tokenInfo.type == oAuthUtil.clientType.admin){
        return next();
    }
    if(tokenInfo != null && req.params.bizId == tokenInfo.id && tokenInfo.roleType>= oAuthUtil.bizRoleType.manager){
        next();
    }else{
        logger.error( req.url +" \t "+ sysMsg.SYS_AUTH_TOKEN_ERROR);
        throw sysError.InternalError(sysMsg.SYS_AUTH_TOKEN_ERROR,sysMsg.SYS_AUTH_TOKEN_ERROR);
    }
}

function checkBizWaiterToken(req , res, next){
    var tokenInfo = oAuthUtil.parseBizToken(req);
    if(tokenInfo != null && tokenInfo.type == oAuthUtil.clientType.admin){
        return next();
    }
    if(tokenInfo != null && req.params.bizId == tokenInfo.id && tokenInfo.roleType>= oAuthUtil.bizRoleType.waiter){
        next();
    }else{
        logger.error( req.url +" \t " +sysMsg.SYS_AUTH_TOKEN_ERROR);
        throw sysError.InternalError(sysMsg.SYS_AUTH_TOKEN_ERROR,sysMsg.SYS_AUTH_TOKEN_ERROR);
    }
}

function checkSimpleCustomerToken(req ,res, next){
    var tokenInfo = oAuthUtil.parseBizToken(req);
    if(tokenInfo != null){
        next();
    }else{
        logger.error( req.url +" \t " +sysMsg.SYS_AUTH_TOKEN_ERROR);
        throw sysError.InternalError(sysMsg.SYS_AUTH_TOKEN_ERROR,sysMsg.SYS_AUTH_TOKEN_ERROR);
    }
}

function addBizWaiter(req, res, next){
    var params = req.params;
    params.roleType = oAuthUtil.bizRoleType.waiter ;
    bizUserDao.addBizUserRel(params,function(error,result){
        if (error){
            logger.error(' addBizWaiter ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        logger.info(' addBizWaiter ' + 'success');
        if(result.affectedRows >0){
            logger.info(' addBizWaiter ' + 'success');
            res.send(200, {success:true});
            next();
        }else{
            logger.warn(' addBizWaiter ' + 'failed');
            res.send(200,{success:false});
            next();
        }
    })
}

function addBizManager(req ,res, next){
    var params = req.params;
    params.roleType = oAuthUtil.bizRoleType.manager ;
    bizUserDao.addBizUserRel(params,function(error,result){
        if (error){
            logger.error(' addBizManager ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        logger.info(' addBizManager ' + 'success');
        if(result.affectedRows >0){
            logger.info(' addBizManager ' + 'success');
            res.send(200, {success:true});
            next();
        }else{
            logger.warn(' addBizManager ' + 'failed');
            res.send(200,{success:false});
            next();
        }
    })
}

function removeBizUserRole(req,res,next){
    var params = req.params;
    params.roleType = oAuthUtil.bizRoleType.other ;
    bizUserDao.updateBizUserRole(params,function(error,result){
        if (error){
            logger.error(' removeBizUserRole ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        logger.info(' removeBizUserRole ' + 'success');
        if(result.affectedRows >0){
            logger.info(' removeBizUserRole ' + 'success');
            res.send(200, {success:true});
            next();
        }else{
            logger.warn(' removeBizUserRole ' + 'failed');
            res.send(200,{success:false});
            next();
        }
    })
}


function updateBizWaiter(req,res,next){
    var params = req.params;
    params.roleType = oAuthUtil.bizRoleType.waiter ;
    bizUserDao.updateBizUserRole(params,function(error,result){
        if (error){
            logger.error(' updateBizWaiter ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        logger.info(' updateBizWaiter ' + 'success');
        if(result.affectedRows >0){
            logger.info(' updateBizWaiter ' + 'success');
            res.send(200, {success:true});
            next();
        }else{
            logger.warn(' updateBizWaiter ' + 'failed');
            res.send(200,{success:false});
            next();
        }
    });
}

function updateBizManager(req,res,next){
    var params = req.params;
    params.roleType = oAuthUtil.bizRoleType.manager ;
    bizUserDao.updateBizUserRole(params,function(error,result){
        if (error){
            logger.error(' updateBizManager ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        logger.info(' updateBizManager ' + 'success');
        if(result.affectedRows >0){
            logger.info(' updateBizManager ' + 'success');
            res.send(200, {success:true});
            next();
        }else{
            logger.warn(' updateBizManager ' + 'failed');
            res.send(200,{success:false});
            next();
        }
    })
}

function getBizEmployee(req ,res, next){
    var params = req.params;
    bizUserDao.queryBizEmployee(params,function(error,rows){
        if (error){
            logger.error(' getBizEmployee ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }else{
            res.send(200,rows);
            next();
        }
    })
}

function searchBizUser(req , res , next ){
    var params = req.params;
    bizUserDao.queryBizUser(params,function(error,rows){
        if (error){
            logger.error(' searchBizUser ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }else{
            res.send(200,rows);
            next();
        }
    })
}

function checkAdminToken(req ,res, next){
    var tokenInfo = oAuthUtil.parseAdminToken(req);
    if(tokenInfo != null && tokenInfo.type == oAuthUtil.clientType.sa){
        return next();
    }
    if(tokenInfo != null && req.params.adminId == tokenInfo.id ){
        next();
    }else{
        logger.error( req.url +" \t "+ sysMsg.SYS_AUTH_TOKEN_ERROR);
        throw sysError.InternalError(sysMsg.SYS_AUTH_TOKEN_ERROR,sysMsg.SYS_AUTH_TOKEN_ERROR);
    }
}

module.exports = {
    checkBizOwnerToken : checkBizOwnerToken ,
    checkBizManagerToken : checkBizManagerToken ,
    checkBizWaiterToken : checkBizWaiterToken,
    checkCustomerToken : checkCustomerToken ,
    checkSimpleCustomerToken : checkSimpleCustomerToken ,
    addBizWaiter : addBizWaiter ,
    addBizManager : addBizManager ,
    removeBizUserRole : removeBizUserRole ,
    updateBizWaiter : updateBizWaiter ,
    updateBizManager : updateBizManager ,
    getBizEmployee : getBizEmployee ,
    searchBizUser : searchBizUser ,
    checkCTokenForBT : checkCTokenForBT,
    checkBTokenForBT : checkBTokenForBT ,
    checkAdminToken : checkAdminToken
}
