/**
 * Created by ling xue on 14-7-21.
 */
var Seq = require('seq');
var prodDao = require('./dao/ProdDao');
var bizdao = require('./dao/bizdao.js');
var tableDao = require('./dao/TableDao');
var orderDao = require('./dao/orderDao');
var prodCommentDao = require('./dao/ProdCommentDao.js');
var promoDao = require('./dao/PromoDao.js');
var bizCommentDao =require('./dao/BizCommentDao.js');
var sysError = require('./util/SystemError.js');
var sysMsg = require('./util/SystemMsg.js');
var sysConfig  = require('./config/SystemConfig.js');
var distance  = require('./util/distance.js');

var serverLogger = require('./util/ServerLogger.js');
var logger = serverLogger.createLogger('Search.js');
var ESUtil=require('mp-es-util').ESUtil;

var productIndex = "product_chumuu";
var productIndexType="product";
var productIndexMapping= {
    'product': {
        properties: {
            "prodName": {
                "type": "text"
            },
            "prodNameLang": {
                "type": "text"
            },
            "bizLocation": {
                "type": "geo_point"
            },
            "prodNameRaw": {
                "type": "keyword"
            },
            "description": {
                "type": "text"
            },
            "typeRaw": {
                "type": "keyword"
            },
            "type": {
                "type": "text"
            },
            "typeLang": {
                "type": "text"
            },
            "bizName": {
                "type": "keyword"
            },
            "bizId": {
                "type": "long"
            },
            "typeId": {
                "type": "long"
            },
            "prodId": {
                "type": "long"
            },
            "price": {
                "type": "float"
            },
            "imgUrl": {
                "type": "keyword"
            },
            "city": {
                "type": "keyword"
            },
            "state": {
                "type": "keyword"
            },
            "createdOn":{
                "type": "date"
            },
            "updatedOn":{
                "type": "date"
            },
            "active": {
                "type": "boolean"
            },
            "bizActive": {
                "type": "boolean"
            },
            "unitofmeasure": {
                "type": "text"
            }
        }
    }
};

var businessIndex = "business_chumuu";
var businessIndexType = "business";
var businessIndexMapping= {
    'business': {
        properties: {
            "bizId": {
                "type": "long"
            },
            "name": {
                "type": "text"
            },
            "nameLang": {
                "type": "text"
            },
            "bizLocation": {
                "type": "geo_point"
            },
            "nameRaw": {
                "type": "keyword"
            },
            "nameLangRaw": {
                "type": "keyword"
            },
            "address": {
                "type": "keyword"
            },
            "imgUrl": {
                "type": "keyword"
            },
            "city": {
                "type": "keyword"
            },
            "phone": {
                "type": "keyword"
            },
            "state": {
                "type": "keyword"
            },
            "category": {
                "type": "text"
            },
            "categoryRaw": {
                "type": "keyword"
            },
            "createdOn":{
                "type": "date"
            },
            "updatedOn":{
                "type": "date"
            },
            "bizActive":{
                "type": "boolean"
            }
        }
    }
};

var tableIndex = "table_chumuu";
var tableIndexType = "table";
var tableIndexMapping= {
    'table': {
        properties: {
            "id": {
                "type": "long"
            },
            "bizId": {
                "type": "long"
            },
            "bizName": {
                "type": "keyword"
            },
            "name": {
                "type": "keyword"
            },
            "seats": {
                "type": "long"
            },
            "tableType": {
                "type": "long"
            },
            "tableStatus": {
                "type": "long"
            },
            "tableTypeName": {
                "type": "keyword"
            },
            "tableStatusName": {
                "type": "keyword"
            },
            "city": {
                "type": "keyword"
            },
            "state": {
                "type": "keyword"
            },
            "createdOn":{
                "type": "date"
            },
            "updatedOn":{
                "type": "date"
            },
            "bizLocation": {
                "type": "geo_point"
            },
            "bizActive": {
                "type": "boolean"
            }
        }
    }
};

var orderItemIndex = "orderitem_chumuu";
var orderItemIndexType = "orderitem";
var orderItemIndexMapping= {
    'orderitem': {
        properties: {
            "id": {
                "type": "long"
            },
            "orderId": {
                "type": "long"
            },
            "prodId": {
                "type": "long"
            },
            "prodName": {
                "type": "text"
            },
            "prodNameRaw": {
                "type": "keyword"
            },
            "promoInfo": {
                "type": "keyword"
            },
            "quantity": {
                "type": "long"
            },
            "unitPrice": {
                "type": "float"
            },
            "originPrice": {
                "type": "float"
            },
            "actualPrice": {
                "type": "float"
            },
            "discount": {
                "type": "float"
            },
            "totalPrice": {
                "type": "float"
            },
            "extend": {
                "type": "text"
            },
            "extendPrice": {
                "type": "float"
            },
            "extendTotalPrice": {
                "type": "float"
            },
            "bizId": {
                "type": "long"
            },
            "bizName": {
                "type": "keyword"
            },
            "orderStatus": {
                "type": "long"
            },
            "tableId": {
                "type": "long"
            },
            "peopleNum": {
                "type": "long"
            },
            "city": {
                "type": "keyword"
            },
            "state": {
                "type": "keyword"
            },
            "createdOn":{
                "type": "date"
            },
            "updatedOn":{
                "type": "date"
            },
            "bizLocation": {
                "type": "geo_point"
            },
            "typeId": {
                "type": "long"
            },
            "typeName": {
                "type": "text"
            },
            "typeNameLang": {
                "type": "text"
            },
            "prodLabel": {
                "type": "text"
            }
        }
    }
};

