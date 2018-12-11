/**
 * Created by ling xue on 14-11-4.
 */
var db=require('./../db.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('TableQrcodeDao.js');
var randomString = require('random-string');
var Seq = require('seq');

function linkBizTable(params,callback){
    var query="";
    var paramArr = [], i = 0;
    console.dir(params);
    if (params.seqId==null) {
        //find the next available one
        query = "update table_qrcode t inner join (select min(seq_id) as nId from table_qrcode where table_id is null) a " +
            "set t.table_id=? where t.seq_id=a.nId ";
        paramArr[i++] = params.tableId;
    }else{
        query = "update table_qrcode t set t.table_id=? where t.seq_id=? ";
        paramArr[i++] = params.tableId;
        paramArr[i++] = params.seqId;
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' linkBizTable ');
        if (error){
            callback(error,false);
        }else if (rows.affectedRows==1){
            callback(null,true);
        }else{
            callback("linkBizTable failed, may run out of qr code",false);
        }
    });
}

function unlinkBizTable(params,callback){
    var query ="update table_qrcode t set t.table_id=null where t.table_id=? ";
    var paramArr = [], i = 0;
    paramArr[i++] = params.tableId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' unlinkBizTable ');
        if (error){
            callback(error,false);
        }else if (rows.affectedRows==1){
            callback(null,true);
        }else{
            logger.debug(' table not found in qr code table ');
            callback(null,true);
        }
    });
}

function _getMaxSeqId(params,callback){
    var query ="select max(seq_id) maxSeq from table_qrcode";
    db.dbQuery(query,null,function(error,rows){
        if (error){
            logger.error('_getMaxSeqId '+error.message);
            return callback(error);
        }else {
            if (rows.length > 0) {
                logger.debug(' next seq id ' + rows[0].maxSeq);
                return callback(null, rows[0].maxSeq);
            }else{
                logger.debug(' next seq id ' + 0);
                return callback(null, 0);
            }
        }
    });
}

function generateInBatch(params,callback){
    var query ="insert into table_qrcode (seq_id,code) values(?,?)";
    var size=params.batchSize, i,id=0,paramArr=[],code,seqArr=[];
    if (size>0) {
        _getMaxSeqId(null, function (error, data) {
            if (error) {
                logger.error('generateInBatch ' + error.message);
                return callback(error);
            } else {
                id=data;
                for (i=0;i<size;i++) {
                    seqArr[i]=++id;
                }
                Seq(seqArr).seqEach(function(seqId){
                    var that=this;
                    code = randomString({
                        length: 32,
                        numeric: false,
                        letters: true,
                        special: false
                    });
                    paramArr[0]=seqId;
                    paramArr[1]=seqId+code;
                    db.dbQuery(query,paramArr,function(error,rows){
                        if (error) {
                            logger.error(' generateInBatch ' + error.message);
                            return callback(error,rows);
                        }else{
                            that();
                        }
                    });
                }).seq(function(){ return callback();})
            }
        })
    }
}


function queryTableQr(params,callback){
    var query ="select q.seq_id,q.code,q.table_id,t.name table_name,b.name biz_name " +
        " from table_qrcode q left join biz_table t on q.table_id = t.id left join business b on t.biz_id=b.biz_id where 1=1";
    var paramArr = [], i = 0;

    if(params.code){
        query = query + " and q.code like ? "
        paramArr[i++] = '%'+params.code+'%';
    }
    if(params.biz_name){
        query = query + " and b.name like ? "
        paramArr[i++] = '%'+params.biz_name+'%';
    }

    if (params.inUse && params.inUse==1){
        query = query + " and q.table_id is not null "
    }

    if (params.inUse!=null && params.inUse==0){
        query = query + " and q.table_id is null "
    }

    if (params.startSeq && (!isNaN(params.startSeq))){
        query = query + " and q.seq_id>=? "
        paramArr[i++] = Number(params.startSeq);
    }

    if (params.endSeq && (!isNaN(params.endSeq))){
        query = query + " and q.seq_id<=? "
        paramArr[i++] = Number(params.endSeq);
    }

    if(params.sortBy){
        query = query + " order by " + params.sortBy ;
    }else{
        query = query + " order by  seq_id ";
    }

    if(params.start!=null && params.size!=null){
        paramArr[i++] = parseInt(params.start);
        paramArr[i++] = parseInt(params.size);
        query = query + " limit ?,? "
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' queryTableQr ');
        return callback(error,rows);
    });
}

function queryTableUserInfo(params,callback){
    var query ="select t.id,t.pass " +
        " from table_qrcode q, biz_table t where q.table_id = t.id ";
    var paramArr = [], i = 0;

    if(params.code){
        query = query + " and q.code = ? "
        paramArr[i++] = params.code;
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' queryTableUserInfo ');
        return callback(error,rows);
    });
}

function queryUnusedTableQr(params,callback){
    var query ="select q.seq_id,q.code from table_qrcode q where q.table_id is null order by q.seq_id";

    if(params.start!=null && params.size!=null){
        paramArr[i++] = parseInt(params.start);
        paramArr[i++] = parseInt(params.size);
        query = query + " limit ?,? "
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' queryUnusedTableQr ');
        return callback(error,rows);
    });
}

module.exports = {
    queryTableQr : queryTableQr ,
    generateInBatch : generateInBatch,
    linkBizTable : linkBizTable,
    unlinkBizTable : unlinkBizTable,
    queryTableUserInfo:queryTableUserInfo,
    queryUnusedTableQr:queryUnusedTableQr
}
