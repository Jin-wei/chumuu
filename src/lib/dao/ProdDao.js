/**
 * Created by Ling Xue on 14-3-19.
 */

var db=require('./../db.js');

var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('ProdDao.js');
var moment = require('moment');

function searchBizProd(sc,callback){
    var query = " SELECT product.prod_id, product.biz_id, product.name as productName, product.description, " +
        " ifNull(prod_type.display_order ,9999) typeOrder," +
        " product.calorie,product.spiciness,product.ingredient,product.name_lang,product.description_lang,product.ingredient_lang, " +
        " product.options,product.type_id, product.price, product.img_url,product.note,product.active,product.togo, product.display_order, " +
        " product.created_on,product.updated_on ,product.unitofmeasure, prod_type.name type, prod_type.name_lang type_lang, " +
        " promotion.promotion_id,promotion.name as promotionName,promotion.discount_pct,promotion.start_date,promotion.end_date,promotion.week_sched " +
        " FROM product left join promotion on product.prod_id = promotion.prod_id left join prod_type on product.type_id=prod_type.type_id " +
        " where product.biz_id= ?  " ;

    //Set mysql query parameters array
    var paramArr=[],i=0;
    paramArr[i++] =sc.biz_id;
    if(sc.active != null || sc.active ==1){
        query += " and product.active = 1 ";
    }
    if (sc.type){
        query+=' and (prod_type.name=? or prod_type.name_lang=?)';
        paramArr[i++] = sc.type;
        paramArr[i++] = sc.type;
    }
    if (sc.prod_id){
        query+= ' and product.prod_id=?'
        paramArr[i++] = sc.prod_id;
    }
    query += " order by typeOrder,product.name";
    /*db.getCon(function(err, con){
        con.query(query,paramArr, function (error, rows, fields) {
            con.release();
            return callback(error,rows);
        });
    })*/
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' searchBizProd ')
        return callback(error,rows);
    })
}
function getBizProd(bizId,prodId,callback){
    searchBizProd({biz_id:bizId,prod_id:prodId},callback);
}

function addBizProdExtend(params,callback){
    var query = "insert into product_extend(prod_id,extend_id,extend_price) " +
        "values(? , ? , ?);" ;
    var paramArr = [] , i = 0;
    paramArr[i++] = params.prodId;
    paramArr[i++] = params.extendId;
    paramArr[i] = params.extendPrice;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addBizProdExtend ');
        return callback(error,rows);
    })
}
function addBizProdLabel(params,callback){
    var query = "insert into product_label(prod_id,label_id) " +
        "values(? , ?);" ;
    var paramArr = [] , i = 0;
    paramArr[i++] = params.prodId;
    paramArr[i] = params.labelId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addBizProdLabel ');
        return callback(error,rows);
    })
}
function deleteBizProdBaseLabel(prodId,callback){

    var query = "delete from product_label where prod_id=?";
    var paramArr=[],i=0;
    paramArr[i] =prodId;
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' deleteBizProdBaseLabel ');
        return callback(error,rows);
    })
}
function searchBizProdBaseLabel(params,callback){
    var query = "select l.id,l.label_name,l.label_name_lan " +
        "from all_label l,product_label p " +
        "where l.id=p.label_id ";
    var paramArr=[],i=0;
    if(params.prodId){
        query+=' and p.prod_id=?';
        paramArr[i] = params.prodId;
    }
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' searchBizProdBaseLabel ');
        return callback(error,rows);
    })
}
function deleteBizProdBaseExtend(prodId,callback){

    var query = "delete from product_extend where prod_id=?";
    var paramArr=[],i=0;
    paramArr[i] =prodId;
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' deleteBizProdBaseExtend ');
        return callback(error,rows);
    })
}
function searchBizProdBaseExtend(params,callback){
    var query = "select e.id,e.parent_id,e.biz_id,e.extend_type,e.extend_name,e.extend_name_lan,p.extend_price " +
        "from biz_extend e,product_extend p " +
        "where e.state=1 and e.id=p.extend_id ";
    var paramArr=[],i=0;
    if(params.prodId){
        query+=' and p.prod_id=?';
        paramArr[i++] = params.prodId;
    }
    if(params.extendType != null){
        query+=' and e.extend_type=?';
        paramArr[i++] = params.extendType;
    }
    if(params.parentId != null){
        query+=' and e.parent_id=?';
        paramArr[i] = params.parentId;
    }
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' searchBizProdBaseExtend ');
        return callback(error,rows);
    })
}
function searchBizProdBase(sc,callback){
    var query = "SELECT p.prod_id, p.biz_id, p.name,p.name_lang, p.description,p.type_id,pt.name typeName, " +
        " p.price,ifNull(pt.display_order ,9999) typeOrder," +
        " p.img_url,p.note,p.active, p.created_on, p.updated_on,p.description_lang,p.active,p.calorie," +
        " p.spiciness,p.ingredient,p.special,p.ingredient_lang,p.display_order,p.unitofmeasure,pt.menu_id,p.sold_out_flag " +
        "FROM product p left join prod_type pt on p.type_id = pt.type_id " +
        "where p.biz_id= ?  " ;

    //Set mysql query parameters array
    var paramArr=[],i=0;
    paramArr[i++] =sc.bizId;
    if(sc.active != null && sc.active ==1){
        query += " and p.active=1 ";
    }
    if (sc.typeId){
        query+=' and p.type_id=?';
        paramArr[i++] = sc.typeId;
    }
    if (sc.prodId){
        query+= ' and p.prod_id=?';
        paramArr[i++] = sc.prodId;
    }
    if (sc.name){
        query+=' and p.name=?'
        paramArr[i++]=sc.name;
    }
    if (sc.menuId){
        query+=' and pt.menu_id=?'
        paramArr[i++]=sc.menuId;
    }
    query += "  order by typeOrder , p.display_order";
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' searchBizProdBase ')
        return callback(error,rows);
    })
}
function getBizProdBase(bizId,prodId,callback){
    searchBizProdBase({bizId:bizId,prodId:prodId},callback);
}


