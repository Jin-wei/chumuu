/**
 * Created by ibm on 14-12-10.
 */

var braintree = require('braintree');

var paymentDao = require('./dao/paymentDao.js');
var bizInvoiceDao = require('./dao/BizInvoiceDao.js');
var serverLogger = require('./util/ServerLogger.js');
var logger = serverLogger.createLogger('Payment.js');
var sysMsg = require('./util/SystemMsg.js');
var sysError = require('./util/SystemError.js');
var sysConfig = require('./config/SystemConfig.js');
var oAuthUtil = require('./util/OAuthUtil.js');
var alipayUtil = require('./util/AlipayUtil.js');
var orderDao = require('./dao/orderDao.js');
var db = require('./db.js');
var mailUtil = require('./util/MailUtil.js');
var dateUtil = require('./util/DateUtil.js');
var Seq = require('seq');
var listOfValue = require('./util/ListOfValue.js');

var alipaytest = require('./util/alipay/alipay.js').Alipay;

var brainConfig = sysConfig.brainTreeConfig;
if(sysConfig.brainTreeEnvironment ==0){
    //Payment environment is sandbox
    brainConfig.environment = braintree.Environment.Sandbox;
}else{
    //Payment environment is production
    brainConfig.environment = braintree.Environment.Production;
}


var gateway = braintree.connect(brainConfig);



