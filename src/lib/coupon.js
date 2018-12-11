var fs = require('fs');
var Seq = require('seq');
var coupondao = require('./dao/coupondao.js');
var custdao = require('./dao/custdao.js');
var bizcustactdao = require('./dao/bizcustactdao.js');
var bizcustreldao = require('./dao/bizcustreldao.js');
var imagedao = require('./resource/imagedao.js');
var oAuthUtil = require('./util/OAuthUtil.js');
var sysMsg = require('./util/SystemMsg.js');
var sysError = require('./util/SystemError.js');
var serverLogger = require('./util/ServerLogger.js');
var logger = serverLogger.createLogger('Coupon.js');
// biz
function listBizCoupon(req, res, next) {
	coupondao.search({
				biz_id : req.params.bizId
			}, function(error, rows) {
				if (error) {
                    logger.error(' listBizCoupon ' + error.message);
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
				} else {
                    logger.info(' listBizCoupon ' + 'success');
					res.send(200, rows);
					next();
				}
			});
}
// biz
function listBizPromoCoupon(req, res, next) {
	coupondao.search({
				biz_id : req.params.bizId,
				promo_id : req.params.promoId
			}, function(error, rows) {
				if (error) {
                    logger.error(' listBizPromoCoupon ' + error.message);
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
				} else {
                    logger.error(' listBizPromoCoupon ' + 'success');
					res.send(200, rows);
					next();
				}
			});
}

// biz
function getBizCoupon(req, res, next) {
	coupondao.search({
		        biz_id : req.params.bizId,
				coupon_id : req.params.id
			}, function(error, rows) {
				if (error) {
                    logger.error(' getBizCoupon ' + error.message);
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
				} else {
                    logger.error(' getBizCoupon ' + 'success');
					res.send(200, rows[0]);
					next();
				}
			});
}

// cust
function addCoupon(req, res, next) {
    var params=req.params;

	// console.dir(req);
	var firstName = req.params.to_first_name;
	var lastName = req.params.to_last_name;
	var coupon = {};
    var customerIdArray  = [];
    var couponImgArray = [];

	// todo get from_cust_id from authentication token then compare

    //Send coupon to multi user


            coupon.from_cust_id = req.params.custId;

            coupon.to_cust_id = req.params.to_cust_id;
            coupon.to_email = req.params.to_email;
            coupon.biz_id = req.params.bizId;
            coupon.promo_id = req.params.promoId;
            coupon.personal_msg = req.params.personal_msg;
            coupon.status='Pending';
            var emailArray = req.params.to_email.split(',');
            Seq().seq(function() {
                var that = this;
                bizcustreldao.addBizCustRelIfNot({
                    biz_id : coupon.biz_id,
                    cust_id : coupon.from_cust_id
                }, function(error, data) {
                    if (error) {
                        logger.error(' addCoupon ' + sysMsg.SYS_AUTH_TOKEN_ERROR);
                        throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                    } else {
                        that();
                    }
                });

            }).seq(function() {
                    //console.log('coupon 1======');
                    var that = this;
                    // check to user exist or not if not create new customer record
                    if (coupon.to_cust_id && !coupon.to_email) {
                        // find to_email
                        custdao.search({
                            customer_id : coupon.to_cust_id
                        }, function(error, rows) {
                            if (!rows || rows.length <= 0) {
                                logger.warn(' addCoupon ' + sysMsg.COUPON_SEND_INVALID_USER);
                                return next(sysError.InvalidArgumentError("",sysMsg.COUPON_SEND_INVALID_USER));
                            } else {
                                coupon.to_email = rows[0].email;
                                that();
                            }
                        })
                    } else if (!coupon.to_cust_id && coupon.to_email) {

                        if(emailArray != undefined && emailArray.length>0){
                            for(var i= 0,j=emailArray.length ; i<j ; i++){
                                custdao.saveCustomerForCoupon(emailArray[i],function(error , data){
                                    customerIdArray.push(data);
                                });
                            }
                            that();
                        }

                    } else {
                        that();
                    }
                }).seq(function() {
                    var that = this;
                    // upload image
                    //console.log('coupon 2======');
                    // console.dir(req.params);
                    if (req.files.image) {
                        // console.log(req.params.image);
                        // console.dir(req.files.image);
                        // fs.readFile(req.files.image.path+'/photo (2).JPG',
                        // function(err, data) {
                        //console.log('save image======');
                        for(var i =0 ; i<coupon.length; i++){
                            imagedao.save(null,req.files.image,{coupon_id:customerIdArray[i], cust_id:coupon.from_cust_id,biz_id:coupon.biz_id, promo_id:coupon.promo_id}, function(error, path) {
                                if (error) {
                                    logger.error(' addCoupon ' + error.message);
                                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                                }
                                //coupon.img_url = path;
                                couponImgArray[i].path;

                            });
                        }
                        that();
                    } else {
                        that();
                    }
                }).seq(function() {
                    var that = this;
                    // add biz cust relationship
                    //console.log('coupon 3======');
                    //console.dir(coupon);
                    for(var i = 0; i< customerIdArray.length ; i++){
                        bizcustreldao.addBizCustRelIfNot({
                            biz_id : coupon.biz_id,
                            cust_id : customerIdArray[i]
                        }, function(error, data) {
                            if (error) {
                                logger.error(' addCoupon ' + error.message);
                                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                            }
                        });
                    }
                    that();

                }).seq(function(){
                    var that=this;
                    var act={biz_id: coupon.biz_id,cust_id: coupon.from_cust_id,point_id:'1003'};
                    bizcustactdao.addAct(act,function(error, act_id){
                        if (error){
                            logger.error(' addCoupon ' + error.message);
                            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                        }else{
                            that();
                        }
                    })
                }).seq(function() {
                    // create coupon record
                    //console.log('coupon 4======');
                    for(var i=0; i<customerIdArray.length ; i++){
                        coupon.to_email = emailArray[i];
                        coupon.to_cust_id = customerIdArray[i];
                        coupon.img_url = couponImgArray[i];
                        coupondao.createCouponBySeq(coupon,emailArray[i],customerIdArray[i],couponImgArray[i], function(error, couponId) {
                            if (error) {
                                logger.error(' addCoupon ' + error.message);
                                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                            }

                        });
                    }
                    logger.info(' addCoupon ' + 'success');
                    res.send(200,{succeed:true});
                    next();
                });
	// async???
	// send passbook
   // send email
}