function listBizProd(params,callback){

    var query = "select product.prod_id,product.biz_id,product.name as productName,product.name_lang,ifNull(prod_type.display_order ,9999) typeOrder, " +
        "product.description, product.description_lang,product.type_id,prod_type.name as typeName,product.price, " +
        "product.img_url,product.updated_on,product.active,product.options,product.togo,product.calorie,product.spiciness,product.ingredient,product.ingredient_lang, " +
        "promotion.promotion_id,promotion.name as promotionName,promotion.discount_pct,promotion.start_date,promotion.end_date,promotion.week_sched " +
        "from product left join promotion on product.biz_id = promotion.biz_id " +
        "left join prod_type on prod_type.type_id = product.type_id " +
        "where product.biz_id = ? " ;

    //Set mysql query parameters array
    var paramArr=[],i=0;
    paramArr[i++] = params.bizId;
    if(params.active != null && params.active == 1){
        query += " and product.active =1 ";
    }
    query += " order by typeOrder, product.name ";
    db.getCon(function(err, con){
        con.query(query,paramArr, function (error, rows, fields) {
            con.release();
            return callback(error,rows);
        });
    })
}

function listBizProdCat(params,callback){

    var query='SELECT distinct name type,type_id,name_lang type_lang,display_order FROM prod_type where biz_id=? and active=1 order by display_order name;';

    //Set mysql query parameters array
    var paramArr=[],i=0;
    paramArr[i++] = params.bizId;


    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' listBizProdCat ')
        return callback(error,rows);
    })
}

function addBizProd(params,callback){

    var query = "insert into product(biz_id,name,name_lang,description,description_lang,type_id,price,options," +
        "note,calorie,spiciness,ingredient,togo,ingredient_lang,display_order,unitofmeasure,sold_out_flag) " +
        "values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);" ;

    //Set mysql query parameters array
    var paramArr = [] , i = 0;
    paramArr[i++] = params.bizId;
    paramArr[i++] = params.name;
    paramArr[i++] = params.name_lang;
    paramArr[i++] = params.description;
    paramArr[i++] = params.description_lang;
    paramArr[i++] = params.type_id;
    paramArr[i++] = params.price;
    paramArr[i++] = params.options;
    paramArr[i++] = params.note;
    paramArr[i++] = params.calorie;
    paramArr[i++] = params.spiciness;
    paramArr[i++] = params.ingredient;
    paramArr[i++] = params.togo;
    paramArr[i++] = params.ingredient_lang;
    paramArr[i++] = params.display_order;
    paramArr[i++] = params.unitofmeasure;
    paramArr[i] = 0;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addBizProd ')
        return callback(error,rows);
    })
}

