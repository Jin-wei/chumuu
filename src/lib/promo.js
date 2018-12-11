var promoDao = require('./dao/PromoDao');
var bizDao = require('./dao/bizdao');
var moment = require('moment');
var sysMsg = require('./util/SystemMsg.js');
var sysError = require('./util/SystemError.js');
var oAuthUtil = require('./util/OAuthUtil.js');
var Seq = require('seq');
var serverLogger = require('./util/ServerLogger.js');
var logger = serverLogger.createLogger('Promo.js');

function listBizPromo(req, res, next) {
    promoDao.listBizPromo(req.params, function (error, rows) {
        if (error) {
            logger.error(' listBizPromo ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else {
            logger.info( ' listBizPromo ' + 'success');
            res.send(200, rows);
            next();
        }
    });

}

function listBizProdPromo(req, res, next) {
    promoDao.listBizProdPromo(req.params, function (error, rows) {
        if (error) {
            logger.error(' listBizProdPromo ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else {
            logger.info(' listBizProdPromo ' + 'success');
            if (rows && rows.length > 0) {
                res.send(200, rows);
                next();
            } else {
                res.send(200,null);
                next();
            }
        }
    });
}

function getBizPromo(req, res, next) {
    promoDao.getBizPromo(req.params, function (error, rows) {
        if (error) {
            logger.error(' getBizPromo ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else {
            logger.info(' getBizPromo ' + 'success');
            if (rows && rows.length > 0) {
                var aPromo = rows[0];
                //format date
                if (aPromo.start_date) {
                    aPromo.start_date = moment(aPromo.start_date).format("YYYY-MM-DD");
                }
                if (aPromo.end_date) {
                    aPromo.end_date = moment(aPromo.end_date).format("YYYY-MM-DD");
                }

                res.send(200, aPromo);
                next();
            } else {
                res.send(200,null);
                next();
            }
        }
    });
}

function addBizPromo(req, res, next) {
    var params=req.params;


    promoDao.addBizPromo(req.params, function (error, rows) {
        if (error) {
            logger.error(' addBizPromo ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else {
            logger.info(' addBizPromo ' + 'success');
            res.send(200, {promotion_id: rows.insertId});
            next();
        }
    });
}

function updateBizPromo(req, res, next) {
    var params=req.params;


    promoDao.updateBizPromo(req.params, function (error, rows) {
        if (error) {
            logger.error(' updateBizPromo ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else {
            logger.info(' updateBizPromo ' + 'success');
            res.send(200, {succeed: true});
            next();
        }
    })
}

function deleteBizPromo(req, res, next) {
    var params=req.params;


    promoDao.deleteBizPromo(req.params, function (error, rows) {
        if (error) {
            logger.error(' deleteBizPromo ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else {
            logger.error(' deleteBizPromo ' + 'success');
            res.send(200, {succeed: true});
            next();
        }
    });
}

function getBizPromoNow(req, res, next) {
    var nowDate = new Date();
    var weekday = nowDate.getDay();
    Seq().seq(function() {
        var that = this;
        bizDao.search({biz_id:req.params.bizId},function(error,rows){
            if(error){
                logger.error(' getBizPromoNow ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            }else{
                nowDate.setMinutes(nowDate.getMinutes() + nowDate.getTimezoneOffset() +rows[0].time_offset*60);
                that();
            }

        })
    }).seq(function(){
            req.params.weekday = nowDate.getDay();
            promoDao.getBizPromoNow(req.params, function (error, rows) {
                if (error) {
                    logger.error(' getBizPromoNow ' + error.message);
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    logger.info(' getBizPromoNow ' + 'success');
                    res.send(200, rows);
                    next();
                }
            });
        })

}

function getAllBizPromo4Cust(req, res, next) {
    var nowDate = new Date();
    req.params.weekday = nowDate.getDay();
    promoDao.getAllBizPromo4Cust(req.params, function (error, rows) {
        if (error) {
            logger.error(' getAllBizPromo4Cust ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else {
            logger.info(' getAllBizPromo4Cust ' + 'success');
            res.send(200, rows);
            next();
        }
    })
}

function getAllProdPromo4Cust(req, res, next) {
    var nowDate = new Date();
    req.params.weekday = nowDate.getDay();
    promoDao.getAllProdPromo4Cust(req.params, function (error, rows) {
        if (error) {
            logger.error(' getAllProdPromo4Cust ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else {
            logger.info(' getAllProdPromo4Cust ' + 'success');
            res.send(200, rows);
            next();
        }
    })
}


///--- Exports


module.exports = {
    listBizPromo: listBizPromo,
    listBizProdPromo: listBizProdPromo,
    getBizPromo: getBizPromo,
    addBizPromo: addBizPromo,
    updateBizPromo: updateBizPromo,
    deleteBizPromo: deleteBizPromo,
    getBizPromoNow : getBizPromoNow,
    getAllBizPromo4Cust : getAllBizPromo4Cust,
    getAllProdPromo4Cust : getAllProdPromo4Cust
};