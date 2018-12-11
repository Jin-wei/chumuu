/**
 * Created by ling xue on 14-7-3.
 */

var db=require('./../db.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('ProdCommentDao.js');

function addProductComment(params,callback){
    var query = "insert into product_comment (prod_id,cust_id,comment,rating) values(?,?,?,?)";
    var paramArr = [], i = 0;
    paramArr[i++] = params.productId;
    paramArr[i++] = params.custId;
    paramArr[i++] = params.comment;
    paramArr[i] = params.rating;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addProductComment ')
        return callback(error,rows);
    });
}


function queryCommentByProd(params,callback){
    var query = "select c.username,c.first_name,c.last_name,c.gender,c.state cstate,c.city,c.avatar,pc.* " +
        "from product_comment pc left join customer c on pc.cust_id = c.customer_id " +
        "where pc.prod_id =? and pc.state = 1 order by pc.createTime desc; ";
    var paramArr = [], i = 0;
    paramArr[i] = params.productId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' queryCommentByProd ')
        return callback(error,rows);
    })
}

function queryCommentByCust(params,callback){
    var query = "select p.*,pc.comment,pc.rating " +
        "from product_comment pc left join product p on pc.prod_id = p.prod_id " +
        "where pc.cust_id =? and pc.state =1 order by pc.createTime desc";
    var paramArr = [], i = 0;
    paramArr[i] = params.custId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' queryCommentByCust ')
        return callback(error,rows);
    })
}

function queryProductRating(params,callback){


    var query = "select count(*) total_count,AVG(rating) avg_rating " +
        "from product_comment where prod_id =? ";
    var paramArr = [], i = 0;
    paramArr[i] = params.productId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' queryProductRating ')
        return callback(error,rows);
    })
}

function updateCommentState(params,callback){


    var query = "update product_comment set state = ? where id = ?;";
    var paramArr = [], i = 0;
    paramArr[i++] = params.state;
    paramArr[i] = params.id;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateCommentState ')
        return callback(error,rows);
    })
}

function updateProductComment(params,callback){
    var query = "update product_comment set comment=?, rating= ? where id = ? and cust_id=?;";
    var paramArr = [], i = 0;
    paramArr[i++] = params.comment;
    paramArr[i++] = params.rating;
    paramArr[i++] = params.id;
    paramArr[i] = params.custId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateProductComment ')
        return callback(error,rows);
    })
}

function deleteProductComment(params,callback){
    var query = "delete from product_comment where id = ? and cust_id=?;";
    var paramArr = [], i = 0;
    paramArr[i++] = params.id;
    paramArr[i] = params.custId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' deleteProductComment ')
        return callback(error,rows);
    })
}

function queryBizProdComment(params,callback){
    var query = "select pc.* ,c.username,c.last_name,c.first_name,c.email,c.phone_no,c.last_login_date,c.avatar, " +
        " c.city,c.state,c.gender,p.name,p.img_url,p.name_lang " +
        " from product_comment pc left join customer c on pc.cust_id=c.customer_id " +
        " left join product p on pc.prod_id = p.prod_id where pc.prod_id in( " +
        " select p.prod_id from product p left join business b on p.biz_id=b.biz_id where b.biz_id = ?) ";
    var paramArr = [], i = 0;
    paramArr[i] = params.bizId;

    if(params.start != null && params.size != null){
        paramArr[i++]= Number(params.start);
        paramArr[i]= Number(params.size);
        query = query + " limit ?, ? ";
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' queryBizProdComment ')
        return callback(error,rows);
    })
}


module.exports = {
    addProductComment : addProductComment ,
    queryCommentByProd : queryCommentByProd,
    queryCommentByCust : queryCommentByCust,
    queryProductRating : queryProductRating,
    updateCommentState : updateCommentState,
    updateProductComment : updateProductComment,
    deleteProductComment : deleteProductComment,
    queryBizProdComment : queryBizProdComment
}