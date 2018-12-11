/**
 * Created by Ling Xue on 14-3-19.
 */

var db = require('./../db.js');
var moment = require('moment');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('PromDao.js');

function listBizPromo(params, callback) {
    var query = "SELECT * FROM promotion where biz_id=? ";

    //Set mysql query parameters array
    var paramArr = [], i = 0;
    paramArr[i++] = params.bizId;
    if(params.active == null || params.active == 0){
        query = query + " and (end_Date is null or end_Date>=curdate());";
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' listBizPromo ')
        return callback(error,rows);
    });
}

function listBizProdPromo(params, callback) {
    var query = 'SELECT * FROM promotion where biz_id=? and prod_id=? ';

    //Set mysql query parameters array
    var paramArr = [], i = 0;
    paramArr[i++] = params.bizId;
    paramArr[i++] = params.prodId;
    if(params.active == null || params.active == 0){
        query = query + " and (end_Date is null or end_Date>=curdate());";
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' listBizProdPromo ')
        return callback(error,rows);
    });
}


function getBizPromo(params, callback) {
    var query = 'SELECT * FROM promotion where biz_id=? and promotion_id=? ';

    //Set mysql query parameters array
    var paramArr = [], i = 0;
    paramArr[i++] = params.bizId;
    paramArr[i++] = params.id;
    if(params.active == null || params.active == 0){
        query = query + " and (end_Date is null or end_Date>=curdate())";
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getBizPromo ')
        return callback(error,rows);
    });
}

function addBizPromo(params, callback) {
    var query = 'insert into promotion (biz_id,prod_id,name,description,discount_pct,discount_amount,discount_level,start_date,end_date,week_sched) values(?,?,?,?,?,?,?,?,?,?);'

    //Set mysql query parameters array
    var paramArr = [], i = 0;
    paramArr[i++] = params.bizId;
    paramArr[i++] = params.prod_id;
    paramArr[i++] = params.name;
    paramArr[i++] = params.description;
    paramArr[i++] = params.discount_pct;
    paramArr[i++] = params.discount_amount;
    paramArr[i++] = params.discount_level;
    paramArr[i++] = params.start_date || null;
    paramArr[i++] = params.end_date || null;
    paramArr[i] = params.week_sched;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addBizPromo ')
        return callback(error,rows);
    });
}


function updateBizPromo(params, callback) {
    var query = 'update promotion set prod_id=?,name=?, description=?, discount_pct=?, discount_amount=?, discount_level=?, start_date=?,end_date=?,week_sched=?' +
        ' where biz_id=? and promotion_id=? ;'

    //Set mysql query parameters array
    var paramArr = [], i = 0;
    paramArr[i++] = params.prod_id;
    paramArr[i++] = params.name;
    paramArr[i++] = params.description;
    paramArr[i++] = params.discount_pct;
    paramArr[i++] = params.discount_amount;
    paramArr[i++] = params.discount_level;
    paramArr[i++] = params.start_date;
    paramArr[i++] = params.end_date;
    paramArr[i++] = params.week_sched;
    paramArr[i++] = params.bizId;
    paramArr[i++] = params.id;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateBizPromo ')
        return callback(error,rows);
    });
}

function deleteBizPromo(params, callback) {
    var query = 'delete FROM promotion where biz_id=? and promotion_id=?;';

    //Set mysql query parameters array
    var paramArr = [], i = 0;
    paramArr[i++] = params.bizId;
    paramArr[i++] = params.id;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' deleteBizPromo ')
        return callback(error,rows);
    });
}
function getBizPromoNow(params,callback){

    var query ="select * from promotion where week_sched>> ? & 1 >0 and (end_date>CURRENT_DATE or end_date is null) and active =1 and biz_id =?"
    var paramArr = [], i = 0;
    paramArr[i++] = params.weekday
    paramArr[i] = params.bizId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getBizPromoNow ')
        return callback(error,rows);
    });

}

function getAllBizPromo4Cust(params,callback){
    var query ="select p.*,b.name biz_name ,b.address,b.city,b.state,b.zipcode,b.latitude,b.longitude,b.img_url biz_img_url,b.phone_no,b.biz_unique_name,b.yelp_id ,b.order_status " +
        " from promotion p left join business b on p.biz_id = b.biz_id " +
        " where p.prod_id is null and p.active =1 and p.end_date >=CURRENT_TIMESTAMP and p.week_sched >> ? & 1 >0 " +
        " order by p.updated_on desc "
    var paramArr = [], i = 0;
    paramArr[i++] = params.weekday;
    if(params.start != null && params.size != null){
        query = query + "  limit ?,? ";
        paramArr[i++] = params.start;
        paramArr[i] = params.size;

    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getAllBizPromo4Cust ')
        return callback(error,rows);
    });
}

function getAllProdPromo4Cust(params,callback){
    var query ="select p.*,pr.prod_id,pr.name prod_name,pr.biz_id,pr.name_lang  prod_name_lang ,pr.img_url prod_img_url, " +
        " pr.price,b.name biz_name,b.latitude,b.longitude,b.address,b.phone_no,b.biz_unique_name ,b.order_status" +
        " from promotion p left join product pr on p.prod_id = pr.prod_id  left join business b on p.biz_id = b.biz_id " +
        " where p.prod_id is not null and p.active =1 and pr.active = 1 and p.end_date >=CURRENT_TIMESTAMP and p.week_sched>>? & 1 >0 " +
        " order by p.updated_on desc  "
    var paramArr = [], i = 0;
    paramArr[i++] = params.weekday;
    if(params.start != null && params.size != null){
        query = query + " limit ?,? ";
        paramArr[i++] = params.start;
        paramArr[i] = params.size;

    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getAllProdPromo4Cust ')
        return callback(error,rows);
    });
}


function getPromo4Order(params,callback){
    var query ="select * from promotion " +
        "where week_sched >> ? & 1 >0 and (end_date>? or end_date is null) and active =1 and biz_id =? order by prod_id desc"
    var paramArr = [], i = 0;
    paramArr[i++] = params.weekday;
    paramArr[i++] = params.orderStart;
    paramArr[i] = params.bizId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getPromo4Order ')
        return callback(error,rows);
    });
}

function getBizLevelPromo(params,callback){
    var query ="select * from promotion " +
        "where week_sched >> ? & 1 >0 and (end_date>? or end_date is null) and prod_id is null and active =1 and biz_id =? order by prod_id desc"
    var paramArr = [], i = 0;
    paramArr[i++] = params.weekday;
    paramArr[i++] = params.orderStart;
    paramArr[i] = params.bizId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getBizLevelPromo ')
        return callback(error,rows);
    });
}


module.exports = {
    listBizPromo: listBizPromo,
    listBizProdPromo: listBizProdPromo,
    getBizPromo: getBizPromo,
    addBizPromo: addBizPromo,
    updateBizPromo: updateBizPromo,
    deleteBizPromo: deleteBizPromo,
    getBizPromoNow :getBizPromoNow,
    getAllBizPromo4Cust :  getAllBizPromo4Cust,
    getAllProdPromo4Cust : getAllProdPromo4Cust,
    getPromo4Order : getPromo4Order ,
    getBizLevelPromo : getBizLevelPromo
};