function updateBizProd(bizId, prodId, prod , callback){
    var paramArr = [] , i = 0;

    var query='update product set name = ? , name_lang = ? , description = ?, description_lang = ? , price = ?, img_url = ?, ' +
        'note = ? , type_id = ? , options = ? , calorie = ? , spiciness = ? , ingredient=? , togo = ? ,' +
        ' ingredient_lang = ?,display_order=?,unitofmeasure=?,sold_out_flag=? where biz_id=? and prod_id=? ';
    paramArr[i++] = prod.name;
    paramArr[i++] = prod.name_lang;
    paramArr[i++] = prod.description;
    paramArr[i++] = prod.description_lang;

    paramArr[i++] = prod.price;
    paramArr[i++] = prod.img_url;
    paramArr[i++] = prod.note;
    paramArr[i++] = prod.type_id;
    paramArr[i++] = prod.options;
    paramArr[i++] = prod.calorie;
    paramArr[i++] = prod.spiciness;
    paramArr[i++] = prod.ingredient;
    paramArr[i++] = prod.togo;
    paramArr[i++] = prod.ingredient_lang;
    paramArr[i++] = prod.display_order;
    paramArr[i++] = prod.unitofmeasure;
    paramArr[i++] = prod.sold_out_flag;

    paramArr[i++] = bizId;
    paramArr[i] = prodId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateBizProd ')
        return callback(error,rows);
    })

}

function updateProdImg(prodId,imgUrl , callback){
    var paramArray=[],i=0;
    var query='update product set img_url=?  where prod_id=?'
    paramArray[i++]=imgUrl;
    paramArray[i]=prodId;

    db.dbQuery(query,paramArray,function(error,rows){
        logger.debug(' updateProdImg ')
        return callback(error,rows);
    })
}

function deleteBizProd(params , callback){

    var query='delete FROM product where biz_id=? and prod_id=?;'

    //Set mysql query parameters array
    var paramArr = [] , i = 0;
    paramArr[i++] = params.biz_id;
    paramArr[i++] = params.prod_id;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' deleteBizProd ')
        return callback(error,rows);
    })
}

function getTopDishes(params, callback) {
    /*var query = "select product.prod_id,product.name as productName,product.description,product.type_id," +
        "product.togo,product.calorie,product.spiciness,product.ingredient,product.price,product.img_url," +
        "product.biz_id ,prod_type.name type, prod_type.name_lang type_lang, product.updated_on," +
        "b.name as bizName,b.biz_unique_name, b.latitude ,b.longitude FROM prod_type " +
        "join product on prod_type.type_id=product.type_id " +
        "left join business b on product.biz_id = b.biz_id "  ;

    if(params.latitude && params.longitude && params.distance){
        query = getQueryLocationSearch(query , params,paramArr);
    }*/
    var query = "select product.prod_id,product.name as productName,product.description,product.type_id, " +
        " product.togo,product.calorie,product.spiciness,product.ingredient,product.price,product.img_url," +
        " product.biz_id , product.updated_on,pr.ranking_num, " +
        " b.name as bizName,b.biz_unique_name, b.latitude ,b.longitude ,b.order_status" +
        " FROM product_ranking pr left join product on pr.prod_id = product.prod_id " +
        " left join business b on pr.biz_id = b.biz_id " ;
    var paramArr = [] ;
    var i = paramArr.length;
    paramArr[i++] = parseInt(params.size || 10);
    query = query + " order by pr.ranking_num desc limit 0 , ? ";
    /*db.getCon(function (err,con){
        con.query(query, paramArr,function (error, rows, fields) {
            if(error){
                con.rollback();
            }
            con.release();
            return callback(error,rows);
        });
    });*/
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug('getTopDishes');
        return callback(error,rows);
    })
}

function getQueryLocationSearch(query,params,paramArray){
    var distance=params.distance;
    var la1=+params.latitude- +(distance/69.0);
    var la2=+params.latitude+ +(distance/69.0);
    var i=paramArray.length;

    var lo1=+params.longitude- +(distance/(Math.cos(Math.abs(params.latitude*Math.PI/180))*69.0));
    var lo2=+params.longitude+ +((distance/(Math.cos(Math.abs(params.latitude*Math.PI/180))*69.0)));

    query+=" where b.latitude between ? and ? and b.longitude between ? and ?";
    paramArray[i++]= la1;
    paramArray[i++]= la2;
    paramArray[i++]= lo1;
    paramArray[i++]= lo2;
    return query;
}

function updateProductActive(param , callback){
    var query = "update product set active = ? where prod_id = ? and biz_id = ? ";
    var paramArray=[],i=0;
    paramArray[i++] = param.active ;
    paramArray[i++] = param.prodId ;
    paramArray[i++] = param.bizId ;

    db.dbQuery(query,paramArray,function(error,rows){
        logger.debug('updateProductActive');
        return callback(error,rows);
    })
}

