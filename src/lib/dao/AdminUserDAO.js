
var db=require('./../db.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('AdminUserDAO.js');
var params = [];

function updatePassword(params,callback){
    var query = " update admin_user set password = ? where id = ?";
    var paramArray=[],i=0;
    paramArray[i++] = params.password;
    paramArray[i] = params.adminId;
    db.dbQuery(query,paramArray,function(error,rows){
        logger.debug(' updatePassword ');
        return callback(error,rows);
    });

}

function updateInfo(params,callback){
    var query = " update admin_user set name = ? ,remark= ?,phone=? where id = ?";
    var paramArray=[],i=0;
    paramArray[i++] = params.name;
    paramArray[i++] = params.remark;
    paramArray[i++] = params.phone;
    paramArray[i] = params.adminId;
    db.dbQuery(query,paramArray,function(error,rows){
        logger.debug(' updateInfo ');
        return callback(error,rows);
    });
}

function queryAdminUser(params,callback){
    var query = " select * from admin_user where id is not null ";
    var paramArray=[],i=0;
    if(params.adminId){
        paramArray[i++] = params.adminId;
        query = query + " and id = ? ";
    }
    if(params.username){
        paramArray[i++] = params.username;
        query = query + " and username = ? ";
    }

    db.dbQuery(query,paramArray,function(error,rows){
        logger.debug(' queryAdminUser ');
        return callback(error,rows);
    });
}

function queryAdminInfo(req,res,next){
    var query = " select * from admin_user where id is not null";
    var paramArray=[],i=0;
    if(params.adminId){
        query = query + " and id = ? "
        paramArray[i++]=params.adminId;
    }
    db.dbQuery(query,paramArray,function(error,rows){
        logger.debug(' queryUser ');
        return callback(error,rows);
    });
}

//for liling

function getProdName(params, callback){
    var query = 'select p.prod_id from product p where p.biz_id = ? and p.name=?';
    var paramArray=[],i=0;
    paramArray[i++]=params.bizId;
    paramArray[i++]=params.name;

    db.dbQuery(query,paramArray,function(error,rows){
        return callback(error,rows);
    })
}

function getProdTypeName(params, callback) {
    var query = 'select t.type_id from prod_type t where t.biz_id = ? and t.name = ? ';
    var paramArray=[],i=0;
    paramArray[i++]=params.bizId;
    paramArray[i++]=params.name;

    db.dbQuery(query,paramArray,function(error,rows){
        return callback(error,rows);
    })
}

function insertNewType(params, callback) {
    var query='insert into prod_type(name,name_lang,biz_id) values(?,?,?);';
    var paramArray=[],i=0;
    if(/[a-z]/.test(params.name)){
        var upperCaseName = params.name.toUpperCase();
        paramArray[i++]=upperCaseName;
        paramArray[i++]=params.name_lang;
        paramArray[i++]=params.bizId;

    }else{
        paramArray[i++]=params.name;
        paramArray[i++]=params.name_lang;
        paramArray[i++]=params.bizId;
    }


    db.dbQuery(query,paramArray,function(error,rows){
        return callback(error,rows);
    })
}

function insertNewProd(params, callback){
    var query = 'insert into product(name, description, price, note, biz_id, type_id, name_lang, description_lang, options, active, calorie, spiciness, ingredient, togo) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?);';
    var paramArray=[],i=0;

        paramArray[i++]=params.name;
        paramArray[i++]=params.description;
        paramArray[i++]=params.price;
        paramArray[i++]=params.note;
        paramArray[i++]=params.biz_id;
        paramArray[i++]=params.type_id;
        paramArray[i++]=params.name_lang;
        paramArray[i++]=params.description_lang;
        paramArray[i++]=params.options;
        paramArray[i++]=params.active;
        paramArray[i++]=params.calorie;
        paramArray[i++]=params.spiciness;
        paramArray[i++]=params.ingredient;
        paramArray[i++]=params.togo;


    db.dbQuery(query,paramArray,function(error,rows){
        return callback(error,rows);
    })
}

function updateProd(params, callback){
    var query='update product set description=? , price=? , note=? ,type_id=? , name_lang=? , description_lang=? , options=? , active=?, calorie=?, spiciness=?, ingredient=?, togo=? where prod_id = ?';
    var paramArray=[],i= 0;

        paramArray[i++]=params.description;
        paramArray[i++]=params.price;
        paramArray[i++]=params.note;
        paramArray[i++]=params.type_id;
        paramArray[i++]=params.name_lang;
        paramArray[i++]=params.description_lang;
        paramArray[i++]=params.options;
        paramArray[i++]=params.active;
        paramArray[i++]=params.calorie;
        paramArray[i++]=params.spiciness;
        paramArray[i++]=params.ingredient;
        paramArray[i++]=params.togo;
        paramArray[i++]=params.prod_id;

    db.dbQuery(query,paramArray,function(error,rows){
        return callback(error,rows);
    })
}

module.exports = {
    updatePassword : updatePassword ,
    updateInfo : updateInfo ,
    queryAdminUser : queryAdminUser,
    queryAdminInfo : queryAdminInfo,
    //liling
    getProdName:getProdName,
    getProdTypeName:getProdTypeName,
    insertNewType:insertNewType,
    insertNewProd:insertNewProd,
    updateProd:updateProd
}