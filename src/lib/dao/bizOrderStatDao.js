/**
 * Created by ling xue on 15-1-26.
 */


var db = require('./../db.js');
var Seq = require('seq');
var listOfValue = require('./../util/ListOfValue.js');


var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('BizOrderStatDao.js');

var insertNewDate = function(params,callback){

    var querySelect = "select * from date_dimension dd where " +
        "dd.day=? and dd.week=? and dd.month=? and dd.year=? and dd.year_month=? and dd.year_week=? "

    var query='insert into date_dimension (`day`,`week`,`month`,`year`,`year_month`,`year_week`) values (?,?,?,?,?,?);'
    var paramArray=[],i=0;
    paramArray[i++]=params.day;
    paramArray[i++]=params.week;
    paramArray[i++]=params.month;
    paramArray[i++]=params.year;
    paramArray[i++]=params.yearMonth;
    paramArray[i]=params.yearWeek;
    Seq().seq(function(){
        var that = this;
        db.dbQuery(querySelect,paramArray,function(error,rows){
            logger.debug(' insertNewDate ')
            if(rows != null && rows.length>0){
                logger.warn(' insertNewDate ' + 'failed');
                return callback(null,{dateId : rows[0].id});

            }else{
                that();
            }

        });

    }).seq(function(){
            db.dbQuery(query,paramArray,function(error,rows){
                logger.debug(' insertNewDate ');
                callback(error,{dateId:rows.insertId});

            });
        })


}

function addBizDayOrderStat(params,callback){
    var query='insert into biz_order_stat (biz_id,date_id,total_sales,total_tax,total_cash,total_card,dine_in_count,togo_count)' +
        'select ?,?,sum(actual_price),sum(total_tax),null,null, 2*count(1)-sum(order_type),sum(order_type)-count(1) ' +
        'from order_info where biz_id =? and finish =0 and status = '+listOfValue.ORDER_STATUS_COMPELETED ;
    var paramArray=[],i=0;
    paramArray[i++]=params.bizId;
    paramArray[i++]=params.dateId;
    paramArray[i]=params.bizId;
    db.dbQuery(query,paramArray,function(error,rows){
        logger.debug(' addBizDayOrderStat ');
        callback(error,{dateId:rows.insertId});

    });
}

function getBizDayOrderStat(params,callback){
    var query = "select * from biz_order_stat where biz_id = ? order by date_id desc ";
    var paramArray=[],i=0;
    paramArray[i++]=params.bizId;

    if(params.start!=null && params.size!=null){
        query += " limit ? , ? " ;
        paramArray[i++] = parseInt(params.start) ;
        paramArray[i] = parseInt(params.size);
    }
    db.dbQuery(query,paramArray,function(error,rows){
        logger.debug(' getBizDayOrderStat ');
        callback(error,rows);

    });
}

module.exports = {
    insertNewDate : insertNewDate ,
    addBizDayOrderStat : addBizDayOrderStat ,
    getBizDayOrderStat : getBizDayOrderStat
}