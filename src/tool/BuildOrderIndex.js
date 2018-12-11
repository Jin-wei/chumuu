var search=require('../lib/Search.js');
var orderDao=require('../lib/dao/orderDao.js');
var Seq = require('seq');
//commond line tool to build product index
(function main() {
    Seq().seq(function(){
        var that =this;
        orderDao.batchCancelSubmittedOrderNew(null,function(error,count){
            if (error) {
                console.log("batchCancelSubmittedOrderNew failed:" + error.message);
                process.exit(0);
            }else{
                console.log("batchCancelSubmittedOrderNew count:" + count);
            }
            that();
        })
    }).seq(function(){
        var that =this;
        orderDao.batchCancelSubmittedTableNew(null,function(error,count){
            if (error) {
                console.log("batchCancelSubmittedTableNew failed:" + error.message);
                process.exit(0);
            }else{
                console.log("batchCancelSubmittedTableNew count:" + count);
            }
            that();
        })
    }).seq(function(){
        var that =this;
        orderDao.batchCancelSubmittedOrder(null,function(error,count){
            if (error) {
                console.log("batchCancelSubmittedOrder failed:" + error.message);
                process.exit(0);
            }else{
                console.log("batchCancelSubmittedOrder count:" + count);
            }
            that();
        })
    }).seq(function(){
        var that =this;
        orderDao.batchCompleteInProgressOrder(null,function(error,count){
            if (error) {
                console.log("batchCompleteInProgressOrder failed:" + error.message);
                process.exit(0);
            }else{
                console.log("batchCompleteInProgressOrder count:" + count);
            }
            that();
        })
    }).seq(function(){
        var that =this;
        search.doBuildOrderIndex( function (error) {
            if (error) {
                console.log("index order failed:" + error.message);
                process.exit(0);
            } else {
                console.log("index order succeed");
            }
          that();
        });
    }).seq(function(){
        search.doBuildOrderItemIndex( function (error) {
            if (error) {
                console.log("index order item failed:" + error.message);
            } else {
                console.log("index order item succeed");
            }
            process.exit(0);
        });
    })
})();