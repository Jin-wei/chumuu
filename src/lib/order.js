/**
 * Created by ling xue on 14-10-13.
 */

var Seq = require('seq');
var oAuthUtil = require('./util/OAuthUtil.js');
var sysMsg = require('./util/SystemMsg.js');
var sysError = require('./util/SystemError.js');
var orderDao = require('./dao/orderDao.js');
var prodDao = require('./dao/ProdDao.js');
var promoDao = require('./dao/PromoDao.js');
var custDao = require('./dao/custdao.js');
var bizDao = require('./dao/bizdao.js');
var tableDao = require('./dao/TableDao.js');
var callOutDao = require('./dao/callOutDao.js');
var bizOrderSeqDao = require('./dao/bizOrderSeqDao.js');
var bizOrderStatDao = require('./dao/bizOrderStatDao.js');
var paymentDao = require('./dao/paymentDao.js');
var bizUserMobileDao = require('./dao/BizUserMobileDao.js');
var printerDao = require('./dao/printerDao.js');
var wechatDao = require('./dao/WechatDao.js');
var iosPush = require('./IOSPush.js');
var moment = require('moment');
var listOfValue = require('./util/ListOfValue.js');
var mailUtil = require('./util/MailUtil.js');
var baseUtil = require('./util/BaseUtil.js');
var payment = require('../lib/payment.js');
var sysConfig = require('../lib/config/SystemConfig.js');
var serverLogger = require('./util/ServerLogger.js');
var logger = serverLogger.createLogger('Order.js');
var wsClient=require('./serviceclient/WSClient.js').createClient(null);
var printerddj = require('./printerddj');
// 对对机打印
var printhelper = require("./util/printerddj/printhelper.js");
var iconv = require("iconv-lite");
var moment = require('moment');

