var db=require('./../db.js');
var Seq = require('seq');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('CustDao.js');

function search(sc,callback){
    //special biz customer will have a biz_id
	var query="SELECT customer_id, username,password,first_name,last_name,email,phone_no,total_points_earned,total_points_redempted," +
	   		"tryit_level,active,created_on,updated_on,address,city,state,zipcode,avatar,biz_id FROM customer";
	var params=[],i=0;
	var where="";
	if (sc && sc.email){
		where+=" email=?";
		params[i++]=sc.email;
	}
	if (sc && sc.customer_id){
		if (i>0){
			where+=" and ";
		}
		where+=" customer_id=?";
		params[i++]=sc.customer_id;
	}
    if(sc && sc.openId){
        where+= " wechat_id = ? ";
        params[i++] = sc.openId;
    }
	if (where.length>0){
		query+=' where '+where;
	}

    db.dbQuery(query,params,function(error,rows){
        logger.debug(' search ')
        return callback(error,rows);
    })
}

function getCustomerBaseInfo(params, callback) {
    var query = "select customer.username ,customer.email, customer.phone_no,customer.address,customer.city," +
        "customer.state,customer.zipcode,customer.avatar,customer.wechat_id,customer.biz_id,customer.table_id," +
        "customer.total_points_earned ,customer.customer_id ,customer.first_name,customer.last_name,customer.fb_id," +
        " count(distinct(biz_customer_rel.relation_id)) as bizCount " +
        "    from customer left join biz_customer_rel on customer.customer_id = biz_customer_rel.cust_id" +
        "    where customer.customer_id = ?"


    //Set mysql query parameters array
    var paramArr = [], i = 0;
    paramArr[i++] = params.customerId;


    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getCustomerBaseInfo ')
        return callback(error,rows);
    })
}

function updateProfile(params,callback){
	var query='update customer set username=?, first_name=?, last_name=?, phone_no=?, gender=?, address=? ,city=? ,' +
        ' state=? ,zipcode=? where customer_id=? ';
	//console.log('-------here-----------');
	//console.dir([cust.first_name,cust.last_name,cust.phone_no,cust.email,cust.password, cust.cust_id]);
    var paramArr = [], i = 0;
    paramArr[i++] = params.username;
    paramArr[i++] = params.firstName;
    paramArr[i++] = params.lastName;
    paramArr[i++] = params.phoneNo;
    paramArr[i++] = params.gender;
    paramArr[i++] = params.address;
    paramArr[i++] = params.city;
    paramArr[i++] = params.state;
    paramArr[i++] = params.zipcode;
    paramArr[i] = params.custId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateProfile ');
        return callback(error,rows);
    })
}

function updatePassword(cust,callback){
	var query='update customer set password=? where';
    
    var paramArray=[],i=0;
    paramArray[i++]=cust.password;
    if(cust.cust_id){
        query = query + " customer_id = ? "
        paramArray[i++]=cust.cust_id;
    }else {
        query = query + " phone_no = ? "
        paramArray[i++]=cust.phone;
    }

    db.dbQuery(query,paramArray,function(error,rows){
        logger.debug(' updatePassword ');
        return callback(error,rows);
    });


    db.dbQuery(query,[cust.password,cust.cust_id],function(error,rows){
        logger.debug(' updatePassword ');
        return callback(error,rows);
    })
}

function create(cust,callback){
	var query='insert into customer(username,password,first_name,last_name,email,phone_no,tryit_level,active,' +
        'gender,fb_access_token,fb_id,biz_id,table_id) values(?,?,?,?,?,?,?,?,?,?,?,?,?);'


    db.dbQuery(query,[cust.username,cust.password,cust.first_name,cust.last_name,cust.email,cust.phone_no,
        cust.tryit_level,cust.active,cust.gender,cust.fb_access_token,cust.fb_id,cust.biz_id,cust.table_id],function(error,rows){
        logger.debug(' create ');
        return callback(error,rows);
    })
}

