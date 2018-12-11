var db=require('./../db.js');
var util=require('./../util/distance.js');

var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('BizDao.js');


function search(sc,callback){
	var params=[],i=0;
	var query='SELECT b.biz_id,b.name,b.name_lang,b.address,b.city,b.state,b.zipcode, b.latitude, b.longitude,' +
        'b.phone_no,b.opened_date,b.category,' +
			' b.owner_name, b.category,b.img_url,b.services,b.payment_cashonly , b.reservations, b.website, ' +
        'b.wifi, b.hours, b.hours_display,b.active, ' +
            'b.parking, b.seating_outdoor, b.room_private,b.desc ,b.yelp_id ,b.time_offset ,b.biz_unique_name ,' +
        'b.order_status,b.printer_lang,' +
            'b.parent_id,b.created_by, b.created_on, b.updated_on, i.img_url,b.wxpay_flag ' +
            ' FROM business b left join biz_img i on (b.biz_id=i.biz_id and i.flag=1) where b.biz_id is not null';
    if(sc.active){
        query = query +' and b.active= ?';
        params[i++]=sc.active;
    }
    if (sc.biz_id){
    	query+=' and b.biz_id=?';
    	params[i++]=sc.biz_id;
    }
    if(sc.city){
        query+= ' and b.city = ? '
        params[i++] = sc.city;
    }
    if(sc.parentId){
        query+= ' and b.parent_id = ? ';
        params[i++] = sc.parentId;
    }
    if(sc.created_by){
        query+= ' and b.created_by = ? ';
        params[i++] = sc.created_by;
    }
    query = query + " order by b.order_status desc " ;
    if(sc.start!=null && sc.size){
        query += " limit ? , ? " ;
        params[i++] = parseInt(sc.start) ;
        params[i++] = parseInt(sc.size);
    }
	//search by distance and my location
	if (sc.longitude && sc.latitude && sc.distance){
		query=getQueryLocationSearch(sc,query,params);
	}

    db.dbQuery(query, params ,function(error,rows){
        logger.debug(' search ');
        /*if (rows && rows.length>0 && sc.longitude && sc.latitude){
            for (i=0;i<rows.length;i++){
                rows[i].distance=util.getDistance(sc.latitude, sc.longitude,rows[i].latitude, rows[i].longitude);
            }
        }*/
        return callback(error,rows);

    })
}



function getQueryLocationSearch(sc,query,params){
		   var distance=sc.distance;
		   var la1=+sc.latitude- +(distance/69.0);
		   var la2=+sc.latitude+ +(distance/69.0);
		   var i=params.length;
		   
		   var lo1=+sc.longitude- +(distance/(Math.cos(Math.abs(sc.latitude*Math.PI/180))*69.0));
		   var lo2=+sc.longitude+ +((distance/(Math.cos(Math.abs(sc.latitude*Math.PI/180))*69.0)));
		  
		   query+=" and latitude between ? and ? and longitude between ? and ?";
		   params[i++]= la1;
		   params[i++]= la2;
		   params[i++]= lo1;
		   params[i++]= lo2;
		   //console.log('params==================1')
		   //console.dir(params);
		   return query;
}

function updateBiz(bizId,biz,callback){
    var params=[],i=0;
    var query='update business set img_url=?  where biz_id=?'
    params[i++]=biz.img_url;
    params[i]=bizId;

    db.dbQuery(query, params ,function(error,rows){
        logger.debug(' updateBiz ');
        return callback(error,rows);

    })
}

function updateBizBaseInfo(param , callback){
    var query = "update business set phone_no = ? , category = ? ,  payment_cashonly = ?, reservations = ?," +
        " wifi = ?,hours = ? , parking = ? , seating_outdoor = ? , room_private = ? , `desc` = ? " +
        "where biz_id = ?";
    var params=[],i=0

    params[i++]=param.phoneNo;
    params[i++]=param.category;
    params[i++]=param.cashOnly;
    params[i++]=param.reservations;
    params[i++]=param.wifi;
    params[i++]=param.hours;
    params[i++]=param.parking;
    params[i++]=param.seatOutDoor;
    params[i++]=param.privateRoom;
    params[i++]=param.desc;
    params[i]=param.bizId;

    db.dbQuery(query, params ,function(error,rows){
        logger.debug(' updateBizBaseInfo ');
        return callback(error,rows);

    })
}

function updateBizImg(params,callback){
    var paramArray=[],i=0;
    var query='update business set img_url=?  where biz_id=?'
    paramArray[i++]=params.img_url;
    paramArray[i++]=params.biz_id;

    db.dbQuery(query, paramArray ,function(error,rows){
        logger.debug(' updateBizImg ');
        return callback(error,rows);

    })
}


