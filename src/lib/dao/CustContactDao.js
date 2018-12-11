/**
 * Created by ling xue on 15-6-10.
 */

var db=require('./../db.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('CustContactDao.js');

function addCustContact(params,callback){
    var query = " insert into customer_contact (cust_id,receiver,phone,address,zipcode) values (?,?,?,?,?) " ;
    var paramArray=[],i=0;
    paramArray[i++] = params.custId;
    paramArray[i++] = params.receiver;
    paramArray[i++] = params.phone;
    paramArray[i++] = params.address;
    paramArray[i] = params.zipcode;

    db.dbQuery(query, paramArray ,function(error,rows){
        logger.debug(' addCustContact ');
        return callback(error,rows);
    });
}

function updateCustContact(params,callback){
    var query = " update customer_contact set receiver=?,phone=? ,address=? , zipcode=?  where cust_id = ? and id = ? " ;
    var paramArray=[],i=0;
    paramArray[i++] = params.receiver;
    paramArray[i++] = params.phone;
    paramArray[i++] = params.address;
    paramArray[i++] = params.zipcode;
    paramArray[i++] = params.custId;
    paramArray[i] = params.contactId;

    db.dbQuery(query, paramArray ,function(error,rows){
        logger.debug(' updateCustContact ');
        return callback(error,rows);
    });

}

function getCustContact(params,callback){
    var query = " select * from customer_contact  where cust_id = ?  " ;
    var paramArray=[],i=0;
    paramArray[i++] = params.custId;
    if(params.contactId){
        query = query + " and id = ? "
        paramArray[i] = params.contactId;
    }

    db.dbQuery(query, paramArray ,function(error,rows){
        logger.debug(' getCustContact ');
        return callback(error,rows);
    });
}

function delCustomContact(params,callback){
    var query = " delete from customer_contact  where cust_id = ? and id = ? " ;
    var paramArray=[],i=0;
    paramArray[i++] = params.custId;
    paramArray[i] = params.contactId;

    db.dbQuery(query, paramArray ,function(error,rows){
        logger.debug(' delCustomContact ');
        return callback(error,rows);
    });
}

module.exports = {
    addCustContact: addCustContact,
    updateCustContact : updateCustContact,
    getCustContact : getCustContact ,
    delCustomContact : delCustomContact
}