function getProductCount(params ,callback){
    var query = "select count(1) productCount from product where active = 1 and biz_id = ?";
    var paramArr = [], i = 0;
    paramArr[i]=params.bizId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getProductCount ');
        return callback(error,rows);
    })
}

function getProductTypeCount(params ,callback){
    var query = "select count(1) productTypeCount from prod_type where biz_id = ?";
    var paramArr = [], i = 0;
    paramArr[i]=params.bizId;


    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getProductTypeCount ');
        return callback(error,rows);
    })
}

function getProductWithComment(params , callback){
    var query = "select count(pc.comment) total_count,avg(pc.rating) avg_rating,p.* from product p" +
        " left join product_comment pc on p.prod_id = pc.prod_id " +
        " where p.biz_id = ? " ;

    var paramArr = [], i = 0;
    paramArr[i++]=params.bizId;
    if(params.name){
       /* query+=' and p.name=? ';
        paramArr[i++]=params.name;*/
        query+=' and ( p.name like ? or p.name_lang like ?)';
        paramArr[i++] = '%' + params.name + '%';
        paramArr[i++] = '%' + params.name + '%';
    }
    if(params.active != null && params.active==1){
        query += " and p.active =1 " ;
    }

    /*if (params.prodId){
        query+=' and p.prod_id=? ';
        params[i++]=params.prodId;
    }*/
    query += " group by p.prod_id order by p.display_order ";

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getProductWithComment ');
        return callback(error,rows);
    })

}

function getProductFavoriteCount(params ,callback){
    var query = "select count(1) favorite_count from product_customer_rel where product_id =? ";
    var paramArr = [], i = 0;
    paramArr[i++]=params.productId;


    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getProductFavoriteCount ');
        return callback(error,rows);
    })
}

function getAllProduct(sc,callback){
    var paramArr=[],i=0;

    var query = "select p.prod_id,p.name,p.description,p.price,p.img_url,p.biz_id,p.type_id,p.name_lang," +
        " p.description_lang,p.active,p.updated_on,p.created_on,b.latitude,b.longitude, b.name bizName, b.city, " +
        " b.state,b.category,b.active bizActive,p.created_on, p.updated_on,t.name typeName, t.name_lang typeNameLang,p.unitofmeasure " +
        " from product p left join prod_type t on p.type_id=t.type_id" +
        " left join business b ON b.biz_id = p.biz_id  " +
        " order by p.updated_on ";

    if(sc.start!=null && sc.size !=null){
        paramArr[i++] = Number(sc.start);
        paramArr[i++] = Number(sc.size);
        query = query + " limit ? , ? "
    }
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getAllProduct ');
        return callback(error,rows);
    })
}

function getProductByIds(params,callback){
    var paramArr = [], i = 0;
    paramArr[i++]=params.productIds.join(",");
    var query = "select p.* , b.name as biz_name , b.name_lang as biz_name_Lang,b.biz_unique_name , b.latitude,b.longitude , " +
        " b.address,b.phone_no,b.order_status from product p left join business b on p.biz_id = b.biz_id " +
        "where p.active = 1 and p.prod_id in ("+paramArr[0]+") ";
    console.log(params);
    if(params.bizId){
        if(params.parentId == null){
            paramArr[0] = params.bizId ;
            query = query + " and p.biz_id =? ;";
        }
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getProductByIds ');
        return callback(error,rows);
    })
}

function updateProductSpecial(param,callback){
    var query = "update product set special = ? where prod_id = ? and biz_id = ? ";
    var paramArray=[],i=0;
    paramArray[i++] = param.special ;
    paramArray[i++] = param.productId ;
    paramArray[i++] = param.bizId ;


    db.dbQuery(query,paramArray,function(error,rows){
        logger.debug(' updateProductSpecial ');
        return callback(error,rows);
    })
}

function getSpecialProduct(params,callback){
    var paramArr = [], i = 0;
    paramArr[i]=params.bizId;
    var query = "select * from product  where  special=1 and biz_id = ? and active =1";

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getSpecialProduct ');
        return callback(error,rows);
    })
}

function getBizParentProd(params,callback){
    var query  = " select * from product where biz_id = (select parent_id from business where biz_id= ?) "
    var paramArray=[],i=0;
    paramArray[i++] = params.bizId;
    if(params.active){
        query = query + " and  active = ? ";
        paramArray[i] = params.active;
    }

    db.dbQuery(query, paramArray ,function(error,rows){
        logger.debug(' updateBizParentId ');
        return callback(error,rows);
    });
}