function createBiz(biz,callback){
    var query='insert into business (name,address,city,state,zipcode,latitude, longitude,phone_no,opened_date,owner_name,category,note,' +
        'img_url, active,country, kids_goodfor,neighborhood,alcohol, attire,chain_name,kids_menu,services,options, payment_cashonly,' +
        'price_level,reservations,website,wifi,fax,groups_goodfor,hours,hours_display,open_24hrs,rating,email,smoking,parking, ' +
        'seating_outdoor,accessible_wheelchair,room_private,parent_id,order_status,time_offset,name_lang,created_by,wxpay_flag) ' +
        'values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';

    var paramArray = [] , i=0;
    paramArray[i++] = biz.name;
    paramArray[i++] = biz.address;
    paramArray[i++] = biz.city;
    paramArray[i++] = biz.state;
    paramArray[i++] = biz.zipcode;
    paramArray[i++] = biz.latitude;
    paramArray[i++] = biz.longitude;
    paramArray[i++] = biz.phone_no;
    if (biz.opened_date!=null && biz.opened_date.trim().length<=0){
        biz.opened_date=null;
    }
    paramArray[i++] = biz.opened_date;
    paramArray[i++] = biz.owner_name;
    paramArray[i++] = biz.category;
    paramArray[i++] = biz.note;
    paramArray[i++] = biz.img_url;
    paramArray[i++] =  biz.active;
    paramArray[i++] = biz.country;
    paramArray[i++] = biz.kids_goodfor;
    paramArray[i++] = biz.neighborhood;
    paramArray[i++] = biz.alcohol;
    paramArray[i++] = biz.attire;
    paramArray[i++] = biz.chain_name;
    paramArray[i++] = biz.kids_menu;
    paramArray[i++] = biz.services;
    paramArray[i++] = biz.options;
    paramArray[i++] = biz.payment_cashonly;
    paramArray[i++] = biz.price_level;
    paramArray[i++] = biz.reservations;
    paramArray[i++] = biz.website;
    paramArray[i++] = biz.wifi;
    paramArray[i++] = biz.fax;
    paramArray[i++] = biz.groups_goodfor;
    paramArray[i++] = biz.hours;
    paramArray[i++] = biz.hours_display;
    paramArray[i++] = biz.open_24hrs;
    paramArray[i++] = biz.rating;
    paramArray[i++] = biz.email;
    paramArray[i++] = biz.smoking;
    paramArray[i++] = biz.parking;
    paramArray[i++] = biz.seating_outdoor;
    paramArray[i++] = biz.accessible_wheelchair;
    paramArray[i++] = biz.room_private;
    paramArray[i++] = biz.parentId;
    paramArray[i++] = biz.order_status;
    paramArray[i++] = biz.time_offset;
    paramArray[i++] = biz.name_lang;
    paramArray[i++] = biz.created_by;
    paramArray[i++] = biz.wxpay_flag;

    db.dbQuery(query, paramArray ,function(error,rows){
        logger.debug(' createBiz ');
        return callback(error,rows);

    })
}

function updateBizLoginDate(params,callback){
    var query = "update biz_user set last_login_date = CURRENT_TIMESTAMP where user_id = ?";
    var paramArr = [], i = 0;
    paramArr[i]=params.bizUserId;

    db.dbQuery(query, paramArr ,function(error,rows){
        logger.debug(' updateBizLoginDate ');
        return callback(error,rows);

    });
}

function getBiz(params,callback){
    var query='select bu.user_id,bu.username,bu.password,bu.first_name,bu.last_name,bu.active,bu.last_login_date,bur.biz_id,bur.role_type' +
        ' from biz_user bu left join biz_user_rel bur on bu.user_id = bur.user_id where ';
    var paramArray=[],i=0;
    if(params.email != null){
        paramArray[i++]=params.email;
        query = query + "bu.email = ? order by bur.role_type desc ";
    }else if(params.userName != null){
        paramArray[i++]=params.userName;
        query = query + "bu.username = ? order by bur.role_type desc ";
    }else{
        paramArray[i++]=params.userId;
        query = query + "bu.user_id = ?";
    }


    db.dbQuery(query, paramArray ,function(error,rows){
        logger.debug(' getBiz ');
        return callback(error,rows);

    });
}

function updateBizPassword(params, callback){
    var query='update biz_user set password=? where user_id=?';
    var paramArray=[],i=0;
    paramArray[i++]=params.password;
    paramArray[i++]=params.userId;


    db.dbQuery(query, paramArray ,function(error,rows){
        logger.debug(' updateBizPassword ');
        return callback(error,rows);

    });
}



