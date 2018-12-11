

var Seq = require('seq');
var serverLogger = require('../ServerLogger.js');
var logger = serverLogger.createLogger('salesPrice.js');

var sysConfig = require('../../config/SystemConfig.js');
var ESUtil=require('mp-es-util').ESUtil;
var esUtil=new ESUtil(sysConfig.getSearchOption(),logger);
var db = require('../../db.js');

function searchProdLabel(prod,callback){
    var bizArr = [];
    var topProdArr = [];
    var pordLabel=[];
    Seq().seq(function(){
        var that = this;
        query = 'select biz_id from business';
        db.dbQuery(query,[],function(error,rows){
            bizArr = rows;
            that()
        })
    }).seq(function(){
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
                    return callback(error);
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
    }).seq(function(){
        var that = this;
        for(var i=0;i<prod.length;i++){
            for(var j=0;j<topProdArr.length;j++){
                if(prod[i].biz_id==topProdArr[j].bizId){
                    for(var k=0;k<topProdArr[j].item.length;k++){
                        if(prod[i].prod_id==topProdArr[j].item[k].prod_id){
                            pordLabel.push({
                                prodId:prod[i].prod_id,
                                labelId:2
                            });
                            break
                        }
                    }
                    break
                }
            }
        }
        return callback(null,pordLabel)
    })
}
module.exports = {
    searchProdLabel : searchProdLabel
};
