/**
 * Created by ling xue on 15-1-20.
 */

var db=require('./../db.js');
var lov = require('../util/ListOfValue.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('bizOrderSeqDao.js');

function addBizSeq(params,callback){
    var query='insert into biz_order_seq(biz_id,seq) values(?,?);'
    var paramArray=[],i=0;
    paramArray[i++]=params.bizId;
    paramArray[i]=params.seq;

    db.dbQuery(query,paramArray,function(error,rows){
        logger.debug(' addBizSeq ')
        return callback(error,rows);
    });
}

function queryBizSeq(params,callback){
    var query='select * from biz_order_seq where biz_id = ? ';
    var paramArray=[],i=0;
    paramArray[i]=params.bizId;

    db.dbQuery(query,paramArray,function(error,rows){
        logger.debug(' queryBizSeq ')
        return callback(error,rows);
    });

}

function increaseBizSeq(params,callback){
    var query='update biz_order_seq set seq=seq+1 where biz_id = ? ';
    var paramArray=[],i=0;
    paramArray[i]=params.bizId;

    db.dbQuery(query,paramArray,function(error,rows){
        logger.debug(' queryBizSeq ')
        return callback(error,rows);
    });
}

function updateBizSeq(params,callback){
    var query='update biz_order_seq set seq='+lov.BIZ_ORDER_SEQ+' where biz_id = ? ';
    var paramArray=[],i=0;
    paramArray[i]=params.bizId;

    db.dbQuery(query,paramArray,function(error,rows){
        logger.debug(' queryBizSeq ')
        return callback(error,rows);
    });
}

module.exports = {
    addBizSeq : addBizSeq,
    queryBizSeq : queryBizSeq,
    increaseBizSeq : increaseBizSeq,
    updateBizSeq : updateBizSeq
}