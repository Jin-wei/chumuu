/**
 * Created by ibm on 15-6-17.
 */

var db=require('./../db.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('CustGiftDao.js');

function addCustGift(params,callback){
    var query='insert into customer_gift (gift_code,from_cust,to_cust,order_id,active,status) values(?,?,?,?,?,?);'
    var paramArray=[],i=0;
    paramArray[i++]=params.giftCode;
    paramArray[i++]=params.custId;
    paramArray[i++]=params.toCustId;
    paramArray[i++]=params.orderId;
    paramArray[i++]=params.active;
    paramArray[i]=params.status;

    db.dbQuery(query,paramArray,function(error,rows){
        logger.debug(' addCustGift ')
        return callback(error,rows);
    });
}

function queryCustGift(params,callback){
    var query='select * from customer_gift where '
    var paramArray=[],i=0;
    if(params.giftCode){
        query+= " gift_code = ? "
        paramArray[i++]=params.giftCode;
    }
    if(params.fromCustId){
        query+= " from_cust = ? "
        paramArray[i++]=params.fromCustId;
    }
    if(params.fromCustId){
        query+= " to_cust = ? "
        paramArray[i++]=params.toCustId;
    }
    if(params.orderId){
        query+= " order_id = ? "
        paramArray[i++]=params.orderId;
    }
    db.dbQuery(query,paramArray,function(error,rows){
        logger.debug(' queryCustGift ')
        return callback(error,rows);
    });
}

function updateCustGift(params,callback){
    var query='update customer_gift set to_cust =? , active = ? , status = ? where id = ? '
    var paramArray=[],i=0;
    paramArray[i++]=params.toCustId;
    paramArray[i++]=params.active;
    paramArray[i++]=params.status;
    paramArray[i]=params.id;
    db.dbQuery(query,paramArray,function(error,rows){
        logger.debug(' queryCustGift ')
        return callback(error,rows);
    });
}

function delCustGift(params,callback){
    var query='delete from  customer_gift  where id = ? '
    var paramArray=[],i=0;
    paramArray[i]=params.id;
    db.dbQuery(query,paramArray,function(error,rows){
        logger.debug(' delCustGift ')
        return callback(error,rows);
    });
}

function updateGiftReceiver(params,callback){
    var query = " update customer_gift set to_cust=( select customer_id from customer c where c.wechat_id = ?) where id = ? and from_cust = ? and to_cust is null ";
    var paramArray=[],i=0;
    paramArray[i++]=params.openId;
    paramArray[i++]=params.giftId;
    paramArray[i]=params.custId;
    db.dbQuery(query,paramArray,function(error,rows){
        logger.debug(' updateGiftReceiver ')
        return callback(error,rows);
    });
}

module.exports ={
    addCustGift :addCustGift,
    updateCustGift : updateCustGift,
    queryCustGift : queryCustGift,
    delCustGift : delCustGift,
    updateGiftReceiver : updateGiftReceiver
}