/**
 * Created by ling xue on 14-6-12.
 */

var db=require('./../db.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('BizStateDao.js');

/**
 * The method to query the detail top x customer of earned point
 * @param params
 * @param callback
 */
function getBizTopPointCust(params ,callback){
    var query = "select bcr.cust_id,bcr.total_points_earned,bcr.total_points_redempted ,c.username,c.first_name,c.last_name ,c.avatar " +
        "from biz_customer_rel bcr left join customer c on bcr.cust_id=c.customer_id " +
        "where biz_id = ? order by bcr.total_points_earned desc limit 0, ? ";
    var paramArr = [], i = 0;
    paramArr[i++] = Number(params.bizId);
    paramArr[i]= Number(params.size);

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getBizTopPointCust ')
        return callback(error,rows);
    })
}

/**
 * The method to query product detail of top x click
 * @param params
 * @param callback
 */
function getBizTopClickProd(params ,callback){
    var query = "select sum(smc.count) total_count,p.prod_id,p.name " +
        "from product p left join stat_menu_click smc on p.prod_id=smc.product_id " +
        "where p.biz_id =? group by p.prod_id,p.name order by total_count desc limit 0, ? ";
    var paramArr = [], i = 0;
    paramArr[i++]=Number(params.bizId);
    paramArr[i]=Number(params.size);

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getBizTopClickProd ')
        return callback(error,rows);
    })
}

/**
 * The method to get the count of biz all product count
 * @param params
 * @param callback
 */
function getBizTotalClickCount(params ,callback){
    var query = "select sum(smc.count) total_count from stat_menu_click smc where smc.biz_id =? ";
    var paramArr = [], i = 0;
    paramArr[i]=params.bizId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getBizTotalClickCount ')
        return callback(error,rows);
    })
}

/**
 * The method to get the count of check in customer
 * @param params
 * @param callback
 */
function getBizTotalCustCount(params ,callback){
    var query = "select count(*) total_count from biz_customer_rel where biz_id= ?  ";
    var paramArr = [], i = 0;
    paramArr[i]=params.bizId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getBizTotalCustCount ')
        return callback(error,rows);
    })
}
/**
 * The method get biz yesterday menu click count
 * @param params
 * @param callback
 */
function getBizLastClickCount(params ,callback){
    var query = "select sum(smc.count) total_count from stat_menu_click smc left join date_dimension dd on smc.date_id=dd.id " +
        "where  smc.biz_id= ? and dd.id=(select max(id) from date_dimension) ";
    var paramArr = [], i = 0;
    paramArr[i]=params.bizId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getBizLastClickCount ')
        return callback(error,rows);
    })
}

/**
 * The method to get biz yesterday check in new customer count
 * @param params
 * @param callback
 */
function getBizLastCheckIn(params ,callback){
    var query = "select sum(scc.count) total_count " +
        "from stat_cust_checkin scc left join date_dimension dd on scc.date_id=dd.id " +
        "where scc.biz_id= ? and  dd.id=(select max(id) from date_dimension) ";
    var paramArr = [], i = 0;
    paramArr[i]=params.bizId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getBizLastCheckIn ')
        return callback(error,rows);
    })
}

function getLastDayBizClick(params,callback){
    var query = "select  dd.id,dd.day,dd.month,dd.year ,ifnull(sum(smc.count),0)  total_click " +
        " from date_dimension dd left join stat_menu_click smc on dd.id = smc.date_id " +
        " where smc.biz_id = ? " +
        " group by dd.id order by dd.id desc limit 0 , ? ";
    var paramArr = [], i = 0;
    paramArr[i++]=params.bizId;
    paramArr[i]=parseInt(params.size);

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getLastDayBizClick ')
        return callback(error,rows);
    })
}

function getLastWeekBizClick(params,callback){
    var query = "select  dd.week,dd.year ,ifnull(sum(smc.count),0)  total_click " +
        " from date_dimension dd left join stat_menu_click smc on dd.id = smc.date_id " +
        " where smc.biz_id = ? " +
        " group by dd.week,dd.year order by dd.week desc limit 0 , ? ";
    var paramArr = [], i = 0;
    paramArr[i++]=params.bizId;
    paramArr[i]=parseInt(params.size);

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getLastWeekBizClick ')
        return callback(error,rows);
    })
}

