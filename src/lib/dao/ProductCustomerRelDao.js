/**
 * Created by ling xue on 14-6-24.
 */

var db=require('./../db.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('ProductCustomerRelDao.js');
function addProdCustRel(params,callback){
    var query = "insert into product_customer_rel (product_id,customer_id) values(?,?)";
    var paramArr = [], i = 0;
    paramArr[i++]=params.productId;
    paramArr[i] = params.custId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addProdCustRel ')
        return callback(error,rows);
    });
}

function deleteProdCustRel(params,callback){
    var query = "delete from product_customer_rel where product_id= ? and customer_id = ?";
    var paramArr = [], i = 0;
    paramArr[i++]=params.productId;
    paramArr[i] = params.custId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' deleteProdCustRel ')
        return callback(error,rows);
    });
}

function queryRelByCustomer(params,callback){
    var query = "select p.* ,b.name biz_name ,b.name_lang biz_name_lang,b.biz_unique_name,b.order_status from product p " +
        "left join product_customer_rel pcr on p.prod_id = pcr.product_id " +
        "left join business b on b.biz_id = p.biz_id " +
        " where pcr.customer_id=? ";
    var paramArr = [], i = 0;
    paramArr[i++] = params.custId;
    if(params.productId != null){
        query = query + " and pcr.product_id =? ";
        paramArr[i] = params.productId;
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' queryRelByCustomer ')
        return callback(error,rows);
    });
}

function queryRelByProduct(params,callback){
    var query = "select count(1)  from product p left join product_customer_rel pcr on p.prod_id = pcr.product_id" +
        " where p.prod_id=? ";
    var paramArr = [], i = 0;
    paramArr[i] = params.productId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' queryRelByProduct ')
        return callback(error,rows);
    });
}

function queryBizAllProdRel(params,callback){
    var query = "select pcr.*,c.username,c.avatar,c.last_name,c.first_name,c.email,c.phone_no,c.last_login_date,c.city,c.state,c.gender   " +
        " from  product_customer_rel pcr left join customer c on pcr.customer_id=c.customer_id where pcr.product_id in( " +
        " select p.prod_id from product p left join business b on p.biz_id=b.biz_id where b.biz_id = ?) " +
        " order by pcr.product_id  ";
    var paramArr = [], i = 0;
    paramArr[i] = params.bizId;
    if(params.start != null && params.size != null){
        paramArr[i++]= Number(params.start);
        paramArr[i]= Number(params.size);
        query = query + " limit ?, ? ";
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' queryBizAllProdRel ')
        return callback(error,rows);
    });
}

module.exports = {
    addProdCustRel : addProdCustRel ,
    deleteProdCustRel : deleteProdCustRel,
    queryRelByCustomer : queryRelByCustomer,
    queryRelByProduct : queryRelByProduct,
    queryBizAllProdRel : queryBizAllProdRel
}