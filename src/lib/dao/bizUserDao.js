/**
 * Created by ling xue on 15-2-11.
 */

var db=require('./../db.js');

var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('BizUserDao.js');

function updateBizUserRole(params,callback){
    var query = "update biz_user_rel set role_type = ? ,remark = ? where biz_id = ? and user_id = ? ";

    var paramArray=[],i=0;
    paramArray[i++] = params.roleType;
    paramArray[i++] = params.remark;
    paramArray[i++] = params.bizId;
    paramArray[i] = params.userId;

    db.dbQuery(query, paramArray ,function(error,rows){
        logger.debug(' updateBizOrderStatus ');
        return callback(error,rows);
    });
}

function addBizUserRel(params,callback){
    var query = "insert into biz_user_rel (biz_id,user_id,role_type,remark) values( ?, ? , ? ,?) ";

    var paramArray=[],i=0;

    paramArray[i++] = params.bizId;
    paramArray[i++] = params.userId;
    paramArray[i++] = params.roleType;
    paramArray[i++] = params.remark;

    db.dbQuery(query, paramArray ,function(error,rows){
        logger.debug(' updateBizOrderStatus ');
        return callback(error,rows);
    });
}

function queryBizEmployee(params,callback){
    var query = " select bur.* , bu.username,bu.first_name,bu.first_name,bu.last_name ,bu.email,bu.phone_no" +
        "  from biz_user_rel bur left join biz_user bu on bur.user_id = bu.user_id " +
        "  where bur.role_type>0 and bur.biz_id = ? order by bur.role_type desc ";

    var paramArray=[],i=0;

    paramArray[i++] = params.bizId;
    if(params.start!=null && params.size!=null){
        query += " limit ? , ? " ;
        paramArray[i++] = parseInt(params.start) ;
        paramArray[i++] = parseInt(params.size);
    }

    db.dbQuery(query, paramArray ,function(error,rows){
        logger.debug(' queryBizEmployee ');
        return callback(error,rows);
    });

}

function queryBizUser(params,callback){
    var query = " select user_id,username,first_name,last_name,email,active,created_on,updated_on,last_login_date,phone_no from biz_user where username = ?  or email = ? " ;
    var paramArray=[],i=0;
    paramArray[i++] = params.user;
    paramArray[i] = params.user;

    db.dbQuery(query, paramArray ,function(error,rows){
        logger.debug(' queryBizUser ');
        return callback(error,rows);
    });
}

function queryBizAllUser(params,callback){
    var query = ' select bu.user_id,bu.username,bu.first_name,bu.last_name,bu.email,bu.active,bu.created_on, ' +
        ' bu.updated_on,bu.last_login_date,bu.phone_no,bur.role_type,bur.biz_id,bur.remark ' +
        ' from biz_user_rel bur left join biz_user bu on bur.user_id = bu.user_id where bur.biz_id = ?'
    var paramArray=[],i=0;
    paramArray[i] = params.bizId;
    db.dbQuery(query, paramArray ,function(error,rows){
        logger.debug(' queryBizAllUser ');
        return callback(error,rows);
    });
}
function updateBizUserAvatar(params,callback){
    var query = "update biz_user set avatar = ?  where user_id = ? ";
    var paramArr = [], i = 0;
    paramArr[i++]=params.avatar;
    paramArr[i]=params.userId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateCustAvatar ');
        return callback(error,rows);
    })
}

function deleteBizUserRel(params,callback){
    var query = 'delete from biz_user_rel where user_id = ? and biz_id = ? ';
    var paramArr = [], i = 0;
    paramArr[i++]=params.userId;
    paramArr[i]=params.bizId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' deleteBizUserRel ');
        return callback(error,rows);
    })
}
module.exports = {
    updateBizUserRole : updateBizUserRole ,
    addBizUserRel : addBizUserRel ,
    queryBizEmployee : queryBizEmployee ,
    queryBizUser : queryBizUser,
    updateBizUserAvatar : updateBizUserAvatar,
    queryBizAllUser : queryBizAllUser ,
    deleteBizUserRel : deleteBizUserRel
};