var http = require('http');        // 通过http模块访问百度的接口
var querystring = require('querystring');    // 处理请求参数的querystring模块
var fs = require('fs');      // fs模块，用来保存语音文件
var path = require('path');    // path模块，处理路径
var os  = require('os');
var getmac = require('getmac');
function getAccessToken(callback){
    var postData = querystring.stringify({
        "grant_type": sysConfig.text2audioConfig.grant_type,        // 固定
        "client_id":sysConfig.text2audioConfig.client_id,           // api key
        "client_secret":sysConfig.text2audioConfig.client_secret    // Secret Key
    });
    var options = {
        "method": "GET",
        "hostname": "openapi.baidu.com",
        "path": "/oauth/2.0/token?" + postData
    };
    var req = http.request(options, function (res) {
        res.on("data", function (chunk) {
            var resJson = JSON.parse(chunk);
            callback(resJson)
        });
    });
    req.end();
}
function getAudio(params,callback){
    var postData = querystring.stringify({
        "tex":params.callText,
        "tok":params.access_token,
        "cuid":params.macAddress,
        "ctp":"1",
        "lan":"zh",
        "per":"4",
        "spd":"5"
    });

    var options = {
        "method": "GET",
        "hostname": "tsn.baidu.com",
        "path": "/text2audio?" + postData
    };
    var req = http.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = Buffer.concat(chunks);
            // // 生成的mp3文件存储的路径，文件名叫做autoid.mp3，这里通过流播放
            // var filePath = path.join(__dirname, '../temp/autoid'+moment()+'.mp3');
            // fs.writeFileSync(filePath, body);
            callback(body)
        });

    });

    req.end();
}
function sendCallOut (req,res,next){
    var params = req.params;
    var tableName,callText,access_token,audioStream,macAddress;
    Seq().seq(function(){
        var that = this;
        //获取桌号
        logger.info('bizId:'+params.bizId + '   code:' + params.code +'   type:' + params.callOutId);
        tableDao.getTableNameByQ(params.code,function(error,rows){
            if (error) {
                logger.error(' getTableNameByQ ' + error.message);
                throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else {
                tableName = rows[0].name;
                logger.info('tableName:'+tableName);
                if(!tableName){
                    logger.info('bizId:'+params.bizId + '   code:' + params.code +'   type:' + params.callOutId+'  tableName:'+tableName);
                    return
                }
                that();
            }
        });
    }).seq(function(){
        var that = this;
        //获取播报内容
        callOutDao.queryAllCallOut(params,function(error,rows){
            if (error) {
                logger.error(' queryAllCallOut ' + error.message);
                throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else {
                callText = rows[0].call_content;
                that();
            }
        });

    }).seq(function(){
        var that = this;
        getAccessToken(function(result){
            access_token = result.access_token;
            logger.info('access_token:'+access_token);
            that();
        })
    }).seq(function(){
        var that = this;
        getmac.getMac(function(error,mac){
            if (error) {
                logger.error(' macAddress ' + error.message);
                throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else {
                macAddress = mac; //获取mac地址
                logger.info('macAddress:'+macAddress);
                that();
            }
        });
    }).seq(function(){
        var that = this;
        var params = {
            access_token:access_token,
            callText:tableName + callText.replace("XXX",""),
            macAddress:macAddress
        };

        getAudio(params,function(result){
            audioStream = result;
            that()
        });

    }).seq(function(){
        var that = this;
        var paramsWS = {
            bizId:params.bizId,
            audioStream:audioStream
        };
        wsClient.callOutCreated(paramsWS, null);

        //手机推送
        var mssage = tableName + callText.replace("XXX","");
        var bizID = bizId.toString()
        baseUtil.pushNotification('',mssage,{},bizID);

        res.send(200, "success");
        next();
    })
}
function createOrder(req,res,next){
    var params=req.params;
    var custId=params.custId, bizId=params.bizId;
    var cust,custBizId, custTableId;
    if (custId==null) {
        throw sysError.MissingParameterError("customer id is required", "customer id is required");
    }
    var orderId;
    var itemArray = req.params.itemArray;
    var prodIds = [];
    for (var i = 0; i < itemArray.length; i++) {
        prodIds.push(itemArray[i].prodId);
    }
    var orderInfo;
    var seq;
    Seq().seq(function() {
        var that = this;
        //validate customer and add table Id
        custDao.searchCust({custId: custId}, function (error, rows) {
            if (error) {
                logger.error(' createOrder ' + error.message);
                throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else {
                if (rows == null || rows.length <= 0) {
                    logger.error(' createOrder: customer not found ');
                    throw sysError.InvalidArgumentError("customer is not found", "customer is not found");
                }
                else {
                    cust = rows[0];
                    custBizId = cust.biz_id;
                    custTableId = cust.table_id;
                    if (custBizId != null && custBizId > 0 && custBizId != bizId) {
                        logger.error(' createOrder: customer biz and order biz not match ');
                        throw sysError.InvalidArgumentError("customer biz and order biz not match", "customer biz and order biz not match");
                    } else {
                        if (custTableId != null && custTableId > 0) {
                            //add table id here
                            req.params.tableId = custTableId;
                        }
                        that();
                    }
                }
            }
        })
    }).seq(function () {
        var that = this;
        computePrice(req.params, function (error, result) {
            if (error) {
                logger.error(' createOrder ' + error.message);
                throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else {
                orderInfo = result;
                req.params.actualPrice = result.actualPrice;//现金额
                req.params.totalTax = result.totalTax;//总税额
                req.params.totalPrice = result.totalPrice;//总金额
                req.params.totalDiscount = result.totalDiscount;//折扣金额
                req.params.originPrice = result.originPrice;//原金额
                that();
            }
        })
    }).seq(function() {
        var that = this;
        orderDao.addCustOrder(req.params, function (error, result) {
            if (error) {
                logger.error(' createOrder ' + error.message);
                throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else {
                orderId = result.insertId;
                req.params.orderId = orderId;
                that();
            }
        });
    }).seq(function() {
        var that = this;
        Seq(orderInfo.itemArray).seqEach(function (item, i) {
            var that = this;
            //get the biz comment and rating info
            item.orderId = orderId
            item.custId = params.custId;
            item.bizId = params.bizId;
            orderDao.addOrderItem(item, function (err, rows) {
                if (err) {
                    logger.error(' createOrder ' + err.message);
                    throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    that(null, i);
                }
            });
        }).seq(function(){
            that();
        })
    }).seq(function() {
        var that = this;
        orderDao.updateOrderSeq(req.params, function (err, result) {
            if (err) {
                logger.error(' updateOrderSeq ' + err.message);
            } else {
                logger.info(' updateOrderSeq ' + result.affectedRows)
            }
            that();
        })
    }).seq(function() {
        var that = this;
        bizOrderSeqDao.increaseBizSeq(req.params, function (err, result) {
            if (err) {
                logger.error(' increaseBizSeq ' + err.message);
            } else {
                logger.info(' increaseBizSeq ' + result.affectedRows)
            }
            that();
        })
    }).seq(function() {
        var that = this;
        orderDao.searchBizSeq(req.params, function (err, result) {
            if (err) {
                logger.error(' searchBizSeq ' + err.message);
            } else {
                logger.info(' seq ' + result[0].seq)
                seq=result[0].seq;
            }
            that();
        })
    }).seq(function() {
        //操作人增加历史
        var that = this;
        if(req.params.operator_id){
            var temy={};
            temy.operation='order';
            temy.customer_id=params.custId;
            temy.operator_id=params.operator_id;

            wechatDao.addDBOperatorHistory(temy, function (err, result) {
                if (err) {
                    logger.error(' addDBOperatorHistory ' + err.message);
                } else {
                    logger.info(' addDBOperatorHistory ' + result);
                }
                that();
            })
        }else{
            that();
        }
    }).seq(function() {
        //notify biz
        wsClient.notifyNewOrderCreated(bizId, null);
        var bizID = bizId.toString()
        baseUtil.pushNotification('','您收到一条订单',{},bizID);
        logger.info(' createOrder ' + 'success');
        res.send(200, {orderId: orderId,seq:seq, orderInfo: req.params});
        next();
    });
}

function getCustOrders(req,res,next){
    var params=req.params;

    orderDao.getCustOrders(req.params,function(error,rows){
        if (error){
            logger.error(' getCustOrders ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        logger.info(' getCustOrders ' + 'success');
        res.send(200, rows);
        next();
    })
}

function getBizOrders(req,res,next){
    var params=req.params;

    orderDao.getBizOrders(req.params,function(error,rows){
        if (error){
            logger.error(' getBizOrders ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        logger.info(' getBizOrders ' + 'success');
        res.send(200, rows);
        next();
    })
}
function getBizOrdersHistory(req,res,next){
    var params=req.params;
    var returnData = [];
    var orderTemp = [];
    Seq().seq(function(){
        var that = this;
        orderDao.getBizOrders(params,function(error,rows){
            if (error){
                logger.error(' getBizOrders ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            }
            logger.info(' getBizOrders ' + 'success');
            orderTemp = rows;
            that()
        })
    }).seq(function(){
        var that = this;
        Seq(orderTemp).seqEach(function(order,i){
            var that =  this;
            var orderElem = JSON.parse(JSON.stringify(order));
            orderElem.orderMoneyDiscount = 0;
            orderElem.orderMoney = 0;
            orderDao.getOrderMoneyDetail({orderId:order.id,bizId:order.biz_id},function(error,result){
                if (error) {
                    logger.error(' getOrderMoneyDetail ' + error.message);
                    throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    if(result && result.length>0){
                        for(var i=0;i<result.length;i++){
                            if(result[i].payment_type == 99999){
                                orderElem.orderMoneyDiscount = result[i].payment_money
                            }else {
                                orderElem.orderMoney = result[i].payment_money;
                                orderElem.checkoutName = result[i].checkout_name
                            }
                        }
                    }
                    returnData.push(orderElem);
                    that(null ,i);
                }
            })
        }).seq(function(){
            res.send(200, returnData);
            next();
        });
    })
}
function getOrderItemById(req,res,next){


    orderDao.getOrderItemById(req.params,function(error,rows){
        if (error){
            logger.error(' getOrderItemById ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        logger.info(' getOrderItemById ' + 'success');
        res.send(200, rows);
        next();
    })
}

function getOrderInfoWithItem(req,res,next){
    orderDao.getOrderInfoWithItem(req.params,function(error,rows){
        if (error){
            logger.error(' getOrderInfoWithItem ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        logger.info(' getOrderInfoWithItem ' + 'success');
        res.send(200, rows);
        next();
    })
}

function updateItemStatus(req,res,next){

    var params = req.params;
    if(params.status  == listOfValue.ITEM_STATUS_CANCELLED){
        var orderInfo  ={};
        var promotionArray = [];
        var orderItemArray = [];
        var bizTaxRate = 0;
        Seq().seq(function(){
            var that = this;
            params.status = listOfValue.ITEM_STATUS_CANCELLED;
            orderDao.updateItemStatus(params,function(error,result){
                if (error) {
                    logger.error(' updateItemStatus ' + error.message);
                    throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                    return;
                } else {
                    if(result.affectedRows >0){
                        that();
                    }else{
                        logger.error(' updateItemStatus ' + error.message);
                        throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                        return;
                    }
                }
            });
        }).seq(function(){
                var that = this;
                orderDao.getOrderInfoById(params,function(error,rows){
                    if (error) {
                        logger.error(' updateItemStatus ' + error.message);
                        throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                        return;
                    } else {
                        if(rows != null && rows.length >0){
                            orderInfo = rows[0];
                            bizTaxRate = orderInfo.tax_rate;
                            that();
                        }else{
                            logger.error(' updateItemStatus ' + error.message);
                            throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                            return;
                        }
                    }
                });
            }).seq(function(){
                var that = this;
                //get biz all promotions in order date
                params.weekday = new Date(moment(orderInfo.order_start).format("YYYY-MM-DD")).getDay() ;
                params.orderStart = moment(orderInfo.order_start).format("YYYY-MM-DD");
                params.bizId = orderInfo.biz_id;
                promoDao.getPromo4Order(params,function(error,rows){
                    if(error){
                        logger.error(' updateItemStatus ' + error.message);
                        throw sysError.InternalError(error.message , sysMsg.SYS_INTERNAL_ERROR_MSG);
                        return;
                    }else{
                        promotionArray = rows;
                        that();
                    }
                })
            }).seq(function(){
                var that = this;
                orderDao.getOrderItemById(params,function(error,rows){
                    if (error) {
                        logger.error(' updateItemStatus ' + error.message);
                        throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                    } else {
                        orderItemArray = rows;
                        var result  = computePriceByOrder(orderItemArray,promotionArray);
                        orderInfo.orderId = orderInfo.id;
                        orderInfo.originPrice = result.originPrice;
                        orderInfo.totalDiscount=  new Number(result.totalDiscount.toFixed(2)).valueOf();
                        orderInfo.actualPrice = result.totalPrice;
                        orderInfo.totalTax = new Number((result.totalPrice*(bizTaxRate/100.0)).toFixed(2)).valueOf();
                        orderInfo.totalPrice = result.totalPrice + orderInfo.totalTax;
                        orderInfo.promoInfo = result.promoInfo;

                        that();
                    }
                });
            }).seq(function(){
                orderDao.updateOrderInfoPrice(orderInfo,function(error , result){
                    if (error) {
                        logger.error(' updateItemStatus ' + error.message);
                        throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                    } else {
                        if(result.affectedRows >0){
                            logger.info(' updateItemStatus ' + 'success');
                            res.send(200,{success:true,orderInfo:orderInfo});
                            next();
                        }else{
                            logger.warn(' updateItemStatus ' + 'failed');
                            res.send(200,{success:false});
                            next();
                        }
                    }
                })
            })
    }else {
        orderDao.updateItemStatus(req.params,function(error,rows){
            if (error){
                logger.error(' updateItemStatus ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                return ;
            }else{
                if(rows.affectedRows >0){
                    logger.info(' updateItemStatus ' + 'success');
                    res.send(200, {success:true});
                    next();
                }else{
                    logger.warn(' updateItemStatus ' + 'failed');
                    res.send(200,{success:false});
                    next();
                }
            }

        })
    }

}

function updateOrderStatus(req,res,next){

    var params = req.params;
    //Order status update to progress ,and set order seq
    if(params.status == listOfValue.ORDER_STATUS_PROGRESS && params.bizId){
        setOrderStatusProgress(req,res,next);
    }else if(params.status == listOfValue.ORDER_STATUS_COMPELETED && params.bizId){
        setOrderStatusComplete(req,res,next);
    }else if(params.status == listOfValue.ORDER_STATUS_CONFIRMED && params.bizId){
        setOrderStatusConfirm(req,res,next);
    }else if(params.status == listOfValue.ORDER_STATUS_CANCELLED){
        setOrderStatusCancel(req,res,next);
    }else {
        logger.error(' updateOrderStatus ' + sysMsg.SYS_INTERNAL_ERROR_MSG);
        throw sysError.InternalError(sysMsg.SYS_INTERNAL_ERROR_MSG,sysMsg.SYS_INTERNAL_ERROR_MSG);
        return ;
    }
        /*orderDao.updateOrderStatus(req.params,function(error,rows){
            if (error){
                logger.error(' updateOrderStatus ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                return ;
            }else{
                if(rows.affectedRows >0){
                    logger.info(' updateOrderStatus ' + 'success');
                    if(params.custId &&
                        (params.status == listOfValue.ORDER_STATUS_CANCELLED || params.status == listOfValue.ORDER_STATUS_CONFIRMED) ){
                        var emailParams  ={};
                        Seq().seq(function(){
                            var that = this;
                            orderDao.getOrderWithItemForMail(req.params,function(err,rows){
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
                                        orderInfoTemp.orderId = params.orderId;
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

                                    }
                                }
                                that();
                            });
                        }).seq(function(){
                                if(params.status == listOfValue.ORDER_STATUS_CANCELLED ){
                                    //send cancelled order notification email to customer
                                    mailUtil.sendCancelledOrderMail(emailParams);

                                }else if(params.status == listOfValue.ORDER_STATUS_CONFIRMED){

                                    //send confirm order notification email to customer
                                    mailUtil.sendConfirmOrderMail(emailParams);
                                }
                                logger.info(' updateOrderStatus ' + ' and send mail success');
                                res.send(200, {success:true});
                                next();
                            })

                    }else{
                        logger.info(' updateOrderStatus ' + 'success');
                        res.send(200, {success:true});
                        next();
                    }

                }else{
                    logger.warn(' updateOrderStatus ' + 'failed');
                    res.send(200,{success:false});
                    next();
                }
            }

        })*/


}

function getOrderPrice(req,res,next){
    var params = req.params;
    computePrice(params,function(error,result){
        if (error){
            logger.error(' updateOrderStatus ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        logger.info(' updateOrderStatus ' + 'success');
        res.send(200, result);
        next();
    });

}

function computePrice(params ,callback){
    var productArray = [];
    var productIds = [];
    var promotionArray = [];
    var bizTaxRate= 0;
    var itemArray = params.itemArray;
    for(var i=0 ; i<itemArray.length ; i++){
        productIds.push(itemArray[i].prodId);
    }
    Seq().seq(function(){
            var that = this;
            //Week_sched from left to right is sun,mon.....sta
            //优惠信息
            params.weekday = new Date(params.orderStart).getDay() ;
            promoDao.getPromo4Order(params,function(error,rows){
                if(error){
                    logger.error(' computePrice ' + error.message);
                    //throw sysError.InternalError(error.message , sysMsg.SYS_INTERNAL_ERROR_MSG);
                    callback(error,null);
                    return;
                }else{
                    promotionArray = rows;
                    that();
                }
            })
        }).seq(function(){
        var that = this;
        prodDao.getProductByIds({bizId:params.bizId,productIds : productIds ,parentId:params.parentId} ,function(error,rows){
            if(error){
                logger.error(' computePrice ' + error.message);
                //throw sysError.InternalError(error.message , sysMsg.SYS_INTERNAL_ERROR_MSG);
                callback(error,null);
                return;
            }else{
                productArray = rows;
                that();
            }
        })
    }).seq(function(){
            var that = this;
            bizDao.getTaxRateByBiz({bizId : params.bizId} ,function(error,rows){
                if(error){
                    logger.error(' computePrice ' + error.message);
                    //throw sysError.InternalError(error.message , sysMsg.SYS_INTERNAL_ERROR_MSG);
                    callback(error,null);
                    return;
                }else{
                    if(rows != null && rows.length>0){
                        bizTaxRate = rows[0].tax_rate;
                    }
                    that();
                }
            });
        }).seq(function(){
            for(var j=0 ;j<itemArray.length; j++){
                var extendPrice = (itemArray[j].extendPrice)?itemArray[j].extendPrice:0;
                for(var i= 0; i<productArray.length ; i++){
                    if(productArray[i].prod_id == itemArray[j].prodId){
                        itemArray[j].prodName = productArray[i].name;
                        itemArray[j].prodNameLang = productArray[i].name_lang;

                        itemArray[j].originPrice = productArray[i].price +extendPrice;//原价
                        itemArray[j].unitPrice = productArray[i].price + extendPrice;//折扣前单价
                        itemArray[j].price = productArray[i].price + extendPrice;//
                        itemArray[j].totalPrice = (productArray[i].price+extendPrice) * itemArray[j].quantity;//总金额
                    }
                }
            }
            var orderPriceInfo = computePriceWithPromo(itemArray,promotionArray);
            var orderTotalTax = orderPriceInfo.totalPrice *bizTaxRate/100.0 ;
            var orderInfo  ={};
            orderInfo.originPrice = orderPriceInfo.originPrice;
            orderInfo.originPrice = new Number(orderInfo.originPrice.toFixed(2)).valueOf();
            orderInfo.actualPrice = orderPriceInfo.totalPrice;
            orderInfo.actualPrice = new Number(orderInfo.actualPrice.toFixed(2)).valueOf();
            orderInfo.totalDiscount = orderPriceInfo.totalDiscount;
            orderInfo.totalDiscount = new Number(orderInfo.totalDiscount.toFixed(2)).valueOf();
            orderInfo.totalPrice = orderPriceInfo.totalPrice + orderTotalTax;
            orderInfo.totalPrice = new Number(orderInfo.totalPrice.toFixed(2)).valueOf();
            orderInfo.totalTax = orderTotalTax ;
            orderInfo.totalTax = new Number(orderInfo.totalTax.toFixed(2)).valueOf();
            orderInfo.itemArray =  orderPriceInfo.productArray ;
            logger.info(' computePrice ' + 'success');
            callback(null,orderInfo);
            return;
        });
}

/**
 * compute the order price without status cancelled menu item
 * @param params
 * @param callback
 */
function computePriceByOrder(itemArray,promotionArray){
    var totalPrice = 0;
    var totalDiscount = 0;
    var totalOrderDiscount = 0;
    var totalOriginPrice = 0;
    var promoInfo = null ;
    for(var i = 0; i<itemArray.length;i++){
        if(itemArray[i].status != listOfValue.ITEM_STATUS_CANCELLED){
            //compute price should except the canceled item;
            totalOriginPrice = totalOriginPrice + itemArray[i].origin_price;
            totalPrice = totalPrice +itemArray[i].actual_price;
            totalDiscount = totalDiscount + itemArray[i].discount;
        }

    }
    for(var j=0; j<promotionArray.length; j++){
        var orderDiscount = 0;
        var promotionTemp = promotionArray[j];
        if(promotionTemp.prod_id == null){
            if(promotionTemp.discount_pct && promotionTemp.discount_pct>0 && totalPrice > promotionTemp.discount_level){
                orderDiscount = totalPrice*promotionTemp.discount_pct/100.0;
            }else{
                if(promotionTemp.dicount_level && totalPrice > promotionTemp.discount_level){
                    orderDiscount = promotionTemp.discount_amount;
                }else if(promotionTemp.discount_level == null){
                    orderDiscount = promotionTemp.discount_amount;
                }
            }
            orderDiscount= new Number(orderDiscount.toFixed(2)).valueOf();
            if(orderDiscount>totalOrderDiscount){
                totalOrderDiscount = orderDiscount;
                promoInfo = promotionTemp.name;
            }
        }
    }
    totalDiscount = totalDiscount + totalOrderDiscount;
    totalPrice = totalPrice - totalOrderDiscount;
    var result = {
        totalPrice : totalPrice,
        totalDiscount : totalDiscount,
        originPrice : totalOriginPrice,
        promoInfo : promoInfo
    }

    return result;
}

function reComputePriceByOrder(itemArray,promotionArray){
    var totalPrice = 0;
    var totalDiscount = 0;
    var totalOrderDiscount = 0;
    var totalOriginPrice = 0;
    var promoInfo = null ;
    for(var i = 0; i<itemArray.length;i++){
        if(itemArray[i].status != listOfValue.ITEM_STATUS_CANCELLED){
            //compute price should except the canceled item;
            totalOriginPrice = totalOriginPrice + itemArray[i].originPrice;
            totalPrice = totalPrice +itemArray[i].actualPrice;
            totalDiscount = totalDiscount + itemArray[i].discount;
        }

    }
    for(var j=0; j<promotionArray.length; j++){
        var orderDiscount = 0;
        var promotionTemp = promotionArray[j];
        if(promotionTemp.prod_id == null){
            if(promotionTemp.discount_pct && promotionTemp.discount_pct>0 && totalPrice > promotionTemp.discount_level){
                orderDiscount = totalPrice*promotionTemp.discount_pct/100.0;
            }else{
                if(promotionTemp.dicount_level && totalPrice > promotionTemp.discount_level){
                    orderDiscount = promotionTemp.discount_amount;
                }else if(promotionTemp.discount_level == null){
                    orderDiscount = promotionTemp.discount_amount;
                }
            }
            orderDiscount= new Number(orderDiscount.toFixed(2)).valueOf();
            if(orderDiscount>totalOrderDiscount){
                totalOrderDiscount = orderDiscount;
                promoInfo = promotionTemp.name;
            }
        }
    }
    totalDiscount = totalDiscount + totalOrderDiscount;
    totalPrice = totalPrice - totalOrderDiscount;
    var result = {
        totalPrice : totalPrice,
        totalDiscount : totalDiscount,
        originPrice : totalOriginPrice,
        promoInfo : promoInfo
    }

    return result;
}

/**
 *compute the products price with product promotion and biz promotion without tax.
 * @param productArray {price,quantity,prodId}
 * @param promotionArray{discount_pct,discount_amount,discount_level,prod_id}
 * @returns {{totalPrice: number, totalDiscount: number, originPrice: number, productArray: *}}
 */
function computePriceWithPromo(productArray , promotionArray){
    var totalPrice = 0;
    var totalDiscount = 0;
    var totalOrderDiscount = 0;
    var totalOriginPrice = 0;
    var orderPromoInfo = null;
    for( var i=0; i<productArray.length; i++){
        var productTemp = productArray[i];
        productTemp.originPrice = productTemp.price*productTemp.quantity;
        productTemp.unitPrice = productTemp.price;
        productTemp.actualPrice =  productTemp.originPrice;
        productTemp.discount = 0;
        for(var j=0; j<promotionArray.length; j++){
            var promotionTemp = promotionArray[j];
            if(promotionTemp.prod_id){
                if(productTemp.prodId == promotionTemp.prod_id){
                    var priceTemp  = {
                        actualPrice : productTemp.originPrice ,
                        discount : productTemp.discount
                    };
                    if(promotionTemp.discount_pct && promotionTemp.discount_pct>0){
                        priceTemp.discount = productTemp.price*productTemp.quantity*promotionTemp.discount_pct/100.0;
                        priceTemp.actualPrice = productTemp.originPrice - priceTemp.discount;

                    }else{
                        priceTemp.discount = promotionTemp.discount_amount*productTemp.quantity;
                        priceTemp.actualPrice = productTemp.originPrice - priceTemp.discount;
                    }
                    priceTemp.discount = new Number(priceTemp.discount.toFixed(2)).valueOf();
                    priceTemp.actualPrice = new Number(priceTemp.actualPrice.toFixed(2)).valueOf();
                    if(priceTemp.discount>productTemp.discount){
                        productTemp.discount = priceTemp.discount;
                        productTemp.actualPrice = priceTemp.actualPrice ;
                        productTemp.promoInfo = promotionTemp.name; //save the product promotion info
                    }
                }
            }
        }
        //Temp for set unit price to unit price
        productTemp.unitPrice = productTemp.price;

        productArray[i]= productTemp;
        totalOriginPrice = totalOriginPrice + productArray[i].originPrice;
        totalPrice = totalPrice + productArray[i].actualPrice;
        totalDiscount = totalDiscount + productArray[i].discount;
    }

    //process the order promotion
    for(var j=0; j<promotionArray.length; j++){
        var orderDiscount = 0;
        var promotionTemp = promotionArray[j];
        if(promotionTemp.prod_id == null){
            if(promotionTemp.discount_pct && promotionTemp.discount_pct>0 && totalPrice > promotionTemp.discount_level){
                orderDiscount = totalPrice*promotionTemp.discount_pct/100.0;
            }else{
                if(promotionTemp.dicount_level && totalPrice > promotionTemp.discount_level){
                    orderDiscount = promotionTemp.discount_amount;
                }else if(promotionTemp.discount_level == null){
                    orderDiscount = promotionTemp.discount_amount;
                }
            }
            orderDiscount= new Number(orderDiscount.toFixed(2)).valueOf();
            if(orderDiscount>totalOrderDiscount){
                totalOrderDiscount = orderDiscount;
                orderPromoInfo = promotionTemp.name ; //save the order promotion info
            }
        }
    }
    totalDiscount = totalDiscount + totalOrderDiscount;
    totalPrice = totalPrice - totalOrderDiscount;
    var result = {
        totalPrice : totalPrice,
        totalDiscount : totalDiscount,
        originPrice : totalOriginPrice,
        promoInfo : orderPromoInfo,
        productArray : productArray
    }

    return result;

}

function addItemToOrder(req,res,next){


    var params = req.params;
    var orderInfo = {};
    var productArray = [];
    var bizTaxRate = 0;
    var promotionArray = [];
    var itemArray = params.itemArray ;
    var orderItemArray = [];
    var orderItemIds =[];


    Seq().seq(function(){
        var that = this;
        orderDao.getProdWithOrderInfo(params,function(error,rows){
            if(error){
                logger.error(' addItemToOrder ' + error.message);
                throw sysError.InternalError(error.message , sysMsg.SYS_INTERNAL_ERROR_MSG);
                return;
            }else{
                if(rows != null && rows.length>0){
                    //get the orderInfo
                    orderInfo = rows[0];
                    //get the biz tax rate
                    if(rows[0].tax_rate ){
                        bizTaxRate = rows[0].tax_rate;
                    }
                    //get the product to reset info
                    for(var i=0; i<rows.length; i++){
                        var p = {};
                        p.prod_id = rows[0].prod_id;
                        p.price = rows[0].price;
                        p.name = rows[0].name;
                        productArray.push(p);
                    }
                    that();
                }else{
                    logger.error(' addItemToOrder ' + error.message);
                    throw sysError.InternalError(error.message , sysMsg.SYS_INTERNAL_ERROR_MSG);
                    return;
                }
            }
        })
    }).seq(function(){
            var that = this;
            //get biz all promotions in order date
            params.weekday = new Date(moment(orderInfo.order_start).format("YYYY-MM-DD")).getDay() ;
            params.orderStart = moment(orderInfo.order_start).format("YYYY-MM-DD");
            params.bizId = orderInfo.biz_id;
            promoDao.getPromo4Order(params,function(error,rows){
                if(error){
                    logger.error(' addItemToOrder ' + error.message);
                    throw sysError.InternalError(error.message , sysMsg.SYS_INTERNAL_ERROR_MSG);
                    return;
                }else{
                    promotionArray = rows;
                    that();
                }
            })
        }).seq(function(){
            var that = this;
            for (var i =0; i<productArray.length ; i++){
                for(var j=0; j<itemArray.length; j++){
                    if(productArray[i].prod_id == itemArray[j].prodId){
                        itemArray[j].price = productArray[i].price;
                        itemArray[j].prodName = productArray[i].name;
                        itemArray[j].prodNameLang = productArray[i].name_lang;
                    }
                }
            }
            Seq(itemArray).seqEach(function(productTemp,i){
                var that =  this;
                productTemp.originPrice = productTemp.price*productTemp.quantity;
                productTemp.unitPrice = productTemp.price;
                productTemp.actualPrice =  productTemp.originPrice;
                productTemp.discount = 0;
                for(var j=0; j<promotionArray.length; j++){
                    var promotionTemp = promotionArray[j];
                    if(promotionTemp.prod_id){
                        if(productTemp.prodId == promotionTemp.prod_id){
                            var priceTemp  = {
                                actualPrice : productTemp.originPrice ,
                                discount : productTemp.discount
                            };
                            if(promotionTemp.discount_pct && promotionTemp.discount_pct>0){
                                priceTemp.discount = productTemp.price*productTemp.quantity*promotionTemp.discount_pct/100.0;
                                priceTemp.actualPrice = productTemp.originPrice - priceTemp.discount;

                            }else{
                                priceTemp.discount = promotionTemp.discount_amount*productTemp.quantity;
                                priceTemp.actualPrice = productTemp.originPrice - priceTemp.discount;
                            }
                            priceTemp.discount = new Number(priceTemp.discount.toFixed(2)).valueOf();
                            priceTemp.actualPrice = new Number(priceTemp.actualPrice.toFixed(2)).valueOf();
                            if(priceTemp.discount>productTemp.discount){
                                productTemp.discount = priceTemp.discount;
                                productTemp.actualPrice = priceTemp.actualPrice ;
                                productTemp.promoInfo = promotionTemp.name; //save the product promotion info
                            }
                        }
                    }
                }
                productTemp.orderId = orderInfo.id;
                productTemp.bizId = orderInfo.biz_id;
                productTemp.totalPrice = productTemp.actualPrice;
                productTemp.custId = params.custId;
                orderDao.addItemToOrder(productTemp,function(error,result){
                    if (error) {
                        logger.error(' addItemToOrder ' + error.message);
                        throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                    } else {
                        orderItemIds.push(result.insertId);
                        that(null ,i);
                    }
                })
            }).seq(function(){
                    that();
                });

        }).seq(function(){
            var that = this;
            orderDao.getOrderItemById({orderId:orderInfo.id},function(error,rows){
                if (error) {
                    logger.error(' addItemToOrder ' + error.message);
                    throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    orderItemArray = rows;
                    var result  = computePriceByOrder(orderItemArray,promotionArray);
                    orderInfo.orderId = orderInfo.id;
                    orderInfo.originPrice = result.originPrice;
                    orderInfo.totalDiscount=  new Number(result.totalDiscount.toFixed(2)).valueOf();
                    orderInfo.actualPrice = result.totalPrice;
                    orderInfo.totalTax = new Number((result.totalPrice*(bizTaxRate/100.0)).toFixed(2)).valueOf();
                    orderInfo.totalPrice = result.totalPrice + orderInfo.totalTax;
                    orderInfo.promoInfo = result.promoInfo;

                    that();
                }
            });
        }).seq(function(){
            orderDao.updateOrderInfoPrice(orderInfo,function(error , result){
                if (error) {
                    logger.error(' addItemToOrder ' + error.message);
                    throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    if(result.affectedRows >0){
                        logger.info(' addItemToOrder ' + 'success');
                        res.send(200,{success:true,orderInfo:orderInfo,ids:orderItemIds});
                        next();
                    }else{
                        logger.warn(' addItemToOrder ' + 'failed');
                        res.send(200,{success:false});
                        next();
                    }
                }
            })
        });


}

function cancelItemInOrder(req,res,next){
    var combineCheck = oAuthUtil.checkCombineToken(req);
    if(!combineCheck){
        logger.error(' cancelItemInOrder ' + sysMsg.SYS_AUTH_TOKEN_ERROR);
        return next(sysError.NotAuthorizedError());
    }

    var params = req.params;
    var orderInfo  ={};
    var promotionArray = [];
    var orderItemArray = [];
    var bizTaxRate = 0;
    Seq().seq(function(){
        var that = this;
        params.status = listOfValue.ITEM_STATUS_CANCELLED;
        orderDao.updateItemStatus(params,function(error,result){
            if (error) {
                logger.error(' cancelItemInOrder ' + error.message);
                throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                return;
            } else {
                if(result.affectedRows >0){
                    that();
                }else{
                    logger.warn(' cancelItemInOrder ' + 'failed');
                    throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                    return;
                }
            }
        });
    }).seq(function(){
            var that = this;
            orderDao.getOrderInfoById(params,function(error,rows){
                if (error) {
                    logger.error(' cancelItemInOrder ' + error.message);
                    throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                    return;
                } else {
                    if(rows != null && rows.length >0){
                        orderInfo = rows[0];
                        bizTaxRate = orderInfo.tax_rate;
                        that();
                    }else{
                        logger.warn(' cancelItemInOrder ' + 'failed');
                        throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                        return;
                    }
                }
            });
        }).seq(function(){
            var that = this;
            //get biz all promotions in order date
            params.weekday = new Date(moment(orderInfo.order_start).format("YYYY-MM-DD")).getDay() ;
            params.orderStart = moment(orderInfo.order_start).format("YYYY-MM-DD");
            params.bizId = orderInfo.biz_id;
            promoDao.getPromo4Order(params,function(error,rows){
                if(error){
                    logger.error(' cancelItemInOrder ' + error.message);
                    throw sysError.InternalError(error.message , sysMsg.SYS_INTERNAL_ERROR_MSG);
                    return;
                }else{
                    promotionArray = rows;
                    that();
                }
            })
        }).seq(function(){
            var that = this;
            orderDao.getOrderItemById(params,function(error,rows){
                if (error) {
                    logger.error(' cancelItemInOrder ' + error.message);
                    throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    orderItemArray = rows;
                    var result  = computePriceByOrder(orderItemArray,promotionArray);
                    orderInfo.orderId = orderInfo.id;
                    orderInfo.originPrice = result.originPrice;
                    orderInfo.totalDiscount=  new Number(result.totalDiscount.toFixed(2)).valueOf();
                    orderInfo.actualPrice = result.totalPrice;
                    orderInfo.totalTax = new Number((result.totalPrice*(bizTaxRate/100.0)).toFixed(2)).valueOf();
                    orderInfo.totalPrice = result.totalPrice + orderInfo.totalTax;
                    orderInfo.promoInfo = result.promoInfo;

                    that();
                }
            });
        }).seq(function(){
            orderDao.updateOrderInfoPrice(orderInfo,function(error , result){
                if (error) {
                    logger.error(' cancelItemInOrder ' + error.message);
                    throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    if(result.affectedRows >0){
                        logger.info(' cancelItemInOrder ' + 'success');
                        res.send(200,{success:true,orderInfo:orderInfo});
                        next();
                    }else{
                        logger.warn(' cancelItemInOrder ' + 'failed');
                        res.send(200,{success:false});
                        next();
                    }
                }
            })
        })
}

function resetOrderItemSize(req,res,next){


    var params = req.params;
    var orderInfo = {};
    var productArray = [];
    var bizTaxRate = 0;
    var promotionArray = [];
    var itemArray = params.itemArray ;
    var orderItemArray = [];


    Seq().seq(function(){
        var that = this;
        orderDao.getProdWithOrderInfo(params,function(error,rows){
            if(error){
                logger.error(' resetOrderItemSize ' + error.message);
                throw sysError.InternalError(error.message , sysMsg.SYS_INTERNAL_ERROR_MSG);
                return;
            }else{
                if(rows != null && rows.length>0){
                    //get the orderInfo
                    orderInfo = rows[0];
                    //get the biz tax rate
                    if(rows[0].tax_rate ){
                        bizTaxRate = rows[0].tax_rate;
                    }
                    //get the product to reset info
                    for(var i=0; i<rows.length; i++){
                        var p = {};
                        p.prod_id = rows[0].prod_id;
                        p.price = rows[0].price;
                        p.name = rows[0].name;
                        productArray.push(p);
                    }
                    that();
                }else{
                    logger.error(' resetOrderItemSize ' + error.message);
                    throw sysError.InternalError(error.message , sysMsg.SYS_INTERNAL_ERROR_MSG);
                    return;
                }
            }
        })
    }).seq(function(){
            var that = this;
            //get biz all promotions in order date
            params.weekday = new Date(moment(orderInfo.order_start).format("YYYY-MM-DD")).getDay() ;
            params.orderStart = moment(orderInfo.order_start).format("YYYY-MM-DD");
            params.bizId = orderInfo.biz_id;
            promoDao.getPromo4Order(params,function(error,rows){
                if(error){
                    logger.error(' resetOrderItemSize ' + error.message);
                    throw sysError.InternalError(error.message , sysMsg.SYS_INTERNAL_ERROR_MSG);
                    return;
                }else{
                    promotionArray = rows;
                    that();
                }
            })
        }).seq(function(){
            var that = this;
            for (var i =0; i<productArray.length ; i++){
                for(var j=0; j<itemArray.length; j++){
                    if(productArray[i].prod_id == itemArray[j].prodId){
                        itemArray[j].price = productArray[i].price;
                        itemArray[j].prodName = productArray[i].name;
                        itemArray[j].prodNameLang = productArray[i].name_lang;
                    }
                }
            }
            Seq(itemArray).seqEach(function(productTemp,i){
                var that =  this;
                productTemp.originPrice = productTemp.price*productTemp.quantity;
                productTemp.unitPrice = productTemp.price;
                productTemp.actualPrice =  productTemp.originPrice;
                productTemp.discount = 0;
                for(var j=0; j<promotionArray.length; j++){
                    var promotionTemp = promotionArray[j];
                    if(promotionTemp.prod_id){
                        if(productTemp.prodId == promotionTemp.prod_id){
                            var priceTemp  = {
                                actualPrice : productTemp.originPrice ,
                                discount : productTemp.discount
                            };
                            if(promotionTemp.discount_pct && promotionTemp.discount_pct>0){
                                priceTemp.discount = productTemp.price*productTemp.quantity*promotionTemp.discount_pct/100.0;
                                priceTemp.actualPrice = productTemp.originPrice - priceTemp.discount;

                            }else{
                                priceTemp.discount = promotionTemp.discount_amount*productTemp.quantity;
                                priceTemp.actualPrice = productTemp.originPrice - priceTemp.discount;
                            }
                            priceTemp.discount = new Number(priceTemp.discount.toFixed(2)).valueOf();
                            priceTemp.actualPrice = new Number(priceTemp.actualPrice.toFixed(2)).valueOf();
                            if(priceTemp.discount>productTemp.discount){
                                productTemp.discount = priceTemp.discount;
                                productTemp.actualPrice = priceTemp.actualPrice ;
                                productTemp.promoInfo = promotionTemp.name; //save the product promotion info
                            }
                        }
                    }
                }
                productTemp.orderId = orderInfo.id;
                productTemp.bizId = orderInfo.biz_id;
                productTemp.totalPrice = productTemp.actualPrice;
                productTemp.custId = params.custId;
                orderDao.updateOrderItem(productTemp,function(error,result){
                    if (error) {
                        logger.error(' resetOrderItemSize ' + error.message);
                        throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                    } else {
                        that(null ,i);
                    }
                })
            }).seq(function(){
                    that();
                });

        }).seq(function(){
            var that = this;
            orderDao.getOrderItemById({orderId:orderInfo.id},function(error,rows){
                if (error) {
                    logger.error(' resetOrderItemSize ' + error.message);
                    throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    orderItemArray = rows;
                    var result  = computePriceByOrder(orderItemArray,promotionArray);
                    orderInfo.orderId = orderInfo.id;
                    orderInfo.originPrice = result.originPrice;
                    orderInfo.totalDiscount=  new Number(result.totalDiscount.toFixed(2)).valueOf();
                    orderInfo.actualPrice = result.totalPrice;
                    orderInfo.totalTax = new Number((result.totalPrice*(bizTaxRate/100.0)).toFixed(2)).valueOf();
                    orderInfo.totalPrice = result.totalPrice + orderInfo.totalTax;
                    orderInfo.promoInfo = result.promoInfo;

                    that();
                }
            });
        }).seq(function(){
            orderDao.updateOrderInfoPrice(orderInfo,function(error , result){
                if (error) {
                    logger.error(' resetOrderItemSize ' + error.message);
                    throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    if(result.affectedRows >0){
                        logger.info(' resetOrderItemSize ' + 'success');
                        res.send(200,{success:true,orderInfo:orderInfo});
                        next();
                    }else{
                        logger.warn(' resetOrderItemSize ' + 'failed');
                        res.send(200,{success:false});
                        next();
                    }
                }
            })
        });


}

function deleteOrderItem(req,res,next){

    var params = req.params;
    var orderInfo  ={};
    var promotionArray = [];
    var orderItemArray = [];
    var bizTaxRate = 0;
    Seq().seq(function(){
        var that = this;

        orderDao.deleteOrderItem(params,function(error,result){
            if (error) {
                logger.error(' deleteOrderItem ' + error.message);
                throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                return;
            } else {
                if(result.affectedRows >0){
                    that();
                }else{
                    logger.warn(' deleteOrderItem ' + 'failed');
                    throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                    return;
                }
            }
        });
    }).seq(function(){
            var that = this;
            orderDao.getOrderInfoById(params,function(error,rows){
                if (error) {
                    logger.error(' deleteOrderItem ' + error.message);
                    throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                    return;
                } else {
                    if(rows != null && rows.length >0){
                        orderInfo = rows[0];
                        bizTaxRate = orderInfo.tax_rate;
                        that();
                    }else{
                        logger.error(' deleteOrderItem ' + error.message);
                        throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                        return;
                    }
                }
            });
        }).seq(function(){
            var that = this;
            //get biz all promotions in order date
            params.weekday = new Date(moment(orderInfo.order_start).format("YYYY-MM-DD")).getDay() ;
            params.orderStart = moment(orderInfo.order_start).format("YYYY-MM-DD");
            params.bizId = orderInfo.biz_id;
            promoDao.getPromo4Order(params,function(error,rows){
                if(error){
                    logger.error(' deleteOrderItem ' + error.message);
                    throw sysError.InternalError(error.message , sysMsg.SYS_INTERNAL_ERROR_MSG);
                    return;
                }else{
                    promotionArray = rows;
                    that();
                }
            })
        }).seq(function(){
            var that = this;
            orderDao.getOrderItemById(params,function(error,rows){
                if (error) {
                    logger.error(' deleteOrderItem ' + error.message);
                    throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    orderItemArray = rows;
                    var result  = computePriceByOrder(orderItemArray,promotionArray);
                    orderInfo.orderId = orderInfo.id;
                    orderInfo.originPrice = result.originPrice;
                    orderInfo.totalDiscount=  new Number(result.totalDiscount.toFixed(2)).valueOf();
                    orderInfo.actualPrice = result.totalPrice;
                    orderInfo.totalTax = new Number((result.totalPrice*(bizTaxRate/100.0)).toFixed(2)).valueOf();
                    orderInfo.totalPrice = result.totalPrice + orderInfo.totalTax;
                    orderInfo.promoInfo = result.promoInfo;

                    that();
                }
            });
        }).seq(function(){
            orderDao.updateOrderInfoPrice(orderInfo,function(error , result){
                if (error) {
                    logger.error(' deleteOrderItem ' + error.message);
                    throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    if(result.affectedRows >0){
                        logger.info(' deleteOrderItem ' + 'success');
                        res.send(200,{success:true,orderInfo:orderInfo});
                        next();
                    }else{
                        logger.warn(' deleteOrderItem ' + 'failed');
                        res.send(200,{success:false});
                        next();
                    }
                }
            })
        })
}

function updateOrderTable(req,res,next){
    var params=req.params;

    orderDao.updateOrderTable(params,function(error,result){
        if (error) {
            logger.error(' updateOrderTable ' + error.message);
            throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else {
            if(result.affectedRows >0){
                logger.info(' updateOrderTable ' + 'success');
                res.send(200,{success:true});
                next();
            }else{
                logger.warn(' updateOrderTable ' + 'failed');
                res.send(200,{success:false});
                next();
            }
        }

    });
}

function getBizTableOrders(req,res,next){
    var params=req.params;

    orderDao.getBizTableOrders(params,function(error,rows){
        if (error) {
            logger.error(' getBizTableOrders ' + error.message);
            throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else {
            logger.info(' getBizTableOrders ' + 'success');
            res.send(200,rows);
            next();
        }

    });
}

/**
 * Create a order without compute price
 * @param req
 * @param res
 * @param next
 */
function createOrderNoPrice(req ,res ,next){
    var params=req.params;

    var orderId ;

    var prodIds = [];
    if(params.itemArray != null && params.itemArray.length>0){
        var itemArray = params.itemArray;
        for(var i=0;i<itemArray.length;i++){
            prodIds.push(itemArray[i].prodId);
        }
    }


    Seq().seq(function(){
        var that = this;
        orderDao.addCustOrder(req.params ,function(error,result){
            if(error){
                logger.error(' createOrderNoPrice ' + error.message);
                throw sysError.InternalError(error.message , sysMsg.SYS_INTERNAL_ERROR_MSG);
            }else{
                orderId = result.insertId;
                that();
            }
        });
    }).seq(function(){
            var that = this;
            if(itemArray !=null && itemArray.length >0){
                var productArray ;
                prodDao.getProductByIds({bizId:params.bizId,productIds : prodIds} ,function(error,rows){
                    if(error){
                        logger.error(' createOrderNoPrice ' + error.message);
                        //throw sysError.InternalError(error.message , sysMsg.SYS_INTERNAL_ERROR_MSG);
                        callback(error,null);
                        return;
                    }else{
                        productArray = rows;
                        for(var j=0 ;j<itemArray.length; j++){
                            for(var i= 0; i<productArray.length ; i++){
                                if(productArray[i].prod_id == itemArray[j].prodId){
                                    itemArray[j].prodName = productArray[i].name;
                                    itemArray[j].prodNameLang = productArray[i].name_lang;
                                }
                            }
                        }
                        that();
                    }
                })
            }else{
                that();
            }

        }).seq(function(){
            if(itemArray !=null && itemArray.length >0){
                Seq(itemArray).seqEach(function(item,i){
                    var that =  this;

                    item.orderId = orderId;
                    item.bizId = params.bizId;
                    orderDao.addOrderItem(item, function (err, rows) {
                        if (err) {
                            logger.error(' createOrderNoPrice ' + err.message);
                            throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                        } else {
                            that(null,i);
                        }
                    });

                }).seq(function(){
                        logger.info(' createOrderNoPrice ' + ' success');
                        res.send(200,{orderId:orderId});
                        next();
                    });
            }else{
                logger.info(' createOrderNoPrice ' + 'success');
                res.send(200,{orderId:orderId});
                next();
            }
        });

}

/**
 * Add a menu items to order without compute item price and order price;
 * @param req
 * @param res
 * @param next
 */
function addItemsNoPrice(req,res,next){
    var params=req.params;

    var orderId = params.orderId;
    var itemArray = params.itemArray;
    var prodIds = [];
    var orderPriceParams = {}
    for(var i=0;i<itemArray.length;i++){
        prodIds.push(itemArray[i].prodId);
    }
    var itemIds = [];
    Seq().seq(function(){
        var that = this;
        if(itemArray !=null && itemArray.length >0){
            var productArray ;
            prodDao.getProductByIds({bizId:params.bizId,productIds : prodIds} ,function(error,rows){
                if(error){
                    logger.error(' addItemsNoPrice ' + error.message);
                    //throw sysError.InternalError(error.message , sysMsg.SYS_INTERNAL_ERROR_MSG);
                    callback(error,null);
                    return;
                }else{
                    productArray = rows;
                    for(var j=0 ;j<itemArray.length; j++){
                        for(var i= 0; i<productArray.length ; i++){
                            if(productArray[i].prod_id == itemArray[j].prodId){
                                itemArray[j].prodName = productArray[i].name;
                                itemArray[j].prodNameLang = productArray[i].name_lang;
                                //Temporary for unit price set unit price
                                itemArray[j].unitPrice = productArray[i].price;
                            }
                        }
                    }
                    that();
                }
            })
        }else{
            that();
        }
    }).seq(function(){
        var that = this;
        Seq(itemArray).seqEach(function(item,i){
            var that =  this;
            item.orderId = orderId;
            item.bizId = params.bizId;
            item.originPrice = item.unitPrice*item.quantity;
            item.actualPrice = item.unitPrice*item.quantity;
            item.totalPrice = item.unitPrice*item.quantity;

            orderPriceParams.orderId = orderId;
            orderPriceParams.bizId = params.bizId;
            orderPriceParams.originPrice = item.originPrice;
            orderPriceParams.actualPrice = item.actualPrice;
            orderPriceParams.totalPrice = item.totalPrice;

            orderDao.addOrderItem(item, function (err, rows) {
                if (err) {
                    logger.error(' addItemsNoPrice ' + err.message);
                    throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    itemIds.push(rows.insertId);
                    that(null,i);
                }
            });
        }).seq(function(){
            // logger.info(' addItemsNoPrice ' + 'success');
            // res.send(200,{success:true,itemIds:itemIds});
            // next();
            that()
        });
    }).seq(function(){
        var that = this
        orderDao.updateOrderInfoPriceAddItem(orderPriceParams,function(err,rows){
            if (err) {
                logger.error(' addItemsNoPrice ' + err.message);
                throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else {
                logger.info(' addItemsNoPrice ' + 'success');
                res.send(200,{success:true,itemIds:itemIds});
                next();
            }
        })
    })

}


/**
 *
 * @param req
 * @param res
 * @param next
 */
function resetItemSizeNoPrice(req,res,next){
    //TODO Need the function that reset item size or not
}


/**
 * delete items from menu where do not recompute order price
 * @param req
 * @param res
 * @param next
 */
function deleteItemNoPrice(req,res,next){
    var params=req.params;


    /*var itemArray = params.itemArray;
    var prodIds = [];
    for(var i=0;i<itemArray.length;i++){
        prodIds.push(itemArray[i].itemId);
    }*/
    orderDao.deleteOrderItem(params , function(error,result){
        if (error) {
            logger.error(' deleteItemNoPrice ' + error.message);
            throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else {
            logger.info(' deleteItemNoPrice ' + 'success');
            res.send(200,{success:true});
            next();
        }
    });
}

/**
 * Recompute the order price and items price in order ,access only by biz
 * @param req
 * @param res
 * @param next
 */
function reUpdateOrderPrice(req,res,next){

    var params=req.params;


    var params = req.params;
    var orderInfo = {};
    var productArray = [];
    var bizTaxRate = 0;
    var promotionArray = [];
    var itemArray = [] ;
    var orderItemArray = [];


    Seq().seq(function(){
        var that = this;
        orderDao.getProdWithItemInfo(params,function(error,rows){
            if(error){
                logger.error(' reUpdateOrderPrice ' + error.message);
                throw sysError.InternalError(error.message , sysMsg.SYS_INTERNAL_ERROR_MSG);
                return;
            }else{
                if(rows != null && rows.length>0){
                    //get the orderInfo
                    orderInfo = rows[0];
                    //get the biz tax rate
                    if(rows[0].tax_rate ){
                        bizTaxRate = rows[0].tax_rate;
                    }
                    //get the product to reset info
                    for(var i=0; i<rows.length; i++){
                        var p = {};
                        p.prodId = rows[i].prod_id;
                        p.price = rows[i].price;
                        p.prodName = rows[i].name;
                        p.prodNameLang = rows[i].name_lang;
                        p.itemId = rows[i].id;
                        p.quantity = rows[i].quantity;
                        p.orderId = rows[i].order_id;
                        itemArray.push(p);
                    }
                    productArray = rows;
                    that();
                }else{
                    logger.error('no order items found');
                    throw sysError.InternalError('no order item found' , sysMsg.SYS_INTERNAL_ERROR_MSG);
                    return;
                }
            }
        })
    }).seq(function(){
            var that = this;
            //get biz all promotions in order date
            params.weekday = new Date(moment(orderInfo.order_start).format("YYYY-MM-DD")).getDay() ;
            params.orderStart = moment(orderInfo.order_start).format("YYYY-MM-DD");
            params.bizId = orderInfo.biz_id;
            promoDao.getPromo4Order(params,function(error,rows){
                if(error){
                    logger.error(' reUpdateOrderPrice ' + error.message);
                    throw sysError.InternalError(error.message , sysMsg.SYS_INTERNAL_ERROR_MSG);
                    return;
                }else{
                    promotionArray = rows;
                    that();
                }
            })
        }).seq(function(){
            var that = this;
            /*for (var i =0; i<productArray.length ; i++){
                for(var j=0; j<itemArray.length; j++){
                    if(productArray[i].prod_id == itemArray[j].prodId){
                        itemArray[j].price = productArray[i].price;
                        itemArray[j].prodName = productArray[i].name;
                    }
                }
            }*/
            Seq(itemArray).seqEach(function(productTemp,i){
                var that =  this;
                productTemp.originPrice = productTemp.price*productTemp.quantity;
                productTemp.unitPrice = productTemp.price;
                productTemp.actualPrice =  productTemp.originPrice;
                productTemp.discount = 0;
                for(var j=0; j<promotionArray.length; j++){
                    var promotionTemp = promotionArray[j];
                    if(promotionTemp.prod_id){
                        if(productTemp.prodId == promotionTemp.prod_id){
                            var priceTemp  = {
                                actualPrice : productTemp.originPrice ,
                                discount : productTemp.discount
                            };
                            if(promotionTemp.discount_pct && promotionTemp.discount_pct>0){
                                priceTemp.discount = productTemp.price*productTemp.quantity*promotionTemp.discount_pct/100.0;
                                priceTemp.actualPrice = productTemp.originPrice - priceTemp.discount;

                            }else{
                                priceTemp.discount = promotionTemp.discount_amount*productTemp.quantity;
                                priceTemp.actualPrice = productTemp.originPrice - priceTemp.discount;
                            }
                            priceTemp.discount = new Number(priceTemp.discount.toFixed(2)).valueOf();
                            priceTemp.actualPrice = new Number(priceTemp.actualPrice.toFixed(2)).valueOf();
                            if(priceTemp.discount>productTemp.discount){
                                productTemp.discount = priceTemp.discount;
                                productTemp.actualPrice = priceTemp.actualPrice ;
                                productTemp.promoInfo = promotionTemp.name; //save the product promotion info
                            }
                        }
                    }
                }
                productTemp.orderId = orderInfo.order_id;
                productTemp.bizId = orderInfo.biz_id;
                productTemp.totalPrice = productTemp.actualPrice;
                productTemp.custId = params.custId;
                orderDao.updateOrderItem(productTemp,function(error,result){
                    if (error) {
                        logger.error(' reUpdateOrderPrice ' + error.message);
                        throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                    } else {
                        that(null ,i);
                    }
                })
            }).seq(function(){
                    that();
                });

        }).seq(function(){

            var result  = reComputePriceByOrder(itemArray,promotionArray);
            orderInfo.orderId = orderInfo.order_id;
            orderInfo.originPrice = result.originPrice;
            orderInfo.totalDiscount=  new Number(result.totalDiscount.toFixed(2)).valueOf();
            orderInfo.actualPrice = result.totalPrice;
            orderInfo.totalTax = new Number((result.totalPrice*(bizTaxRate/100.0)).toFixed(2)).valueOf();
            orderInfo.totalPrice = result.totalPrice + orderInfo.totalTax;
            orderInfo.promoInfo = result.promoInfo;
            orderDao.updateOrderInfoPrice(orderInfo,function(error , result){
                if (error) {
                    logger.error(' reUpdateOrderPrice ' + error.message);
                    throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    if(result.affectedRows >0){
                        logger.info(' reUpdateOrderPrice ' + 'success');
                        res.send(200,{success:true,orderInfo:orderInfo});
                        next();
                    }else{
                        logger.warn(' reUpdateOrderPrice ' + 'failed');
                        res.send(200,{success:false});
                        next();
                    }
                }
            })
        });
}

function getBizOrderCustomer(req,res,next){
    var params=req.params;

    orderDao.getBizOrderCustomer(params , function(error,rows){
        if (error) {
            logger.error(' getBizOrderCustomer ' + error.message);
            throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else {
            logger.info(' getBizOrderCustomer ' + 'success');
            res.send(200,rows);
            next();
        }
    });
}

function getOrderForInvoice(req,res,next){
    var params=req.params;

    var bizInfo  ={};
    Seq().seq(function(){
        var that = this;
        bizDao.getTaxRateByBiz(params,function(error,rows){
            if (error) {
                logger.error(' getOrderForInvoice ' + error.message);
                throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else {
                logger.info(' getOrderForInvoice ' + 'get biz info success');
                bizInfo = rows[0];
            }
            that();
        })
    }).seq(function(){
            orderDao.getOrderInfoWithItem(params,function(error,rows){
                if (error) {
                    logger.error(' getOrderForInvoice ' + error.message);
                    throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    logger.info(' getOrderForInvoice ' + 'get biz info success');
                    res.send(200,{bizInfo:bizInfo,orderInfo:rows});
                    next();
                }

            })
        });
}

function finishBizOrder(req,res,next){
    var params=req.params;
    /*var tokenInfo = oAuthUtil.checkAccessToken(req);
    if(tokenInfo == null || params.bizId != tokenInfo.id){
        logger.error(' finishBizOrder ' + sysMsg.SYS_AUTH_TOKEN_ERROR);
        next(sysError.NotAuthorizedError());
        return;
    }*/
    var finishOrderNum = 0;
    var expiredOrderNum = 0;
    var dateId = 0;
    Seq().seq(function(){
        var that = this;
        orderDao.getDayOrder({bizId:params.bizId,status:listOfValue.ORDER_STATUS_PROGRESS},function(error,rows){
            if (error) {
                logger.error(' finishBizOrder ' + error.message);
                throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else {
                if(rows && rows.length>0){
                    logger.warn(' finishBizOrder ' + 'biz has order in progress');
                    res.send(200,{success:false,ids:rows});
                    next();
                }else{
                    that();
                }
            }
        });
    }).seq(function(){
            var that = this;
            //get date_dimension id current day.save day finish payment in db
            var dateObj = {};
            var today = new Date();
            dateObj.day = today.getDate();
            dateObj.month = today.getMonth()+1;
            dateObj.year = today.getFullYear();
            dateObj.week = baseUtil.getWeekByDate();
            dateObj.yearMonth = Number(dateObj.year+""+dateObj.month);
            dateObj.yearWeek = Number(dateObj.year+""+dateObj.week);
            bizOrderStatDao.insertNewDate(dateObj,function(error,result){
                if (error) {
                    logger.error(' finishBizOrder ' + error.message);
                    throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    dateId = result.dateId;
                    that();
                }
            });

        }).seq(function(){
            var that = this;
            //save current biz order stat into biz_order_stat table
            bizOrderStatDao.addBizDayOrderStat({bizId:params.bizId,dateId:dateId},function(error,result){
                if (error) {
                    logger.error(' finishBizOrder ' + error.message);
                    throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    that();
                }
            });
        }).seq(function(){
            var that = this;
            //Set pending , confirm order to expired
            orderDao.setOrderExpired(params,function(error,result){
                if (error) {
                    logger.error(' finishBizOrder ' + error.message);
                    throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    expiredOrderNum = result.affectedRows;
                    that();
                }
            });
        }).seq(function(){
            var that = this;
            orderDao.setOrderFinish(params,function(error,result){
                if (error) {
                    logger.error(' finishBizOrder ' + error.message);
                    throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    finishOrderNum = result.affectedRows;
                    that();
                }
            })
        }).seq(function(){
            var that = this;
            //Set biz all table status open
            tableDao.updateBizAllTableStatus({bizId:params.bizId,status:listOfValue.TABLE_STATUS_OPEN},function(error,result){
                if (error) {
                    logger.error(' finishBizOrder ' + error.message);
                    throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    that();
                }
            })
        }).seq(function(){
            bizOrderSeqDao.updateBizSeq(params,function(error,result){
                if (error) {
                    logger.error(' finishBizOrder ' + error.message);
                    throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    res.send(200,{success:true,finishOrderNum : finishOrderNum ,expiredOrderNum:expiredOrderNum});
                    next();
                }
            });
        });
}

function getBizDayOrderStat(req,res,next){
    var params=req.params;
    /*var tokenInfo = oAuthUtil.checkAccessToken(req);
         if(tokenInfo == null || params.bizId != tokenInfo.id){
         logger.error(' getBizDayOrderStat ' + sysMsg.SYS_AUTH_TOKEN_ERROR);
         next(sysError.NotAuthorizedError());
         return;
    }*/
    bizOrderStatDao.getBizDayOrderStat(params,function(error,rows){
        if (error) {
            logger.error(' getBizDayOrderStat ' + error.message);
            throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else {
            res.send(200,rows);
            next();
        }
    });
}


function deleteOrder(req,res,next){
    var params=req.params;
    Seq().seq(function(){
        var that = this;
        orderDao.deleteOrderAllItem(params,function(error,result){
            if (error) {
                logger.error(' deleteOrder ' + error.message);
                throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
            }
            that();
        })
    }).seq(function(){
            orderDao.deleteOrder(params,function(error,result){
                if (error) {
                    logger.error(' deleteOrder ' + error.message);
                    throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                }
                res.send(200,{success:result.affectedRows >0});
                next();
            })
        })

}


function setOrderActive(req,res,next){
    var params=req.params;
    orderDao.setOrderActive(params,function(error,result){
        if (error) {
            logger.error(' setOrderActive ' + error.message);
            throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
        }else{
            logger.info(' setOrderActive ' + " success");
            if(result.affectedRows>0){
                //Send message to APNS
                var pushParams = sysConfig.iosNewOrderPushParam;
                bizUserMobileDao.getBizMobile({bizId:params.bizId},function(error,rows){
                    if(error){
                        logger.error(' createOrder ' + error.message);
                    }else{
                        //console.log(params.bizId+"Biz user mobile "+rows.length);
                        if(rows && rows.length>0){
                            Seq().seq(function(){
                                var that = this;
                                orderDao.getBizOrders({bizId:params.bizId,status :listOfValue.ORDER_STATUS_SUBMITTED},function(error,rows){
                                    if(error){
                                        logger.error(' setOrderActive ' + error.message);
                                    }else{
                                        pushParams.badge = rows.length? rows.length :1 ;
                                        that();
                                    }
                                })
                            }).seq(function(){
                                    var soundTokens = [];
                                    var noSoundTokens =[];
                                    for(var i =0; i<rows.length; i++){
                                        if(rows[i].sound && rows[i].sound == 1){
                                            soundTokens.push(rows[i].device_token);
                                        }else{
                                            noSoundTokens.push(rows[i].device_token);
                                        }
                                    }
                                    pushParams.sound = 1;
                                    pushParams.token = soundTokens;
                                    iosPush.newOrderAPNS(pushParams,function(error,result){

                                    });
                                    pushParams.sound = 0;
                                    pushParams.token = noSoundTokens;
                                    iosPush.newOrderAPNS(pushParams,function(error,result){

                                    });
                                })

                        }
                    }
                });
                //Send email to customer
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
                            orderInfoTemp.orderId = params.orderId;
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
            res.send(200,{success:result.affectedRows >0});
            next();
        }

    });
}

/**
 * Update order set status IN_PROGRESS
 * @param req
 * @param res
 * @param next
 */
function setOrderStatusProgress(req,res,next){
    Seq().seq(function(){
        var that = this;
        orderDao.updateOrderStatus(req.params,function(error,rows){
            if (error){
                logger.error(' setOrderStatusProcess ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                return ;
            }else{
                that();
            }
        });
    }).seq(function(){
            orderDao.getOrderInfoById(req.params,function(error,rows){
                if(error){
                    logger.error(' setOrderStatusProcess ' + error.message);
                }else{
                    res.send(200, {seq:rows[0].seq});
                    return next();
                }

            })
        })
}

/**
 * Update order set status COMPLETE
 * @param req
 * @param res
 * @param next
 */
function setOrderStatusComplete(req,res,next){
    orderDao.updateOrderStatus(req.params,function(error,result){
        if (error){
            logger.error(' setOrderStatusComplete ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            return ;
        }else{
            if(result &&result.affectedRows){
                res.send(200, {success:true});
            }else{
                res.send(200, {success:false});
            }
            next();
        }
    });
}

/**
 * update order set status CONFIRM
 * @param req
 * @param res
 * @param next
 */
function setOrderStatusConfirm(req,res,next){
    var emailParams = {};
    var paymentId = "";
    var transactionId = "";
    var params = req.params;
    Seq().seq(function(){
        //Update order status
        var that = this;
        orderDao.updateOrderStatus(req.params,function(error,result){
            if (error){
                logger.error(' setOrderStatusConfirm ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                return ;
            }else{
                if(result &&result.affectedRows > 0){
                    logger.info(' setOrderStatusConfirm ' + " update order status success");
                    that();
                }else{
                    logger.warn(' setOrderStatusConfirm ' + " update order status failure");
                    res.send(200, {success:false});
                    return next();
                }
            }
        });
    }).seq(function(){
            //Get order detail info for send email and payment
            var that = this;
            orderDao.getOrderWithItemForMail(req.params,function(err,rows){
                if(err){
                    logger.error(' setOrderStatusConfirm ' + "get order info with email and payment failure");
                    throw sysError.InternalError("get order info with email and payment failure" , "get order info with email and payment failure");
                    return ;
                }else{
                    if(rows && rows.length>0){
                        logger.info(' setOrderStatusConfirm ' + "get order info with email and payment success");
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
                        orderInfoTemp.orderId = params.orderId;
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
                        emailParams.orderPaymentId = rows[0].order_payment_id;
                        emailParams.paymentType = rows[0].payment_type
                        paymentId = rows[0].order_payment_id;
                        transactionId = rows[0].payment_id;

                    }else {
                        logger.warn(' setOrderStatusConfirm ' + "get order info with email and payment failure");
                        res.send(200, {success:false,errMsg:"get order info with email and payment failure" });
                        return next();
                    }
                }
                that();
            });

        }).seq(function(){
            var that = this;
            if(paymentId && paymentId>0){
                //Set order payment settlement
                payment.settlePayment({transactionId : transactionId},function(error ,result){
                    if(error){
                        logger.error(' setOrderStatusCancel ' + "braintree set payment settlement failure");
                        res.send(200, {success:false});
                        return next();
                    }else if(!result.success){
                        logger.warn(' setOrderStatusCancel ' + "braintree set payment settlement failure");
                        res.send(200, {success:false});
                        return next();
                    }else{
                        logger.info(' setOrderStatusCancel ' + "braintree set payment settlement success");
                        that();
                    }
                });

            }else{
                mailUtil.sendConfirmOrderMail(emailParams);
                res.send(200, {success:true});
                return next();
            }

        }).seq(function(){
            var paymentStatusObj = {};
            paymentStatusObj.paymentId = emailParams.orderPaymentId;
            if(emailParams.paymentType == listOfValue.PAYMENT_TYPE_PAYPAL){
                paymentStatusObj.status = listOfValue.PAYMENT_STATUS_SETTLING;
            }else{
                paymentStatusObj.status = listOfValue.PAYMENT_STATUS_SETTLEMENT;
            }

            paymentDao.updatePaymentStatus(paymentStatusObj,function(error ,result){
                if(error){
                    logger.error(' setOrderStatusConfirm ' + "update order payment set payment status to void failure");
                    throw sysError.InternalError("update order payment set payment status to void failure" , "update order payment set payment status to void failure");
                    return;
                }else{
                    mailUtil.sendConfirmOrderMail(emailParams);
                    res.send(200, {success:true});
                    return next();
                }
            });
        });

}


/**
 * update order set status CANCELLED
 * @param req
 * @param res
 * @param next
 */
function setOrderStatusCancel(req,res,next){
    var emailParams = {};
    var paymentId = "";
    var transactionId = "";
    var voidObj = {};
    var refundObj = {};
    var params = req.params;
    Seq().seq(function(){
        //Update order status
        var that = this;
        orderDao.updateOrderStatus(req.params,function(error,result){
            if (error){
                logger.error(' setOrderStatusCancel ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                return ;
            }else{
                if(result &&result.affectedRows > 0){
                    logger.info(' setOrderStatusCancel ' + " update order status success");
                    that();
                }else{
                    logger.warn(' setOrderStatusCancel ' + " update order status failure");
                    res.send(200, {success:false});
                    return next();
                }
            }
        });
    }).seq(function(){
            //Get order detail info for send email and payment
            var that = this;
            orderDao.getOrderWithItemForMail(req.params,function(err,rows){
                if(err){
                    logger.error(' setOrderStatusCancel ' + "get order info with email and payment failure");
                }else{
                    if(rows && rows.length>0){
                        logger.info(' setOrderStatusCancel ' + "get order info with email and payment success");
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
                        custInfoTemp.custId = rows[0].cust_id;
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
                        emailParams.orderPaymentId = rows[0].order_payment_id;
                        emailParams.amount = rows[0].payment_actual;
                        paymentId = rows[0].order_payment_id;
                        transactionId = rows[0].payment_id;

                        emailParams.paymentStatus = rows[0].payment_status;

                    }else {
                        logger.warn(' setOrderStatusCancel ' + "get order info with email and payment failure");
                        res.send(200, {success:true});
                        return next();
                    }
                }
                that();
            });

        }).seq(function(){
            var that = this;
            if(paymentId && paymentId>0){
                /*payment.queryTransactionById({transactionId : transactionId},function(error,rows){
                       console.log(error || rows);
                });*/
                if( emailParams.orderPaymentId && emailParams.paymentStatus == listOfValue.PAYMENT_STATUS_AUTH){
                    //Set order payment void
                    payment.voidPayment({transactionId : transactionId},function(error ,result){
                        if(error){
                            logger.error(' setOrderStatusCancel ' + "braintree set payment void failure");
                            throw sysError.InternalError("braintree set payment void failure" , "braintree set payment void failure");
                            return ;
                        }else if(!result.success){
                            logger.warn(' setOrderStatusCancel ' + "braintree set payment void failure");
                            res.send(200, {success:false , errMsg:"braintree set payment void failure"});
                            return next();
                        }else{
                            voidObj = result;
                            that();
                        }
                    });
                }else if ( emailParams.orderPaymentId &&emailParams.paymentStatus == listOfValue.PAYMENT_STATUS_SETTLEMENT){
                    //Set order payment refund
                    payment.voidPayment({transactionId : transactionId},function(error ,result){
                        if(error){
                            logger.error(' setOrderStatusCancel ' + "braintree set payment refund failure");
                            throw sysError.InternalError("braintree set payment refund failure" , "braintree set payment refund failure");
                            return ;
                        }else if(!result.success){
                            logger.warn(' setOrderStatusCancel ' + "braintree set payment refund failure");
                            res.send(200, {success:false , errMsg:"braintree set payment refund failure"});
                            return next();
                        }else{
                            voidObj = result;
                            that();
                        }
                    });
                }else if(emailParams.orderPaymentId &&emailParams.paymentStatus == listOfValue.PAYMENT_STATUS_SETTLING){
                    //Set order payment refund
                    payment.refundPayment({transactionId : transactionId},function(error ,result){
                        if(error){
                            logger.error(' setOrderStatusCancel ' + "braintree set payment refund failure");
                            throw sysError.InternalError("braintree set payment refund failure" , "braintree set payment refund failure");
                            return ;
                        }else if(!result.success){
                            logger.warn(' setOrderStatusCancel ' + "braintree set payment refund failure");
                            res.send(200, {success:false , errMsg:"braintree set payment refund failure"});
                            return next();
                        }else{
                            refundObj = result;
                            that();
                        }
                    });
                } else if( emailParams.orderPaymentId == null){
                    mailUtil.sendCancelledOrderMail(emailParams);
                    res.send(200, {success:true});
                    return next();
                }
            }else{
                mailUtil.sendCancelledOrderMail(emailParams);
                res.send(200, {success:true});
                return next();
            }

        }).seq(function(){
            if(emailParams.paymentStatus == listOfValue.PAYMENT_STATUS_AUTH || emailParams.paymentStatus == listOfValue.PAYMENT_STATUS_SETTLEMENT){
                var voidRecord = {};
                voidRecord.orderId = req.params.orderId;
                voidRecord.custId = emailParams.custInfo.custId;
                voidRecord.bizId = emailParams.bizInfo.bizId;
                voidRecord.paymentId = voidObj.transaction.id;
                voidRecord.status = listOfValue.PAYMENT_STATUS_VOID;
                voidRecord.parentId = transactionId;
                if(voidObj.transaction.paypal && voidObj.transaction.paypal.payerEmail){
                    voidRecord.paymentInfo = voidObj.transaction.paypal.payerEmail;
                    voidRecord.paymentType = listOfValue.PAYMENT_TYPE_PAYPAL;
                }else{
                    voidRecord.paymentInfo = voidObj.transaction.creditCard.maskedNumber;
                    voidRecord.paymentType = listOfValue.PAYMENT_TYPE_CREDITCARD;
                }

                voidRecord.paymentActual = 0-voidObj.transaction.amount;
                voidRecord.paymentDue = 0;
                /*paymentDao.addPayment(voidRecord,function(error,result){
                    if(error){
                        logger.error(' setOrderStatusCancel ' + "update order payment set payment status to void failure");
                        throw sysError.InternalError("update order payment set payment status to void failure" , "update order payment set payment status to void failure");
                        return;
                    }else{
                        mailUtil.sendCancelledOrderMail(emailParams);
                        res.send(200, {success:true});
                        return next();
                    }
                });*/
                paymentDao.updatePaymentStatus({paymentId : emailParams.orderPaymentId ,status:listOfValue.PAYMENT_STATUS_VOID},function(error ,result){
                    if(error){
                        logger.error(' setOrderStatusCancel ' + "update order payment set payment status to void failure");
                        throw sysError.InternalError("update order payment set payment status to void failure" , "update order payment set payment status to void failure");
                        return;
                    }else{
                        mailUtil.sendCancelledOrderMail(emailParams);
                        res.send(200, {success:true});
                        return next();
                    }
                });
            }else if (emailParams.paymentStatus == listOfValue.PAYMENT_STATUS_SETTLING){
                var refundRecord = {};
                refundRecord.orderId = req.params.orderId;
                refundRecord.custId = emailParams.custInfo.custId;
                refundRecord.bizId = emailParams.bizInfo.bizId;
                refundRecord.paymentId = refundObj.transaction.id;
                refundRecord.status = listOfValue.PAYMENT_STATUS_REFUND;
                refundRecord.parentId = transactionId;
                if(refundObj.transaction.paypal && refundObj.transaction.paypal.payerEmail){
                    refundRecord.paymentInfo = refundObj.transaction.paypal.payerEmail;
                    refundRecord.paymentType = listOfValue.PAYMENT_TYPE_PAYPAL;
                }else{
                    refundRecord.paymentInfo = refundObj.transaction.creditCard.maskedNumber;
                    refundRecord.paymentType = listOfValue.PAYMENT_TYPE_CREDITCARD;
                }
                refundRecord.paymentActual = 0-refundObj.transaction.amount;
                refundRecord.paymentDue = 0;
                paymentDao.addPayment(refundRecord,function(error,result){
                    if(error){
                        logger.error(' setOrderStatusCancel ' + "update order payment set payment status to refund failure");
                        throw sysError.InternalError("update order payment set payment status to refund failure" , "update order payment set payment status to void failure");
                        return;
                    }else{
                        mailUtil.sendCancelledOrderMail(emailParams);
                        res.send(200, {success:true});
                        return next();
                    }
                });

            }
        });
}


function bizDailyOrder(req,res,next){
    var params = req.params;
    var resultObj = {
        dailyTotalSales :0 ,
        creditCard :0 ,
        paypal :0 ,
        dailyTotalDiscount :0 ,
        dailyTotalTax : 0,
        dailyNetSales : 0,
        dailyOrderCount : 0,
        dailyAvgOrderAmount : 0
    }
    Seq().seq(function(){
        var that = this;
        orderDao.getBizDailyPayment(params,function(error,rows){
            if (error){
                logger.error(' bizDailyOrder ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                return ;
            }else{
                for(var i = 0; i<rows.length;i++){
                    if(rows[i].payment_type = listOfValue.PAYMENT_TYPE_CREDITCARD){
                        resultObj.creditCard = rows[i].payment_actual_sum || 0;

                    }else{
                        resultObj.paypal = rows[i].payment_actual_sum || 0;
                    }
                    resultObj.dailyOrderCount += rows[i].payment_order_count || 0;
                }
                resultObj.dailyTotalSales = resultObj.paypal + resultObj.creditCard;

                that();
            }

        })
    }).seq(function(){
            var that = this;
            orderDao.getBizDailyOrder(params,function(error,rows){
                if (error){
                    logger.error(' bizDailyOrder ' + error.message);
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                    return ;
                }else{
                    if(rows && rows.length>0){
                        resultObj.dailyTotalTax = rows[0].total_tax_sum || 0;
                        resultObj.dailyTotalDiscount = rows[0].total_discount_sum || 0;
                    }
                    resultObj.dailyNetSales = resultObj.dailyTotalSales - resultObj.dailyTotalTax;
                    resultObj.dailyAvgOrderAmount = resultObj.dailyOrderCount == 0 ? 0 : (resultObj.dailyTotalSales/resultObj.dailyOrderCount)
                    that();
                }
            })
        }).seq(function(){
            res.send(200, resultObj);
            return next();
        })

}

function getBizOrderStat(req,res,next){
    var bizOrderTypeStat  = [];
    var bizOrderPaymentStat = [];
    Seq().seq(function(){
        var that = this;
        orderDao.getBizDailyOrderTypeStat(req.params ,function(error,rows){
            if (error){
                logger.error(' getBizOrderStat ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                return ;
            }else{
                bizOrderTypeStat = rows;
                that();
            }
        })
    }).seq(function(){
        orderDao.getBizDailyPaymentStat(req.params,function(error,rows){
            if (error){
                logger.error(' getBizOrderStat ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                return ;
            }else{
                bizOrderPaymentStat = rows;
                res.send(200, {bizOrderTypeStat : bizOrderTypeStat ,bizOrderPaymentStat:bizOrderPaymentStat});
                return next();
            }
        })
    })
}

function searchBizOrder(req,res,next){
    orderDao.searchBizOrder(req.params,function(error,rows){
        if (error){
            logger.error(' getBizOrderStat ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            return ;
        }else{
            res.send(200, rows);
            return next();
        }
    })
}

function queryAllOrder(req,res,next){
    var params = req.params;
    orderDao.queryAllOrders(params,function(error,rows){
        if (error){
            logger.error(' queryAllOrder ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            return ;
        }else{
            res.send(200, rows);
            return next();
        }
    })
}


function printeOrderAll(req,res,next){
    var params=req.params,orderItem = [],orderInfo = [];
    var printerParams = {};
    Seq().seq(function(){
        var that = this;
        orderDao.getOrderItemById(params,function(error,rows){
            if (error){
                logger.error(' getBizOrders ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                return ;
            }
            orderItem = rows;
            that();
        })
    }).seq(function(){
        var that = this;
        orderDao.getOrderInfoById(params,function(error,rows){
            if (error){
                logger.error(' getBizOrders ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                return ;
            }
            orderInfo = rows[0];
            that();
        })
    }).seq(function(){
        var that = this;
        printerddj.formatOrderAll(params,orderInfo,orderItem,function(content){
            printerParams.content = content;
            printerParams.bizId = params.bizId;
            printerddj.printeOrder(printerParams,function(result){
                if(result.Code==200){
                    res.send(200,{success:true})
                }else{
                    res.send(200,{success:false})
                }
            })
        });
    });
}
function printeOrderUrge(req,res,next){
    var params=req.params,orderItem = [],orderInfo = {};
    var printerParams = {};
    Seq().seq(function(){
        var that = this;
        orderInfo.table = params.table;
        orderInfo.seq = params.seq;
        orderItem = params.orderItem;
        printerddj.formatOrderUrge(orderInfo,orderItem,function(content){
            printerParams.content = content;
            printerParams.bizId = params.bizId;
            printerddj.printeOrder(printerParams,function(result){
                if(result.Code==200){
                    res.send(200,{success:true})
                }else{
                    res.send(200,{success:false})
                }
            })
        });
    });
}

function printeOrderSendKitchen(req,res,next){
    var params=req.params,orderItem = [],orderInfo = {};
    var printerParams = {};
    Seq().seq(function(){
        var that = this;
        Seq(params.orderItem).seqEach(function (item, i) {
            var that = this;
            var paramsItem = {
                status:202, itemId:item.id, orderId:item.order_id,bizId:params.bizId
            };
            orderDao.updateItemStatus(paramsItem, function (err, rows) {
                if (err) {
                    logger.error(' createOrder ' + err.message);
                    throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    that(null, i);
                }
            });
        }).seq(function(){
            that();
        })
    }).seq(function(){
        var that = this;
        orderInfo.table = params.table;
        orderInfo.seq = params.seq;
        orderItem = params.orderItem;
        printerddj.formatOrderSendKitchen(orderInfo,orderItem,function(content){
            printerParams.content = content;
            printerParams.bizId = params.bizId;
            printerddj.printeOrder(printerParams,function(result){
                if(result.Code==200){
                    res.send(200,{success:true})
                }else{
                    res.send(200,{success:false})
                }
            })
        });
    })
}
function addOrderMoney(req,res,next){
    var params=req.params;
    Seq().seq(function(){
        var that = this;
        var orderMoneyParams = {};
        orderMoneyParams.bizId = params.bizId;
        orderMoneyParams.order_id = params.order_id;
        orderMoneyParams.payment_type = params.payment_type;
        orderMoneyParams.payment_money = params.payment_money;
        orderMoneyParams.operator = params.operator;
        orderDao.addOrderMoney(orderMoneyParams,function(error,rows){
            if (error){
                logger.error(' addOrderMoney ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                return ;
            }else{
                that()
            }
        })
    }).seq(function(){
        var that = this;
        var oddParams = {};
        if(params.erase_odd_money!=0){
            oddParams.bizId = params.bizId;
            oddParams.order_id = params.order_id;
            oddParams.payment_type = 99999;
            oddParams.payment_money = params.erase_odd_money?params.erase_odd_money:0;
            oddParams.operator = params.operator;
            oddParams.remark = '折扣';
            orderDao.addOrderMoney(oddParams,function(error,rows){
                if (error){
                    logger.error(' addOrderMoney ' + error.message);
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                    return ;
                }else{
                    that()
                }
            })
        }else{
            that()
        }

    }).seq(function(){
        var that = this;
        var stateParams = {};
        // if(params.already_money + params.payment_money==params.total_money){
            stateParams.status = 111;//已结账
        // }else{
        //     stateParams.payState = 2;//部分结账
        // }
        stateParams.bizId=params.bizId;
        stateParams.orderId=params.order_id;

        orderDao.updateOrderInfoPayState(stateParams,function(error,rows){
            if (error){
                logger.error(' addOrderMoney ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                return ;
            }else{
                that()
            }
        })
    }).seq(function(){
        var that = this;
        var tempParams = {
            bizId:params.bizId,
            tableId:params.tableId,
            state:0,
            batchState:0,
            queryState:1
        };
        orderDao.updateOrderItemTemp(tempParams,function(error,rows){
            if (error){
                logger.error(' updateOrderItemTemp ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                return ;
            }else{
                that()
            }
        })
    }).seq(function(){
        var that = this;
        var tableParams = {};
        tableParams.bizId=params.bizId;
        tableParams.tableId=params.tableId;
        tableParams.status=300;
        tableDao.updateBizTableStatus(tableParams,function(error,rows){
            if (error){
                logger.error(' addOrderMoney ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                return ;
            }else{
                res.send(200,{success:true});
            }
        })
    })
}
function getOrderMoneyAleardy(req,res,next){
    var params = req.params;
    orderDao.getOrderMoneyAleardy(params,function(error,rows){
        if (error){
            logger.error(' getOrderMoneyAleardy ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            return ;
        }else{
            res.send(200, rows);
            return next();
        }
    })
}
function getOrderMoney(req,res,next){
    var params = req.params;
    var total_money = 0;
    var retuenData = {};
    orderDao.getOrderMoney(params,function(error,rows){
        if (error){
            logger.error(' getOrderMoney ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            return ;
        }else{
            retuenData.item = rows;
            for(var i=0;i<rows.length;i++){
                if(rows[i].payment_type==99999){
                    rows[i].checkout_name = '折扣'
                }
                total_money+=rows[i].total_payment_money;
            }
            retuenData.total_money = total_money;
            res.send(200, retuenData);
            return next();
        }
    })
}


function addOrderItemTemp(req,res,next){
    var params = req.params;
    var itemTemps = [];
    var tableId = '',nickName='';
    Seq().seq(function(){
        var that = this;
        tableDao.getTableNameByQ(params.qr,function(error,rows){
            if (error) {
                logger.error(' getTableNameByQ ' + error.message);
                throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else {
                tableId = rows[0].id;
                that();
            }
        });
    }).seq(function(){
        var that = this;
        // wechatDao.searchDBOperator({openid:params.openId},function(error,rows){
        //     if (error) {
        //         logger.error(' searchDBOperator ' + error.message);
        //         throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
        //     } else {
        //         nickName = rows[0].nickname;
        //
        //     }
        // })

        if(params.prods && params.prods.length>0){
            for (var i = 0; i < params.prods.length; i++) {
                itemTemps.push({
                    actualPrice:params.actualPrice,
                    bizId:params.bizId,
                    bizImgUrl:params.bizImgUrl,
                    bizKey:params.bizKey,
                    bizName:params.bizName,
                    bizNameLang:params.bizNameLang,
                    count:params.count,
                    extendTotalPrice:params.extendTotalPrice,
                    isCheckingPrice:params.isCheckingPrice,
                    originPrice:params.originPrice,
                    totalDiscount:params.totalDiscount,
                    totalPrice:params.totalPrice,
                    totalTax:params.totalTax,
                    ver:params.ver,
                    extendName:params.prods[i].extendName,
                    extendPrice:params.prods[i].extendPrice,
                    img_url:params.prods[i].img_url,
                    img_url_80:params.prods[i].img_url_80,
                    img_url_240:params.prods[i].img_url_240,
                    img_url_600:params.prods[i].img_url_600,
                    img_url_l:params.prods[i].img_url_l,
                    img_url_m:params.prods[i].img_url_m,
                    img_url_o:params.prods[i].img_url_o,
                    img_url_s:params.prods[i].img_url_s,
                    price:params.prods[i].price,
                    prodId:params.prods[i].prodId,
                    prodLabel:params.prods[i].prodLabel,
                    prodName:params.prods[i].prodName,
                    prodNameLang:params.prods[i].prodNameLang,
                    qty:params.prods[i].qty,
                    tableId:tableId,
                    nickName:params.prods[i].nickName,
                    openId:params.openId,
                    qr:params.qr
                });
            }
            that();
        }else{
            that();
        }


    }).seq(function(){
        var that = this;
        orderDao.deleteOrderItemTemp(
            {
                bizId:params.bizId,
                tableId:tableId,
                batchState:1
            },function(error,row){
                if (error) {
                    logger.error(' deleteOrderItemTemp ' + error.message);
                    throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    that();
                }
        })
    }).seq(function(){
        var that = this;
        Seq(itemTemps).seqEach(function (item, i) {
            var that = this;
            orderDao.addOrderItemTemp(item,function(error,row){
                if (error){
                    logger.error(' addOrderItemTemp ' + error.message);
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                    return ;
                }else{
                    that(null, i);
                }
            })
        }).seq(function(){
            that()
        })
    }).seq(function(){
        var that = this;
        wsClient.notifyChangeDish(params.bizId,params.qr, null);
        res.send(200,{success:true});
    });
}

function deleteOrderItemTemp(req,res,next){
    var params = req.params;
    orderDao.deleteOrderItemTemp(params,function(error,row){
        if (error){
            logger.error(' deleteOrderItemTemp ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            return ;
        }else{
            res.send(200,{success:true});
            return next();
        }
    })
}

function getOrderItemTemp(req,res,next){
    var params = req.params;
    var tableId = '';

    Seq().seq(function(){
        var that = this;
        tableDao.getTableNameByQ(params.qr,function(error,rows){
            if (error) {
                logger.error(' getTableNameByQ ' + error.message);
                throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else {
                tableId = rows[0].id;
                that();
            }
        });
    }).seq(function(){
        var that = this
        orderDao.getOrderItemTempProds({bizId:params.bizId,tableId:tableId,openId:params.openId},function(error,rows){
            if (error){
                logger.error(' getOrderItemTempProds ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                return ;
            }else{
                res.send(200, rows);
                next()
            }
        })
    })

}

function getOrderInfoById(req,res,next){
    var params = req.params;
    orderDao.getOrderInfoById(params,function(error,rows){
        if (error){
            logger.error('getOrderInfoById ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            return ;
        }
        res.send(200, rows);
        return next();
    })
}
function getOrderMaxUpdateOn(req,res,next){
    var params = req.params;
    orderDao.getOrderMaxUpdateOn(params,function(error,rows){
        if (error){
            logger.error('getOrderMaxUpdateOn ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            return ;
        }
        res.send(200, rows);
        return next();
    })
}

function createOrderNew(req,res,next){
    var params=req.params;
    var orderInfo,orderItem,printerParams={};
    Seq().seq(function(){//计算金额
        var that = this;
        computePrice(req.params, function (error, result) {
            if (error) {
                logger.error(' createOrderNew ' + error.message);
                throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else {
                orderInfo = result;
                params.actualPrice = result.actualPrice;//现金额
                params.totalTax = result.totalTax;//总税额
                params.totalDiscount = result.totalDiscount;//折扣金额
                params.originPrice = result.originPrice;//原金额
                params.totalPrice = result.totalPrice;//总金额
                that();
            }
        })
    }).seq(function() {//获取table_Id
        var that = this;
        tableDao.getTableNameByQ(params.qr,function(error, rows){
            if (error) {
                logger.error(' createOrderNew ' + error.message);
                throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
            }else {
                params.tableId = rows[0].id;
                params.tableState = rows[0].status;
                that()
            }
        });
    }).seq(function(){
        var that = this;
        if(params.tableState == 300){//空台则开台，新增订单
            var tableParams = {
                status:302,
                tableId:params.tableId,
                bizId:params.bizId
            };
            tableDao.updateBizTableStatus(tableParams,function(error,rows){
                if (error) {
                    logger.error(' createOrderNew ' + error.message);
                    throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                }else{
                    orderDao.addCustOrder(params, function (error, result) {
                        if (error) {
                            logger.error(' createOrderNew ' + error.message);
                            throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                        } else {
                            params.orderId = result.insertId;
                            that();
                        }
                    });
                }
            })
        }else if(params.tableState == 302){//就餐中的台号，查找该台号的订单
            orderDao.getOrderByBizStateTableId({bizId:params.bizId, tableId:params.tableId, status:110},function(error,result){
                if (error) {
                    logger.error(' createOrderNew ' + error.message);
                    throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    if(result && result.length >0 ){
                        params.orderId = result[0].id;
                        orderDao.updateOrderInfoPrice({
                            actualPrice:result[0].actual_price + params.actualPrice,     //现金额
                            totalTax:result[0].total_tax + params.totalTax,              //总税额
                            totalDiscount:result[0].total_discount + params.totalDiscount,//折扣金额
                            originPrice:result[0].origin_price + params.originPrice,     //原金额
                            totalPrice:result[0].total_price + params.totalPrice,       //总金额
                            orderId:result[0].id
                        },function(error,result){               //更新金额
                            if (error) {
                                logger.error(' createOrderNew ' + error.message);
                                throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                            } else {
                                that();
                            }
                        });
                    }else {
                        logger.error(' createOrderNew ' + error.message);
                        throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                    }
                }
            })
        }
    }).seq(function() {
        var that = this;
        Seq(orderInfo.itemArray).seqEach(function (item, i) {
            var that = this;
            item.orderId = params.orderId;
            item.custId = params.custId;
            item.bizId = params.bizId;
            orderDao.addOrderItem(item, function (err, rows) {
                if (err) {
                    logger.error(' createOrder ' + err.message);
                    throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    that(null, i);
                }
            });
        }).seq(function(){
            that();
        })
    }).seq(function(){
        var that = this;
        var updateParams = {
            bizId:params.bizId,
            tableId:params.tableId,
            // openId:params.openId,
            queryState:1,
            queryBatchState:1,
            state:1,
            batchState:0
        };
        orderDao.updateOrderItemTemp(updateParams, function (err, rows) {
            if (err) {
                logger.error(' createOrder ' + err.message);
                throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else {
                that()
            }
        });
    }).seq(function() {
        var that = this;
        orderDao.updateOrderSeq(req.params, function (err, result) {
            if (err) {
                logger.error(' updateOrderSeq ' + err.message);
            } else {
                logger.info(' updateOrderSeq ' + result.affectedRows)
            }
            that();
        })
    }).seq(function() {
        var that = this;
        bizOrderSeqDao.increaseBizSeq(req.params, function (err, result) {
            if (err) {
                logger.error(' increaseBizSeq ' + err.message);
            } else {
                logger.info(' increaseBizSeq ' + result.affectedRows)
            }
            that();
        })
    }).seq(function() {
        var that = this;
        orderDao.searchBizSeq(req.params, function (err, result) {
            if (err) {
                logger.error(' searchBizSeq ' + err.message);
            } else {
                params.seq=result[0].seq;
            }
            that();
        })
    }).seq(function() {
        //操作人增加历史
        var that = this;
        if(req.params.operator_id){
            var temy={};
            temy.operation='order';
            temy.customer_id=params.custId;
            temy.operator_id=params.operator_id;

            wechatDao.addDBOperatorHistory(temy, function (err, result) {
                if (err) {
                    logger.error(' addDBOperatorHistory ' + err.message);
                } else {
                    logger.info(' addDBOperatorHistory ' + result);
                }
                that();
            })
        }else{
            that();
        }
    }).seq(function () {
        var that = this;
        //notify biz
        wsClient.notifyCompleteOrder(params.bizId,params.qr,params.openIdParty, null);
        that();
    }).seq(function() {
        //notify biz
        wsClient.notifyNewOrderCreated(params.bizId, null);
        var bizID = params.bizId.toString()
        baseUtil.pushNotification('','您收到一条订单',{},bizID);
        logger.info(' createOrder ' + 'success');
        res.send(200, {orderId: params.orderId,seq:params.seq, orderInfo: req.params});
        next();
    });
}


function getOrderParamsNew(req,res,next){
    var params = req.params;
    var returnData = {};

    params.state=1;
    params.batchState=1;
    Seq().seq(function(){
        var that = this
        orderDao.getOrderItemTempGroup(params,function(error,rows){
            if (error){
                logger.error('getOrderItemTempGroup ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                return ;
            }else {
                // returnData = rows;
                if(rows && rows.length>0){
                    returnData.active = '1';
                    returnData.address = '';
                    returnData.bizId = rows[0].bizId;
                    returnData.operator_id = '';
                    returnData.orderStart = moment(new Date()).format("YYYY-MM-DD hh:mm");
                    returnData.orderType = 1;
                    returnData.peopleNum = 1;
                    returnData.phone = '';
                    returnData.qr = rows[0].qr;
                    returnData.remark = '';
                    returnData.status = 110;
                    returnData.username = rows[0].nickName;
                    returnData.itemArray = [];
                }
            }
            that()
        })
    }).seq(function(){
        var that = this;
        orderDao.getOrderItemTempProdsAll(params,function(error,rows){
            if (error){
                logger.error('getOrderItemTempProdsAll ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                return ;
            }else {
                for(var i=0;i<rows.length;i++){
                    var itemTemp = {};
                    itemTemp.extendPrice = rows[i].extendPrice;
                    itemTemp.extendTotalPrice = rows[i].extendTotalPrice;
                    itemTemp.operator_id = '';
                    itemTemp.prodExtend = rows[i].extendName;
                    itemTemp.prodId = rows[i].prodId;
                    itemTemp.quantity = rows[i].qty;
                    itemTemp.remark = '';
                    itemTemp.status = 100;
                    returnData.itemArray .push(itemTemp)
                }
            }
            res.send(200, returnData);
            return next();
        })
    })
}

function getOrderItemTempProdsAll(req,res,next){
    var params = req.params;
    var returnData = {};

    params.state=1;
    params.batchState=1;

    orderDao.getOrderItemTempProdsAll(params,function(error,rows){
        if (error){
            logger.error('getOrderItemTempProdsAll ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            return ;
        }else {
            res.send(200, rows);
            return next();
        }
    })
}
module.exports = {
    createOrder : createOrder,
    getCustOrders : getCustOrders,
    getBizOrders : getBizOrders,
    getOrderItemById : getOrderItemById,
    updateItemStatus : updateItemStatus,
    updateOrderStatus : updateOrderStatus ,
    getOrderPrice : getOrderPrice,
    addItemToOrder : addItemToOrder,
    cancelItemInOrder : cancelItemInOrder,
    resetOrderItemSize : resetOrderItemSize,
    deleteOrderItem: deleteOrderItem ,
    updateOrderTable : updateOrderTable ,
    getBizTableOrders : getBizTableOrders,
    createOrderNoPrice : createOrderNoPrice ,
    addItemNoPrice: addItemsNoPrice ,
    resetItemSizeNoPrice : resetItemSizeNoPrice ,
    deleteItemNoPrice : deleteItemNoPrice ,
    reUpdateOrderPrice : reUpdateOrderPrice,
    getBizOrderCustomer : getBizOrderCustomer,
    getOrderForInvoice : getOrderForInvoice,
    finishBizOrder : finishBizOrder ,
    getBizDayOrderStat : getBizDayOrderStat ,
    deleteOrder : deleteOrder,
    getOrderInfoWithItem : getOrderInfoWithItem ,
    setOrderActive : setOrderActive ,
    bizDailyOrder : bizDailyOrder ,
    getBizOrderStat : getBizOrderStat,
    searchBizOrder : searchBizOrder,
    queryAllOrder : queryAllOrder,
    printeOrderAll:printeOrderAll,
    printeOrderUrge:printeOrderUrge,
    printeOrderSendKitchen:printeOrderSendKitchen,
    sendCallOut:sendCallOut,
    getAudio:getAudio,
    getAccessToken:getAccessToken,
    addOrderMoney:addOrderMoney,
    getOrderMoneyAleardy:getOrderMoneyAleardy,
    getOrderMoney:getOrderMoney,
    createOrderNew:createOrderNew,
    addOrderItemTemp:addOrderItemTemp,
    deleteOrderItemTemp:deleteOrderItemTemp,
    getOrderItemTemp:getOrderItemTemp,
    getOrderInfoById:getOrderInfoById,
    getBizOrdersHistory:getBizOrdersHistory,
    getOrderMaxUpdateOn:getOrderMaxUpdateOn,
    getOrderParamsNew:getOrderParamsNew,
    getOrderItemTempProdsAll:getOrderItemTempProdsAll
};