var orderIndex = "order_chumuu";
var orderIndexType = "order";
var orderIndexMapping= {
    'order': {
        properties: {
            "id": {
                "type": "long"
            },
            "promoInfo": {
                "type": "keyword"
            },
            "originPrice": {
                "type": "float"
            },
            "actualPrice": {
                "type": "float"
            },
            "discount": {
                "type": "float"
            },
            "totalPrice": {
                "type": "float"
            },
            "bizId": {
                "type": "long"
            },
            "bizName": {
                "type": "keyword"
            },
            "orderStatus": {
                "type": "long"
            },
            "tableId": {
                "type": "long"
            },
            "peopleNum": {
                "type": "long"
            },
            "city": {
                "type": "keyword"
            },
            "state": {
                "type": "keyword"
            },
            "createdOn":{
                "type": "date"
            },
            "updatedOn":{
                "type": "date"
            },
            "bizLocation": {
                "type": "geo_point"
            }
        }
    }
};

var allLabelIndex = "alllabel_chumuu";
var allLabelType = "alllabel";
var allLabelMapping= {
    'alllabel': {
        properties: {
            "labelName": {
                "type": "text"
            },
            "labelNameLan": {
                "type": "text"
            },
            "keyWord": {
                "type": "text",
                "analyzer": "ik_max_word"
            },
            "keyWordLan": {
                "type": "text"
            }
        }
    }
};


var esUtil=new ESUtil(sysConfig.getSearchOption(),logger);


function doBuildAllLabelIndex(callback){
    var indexAlias=allLabelIndex;
    var index1="alllabel1_chumuu";
    var index2="alllabel2_chumuu";

    var defaultPageSize=2000;

    var indexAllLabel = function(sClient2,index, indexType,start,pageSize,callback){
        prodDao.getAllLabel({start:start,size:pageSize},function(error,rows){
            if(error){
                logger.error(' createAllLabelIndex ' + error.message);
                throw sysError.InternalError(error.message ,"get all label list error");
            }else{
                var labelList = rows;
                logger.info(labelList);
                if (labelList && labelList.length > 0){
                    Seq(labelList).seqEach(function(label,i){
                        var that =  this;
                        sClient2.create({
                            index: index,
                            type: indexType,
                            id: label.id,
                            body: {
                                labelName: label.label_name,
                                labelNameLan: label.label_name_lan,
                                keyWord: label.key_word,
                                keyWordLan: label.key_word_lan
                            }
                        },function (error, data) {
                            //console.log(data);
                            if (error) {
                                callback(error);
                            } else {
                                that(null, i);
                            }
                        });
                    }).seq(function(){
                        return callback(null,true);
                    })
                } else {
                    return callback(null,false);
                }
            }
        });
    }

    return esUtil.doRotateIndex(allLabelType,allLabelMapping,indexAlias,index1,index2, indexAllLabel,defaultPageSize,function(err){
        callback(err);
    })
}


function doBuildProductIndex(callback){
    var productIndexAlias=productIndex;
    var productIndex1="prodindex1_chumuu";
    var productIndex2="prodindex2_chumuu";

    var defaultPageSize=2000;
    var prodLabel = [];
    var indexProduct = function(sClient2,index, indexType,start,pageSize,callback){
        prodDao.getAllProduct({start:start,size:pageSize},function(error,rows){
            if(error){
                logger.error(' createProductIndex ' + error.message);
                throw sysError.InternalError(error.message ,"get product list error");
            }else{
                var prodList = rows;
                logger.info(prodList);
                if (prodList && prodList.length > 0){
                    Seq(prodList).seqEach(function(prod,i){
                        var that =  this;
                        var bizLoc=null;
                        if (prod.latitude && prod.longitude){
                            bizLoc={
                                "lat" : prod.latitude,
                                "lon" : prod.longitude
                            };
                        }
                        sClient2.create({
                            index: index,
                            type: indexType,
                            id: prod.prod_id,
                            body: {
                                prodName: prod.name,
                                prodNameRaw: prod.name,
                                prodNameLang : prod.name_lang,
                                bizLocation : bizLoc,
                                description: prod.description,
                                typeRaw: prod.typeName,
                                type: prod.typeName,
                                typeLang: prod.typeNameLang,
                                bizName: prod.bizName,
                                bizId: prod.biz_id,
                                typeId: prod.type_id,
                                prodId: prod.prod_id,
                                price: prod.price,
                                imgUrl: prod.img_url,
                                city: prod.city,
                                state: prod.state,
                                createdOn:prod.created_on,
                                updatedOn:prod.updated_on,
                                active: prod.active==1,
                                bizActive: prod.bizActive==1,
                                unitofmeasure: prod.unitofmeasure
                            }
                        },function (error, data) {
                            if (error) {
                                callback(error);
                            } else {
                                that(null, i);
                            }
                        });

                    }).seq(function(){
                        return callback(null,true);
                    })
                } else {
                    return callback(null,false);
                }
            }
        });
    }

    return esUtil.doRotateIndex(productIndexType,productIndexMapping,productIndexAlias,productIndex1,productIndex2, indexProduct,defaultPageSize,function(err){
        callback(err);
    })
}

function doBuildBizIndex(callback){
    var indexAlias=businessIndex;
    var index1="businessindex1_chumuu";
    var index2="businessindex2_chumuu";

    var defaultPageSize=2000;

    var indexBiz = function(sClient2,index, indexType,start,pageSize,callback){
        bizdao.search({start:start,size:pageSize},function(error,rows){
            if(error){
                logger.error(' createBizIndex ' + error.message);
                throw sysError.InternalError(error.message ,"get biz list error");
            }else{
                var bizList = rows;
                if (bizList && bizList.length > 0){
                    Seq(bizList).seqEach(function(biz,i){
                        var that =  this;
                        var bizLoc=null;
                        if (biz.latitude && biz.longitude){
                            bizLoc={
                                "lat" : biz.latitude,
                                "lon" : biz.longitude
                            };
                        }
                        sClient2.create({
                            index: index,
                            type: indexType,
                            id: biz.biz_id,
                            body: {
                                bizId: biz.biz_id,
                                name: biz.name,
                                nameRaw: biz.name,
                                nameLang: biz.name_lang,
                                nameLangRaw : biz.name_lang,
                                bizLocation : bizLoc,
                                category: biz.category,
                                categoryRaw: biz.category,
                                imgUrl: biz.img_url,
                                city:  biz.city,
                                address:  biz.address,
                                state: biz.state,
                                phone: biz.phone,
                                createdOn:biz.created_on,
                                updatedOn:biz.updated_on,
                                bizActive:biz.active==1
                            }
                        },function (error, data) {
                            //console.log(data);
                            if (error) {
                                callback(error);
                            } else {
                                that(null, i);
                            }
                        });
                    }).seq(function(){
                        return callback(null,true);
                    })
                } else {
                    return callback(null,false);
                }
            }
        });
    }

    return esUtil.doRotateIndex(businessIndexType,businessIndexMapping,indexAlias,index1,index2, indexBiz,defaultPageSize,function(err){
        callback(err);
    })
}

