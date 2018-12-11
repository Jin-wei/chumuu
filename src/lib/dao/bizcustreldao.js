var db=require('./../db.js');
var util=require('./../util/distance.js');

var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('BizCustRelDao.js');


function searchBizCust(bizId,sc,callback){
	var query=' SELECT cust.customer_id,cust.username,cust.first_name, cust.avatar,cust.last_name,cust.email,cust.phone_no,cust.created_on,cust.address, ' +
        ' cust.updated_on,rel.total_points_earned,rel.total_points_redempted,(rel.total_points_earned-rel.total_points_redempted)' +
        ' points_balance,rel.loyalty_level,rel.created_on rel_created_on,rel.updated_on rel_updated_on, rel.active rel_active , rel.comment' +
        ' FROM customer cust,biz_customer_rel rel ' +
        ' where cust.customer_id=rel.cust_id and rel.biz_id=? ';
	var params=[],i=0;
	params[i]=bizId;
	if (sc.rel_active){
		query+=' and rel.active=?'
		params[++i]=sc.rel_active
	}
    db.dbQuery(query,params,function(error,rows){
        logger.debug(' searchBizCust ')
        return callback(error,rows);
    })
}

function searchBizCustAct(bizId,sc,callback){
	var query='SELECT cust.customer_id,cust.username,cust.first_name, cust.last_name,cust.avatar,a.activity_id, a.points_earned, p.activity_type, a.created_on ' +
        'FROM customer cust, biz_customer_rel rel, bc_activity a, point p ' +
        'where cust.customer_id=rel.cust_id and a.relation_id=rel.relation_id  and a.point_id=p.point_id and rel.biz_id=?';
	var params=[],i=0;
	params[i]=bizId;
	if (sc.rel_active){
		query+=' and rel.active=?'
		params[++i]=sc.rel_active
	}
	if (sc.cust_id){
		query+=' and cust.customer_id=?'
		params[++i]=sc.cust_id
	}

    db.dbQuery(query,params,function(error,rows){
        logger.debug(' searchBizCustAct ')
        return callback(error,rows);
    })
}

function searchCustBiz(custId,sc,callback){
	var query='SELECT biz.biz_id, biz.name,biz.name_lang, biz.address, biz.city, biz.state,biz.zipcode, biz.latitude, biz.longitude, biz.phone_no, biz.owner_name, ' +
			'biz.opened_date, biz.category, biz.note,biz.order_status ,rel.total_points_earned,rel.total_points_redempted,(rel.total_points_earned-rel.total_points_redempted) points_balance,' +
			'rel.loyalty_level,'+
	        'rel.created_on rel_created_on,rel.updated_on rel_updated_on, tc.c to_coupon_count ' +
	        'FROM biz_customer_rel rel,business biz left join (select count(coupon_id) c, biz_id,to_cust_id from coupon where to_cust_id=? group by biz_id, to_cust_id) tc on biz.biz_id=tc.biz_id ' +
	        'where biz.biz_id=rel.biz_id and rel.cust_id=? ';
	var params=[],i=0;
	params[i++]=custId;
	params[i++]=custId;
	if (sc.rel_active){
		query+=' and rel.active=?'
		params[i++]=sc.rel_active
	}
	//console.log('query=='+query);

    db.dbQuery(query,params,function(error,rows){
        logger.debug(' searchCustBiz ')
        if (rows && rows.length>0 && sc.longitude && sc.latitude){
            for (i=0;i<rows.length;i++){
                rows[i].distance=util.getDistance(sc.latitude, sc.longitude,rows[i].latitude, rows[i].longitude);
            }
        }
        return callback(error,rows);
    })
}

