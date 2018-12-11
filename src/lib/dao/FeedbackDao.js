/**
 * Created by ibm on 14-8-8.
 */


var db=require('./../db.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('FeedBackDao.js');
function addFeedback(params,callback){
    var query='insert into feedback(cust_id,contact_email,contact_phone,content) values(?,?,?,?);'
    var paramArray=[],i=0;
    paramArray[i++]=params.custId;
    paramArray[i++]=params.contactEmail;
    paramArray[i++]=params.contactPhone;
    paramArray[i]=params.content;

    db.dbQuery(query,paramArray,function(error,rows){
        logger.debug(' addFeedback ')
        return callback(error,rows);
    });
}

function queryFeedback(params,callback){
    var query='select * from feedback order by level,create_time desc ';
    var paramArray=[],i=0;
    //slice page
    if(params.start != null && params.size != null){
        query = query + "  limit ?,? ";
        paramArray[i++]= parseInt(params.start);
        paramArray[i]= parseInt(params.size);
    }

    db.dbQuery(query,paramArray,function(error,rows){
        logger.debug(' queryFeedback ')
        return callback(error,rows);
    });

}

module.exports = {
    addFeedback : addFeedback,
    queryFeedback : queryFeedback
}