function doBuildTableIndex(callback){
    var indexAlias=tableIndex;
    var index1="tableindex1_chumuu";
    var index2="tableindex2_chumuu";

    var defaultPageSize=2000;


    var indexTable = function(sClient2,index, indexType,start,pageSize,callback){
        tableDao.queryAllTables({start:start,size:pageSize},function(error,rows){
            if(error){
                logger.error(' createBizIndex ' + error.message);
                throw sysError.InternalError(error.message ,"get biz list error");
            }else{
                var tbList = rows;
                if (tbList && tbList.length > 0){
                    Seq(tbList).seqEach(function(tb,i){
                        var that =  this;
                        var bizLoc=null;
                        if (tb.latitude && tb.longitude){
                            bizLoc={
                                "lat" : tb.latitude,
                                "lon" : tb.longitude
                            };
                        }
                        sClient2.create({
                            index: index,
                            type: indexType,
                            id: tb.id,
                            body: {
                                tableId: tb.id,
                                bizId: tb.biz_id,
                                name: tb.name,
                                seats: tb.seats,
                                tableStatus: tb.status,
                                tableStatusName: tb.statusName,
                                tableType:tb.table_type,
                                tableTypeName: tb.typeName,
                                bizName: tb.bizName,
                                bizLocation : bizLoc,
                                city: tb.city,
                                state: tb.state,
                                createdOn:tb.create_on,
                                updatedOn:tb.update_on,
                                bizActive:tb.biz_active==1
                            }
                        },function (error, data) {
                            //console.log(data);
                            if (error) {
                                callback(error);
                            } else {
                                that(null, i);
                            }
                        });
                    }).seq(function(){
                        return callback(null,true);
                    })
                } else {
                    return callback(null,false);
                }
            }
        });
    }

    return esUtil.doRotateIndex(tableIndexType,tableIndexMapping,indexAlias,index1,index2, indexTable,defaultPageSize,function(err){
        callback(err);
    })
}

//todo change to incremental index
function doBuildOrderItemIndex(callback){
    var indexAlias=orderItemIndex;
    var index1="orderitemindex1_chumuu";
    var index2="orderitemindex2_chumuu";

    var defaultPageSize=2000;

    var indexTable = function(sClient2,index, indexType,start,pageSize,callback){
        orderDao.queryOrderItemFullInfo({start:start,size:pageSize},function(error,rows){
            if(error){
                logger.error(' createOrderItemIndex ' + error.message);
                throw sysError.InternalError(error.message ,"queryOrderItemFullInfo");
            }else{
                var tbList = rows;
                if (tbList && tbList.length > 0){
                    Seq(tbList).seqEach(function(tb,i){
                        var that =  this;
                        var bizLoc=null;
                        if (tb.latitude && tb.longitude){
                            bizLoc={
                                "lat" : tb.latitude,
                                "lon" : tb.longitude
                            };
                        }
                        sClient2.create({
                            index: index,
                            type: indexType,
                            id: tb.id,
                            body: {
                                id: tb.id,
                                orderId:tb.order_id,
                                prodId:tb.prod_id,
                                prodName:tb.prod_name,
                                prodNameRaw:tb.prod_name,
                                promoInfo:tb.promo_info,
                                quantity:tb.quantity,
                                extend:tb.prod_extend,
                                extendPrice:tb.extend_price,
                                extendTotalPirce:tb.extend_total_price,
                                discount:tb.discount,
                                unitPrice:tb.unit_price,
                                originPrice:tb.origin_price,
                                actualPrice:tb.actual_price,
                                totalPrice:tb.total_price,
                                bizId: tb.biz_id,
                                orderStatus: tb.order_status,
                                bizName: tb.biz_name,
                                tableId:tb.table_id,
                                peopleNum:tb.people_num,
                                bizLocation : bizLoc,
                                city: tb.city,
                                state: tb.state,
                                createdOn:tb.create_on,
                                updatedOn:tb.update_on,
                                typeId:tb.typeId,
                                typeName:tb.typeName,
                                typeNameLang:tb.typeNameLang,
                                prodLabel:tb.prod_label
                            }
                        },function (error, data) {
                            //console.log(data);
                            if (error) {
                                callback(error);
                            } else {
                                that(null, i);
                            }
                        });
                    }).seq(function(){
                        return callback(null,true);
                    })
                } else {
                    return callback(null,false);
                }
            }
        });
    }
    return esUtil.doRotateIndex(orderItemIndexType,orderItemIndexMapping,indexAlias,index1,index2, indexTable,defaultPageSize,function(err){
        callback(err);
    })
}

