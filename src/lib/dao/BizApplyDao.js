/**
 * Created by ling xue on 14-4-18.
 */


var db=require('./../db.js');

var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('BizApplyDao.js');


function addBizApply(params , callback){
    var query='insert into biz_application(user_id,biz_name,address,city,state,country,zipcode,latitude,longitude,phone_num,category) values(?,?,?,?,?,?,?,?,?,?,?);'
    var paramArray=[],i=0;
    paramArray[i++]=params.userId;
    paramArray[i++]=params.bizName;
    paramArray[i++]=params.address;
    paramArray[i++]=params.city;
    paramArray[i++]=params.state;
    paramArray[i++]=params.country;
    paramArray[i++]=params.zipcode;
    paramArray[i++]=params.latitude;
    paramArray[i++]=params.longitude;
    paramArray[i++]=params.phone_num;
    paramArray[i++]=params.category;

    db.dbQuery(query,paramArray,function(error,rows){
        logger.debug(' addBizApply ')
        return callback(error,rows);
    })
}

function updateBizApply(params ,callback){
    var query='update biz_application set biz_name=?, address=? , city=? , state=? , country=? ,zipcode=? , latitude=? , longitude=? , phone_num=? , category=? where id=? and user_id = ?';
    var paramArray=[],i=0;
    paramArray[i++]=params.bizName;
    paramArray[i++]=params.address;
    paramArray[i++]=params.city;
    paramArray[i++]=params.state;
    paramArray[i++]=params.country;
    paramArray[i++]=params.zipcode;
    paramArray[i++]=params.latitude;
    paramArray[i++]=params.longitude;
    paramArray[i++]=params.phone_num;
    paramArray[i++]=params.category;
    paramArray[i++]=params.appId;
    paramArray[i++]=params.userId;

    db.dbQuery(query,paramArray,function(error,rows){
        logger.debug(' updateBizApply ')
        return callback(error,rows);
    })
}

function addBizUserRel(params , callback){
    var query='insert into biz_user_rel(user_id,biz_id) values(?,?);'
    var paramArray=[],i=0;
    paramArray[i++]=params.userId;
    paramArray[i++]=params.bizId;

    db.dbQuery(query,paramArray,function(error,rows){
        logger.debug(' addBizUserRel ')
        return callback(error,rows);
    })
}

function getBizApplication(params, callback){
    var query='select * from biz_application where user_id = ?'
    var paramArray=[],i=0;
    paramArray[i++]=params.userId;


    db.dbQuery(query,paramArray,function(error,rows){
        logger.debug(' addBizUserRel ')
        return callback(error,rows);
    })
}


module.exports = {
    addBizApply : addBizApply,
    updateBizApply : updateBizApply,
    addBizUserRel : addBizUserRel,
    getBizApplication : getBizApplication
}
