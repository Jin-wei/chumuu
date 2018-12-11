
var db=require('./../db.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('checkoutInfoDao.js');

function getMaxCheckoutId(params,callback){
    var query = " select max(checkout_id) as maxCheckoutId from biz_checkout_info where status=1 and biz_id =? ";
    var paramArr = [], i = 0;
    paramArr[i++]=params.bizId;
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getMaxCheckoutId ');
        return callback(error,rows);
    });
}
function queryBizCheckoutInfo(params,callback){
    var query = " select * from biz_checkout_info where status=1 and biz_id =? ";
    var paramArr = [], i = 0;
    paramArr[i++]=params.bizId;
    if(params.checkout_name){
        query +=' and checkout_name = ?';
        paramArr[i] = params.checkout_name
    }
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' queryBizCheckoutInfo ');
        return callback(error,rows);
    });
}
function deleteBizCheckoutInfo(params,callback){
    var query = "update biz_checkout_info set status=0 where biz_id=? and id=?";
    var paramArr = [], i = 0;
    paramArr[i++]=params.bizId;
    paramArr[i]=params.id;
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' deleteBizCheckoutInfo ');
        return callback(error,rows);
    });
}

function addBizCheckoutInfo(params,callback){
    var query = " insert into biz_checkout_info (biz_id,checkout_id,checkout_name,checkout_remark,status) " +
        "values (? , ? , ? , ? , 1  ) ";
    var paramArr = [], i = 0;
    paramArr[i++]=params.bizId;
    paramArr[i++]=params.checkout_id;
    paramArr[i++]=params.checkout_name;
    paramArr[i]=params.checkout_remark;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addBizCheckoutInfo ');
        return callback(error,rows);
    });
}
function updateCheckoutInfoById(param ,callback){
    var query = "update biz_checkout_info set checkout_name=?,checkout_remark=? where id=?";
    var paramArr = [] , i = 0;
    paramArr[i++] = param.checkout_name;
    paramArr[i++] = param.checkout_remark;
    paramArr[i] = param.id;
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateCheckoutInfoById ');
        return callback(error,rows);
    })
}

function checkOrder(params,callback){
    var query = " select * from order_money where biz_id =? and payment_type =? ";
    var paramArr = [], i = 0;
    paramArr[i++]=params.bizId;
    paramArr[i]=params.checkoutId;
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' checkOrder ');
        return callback(error,rows);
    });
}


module.exports = {
    queryBizCheckoutInfo:queryBizCheckoutInfo,
    deleteBizCheckoutInfo:deleteBizCheckoutInfo,
    addBizCheckoutInfo:addBizCheckoutInfo,
    updateCheckoutInfoById:updateCheckoutInfoById,
    checkOrder:checkOrder,
    getMaxCheckoutId:getMaxCheckoutId
};