//todo change to incremental index
function doBuildOrderIndex(callback){
    var indexAlias=orderIndex;
    var index1="orderindex1_chumuu";
    var index2="orderindex2_chumuu";

    var defaultPageSize=2000;

    var indexTable = function(sClient2,index, indexType,start,pageSize,callback){
        orderDao.queryAllOrders({start:start,size:pageSize},function(error,rows){
            if(error){
                logger.error(' createOrderIndex ' + error.message);
                throw sysError.InternalError(error.message ,"queryAllOrders");
            }else{
                var tbList = rows;
                if (tbList && tbList.length > 0){
                    Seq(tbList).seqEach(function(tb,i){
                        var that =  this;
                        var bizLoc=null;
                        if (tb.latitude && tb.longitude){
                            bizLoc={
                                "lat" : tb.latitude,
                                "lon" : tb.longitude
                            };
                        }
                        sClient2.create({
                            index: index,
                            type: indexType,
                            id: tb.id,
                            body: {
                                id: tb.id,
                                promoInfo:tb.promo_info,
                                discount:tb.total_discount,
                                unitPrice:tb.unit_price,
                                originPrice:tb.origin_price,
                                actualPrice:tb.actual_price,
                                totalPrice:tb.total_price,
                                bizId: tb.biz_id,
                                orderStatus: tb.status,
                                bizName: tb.b_name,
                                tableId:tb.table_id,
                                peopleNum:tb.people_num,
                                bizLocation : bizLoc,
                                city: tb.b_city,
                                state: tb.b_state,
                                createdOn:tb.create_on,
                                updatedOn:tb.update_on
                            }
                        },function (error, data) {
                            //console.log(data);
                            if (error) {
                                callback(error);
                            } else {
                                that(null, i);
                            }
                        });
                    }).seq(function(){
                        return callback(null,true);
                    })
                } else {
                    return callback(null,false);
                }
            }
        });
    }
    return esUtil.doRotateIndex(orderIndexType,orderIndexMapping,indexAlias,index1,index2, indexTable,defaultPageSize,function(err){
        callback(err);
    })
}

function createProductIndex(req, res, next) {
    doBuildProductIndex(function(error,result){
        if (error){
            logger.error(' createProductIndex ' +'failed'+error.message);
        }else{
            logger.info(' createProductIndex ' +'success');
            res.send(200,{success:true});
            next();
        }
    })
}

function createBusinessIndex(req, res, next) {
    doBuildBizIndex(function(error,result){
        if (error){
            logger.error(' createBizIndex ' +'failed'+error.message);
        }else{
            logger.info(' createBizIndex ' +'success');
            res.send(200,{success:true});
            next();
        }
    })
}

function searchPrefixProduct(req, res, next) {
    var params= req.params;
    var keyword= params.name;
    var from = (params.start==null)?0:params.start;
    var size= (params.size==null)?50:params.size;
    var bizId = params.bizId ? params.bizId : null;
    var searchBody={
        query: {
            multi_match : {
                query : keyword,
                fields: [ "prodName^100","prodNameLang","description"],
                type:   "best_fields",
                minimum_should_match: "75%"
            }
        },
        from : from,
        size : size
    };
    esUtil.search(productIndex, productIndexType,searchBody
        , function (error,hits) {
            if (error) {
                logger.error(' searchProduct :' + error.message);
                throw sysError.InternalError(error.message, "search product error");
            } else {
                var prefixArray = [];
                var productArray= [];
                if (hits.total>0) {
                    productArray=hits.hits;
                    for (var i = 0; i < productArray.length; i++) {
                        if (productArray[i]._source.prodName != null)
                            if(bizId!==null && bizId==productArray[i]._source.bizId){
                                prefixArray.push(productArray[i]._source.prodName);
                            }else if(bizId===null){
                                prefixArray.push(productArray[i]._source.prodName);
                            }
                        if (productArray[i]._source.prodNameLang != null) {
                            if(bizId!==null && bizId==productArray[i]._source.bizId){
                                prefixArray.push(productArray[i]._source.prodNameLang);
                            }else if(bizId===null){
                                prefixArray.push(productArray[i]._source.prodNameLang);
                            }
                        }

                    }
                }
                logger.info(' searchPrefixProduct :' + keyword);
                //console.dir(prefixArray)
                res.send(200,prefixArray);
                next();
            }
        });
}

function searchLikeProd(req, res, next) {
    var params= req.params;
    var keyword= params.name;
    var from = (params.start==null)?0:params.start;
    var size= (params.size==null)?50:params.size;
    var searchBody={
        query: {
            multi_match : {
                query : keyword,
                fields: [ "prodName^100","prodNameLang"],
                type:   "best_fields",
                minimum_should_match: "75%"
            }
        },
        from : from,
        size : size
    };
    esUtil.search(productIndex, productIndexType,searchBody
        , function (error,hits) {
            if (error) {
                logger.error(' searchProduct :' + error.message);
                throw sysError.InternalError(error.message, "search product error");
            } else {
                res.send(200,hits);
                next();
            }
        });
}

function searchPrefixBiz(req, res, next) {
    var params= req.params;
    var keyword= params.name;
    var from = (params.start==null)?0:params.start;
    var size= (params.size==null)?50:params.size;
    var searchBody={
        query: {
            multi_match : {
                query : keyword,
                fields: [ "bizName^100","bizNameLang","category"],
                type:   "best_fields",
                minimum_should_match: "75%"
            }
        },
        from : from,
        size : size
    };
    esUtil.search(businessIndex, businessIndexType,searchBody
        , function (error,hits) {
            if (error) {
                logger.error(' searchBiz :' + error.message);
                throw sysError.InternalError(error.message, "search biz error");
            } else {
                var prefixArray = [];
                var bizArray= [];
                if (hits.total>0) {
                    bizArray=hits.hits;
                    for (var i = 0; i < bizArray.length; i++) {
                        if (bizArray[i]._source.bizName != null)
                            prefixArray.push(bizArray[i]._source.bizName);
                        if (bizArray[i]._source.bizNameLang != null) {
                            prefixArray.push(bizArray[i]._source.bizNameLang);
                        }
                    }
                }
                logger.info(' searchPrefixBiz :' + keyword);
                console.dir(prefixArray)
                res.send(200,prefixArray);
                next();
            }
        });
}

