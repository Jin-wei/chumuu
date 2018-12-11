/**
 * Created by ibm on 15-1-16.
 */


var db=require('./../db.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('bizTaxDao.js');

function  addTax(params,callback){
    var query='insert into biz_state_tax(state,city,tax_rate) values(?,?,?);'
    var paramArray=[],i=0;
    paramArray[i++]=params.state;
    paramArray[i++]=params.city;
    paramArray[i]=params.taxRate;

    db.dbQuery(query,paramArray,function(error,rows){
        logger.debug(' addTax ')
        return callback(error,rows);
    });
}

function updateTax(params,callback){
    var query='update biz_state_tax set tax_rate = ? where state=? and city = ?';
    var paramArray=[],i=0;

    paramArray[i++]=params.taxRate;
    paramArray[i++]=params.state;
    paramArray[i]=params.city;

    db.dbQuery(query,paramArray,function(error,rows){
        logger.debug(' updateTax ')
        return callback(error,rows);
    });
}

function deleteTax(params,callback){
    var query='delete from biz_state_tax where id = ?';
    var paramArray=[],i=0;
    paramArray[i]=params.taxId;

    db.dbQuery(query,paramArray,function(error,rows){
        logger.debug(' deleteTax ')
        return callback(error,rows);
    });
}

function queryTax(params,callback){
    var query='select * from biz_state_tax where state = ? and city = ? ';
    var paramArray=[],i=0;
    if(params.state || params.city || params.taxId){
        query = query + " where ";
    }
    if(params.state){
        query = query + " state = ?" ;
        paramArray[i++]=params.state;
    }
    if(params.city){
        query = query + " state = ?" ;
        paramArray[i]=params.city;
    }
    if(params.taxId){
        query = query + " id = ?" ;
        paramArray[i]=params.taxId;
    }

    paramArray[i]=params.city;

    db.dbQuery(query,paramArray,function(error,rows){
        logger.debug(' queryTax ')
        return callback(error,rows);
    });
}

module.exports = {
    addTax : addTax,
    updateTax : updateTax,
    deleteTax : deleteTax,
    queryTax : queryTax

}