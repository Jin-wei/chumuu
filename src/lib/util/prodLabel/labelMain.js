/**
 * Created by nie on 22/2/18
 */

var mysql = require('mysql');
var Seq = require('seq');
var db = require('../../db.js');
var serverLogger = require('../ServerLogger.js');
var logger = serverLogger.createLogger('labelMain.js');
var prodDao = require('../../dao/ProdDao');
var labelList = require('./GLBConfig.js');
var path = require('path');

function labelMain(prod,callback){
    var prodLabel = [];
    Seq().seq(function(){//删除所有系统标签菜品
        var that = this;
        var prodIdDel = '';
        if(prod.length>0){
            for(var i=0;i<prod.length;i++){
                prodIdDel += prod[i].prod_id + ',';
            }
            prodIdDel = prodIdDel.substring(0,prodIdDel.length-1)
        }
        var query = "delete pl from product_label pl,all_label al where pl.label_id=al.id and al.label_kind=0 " ;
        if(prodIdDel!=''){
            query+=' and pl.prod_id in (' + prodIdDel + ')'
        }
        db.dbQuery(query,[],function(error,rows){
            logger.debug(' delete product_label complete');
            that();
        })
    }).seq(function(){//根据策略获取标签
        var that = this;
        Seq(labelList.LABELLIST).seqEach(function (list, i) {
            var that = this;
            var fileName = require(path.join(__dirname, '/' + list.fileName));
            fileName.searchProdLabel(prod,function(error,results){
                if(results && results.length>0){
                    prodLabel.push.apply(prodLabel,results);
                }
                that(null,i)

            });
        }).seq(function(){
            that();
        })
    }).seq(function(){//保存
        var that = this;
        var insertValue = '';
        if(prodLabel.length>0){
            for(var i=0;i<prodLabel.length;i++){
                insertValue += '(' + prodLabel[i].prodId + ',' + prodLabel[i].labelId + '),';
            }
            insertValue = insertValue.substring(0,insertValue.length-1)
        }
        if(insertValue!=''){
            var query = "insert into product_label(prod_id,label_id) value " + insertValue;
        }
        db.dbQuery(query,[],function(error,rows){
            logger.debug(' add product_label complete');
            return callback(null);
        });
    })
}

module.exports = {
    labelMain : labelMain
}