/*function searchPrefixProduct(req, res, next) {
    var params = req.params;

    if(params.name != null){
        params.name =  params.name.toLowerCase();
    }
    searchClient.search({
        index: 'productindex',
        type : 'product',
        body:{
            query: {
                prefix : {
                    _all : {
                        value : params.name.toLowerCase(),
                        boost : 3.0
                    }
                }
            }

        },

        q : params.name,
        from : params.from,
        size : params.size
    }).then(function (body) {
        var productArray = body.hits.hits;
        var prefixArray =  [];
        for(var i=0 ; i<productArray.length;i++){
            var regRes = "";
            if(productArray[i]._source.prodName.toLowerCase().indexOf(params.name.toLowerCase())>-1){
                regRes = productArray[i]._source.prodName;
            }else{
                regRes = productArray[i]._source.prodNameLang;
            }
            prefixArray.push(regRes);

        }
        logger.info(' searchPrefixProduct :' +params.name);
        res.send(200,prefixArray);
        next();
    }, function (error) {
        logger.error(' searchPrefixProduct :' +error.message);
        throw sysError.InternalError(error.message ,"get business list  error");
    });
}*/

/*function searchPrefixBiz(req, res, next) {
    var params = req.params;
    searchClient.search({
        index: 'businessindex',
        type : 'business',
        body:{
            query: {
                prefix : {
                    _all : {
                        value : params.name,
                        boost : 3.0
                    }
                }
            }

        },

        q : params.name,
        from : params.from,
        size : params.size
    }).then(function (body) {
        var bizArray = body.hits.hits;
        var prefixArray =  [];
        for(var i=0 ; i<bizArray.length;i++){
            var regRes = "";
            if(bizArray[i]._source.bizName.toLowerCase().indexOf(params.name.toLowerCase())>-1){
                regRes = bizArray[i]._source.bizName;
            }else{
                regRes = bizArray[i]._source.bizNameLang;
            }
            prefixArray.push(regRes);
        }
        logger.info(' searchPrefixBiz :' +params.name);
        res.send(200,prefixArray);
        next();
    }, function (error) {
        logger.error(' searchPrefixBiz :' +error.message);
        throw sysError.InternalError(error.message ,"get business list  error");
    });
}*/

function searchProduct(req, res, next) {
    var params = req.params;
    //var searchClient = new elasticsearch.Client(sysConfig.getSearchOption());
    var prodList =[];
    var distanceArray = [];
    var bodyQuery ;
    var locationFlag = false;
    var bodyQueryDetail  ;
    if(params.lat == null || params.lon == null ||
        params.start == null || params.end == null){

        bodyQuery = {
            "multi_match" : {
                "query":      params.name,
                "type":       "best_fields",
                "fields":     [  "prodName", "prodNameLang" ],
                "operator":   "and"
            }
        };
        bodyQueryDetail= {
            query:  bodyQuery
        }
    }else{
        locationFlag = true;
        bodyQuery = {
            "filtered": {
                "query" : {
                    "multi_match" : {
                        "query":      params.name,
                        "type":       "best_fields",
                        "fields":     [  "prodName", "prodNameLang" ],
                        "operator":   "and"
                    }
                },
                "filter": {

                    "geo_distance_range" : {
                        "unit": "mi",
                        "from" : params.start ,
                        "to" : params.end ,
                        "bizLocation": {
                            lat : params.lat,
                            lon:  params.lon
                        }
                    }
                }
            }
        }
        bodyQueryDetail= {
            query:  bodyQuery,
            "sort": [
                {
                    "_geo_distance": {
                        "bizLocation": {
                            "lat": params.lat,
                            "lon": params.lon
                        },
                        "order": "asc",
                        "unit": "mi",
                        "distance_type": "sloppy_arc"
                    }
                }
            ]
        }
    }
    searchClient.search({
        index: 'productindex',
        type : 'product',
        //q: params.name,
        body :bodyQueryDetail,
        from : params.from,
        size : params.size
    }).then(function (body) {
        //searchClient.close();
        var productArray = body.hits.hits;
        var idArray = [];
        for(var i=0 ; i<productArray.length;i++){
            idArray.push(productArray[i]._id);
            var distanceObj = {
                id : productArray[i]._id
                //,distance : productArray[i].sort[0]
            }
            if(locationFlag){
                distanceObj.distance = productArray[i].sort[0];
            }
            distanceArray.push(distanceObj);
            //console.log(i+"-----------------------"+distance.getDistance(params.lat,params.lon,productArray[i]._source.bizLocation.lat,productArray[i]._source.bizLocation.lon))
        }
        if(idArray == null || idArray.length==0){
            logger.warn(' searchProduct :' + 'parameter is not correctly');
            res.send(200,null);
            next();
            return ;
        }
        Seq().seq(function(){
            var that = this;
            prodDao.getProductByIds({productIds:idArray},function(error,rows){
                if(error){
                    logger.error(' searchProduct '+error.message);
                    throw sysError.InternalError(error.message ,"get product list  error");
                }else{
                    prodList = rows;
                    that();
                }
            })
        }).seq(function(){
            Seq(prodList).seqEach(function(prod,i){
                var that =  this;
                //get the product promotion info
                for(var j=0; j<distanceArray.length;j++){
                    if(prodList[i].prod_id == distanceArray[j].id){
                        prodList[i].distance = distanceArray[j].distance;
                    }

                }
                promoDao.listBizProdPromo({prodId: prodList[i].prod_id,bizId:prodList[i].biz_id}, function (err, rows) {
                    if (err) {
                        logger.error(' searchProduct '+err.message);
                        throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                    } else {
                        prodList[i].promotionList = rows;
                        that(null,i);
                    }
                });

            }).seqEach(function(prod,i){
                var that =  this;
                //get the product comment and rating info
                prodCommentDao.queryProductRating({productId: prodList[i].prod_id}, function (err, rows) {
                    if (err) {
                        logger.error(' searchProduct '+err.message);
                        throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                    } else {
                        prodList[i].commentRating = rows[0];
                        that(null,i);
                    }
                });

            }).seqEach(function(prod,i){
                var that =  this;
                //get the product favoriate info
                prodDao.getProductFavoriteCount({productId: prodList[i].prod_id}, function (err, rows) {
                    if (err) {
                        logger.error(' searchProduct '+err.message);
                        throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                    } else {
                        prodList[i].favorite = rows.favorite_count;
                        that(null,i);
                    }
                });

            }).seq(function(){
                //searchClient.close();
                logger.info(' searchProduct '+'success');

                res.send(200,prodList);
                next();

            });
        });


        //todo
    }, function (error) {
        //searchClient.close();
        logger.error(' searchProduct '+error.message);
        throw sysError.InternalError(error.message ,"get business list  error");
        //callback(error);
        //todo
    });
}

