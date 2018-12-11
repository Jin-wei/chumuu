var db=require('./../db.js');
var Seq = require('seq');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('CouponDao.js');


function search(sc,callback){
	//coupon has expired date?
	var query= "SELECT coupon.coupon_id, coupon.promo_id, promo.discount_pct, promo.name promo_name,prod.name prod_name, " +
        "coupon.biz_id,biz.name biz_name,coupon.from_cust_id, from_c.first_name from_first_name, from_c.last_name from_last_name," +
        "coupon.to_email,coupon.to_cust_id, to_c.first_name to_first_name,to_c.last_name to_last_name, coupon.status, coupon.personal_msg," +
        "coupon.created_on,coupon.img_url  FROM coupon " +
        "left join promotion promo on coupon.promo_id = promo.promotion_id " +
        "left join product prod on promo.prod_id=prod.prod_id ,business biz,customer from_c, customer to_c " +
        "where coupon.biz_id=biz.biz_id and coupon.from_cust_id=from_c.customer_id and coupon.to_cust_id=to_c.customer_id ";

	var params=[],i=0;
	if(sc && sc.biz_id){
		query+=" and coupon.biz_id=?";
		params[i++]=sc.biz_id;
	}
	if(sc && sc.from_cust_id){
		query+= " and coupon.from_cust_Id=?";
		params[i++]=sc.from_cust_id;
	}
	if(sc && sc.to_cust_id){
		query+= " and coupon.to_cust_Id=?";
		params[i++]=sc.to_cust_id;
	}
	if(sc && sc.promo_id){
		query+= " and coupon.promo_Id=?";
		params[i++]=sc.promo_id;
	}
	if(sc && sc.coupon_id){
		query+= " and coupon.coupon_Id=?";
		params[i++]=sc.coupon_id;
	}

    db.dbQuery(query,params,function(error,rows){
        logger.debug(' search ')
        return callback(error,rows);
    })
}


function create(coupon, callback){
	//console.log('coupon======');
	//console.dir(coupon);
	var query="insert into coupon (biz_id,promo_id,from_cust_id, to_cust_id, to_email,personal_msg, expiration_date,img_url,status) values(?,?,?,?,?,?,?,?,?)";

    db.dbQuery(query,[coupon.biz_id,coupon.promo_id,coupon.from_cust_id,coupon.to_cust_id,coupon.to_email,coupon.personal_msg,coupon.expiration_date,coupon.img_url,coupon.status],function(error,rows){
        logger.debug(' create ')
        return callback(error,rows);
    })
}

function createCouponBySeq(coupon ,email ,to_cust_id,img_url , callback){
    /*Seq().seq(function(){
        create(coupon, function(error,data){
            if (error) {
                throw error;
            } else {
                callback(null, data);
            }
        });
    });*/

    var query ;
    Seq().seq(function(){
        var that = this;
        query = "insert into coupon (biz_id,promo_id,from_cust_id, to_cust_id, to_email,personal_msg, expiration_date,img_url,status) values(?,?,?,?,?,?,?,?,?)";
        that();
    }).seq(function(){
            if(coupon != undefined){

                db.dbQuery(query,[coupon.biz_id,coupon.promo_id,coupon.from_cust_id,to_cust_id,email,coupon.personal_msg,coupon.expiration_date,img_url,coupon.status],function(error,rows){
                    logger.debug(' createCouponBySeq ')
                    return callback(error,rows);
                })
            }

        });
}



function updateStatus(coupon, callback){
	//todo add status date
	var query="update coupon set status=? where coupon_id=?";
	//console.log('===============');
	//console.dir(coupon);

    db.dbQuery(query,[coupon.status,coupon.coupon_id],function(error,rows){
        logger.debug(' createCouponBySeq ')
        return callback(error,rows);
    })
}

function del(coupon,callback){
	var query='delete from coupon where coupon_id=?';

    db.dbQuery(query,[coupon.coupon_id],function(error,rows){
        logger.debug(' del ')
        return callback(error,rows);
    })
}

function getCouponCount(params ,callback){
    var query = "select count(*) as count from coupon where from_cust_id = ?";
    var paramArr=[],i=0;
    paramArr[i++] =params.custId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' del ')
        return callback(error,rows);
    })
}

///--- Exports

module.exports = {
    search: search,
    create: create,
    del:del,
    updateStatus:updateStatus,
    getCouponCount : getCouponCount,
    createCouponBySeq : createCouponBySeq
};