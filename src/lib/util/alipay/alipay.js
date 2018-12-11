var AlipayNotify = require('./alipay_notify.class').AlipayNotify;
var AlipaySubmit = require('./alipay_submit.class').AlipaySubmit;
var apiUtil = require('../ApiUtil.js');
var orderDao = require('../../dao/orderDao.js');
var paymentDao = require('../../dao/paymentDao.js');
var Seq = require('seq');
var fs = require("fs");
var  assert = require('assert');
var url = require('url');
var inherits = require('util').inherits,
    EventEmitter = require('events').EventEmitter;

//var DOMParser = require('xmldom').DOMParser;

var default_alipay_config = {
    service:'create_direct_pay_by_user'
	,partner:'2088121906293676'
    ,key:'d3aryvmm6bjwyukwytxnsiptrwspea8p'
    ,seller_email:'mpdalian@126.com'
    ,host:'http://www.chumuu.com'
    ,cacert:'cacert.pem'
    ,transport:'https'
    ,input_charset:'utf-8'
    ,sign_type:"MD5"
    ,notify_url:"http://www.chumuu.com/api/cust/alipay/notify"
    ,return_url:"http://www.chumuu.com/checkout-order-success"
};

function Alipay(alipay_config){
	EventEmitter.call(this);

	//default config
	this.alipay_config = default_alipay_config;
	//config merge
	for(var key in default_alipay_config){
		this.alipay_config[key] = default_alipay_config[key];
	}
}

/**
 * @ignore
 */
inherits(Alipay, EventEmitter);


Alipay.create_direct_pay_by_user_doAlipay = function(data, res){
    assert.ok(data.out_trade_no && data.subject && data.total_fee);

    //建立请求
    var alipaySubmit = new AlipaySubmit(default_alipay_config);

    for(var key in data){
        default_alipay_config[key] = data[key];
    }

    var html_text = alipaySubmit.buildRequestForm(default_alipay_config,"get", "确认");
    res.end(html_text);
}

/*
 异步通知
 */
Alipay.create_direct_pay_by_user_notify = function(req, res){

    var _POST = req.params;

    var alipayNotify = new AlipayNotify(default_alipay_config,req);
    //验证消息是否是支付宝发出的合法消息
    var bool = alipayNotify.getSignVeryfy(_POST, _POST.sign);
    var tempObj = {};

    if(bool){
        Seq().seq(function(){
            var that =this;
            var orderId = {orderId:_POST.out_trade_no};
            orderDao.getOrderInfoById(orderId, function (error, rows) {

                if (error){
                    res.end("fail");
                }
                tempObj.orderId = rows[0].id;
                tempObj.bizId = rows[0].biz_id;
                tempObj.custId = rows[0].cust_id;
                tempObj.fee = rows[0].total_price;
                that();
            });
        }).seq(function(){
            var that = this;
            var paymentObj = {};

            paymentObj.orderId = _POST.out_trade_no;
            paymentObj.custId = tempObj.custId;
            paymentObj.bizId = tempObj.bizId;
            paymentObj.paymentId = _POST.trade_no;
            paymentObj.paymentInfo = _POST.buyer_email;
            paymentObj.paymentType = 1;
            paymentObj.paymentDue = tempObj.fee;
            paymentObj.paymentActual = _POST.total_fee;
            paymentObj.status=3;

            paymentDao.addPayment(paymentObj,function(error,result){
                if (error){
                    console.log(error.message);
                    res.end("fail");
                }else{
                    res.end("success");
                    that();
                }
            });
        })
    }
}

/**
    test
 */
Alipay.writeLog = function(req,res){
    var str = "write test";
    fs.readFile('log.txt', function (err, data) {
        if (err) {
            return console.error(err);
        }
        fs.writeFile('log.txt', data.toString()+"\n"+str,  function(err) {
            if (err) {
                return console.error(err);
            }
        });
    });
}

/**
    test
 */
Alipay.saveOrder = function(res){
    var _POST = {"discount":"0.00","payment_type":"1","subject":"Salt & Pepper Eggplant","trade_no":"2016030121001004490252407185","buyer_email":"twinkle_l@163.com","gmt_create":"2016-03-01 10:22:52","notify_type":"trade_status_sync","quantity":"1","out_trade_no":"100715","seller_id":"2088121906293676","notify_time":"2016-03-01 19:48:02","trade_status":"TRADE_SUCCESS","is_total_fee_adjust":"N","total_fee":"0.01","gmt_payment":"2016-03-01 10:23:01","seller_email":"mpdalian@126.com","price":"0.01","buyer_id":"2088602084330497","notify_id":"d25b33f8b84e6f0eca916d865da3218js6","use_coupon":"N","sign_type":"MD5","sign":"7778803bb32729784555654bf6071986"};
    var tempObj = {};
    Seq().seq(function(){
        var that =this;
        orderDao.getOrderInfoById(_POST, function (error, rows) {
            tempObj.orderId = 11;
            tempObj.bizId = 22;
            tempObj.custId = 33;
            tempObj.fee = 33;
            that();
        });
    }).seq(function(){
        var that = this;
        var paymentObj = {};

        paymentObj.orderId = _POST.out_trade_no;
        paymentObj.custId = tempObj.custId;
        paymentObj.bizId = tempObj.bizId;
        paymentObj.paymentId = _POST.trade_no;
        paymentObj.paymentInfo = _POST.buyer_email;
        paymentObj.paymentType = 1;
        paymentObj.paymentDue = tempObj.fee;
        paymentObj.paymentActual = _POST.total_fee;
        paymentObj.status=3;

        paymentDao.addPayment(paymentObj,function(error,result){
            if (error){
                console.log(error.message);
            }else{
                res.end("success");
                that();
            }
        });
    })
}

/**
    test
 */
Alipay.create_direct_pay_by_user_notify_parameter = function(req, res){
    var parameter = {
        discount: '0.00',
        payment_type: '1',
        subject: 'Fried Prawns',
        trade_no: '2016030121001004490255671289',
        buyer_email: 'twinkle_l@163.com',
        gmt_create: '2016-03-01 15:55:02',
        notify_type: 'trade_status_sync',
        quantity: '1',
        out_trade_no: '100720',
        seller_id: '2088121906293676',
        notify_time: '2016-03-01 15:55:10',
        trade_status: 'TRADE_SUCCESS',
        is_total_fee_adjust: 'N',
        total_fee: '0.01',
        gmt_payment: '2016-03-01 15:55:09',
        seller_email: 'mpdalian@126.com',
        price: '0.01',
        buyer_id: '2088602084330497',
        notify_id: '3d5827605a10ace7b64744b1dd7e716js6',
        use_coupon: 'N',
        sign_type: 'MD5',
        sign: '0671d6296cd171a139a2437138226747'}

    var alipayNotify = new AlipayNotify(default_alipay_config,req);
    var bool = alipayNotify.getSignVeryfy(parameter, parameter.sign);

    if(bool){
        console.log(bool);
    }

    res.send(200,{success:true});
}

/**
    test
 */
Alipay.testNotify = function(){
    apiUtil.saveTempRes("sucess");
    res.send(200,{success:true});
}

exports.Alipay = Alipay;




