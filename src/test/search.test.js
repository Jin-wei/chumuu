/**
 * Created by ling xue on 14-7-20.
 */
var assert = require("assert");

var elasticsearch = require('elasticsearch');
var Seq = require('seq');
var search = require('../lib/Search.js');
var prodDao = require('../lib/dao/ProdDao.js');

exports.test = function (client) {
    var prodList  = [];

    describe('service: search', function () {
        /*it('should get a list of prod', function (done) {
            client.get('/biz/103072/prod', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    prodList = data;
                    done();
                }
            });
        });
        it('should create a product index', function (done) {
            client.get('/searchBiz?name=asain&from=0&size=20', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.length>0,"should get more than one bizInfo")
                    done();
                }
            });
        });
        it('should create a biz index', function (done) {
            client.get('/cust/do/createBizIndex',function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.success==200,"should create a biz index")
                    done();
                }
            });
        });
        it('should create a index of product', function (done) {
            client.get('/cust/do/createProdIndex',function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.success==200,"should create a prod index")
                    done();
                }
            });
        });
        it('should get a list of product', function (done) {
            client.get('/cust/do/searchProd?name=asain&from=0&size=20', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.length>0,"should get more than one bizInfo")
                    done();
                }
            });
        });

        it('should get a list of business ', function (done) {
            client.get('/searchBiz?name=asain&from=0&size=20', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.length>0,"should get more than one bizInfo")
                    done();
                }
            });
            *//*var params={
                productIds :[103072,103073]
                };
            prodDao.getProductByIds(params,function(error,rows){
                console.log(rows);
            })*//*
            //var searchClient = new elasticsearch.Client({host: '127.0.0.1:9200'});
            *//*searchClient.indices.create({
                index: 'productindex'
            }).then(function (body) {
                console.log(body);
                    done();
            }, function (error) {
               console.log(error);
                    done();
            });*//*
            *//*searchClient.indices.delete({
             index: 'productindex'
             }).then(function (body) {
             console.log(body);
             done();
             }, function (error) {
             console.log(error);
             done();
             });*//*

            *//*Seq(prodList).seqEach(function(prod,i){
                var that =  this;

                searchClient.create({
                    index: 'productindex',
                    type: 'product',
                    id: prod.prod_id,
                    body: {
                        product : prod.productName,
                        prodNameLang :prod.name_lang

                    }
                },function(error,data){
                    console.log(data);
                    that(null,i);
                });

            }).seq(function(){
                    searchClient.close();
                    done();
                });*//*
            *//*searchClient.indices.putMapping({
                index:'productindex',
                type : 'product',
                body: {
                    'product': {
                        properties: {
                            "prodName": {
                                "type": "string",store:true,index:'analyzed'
                            },
                            "prodNameLang": {
                                "type": "string",store:true,index:'analyzed'
                            }
                        }
                    }
                }

            }).then(function(body){
                console.log(body)
            },function(error){
                console.log(error)
            })*//*
            *//*searchClient.indices.getMapping({
             index: 'productindex'
             type : 'product'
             }).then(function(body){
             console.log(body)
             },function(error){
             console.log(error)
             })*//*
            *//**//*
            *//*searchClient.create({
                index: 'myindex',
                type: 'mytype',
                id: '1',
                body: {
                    title: "testTitle",
                    tags: "testTags"
                }
            },function(error,data){
                console.log(data);
            });*//*
            *//*searchClient.search({
                index: 'productindex',
                type : 'product',
                q: '牛',
                size:100
            }).then(function (body) {
                    searchClient.close();
                    console.log(body);
                    done()
                }, function (error) {
                    searchClient.close();
                    console.log(error.message);
                    done();
                });
*//*
        });*/

        /*it('should get a list of biz', function (done) {
            client.get('/cust/do/searchBizLike?name=asain&from=0&size=20', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.length>0,"should get more than one bizInfo")
                    done();
                }
            });
        });

        it('should get a list of product', function (done) {
            client.get('/cust/do/searchProdLike?name=asain&from=0&size=20', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.length>0,"should get more than one product info")
                    done();
                }
            });
        });

        it('should get a list of biz', function (done) {
            client.get('/cust/do/searchBizTip?name=as&from=0&size=20', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.length>0,"should get more than one bizInfo")
                    done();
                }
            });
        });

        it('should get a list of product', function (done) {
            client.get('/cust/do/searchProdTip?name=be&from=0&size=20', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.length>0,"should get more than one product info")
                    done();
                }
            });
        });*/

        it('should get a list of product', function (done) {
            client.get('/bizGeoIndex', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.success,"should create a business index")
                    done();
                }
            });
        });
    });

};