function searchBusiness(req,res,next){
    //var searchClient = new elasticsearch.Client(sysConfig.getSearchOption());
    var bizList = [];
    var distanceArray = [];
    var params = req.params;
    var bodyQuery ;
    var locationFlag = false;
    var bodyQueryDetail ;
    if(params.lat == null || params.lon == null ||
        params.start == null || params.end == null){
        bodyQuery = {
            "multi_match" : {
                "query":      params.name,
                "type":       "best_fields",
                "fields":     [ "bizName", "bizNameLang" ],
                "operator":   "and"
            }
        };
        bodyQueryDetail = {
            query: bodyQuery
        }
    }else{
        locationFlag = true;
        bodyQuery = {

            "filtered": {
                "query" : {
                    //"terms" : { "bizName" : "牛" }
                    "multi_match" : {
                        "query":      params.name,
                        "type":       "best_fields",
                        "fields":     [ "bizName", "bizNameLang" ],
                        "operator":   "and"
                    }


                },
                "filter": {

                    "geo_distance_range" : {
                        "unit": "mi",
                        "from" : params.start ,
                        "to" : params.end ,
                        "bizLocation": {
                            lat : params.lat,
                            lon:  params.lon
                        }
                    }
                }
            }
        }
        bodyQueryDetail = {
            query: bodyQuery,
            "sort": [
                {
                    "_geo_distance": {
                        "bizLocation": {
                            "lat":  params.lat,
                            "lon":  params.lon
                        },
                        "order":         "asc",
                        "unit":          "mi",
                        "distance_type": "sloppy_arc"
                    }
                }
            ]
        }
    }
    searchClient.search({
        index: 'businessindex',
        type : 'business',
        //q: params.name,
        body :bodyQueryDetail,
        from : params.from,
        size : params.size
    }).then(function (body) {
        //searchClient.close();

        var bizArray = body.hits.hits;
        var idArray = [];

        for(var i=0 ; i<bizArray.length;i++){
            idArray.push(bizArray[i]._id);
            var distanceObj = {
                id : bizArray[i]._id
            }
            if(locationFlag){
                distanceObj.distance =  bizArray[i].sort[0];
            }
            distanceArray.push(distanceObj);

        }
        if(idArray == null || idArray.length==0){
            logger.warn(' searchBusiness '+ ' parameter is not correctly');
            res.send(200,null);
            next();
            return ;
        }
        Seq().seq(function(){
            var that = this;
            bizdao.getBizByIds({bizIds:idArray},function(error,rows){
                if(error){
                    logger.error(' searchBusiness '+ error.message);
                    throw sysError.InternalError(error.message ,"get business list  error");
                }else{
                    bizList = rows;
                    that();
                }
            });
        }).seq(function(){
            Seq(bizList).seqEach(function(biz,i){
                var that =  this;
                for(var j=0; j<distanceArray.length;j++){
                    if(bizList[i].biz_id == distanceArray[j].id){
                        bizList[i].distance = distanceArray[j].distance;
                    }

                }
                //get the biz comment and rating info
                bizCommentDao.queryBizRating({bizId: bizList[i].biz_id}, function (err, rows) {
                    if (err) {
                        logger.error(' searchBusiness '+ err.message);
                        throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                    } else {

                        if(rows[0].avg_food != null && rows[0].avg_price!=null && rows[0].avg_service != null){
                            var avg_rating = (rows[0].avg_food+rows[0].avg_price+rows[0].avg_service)/3.0*20.0;
                            rows[0].avg_rating = avg_rating;
                        }
                        bizList[i].commentRating = rows[0];
                        that(null,i);
                    }
                });

            }).seqEach(function(biz,i){
                var that =  this;
                //get the biz favoriate info
                bizdao.getFavoriteBizCount({bizId: bizList[i].biz_id}, function (err, rows) {
                    if (err) {
                        logger.error(' searchBusiness '+ err.message);
                        throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                    } else {
                        bizList[i].favorite = rows.favorite_count;
                        that(null,i);
                    }
                });

            }).seq(function(){
                //searchClient.close();
                logger.info(' searchBusiness '+ 'success');
                res.send(200,bizList);
                next();
                //callback(bizList);
            });
        });

    }, function (error) {
        //searchClient.close();
        logger.error(' searchBusiness '+ error.message);
        throw sysError.InternalError(error.message ,"get business list  error");

    });

}