function addBizCustRelIfNot(options, callback){
	console.log('----biz cust rel---')
	console.dir(options);
	var checkQuery="select relation_id, active from biz_customer_rel where biz_id=? and cust_id=?";
	var updateQuery="update biz_customer_rel set active =true where biz_id=? and cust_id=?";
    var query='insert into biz_customer_rel(biz_id,cust_id) values(?,?);'
	/*db.getCon(function (err,con){
		con.query(checkQuery,[options.biz_id,options.cust_id],function(error,rows,fields){
			if (rows && rows.length>0){
				if (! rows[0].active){
					con.query(updateQuery,[options.biz_id,options.cust_id],function(error,result){
						if (error){
							con.rollback();
						}
					});
				}
				con.release();
                return callback(error,rows[0].relation_id);
			}else{
				con.query(query, [options.biz_id,options.cust_id],function (error, result) {
				console.log('error========');
				console.dir(error);
				if (error){
					con.rollback();
				}
				con.release();
				console.dir(result);
                return callback(error,(result?result.insertId:null));
				});
			}
		});
	})*/
    db.dbQuery(checkQuery,[options.biz_id,options.cust_id],function(error,rows){
        logger.debug(' addBizCustRelIfNot ') ;
        if (rows && rows.length>0){
            if (! rows[0].active){
                db.dbQuery(updateQuery,[options.biz_id,options.cust_id],function(error,result){

                });
            }
            return callback(error,rows[0].relation_id);
        }else{
            db.dbQuery(query, [options.biz_id,options.cust_id],function (error, result) {
                return callback(error,(result?result.insertId:null));
            });
        }
    })
}

function updateBizCustRel(options,callback){
	//INSERT INTO `biz_customer_rel` (`relation_id`,`biz_id`,`cust_id`,`date_acquired`,`total_points_earned`,`total_points_redempted`,`loyalty_level`,`active`,`last_update`)
	var query='update biz_customer_rel set total_points_earned=?, total_points_redempted=?, loyalty_level=? where biz_id=? and cust_id=?;'
	db.dbQuery(query, [options.total_points_earned,options.total_points_redempted,options.loyalty_level,options.bizId,options.custId],function (error, result) {
        logger.debug(' updateBizCustRel ') ;
        return callback(error,result);
		});

}

function inactiveBizCustRel(options,callback){
	var query='update biz_customer_rel set active=0 where biz_id=? and cust_id=?;'

    db.dbQuery(query,[options.biz_id,options.cust_id],function(error,rows){
        logger.debug(' inactiveBizCustRel ')
        return callback(error,rows);
    })
}

function delBizCustRel(options,callback){
	var query='delete from biz_customer_rel where biz_id=? and cust_id=?;'

    db.dbQuery(query,[options.biz_id,options.cust_id],function(error,rows){
        logger.debug(' delBizCustRel ')
        return callback(error,rows);
    })
}

function getActiveBizCustRel(options,callback){
	var query='SELECT * FROM biz_customer_rel where biz_id=? and cust_id=? and active=1';

    db.dbQuery(query, [options.biz_id,options.cust_id] ,function(error,rows){
        logger.debug(' getActiveBizCustRel ');
        if (rows && rows.length>0){
            return callback(error,rows[0]);
        }else{
            return callback(error,null);
        }
    })
}


function updateBizCustRel(options, callback){
	//INSERT INTO `biz_customer_rel` (`relation_id`,`biz_id`,`cust_id`,`date_acquired`,`total_points_earned`,`total_points_redempted`,`loyalty_level`,`active`,`last_update`)
	var query='update biz_customer_rel set total_points_earned=?, total_points_redempted=?, loyalty_level=? where biz_id=? and cust_id=?;'
	db.dbQuery(query, [options.total_points_earned,options.total_points_redempted,options.loyalty_level,options.biz_id,options.cust_id] ,function(error,rows){
        logger.debug(' updateBizCustRel ');
        return callback(error,rows);

    })
}
function getCustomerCount(params , callback){
    //var query = "select count(1) customerCount from biz_customer_rel where active = 1 and biz_id = ?";
    var query ="select pcr.customer_id cust_id from product_customer_rel pcr where pcr.product_id " +
        " in(select prod_id from product where biz_id =?) " +
        " union (select bcr.cust_id cust_id FROM biz_customer_rel bcr where bcr.active=1 and bcr.favorite=1 and bcr.biz_id =?) "
    var paramArr = [], i = 0;
    paramArr[i++]=params.bizId;
    paramArr[i]=params.bizId;

    db.dbQuery(query, paramArr ,function(error,rows){
        logger.debug(' getCustomerCount ');
        return callback(error,rows);

    })
}