function doPayment(req,res,next){
    var nonce = req.params.payment_method_nonce;
    var transactionId ;
    if(nonce == null || nonce.length<1){
        logger.error(' doPayment ' + sysMsg.PAYMENT_GET_NONCE_ERROR);
        orderDao.deleteOrderWithItem(req.params,function(error,result){
            if(error){
                logger.error(' doPayment ' + error.message);
            }
        });
        //var errMsg = result.message.split("\n").join('|');
        res.setHeader('Content-Type', 'text/html');
        res.writeHead(200);
        res.end("<html><script>window.location.href='/payment?err="+sysMsg.PAYMENT_GET_NONCE_ERROR+"'</script></html>");
        return next();
        //return next(sysError.MissingParameterError());
    }
    var paymentObj = {};
    Seq().seq(function(){
        var that = this;
        orderDao.getOrderInfoById(req.params,function(error,rows){
            if(error){
                logger.error(' doPayment ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                return ;
            }else{
                if(rows == null || rows.length <1){
                    logger.error(' doPayment ' + " order is not exist ");
                    throw sysError.InternalError( "order is not exist","order is not exist ");
                    return ;
                }else{
                    paymentObj.custId = rows[0].cust_id;
                    paymentObj.bizId = rows[0].biz_id;
                    paymentObj.paymentDue  = rows[0].total_price;
                    paymentObj.paymentNonce = nonce;
                    paymentObj.orderId = req.params.orderId;
                }
            }
            that();
        })
    }).seq(function(){
            var that = this;
            gateway.transaction.sale({
                paymentMethodNonce: nonce,
                amount: paymentObj.paymentDue
            }, function (err, result) {
                if (err){
                    logger.error(' doPayment ' + err.message);
                    orderDao.deleteOrderWithItem(req.params,function(error,result){
                        if(error){
                            logger.error(' doPayment ' + error.message);
                        }
                    })
                    //throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                    var errMsg = err.message.split("\n").join('|');
                    res.setHeader('Content-Type', 'text/html');
                    res.writeHead(200);
                    res.end("<html><script>window.location.href='/payment?err="+errMsg+"'</script></html>");
                    return  next();
                }else if(!result.success){
                    logger.error(' doPayment ' + result.message);
                    orderDao.deleteOrderWithItem(req.params,function(error,result){
                        if(error){
                            logger.error(' doPayment ' + error.message);
                        }
                    })
                    //throw sysError.InternalError("","");
                    var errMsg = result.message.split("\n").join('|');
                    res.setHeader('Content-Type', 'text/html');
                    res.writeHead(200);
                    res.end("<html><script>window.location.href='/payment?err="+errMsg+"'</script></html>");
                    return next();
                }else{
                    logger.info(' doPayment ' + 'in braintree authorized success');
                    transactionId = result.transaction.id;
                    paymentObj.paymentId = result.transaction.id;
                    paymentObj.paymentActual = result.transaction.amount;
                    paymentObj.billingAddress = result.transaction.billing.streetAddress;
                    paymentObj.status = listOfValue.PAYMENT_STATUS_AUTH ;
                    if(result.transaction.creditCard){
                        var creditCardInfo  = {};
                        creditCardInfo.cardType = result.transaction.creditCard.cardType;
                        creditCardInfo.cardholderName = result.transaction.creditCard.cardholderName;
                        creditCardInfo.expirationDate = result.transaction.creditCard.expirationDate;
                        creditCardInfo.maskedNumber = result.transaction.creditCard.maskedNumber;
                        paymentObj.paymentInfo = result.transaction.creditCard.maskedNumber;
                        paymentObj.paymentType = 1 ;
                    }else if(result.transaction.creditCard){
                        paymentObj.paymentInfo = req.params.email;
                        paymentObj.paymentType = 1 ;
                    }
                }
                that();
            });
        }).seq(function(){
            var that = this;
            /*if(transactionId != null ){
                gateway.transaction.submitForSettlement(transactionId, function (err, result) {
                    if (result.success) {
                        logger.info(' doPayment ' + 'in braintree settlement success');
                        that();
                    } else if (result.errors.deepErrors() > 0) {
                        //console.log(result.errors);
                        logger.error(' doPayment ' + result.errors);
                        orderDao.deleteOrderWithItem(req.params,function(error,result){
                            if(error){
                                logger.error(' doPayment ' + error.message);
                            }
                        })
                        //throw sysError.InternalError(result.errors,result.errors);
                        var errMsg = result.message.split("\n").join('|');
                        res.setHeader('Content-Type', 'text/html');
                        res.writeHead(200);
                        res.end("<html><script>window.location.href='/payment?err="+errMsg+"'</script></html>");
                        return next();
                    } else {
                        logger.error(' doPayment ' + result.transaction.processorSettlementResponseText);
                        orderDao.deleteOrderWithItem(req.params,function(error,result){
                            if(error){
                                logger.error(' doPayment ' + error.message);
                            }
                        })
                        //throw sysError.InternalError(result.transaction.processorSettlementResponseCode,result.transaction.processorSettlementResponseText);
                        //var errMsg = result.message.split("\n").join('|');
                        res.setHeader('Content-Type', 'text/html');
                        res.writeHead(200);
                        res.end("<html><script>window.location.href='/payment?err="+result.transaction.processorSettlementResponseText+"'</script></html>");
                        return next();
                    }
                });
            }else{
                logger.error(' doPayment ' + "transaction error");
                orderDao.deleteOrderWithItem(req.params,function(error,result){
                    if(error){
                        logger.error(' doPayment ' + error.message);
                    }
                })
                //throw sysError.InternalError(""," payment transaction error ");
                res.setHeader('Content-Type', 'text/html');
                res.writeHead(200);
                res.end("<html><script>window.location.href='/payment?err=payment transaction error'</script></html>");
                return next();
            }*/
            that();
        }).seq(function(){
            var that = this;
            /*gateway.settlementBatchSummary.generate({
                settlementDate: new Date()
            }, function (err, result) {
                //console.log(result.settlementBatchSummary.records);
                if(err){
                    orderDao.deleteOrderWithItem(req.params,function(error,result){
                        if(error){
                            logger.error(' doPayment ' + error.message);
                        }
                    });
                }
                that();
            });*/
            that();
        }).seq(function(){
            var that = this;
            paymentDao.addPayment(paymentObj,function(error,result){
                if (error){
                    logger.error(' doPayment ' + error.message);
                    //throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                    var errMsg = error.message.split("\n").join('|');
                    res.setHeader('Content-Type', 'text/html');
                    res.writeHead(200);
                    res.end("<html><script>window.location.href='/payment?err="+errMsg+"'</script></html>");
                    return next();

                }else{
                    logger.info(' doPayment ' + 'save payment success');
                    //res.send(200, {success:true,paymentId:result.insertId});
                    that()
                }
            });
        }).seq(function(){
            orderDao.setOrderActive(req.params,function(error,result){
                if (error){
                    logger.error(' doPayment ' + error.message);
                    //throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                    var errMsg = error.message.split("\n").join('|');
                    res.setHeader('Content-Type', 'text/html');
                    res.writeHead(200);
                    res.end("<html><script>window.location.href='/payment?err="+errMsg+"'</script></html>");
                    return next();

                }else{
                    if(result.affectedRows>0){
                        orderDao.getOrderWithItemForMail(req.params,function(err,rows){
                            var emailParams = {};
                            if(err){
                                logger.error(' getOrderWithItemForMail ' + err.message);
                            }else{
                                if(rows && rows.length>0){
                                    var bizInfoTemp = {};
                                    bizInfoTemp.bizId = rows[0].biz_id;
                                    bizInfoTemp.bizName = rows[0].name;
                                    bizInfoTemp.bizUniqueName = rows[0].biz_unique_name;
                                    bizInfoTemp.phone = rows[0].phone_no;
                                    bizInfoTemp.timeOffset = rows[0].time_offset;

                                    var custInfoTemp  ={};
                                    custInfoTemp.email = rows[0].email;
                                    custInfoTemp.firstName = rows[0].first_name;
                                    custInfoTemp.lastName =  rows[0].last_name;
                                    custInfoTemp.userName = rows[0].username ;
                                    custInfoTemp.phone = rows[0].cust_phone_no;
                                    var orderInfoTemp  ={};
                                    orderInfoTemp.orderId = req.params.orderId;
                                    orderInfoTemp.orderUsername = rows[0].orderUsername;
                                    orderInfoTemp.orderUserPhone = rows[0].phone;
                                    orderInfoTemp.orderType = rows[0].order_type;
                                    orderInfoTemp.status = rows[0].status;
                                    orderInfoTemp.orderStart = rows[0].order_start;
                                    orderInfoTemp.promoInfo = rows[0].promo_info;
                                    orderInfoTemp.originPrice = rows[0].origin_price;
                                    orderInfoTemp.remark = rows[0].remark;
                                    orderInfoTemp.peopleNum = rows[0].people_num;
                                    orderInfoTemp.actualPrice = rows[0].actual_price;
                                    orderInfoTemp.totalTax = rows[0].total_tax;
                                    orderInfoTemp.totalDiscount = rows[0].total_discount;
                                    orderInfoTemp.totalPrice = rows[0].total_price;
                                    orderInfoTemp.tableId = rows[0].table_id;
                                    orderInfoTemp.createOn = rows[0].create_on;
                                    orderInfoTemp.paymentId = rows[0].payment_id;
                                    orderInfoTemp.paymentType = rows[0].payment_type;
                                    orderInfoTemp.paymentStatus = rows[0].payment_status;
                                    orderInfoTemp.paymentActual = rows[0].payment_actual;
                                    var orderItemArray = [];
                                    for(var i =0; i<rows.length;i++){
                                        var itemTemp = {};
                                        itemTemp.prodName = rows[i].prod_name;
                                        itemTemp.prodNameLang = rows[i].prod_name_lang;
                                        itemTemp.promoInfo = rows[i].item_promo_info;
                                        itemTemp.quantity = rows[i].quantity;
                                        itemTemp.originPrice = rows[i].item_origin_price;
                                        itemTemp.unitPrice = rows[i].item_unit_price;
                                        itemTemp.actualPrice = rows[i].item_actual_price;
                                        itemTemp.discount = rows[i].item_discount ;
                                        itemTemp.totalPrice = rows[i].item_total_price;
                                        itemTemp.remark = rows[i].item_remark ;
                                        itemTemp.status = rows[i].item_status;

                                        orderItemArray.push(itemTemp);
                                    }
                                    emailParams.bizInfo = bizInfoTemp;
                                    emailParams.custInfo = custInfoTemp;
                                    emailParams.orderInfo = orderInfoTemp;
                                    emailParams.orderItemArray = orderItemArray;
                                    mailUtil.sendSubmitOrderMail(emailParams);

                                }else{
                                    logger.warn('setOrderActive' , ' send submit email failure ');
                                }
                            }
                        });
                    }
                    res.setHeader('Content-Type', 'text/html');
                    res.writeHead(200);
                    res.end("<html><script>window.location.href='/checkout-order-success?orderId="+req.params.orderId+"'</script></html>");
                    return next();
                }
            })
        });

}

function doPaypal(req,res,next){
    var nonce = req.params.payment_method_nonce;
    var transactionId ;
    if(nonce == null || nonce.length<1){
        logger.error(' doPaypal ' + sysMsg.PAYMENT_GET_NONCE_ERROR);
        orderDao.deleteOrderWithItem(req.params,function(error,result){
            if(error){
                logger.error(' doPaypal ' + error.message);
            }
        });
        //var errMsg = result.message.split("\n").join('|');

        return next(sysError.MissingParameterError());
    }
    var paymentObj = {};
    Seq().seq(function(){
        var that = this;
        orderDao.getOrderInfoById(req.params,function(error,rows){
            if(error){
                logger.error(' doPaypal ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            }else{
                if(rows == null || rows.length <1){
                    logger.error(' doPaypal ' + " order is not exist ");
                    throw sysError.InternalError( "order is not exist","order is not exist ");
                }else{
                    paymentObj.custId = rows[0].cust_id;
                    paymentObj.bizId = rows[0].biz_id;
                    paymentObj.paymentDue  = rows[0].total_price;
                    paymentObj.paymentNonce = nonce;
                    paymentObj.orderId = req.params.orderId;
                }
            }
            that();
        })
    }).seq(function(){
            var that = this;
            gateway.transaction.sale({
                paymentMethodNonce: nonce,
                amount: paymentObj.paymentDue
            }, function (err, result) {
                if (err){
                    logger.error(' doPayment ' + err.message);
                    orderDao.deleteOrderWithItem(req.params,function(error,result){
                        if(error){
                            logger.error(' doPaypal ' + error.message);
                        }
                    })
                    throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);

                }else if(!result.success){
                    logger.error(' doPaypal ' + result.message);
                    orderDao.deleteOrderWithItem(req.params,function(error,result){
                        if(error){
                            logger.error(' doPayment ' + error.message);
                        }
                    })
                    throw sysError.InternalError(result.message,result.message);

                }else{
                    logger.info(' doPaypal ' + 'in braintree authorized success');
                    transactionId = result.transaction.id;
                    paymentObj.paymentId = result.transaction.id;
                    paymentObj.paymentActual = result.transaction.amount;
                    paymentObj.billingAddress = result.transaction.billing.streetAddress;
                    paymentObj.status = listOfValue.PAYMENT_STATUS_AUTH ;
                    if(result.transaction.paypal){
                        paymentObj.paymentInfo = result.transaction.paypal.payerEmail;
                        paymentObj.paymentType = 0 ;
                    }
                }
                that();
            });
        }).seq(function(){
            var that = this;
            /*if(transactionId != null ){
                gateway.transaction.submitForSettlement(transactionId, function (err, result) {
                    if (result.success) {
                        logger.info(' doPaypal ' + 'in braintree settlement success');
                        that();
                    } else if (result.errors.deepErrors() > 0) {
                        //console.log(result.errors);
                        logger.error(' doPayment ' + result.errors);
                        orderDao.deleteOrderWithItem(req.params,function(error,result){
                            if(error){
                                logger.error(' doPaypal ' + error.message);
                            }
                        })
                        throw sysError.InternalError(result.errors,result.errors);

                    } else {
                        logger.error(' doPaypal ' + result.transaction.processorSettlementResponseText);
                        orderDao.deleteOrderWithItem(req.params,function(error,result){
                            if(error){
                                logger.error(' doPayment ' + error.message);
                            }
                        })
                        throw sysError.InternalError(result.transaction.processorSettlementResponseCode,result.transaction.processorSettlementResponseText);
                        //var errMsg = result.message.split("\n").join('|');

                    }
                });
            }else{
                logger.error(' doPaypal ' + "transaction error");
                orderDao.deleteOrderWithItem(req.params,function(error,result){
                    if(error){
                        logger.error(' doPaypal ' + error.message);
                    }
                })
                throw sysError.InternalError("payment transaction error"," payment transaction error ");

            }*/
            that();

        }).seq(function(){
            var that = this;
            /*gateway.settlementBatchSummary.generate({
                settlementDate: new Date()
            }, function (err, result) {
                //console.log(result.settlementBatchSummary.records);
                if(err){
                    orderDao.deleteOrderWithItem(req.params,function(error,result){
                        if(error){
                            logger.error(' doPaypal ' + error.message);
                        }
                    });
                }
                that();
            });*/
            that();
        }).seq(function(){
            var that = this;
            paymentDao.addPayment(paymentObj,function(error,result){
                if (error){
                    logger.error(' doPaypal ' + error.message);
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);


                }else{

                    logger.info(' doPaypal ' + 'save payment  success');
                    that();

                }
            });
        }).seq(function(){
            orderDao.setOrderActive(req.params,function(error,result){
                if (error){
                    logger.error(' doPaypal ' + error.message);
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);

                }else{
                    logger.info(' doPaypal '+ " success")
                    if(result.affectedRows>0){
                        orderDao.getOrderWithItemForMail(req.params,function(err,rows){
                            var emailParams = {};
                            if(err){
                                logger.error(' getOrderWithItemForMail ' + err.message);
                            }else{
                                if(rows && rows.length>0){
                                    var bizInfoTemp = {};
                                    bizInfoTemp.bizId = rows[0].biz_id;
                                    bizInfoTemp.bizName = rows[0].name;
                                    bizInfoTemp.bizUniqueName = rows[0].biz_unique_name;
                                    bizInfoTemp.phone = rows[0].phone_no;
                                    bizInfoTemp.timeOffset = rows[0].time_offset;

                                    var custInfoTemp  ={};
                                    custInfoTemp.email = rows[0].email;
                                    custInfoTemp.firstName = rows[0].first_name;
                                    custInfoTemp.lastName =  rows[0].last_name;
                                    custInfoTemp.userName = rows[0].username ;
                                    custInfoTemp.phone = rows[0].cust_phone_no;
                                    var orderInfoTemp  ={};
                                    orderInfoTemp.orderId = req.params.orderId;
                                    orderInfoTemp.orderUsername = rows[0].orderUsername;
                                    orderInfoTemp.orderUserPhone = rows[0].phone;
                                    orderInfoTemp.orderType = rows[0].order_type;
                                    orderInfoTemp.status = rows[0].status;
                                    orderInfoTemp.orderStart = rows[0].order_start;
                                    orderInfoTemp.promoInfo = rows[0].promo_info;
                                    orderInfoTemp.originPrice = rows[0].origin_price;
                                    orderInfoTemp.remark = rows[0].remark;
                                    orderInfoTemp.peopleNum = rows[0].people_num;
                                    orderInfoTemp.actualPrice = rows[0].actual_price;
                                    orderInfoTemp.totalTax = rows[0].total_tax;
                                    orderInfoTemp.totalDiscount = rows[0].total_discount;
                                    orderInfoTemp.totalPrice = rows[0].total_price;
                                    orderInfoTemp.tableId = rows[0].table_id;
                                    orderInfoTemp.createOn = rows[0].create_on;
                                    orderInfoTemp.paymentId = rows[0].payment_id;
                                    orderInfoTemp.paymentType = rows[0].payment_type;
                                    orderInfoTemp.paymentStatus = rows[0].payment_status;
                                    orderInfoTemp.paymentActual = rows[0].payment_actual;
                                    var orderItemArray = [];
                                    for(var i =0; i<rows.length;i++){
                                        var itemTemp = {};
                                        itemTemp.prodName = rows[i].prod_name;
                                        itemTemp.prodNameLang = rows[i].prod_name_lang;
                                        itemTemp.promoInfo = rows[i].item_promo_info;
                                        itemTemp.quantity = rows[i].quantity;
                                        itemTemp.originPrice = rows[i].item_origin_price;
                                        itemTemp.unitPrice = rows[i].item_unit_price;
                                        itemTemp.actualPrice = rows[i].item_actual_price;
                                        itemTemp.discount = rows[i].item_discount ;
                                        itemTemp.totalPrice = rows[i].item_total_price;
                                        itemTemp.remark = rows[i].item_remark ;
                                        itemTemp.status = rows[i].item_status;

                                        orderItemArray.push(itemTemp);
                                    }
                                    emailParams.bizInfo = bizInfoTemp;
                                    emailParams.custInfo = custInfoTemp;
                                    emailParams.orderInfo = orderInfoTemp;
                                    emailParams.orderItemArray = orderItemArray;
                                    mailUtil.sendSubmitOrderMail(emailParams);

                                }else{
                                    logger.warn('setOrderActive' , ' send submit email failure ');
                                }
                            }
                        });
                    }
                    res.send(200, {success:true,orderId:req.params.orderId});
                    next();
                }
            })
        });

}