/**
 * create customer or update customer ,return customer id by email.
 * The api use to coupon created only
 * @param email
 * @param callback
 */
function saveCustomerForCoupon(email ,callback){

    var rowsTemp ;
    Seq().seq(function(){
        var that = this;
        search({
            email : email
        }, function(error, rows) {
            if (error) {
                throw error;
            }else{
                rowsTemp = rows;
                that();
            }
        })
    }).seq(function(){
                if (!rowsTemp || rowsTemp.length <= 0) {
                    // cust not found create it, make this
                    // customer status to be inactive for now
                    create({
                        email : email,
                        tryit_level : 'Regular',
                        active : 0
                    }, function(error, data) {
                        if (error) {
                            throw error;
                        } else {
                            //coupon.to_cust_id = data;
                            return callback(null, data);
                            //that();
                        }
                    });

                } else {
                    //coupon.to_cust_id = rows[0].customer_id;
                    return callback(null,rowsTemp[0].customer_id);
                    //that();
                }
    })
}

function del(cust,callback){
	var query='delete from customer where ',params=[];
    var whereClause="",i=0;
	if (cust.cust_id){
        whereClause=whereClause+' customer_id=?'
		params[i++]=cust.cust_id;
	}
    if (cust.username){
        if (i>0){
            whereClause=whereClause+" and ";
        }
        whereClause=whereClause+' username=? '
		params[i++]=cust.username;
	}
    if (cust.tableId){
        if (i>0){
            whereClause=whereClause+" and ";
        }
        whereClause= whereClause+' table_id=?'
        params[i++]=cust.tableId;

    }
    if (cust.bizId) {
        if (i > 0) {
            whereClause = whereClause + " and ";
        }
        whereClause = whereClause + ' biz_id=?'
        params[i++]=cust.bizId;
    }

    db.dbQuery(query+whereClause,params,function(error,rows){
        logger.debug(' del customer '+query+whereClause);
        return callback(error,rows);
    })
}

function searchCust(params, callback) {
    var query = "SELECT * FROM customer where  customer_id is not null ";


    //Set mysql query parameters array
    var paramArr = [], i = 0;
    if(params.email){
        paramArr[i++] = params.email;
        query = query + " and email = ? "
    }
    if(params.phone){
        paramArr[i++] = params.phone;
        query = query + " and phone_no = ? "
    }

    if(params.custId){
        paramArr[i++] = params.custId;
        query = query + " and customer_id = ? "
    }

    /*if (params.custId) {
        query = query + ' customer_id=? '
        paramArr[i++] = params.custId;
    }  else if (params.email) {
        query = query + ' email=? ';

    }else {
        query = query + ' username=? '
        paramArr[i++] = params.userName;
    }*/

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' searchCust ');
        return callback(error,rows);
    })
}

function updateLastLoginDate(params, callback){
    var query = "update customer set last_login_date = CURRENT_TIMESTAMP, fb_access_token=? where customer_id = ?";
    var paramArr =[];
    paramArr[0]=params.fbAccessToken;
    paramArr[1]=params.customerId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateLastLoginDate ');
        return callback(error,rows);
    })
}

function setUserActive(params, callback){
    var query = "update customer set active = 1 where customer_id = ? ";
    var paramArr = [], i = 0;
    paramArr[i]=params.customerId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' setUserActive ');
        return callback(error,rows);
    })
}

function setUserAvatar(params, callback){
    //TODO add column in customer
    /*var query = "update customer set active = 1 where customer_id = ? ";
    var paramArr = [], i = 0;
    paramArr[i]=params.customerId;
    db.getCon(function (err, con) {
        con.query(query, paramArr, function (error, rows, fields) {
            con.release();
            return callback(error, rows);
        });
    });*/
}

function updateCustomerEmail(params,callback){
    var query = "update customer set email = ?  where customer_id = ? ";
    var paramArr = [], i = 0;
    paramArr[i++]=params.email;
    paramArr[i]=params.custId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateCustomerEmail ');
        return callback(error,rows);
    })
}

