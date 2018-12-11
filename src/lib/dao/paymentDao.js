/**
 * Created by ling xue on 14-12-22.
 */

var db=require('./../db.js');
var listOfValue = require('../util/ListOfValue.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('PaymentDao.js');

function addPayment(params,callback){
    var query  = "insert into order_payment (payment_nonce, order_id , cust_id , biz_id ," +
        "payment_id , payment_info , payment_type , payment_due ,payment_actual,billing_address , status,parent_id) " +
        "values(? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ?) ";
    var paramArray=[],i=0;
    paramArray[i++] = params.paymentNonce;
    paramArray[i++] = params.orderId;
    paramArray[i++] = params.custId;
    paramArray[i++] = params.bizId;
    paramArray[i++] = params.paymentId;
    paramArray[i++] = params.paymentInfo;
    paramArray[i++] = params.paymentType;
    paramArray[i++] = params.paymentDue;
    paramArray[i++] = params.paymentActual;
    paramArray[i++] = params.billingAddress;
    paramArray[i++] = params.status;
    paramArray[i] = params.parentId;

    db.dbQuery(query, paramArray ,function(error,rows){
        logger.debug(' addPayment ');
        return callback(error,rows);
    });
}

function updatePayment(params,callback){
    var query  = "update order_payment set payment_nonce = ? , order_id = ? , cust_id = ? , biz_id =? ," +
        "payment_id = ? , payment_info =? , payment_type = ? , payment_due = ? ,payment_actual = ? ,billing_address=? ,status=? ,parent_id=? where id = ?"
    var paramArray=[],i=0;
    paramArray[i++] = params.paymentNonce;
    paramArray[i++] = params.orderId;
    paramArray[i++] = params.custId;
    paramArray[i++] = params.bizId;
    paramArray[i++] = params.paymentId;
    paramArray[i++] = params.paymentInfo;
    paramArray[i++] = params.paymentType;
    paramArray[i++] = params.paymentDue;
    paramArray[i++] = params.paymentActual;
    paramArray[i++] = params.billingAddress;
    paramArray[i++] = params.status;
    paramArray[i++] = params.parentId;
    paramArray[i] = params.id;

    db.dbQuery(query, paramArray ,function(error,rows){
        logger.debug(' updatePayment ');
        return callback(error,rows);
    });
}

function deletePayment(params,callback){
    var query  = "delete from order_payment  where id = ?"
    var paramArray=[],i=0;
    paramArray[i] = params.id;

    db.dbQuery(query, paramArray ,function(error,rows){
        logger.debug(' deletePayment ');
        return callback(error,rows);
    });
}

function queryPayment(params,callback){
    var query  = "select * from order_payment op where "
    var paramArray=[],i=0;
    paramArray[i++] = params.orderStatus;
    if(params.bizId){
        query = query + "biz_id = ?"
        paramArray[i++] = params.bizId;
    }
    if(params.custId){
        query = query + "cust_id = ?"
        paramArray[i++] = params.custId;
    }
    if(params.start!=null && params.size!=null){
        paramArray[i++] = parseInt(params.start);
        paramArray[i] = parseInt(params.size);
        query = query + " limit ?,? "
    }
    db.dbQuery(query, paramArray ,function(error,rows){
        logger.debug(' queryPayment ');
        return callback(error,rows);
    });
}

function updatePaymentStatus(params,callback){
    var query = "update order_payment set status =? where id = ?";
    if(params.status == listOfValue.PAYMENT_STATUS_REFUND){
        query = "update order_payment set refund = payment_actual , status = ?  where id = ?";
    }
    var paramArr = [] ,i=0;
    paramArr[i++] = params.status ;
    paramArr[i] = params.paymentId ;


    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updatePaymentStatus ')
        return callback(error,rows);
    });
}

function getBizPaymentStat(params,callback){
    var query = "select sum(payment_actual) amount ,payment_type,status ,max(update_on) update_on from order_payment  where biz_id =? and status in(2,3,5) group by payment_type , status";
    var paramArr = [] ,i=0;
    paramArr[i] = params.bizId ;
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getBizPaymentStat ');
        return callback(error,rows);
    });
}



module.exports = {
    addPayment : addPayment,
    updatePayment : updatePayment ,
    deletePayment : deletePayment ,
    queryPayment : queryPayment ,
    updatePaymentStatus : updatePaymentStatus,
    getBizPaymentStat : getBizPaymentStat
}