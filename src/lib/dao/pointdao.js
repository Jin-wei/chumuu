var db=require('./../db.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('PointDao.js');

function search(sc,callback){
	var query='SELECT * FROM point';
	var i=0,params=[];
	var where=' where ';
	if (sc.point_id){
		where+=' point_id=? ';
		params[i++]=sc.point_id;
	}
	if (params.length>0){
		query+=where;
	}

    db.dbQuery(query,params,function(error,rows){
        logger.debug(' search ')
        return callback(error,rows);
    });
}

function findById(pointId,callback){
		search({point_id:pointId},callback);
}

///--- Exports

module.exports = {
    search: search,
    findById: findById
};