function getPaymentClientToken(req,res,next){
    gateway.clientToken.generate({}, function (err, response) {
        if (err){
            logger.error(' getPaymentClientToken ' + err.message);
            throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }else{
            var clientToken = response.clientToken;
            logger.info(' getPaymentClientToken ' + 'success');
            res.send(200, {token:clientToken});
            next();
        }

    });
}

function queryCustomerPayment(req,res,next){
    paymentDao.queryPayment(req.params, function(error , rows){
        if(error){
            logger.error(' queryCustomerPayment ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        logger.info(' queryCustomerPayment ' + 'success');
        res.send(200,rows);
        next();
    });
}

function queryBizPayment(req,res,next){
    paymentDao.queryPayment(req.params, function(error , rows){
        if(error){
            logger.error(' queryBizPayment ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        logger.info(' queryBizPayment ' + 'success');
        res.send(200,rows);
        next();
    });

}

function doRefund(params,callback){
    gateway.transaction.refund(params.transactionId, params.amount, function (err, result) {
       callback(err,result);
    });
}

function queryTransaction(req,res,next){

    gateway.transaction.refund(req.params.transactionId,  function (err, transaction) {
        if(err){
            logger.error(' queryTransaction ' + err.message);
            throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }else{
            logger.info(' queryTransaction ' + 'success');
            res.send(200,transaction);
            next();
        }

    });
}

function queryTransactionById(params,callback){
    gateway.transaction.find(params.transactionId,  function (err, result) {
        callback(err,result);
    });
}

function voidPayment(params,callback){
    gateway.transaction.void(params.transactionId,  function (err, result) {
        callback(err,result);
    });
}

function settlePayment(params,callback){
    gateway.transaction.submitForSettlement(params.transactionId,  function (err, result) {
        callback(err,result);
    });
}

function settleBatchPayment(params,callback){
    gateway.settlementBatchSummary.generate({
        settlementDate: new Date()
    }, function (err, result) {
        callback(err,result);
    });
}

function refundPayment(params,callback){
    gateway.transaction.refund(params.transactionId ,  function (err, result) {
        callback(err,result);
    });
}


function getBizPaymentStat(req,res,next){

    paymentDao.getBizPaymentStat(req.params,function(error,rows){
        if (error){
            logger.error(' getBizPaymentStat ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        logger.info(' getBizPaymentStat ' + 'success');
        res.send(200, rows);
        next();
    })
}

function doAlipay(req,res) {
    var params = req.params;
    var tempObj = {};

    Seq().seq(function () {
        var that = this;
        orderDao.getOrderInfoById(params, function (error, rows) {
            if(error){
                logger.error('doAlipay '+ error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            }else{
                if(rows && rows.length>0){
                    tempObj.orderId = rows[0].id;
                    tempObj.fee = rows[0].total_price;
                    that();
                }else{
                    logger.warn("doAlipay : " + sysMsg.PAYMENT_SERVICE_ORDER_ERROR);
                    res.send(200 ,{success:false,msg:sysMsg.PAYMENT_SERVICE_ORDER_ERROR});
                    return next();
                }
            }

        });
    }).seq(function () {
        var that = this;
        orderDao.getOrderItemById(params, function (error, rows) {
            if(error){
                logger.error('doAlipay '+ error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            }else{
                if(rows && rows.length>0){
                    tempObj.subject = rows[0].prod_name;
                    that();
                }else{
                    logger.warn("doAlipay : " + sysMsg.PAYMENT_SERVICE_ORDER_ERROR);
                    res.send(200 ,{success:false,msg:sysMsg.PAYMENT_SERVICE_ORDER_ERROR});
                    return next();
                }
            }
        })
    }).seq(function () {
        var data = {
            out_trade_no: tempObj.orderId,
            subject: sysConfig.serverName,
            total_fee: tempObj.fee
        };

        if(tempObj.subject != null  && tempObj.fee != null && tempObj.orderId != null){
            //alipaytest.create_direct_pay_by_user_doAlipay(data, res);
            var tempParams = alipayUtil.addParamToConfig(data);
            var htmlStr = alipayUtil.createAlipayForm(tempParams,'get','confirm');
            res.send(200,{success:true,html:htmlStr});
            return next();
        }
    });

};

function queryBizInvoice(req,res,next){
    bizInvoiceDao.queryBizInvoice(req.params,function(error,rows){
        if (error){
            logger.error(' queryBizInvoice ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        logger.info(' queryBizInvoice ' + 'success');
        res.send(200, rows);
        next();
    })
}

function updateBizInvoiceStatus(req,res,next){
    bizInvoiceDao.updateBizInvoiceStatus(req.params,function(error,result){
        if (error){
            logger.error(' updateBizInvoiceStatus ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }else{
            if(result && result.affectedRows > 0){
                logger.info(' updateBizInvoiceStatus' + "true");
                res.send(200 ,{success:true});
                return next();
            }else{
                logger.warn(' updateBizInvoiceStatus' + "failed");
                res.send(200 ,{success:false});
                return next();
            }
        }
    })
}

function addBizInvoice(req,res,next){

    var timeParams = dateUtil.getLastWeekObj();
    req.params.timeParams = timeParams;
    bizInvoiceDao.autoCreateInvoice(req.params,function(error,result){
        if (error){
            logger.error(' addBizInvoice ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }else{
            if(result && result.affectedRows > 0){
                logger.info(' addBizInvoice' + "true");
                res.send(200 ,{success:true});
                return next();
            }else{
                logger.warn(' addBizInvoice' + "failed");
                res.send(200 ,{success:false});
                return next();
            }
        }

    })
}
function doNotify(req,res,next){
    alipaytest.create_direct_pay_by_user_notify(req,res);
}

function receiveAlipayNotify(req,res,next){
    var params = req.params;
    var alipayParams = alipayUtil.createAlipayParams(params);
    if(params.sign == alipayParams.sign){
        var tempObj = {};
        logger.info('receiveAlipayNotify : get alipay notify ');
        logger.info(params);
        Seq().seq(function(){

            var that =this;
            var orderId = {orderId:params.out_trade_no};
            orderDao.getOrderInfoById(orderId,function (error, rows) {

                if(error){
                    logger.error('receiveAlipayNotify ' + error.message);
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                }else{
                    if(rows && rows.length>0){
                        tempObj.orderId = rows[0].id;
                        tempObj.bizId = rows[0].biz_id;
                        tempObj.custId = rows[0].cust_id;
                        tempObj.fee = rows[0].total_price;
                        that();
                    }else{
                        logger.warn('receiveAlipayNotify ' + orderId);
                        res.send(200,{success:false,msg:sysMsg.PAYMENT_SERVICE_ORDER_ERROR});
                        return next();
                    }
                }

            });

        }).seq(function(){

            var that = this;
            var paymentObj = {};
            orderDao.setOrderActive({orderId:params.out_trade_no},function(error,result){

            })
            paymentObj.orderId = params.out_trade_no;
            paymentObj.custId = tempObj.custId;
            paymentObj.bizId = tempObj.bizId;
            paymentObj.paymentId = params.trade_no;
            paymentObj.paymentInfo = params.buyer_email;
            paymentObj.paymentType = 1;
            paymentObj.paymentDue = tempObj.fee;
            paymentObj.paymentActual = params.total_fee;
            paymentObj.status=listOfValue.PAYMENT_STATUS_SETTLEMENT;

            paymentDao.addPayment(paymentObj,function(error,result){
                if(error){
                    logger.error('receiveAlipayNotify ' + error.message);
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                }else{
                    logger.info('receiveAlipayNotify ' + "success");
                    res.send(200,{success:true});
                    return next();
                }

            });


        })
    }else{
        res.send(200,{success:false,msg:sysMsg.PAYMENT_ALIPAY_NOTIFY_SIGN_ERROR});
        return next();
    }
}
module.exports = {
    /**
    test
    testnotifyParameter:testnotifyParameter,
    saveOrder:saveOrder,
    testnotify:testnotify,
    writeLog:writeLog,
    getNotify : getNotify,
    saveOrder:saveOrder,
    */
    doNotify:doNotify,
    doPayment : doPayment,
    doPaypal : doPaypal ,
    doAlipay : doAlipay ,
    getPaymentClientToken : getPaymentClientToken,
    queryCustomerPayment : queryCustomerPayment ,
    queryBizPayment : queryBizPayment,
    doRefund : doRefund ,
    queryTransaction : queryTransaction ,
    queryTransactionById : queryTransactionById ,
    voidPayment : voidPayment ,
    settlePayment : settlePayment ,
    refundPayment : refundPayment ,
    settleBatchPayment : settleBatchPayment,
    getBizPaymentStat : getBizPaymentStat ,

    queryBizInvoice : queryBizInvoice ,
    updateBizInvoiceStatus : updateBizInvoiceStatus ,
    addBizInvoice : addBizInvoice ,
    receiveAlipayNotify : receiveAlipayNotify
}