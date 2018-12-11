var assert = require("assert");


exports.test = function (client) {
    describe('service: promo', function () {

        // Test #1
        describe('Test list biz promo', function () {
            it('should get a list of business promotion', function (done) {
                client.get('/biz/100001/promo', function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.length > 0, "biz promo list length>0");
                        done();
                    }
                });
            });

            it('should get a list of promotion for a product', function (done) {
                client.get('/biz/100001/prod/100001/promo', function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.length > 0, "biz prod promo list length>0");
                        done();
                    }
                });
            });

            it('should get a promo by id', function (done) {
                client.get('/biz/100001/promo/100001', function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.promotion_id == 100001, "promo id found");
                        done();
                    }
                });
            });
        });
        describe('Test crud promo', function () {

            var promoId;
            it('should create a promotion', function (done) {
                client.post('/biz/100001/promo', {name: 'aa', description: 'bb', discount_pct: 10, discount_amount: 5, prod_id: 100001, start_date: '2014-01-01', end_date: '2015-03-31'}, function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.promotion_id > 0, "promotion is created");
                        promoId = data.promotion_id;
                        done();
                    }
                });
            });

            it('-- get new created promotion', function (done) {
                client.get('/biz/100001/promo/' + promoId, function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert('aa' == data.name, "name match");
                        assert('bb' == data.description, "description match");
                        assert(10 == data.discount_pct, "discount type match");
                        assert(100001 == data.prod_id, "product id match");
                        assert('2014-01-01' == data.start_date, "start date match");
                        assert('2015-03-31' == data.end_date, "end date match");
                        done();
                    }


                });
            });

            it('-- update promotion', function (done) {
                client.put('/biz/100001/promo/' + promoId, {name: "aa1", description: "bb1", discount_pct: 25, discount_amount: 3, prod_id: 100002, start_date: '2014-01-02', end_date: '2015-01-01'}, function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.succeed == true, "prod should be updated ");
                        done();
                    }
                });
            });

            it('-- verify updated promotion', function (done) {
                client.get('/biz/100001/promo/' + promoId, function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert('aa1' == data.name, "name match");
                        assert('bb1' == data.description, "description match");
                        assert(25 == data.discount_pct, "discount pct match");
                        assert(100002 == data.prod_id, "product id match");
                        assert('2014-01-02' == data.start_date, "start date match");
                        assert('2015-01-01' == data.end_date, "end date match");
                        done();
                    }

                });
            });

            it('-- verify delete promotion', function (done) {
                client.del('/biz/100001/promo/' + promoId, function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.succeed == true, "promotion should be deleted ");
                        done();
                    }

                });
            });

            it('-- get biz promotion now', function (done) {
                client.del('/biz/103072/promoNow', function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.length >0, "the promotion should be get ");
                        done();
                    }

                });
            });

            it('-- get all biz level promotion ', function (done) {
                client.del('/cust/do/bizPromo', function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.length >0, "the all biz promotion should be get ");
                        done();
                    }

                });
            });

            it('-- get all product level promotion now', function (done) {
                client.del('/cust/do/prodPromo', function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.length >0, "the all product promotion should be get ");
                        done();
                    }

                });
            });
        });
    })
};
        
    
