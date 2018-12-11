
var Seq = require('seq');
var serverLogger = require('../ServerLogger.js');
var logger = serverLogger.createLogger('salesPrice.js');

var sysConfig = require('../../config/SystemConfig.js');
var ESUtil=require('mp-es-util').ESUtil;
var esUtil=new ESUtil(sysConfig.getSearchOption(),logger);

function searchProdLabel(prod,callback){
    var pordLabel = [];
    Seq().seq(function(){
        var that = this;

        Seq(prod).seqEach(function(proditem,i){
            var that = this;
            var allLabelindex = "alllabel_chumuu";
            var allLabelIndexType="alllabel";
            var searchBody = {};

            if(proditem.description){
                searchBody={"query": {multi_match : {query : proditem.description, fields: [ "keyWord"], type:   "best_fields", minimum_should_match: "30%"}}};
            }else if (proditem.ingredient){
                searchBody={"query": {multi_match : {query : proditem.ingredient, fields: [ "keyWord"], type:   "best_fields", minimum_should_match: "30%"}}};
            }else{
                searchBody={"query": {multi_match : {query : proditem.productName,fields: [ "keyWord"], type:   "best_fields", minimum_should_match: "30%"}}};
            }
            searchBody.from=0;
            searchBody.size=50;
            // logger.info('prodId:'+proditem.prod_id + '  description:' + proditem.description +'  ingredient：' + proditem.ingredient + '  productName：' + proditem.productName)
            esUtil.search(allLabelindex, allLabelIndexType,searchBody,function (error,response) {
                if (error) {
                    return callback(error);
                } else {
                    if(response.hits.length>0){
                        // for(var i=0;i<response.hits.length;i++){
                            pordLabel.push({
                                prodId:proditem.prod_id,
                                labelId:response.hits[0]._id//取评分最高的标签
                            })
                        // }
                    }
                    that(null,i);
                }
            });
        }).seq(function(){
            return callback(null,pordLabel)
        })
    })
}
module.exports = {
    searchProdLabel : searchProdLabel
};