function getWechatProd(params,callback){
    var query  = " select * from product where biz_id = ? ";
    var paramArray=[],i=0;
    paramArray[i++] = params.bizId;
    if(params.active){
        query = query + " and  active = ? ";
        paramArray[i] = params.active;
    }

    db.dbQuery(query, paramArray ,function(error,rows){
        logger.debug(' updateBizParentId ');
        return callback(error,rows);
    });
}

function getAllLabel(params,callback){
    var query  = " select * from all_label where 1=1";
    var paramArray=[],i=0;
    if(params.lableName){
        query+=' and label_name like ?';
        paramArray[i++] = '%' + params.lableName + '%';
    }
    if(params.lableNameLan){
        query+=' and label_name_lan like ?';
        paramArray[i++] = '%' + params.lableNameLan + '%';
    }
    if(params.start!=null && params.size !=null){
        paramArray[i++] = Number(params.start);
        paramArray[i++] = Number(params.size);
        query = query + " limit ? , ? "
    }
    db.dbQuery(query, paramArray ,function(error,rows){
        logger.debug(' getAllLabel ');
        return callback(error,rows);
    });
}
function getProdLabel(params,callback){
    var query  = " select a.label_name,a.id,a.label_name_lan from all_label a,product_label pl,product p" +
        " where p.active=1 and a.id=pl.label_id and pl.prod_id=p.prod_id and p.biz_id=? group by a.label_name,a.id order by a.id ";
    var paramArray=[],i=0;
    paramArray[i++] = params.bizId;
    db.dbQuery(query, paramArray ,function(error,rows){
        logger.debug(' getAllLabel ');
        return callback(error,rows);
    });
}
function getProductWithCommentLabel(params , callback){
    var query = "select count(pc.comment) as total_count,avg(pc.rating) as avg_rating,p.*,a.id as label_id,a.label_name " +
        " from product p" +
        " left join product_comment pc on p.prod_id = pc.prod_id " +
        " left join product_label pl on (p.prod_id=pl.prod_id)" +
        " left join all_label a on (pl.label_id=a.id) " +
        " where p.biz_id = ? " ;

    var paramArr = [], i = 0;
    paramArr[i++]=params.bizId;
    if(params.active != null && params.active==1){
        query += " and p.active =1 " ;
    }
    /*if (params.prodId){
     query+=' and p.prod_id=? ';
     params[i++]=params.prodId;
     }*/
    query += " group by p.prod_id,a.id,a.label_name order by p.display_order ";

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getProductWithComment ');
        return callback(error,rows);
    })

}
function addALlLabel(params,callback){

    var query = "insert into all_label(label_name,label_name_lan,key_word,label_kind) " +
        "values(?,?,?,?);" ;

    //Set mysql query parameters array
    var paramArr = [] , i = 0;
    paramArr[i++] = params.labelName;
    paramArr[i++] = params.labelNameLan;
    paramArr[i++] = params.keyWord;
    paramArr[i] = params.labelKind;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addALlLabel ');
        return callback(error,rows);
    })
}

function getBizMenu(params, callback) {
    var query = "select * from biz_menu where biz_id= ?";

    var paramArr = [], i = 0;
    paramArr[i++] = params.bizId;
    if(params.menuName){
        query+=' and menu_name=?';
        paramArr[i++] = params.menuName;
    }
    if(params.systemFlag){
        query+=' and system_flag=?';
        paramArr[i++] = params.systemFlag;
    }

    db.dbQuery(query, paramArr, function (error, row) {
        logger.debug('getBizMenu');
        return callback(error, row);
    })
}

function addBizMenu(params, callback) {
    var query = "insert into biz_menu(menu_name,menu_name_lang,display_type,biz_id,start_time,end_time,system_flag)" +
        "values(?,?,?,?,?,?,?);";

    var paramArr = [], i = 0;
    paramArr[i++] = params.menuName;
    paramArr[i++] = params.menuNameLang !== '' ? params.menuNameLang : null;
    paramArr[i++] = params.displayType;
    paramArr[i++] = params.bizId;
    if(params.startTime !== ''){
        paramArr[i++] = moment(params.startTime, 'YYYY-MM-DD HH:mm:ss Z').format('YYYY-MM-DD HH:mm:ss')
    }else{
        paramArr[i++] = null;
    }
    if(params.endTime !== ''){
        paramArr[i++] = moment(params.endTime, 'YYYY-MM-DD HH:mm:ss Z').format('YYYY-MM-DD HH:mm:ss')
    }else{
        paramArr[i++] = null;
    }

    paramArr[i] = params.systemFlag ? params.systemFlag : 1;

    db.dbQuery(query, paramArr, function (error, rows) {
        logger.debug('addBizMenu');
        return callback(error, rows);
    })

}