function addBizUser(params,callback){
    var query='insert into biz_user(username,password,first_name,last_name,email,active) values(?,?,?,?,?,?);'
    var paramArray=[],i=0;
    paramArray[i++]=params.username;
    paramArray[i++]=params.password;
    paramArray[i++]=params.first_name;
    paramArray[i++]=params.last_name;
    paramArray[i++]=params.email;
    paramArray[i++]=params.active;
    paramArray[i++]=params.biz_id;

    db.dbQuery(query, paramArray ,function(error,rows){
        logger.debug(' addBizUser ');
        return callback(error,rows);

    });
}

function updateBizUser(params,callback){
    var query='update biz_user set username=? ,first_name=? ,last_name=? ,phone_no= ? where user_id = ?;'
    var paramArray=[],i=0;
    paramArray[i++]=params.username;
    paramArray[i++]=params.first_name;
    paramArray[i++]=params.last_name;
    paramArray[i++]=params.phone_no;
    paramArray[i]=params.userId;

    db.dbQuery(query, paramArray ,function(error,rows){
        logger.debug(' updateBizUser ');
        return callback(error,rows);

    });
}

function activeBizUser(params , callback){
    var query = "update biz_user set active = 1 where user_id = ? ";
    var paramArr = [], i = 0;
    paramArr[i]=params.userId;

    db.dbQuery(query, paramArr ,function(error,rows){
        logger.debug(' activeBizUser ');
        return callback(error,rows);

    });

}


function searchBizWithComment(params , callback){
     var query = "select count(bc.comment) total_count,avg(bc.price_level),avg(bc.service_level),avg(bc.food_quality),b.* " +
         " from business b left join biz_comment bc on b.biz_id = bc.biz_id " ;
    var paramArr = [], i = 0;
    if (params.biz_id){
        query+=' where b.biz_id=? ';
        params[i++]=params.biz_id;
    }
    query += " group by b.biz_id order by total_count desc";

    db.dbQuery(query, paramArr ,function(error,rows){
        logger.debug(' searchBizWithComment ');
        return callback(error,rows);

    });

}

function getFavoriteBizCount (params ,callback){
    var query = "select count(1) favorite_count from biz_customer_rel where favorite=1 and biz_id =? ";
    var paramArr = [], i = 0;
    paramArr[i]=params.bizId;


    db.dbQuery(query, paramArr ,function(error,rows){
        logger.debug(' getFavoriteBizCount ');
        if(rows != null && rows.length>0){
            return callback(error, rows[0]);
        }else{
            return callback(error, rows);
        }

    });
}

function getBizByIds(params,callback){
    var paramArr = [], i = 0;
    paramArr[i]=params.bizIds.join(",");
    var query = "select * from business where active = 1 and biz_id in ("+paramArr[0]+") order by updated_on ;";

    db.dbQuery(query, [] ,function(error,rows){
        logger.debug(' getBizByIds ');
        return callback(error,rows);
    });
}

function getBizByUniqueName(params,callback){
    var paramArr = [], i = 0;
    paramArr[i]=params.uniqueName;
    var query = "select biz_id from business where active = 1 and biz_unique_name =?";

    db.dbQuery(query, paramArr ,function(error,rows){
        logger.debug(' getBizByUniqueName ');
        return callback(error,rows);
    });
}

function getBizUserByBizId(params,callback){
    var query='select bu.user_id,bu.first_name,bu.last_name,bu.email,bu.last_login_date,bu.phone_no,bu.username ' +
        'FROM biz_user bu left join  biz_user_rel bur on bu.user_id = bur.user_id ' +
        'where bur.biz_id = ?';
    var paramArray=[],i=0;
    paramArray[i]=params.bizId;

    db.dbQuery(query, paramArray ,function(error,rows){
        logger.debug(' getBizUserByBizId ');
        return callback(error,rows);
    });
}

function getBizUserByUserId(params,callback){
    var query=' select  user_id,username,first_name,last_name,email,active,' +
        ' created_on,updated_on,last_login_date,phone_no,gender,avatar address,city,state,zipcode ' +
        ' FROM biz_user ' +
        ' where user_id = ? ';
    var paramArray=[],i=0;
    paramArray[i]=params.bizUserId;

    db.dbQuery(query, paramArray ,function(error,rows){
        logger.debug(' getBizUserByUserId ');
        return callback(error,rows);
    });
}