/*function searchLikeProd(req, res, next){
    var params = req.params;
    var prodList = [];
    searchClient.search({
        index: 'productindex',
        type : 'product',
        body:{
            query: {
                fuzzy_like_this : {
                    fields : ["prodName", "prodNameLang"],
                    like_text : params.name
                }
            }

        },
        from : params.from,
        size : params.size
    }).then(function (body) {
        var productArray = body.hits.hits;
        var idArray = [];
        for(var i=0 ; i<productArray.length;i++){
            idArray.push(productArray[i]._id);
        }
        if(idArray == null || idArray.length==0){
            res.send(200,null);
            next();
            return ;
        }
        Seq().seq(function(){
            var that = this;
            prodDao.getProductByIds({productIds:idArray},function(error,rows){
                if(error){
                    logger.error(' searchLikeProd '+ error.message);
                    throw sysError.InternalError(error.message ,"get product list  error");
                }else{
                    prodList = rows;
                    that();
                }
            })
        }).seq(function(){
            Seq(prodList).seqEach(function(prod,i){
                var that =  this;
                //get the product promotion info
                promoDao.listBizProdPromo({prodId: prodList[i].prod_id,bizId:prodList[i].biz_id}, function (err, rows) {
                    if (err) {
                        logger.error(' searchLikeProd '+ err.message);
                        throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                    } else {
                        prodList[i].promotionList = rows;
                        that(null,i);
                    }
                });

            }).seqEach(function(prod,i){
                var that =  this;
                //get the product comment and rating info
                prodCommentDao.queryProductRating({productId: prodList[i].prod_id}, function (err, rows) {
                    if (err) {
                        logger.error(' searchLikeProd '+ err.message);
                        throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                    } else {
                        prodList[i].commentRating = rows[0];
                        that(null,i);
                    }
                });

            }).seqEach(function(prod,i){
                var that =  this;
                //get the product favoriate info
                prodDao.getProductFavoriteCount({productId: prodList[i].prod_id}, function (err, rows) {
                    if (err) {
                        logger.error(' searchLikeProd '+ err.message);
                        throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                    } else {
                        prodList[i].favorite = rows.favorite_count;
                        that(null,i);
                    }
                });

            }).seq(function(){
                //searchClient.close();
                logger.info(' searchLikeProd '+ 'success');
                res.send(200,prodList);
                next();

            });
        });
    }, function (error) {
        logger.error(' searchLikeProd '+ error.message);
        throw sysError.InternalError(error.message ,"get business list  error");
    });
}*/

function searchLikeBiz(req,res,next){
    var bizList = [];
    var params = req.params;
    searchClient.search({
        index: 'businessindex',
        type : 'business',
        body:{
            query: {
                fuzzy_like_this : {
                    fields : ["bizName", "bizNameLang"],
                    like_text : params.name
                }
            }

        },
        from : params.from,
        size : params.size
    }).then(function (body) {
        //searchClient.close();

        var bizArray = body.hits.hits;
        var idArray = [];
        for(var i=0 ; i<bizArray.length;i++){
            idArray.push(bizArray[i]._id);
        }
        if(idArray == null || idArray.length==0){
            logger.warn(' searchLikeBiz '+ 'parameter is not correctly');
            res.send(200,null);
            next();
            return ;
        }
        Seq().seq(function(){
            var that = this;
            bizdao.getBizByIds({bizIds:idArray},function(error,rows){
                if(error){
                    logger.error(' searchLikeBiz '+ error.message);
                    throw sysError.InternalError(error.message ,"get business list  error");
                }else{
                    bizList = rows;
                    that();
                }
            });
        }).seq(function(){
            Seq(bizList).seqEach(function(biz,i){
                var that =  this;
                //get the biz comment and rating info
                bizCommentDao.queryBizRating({bizId: bizList[i].biz_id}, function (err, rows) {
                    if (err) {
                        logger.error(' searchLikeBiz '+ err.message);
                        throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                    } else {

                        if(rows[0].avg_food != null && rows[0].avg_price!=null && rows[0].avg_service != null){
                            var avg_rating = (rows[0].avg_food+rows[0].avg_price+rows[0].avg_service)/3.0*20.0;
                            rows[0].avg_rating = avg_rating;
                        }
                        bizList[i].commentRating = rows[0];
                        that(null,i);
                    }
                });

            }).seqEach(function(biz,i){
                var that =  this;
                //get the biz favoriate info
                bizdao.getFavoriteBizCount({bizId: bizList[i].biz_id}, function (err, rows) {
                    if (err) {
                        logger.error(' searchLikeBiz '+ err.message);
                        throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                    } else {
                        bizList[i].favorite = rows.favorite_count;
                        that(null,i);
                    }
                });

            }).seq(function(){
                //searchClient.close();
                logger.info(' searchLikeBiz '+ 'success');
                res.send(200,bizList);
                next();
                //callback(bizList);
            });
        });

    }, function (error) {
        //searchClient.close();
        logger.error(' searchLikeBiz '+ error.message);
        throw sysError.InternalError(error.message ,"get business list  error");

    });
}



function createWechatBizIndex(req,res,next){
    var bizList  = [];
    Seq().seq(function(){
        //Delete past business index
        var that = this;
        searchClient.indices.delete({
            index: businessIndex
        }).then(function (body) {
            that();
        }, function (error) {
            that();
            logger.error(' createWechatBizIndex ' +error.message);
            throw sysError.InternalError(error.message ,"create wechat biz index error");
        });
    }).seq(function(){
        var that = this;
        //create new business index
        searchClient.indices.create({
            index: businessIndex
        }).then(function (body) {
            //console.log(body);
            that();
        }, function (error) {
            logger.error(' createWechatBizIndex ' +error.message);
            throw sysError.InternalError(error.message ,"create wechat business index error");
        });

    }).seq(function(){
        var that = this;
        //create document type
        searchClient.indices.putMapping({
            index:businessIndex,
            type : businessType,
            body: {
                'business': {
                    properties: {
                        "parentId": {
                            "type": "string",store:true,index:'analyzed'
                        },
                        "bizLocation": {
                            "type": "geo_point",store:true,index:'analyzed'
                        }
                    }
                }
            }

        }).then(function(body){
            that();
        },function(error){
            logger.error(' createWechatBizIndex ' +error.message);
            throw sysError.InternalError(error.message ,"create wechat business mapping error");
        })
    }).seq(function(){
        var that = this;
        bizdao.search({},function(error,rows){
            if(error){
                logger.error(' createWechatBizIndex ' +error.message);
                throw sysError.InternalError(error.message ,"get  wechat business list  error");
            }else{
                bizList = rows;
                Seq(bizList).seqEach(function(biz,i){
                    var that =  this;
                    if(biz.latitude == null || biz.longitude == null){
                        that(null,i);
                    }else{
                        searchClient.create({
                            index: businessIndex,
                            type: businessType,
                            id: biz.biz_id,
                            body: {
                                parentId : biz.parent_id,
                                bizLocation : {
                                    "lat" : biz.latitude,
                                    "lon" : biz.longitude
                                }

                            }
                        },function(error,data){
                            that(null,i);
                        });
                    }


                }).seq(function(){
                    that();
                });
            }
        });
    }).seq(function(){
        logger.info(' createWechatBizIndex ' +'success');
        res.send(200,{success:true});
        next();
    });
}


