var assert = require("assert");
var custdao = require('./../lib/dao/custdao');
var coupondao = require('./../lib/dao/coupondao');

exports.test = function(client, request) {
	describe('service: coupon', function() {

		// Test #1
		describe('Test list coupon', function() {
			it('should get a list of coupon of a business', function(done) {
				client.get('/biz/100001/coupon', function(err, req, res, data) {
							if (err) {
								throw new Error(err);
							} else {
								assert(data.length > 0, "coupon list length>0");
								done();
							}
						});
			});

			it('should get a list of coupon of a business promotion', function(
					done) {
				client.get('/biz/100001/promo/100001/coupon', function(err,
								req, res, data) {
							if (err) {
								throw new Error(err);
							} else {
								assert(data.length > 0, "coupon list length>0");
								done();
							}
						});
			});

			it('should get a list of coupon from customer', function(done) {
				client.get('/cust/from/100001/coupon', function(err, req, res,
								data) {
							if (err) {
								throw new Error(err);
							} else {
								assert(data.length > 0, "coupon list length>0");
								done();
							}
						});
			});

			it('should get a  coupon from this customer', function(done) {
						client.get('/cust/from/100001/coupon/100001', function(
										err, req, res, data) {
									if (err) {
										throw new Error(err);
									} else {
										assert(data.coupon_id > 0,
												"coupon found");
										done();
									}
								});
					});

			it('should get a list of coupon to customer', function(done) {
				client.get('/cust/to/100002/coupon', function(err, req, res,
								data) {
							if (err) {
								throw new Error(err);
							} else {
								assert(data.length > 0, "coupon list length>0");
								done();
							}
						});
			});

			it('should get a coupon to this customer', function(done) {
						client.get('/cust/to/100002/coupon/100001', function(
										err, req, res, data) {
									if (err) {
										throw new Error(err);
									} else {
										assert(data.coupon_id > 0,
												"coupon found");
										done();
									}
								});
					});

			it('should get a biz coupon', function(done) {
						client.get('/biz/100001/coupon/100001', function(err,
										req, res, data) {
									if (err) {
										throw new Error(err);
									} else {
										assert(data.coupon_id > 0,
												"coupon id found");
										done();
									}
								});
					});

            it('should get a coupon count of customer', function(done) {
                client.get('/cust/100001/couponCount', function(err,
                                                                 req, res, data) {
                    if (err) {
                        throw new Error(err);
                    } else {
                        assert(data.count > 0,
                            "coupon count of customer  found");
                        done();
                    }
                });
            });
		});

		describe('Test create coupon', function() {
			var couponId, custId, bizId;
			it(
					'should create a coupon without image and without creating a new customer',
					function(done) {
						request
								.post('/cust/100001/biz/100001/promo/100001/coupon')
								.type('form').field('to_cust_id', 100002)
								.field('personal_msg', 'hi here').end(
										function(err, res) {
											couponId = res.body.coupon_id;
											assert(couponId > 0,
													'coupon created');
											// res.text.should.include('logged
											// in')
											done();
										});
					});

			it('-- get new created coupon', function(done) {
						client.get('/biz/100001/coupon/' + couponId, function(
										err, req, res, data) {
									if (err) {
										throw new Error(err);
									} else {
										assert('hi here' == data.personal_msg,
												"personal msg match");
										assert(100001 == data.from_cust_id,
												"from cust id match");
										assert(100001 == data.biz_id,
												"biz id match");
										assert(100001 == data.promo_id,
												"promo id match");
										assert(100002 == data.to_cust_id,
												"to cust id match");
										assert(
												'dli@yahoo.com' == data.to_email,
												"to email match");
										done();
									}

								});
					});

			it(
					'should create a coupon without image and creating a new customer',
					function(done) {
						request
								.post('/cust/100001/biz/100001/promo/100001/coupon')
								.type('form').field('to_email', 'abc').field(
										'to_first_name', 'abc1').field(
										'to_last_name', 'abc2').field(
										'personal_msg', 'hi here').end(
										function(err, res) {
											couponId = res.body.coupon_id;
											assert(couponId > 0,
													'coupon created');
											done();
										});
					});

			it('-- get new created coupon', function(done) {
				client.get('/biz/100001/coupon/' + couponId, function(err, req,
						res, data) {
					if (err) {
						throw new Error(err);
					} else {
						custId = data.to_cust_id;
						bizId = data.biz_id;
						assert(custId > 0, "to cust created");

						client.get('/cust/' + custId, function(err, req, res,
										data) {
									if (err) {
										throw new Error(err);
									} else {
										assert('abc' == data.email,
												"created cust email match");
										assert('abc1' == data.first_name,
												"created cust first name match");
										assert('abc2' == data.last_name,
												"created cust last name match");
									}
									done();

								});
					}

				});
			});

			it(
					'should create a coupon with image and without creating a new customer',
					function(done) {
						request
								.post('/cust/100001/biz/100001/promo/100001/coupon')
								.type('form').field('to_cust_id', 100002)
								.field('personal_msg', 'hi I upload images')
								.attach('image', __dirname + '/sort_both.png')
								.end(function(err, res) {
											couponId = res.body.coupon_id;
											assert(couponId > 0,
													'coupon created');
											done();
										});
					});

			it('-- get new created coupon', function(done) {
				client.get('/biz/100001/coupon/' + couponId, function(err, req,
								res, data) {
							if (err) {
								throw new Error(err);
							} else {
								assert(
										'hi I upload images' == data.personal_msg,
										"personal msge match");
								assert(100001 == data.from_cust_id,
										"from cust id match");
								assert(100001 == data.biz_id, "biz id match");
								assert(100001 == data.promo_id,
										"promo id match");
								assert(100002 == data.to_cust_id,
										"to cust id match");
								assert('dli@yahoo.com' == data.to_email,
										"to email match");
								assert(data.img_url != null, "image uploaded");
								done();
							}

						});
			});

			it('should redeem coupon of a business', function(done) {
				client.post('/biz/100001/coupon/' + couponId + '/redeem',
						function(err, req, res, data) {
							if (err) {
								throw new Error(err);
							} else {
								assert(data.succeed==true);
								client.get('/biz/100001/coupon/' + couponId,
										function(err, req, res, data) {
											if (err) {
												throw new Error(err);
											} else {
												assert(
														'Redeemed' == data.status,
														"coupon redeemed");
												done();
											}
										});
							}
						});
			});

		});

	})
}
