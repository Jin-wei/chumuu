/**
 * Created by ling xue on 15-7-9.
 */

var db=require('./../db.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('BizInvoiceDao.js');
//var wechatUtil = require('../config/wechat/WechatConfig.js');
var sysConfig = require('../config/SystemConfig.js');

function addBizInvoice(params,callback){
    var paramArr = [], i = 0;
    var query = "insert into biz_invoice (biz_id,amount,fee,order_count,settle_start,settle_end,settle_date,remark) values ( ? ,? ,? ,? ,? ,? , ? , ? ) ";
    paramArr[i++] = params.bizId;
    paramArr[i++] = params.amount;
    paramArr[i++] = params.fee;
    paramArr[i++] = params.orderCount;
    paramArr[i++] = params.start;
    paramArr[i++] = params.end;
    paramArr[i++] = new Date();
    paramArr[i] = params.remark;
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addBizInvoice ');
        return callback(error,rows);
    })
}

function updateBizInvoiceStatus(params,callback){
    var paramArr = [], i = 0;
    var query = "update  biz_invoice status = ?,remark=? where id = ? and biz_id = ?";
    paramArr[i++] = params.status;
    paramArr[i++] = params.remark;
    paramArr[i++] = params.invoiceId;
    paramArr[i] = params.bizId;
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateBizInvoiceStatus ');
        return callback(error,rows);
    })
}

function deleteBizInvoice(params,callback){
    var paramArr = [], i = 0;
    var query = "delete from   biz_invoice where id = ? and biz_id = ?";
    paramArr[i++] = params.invoiceId;
    paramArr[i] = params.bizId;
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' deleteBizInvoice ');
        return callback(error,rows);
    })
}

function queryBizInvoice(params,callback){

    var paramArr = [], i = 0;
    var query = "select *  from biz_invoice where created_on is not null ";
    if(params.invoiceId){
        paramArr[i++] = params.invoiceId;
        query = query + " and id = ? "
    }
    if(params.bizId){
        query = query + " and biz_id = ? "
        paramArr[i++] = params.bizId;
    }
    if(params.status){
        query = query + " and status = ? "
        paramArr[i++] = params.status;
    }
    query = query + " order by created_on desc "
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' queryBizInvoice ');
        return callback(error,rows);
    });

}


function autoCreateInvoice(params,callback){
    var query = 'insert into biz_invoice (biz_id,amount,fee,actual_amount,order_count,settle_start,settle_end,settle_date) ' +
        ' select b.biz_id ,ifnull(sum(op.payment_actual),0) amount  , ?*ifnull(sum(payment_actual),0) fee,' +
        ' (?*ifnull(sum(payment_actual),0)) as actual_amount, count(distinct(order_id)) order_count,' +
        ' ? as settle_start,? as settle_end,now() as settle_date ' +
        ' from order_payment op right join business b on op.biz_id = b.biz_id ' +
        ' where op.date_id is not null and date_id in  '

    var paramArr = [], i = 0;
    paramArr[i++] = wechatUtil.WECHAT_SERVICE_FEE_RATE;
    paramArr[i++] = wechatUtil.WECHAT_PAYMENT_BACK_RATE;
    paramArr[i++] = params.timeParams.startDate;
    paramArr[i++] = params.timeParams.endDate;
    if(sysConfig.invoicePeriod == 'MONTH'){
        query = query + ' (select dd.id as date_id from date_dimension dd where dd.month=? and dd.year=? ) '
        paramArr[i++] = params.timeParams.month;
    }else if (sysConfig.invoicePeriod == 'YEAR'){
        query = query + ' (select dd.id as date_id from date_dimension dd where dd.year=? ) ';
    }else {
        query = query + ' (select dd.id as date_id from date_dimension dd where dd.week=? and dd.year=? )';
        paramArr[i++] = params.timeParams.week;
    }
    paramArr[i++] = params.timeParams.year;
    if(params.bizId){
        paramArr[i++] = params.bizId;
        query = query + " and b.biz_id = ? "
    }
    query = query+  ' group by b.biz_id ' ;
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' autoCreateInvoice ');
        return callback(error,rows);
    });

}

function getBizInoviceStat(params,callback){
    var query = ' select b.biz_id ,b.name,b.phone_no,sum(bi.amount) amount  , sum(bi.fee) fee, ' +
        ' sum(bi.actual_amount) actual_amount, sum(bi.order_count) order_count, ' +
        ' bi.settle_start, bi.settle_end, bi.settle_date ,bi.remark,bi.status ' +
        ' from biz_invoice bi left join business b on bi.biz_id = b.biz_id ' +
        ' where b.biz_id is not null '
    var paramArr = [], i = 0;
    if(params.settleEnd){
        query = query + ' and bi.settle_end = ? '
        paramArr[i++] = params.settleEnd;
    }
    query = query + ' group by b.biz_id ';

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getBizInoviceStat ');
        return callback(error,rows);
    });
}

module.exports = {
    addBizInvoice : addBizInvoice ,
    updateBizInvoiceStatus : updateBizInvoiceStatus,
    deleteBizInvoice : deleteBizInvoice,
    queryBizInvoice : queryBizInvoice,
    autoCreateInvoice : autoCreateInvoice ,
    getBizInoviceStat : getBizInoviceStat
}