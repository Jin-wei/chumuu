/**
 * Created by ling xue on 14-11-28.
 */

var db=require('./../db.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('PrinterDao.js');

function addBizPrinter(params,callback){
    var query = " insert into biz_printer (`biz_id`,`type`,`name`,`ip`,`local`,`remark`,`device_name`,`operator_id`,`bind_status`,`print_num`) " +
        "values ( ? , ? , ? , ? , ? , ? , ? , ? , ? , ?) ";
    var paramArr = [], i = 0;
    paramArr[i++]=params.bizId;
    paramArr[i++]=params.type;
    paramArr[i++]=params.name;
    paramArr[i++]=params.ip;
    paramArr[i++]=params.local;
    paramArr[i++]=params.remark;
    paramArr[i++]=params.deviceName;
    paramArr[i++]=params.operatorId;
    paramArr[i++]=params.bindStatus;
    paramArr[i]=params.printNum;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addBizPrinter ')
        return callback(error,rows);
    });
}

function updateBizPrinter(params,callback){
    var query = " update biz_printer set type=? , name=? , ip=? ,local=?,remark=?,device_name=?,operator_id=?,bind_status=?,print_num=? where id=? and biz_id =? ";
    var paramArr = [], i = 0;
    paramArr[i++]=params.type;
    paramArr[i++]=params.name;
    paramArr[i++]=params.ip;
    paramArr[i++]=params.local;
    paramArr[i++]=params.remark;
    paramArr[i++]=params.deviceName;
    paramArr[i++]=params.operatorId;
    paramArr[i++]=params.bindStatus;
    paramArr[i++]=params.printNum;
    paramArr[i++]=params.printerId;
    paramArr[i]=params.bizId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateBizPrinter ')
        return callback(error,rows);
    });
}

function delBizPrinter(params,callback){
    var query = " delete from biz_printer where id=? and biz_id =? ";
    var paramArr = [], i = 0;
    paramArr[i++]=params.printerId;
    paramArr[i]=params.bizId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' delBizPrinter ')
        return callback(error,rows);
    });
}

function queryBizPrinter(params,callback){
    var query = " select * from biz_printer where biz_id =? ";
    var paramArr = [], i = 0;
    paramArr[i++]=params.bizId;
    if(params.type){
        query = query + " and type =? ";
        paramArr[i++]=params.type;
    }
    if(params.printerId){
        query = query + " and id =? ";
        paramArr[i++]=params.printerId;
    }
    if(params.unPrinterId){
        query = query + " and id <>? ";
        paramArr[i++]=params.unPrinterId;
    }
    if(params.deviceName){
        query = query + " and device_name =? ";
        paramArr[i]=params.deviceName;
    }
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' queryBizPrinter ')
        return callback(error,rows);
    });
}

module.exports = {
    addBizPrinter :addBizPrinter ,
    updateBizPrinter : updateBizPrinter ,
    delBizPrinter : delBizPrinter ,
    queryBizPrinter : queryBizPrinter

}