function updateCustAvatar(params,callback){
    var query = "update customer set avatar = ?  where customer_id = ? ";
    var paramArr = [], i = 0;
    paramArr[i++]=params.avatar;
    paramArr[i]=params.custId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateCustAvatar ');
        return callback(error,rows);
    })
}

function queryWechatUser(params,callback){
    var query = " select * from customer where wechat_id = ? ";
    var paramArr = [], i = 0;
    paramArr[i]=params.openId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' queryWechatUser ');
        return callback(error,rows);
    })
}

function addWehcatUser(params,callback){
    var query = "insert into customer (wechat_id) values (?)"
    var paramArr = [], i = 0;
    paramArr[i]=params.openId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addWehcatUser ');
        return callback(error,rows);
    })
}

function updateWechatUserStatus(params,callback){
    var query = " update customer set wechat_status = ? where wechat_id = ? ";
    var paramArr = [], i = 0;
    paramArr[i++]=params.wechatStatus;
    paramArr[i]=params.openId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateWechatUserStatus ');
        return callback(error,rows);
    })
}

function saveWechatUser(params,callback){
    var rowsTemp = [];
    Seq().seq(function(){
        var that = this;
        queryWechatUser(params, function(error, rows) {
            if (error) {
                return callback(error,null);
            }else{
                rowsTemp = rows;
                that();
            }
        })
    }).seq(function(){
            if (!rowsTemp || rowsTemp.length <= 0) {
                // cust not found create it, make this
                addWehcatUser(params,function(error,rows){
                    return callback(error,rows)
                });

            } else {
                // update wechat customer status to active
                params.wechatStatus = 1;
                updateWechatUserStatus(params,function(error,rows){
                    return callback(error,rows)
                })
            }
        })
}

function queryCustUser(params,callback){
    var query = " select * from customer where customer_id is not null";
    var paramArray=[],i=0;
    if(params.userId){
        query = query + " and id = ? "
        paramArray[i++]=params.userId;
    }
    if(params.phone){
        query = query + " and phone_no = ? "
        paramArray[i++]=params.phone;
    }
    if(params.startDate && params.endDate){
        paramArray[i++] = params.startDate;
        paramArray[i++] = params.endDate;
        query = query + " and created_on between ? and ? "
    }
    query = query +" order by customer_id desc ";
    if(params.start!=null && params.size!=null){
        paramArray[i++] = parseInt(params.start);
        paramArray[i++] = parseInt(params.size);
        query = query + " limit ? , ? "
    }
    db.dbQuery(query,paramArray,function(error,rows){
        logger.debug(' queryCustUser ');
        return callback(error,rows);
    });
}

function getTableQrcode(params,callback){
    var query = " select code from table_qrcode tq,customer c" +
        " where c.table_id=tq.table_id ";
    var paramArray=[],i=0;
    if(params.phone){
        query = query + " and c.phone_no = ? ";
        paramArray[i]=params.phone;
    }

    db.dbQuery(query,paramArray,function(error,rows){
        logger.debug(' queryCustUserTableQrCode ');
        return callback(error,rows);
    });
}
module.exports = {
    search: search,
    create: create,
    del:del,
    updateProfile: updateProfile,
    updatePassword: updatePassword,
    searchCust : searchCust,
    updateLastLoginDate : updateLastLoginDate,
    getCustomerBaseInfo : getCustomerBaseInfo,
    saveCustomerForCoupon :saveCustomerForCoupon,
    setUserActive : setUserActive,
    updateCustomerEmail : updateCustomerEmail,
    updateCustAvatar : updateCustAvatar,
    updateWechatUserStatus: updateWechatUserStatus ,
    saveWechatUser : saveWechatUser,
    queryCustUser : queryCustUser,
    getTableQrcode:getTableQrcode
};