function saveFavoriteBiz(params,callback){
    var checkQuery="select relation_id, active from biz_customer_rel where biz_id=? and cust_id=?";
    var updateQuery="update biz_customer_rel set favorite=? where biz_id=? and cust_id=?   ";
    var query='insert into biz_customer_rel(favorite,biz_id,cust_id) values(?,?,?);'
    var paramArr = [];
    var i =0;
    paramArr[i++] = params.favorite;
    paramArr[i++] = params.bizId;
    paramArr[i] = params.custId;



    db.dbQuery(checkQuery,[params.bizId,params.custId] ,function(error,rows){
        logger.debug(' getCustomerCount ');
        if (rows && rows.length>0){

            db.dbQuery(updateQuery,paramArr,function(error,result){
                if (!error){
                    result.favorite = params.favorite;
                }
                return callback(error,result);
            });


        }else{
            db.dbQuery(query, paramArr,function (error, result) {

                if (!error){
                    result.favorite = params.favorite;
                }return callback(error,result);
            });
        }

    })
}

function getFavoriteBiz(params ,callback){
    var query='select b.*  ' +
        'from business b left join biz_customer_rel bcr on b.biz_id = bcr.biz_id ' +
        'where  bcr.cust_id = ? and bcr.favorite =1 '
    var paramArr = [];
    var i = 0;
    paramArr[i++] = params.custId;
    if(params.bizId != null){
        query = query + " and bcr.biz_id =? ";
        paramArr[i] = params.bizId;
    }
    db.dbQuery(query, paramArr ,function(error,rows){
        logger.debug(' getFavoriteBiz ');
        return callback(error,rows);

    })
}

function queryBizFavorCust(params,callback){
    var query = "select pcr.*,c.username,c.last_name,c.first_name,c.email,c.phone_no,c.last_login_date,c.city,c.state,c.gender   " +
        " from  product_customer_rel pcr left join customer c on pcr.customer_id=c.customer_id where pcr.product_id in( " +
        " select p.prod_id from product p left join business b on p.biz_id=b.biz_id where b.biz_id = ?) order by pcr.product_id";
    var paramArr = [], i = 0;
    paramArr[i++] = params.bizId;
    if(params.start != null && params.size != null){
        paramArr[i++]= Number(params.start);
        paramArr[i]= Number(params.size);
        query = query + " limit ?, ? ";
    }
    db.dbQuery(query, paramArr ,function(error,rows){
        logger.debug(' queryBizFavorCust ');
        return callback(error,rows);

    })
}

function updateBizCustComment(params,callback){
    var query = "update biz_customer_rel set comment = ? where biz_id =? and cust_id = ? ";
    var paramArr = [], i = 0;
    paramArr[i++] = params.comment;
    paramArr[i++] = params.bizId;
    paramArr[i] = params.custId;
    db.dbQuery(query, paramArr ,function(error,rows){
        logger.debug(' updateBizCustComment ');
        return callback(error,rows);

    });
}

function queryBizCustRel(params,callback){
    var query = ' SELECT cust.customer_id,cust.username,cust.first_name, cust.last_name,cust.email,cust.phone_no,cust.created_on,cust.address,cust.avatar, ' +
        ' cust.updated_on,rel.total_points_earned,rel.total_points_redempted,(rel.total_points_earned-rel.total_points_redempted)' +
        ' points_balance,rel.loyalty_level,rel.created_on rel_created_on,rel.updated_on rel_updated_on, rel.active rel_active , rel.comment' +
        ' FROM customer cust,biz_customer_rel rel ' +
        ' where cust.customer_id=rel.cust_id and rel.biz_id=? ';
    var paramArr=[],i=0;
    paramArr[i++]=params.bizId;
    if (params.custId){
        query+=' and rel.cust_id=? ';
        paramArr[i++]=params.custId;
    }
    if (params.active){
        query+=' and rel.active=? ';
        paramArr[i]=params.active;
    }
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' queryBizCustRel ');
        return callback(error,rows);
    });

}





///--- Exports

module.exports = {
    searchBizCust: searchBizCust,
    searchCustBiz: searchCustBiz,
    searchBizCustAct : searchBizCustAct,
    addBizCustRelIfNot:addBizCustRelIfNot,
    inactiveBizCustRel:inactiveBizCustRel,
    delBizCustRel:delBizCustRel,
    getActiveBizCustRel:getActiveBizCustRel,
    updateBizCustRel:updateBizCustRel,
    getCustomerCount : getCustomerCount,
    saveFavoriteBiz : saveFavoriteBiz,
    getFavoriteBiz : getFavoriteBiz,
    queryBizFavorCust : queryBizFavorCust ,
    updateBizCustComment : updateBizCustComment,
    queryBizCustRel : queryBizCustRel
};