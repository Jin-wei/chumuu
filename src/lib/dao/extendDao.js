/**
 * Created by ling xue on 14-11-28.
 */

var db=require('./../db.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('extendDao.js');

function addBizExtend(params,callback){
    var query = " insert into biz_extend (`parent_id`,`biz_id`,`extend_type`,`extend_name`,`extend_name_lan`,`extend_price`,`state`,`remark`,`created_on`,`updated_on`) " +
        "values (? , ? , ? , ? , ? , ? , ? , ? , ? , ? ) ";
    var paramArr = [], i = 0;
    paramArr[i++]=params.parentId;
    paramArr[i++]=params.bizId;
    paramArr[i++]=params.extendType;
    paramArr[i++]=params.extendName;
    paramArr[i++]=params.extendNameLan;
    paramArr[i++]=params.extendPrice;
    paramArr[i++]=1;
    paramArr[i++]=params.remark;
    paramArr[i++]=new Date();
    paramArr[i]=new Date();

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addBizExtend ');
        return callback(error,rows);
    });
}

function updateBizExtend(params,callback){
    var query = " update biz_extend set parent_id=?,extend_type=?,extend_name=? ,extend_name_lan=?,extend_price=?,remark=?,updated_on=? where id=? and biz_id =? ";
    var paramArr = [], i = 0;
    paramArr[i++]=params.parentId;
    paramArr[i++]=params.extendType;
    paramArr[i++]=params.extendName;
    paramArr[i++]=params.extendNameLan;
    paramArr[i++]=params.extendPrice;
    paramArr[i++]=params.remark;
    paramArr[i++]=new Date();
    paramArr[i++]=params.extendId;
    paramArr[i]=params.bizId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateBizExtend ');
        return callback(error,rows);
    });
}

function delBizExtend(params,callback){
    var query = "update biz_extend set state=0 where biz_id =? ";
    var paramArr = [], i = 0;
    paramArr[i++]=params.bizId;
    if(params.extendType==0){
        query+=' and (id=? or parent_id=?)';
        paramArr[i++]=params.extendId;
        paramArr[i]=params.extendId;
    }else{
        query+=' and id=?';
        paramArr[i]=params.extendId;
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' delBizExtend ');
        return callback(error,rows);
    });
}

function queryBizExtend(params,callback){
    var query = " select * from biz_extend where biz_id =? and state=1";
    var paramArr = [], i = 0;
    logger.info(params.extendType);
    paramArr[i++]=params.bizId;
    if(params.extendId){
        query = query + " and id =? ";
        paramArr[i++]=params.extendId;
    }
    if(params.parentId){
        query = query + " and parent_id =? ";
        paramArr[i++]=params.parentId;
    }
    if(params.extendType != null){
        query = query + " and extend_type =? ";
        paramArr[i]=params.extendType;
    }
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' queryBizExtend ');
        return callback(error,rows);
    });
}

module.exports = {
    addBizExtend :addBizExtend ,
    updateBizExtend : updateBizExtend ,
    delBizExtend : delBizExtend ,
    queryBizExtend : queryBizExtend

}