function searchWechatBusiness(req,res,next){
    //var searchClient = new elasticsearch.Client(sysConfig.getSearchOption());
    var bizList = [];
    var distanceArray = [];
    var params = req.params;
    var bodyQuery ;
    var locationFlag = false;
    var bodyQueryDetail ;
    if(params.lat == null || params.lon == null ||
        params.start == null || params.end == null){
        bodyQuery = {
            "multi_match" : {
                "query":      params.name,
                "type":       "best_fields",
                "fields":     [ "parentId" ],
                "operator":   "and"
            }
        };
        bodyQueryDetail = {
            query: bodyQuery
        }
    }else{
        locationFlag = true;
        bodyQuery = {

            "filtered": {
                "query" : {
                    //"terms" : { "bizName" : "牛" }
                    "multi_match" : {
                        "query":      params.name,
                        "type":       "best_fields",
                        "fields":     [ "parentId" ],
                        "operator":   "and"
                    }


                },
                "filter": {

                    "geo_distance_range" : {
                        "unit": "km",
                        "from" : params.start ,
                        "to" : params.end ,
                        "bizLocation": {
                            lat : params.lat,
                            lon:  params.lon
                        }
                    }
                }
            }
        }
        bodyQueryDetail = {
            query: bodyQuery,
            "sort": [
                {
                    "_geo_distance": {
                        "bizLocation": {
                            "lat":  params.lat,
                            "lon":  params.lon
                        },
                        "order":         "asc",
                        "unit":          "mi",
                        "distance_type": "sloppy_arc"
                    }
                }
            ]
        }
    }
    searchClient.search({
        index: businessIndex,
        type : 'business',
        //q: params.name,
        body :bodyQueryDetail,
        from : params.from,
        size : params.size
    }).then(function (body) {
        //searchClient.close();

        var bizArray = body.hits.hits;
        var idArray = [];

        for(var i=0 ; i<bizArray.length;i++){
            idArray.push(bizArray[i]._id);
            var distanceObj = {
                id : bizArray[i]._id
            }
            if(locationFlag){
                distanceObj.distance =  bizArray[i].sort[0];
            }
            distanceArray.push(distanceObj);

        }
        if(idArray == null || idArray.length==0){
            logger.warn(' searchWechatBusiness '+ ' parameter is not correctly');
            res.send(200,null);
            next();
            return ;
        }
        Seq().seq(function(){
            var that = this;
            bizdao.getBizByIds({bizIds:idArray},function(error,rows){
                if(error){
                    logger.error(' searchWechatBusiness '+ error.message);
                    throw sysError.InternalError(error.message ,"get business list  error");
                }else{
                    bizList = rows;
                    that();
                }
            });
        }).seq(function(){
            Seq(bizList).seqEach(function(biz,i){
                var that =  this;
                for(var j=0; j<distanceArray.length;j++){
                    if(bizList[i].biz_id == distanceArray[j].id){
                        bizList[i].distance = distanceArray[j].distance;
                    }

                }
                //get the biz comment and rating info
                bizCommentDao.queryBizRating({bizId: bizList[i].biz_id}, function (err, rows) {
                    if (err) {
                        logger.error(' searchWechatBusiness '+ err.message);
                        throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                    } else {

                        if(rows[0].avg_food != null && rows[0].avg_price!=null && rows[0].avg_service != null){
                            var avg_rating = (rows[0].avg_food+rows[0].avg_price+rows[0].avg_service)/3.0*20.0;
                            rows[0].avg_rating = avg_rating;
                        }
                        bizList[i].commentRating = rows[0];
                        that(null,i);
                    }
                });

            }).seqEach(function(biz,i){
                var that =  this;
                //get the biz favoriate info
                bizdao.getFavoriteBizCount({bizId: bizList[i].biz_id}, function (err, rows) {
                    if (err) {
                        logger.error(' searchWechatBusiness '+ err.message);
                        throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                    } else {
                        bizList[i].favorite = rows.favorite_count;
                        that(null,i);
                    }
                });

            }).seq(function(){
                //searchClient.close();
                logger.info(' searchWechatBusiness '+ 'success');
                res.send(200,bizList);
                next();
                //callback(bizList);
            });
        });

    }, function (error) {
        //searchClient.close();
        logger.error(' searchWechatBusiness '+ error.message);
        throw sysError.InternalError(error.message ,"get business list  error");

    });

}



module.exports = {
    createProductIndex : createProductIndex,
    doBuildProductIndex:doBuildProductIndex,
    doBuildBizIndex:doBuildBizIndex,
    doBuildTableIndex:doBuildTableIndex,
    doBuildOrderItemIndex:doBuildOrderItemIndex,
    doBuildOrderIndex:doBuildOrderIndex,
    doBuildAllLabelIndex:doBuildAllLabelIndex,
    createBusinessIndex : createBusinessIndex,
    searchProduct : searchProduct,
    searchBusiness : searchBusiness,
    searchPrefixProduct : searchPrefixProduct,
    searchPrefixBiz : searchPrefixBiz,
    searchLikeProd : searchLikeProd,
    searchLikeBiz : searchLikeBiz,
    createWechatBizIndex : createWechatBizIndex,
    searchWechatBusiness : searchWechatBusiness
}