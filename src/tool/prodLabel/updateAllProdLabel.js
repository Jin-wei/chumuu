/**
 * Created by Josh Yu on 3/4/15.
 */

var mysql = require('mysql');
var Seq = require('seq');
var db = require('../lib/db.js');
var serverLogger = require('../lib/util/ServerLogger.js');
var logger = serverLogger.createLogger('updateAllProdLabel.js');

var sysConfig = require('../lib/config/SystemConfig.js');
var ESUtil=require('mp-es-util').ESUtil;
var esUtil=new ESUtil(sysConfig.getSearchOption(),logger);
var prodDao = require('../lib/dao/ProdDao');
(function insertLabel(){
    var query = '';
    var prodArr = [];
    var topProdArr = [];
    var bizArr = [];
    var pordLabelArr = [];
    Seq().seq(function(){//删除所有系统标签菜品
        var that = this;
        var query = "delete pl from product_label pl,all_label al where pl.label_id=al.id and al.label_kind=0 " ;
        db.dbQuery(query,[],function(error,rows){
            logger.debug(' delete product_label complete');
            that();
        })
    }).seq(function(){//查询所有product
        var that = this;
        query = 'select * from product where active = 1';
        db.dbQuery(query,[],function(error,rows){
            prodArr = rows;
            that()
        })
    }).seq(function(){//查询所有Biz
        var that = this;
        query = 'select biz_id from business';
        db.dbQuery(query,[],function(error,rows){
            bizArr = rows;
            that()
        })
    }).seq(function(){//查询每个Biz销量前十名
        var that = this;
        Seq(bizArr).seqEach(function(bizItem,i){
            var that=this;
            var index = "orderitem_chumuu";
            var indexType="orderitem";
            var searchBody={
                "query": {
                    "bool": {
                        "must": [
                            {"term": {"bizId": bizItem.biz_id}},
                            {"term": {"orderStatus": 104}}
                        ]
                    }
                },
                "size": 0,
                "aggs": {
                    "group_prodId": {
                        "terms": {
                            "field": "prodId",
                            "size": 10
                        },
                        "aggs" : {
                            "sum_quantity" : {
                                "sum" : {
                                    "field" : "quantity"
                                }
                            }
                        }
                    }
                }
            };
            esUtil.searchAggregations(index, indexType,searchBody, function (error,response) {
                if (error) {
                    logger.error(' searchProduct :' + error.message);
                    throw sysError.InternalError(error.message, "search product error");
                } else {
                    var aggs = response.aggregations.group_prodId.buckets;
                    var temp = [];
                    for(var i=0;i<aggs.length;i++){
                        temp.push({
                            prod_id:aggs[i].key,
                            total_count:aggs[i].sum_quantity.value
                        });
                    }
                    topProdArr.push({bizId:bizItem.biz_id,item:temp});
                    that(null,i)
                }
            })
        }).seq(function(){
            that()
        })
    }).seq(function(){//按销量匹配
        var that = this;
        pordLabelArr=[];
        for(var i=0;i<prodArr.length;i++){
            for(var j=0;j<topProdArr.length;j++){
                if(prodArr[i].biz_id==topProdArr[j].bizId){
                    for(var k=0;k<topProdArr[j].item.length;k++){
                        if(prodArr[i].prod_id==topProdArr[j].item[k].prod_id){
                            pordLabelArr.push({
                                prodId:prodArr[i].prod_id,
                                labelId:2,
                                labelName:'热销菜'
                            });
                            break
                        }
                    }
                    break
                }
            }
        }
        that()
    }).seq(function(){
        var that= this;
        Seq(pordLabelArr).seqEach(function (prodLabelitem, i) {
            var that = this;
            prodDao.addBizProdLabel(prodLabelitem, function (err, rows) {
                if (err) {
                    logger.error(' addBizProdLabel ' + err.message);
                    throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    that(null, i);
                }
            });
        }).seq(function(){
            that();
        })
    }).seq(function(){//按关键字匹配
        var that = this;
        pordLabelArr=[];
        Seq(prodArr).seqEach(function (prodArrItem, i) {
            var that = this;
            var allLabelindex = "alllabel_chumuu";
            var allLabelIndexType="alllabel";
            var searchBody = {};
            if(prodArrItem.description){
                searchBody={"query": {multi_match : {query : prodArrItem.description, fields: [ "keyWord"], type:   "best_fields", minimum_should_match: "20%"}}};
            }else if (prodArrItem.ingredient){
                searchBody={"query": {multi_match : {query : prodArrItem.ingredient, fields: [ "keyWord"], type:   "best_fields", minimum_should_match: "20%"}}};
            }else{
                searchBody={"query": {multi_match : {query : prodArrItem.name,fields: [ "keyWord"], type:   "best_fields", minimum_should_match: "20%"}}};
            }
            searchBody.from=0;
            searchBody.size=50;
            esUtil.search(allLabelindex, allLabelIndexType,searchBody,function (error,response) {
                if (error) {
                    logger.error(' searchProduct :' + error.message);
                    throw sysError.InternalError(error.message, "search product error");
                } else {
                    if(response.hits.length>0){
                        for(var i=0;i<response.hits.length;i++){
                            pordLabelArr.push({
                                prodId:prodArrItem.prod_id,
                                labelId:response.hits[i]._id,
                                labelName:response.hits[i]._source.labelName
                            })
                        }
                    }
                    that(null,i);
                }
            });
        }).seq(function(){
            that()
        })
    }).seq(function(){
        var that= this;
        Seq(pordLabelArr).seqEach(function (prodLabelitem, i) {
            var that = this;
            prodDao.addBizProdLabel(prodLabelitem, function (err, rows) {
                if (err) {
                    logger.error(' addBizProdLabel ' + err.message);
                    throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    that(null, i);
                }
            });
        }).seq(function(){
            that();
        })
    }).seq(function(){//按价格匹配
        var that = this;
        pordLabelArr=[];
        Seq(prodArr).seqEach(function (prodArrItem, i) {
            var that = this;
            if (prodArrItem.price>0 && prodArrItem.price<10){
                prodLabelitem={
                    prodId:prodArrItem.prod_id,
                    labelId:3,
                    labelName:'十元以下'
                }
            }else if (prodArrItem.price>=10 && prodArrItem.price<=20){
                prodLabelitem={
                    prodId:prodArrItem.prod_id,
                    labelId:4,
                    labelName:'十元'
                }
            } else if (prodArrItem.price>20 && prodArrItem.price<=30){
                prodLabelitem={
                    prodId:prodArrItem.prod_id,
                    labelId:5,
                    labelName:'二十元'
                }
            }else if (prodArrItem.price>30 && prodArrItem.price<=40){
                prodLabelitem={
                    prodId:prodArrItem.prod_id,
                    labelId:6,
                    labelName:'三十元'
                }
            }else if (prodArrItem.price>40 && prodArrItem.price<=50){
                prodLabelitem={
                    prodId:prodArrItem.prod_id,
                    labelId:7,
                    labelName:'四十元'
                }
            }else if (prodArrItem.price>50){
                prodLabelitem={
                    prodId:prodArrItem.prod_id,
                    labelId:8,
                    labelName:'五十元以上'
                }
            }
            prodDao.addBizProdLabel(prodLabelitem, function (err, rows) {
                if (err) {
                    logger.error(' addBizProdLabel ' + err.message);
                    throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    that(null, i);
                }
            });
        }).seq(function(){
            process.exit(0);
        })
    })

})();