/**
 * Created by Josh Yu on 3/4/15.
 */

var mysql = require('mysql');
var Seq = require('seq');
var db = require('../lib/db.js');
var serverLogger = require('../lib/util/ServerLogger.js');
var logger = serverLogger.createLogger('initCheckout.js');


(function insertLabel(req,res,next){
    var bizIdArr = [];
    var query = ''
    Seq().seq(function(){
        var that = this;
        query = "select * from business ";
        db.dbQuery(query,[],function(error,rows){
            bizIdArr = rows;
            that()
        })
    }).seq(function(){
        var that = this;
        Seq(bizIdArr).seqEach(function(biz,i){
            var that =  this;
            var paramArr = [], i = 0;
            paramArr[i++]=biz.biz_id;
            query = "insert into biz_checkout_info (biz_id,checkout_id,checkout_name,checkout_remark,status) values (?,1,'现金','',1)";
            db.dbQuery(query,paramArr,function(error,rows){that(null,i);})
        }).seq(function(){
            that()
        })
    }).seq(function(){
        var that = this;
        Seq(bizIdArr).seqEach(function(biz,i){
            var that =  this;
            var paramArr = [], i = 0;
            paramArr[i++]=biz.biz_id;
            query = "insert into biz_checkout_info (biz_id,checkout_id,checkout_name,checkout_remark,status) values (?,2,'银行卡','',1)";
            db.dbQuery(query,paramArr,function(error,rows){that(null,i);})
        }).seq(function(){
            that()
        })
    }).seq(function(){
        var that = this;
        Seq(bizIdArr).seqEach(function(biz,i){
            var that =  this;
            var paramArr = [], i = 0;
            paramArr[i++]=biz.biz_id;
            query = "insert into biz_checkout_info (biz_id,checkout_id,checkout_name,checkout_remark,status) values (?,3,'微信','',1)";
            db.dbQuery(query,paramArr,function(error,rows){that(null,i);})
        }).seq(function(){
            that()
        })
    }).seq(function(){
        var that = this;
        Seq(bizIdArr).seqEach(function(biz,i){
            var that =  this;
            var paramArr = [], i = 0;
            paramArr[i++]=biz.biz_id;
            query = "insert into biz_checkout_info (biz_id,checkout_id,checkout_name,checkout_remark,status) values (?,4,'支付宝','',1)";
            db.dbQuery(query,paramArr,function(error,rows){that(null,i);})
        }).seq(function(){
            process.exit(0);
        })
    })

})();