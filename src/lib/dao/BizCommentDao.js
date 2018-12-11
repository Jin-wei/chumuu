/**
 * Created by ling xue on 14-7-4.
 */

var db=require('./../db.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('BizCommentDao.js');

function addBizComment(params,callback){
    var query = "insert into biz_comment (biz_id,cust_id,comment,price_level,service_level,food_quality) values(?,?,?,?,?,?)";
    var paramArr = [], i = 0;
    paramArr[i++] = params.bizId;
    paramArr[i++] = params.custId;
    paramArr[i++] = params.comment;
    paramArr[i++] = params.priceLevel;
    paramArr[i++] = params.serviceLevel;
    paramArr[i] = params.foodQuality;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addBizComment ')
        return callback(error,rows);
    })
}


function queryCommentByBiz(params,callback){
    var query = "select c.username,c.first_name,c.last_name,c.gender,c.state cstate,c.city,c.avatar,bc.*  " +
        "from biz_comment bc left join customer c on bc.cust_id = c.customer_id  " +
        "where bc.biz_id =? and bc.state = 1 order by bc.createTime desc; ";
    var paramArr = [], i = 0;
    paramArr[i] = params.bizId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' queryCommentByBiz ')
        return callback(error,rows);
    })
}

function queryCommentByCust(params,callback){
    var query = "select b.*,bc.comment,bc.price_level,bc.service_level,bc.food_quality  " +
        "from biz_comment bc left join business b on bc.biz_id = b.biz_id  " +
        "where bc.cust_id =? and bc.state =1 order by bc.createTime desc";
    var paramArr = [], i = 0;
    paramArr[i] = params.custId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' queryCommentByCust ')
        return callback(error,rows);
    })
}

function queryBizRating(params,callback){


    var query = "select count(*) total_count,AVG(price_level) avg_price ," +
        "AVG(service_level) avg_service,AVG(food_quality) avg_food " +
        "from biz_comment where biz_id = ? ";
    var paramArr = [], i = 0;
    paramArr[i] = params.bizId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' queryBizRating ')
        return callback(error,rows);
    })
}

function updateCommentState(params,callback){


    var query = "update biz_comment set state = ? where id = ?;";
    var paramArr = [], i = 0;
    paramArr[i++] = params.state;
    paramArr[i] = params.id;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateCommentState ')
        return callback(error,rows);
    })
}

function updateBizComment(params,callback){
    var query = "update biz_comment set comment=?, price_level= ?, " +
        "service_level= ?, food_quality= ?  where id = ? and cust_id=?;";
    var paramArr = [], i = 0;
    paramArr[i++] = params.comment;
    paramArr[i++] = params.priceLevel;
    paramArr[i++] = params.serviceLevel;
    paramArr[i++] = params.foodQuality;
    paramArr[i++] = params.id;
    paramArr[i] = params.custId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateBizComment ')
        return callback(error,rows);
    })
}

function deleteBizComment(params,callback){
    var query = "delete from biz_comment where id = ? and cust_id=?;";
    var paramArr = [], i = 0;
    paramArr[i++] = params.id;
    paramArr[i] = params.custId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' deleteBizComment ')
        return callback(error,rows);
    })
}


module.exports = {
    addBizComment : addBizComment ,
    queryCommentByBiz : queryCommentByBiz,
    queryCommentByCust : queryCommentByCust,
    queryBizRating : queryBizRating,
    updateCommentState : updateCommentState,
    updateBizComment : updateBizComment,
    deleteBizComment : deleteBizComment
}
