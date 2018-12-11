var assert = require("assert");
var db = require('./../lib/db.js');


exports.test = function (client,request) {
    describe('service: prod', function () {

        /*// Test #1
        describe('Test get prod list', function () {
            it('should get a list of prod', function (done) {
                client.get('/biz/100001/prod', function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.length > 0, "prod list length>0");
                        done();
                    }
                });
            });

            it('should get a prod', function (done) {
                client.get('/biz/100001/prod/100001', function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.prod_id == 100001, "product id found");
                        done();
                    }
                });
            });
        });

        */
        // Test #2
        /*
        describe('Test CRUD a prod', function () {

            var prodId = null;


            it('-- create new product', function (done) {
                request
                    .post('/biz/100001/prod')
                    .type('form').field('name', 'aa1')
                    .field('description', 'bb')
                    .field('type_id', 1)
                    .field('price', 1000)
                    .field('note', 'xxyybb')
                    .end(function(err, res) {
                        prodId = res.body.prod_id;
                        if (err) {
                            throw new Error(err);
                        }
                        else {
                            assert(prodId > 0, "prod should be created");
                            done();
                        }
                    });
                client.post('/biz/100001/prod', {name: "aa", description: "bb", type: "abc", price: 123, note: "aabb"}, function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        prodId = data.prod_id;
                        assert(prodId > 0, "prod should be created");
                        done();
                    }
                });
            });

            it('-- get new created product', function (done) {
                client.get('/biz/100001/prod/' + prodId, function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert('aa1' == data.name, "name match");
                        assert('bb' == data.description, "description match");
                        assert(1 == data.type_id, "type match");
                        assert(1000 == data.price, "price match");
                        assert('aabb' == data.note, "note match");
                        assert(1 == data.active, "active match");
                        done();
                    }


                });
            });

            it('-- update product', function (done) {
                client.put('/biz/100001/prod/' + prodId, {name: "aa1", description: "bb1", type_id: 1, price: 1234, note: "aabb1", active: 0}, function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.succeed == true, "prod should be updated ");
                        done();
                    }
                });
            });

            it('-- verify updated product', function (done) {
                client.get('/biz/100001/prod/' + prodId, function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert('aa1' == data.name, "name match");
                        assert('bb1' == data.description, "description match");
                        assert(1 == data.type_id, "type match");
                        assert(1234 == data.price, "price number match");
                        assert('aabb1' == data.note, "note match");
                        assert(0 == data.active, "active match");
                        done();
                    }

                });
            });

            it('-- verify delete product', function (done) {
                client.del('/biz/100001/prod/' + prodId, function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.succeed == true, "prod should be deleted ");
                        done();
                    }

                });
            });

            it('-- verify get top product', function (done) {
                client.get('/biz/get/topDish'+"?size=10&latitude=37.533&longitude=-121.920&distance=1000", function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.length >=0, "Top dishes list should be not empty ");
                        done();
                    }

                });
            });

            it('-- verify get top product without size', function (done) {
                client.get('/biz/get/topDish?latitude=37.533&longitude=-121.920&distance=1000', function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.length >=0, "Top dishes list should be not empty ");
                        done();
                    }

                });
            });

            it('-- update product active', function (done) {
                client.put('/biz/100001/prodActive/100001', {active:"0"}, function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {

                        assert(data.success == true, "prod active should be updated");
                        done();
                    }
                });
            });
        });
        describe('Test product count by biz id', function () {
            it('-- get business active product count', function (done) {
                client.get('/biz/100001/productCount', function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {

                        assert(data.productCount > 0, "product count should be get");
                        done();
                    }
                });
            });

            it('-- get business  product type count', function (done) {
                client.get('/biz/100001/productTypeCount', function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {

                        assert(data.productTypeCount > 0, "product type count should be get");
                        done();
                    }
                });
            });
        });
    });

    /*describe('service: product type', function () {
        // Test #1
        describe('Test get product type list', function () {
            it('should get a list of prodType', function (done) {
                client.get('/biz/100001/prodType', function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.length > 0, "prod type list length>0");
                        done();
                    }
                });
            });

            it('should get a prod type', function (done) {
                client.get('/biz/100001/prodType/1', function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data[0].type_id == 1, "product id found");
                        done();
                    }
                });
            });


            it('-- create new product type', function (done) {
                client.post('/biz/100001/prodType', {name: "productType",  name_lang: "菜品类型"}, function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        var type_id = data.prodTypeId;
                        assert(type_id > 0, "prod type should be created");
                        done();
                    }
                });

            });

            it('-- update a product type', function (done) {
                client.put('/biz/100001/prodType/1', {name: "productType",  nameLang: "菜品类型" , active:"1"}, function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {

                        assert(data.success == true, "prod type should be updated");
                        done();
                    }
                });

            });

            it('-- delete a product type', function (done) {
                client.del('/biz/100001/prodType/1',  function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {

                        assert(data.success == true, "prod type should be deleted");
                        done();
                    }
                });

            });
        });*/
        describe('Test  product comment api ', function () {
            /*it('should add a product comment ', function (done) {
                client.post('/cust/100378/prod/103072/comment', {'comment': 'none', 'rating': 3}, function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.affectedRows > 0, "prod list length>0");
                        done();
                    }
                });
            });

            it('should get customer comment', function (done) {
                client.get('/cust/100378/custComment', function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.length > 0, "customer comment  found");
                        done();
                    }
                });
            });

            it('should get product comment', function (done) {
                client.get('/cust/103072/prodComment', function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.length >0, "product comment found");
                        done();
                    }
                });
            });

            it('should get product comment count and rating ', function (done) {
                client.get('/cust/103072/ratComment', function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.length >0, "product comment count get");
                        done();
                    }
                });
            });

            it('should update product comment  ', function (done) {
                client.put('/cust/100378/comment/1/',{comment: "product",  rating: 4 }, function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.affectedRows >0, "product comment count get");
                        done();
                    }
                });
            });

            it('should delete product comment ', function (done) {
                client.del('/cust/100378/comment/5/', function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.affectedRows >0, "product comment count get");
                        done();
                    }
                });
            });

            it('should get product list with comment ', function (done) {
                client.get('/prod/103072/prodWithComment', function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.length >0, "product with comment info get");
                        done();
                    }
                });
            });

            it('should get  prod favorite count ', function (done) {
                client.get('/prod/103072/favoriteCount', function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.favorite_count >=0, "product  favorite count get");
                        done();
                    }
                });
            });

            it('get biz special product', function(done) {

                client.get('/biz/103072/specialProduct', function(err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.length>0,"biz special product found");
                        done();
                    }
                });
            });

            it('get biz special product', function(done) {

                client.put('/biz/103072/specialProduct/102509',{"special" :"1"}, function(err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.length>0,"biz special product found");
                        done();
                    }
                });
            })

            it('should get  biz product order count  by day', function (done) {
                client.get('/bizId/103072/dayOrder/7', function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.length >=0, "product  order count statistics get");
                        done();
                    }
                });
            });

            it('should get  biz product order count  by week', function (done) {
                client.get('/bizId/103072/weekOrder/10', function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.length >=0, "product  order count statistics get");
                        done();
                    }
                });
            });

            it('should get  biz product order count  by month', function (done) {
                client.get('/bizId/103072/monthOrder/12', function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.length >=0, "product  order count statistics get");
                        done();
                    }
                });
            });

            it('should get  biz top ordered count product list', function (done) {
                client.get('/bizId/103072/topOrderProd/5', function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.length >=0, "top ordered product list  get");
                        done();
                    }
                });
            });*/
            it('should get  biz favorite product customer info ', function (done) {
                client.get('/biz/103072/allProdRel', function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.length >=0, "biz  favorite product customer should be get");
                        done();
                    }
                });
            });

            it('should get  product comment  info ', function (done) {
                client.get('/biz/103072/allProdComment', function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.length >=0, " product comment info should be get");
                        done();
                    }
                });
            });

        });
    });

};
        
    
