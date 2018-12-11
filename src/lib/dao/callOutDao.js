
var db=require('./../db.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('callOutDao.js');

function queryAllCallOut(params,callback){
    var query = " select * from all_callOut where 1=1 ";
    var paramArr = [], i = 0;
    if(params.callOutId){
        query+=' and id=?';
        paramArr[i]=params.callOutId;
    }
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' queryAllCallOut ');
        return callback(error,rows);
    });
}
function queryBizCallOut(params,callback){
    var query = " select a.* from all_callOut a,biz_callOut b where a.id=b.callOut_id and b.biz_id =? ";
    var paramArr = [], i = 0;
    paramArr[i]=params.bizId;
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' queryBizCallOut ');
        return callback(error,rows);
    });
}
function deleteBizCallOut(params,callback){
    var query = "delete from biz_callOut where biz_id=? and callOut_id=?";
    var paramArr = [], i = 0;
    paramArr[i++]=params.bizId;
    paramArr[i]=params.callOutId;
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' deleteBizCallOut ');
        return callback(error,rows);
    });
}

function addBizCallOut(params,callback){
    var query = " insert into biz_callOut (biz_id,callOut_id) " +
        "values (? , ?  ) ";
    var paramArr = [], i = 0;
    paramArr[i++]=params.bizId;
    paramArr[i]=params.callOutId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addBizCallOut ');
        return callback(error,rows);
    });
}
module.exports = {
    queryAllCallOut:queryAllCallOut,
    queryBizCallOut:queryBizCallOut,
    deleteBizCallOut:deleteBizCallOut,
    addBizCallOut:addBizCallOut
}