function updateBizMenu(params, callback) {
    var query = "update biz_menu set menu_name=?,menu_name_lang=?,display_type=?,start_time=?,end_time=? where menu_id=? and biz_id=?";

    var paramArr = [], i = 0;
    paramArr[i++] = params.menuName;
    paramArr[i++] = params.menuNameLang !== '' ? params.menuNameLang : null;
    paramArr[i++] = params.displayType;
    if(params.startTime !== ''){
        paramArr[i++] = moment(params.startTime, 'YYYY-MM-DD HH:mm:ss Z').format('YYYY-MM-DD HH:mm:ss')
    }else{
        paramArr[i++] = null;
    }
    if(params.endTime !== ''){
        paramArr[i++] = moment(params.endTime, 'YYYY-MM-DD HH:mm:ss Z').format('YYYY-MM-DD HH:mm:ss')
    }else{
        paramArr[i++] = null;
    }
    paramArr[i++] = params.menuId;
    paramArr[i] = params.bizId;

    db.dbQuery(query, paramArr, function (error, rows) {
        logger.debug('updateBizMenu');
        return callback(error, rows);
    })
}

function deleteBizMenu(params, callback) {
    var query = "delete from biz_menu where menu_id=?";

    var paramArr = [], i = 0;
    paramArr[i] = params.menuId;

    db.dbQuery(query, paramArr, function (error, rows) {
        logger.debug('deleteBizMenu');
        return callback(error, rows);
    })
}

function updateBizProdNameLang(params , callback){
    var paramArr = [] , i = 0;

    var query='update product set name_lang = ? where biz_id=? and prod_id=? ';

    paramArr[i++] = params.name_lang;

    paramArr[i++] = params.bizId;
    paramArr[i] = params.prodId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateBizProdNameLang ')
        return callback(error,rows);
    })

}

function objToStr(obj){
    var paramStr="";
    if(obj !=null){
        var keyStr = Object.keys(obj);
        for(var i=0; i<keyStr.length;i++){
            if(obj[keyStr[i]] != null){
                paramStr+="&"+keyStr[i]+"="+obj[keyStr[i]];
            }
        }
        paramStr = paramStr.substr(1,paramStr.length);
        paramStr = encodeURI("?"+paramStr);
    }
    return paramStr;
}

module.exports = {
    searchBizProd: searchBizProd,
    listBizProd: listBizProd,
    getBizProd : getBizProd,
    addBizProd : addBizProd,
    updateBizProd : updateBizProd,
    deleteBizProd : deleteBizProd,
    getTopDishes : getTopDishes,
    listBizProdCat: listBizProdCat,
    getBizProdBase:getBizProdBase,
    updateProdImg : updateProdImg,
    searchBizProdBase:searchBizProdBase ,
    updateProductActive : updateProductActive,
    getProductCount : getProductCount,
    getProductTypeCount : getProductTypeCount,
    getProductWithComment: getProductWithComment,
    getProductFavoriteCount : getProductFavoriteCount,
    getAllProduct : getAllProduct,
    getProductByIds : getProductByIds,
    updateProductSpecial : updateProductSpecial,
    getSpecialProduct : getSpecialProduct ,
    getBizParentProd : getBizParentProd ,
    getWechatProd : getWechatProd,
    addBizProdExtend:addBizProdExtend,
    searchBizProdBaseExtend:searchBizProdBaseExtend,
    deleteBizProdBaseExtend:deleteBizProdBaseExtend,
    addBizProdLabel:addBizProdLabel,
    deleteBizProdBaseLabel:deleteBizProdBaseLabel,
    searchBizProdBaseLabel:searchBizProdBaseLabel,
    getAllLabel:getAllLabel,
    getProdLabel:getProdLabel,
    getProductWithCommentLabel:getProductWithCommentLabel,
    addALlLabel:addALlLabel,
    getBizMenu:getBizMenu,
    addBizMenu:addBizMenu,
    updateBizMenu:updateBizMenu,
    deleteBizMenu:deleteBizMenu,
    objToStr:objToStr,
    updateBizProdNameLang:updateBizProdNameLang
};