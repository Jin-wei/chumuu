/**
 * Created by ling xue on 15-4-8.
 */

var db=require('./../db.js');
var Seq = require('seq');

var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('BizUserMobileDao.js');

function addBizUserMobile(params,callback){
    var query = "insert into biz_user_mobile (biz_id,device_token,device_type) values( ? , ? , ?) ";

    var paramArray=[],i=0;

    paramArray[i++] = params.bizId;
    paramArray[i++] = params.deviceToken;
    paramArray[i] = params.deviceType;

    db.dbQuery(query, paramArray ,function(error,rows){
        logger.debug(' addBizUserMobile ');
        return callback(error,rows);
    });
}

function removeBizUserMobile(params,callback){
    var query = "delete from biz_user_mobile where biz_id = ? and device_token = ? ";

    var paramArray=[],i=0;

    paramArray[i++] = params.bizId;
    paramArray[i] = params.deviceToken;

    db.dbQuery(query, paramArray ,function(error,rows){
        logger.debug(' removeBizUserMobile ');
        return callback(error,rows);
    });
}

function getBizMobile(params,callback){
    var query = "select * from biz_user_mobile where biz_id = ?  ";

    var paramArray=[],i=0;

    paramArray[i++] = params.bizId;
    if(params.device_type){
        query = query + " and device_type = ? ";
        paramArray[i++] = params.deviceType;
    }
    if(params.deviceToken){
        query = query + " and device_token = ? ";
        paramArray[i++] = params.deviceToken;

    }
    if(params.sound){
        query = query + " and sound = ? ";
        paramArray[i++] = params.sound;
    }
    query = query + " order by sound ";

    db.dbQuery(query, paramArray ,function(error,rows){
        logger.debug(' getBizMobile ');
        return callback(error,rows);
    });
}

function updateBizUserMobile(params,callback){
    var query = "update biz_user_mobile set sound =? where biz_id = ? and device_token = ? ";

    var paramArray=[],i=0;

    paramArray[i++] = params.sound;
    paramArray[i++] = params.bizId;
    paramArray[i++] = params.deviceToken;

    db.dbQuery(query, paramArray ,function(error,rows){
        logger.debug(' updateBizUserMobile ');
        return callback(error,rows);
    });
}





module.exports = {
    addBizUserMobile : addBizUserMobile,
    removeBizUserMobile : removeBizUserMobile,
    getBizMobile : getBizMobile ,
    updateBizUserMobile : updateBizUserMobile
}