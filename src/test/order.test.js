/**
 * Created by ling xue on 14-10-14.
 */

var assert = require("assert");
var order = require('../lib/order.js');

exports.test = function (client) {
    describe('service: order', function () {
        /*it('should create a order by customer', function (done) {
            var orderInfo = {
                bizId : 103072,
                orderType : 1,
                orderStart : '2014-10-19',
                remark : "wo want to dinner in pm 16:00",
                itemArray : [{prodId :103153,quantity:1,remark:"ddr",status:1},
                    {prodId :102500,quantity:3,remark:"ddrChicken",status:1}]
            }
            client.post('/cust/2/order', orderInfo, function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    var orderId = data.orderId;
                    assert(orderId > 0, "customer order should be created");
                    done();
                }
            });
        });*/
        /*it('should get a order info', function (done) {
            client.get('/cust/2/order', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.length>0, "customer menu should be found");
                    done();
                }
            });
        });
        it('should get biz orders info', function (done) {
            client.get('/biz/1/order', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.length>0, "biz menu should be found");
                    done();
                }
            });
        });*/
        /*it('should get a customer orders info', function (done) {
            client.get('/cust/2/order/3', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.length>0, "a customer order should be found");
                    done();
                }
            });
        });
        it('should get a biz order detail info', function (done) {
            client.get('/biz/1/order/3', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.length>0, "a biu order detail should be found");
                    done();
                }
            });
        });*/
        /*it('should update a customer order status info', function (done) {
            client.put('/cust/2/order/3/status/2',{}, function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.success == true, "a customer order should be found");
                    done();
                }
            });
        });
        it('should update a biz order status info', function (done) {
            client.put('/biz/1/order/3/status/3',{}, function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }else {
                    assert(data.success == true, "a customer order should be found");
                    done();
                }
            });
        });*/
        /*it('should get a order price by customer', function (done) {
            var orderInfo = {
                orderStart : '2014-10-17',
                orderDate : '2014-10-17',
                itemArray : [{prodId :103153,quantity:1,remark:"ddr",status:1},
                    {prodId :102500,quantity:3,remark:"ddrChicken",status:1}]
            }
            client.post('/biz/103072/orderPrice', orderInfo, function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    var orderInfo = data;
                    assert(orderInfo  != null, "customer order price  should be computed");
                    done();
                }
            });
        });*/
        /*it('should create a order by customer', function (done) {
            var orderInfo ={itemArray : [ {
                prodId:102397,
                quantity : 3
            }]};
            client.post('/cust/2/order/23/addItem', orderInfo, function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    var orderInfo = data.orderInfo;
                    assert(orderInfo, "customer order should be created");
                    done();
                }
            });
        });*/
        /*it('should cancel a order item', function (done) {

            client.put('/cust/2/order/23/item/44/cancel', {}, function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    var orderInfo = data.orderInfo;
                    assert(orderInfo, "customer order should be created");
                    done();
                }
            });
        });*/

        /*it('should update a order item size', function (done) {

            client.put('/cust/100385/order/23/resetSize', {itemArray:[{prodId:102397,quantity:1,itemId:43}]}, function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    var orderInfo = data.orderInfo;
                    assert(orderInfo, "customer order item size should be update");
                    done();
                }
            });
        });*/
        /*it('should delete a order item', function (done) {

            client.del('/cust/100385/order/23/item/43',function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    var orderInfo = data.orderInfo;
                    assert(orderInfo, "customer order item should be deleted");
                    done();
                }
            });
        });*/
        /*it('should update a order table', function (done) {

            client.put('/biz/103072/order/23/table/43',function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {

                    assert(data.success, "the order  should be changed table");
                    done();
                }
            });
        });*/
        /*it('should get orders in a table', function (done) {

            client.get('/biz/103072/order/23/table/43',function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.length, "the order  should be get");
                    done();
                }
            });
        });*/
        /*it('should create a order by business', function (done) {
            var orderInfo = {
                bizId : 103072,
                tableId : 33,
                orderType : 1,
                orderStart : '2014-10-19',
                remark : "wo want to dinner in pm 16:00",
                itemArray : [{prodId :103153,quantity:1,remark:"ddr",status:1},
                    {prodId :102500,quantity:3,remark:"ddrChicken",status:1}]
            }
            client.post('/biz/103072/order', orderInfo, function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    var orderId = data.orderId;
                    assert(orderId > 0, "business order should be created");
                    done();
                }
            });
        });

        it('should add  items to order by business', function (done) {
            var orderInfo ={itemArray : [ {
                prodId:102397,
                quantity : 3
            }]};
            client.post('/biz/103072/order/27/addItem', orderInfo, function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {

                    assert(data.success, "business order should be added items");
                    done();
                }
            });
        });*/
        /*it('should delete a order item by business', function (done) {
            var orderInfo ={itemArray : [ 43,44]};
            client.del('/biz/103072/order/27/item',function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    var orderInfo = data.success;
                    assert(orderInfo, "the order item should be deleted by business");
                    done();
                }
            });
        });*/
        /*it('should delete a order item by business', function (done) {

            client.put('/biz/103072/order/28/orderPrice',function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    var orderInfo = data.success;
                    assert(orderInfo, "the order item should be deleted by business");
                    done();
                }
            });
        });

        it('should get a biz all order customer', function (done) {
            client.get('/biz/103072/orderCustomer', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.length>0, "biz order customer should be found");
                    done();
                }
            });
        });

        it('should get a biz all day order stat', function (done) {
            client.get('/biz/103072/dayOrderStat', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.length>0, "biz order customer should be found");
                    done();
                }
            });
        });

        it('should create a biz all day order stat', function (done) {
            client.post('/biz/103072/dayOrderStat', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.success, "biz order customer should be found");
                    done();
                }
            });
        });
        it('should get a biz daily order statistics by net', function (done) {
            client.get('/biz/103072/dailyOrder', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data != null, "biz daily order statistics should be found");
                    done();
                }
            });
        });*/
        it('should get a biz daily order statistics by net', function (done) {
            client.get('/biz/103072/dayOrderPaymentStat', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data != null, "biz daily order and payment statistics should be found");
                    done();
                }
            });
        });
    });
};