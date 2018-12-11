var db = require('./../db.js');
var Seq = require('seq');

var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('BizCustActDao.js');

// move to database
var points = {
	"1001" : 1,
	"1002" : 20,
	"1003" : 5,
	"1004" : 0
};

function addAct(act, callback) {
	var rel_id = act.rel_id;
	var biz_id = act.biz_id;
	var cust_id = act.cust_id;
	var point_id = act.point_id;
	var point;
	var query;
	var activity_id;

	point = points[point_id];
	if (act.point) {
		point = act.point;
	}
	Seq().seq(function() {
		// find rel_id from db
		var that = this;
		if (!rel_id) {
			query = "select relation_id from biz_customer_rel where biz_id=? and cust_id=?";
			/*db.getCon(function(err, con) {
						con.query(query, [biz_id, cust_id], function(error,
										rows, fields) {
									con.release();
									if (error) {
                                        return callback(error);
									}
									rel_id = rows[0].relation_id;
									that();
								});
					});*/
            db.dbQuery(query, [biz_id, cust_id],function(error,rows){
                logger.debug(' addAct ')
                if (error) {
                    return callback(error);
                }
                rel_id = rows[0].relation_id;
                that();
            })
		}else{
			that();
		}
	}).seq(function() {
		var that = this;
		if (!biz_id || !cust_id) {
			query = "select biz_id, cust_id from biz_customer_rel where relation_id=?";
			/*db.getCon(function(err, con) {
						con.query(query, [rel_id],
								function(error, rows, fields) {
									con.release();
									if (error) {
										callback(error);
									}
									biz_id = rows[0].biz_id;
									cust_id = rows[0].cust_id;
									that();
								});
					});*/
            db.dbQuery(query, [rel_id],function(error,rows){
                logger.debug(' addAct ')
                if (error) {
                    callback(error);
                }
                biz_id = rows[0].biz_id;
                cust_id = rows[0].cust_id;
                that();
            })
		}else{
			that();
		}
	}).seq(function() {
		query = 'insert into bc_activity(point_id, relation_id,points_earned) values (?,?,?)';
		var that = this;
		/*db.getCon(function(err, con) {
					con.query(query, [point_id, rel_id, point], function(error,
									result) {
								con.release();
								if (error) {
									callback(error);
								}
								activity_id = result.insertId;
								that();
							});
				});*/
            db.dbQuery(query, [point_id, rel_id, point],function(error,rows){
                logger.debug(' addAct ')
                if (error) {
                    callback(error);
                }
                activity_id = result.insertId;
                that();
            })
	}).seq(function() {
		var that = this;
		// add point to biz cust relationship
		if (point > 0) {
			query = 'update biz_customer_rel set total_points_earned=total_points_earned+'+point +' where relation_id=?';

		} else {
			query = 'update biz_customer_rel set total_points_redempted=total_points_redempted+'+(-1*point)+' where relation_id=?';

		}
		/*db.getCon(function(err, con) {
					con.query(query,[rel_id], function(error, result) {
								if (error) {
									callback(error);
								}
								con.release();
								that();
							});
				});*/
        db.dbQuery(query,[rel_id],function(error,rows){
            logger.debug(' addAct ')
            if (error) {
                callback(error);
            }
            that();
        })
	}).seq(function() {
		var that=this;
		// add point to this customer

		// add point to biz cust relationship
		if (point > 0) {

			query = 'update customer set total_points_earned=total_points_earned+'+point+' where customer_id=?';
		} else {

			query = 'update customer set total_points_redempted=total_points_redempted+'+(-1*point)+' where customer_id=?';
			
			
		}
			/*db.getCon(function(err, con) {
						if (err) {
                            return callback(err ,null) ;
						}
						con.query(query, [cust_id],function(error, result) {
									con.release();
									that();
								});
					});*/
            db.dbQuery(query,[cust_id],function(error,rows){
                logger.debug(' addAct ')
                if (error) {
                    callback(error);
                }
                that();
            })

	}).seq(function() {
            return callback(null, activity_id);
			});

}

///--- Exports

module.exports = {
	addAct : addAct
};