// biz
function redeemBizCoupon(req, res, next){
	//todo check coupon expired or not
	var biz_id=req.params.bizId;
	var coupon_id=req.params.couponId;
	coupondao.search({biz_id:biz_id, coupon_id:coupon_id},function(error, rows){
		if (!rows || rows.length<=0){
			res.send(200,null);
		}else{
			var coupon=rows[0];
			var from_cust_id=coupon.from_cust_id;
			var to_cust_id=coupon.to_cust_id;
			Seq().seq(function(){
				var that=this;
				bizcustreldao.addBizCustRelIfNot({biz_id:biz_id,cust_id:from_cust_id},function(error,data){
					if (error){
                        logger.error(' redeemBizCoupon ' + error.message);
                        throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
					}else{
						that();
					}
				});
			}).seq(function(){
				var that=this;
				bizcustreldao.addBizCustRelIfNot({biz_id:biz_id,cust_id:to_cust_id},function(error,data){
					if (error){
                        logger.error(' redeemBizCoupon ' + error.message);
                        throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
					}else{
						that();
					}
				});
			
			}).seq(function(){
				var that=this;
				bizcustactdao.addAct({biz_id:biz_id,cust_id:from_cust_id,point_id:'1002'},function(error,data){
					if (error){
                        logger.error(' redeemBizCoupon ' + error.message);
                        throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
					}else{
						that();
					}
				});
			}).seq(function(){
				coupondao.updateStatus({coupon_id:coupon_id,status:'Redeemed'},function(error,data){
					if (error){
                        logger.error(' redeemBizCoupon ' + error.message);
                        throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
					}else{
                        logger.info(' redeemBizCoupon ' + 'success');
						res.send(200,{succeed:true});
					}
				})
				});
		}
	});
	
	
}

  //cust
function listFromCustCoupon(req, res, next) {


	coupondao.search({
		        from_cust_id : req.params.custId,
		        biz_id : req.params.bizId
			}, function(error, rows) {
				if (error) {
                    logger.error(' listFromCustCoupon ' + error.message);
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
				} else {
                    logger.info(' listFromCustCoupon ' + 'success');
					res.send(200, rows);
					next();
				}
			});
}
 //cust
function getFromCustCoupon(req, res, next) {
    var params=req.params;


	coupondao.search({
		        from_cust_id : req.params.custId,
				coupon_id : req.params.couponId
			}, function(error, rows) {
				if (error){
                    logger.error(' getFromCustCoupon ' + error.message);
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
				} else {
                    logger.info(' getFromCustCoupon ' + 'success');
					if (rows && rows.length>0){
						res.send(200, rows[0]);
					}else{
						res.send(200,null);
					}
					next();
				}
			});
}
 //cust
function listToCustCoupon(req, res, next) {

	coupondao.search({
		        to_cust_id : req.params.custId,
		        biz_id : req.params.bizId
			}, function(error, rows) {
				if (error) {
                    logger.error(' listToCustCoupon ' + error.message);
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
				} else {
                    logger.info(' listToCustCoupon ' + 'success');
					res.send(200, rows);
					next();
				}
			});
}
//cust
function getToCustCoupon(req, res, next) {

	coupondao.search({
		        to_cust_id : req.params.custId,
		        coupon_id : req.params.couponId
			}, function(error, rows) {
				if (error) {
                    logger.error(' getToCustCoupon ' + error.message);
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
				} else {
                    logger.info(' getToCustCoupon ' + 'success');
					if (rows && rows.length>0){
						res.send(200, rows[0]);
					}else{
						res.send(200,null);
					}
					next();
				}
			});
}

function getCouponCount(req, res, next) {

    coupondao.getCouponCount(req.params , function(error,rows){
        if (error) {
            logger.error(' getCouponCount ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else {
            logger.info(' getCouponCount ' + 'success');
            if (rows && rows.length>0){
                res.send(200, rows[0]);
            }else{
                res.send(200,null);
            }
            next();
        }
    });
}

// /--- Exports

module.exports = {
	listBizCoupon : listBizCoupon,
	listBizPromoCoupon : listBizPromoCoupon,
	getBizCoupon : getBizCoupon,
	addCoupon : addCoupon,
	redeemBizCoupon:redeemBizCoupon,
	listFromCustCoupon:listFromCustCoupon,
	getFromCustCoupon:getFromCustCoupon,
	listToCustCoupon:listToCustCoupon,
	getToCustCoupon:getToCustCoupon,
    getCouponCount : getCouponCount
};