function getTaxRateByBiz(params,callback){
    var query='select bst.tax_rate,bst.update_time ,b.*from biz_state_tax  bst, business b ' +
        'where bst.state = b.state and bst.city =b.city and b.biz_id =  ?';
    var paramArray=[],i=0;
    paramArray[i]=params.bizId;

    db.dbQuery(query, paramArray ,function(error,rows){
        logger.debug(' getTaxRateByBiz ');
        return callback(error,rows);
    });
}
function updateBizHard(params,callback){
    var query= "update business set name = ? , address = ? ,  city = ?, state = ?, zipcode = ?, " +
    "latitude = ? , longitude = ? , owner_name = ? ,zipcode=?,opened_date=?,name_lang=?,active=?,order_status=?, phone_no=?,wxpay_flag=? where biz_id = ?";
    var paramArray=[],i=0;
    paramArray[i++] = params.name;
    paramArray[i++] = params.address;
    paramArray[i++] = params.city;
    paramArray[i++] = params.state;
    paramArray[i++] = params.zipcode;
    paramArray[i++] = params.latitude;
    paramArray[i++] = params.longitude;
    paramArray[i++] = params.owner_name;
    paramArray[i++] = params.zipcode;
    paramArray[i++] = params.opened_date;
    paramArray[i++] = params.name_lang;
    paramArray[i++] = params.active;
    paramArray[i++] = params.order_status;
    paramArray[i++] = params.phone_no;
    paramArray[i++] = params.wxpay_flag;
    paramArray[i] = params.bizId;



    db.dbQuery(query, paramArray ,function(error,rows){
        logger.debug(' updateBizHard ');
        return callback(error,rows);
    });
}

function updateBizOrderStatus(params,callback){
    var query  = "update business set order_status = ? where biz_id = ?"
    var paramArray=[],i=0;
    paramArray[i++] = params.orderStatus;
    paramArray[i] = params.bizId;

    db.dbQuery(query, paramArray ,function(error,rows){
        logger.debug(' updateBizOrderStatus ');
        return callback(error,rows);
    });
}

function updateBizParentId(params,callback){
    var query  = "update business set parent_id = ? where biz_id = ?"
    var paramArray=[],i=0;
    paramArray[i++] = params.parentId;
    paramArray[i] = params.bizId;

    db.dbQuery(query, paramArray ,function(error,rows){
        logger.debug(' updateBizParentId ');
        return callback(error,rows);
    });
}

function getAllBizCity(params,callback){
    var query = "select distinct(city) city from business ";
    var paramArray=[],i=0;
    if(params.active){
        query = query + " where active = ? ";
        paramArray[i++] = params.active;
    }
    db.dbQuery(query, paramArray ,function(error,rows){
        logger.debug(' getAllBizCity ');
        return callback(error,rows);
    });
}

function getCousumeGroup(params,callback){
    var paramArray=[],i=0;
    var query = 'select p.name,p.name_lang,sum(t.quantity) as quantity,p.price,sum(t.total_price) as money ' +
        'from order_item t,order_info i,product p,prod_type pt ' +
        'where t.order_id=i.id and t.prod_id=p.prod_id and p.type_id=pt.type_id ' +
        'and i.biz_id=? and i.status in (102,104)';

    paramArray[i++] = params.bizId;
    if(params.createBeginTime){
        query = query + " and i.create_on >= ? ";
        paramArray[i++] = params.createBeginTime + ' 00:00:00';
    }
    if(params.createEndTime){
        query = query + " and i.create_on <= ? ";
        paramArray[i++] = params.createEndTime + ' 23:59:59';
    }
    if(params.typeId){
        query = query + " and p.type_id = ? ";
        paramArray[i++] = params.typeId;
    }
    query+=' group by p.name,p.name_lang,p.price order by quantity desc';
    if(params.start!=null && params.size!=null){
        paramArray[i++] = parseInt(params.start);
        paramArray[i++] = parseInt(params.size);
        query = query + " limit ?,? "
    }
    db.dbQuery(query, paramArray ,function(error,rows){
        logger.debug(' getCousumeGroup ');
        return callback(error,rows);
    });
}

///--- Exports

module.exports = {
    search: search,
    updateBiz: updateBiz,
    createBiz : createBiz,
    updateBizImg :updateBizImg,
    updateBizLoginDate : updateBizLoginDate,
    getBiz : getBiz,
    addBizUser : addBizUser,
    updateBizUser: updateBizUser,
    activeBizUser : activeBizUser,
    updateBizPassword : updateBizPassword,
    updateBizBaseInfo : updateBizBaseInfo,
    searchBizWithComment : searchBizWithComment,
    getFavoriteBizCount : getFavoriteBizCount,
    getBizByIds : getBizByIds,
    getBizByUniqueName : getBizByUniqueName,
    getBizUserByBizId : getBizUserByBizId,
    getTaxRateByBiz :getTaxRateByBiz,
    updateBizHard : updateBizHard,
    updateBizOrderStatus : updateBizOrderStatus,
    getBizUserByUserId : getBizUserByUserId,
    updateBizParentId : updateBizParentId,
    getAllBizCity : getAllBizCity,
    getCousumeGroup:getCousumeGroup
};