function getLastMonthBizClick(params,callback){
    var query = "select  dd.month,dd.year ,ifnull(sum(smc.count),0) total_click " +
        " from date_dimension dd left join stat_menu_click smc on dd.id = smc.date_id " +
        " where smc.biz_id = ? " +
        " group by dd.month,dd.year order by dd.month desc limit 0, ? ";
    var paramArr = [], i = 0;
    paramArr[i++]=params.bizId;
    paramArr[i]=parseInt(params.size);

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getLastMonthBizClick ');
        return callback(error,rows);
    })
}

/**
 * The function to get product that customer ordered count by day
 * @param params
 * @param callback
 */
function getDayProdOrderStat(params,callback){
    var query = "select  dd.id,dd.day,dd.month,dd.year ,ifnull(sum(smo.count),0)  total_click " +
        " from date_dimension dd left join stat_menu_order smo on dd.id = smo.date_id " +
        " where smo.biz_id = ? " +
        " group by dd.id order by dd.id desc limit 0 , ? ";
    var paramArr = [], i = 0;
    paramArr[i++]=params.bizId;
    paramArr[i]=parseInt(params.size);

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getDayProdOrderStat ')
        return callback(error,rows);
    })
}

/**
 * The function to get product that customer ordered count by week
 * @param params
 * @param callback
 */
function getWeekProdOrderStat(params,callback){
    var query = "select  dd.week,dd.year ,ifnull(sum(smo.count),0)  total_click " +
        " from date_dimension dd left join stat_menu_order smo on dd.id = smo.date_id " +
        " where smo.biz_id = ? " +
        " group by dd.week order by dd.week desc limit 0 , ? ";
    var paramArr = [], i = 0;
    paramArr[i++]=params.bizId;
    paramArr[i]=parseInt(params.size);

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getWeekProdOrderStat ')
        return callback(error,rows);
    })
}
/**
 * The function to get product that customer ordered count by month
 * @param params
 * @param callback
 */
function getMonthProdOrderStat(params,callback){
    var query = "select  dd.month,dd.year ,ifnull(sum(smo.count),0) total_click " +
        " from date_dimension dd left join stat_menu_order smo on dd.id = smo.date_id " +
        " where smo.biz_id = ? " +
        " group by dd.month order by dd.month desc limit 0, ? ";
    var paramArr = [], i = 0;
    paramArr[i++]=params.bizId;
    paramArr[i]=parseInt(params.size);

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getMonthProdOrderStat ')
        return callback(error,rows);
    })
}

/**
 * The method to query product detail of customer ordered
 * @param params
 * @param callback
 */
function getBizTopOrderProd(params ,callback){
    var query = "select sum(smo.count) total_count,p.prod_id,p.name " +
        "from product p left join stat_menu_order smo on p.prod_id=smo.product_id " +
        "where p.biz_id =? group by product_id order by total_count desc limit 0, ? ";
    var paramArr = [], i = 0;
    paramArr[i++]=Number(params.bizId);
    paramArr[i]=Number(params.size);

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getBizTopOrderProd ')
        return callback(error,rows);
    })
}


module.exports = {
    getBizTopPointCust : getBizTopPointCust,
    getBizTopClickProd : getBizTopClickProd,
    getBizTotalClickCount : getBizTotalClickCount,
    getBizLastClickCount : getBizLastClickCount,
    getBizLastCheckIn : getBizLastCheckIn,
    getBizTotalCustCount : getBizTotalCustCount,
    getLastDayBizClick : getLastDayBizClick ,
    getLastWeekBizClick : getLastWeekBizClick,
    getLastMonthBizClick : getLastMonthBizClick,
    getDayProdOrderStat : getDayProdOrderStat,
    getWeekProdOrderStat : getWeekProdOrderStat,
    getMonthProdOrderStat : getMonthProdOrderStat,
    getBizTopOrderProd : getBizTopOrderProd

};
