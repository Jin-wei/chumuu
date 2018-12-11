/**
 * Created by ling xue on 2016/3/2.
 */
var db=require('./../db.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('UserInfoDao.js');

function createUser(params,callback){
    var query='insert into user_info(username,email,phone,password,name,gender,avatar,address,state,city,zipcode,wechat_id,wechat_status,status) ' +
        ' values(?,?,?,?,?,?,?,?,?,?,?,?,?,?);' ;
    var paramArr = [], i = 0;
    paramArr[i++]=params.username;
    paramArr[i++]=params.email;
    paramArr[i++]=params.phone;
    paramArr[i++]=params.password;
    paramArr[i++]=params.name;
    paramArr[i++]=params.gender;
    paramArr[i++]=params.avatar;
    paramArr[i++]=params.address;
    paramArr[i++]=params.state;
    paramArr[i++]=params.city;
    paramArr[i++]=params.zipcode;
    paramArr[i++]=params.wechatId;
    paramArr[i++]=params.wechatStatus;
    paramArr[i]=params.status;


    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' createUser ');
        return callback(error,rows);
    })
}

function updateUserStatus(params,callback){
    var query = 'update user_info set status = ? where id is not null '
    var paramArr = [], i = 0;
    if(params.userId){
        query = query + " and id = ? ";
        paramArr[i++] = params.userId;
    }
    if(params.username){
        query = query + " and username = ? ";
        paramArr[i++] = params.username;
    }
    if(params.email){
        query = query + " and email = ? ";
        paramArr[i++] = params.email;
    }
    if(params.phone){
        query = query + " and phone = ? ";
        paramArr[i++] = params.phone;
    }
    if(params.wechatId){
        query = query + " and wechat_id = ? ";
        paramArr[i++] = params.wechatId;
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateUserStatus ');
        return callback(error,rows);
    })
}

function updateUserWechatStatus(params,callback){
    var query = 'update user_info set wechat_status = ? where wechat_id =? '
    var paramArr = [], i = 0;
    paramArr[i++] = params.wechatId;
    if(params.userId){
        query = query + " and id = ? ";
        paramArr[i++] = params.userId;
    }
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateUserWechatStatus ');
        return callback(error,rows);
    })
}

function getUser(params,callback){
    var query = 'select * from  user_info where id is not null ' ;
    var paramArr = [], i = 0;
    if(params.userId){
        query = query + " and id = ? ";
        paramArr[i++] = params.userId;
    }
    if(params.username){
        query = query + " and username = ? ";
        paramArr[i++] = params.username;
    }
    if(params.email){
        query = query + " and email = ? ";
        paramArr[i++] = params.email;
    }
    if(params.phone){
        query = query + " and phone = ? ";
        paramArr[i++] = params.phone;
    }
    if(params.wechatId){
        query = query + " and wechat_id = ? ";
        paramArr[i++] = params.wechatId;
    }
    if(params.status){
        query = query + " and status = ? ";
        paramArr[i++] = params.status;
    }
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateUserWechatStatus ');
        return callback(error,rows);
    })

}

module.exports = {
    createUser : createUser ,
    updateUserStatus : updateUserStatus ,
    updateUserWechatStatus: updateUserWechatStatus ,
    getUser : getUser
}