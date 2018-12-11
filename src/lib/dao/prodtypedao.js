var db=require('./../db.js');

var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('ProdTypeDao.js');

function searchBizProdType(sc,callback){
    var query = "SELECT p.type_id, p.biz_id, p.name, p.name_lang,p.display_order," +
        "p.menu_id,b.menu_name ,b.menu_name_lang,b.start_time , b.end_time ,b.display_type " +
        "from prod_type p left join biz_menu b on p.menu_id=b.menu_id  where p.biz_id=? " ;

    //Set mysql query parameters array
    var paramArr=[],i=0;
    paramArr[i++] =sc.biz_id?sc.biz_id:sc.bizId;
    if (sc.name){
        query+=' and p.name=?';
        paramArr[i++] = sc.name;
    }
    if(sc.id){
        query+= ' and p.type_id=?'
        paramArr[i++] = sc.id;
    }
    if(sc.menuId){
        query+= ' and p.menu_id=?';
        paramArr[i++] = sc.menuId;
    }
    query += 'order by p.display_order,p.name ';

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' searchBizProd ')
        return callback(error,rows);
    })
}

function addBizProdType(type,callback){
    var query = "insert into prod_type(biz_id,name,name_lang,display_order,menu_id) values(?,?,?,?,?)" ;

    //Set mysql query parameters array
    var paramArr = [] , i = 0;
    paramArr[i++] = type.bizId;
    paramArr[i++] = type.name;
    paramArr[i++] = type.name_lang;
    paramArr[i++] = type.display_order;
    paramArr[i] = type.menu_id ? type.menu_id:null;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' searchBizProd ')
        return callback(error,rows);
    })
}

function updateBizProdType(param ,callback){
    var query = "update prod_type set name = ? ,name_lang= ? ,display_order= ? ,menu_id= ? where type_id =? and biz_id = ? " ;

    //Set mysql query parameters array
    var paramArr = [] , i = 0;
    paramArr[i++] = param.name;
    paramArr[i++] = param.name_lang;
    paramArr[i++] = param.display_order;
    paramArr[i++] = param.menu_id ? param.menu_id:null;
    paramArr[i++] = param.typeId;
    paramArr[i] = param.bizId;


    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateBizProdType ')
        return callback(error,rows);
    })
}

function delBizProdType(param ,callback){
    var query='delete FROM prod_type where biz_id=? and type_id=?;'
    var paramArr = [] , i = 0;
    paramArr[i++] = param.bizId;
    paramArr[i] = param.typeId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' delBizProdType ')
        return callback(error,rows);
    })

}

function updateTypeOrderById(param ,callback){
    var query = "update prod_type set display_order= ? where type_id =? ";
    var paramArr = [] , i = 0;
    paramArr[i++] = param.displayOrder;
    paramArr[i] = param.typeId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateTypeOrderById ')
        return callback(error,rows);
    })
}

module.exports = {
    searchBizProdType: searchBizProdType,
    addBizProdType : addBizProdType ,
    updateBizProdType : updateBizProdType,
    delBizProdType : delBizProdType,
    updateTypeOrderById : updateTypeOrderById
};