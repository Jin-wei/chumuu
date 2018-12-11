/**
 * Created by ling xue on 14-11-4.
 */
var db=require('./../db.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('TableDao.js');

function addBizTable(params,callback){
    var query ="insert into biz_table (biz_id,name,remark,table_type,seats,pass) " +
        " values(? , ? , ? , ? , ? ,?) " ;
    var paramArr = [], i = 0;
    paramArr[i++] = params.bizId;
    paramArr[i++] = params.name;
    paramArr[i++] = params.remark;
    paramArr[i++] = params.tableType;
    paramArr[i++] = params.seats;
    paramArr[i] = params.pass;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addBizTable ');
        return callback(error,rows);
    });
}

function updateBizTableInfo(params,callback){
    var query ="update biz_table set name = ? ,remark = ? ,table_type = ? , seats = ? where id = ? and biz_id = ? "
    var paramArr = [], i = 0;

    paramArr[i++] = params.name;
    paramArr[i++] = params.remark;
    paramArr[i++] = params.tableType;
    paramArr[i++] = params.seats;
    paramArr[i++] = params.tableId;
    paramArr[i] = params.bizId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateBizTableInfo ');
        return callback(error,rows);
    });
}

function updateBizTableStatus(params,callback){
    var query ="update biz_table set status = ? where id = ? and biz_id = ? "
    var paramArr = [], i = 0;

    paramArr[i++] = params.status;
    paramArr[i++] = params.tableId;
    paramArr[i] = params.bizId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateBizTableStatus ');
        return callback(error,rows);
    });

}

function updateBizAllTableStatus(params,callback){
    var query ="update biz_table set status = ? where biz_id = ? "
    var paramArr = [], i = 0;

    paramArr[i++] = params.status;
    paramArr[i] = params.bizId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateBizAllTableStatus ');
        return callback(error,rows);
    });
}

function deleteBizTable(params,callback){

    var query ="delete from biz_table where id= ?  and biz_id= ? "
    var paramArr = [], i = 0;

    paramArr[i++] = params.tableId;
    paramArr[i] = params.bizId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' deleteBizTable ');
        return callback(error,rows);
    });

}

function queryBizTable(params,callback){
    var query ="select bt.id, bt.biz_id,bt.name,bt.remark,bt.table_type,bt.seats,bt.status," +
        " bt.update_on,bt.create_on ,lov.status_info,q.code qrcode, q.seq_id qr_seq_id " +
        " from biz_table bt " +
        " left join lov on bt.status = lov.id " +
        " left join table_qrcode q on bt.id = q.table_id" +
        " where bt.biz_id = ? "
    var paramArr = [], i = 0;

    paramArr[i++] = params.bizId;

    if(params.tableId){
        query = query + " and bt.id = ? "
        paramArr[i++] = params.tableId;
    }
    if(params.status){
        query = query + " and status = ? "
        paramArr[i++] = params.status
    }
    if(params.sortBy){
        query = query + " order by " + params.sortBy ;
    }else{
        query = query + " order by  name ";
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' queryBizTable ');
        return callback(error,rows);
    });
}

function queryAllTables(sc,callback){
    var query ="select bt.id, bt.biz_id,bt.name,bt.remark,bt.table_type,bt.seats,bt.status," +
        " bt.update_on,bt.create_on ,lov.status_info statusName," +
        " lov1.status_info typeName,b.name bizName,b.city,b.state,b.latitude, b.longitude,b.active biz_active " +
        " from business b, biz_table bt left join lov on bt.status = lov.id left join lov lov1 on bt.table_type = lov1.id " +
        " where b.biz_id=bt.biz_id order by bt.id "
    var paramArr = [], i = 0;

    if(sc.start!=null && sc.size){
        query += " limit ? , ? " ;
        paramArr[i++] = parseInt(sc.start) ;
        paramArr[i++] = parseInt(sc.size);
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' queryBizTable ');
        return callback(error,rows);
    });
}
function getTableNameByQ(code,callback){
    var query ="select bt.name,bt.id,bt.status from biz_table bt,table_qrcode tq where bt.id=tq.table_id and tq.code=? ";
    var paramArr = [], i = 0;
    paramArr[i] = code ;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getTableNameByQ ');
        return callback(error,rows);
    });
}
module.exports = {
    addBizTable : addBizTable ,
    updateBizTableInfo : updateBizTableInfo ,
    updateBizTableStatus : updateBizTableStatus ,
    deleteBizTable : deleteBizTable ,
    queryBizTable : queryBizTable ,
    updateBizAllTableStatus : updateBizAllTableStatus,
    queryAllTables:queryAllTables,
    getTableNameByQ:getTableNameByQ
}
