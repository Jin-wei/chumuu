/**
 * Created by ling xue on 14-10-13.
 */
var db=require('./../db.js');
var lov = require('../util/ListOfValue.js')
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('OrderDao.js');
var Seq = require('seq');

function getBizOrders(params,callback){
    var paramArr = [], i = 0;
    paramArr[i++]=params.bizId;
    var query = "select oi.id,oi.cust_id,oi.status,oi.order_type,oi.total_price,oi.origin_price,oi.total_tax, " +
        " oi.actual_price,oi.total_discount,oi.operator,oi.remark,oi.order_start,oi.order_end, oi.people_num, oi.seq, " +
        " oi.promo_info, oi.username as orderUsername,oi.phone,oi.address,c.username,c.first_name,c.last_name," +
        " c.phone_no,c.email ,c.avatar,lov.status_info,lov.status_desc  , " +
        " oi.table_id ,oi.create_on,bt.name table_name , bt.table_type , bt.seats , bt.status table_status ,sum(op.payment_actual) amount,op.payment_type ," +
        " op.status payment_status,op.payment_info,pay_state,oi.biz_id  " +
        " from order_info oi " +
        " left join customer c on oi.cust_id=c.customer_id " +
        " left join order_payment op on oi.id = op.order_id " +
        " left join lov on lov.id = oi.status  " +
        " left join biz_table bt on oi.table_id=bt.id " +
        " where oi.active=1 and oi.biz_id = ? ";

    if(params.status){
        var statusArrStr =params.status;
        query = query + " and oi.status in ("+statusArrStr+") ";
    }
    if(params.custId){
        paramArr[i++] = params.custId;
        query = query + " and oi.cust_id = ? ";
    }
    if(params.tableId){
        paramArr[i++] = params.tableId;
        query = query + " and oi.table_id = ? ";
    }
    if(params.giftFlag){
        paramArr[i++] = params.giftFlag;
        query = query + " and oi.gift_flag = ? ";
    }
    if(params.startDate && params.endDate){
        paramArr[i++] = params.startDate;
        paramArr[i++] = params.endDate;
        query = query + " and oi.create_on between ? and ? "
    }
    if(params.orderDateStart || params.orderDateEnd){
        if(params.orderDateStart && params.orderDateEnd){
            paramArr[i++] = params.orderDateStart;
            paramArr[i++] = params.orderDateEnd;
            query = query + " and oi.order_start between ? and ? "
        }else if(params.orderDateStart && !params.orderDateEnd){
            paramArr[i++] = params.orderDateStart;
            query = query + " and oi.order_start >= ? "
        }else {
            paramArr[i++] = params.orderDateEnd;
            query = query + " and oi.order_start <= ? "
        }
    }
    if(params.orderId){
        query = query + " and oi.id = ? ";
        paramArr[i++] = params.orderId ;
    }
    if(params.username){
        query = query + " and oi.username like ? ";
        paramArr[i++] = "%"+params.username+"%" ;
    }
    if(params.phone){
        query = query + " and oi.phone like ? ";
        paramArr[i++] = '%'+params.phone+'%' ;
    }

    query = query + " group by oi.id,oi.cust_id,oi.status,oi.order_type,oi.total_price," +
        "oi.origin_price,oi.total_tax,oi.actual_price,oi.total_discount,oi.operator,oi.remark," +
        "oi.order_start,oi.order_end, oi.people_num, oi.seq," +
        "oi.promo_info, oi.username,oi.phone,oi.address,c.username,c.first_name," +
        "c.last_name,c.phone_no,c.email ,c.avatar,lov.status_info,lov.status_desc," +
        "oi.table_id ,oi.create_on,bt.name , bt.table_type , bt.seats , bt.status ," +
        "op.payment_type ,op.status,op.payment_info,pay_state,oi.biz_id " +
        " order by oi.create_on desc ";
    if(params.start!=null && params.size!=null){
        paramArr[i++] = parseInt(params.start);
        paramArr[i++] = parseInt(params.size);
        query = query + " limit ?,? "
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getBizOrders ');
        return callback(error,rows);
    })
}

function getCustOrders(params,callback){
    var paramArr = [], i = 0;
    paramArr[i++]=params.custId;
    var query = "select oi.id,oi.biz_id,oi.status,oi.order_type,oi.total_price,oi.actual_price,origin_price,oi.total_tax,oi.total_discount,oi.remark,oi.promo_info, oi.order_start,oi.seq, " +
        " oi.order_end,oi.people_num,oi.create_on,oi.username as orderUsername,oi.phone,oi.address , b.biz_unique_name,b.name,b.name_lang,b.latitude,b.longitude,lov.status_info,lov.status_desc " +
        " , oi.table_id ,oi.create_on,bt.name table_name ,bt.table_type ,bt.seats ,bt.status table_status ,op.payment_type,op.payment_info,pay_state " +
        " from order_info oi left join business b on oi.biz_id=b.biz_id " +
        " left join lov on oi.status = lov.id left join biz_table bt on oi.table_id = bt.id " +
        " left join order_payment op on oi.id = op.order_id " +
        " where oi.active=1 and oi.cust_id = ? ";
    if(params.status){
        var statusArrStr =params.status;
        query = query + " and oi.status in ("+statusArrStr+") ";
    }
    if(params.giftFlag){
        paramArr[i++] = params.giftFlag;
        query = query + " and oi.gift_flag = ? ";
    }
    if(params.startDate && params.endDate){
        paramArr[i++] = params.startDate;
        paramArr[i++] = params.endDate;
        query = query + " and oi.create_on between ? and ? "
    }
    if(params.orderId){
        paramArr[i++] = params.orderId;
        query = query + " and oi.id = ? ";
    }
    query = query + " order by oi.create_on desc ";
    if(params.start!=null && params.size!=null){
        paramArr[i++] = parseInt(params.start);
        paramArr[i++] = parseInt(params.size);
        query = query + " limit ?,? "
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getCustOrders ')
        return callback(error,rows);
    });
}

function getOrderItemById(params,callback){
    var query = " select oi.*,lov.status_info,lov.status_desc,p.unitofmeasure " +
        "from order_item  oi " +
        "left join lov on oi.status = lov.id " +
        "left join product p on oi.prod_id=p.prod_id " +
        "where oi.order_id = ?";
    var paramArr = [], i = 0;
    paramArr[i]=params.orderId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getOrderItemById ')
        return callback(error,rows);
    });
}

function getOrderInfoById(params,callback){
    var query = " select oi.*,lov.status_info,lov.status_desc ,bst.tax_rate " +
        " from order_info oi left join lov on oi.status = lov.id " +
        " left join business b on oi.biz_id = b.biz_id " +
        " left join biz_state_tax bst on b.state = bst.state and b.city = bst.city " +
        " where  oi.id = ? ";
    var paramArr = [], i = 0;
    paramArr[i]=params.orderId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getOrderInfoById ')
        return callback(error,rows);
    });
}


function addCustOrder(params,callback){
    var query = " insert into order_info (biz_id,cust_id,status,order_type,promo_info,origin_price,actual_price,total_tax,total_price," +
        "total_discount,order_start,order_end,remark,operator,table_id,people_num,username,phone,address,seq,active,gift_flag,operator_id) " +
        " values ( ? , ? , ? , ? , ? , ? , ? , ? , ? ,? , ?, ? , ? , ? , ? , ? , ? , ? , ? , ? ,? ,?, ?) ";
    var paramArr = [], i = 0;
    paramArr[i++]=params.bizId;
    paramArr[i++]=params.custId;
    paramArr[i++]=params.status;
    paramArr[i++]=params.orderType;
    paramArr[i++]=params.promoInfo;
    paramArr[i++]=params.originPrice;
    paramArr[i++]=params.actualPrice;
    paramArr[i++]=params.totalTax;
    paramArr[i++]=params.totalPrice;
    paramArr[i++]=params.totalDiscount;
    paramArr[i++]=params.orderStart;
    paramArr[i++]=params.orderEnd;
    paramArr[i++]=params.remark;
    paramArr[i++]=params.custId?null:params.bizId;
    paramArr[i++]=params.tableId;
    paramArr[i++]=params.peopleNum;
    paramArr[i++]=params.username;
    paramArr[i++]=params.phone;
    paramArr[i++]=params.address;
    paramArr[i++]=params.seq;
    paramArr[i++]=params.active?params.active:0;
    paramArr[i++]=params.giftFlag?params.giftFlag:0;
    paramArr[i++]=params.operator_id?params.operator_id: null;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addCustOrder ')
        return callback(error,rows);
    });
}

function addOrderItem(params,callback){
    var query = " insert into order_item (order_id,prod_id,prod_name,prod_name_lang ,promo_info " +
        ",quantity,origin_price,unit_price,actual_price,discount,total_price,remark,operator,prod_extend,extend_price,extend_total_price,prod_label)  " +
        " values ( ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? ) ";

    var paramArr = [], i = 0;
    paramArr[i++]=params.orderId;
    paramArr[i++]=params.prodId;
    paramArr[i++]=params.prodName;
    paramArr[i++]=params.prodNameLang;
    paramArr[i++]=params.promoInfo;
    paramArr[i++]=params.quantity;
    paramArr[i++]=params.originPrice;
    paramArr[i++]=params.unitPrice;
    paramArr[i++]=params.actualPrice;
    paramArr[i++]=params.discount;
    paramArr[i++]=params.totalPrice;
    paramArr[i++]=params.remark;
    paramArr[i++] = params.custId?null:params.bizId;
    paramArr[i++]=params.prodExtend;
    paramArr[i++]=params.extendPrice;
    paramArr[i++]=params.extendTotalPrice;
    paramArr[i]=params.prodLabel;


    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addOrderItem ')
        return callback(error,rows);
    });
}


function updateOrderStatus(params,callback){

    var query = " update order_info set status= ? ,operator=? "
    if(params.opRemark){
        query = query + " ,op_remark = ? " ;
    }
    query = query + "where id = ? ";
    var paramArr = [], i = 0;
    paramArr[i++]=params.status;
    paramArr[i++]=params.custId?null:params.bizId;
    if(params.opRemark){
        paramArr[i++]=params.opRemark;
    }
    paramArr[i++]=params.orderId;

    /**
     * Status machine check
     */
    if(params.status == lov.ORDER_STATUS_CONFIRMED){
        query = query + " and status = "+ lov.ORDER_STATUS_SUBMITTED;
    }else if(params.status == lov.ORDER_STATUS_PROGRESS){
        query = query + " and status = " + lov.ORDER_STATUS_CONFIRMED;
    }else if (params.status == lov.ORDER_STATUS_CANCELLED){
        if(params.bizId == null ){
            query = query + " and status = " + lov.ORDER_STATUS_SUBMITTED;
        }else {
            query = query + " and status in ("+ lov.ORDER_STATUS_SUBMITTED+","+lov.ORDER_STATUS_CONFIRMED+")";
        }
    }else if(params.status == lov.ORDER_STATUS_COMPELETED){
       /* query = query + " and status = " + lov.ORDER_STATUS_PROGRESS;*/
    }
    //End check
    if(params.bizId){
        query = query + " and biz_id=? "
        paramArr[i]=params.bizId;
    }else{
        query = query + " and cust_id=? "
        paramArr[i]=params.custId;
    }


    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateOrderStatus ')
        return callback(error,rows);
    });
}

/**
 * This order for business set order status to PROGRESS
 * @param params
 * @param callback
 */
function updateOrderStautsAndSeq(params,callback){
    var query = " update order_info set status= ? ,seq=(select seq+1 from biz_order_seq where biz_id=?),operator=? where id = ? and seq is null ";
    var paramArr = [], i = 0;
    paramArr[i++]=params.status;
    paramArr[i++]=params.bizId;
    paramArr[i++]=params.bizId;
    paramArr[i++]=params.orderId;
    if(params.bizId){
        query = query + " and biz_id=? "
        paramArr[i]=params.bizId;
    }


    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateOrderStautsAndSeq ')
        return callback(error,rows);
    });
}

/**
 * set order in biz seq
 * @param params
 * @param callback
 */
function updateOrderSeq(params,callback){
    var query = " update order_info set seq=(select seq from biz_order_seq where biz_id=?) where id = ? and seq is null ";
    var paramArr = [], i = 0;
    paramArr[i++]=params.bizId;
    paramArr[i++]=params.orderId;
    if(params.bizId){
        query = query + " and biz_id=? "
        paramArr[i]=params.bizId;
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug('updateOrderSeq ')
        return callback(error,rows);
    });
}

function updateOrderDetail(params,callback){
    var query = "update order_info set status=? , order_type=? , remark=? , promo_info=? , total_tax=? " +
        ",total_discount=? , total_price =? , order_start=? , order_end=? ,operator =?    where id = ? ";
    var paramArr = [], i = 0;
    paramArr[i++]=params.status;
    paramArr[i++]=params.orderType;
    paramArr[i++]=params.remark;
    paramArr[i++]=params.promoInfo;
    paramArr[i++]=params.totalTax;
    paramArr[i++]=params.totalDiscount;
    paramArr[i++]=params.totalPrice;
    paramArr[i++]=params.orderStart;
    paramArr[i++]=params.orderEnd;
    paramArr[i++]=params.custId?null:params.bizUserId;
    paramArr[i]=params.orderId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateOrderDetail ')
        return callback(error,rows);
    });
}

function updateOrderInfoPrice(params,callback){
    var query = "update order_info set promo_info=? , origin_price=? ,actual_price=?, total_tax=? " +
        ",total_discount=? , total_price =? , operator=?  where id = ? ";
    var paramArr = [], i = 0;
    paramArr[i++]=params.promoInfo;
    paramArr[i++]=params.originPrice;
    paramArr[i++]=params.actualPrice;
    paramArr[i++]=params.totalTax;
    paramArr[i++]=params.totalDiscount;
    paramArr[i++]=params.totalPrice;
    paramArr[i++]=params.custId?null:params.bizUserId;
    paramArr[i++]=params.orderId;
    if(params.bizId){
        query = query + " and biz_id = ? ";
        paramArr[i++] = params.bizId;
    }
    if(params.custId){
        query = query + " and cust_id = ? ";
        paramArr[i++] = params.custId;
    }


    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateOrderInfoPrice ')
        return callback(error,rows);
    });
}
function updateOrderInfoPriceAddItem(params,callback){
    var query = "update order_info set origin_price=origin_price+?,actual_price=actual_price+?," +
        "total_price=total_price+? where id=? and biz_id=? ";
    var paramArr = [], i = 0;

    paramArr[i++]=params.originPrice;
    paramArr[i++]=params.actualPrice;
    paramArr[i++]=params.totalPrice;
    paramArr[i++]=params.orderId;
    paramArr[i++]=params.bizId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateOrderInfoPriceAddItem ')
        return callback(error,rows);
    });
}

function updateItemStatus(params,callback){
    // var query = " update order_item set status= ? ,remark=? , operator = ?" +
    //     " where id = ? and order_id = ( select id from order_info info where info.id = ? ";

    var query = "update order_item set status = ? ";
    var paramArr = [], i = 0;;
    paramArr[i++]=params.status;
    if(params.remark){
        query += ',remark = ?';
        paramArr[i++]=params.remark;
    }
    var operator=params.custId?null:params.bizUserId;
    if(operator){
        query += ',operator = ?';
        paramArr[i++]=operator;
    }
    query+=' where id = ? and order_id = ( select id from order_info info where info.id = ? ';
    paramArr[i++]=params.itemId;
    paramArr[i++]=params.orderId;
    if(params.bizId){
        query = query + " and info.biz_id = ? )";
        paramArr[i]=params.bizId;
    }else{
        query = query + " and info.cust_id = ? )";
        paramArr[i] = params.custId;

    }


    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateItemStatus ')
        return callback(error,rows);
    });
}

function addItemToOrder(params, callback){
    var query = " insert into order_item (order_id,prod_id,prod_name,prod_name_lang,promo_info , quantity,origin_price,unit_price,actual_price,discount,total_price,remark , operator)  " +
        " values (( select id from order_info where active=1 and biz_id =? and id =? ) , ? , ? , ? , ? , ? , ? , ? , ? , ? ,? ,? ,? ) ";

    var paramArr = [], i = 0;
    paramArr[i++]=params.bizId;
    paramArr[i++]=params.orderId;
    paramArr[i++]=params.prodId;
    paramArr[i++]=params.prodName;
    paramArr[i++]=params.prodNameLang;
    paramArr[i++]=params.promoInfo;
    paramArr[i++]=params.quantity;
    paramArr[i++]=params.originPrice;
    paramArr[i++]=params.unitPrice;
    paramArr[i++]=params.actualPrice;
    paramArr[i++]=params.discount;
    paramArr[i++]=params.totalPrice;
    paramArr[i++]=params.remark;
    paramArr[i]=params.custId?null:params.bizUserId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addItemToOrder ')
        return callback(error,rows);
    });
}

function getOrderInfoWithItem(params,callback){

    var query = " select oi.* ,ot.prod_id ,p.name,p.name_lang,p.price,ot.quantity,ot.origin_price as item_origin_price ,ot.unit_price as unitPrice,ot.status as itemStatus ,ot.promo_info as item_promo_info " +
        " from order_item ot left join order_info oi on oi.id = ot.order_id " +
        " left join product p on ot.prod_id = p.prod_id where ot.order_id = ?";
    var paramArr = [], i = 0;
    paramArr[i]=params.orderId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getOrderInfoWithItem ')
        return callback(error,rows);
    });
}

function getProdWithOrderInfo(params,callback){
    var paramArr = [], i = 0;
    var paramItemArray = params.itemArray;
    var productIds = [];
    for(var j =0 ; j<paramItemArray.length; j++){
        productIds.push(paramItemArray[i].prodId);
    }
    var paramIds=productIds.join(",");
    paramArr[i++]=params.orderId;
    var query = " select oi.id,oi.status,oi.order_start,oi.order_end,oi.order_type,oi.biz_id,oi.cust_id, oi.seq," +
        " bst.tax_rate ,p.prod_id,p.name,p.price,p.active " +
        " from  biz_state_tax bst ,product p ,order_info oi left join business b on oi.biz_id = b.biz_id " +
        " where b.state = bst.state and b.city = bst.city and p.biz_id = b.biz_id  and  p.prod_id in ("+paramIds+") and oi.id =? ";
    if(params.bizId){
        paramArr[i] = params.bizId ;
        query = query + " and oi.biz_id =? ";
    }
    if(params.custId){
        paramArr[i] = params.custId ;
        query = query + " and oi.cust_id =? ";
    }


    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getProdWithOrderInfo ')
        return callback(error,rows);
    });
}

function updateOrderItem(params,callback){
    var paramArr = [], i = 0;
    var query = "update order_item ot set ot.quantity = ? ,ot.promo_info=? ,ot.origin_price=? , ot.unit_price=? ," +
        " ot.actual_price =? , ot.discount=? ,ot.total_price =? ,  ot.operator = ? " +
        " where ot.prod_id = ? and ot.id=? and order_id = " +
        "(select id from order_info oi where oi.id = ? ";
    paramArr[i++]=params.quantity;
    paramArr[i++]=params.promoInfo;
    paramArr[i++]=params.originPrice;
    paramArr[i++]=params.unitPrice;
    paramArr[i++]=params.actualPrice
    paramArr[i++]=params.discount;
    paramArr[i++]=params.totalPrice;
    //paramArr[i++]=params.remark;
    paramArr[i++]=params.custId?null:params.bizUserId;
    paramArr[i++]=params.prodId;
    paramArr[i++]=params.itemId;
    paramArr[i++]=params.orderId;
    if(params.custId){
        paramArr[i]=params.custId;
        query = query + " and oi.cust_id = ? )";
    }else {
        paramArr[i]=params.bizId;
        query = query + " and oi.biz_id = ? )";
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateOrderItem ')
        return callback(error,rows);
    });
}

function deleteOrderItem(params,callback){

    var paramArr = [], i = 0;
    var itemIds = params.itemArray.join(",");
    var query = "delete from order_item  where id in ("+itemIds+")  and order_id = " +
        " (select oi.id from order_info oi where oi.active=1 and oi.id = ? ";
    paramArr[i++]=params.orderId;
    if(params.bizId){
        paramArr[i]=params.bizId;
        query = query + " and oi.biz_id = ?) "
    }else if(params.custId){
        paramArr[i]=params.custId;
        query = query + " and oi.cust_id = ?) "
    }else{
        query = query + " ) "
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' deleteOrderItem ')
        return callback(error,rows);
    });

}

function updateOrderTable(params,callback){
    var query = "update order_info set table_id = ? where id = ? and biz_id = ? " ;
    var paramArr = [], i = 0;
    paramArr[i++]=params.tableId;
    paramArr[i++]=params.orderId;
    paramArr[i]=params.bizId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateOrderTable ')
        return callback(error,rows);
    });
}

function updateOrderPeopleNum(params,callback){
    var query = "update order_info set people_num = ? where id = ? and biz_id = ? " ;
    var paramArr = [], i = 0;
    paramArr[i++]=params.peopleNum;
    paramArr[i++]=params.orderId;
    paramArr[i]=params.bizId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateOrderPeopleNum ')
        return callback(error,rows);
    });
}

function getBizTableOrders(params,callback){
    var query = "select oi.id,oi.cust_id,oi.status,oi.order_type,oi.total_price,oi.origin_price,oi.total_tax,oi.seq," +
        " oi.actual_price,oi.total_discount,oi.operator,oi.remark,oi.order_start,oi.order_end, " +
        " oi.promo_info,oi.create_on,oi.username as orderUsername,oi.phone,oi.address,c.avatar, c.username,c.first_name,c.last_name,c.phone_no,c.email ,lov.status_info,lov.status_desc  , " +
        " oi.table_id ,bt.name table_name , bt.table_type , bt.seats , bt.status table_status " +
        " from order_info oi left join customer c on oi.cust_id=c.customer_id " +
        " left join lov on lov.id = oi.status  left join biz_table bt on oi.table_id=bt.id " +
    " where oi.active=1 and oi.biz_id = ?  and oi.table_id = ?";
    var paramArr = [] ,i=0;
    paramArr[i++] = params.bizId ;
    paramArr[i++] = params.tableId ;
    query = query + " order by oi.update_on desc ";
    if(params.start!=null && params.size!=null){
        paramArr[i++] = parseInt(params.start);
        paramArr[i] = parseInt(params.size);
        query = query + " limit ?,? "
    }
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getBizTableOrders ')
        return callback(error,rows);
    });
}

function getProdWithItemInfo(params,callback){
    var query = " select ot.prod_id,ot.quantity,p.price,p.name, p.name_lang ,ot.order_id ,oi.biz_id ,b.state,bst.tax_rate," +
        " ot.id,ot.status,oi.order_start,oi.order_end,oi.order_type ,oi.seq " +
        " from business b, biz_state_tax bst , order_item ot left join product p on ot.prod_id = p.prod_id " +
        " left join order_info oi on ot.order_id=oi.id " +
        " where oi.biz_id = b.biz_id and  b.state = bst.state and b.city = bst.city and b.biz_id = ? and oi.id=?";
    var paramArr = [] ,i=0;
    paramArr[i++] = params.bizId ;
    paramArr[i] = params.orderId ;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getProdWithItemInfo ')
        return callback(error,rows);
    });
}

function getOrderWithItemForMail(params,callback){
    var query = " select b.biz_id,b.name,b.biz_unique_name,b.phone_no , b.time_offset ,op.status payment_status,  op.payment_actual, " +
        " c.email,c.avatar,c.first_name,c.last_name,c.username ,c.phone_no cust_phone_no, op.payment_id,op.id order_payment_id , op.payment_type, " +
        " oi.order_type,oi.status,oi.order_start,oi.promo_info,oi.origin_price,oi.remark,oi.people_num, op.cust_id,oi.seq, " +
        " oi.actual_price,oi.total_tax,oi.total_discount,oi.total_price,oi.table_id,oi.create_on, oi.username  orderUsername," +
        " oi.phone,oi.address,ot.prod_name,ot.prod_name_lang,ot.promo_info item_promo_info,ot.quantity,ot.origin_price item_origin_price ,ot.unit_price item_unit_price , " +
        " ot.actual_price item_actual_price,ot.discount item_discount , ot.total_price item_total_price , " +
        " ot.remark item_remark ,ot.status item_status " +
        " from order_info oi left join business b on oi.biz_id=b.biz_id" +
        " left join customer c on oi.cust_id=c.customer_id " +
        " left join order_item ot on oi.id = ot.order_id " +
        " left join order_payment op on oi.id = op.order_id " +
        " where oi.cust_id=? and oi.id= ? ";
    var paramArr = [] ,i=0;
    paramArr[i++] = params.custId ;
    paramArr[i] = params.orderId ;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getOrderWithItemForMail ')
        return callback(error,rows);
    });

}

function getBizOrderCustomer(params,callback){
    var query = "select max(oi.order_start) last_order_date,min(oi.create_on) origin_order_date,sum(oi.total_price) total_spend, " +
        "oi.cust_id,c.email,c.phone_no,c.username,c.first_name,c.last_name,c.gender,c.address,c.avatar " +
        " ,c.city ,c.state, c.zipcode " +
        " from order_info oi left join customer c on oi.cust_id=c.customer_id " +
        " where oi.active=1 and oi.cust_id is not null and oi.biz_id = ? and oi.status =104 group by oi.cust_id";

    var paramArr = [] ,i=0;
    paramArr[i] = params.bizId ;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getBizOrderCustomer ')
        return callback(error,rows);
    });
}

function getDayOrder(params,callback){
    //var query = "select id from order_info where order_start < now() and timestampdiff( hour, order_start, now()) <24 and finish =1 and biz_id =?";
    var query = "select id from order_info where active=1 and order_start < now() and finish =0 and biz_id =?";
    var paramArr = [] ,i=0;
    paramArr[i++] = params.bizId ;

    if(params.status){
        query = query + " and status = ? ";
        paramArr[i] = params.status ;
    }
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getDayOrder ')
        return callback(error,rows);
    });
}

function setOrderExpired(params,callback){
    var query = "update order_info set status ="+lov.ORDER_STATUS_EXPIRED+" where order_start < now() and status in("+lov.ORDER_STATUS_SUBMITTED+","+lov.ORDER_STATUS_CONFIRMED+") and finish = 0 and  biz_id = ?";
    var paramArr = [] ,i=0;
    paramArr[i] = params.bizId ;


    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' finishDayOrder ')
        return callback(error,rows);
    });
}

function setOrderFinish(params,callback){
    var query = "update order_info set finish =1 where order_start < now() and finish = 0 and  biz_id = ?";
    var paramArr = [] ,i=0;
    paramArr[i] = params.bizId ;


    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' setOrderFinish ')
        return callback(error,rows);
    });
}

function deleteOrder(params,callback){
    var query = "delete from order_info where id =? ";
    var paramArr = [] ,i=0;
    paramArr[i++] = params.orderId ;
    if(params.custId){
        query = query + " and cust_id = ? ";
        paramArr[i] = params.custId;
    }
    if(params.bizId){
        query = query + " and biz_id = ? ";
        paramArr[i] = params.bizId;
    }


    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' deleteOrder ')
        return callback(error,rows);
    });
}

function deleteOrderAllItem(params,callback){
    var query = "delete from order_item where order_id =? ";
    var paramArr = [] ,i=0;
    paramArr[i] = params.orderId ;
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' deleteOrder ')
        return callback(error,rows);
    });
}

function deleteOrderWithItem(params,callback){
    Seq().seq(function(){
        var that = this;
       deleteOrderAllItem(params,function(error,result){
            if (error) {
                logger.error(' deleteOrder ' + error.message);
            }
            that();
        })
    }).seq(function(){
           deleteOrder(params,function(error,result){
                callback(error,result);
            })
        })

}

function setOrderActive(params,callback){
    var query = "update order_info set active=1 where id=? ";
    var paramArr = [] ,i=0;
    paramArr[i] = params.orderId ;
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' setOrderActive ')
        return callback(error,rows);
    });
}

function getBizDailyPayment(params,callback){
    var query = " select sum(payment_actual) payment_actual_sum,payment_type,count(order_id) payment_order_count  from order_payment where order_id in ( " +
        " select oi.id from  order_info oi left join order_payment op on oi.id=op.order_id " +
        " where oi.biz_id = ?  and oi.status not in (101,109) and op.status is not null and (order_start between CURDATE() and date_sub(CURDATE(),interval -1 day) )" +
        " ) group by payment_type " ;
    var paramArr = [] ,i=0;
    paramArr[i] = params.bizId ;
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getBizDailyPayment ')
        return callback(error,rows);
    });
}

function getBizDailyOrder(params,callback){
    var query = " select sum(oi.total_tax) total_tax_sum,sum(oi.total_discount) total_discount_sum,sum(oi.total_price) total_price_sum " +
        " from  order_info oi left join order_payment op on oi.id=op.order_id " +
        " where oi.biz_id = ?  and oi.status not in (101,109) and " +
        " op.status is not null and (order_start between CURDATE() and date_sub(CURDATE(),interval -1 day) ) " ;
    var paramArr = [] ,i=0;
    paramArr[i] = params.bizId ;
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getBizDailyOrder ')
        return callback(error,rows);
    });
}

function getBizDailyOrderTypeStat(params,callback){
    var query = " select sum(oi.total_tax) total_tax_sum,sum(oi.total_discount) total_discount_sum,sum(oi.total_price) total_price_sum ,sum(oi.people_num) persons ,count(oi.id) order_number,oi.order_type " +
        " from  order_info oi  where oi.biz_id = ?  and oi.status not in (100,101,109) and " +
        " (oi.order_start between date_sub(CURDATE(),interval +(select time_offset from business where biz_id = ? ) hour) " +
        " and date_sub(CURDATE(),interval +(select time_offset-24 from business where biz_id = ? ) hour) )  group by oi.order_type " ;
    var paramArr = [] ,i=0;
    paramArr[i++] = params.bizId ;
    paramArr[i++] = params.bizId ;
    paramArr[i] = params.bizId ;
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getBizDailyOrderTypeStat ')
        return callback(error,rows);
    });
}

function getBizDailyPaymentStat(params,callback){

    var query = " select sum(payment_actual) payment_actual,op.payment_type,op.order_id from order_payment op " +
        " where op.biz_id = ? and op.status not in (4) and op.order_id in " +
        " (select oi.id from  order_info oi where oi.biz_id = ?  and oi.status not in (100,101,109) and " +
        " (oi.order_start between date_sub(CURDATE(),interval +(select time_offset from business where biz_id = ? ) hour) " +
        " and date_sub(CURDATE(),interval +(select time_offset-24 from business where biz_id = ? ) hour) ) )" +
        " group by op.payment_type " ;
    var paramArr = [] ,i=0;
    paramArr[i++] = params.bizId ;
    paramArr[i++] = params.bizId ;
    paramArr[i++] = params.bizId ;
    paramArr[i] = params.bizId ;
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getBizDailyOrderTypeStat ')
        return callback(error,rows);
    });
}

function searchBizOrder(params,callback){
    var query = "select * from order_info oi where ";
    var paramArr = [] ,i=0;
    if(params.orderId){
        query = query + " oi.id = ? ";
        paramArr[i++] = params.orderId ;
    }
    if(params.username){
        query = query + " oi.username like ? ";
        paramArr[i++] = "%"+params.username+"%" ;
    }
    if(params.phone){
        query = query + " oi.phone like ? ";
        paramArr[i++] = '%'+params.phone+'%' ;
    }
    if(params.start!=null && params.size!=null ){
        query = query + " limit ? ,? ";
        paramArr[i++] = params.start ;
        paramArr[i++] = params.size ;

    }
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' searchBizOrder ')
        return callback(error,rows);
    });
}

function queryAllOrders(params,callback){
    var query = " select oi.*,b.name b_name ,b.address b_address,b.city b_city,b.state b_state," +
        " b.phone_no b_phone_no, b.latitude, b.longitude," +
        " c.first_name c_first_name,c.last_name c_last_name,c.wechat_id ,c.gender c_gender,c.avatar  " +
        " from order_info oi left join business b on oi.biz_id = b.biz_id " +
        " left join customer c on c.customer_id = oi.cust_id " +
        " where c.customer_id = oi.cust_id ";
    var paramArr = [], i = 0;
    if(params.status){
        query = query + " and oi.status =? " ;
        paramArr[i++]=params.status;
    }
    if(params.orderType){
        query = query + " and oi.order_type =? " ;
        paramArr[i++]=params.orderType ;
    }
    if(params.active){
        query = query + "and oi.active = ? " ;
        paramArr[i++]=params.active ;
    }
    if(params.giftNow !=null ){
        if(params.giftNow == true){
            query = query + " and oi.biz_id is null " ;
        }else{
            query = query + " and oi.biz_id is not null " ;
        }

    }

    if(params.startDate && params.endDate){
        paramArr[i++] = params.startDate;
        paramArr[i++] = params.endDate;
        query = query + " and oi.create_on between ? and ? "
    }
    if(params.orderDateStart || params.orderDateEnd){
        if(params.orderDateStart && params.orderDateEnd){
            paramArr[i++] = params.orderDateStart;
            paramArr[i++] = params.orderDateEnd;
            query = query + " and oi.order_start between ? and ? "
        }else if(params.orderDateStart && !params.orderDateEnd){
            paramArr[i++] = params.orderDateStart;
            query = query + " and oi.order_start >= ? "
        }else {
            paramArr[i++] = params.orderDateEnd;
            query = query + " and oi.order_start <= ? "
        }
    }
    if(params.orderDesc){
        query = query + " order by oi.order_start desc"
    }
    if(params.orderAsc){
        query = query + " order by oi.order_start "
    }
    if(params.createDesc){
        query = query + " order by oi.create_on desc"
    }
    if(params.createAsc){
        query = query + " order by oi.create_on "
    }

    if(params.start!=null && params.size!=null){
        paramArr[i++] = parseInt(params.start);
        paramArr[i++] = parseInt(params.size);
        query = query + " limit ? , ? "
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' queryAllOrders ')
        return callback(error,rows);
    });
}

function searchBizSeq(params,callback){
    var query='select seq from order_info where id = ? ';
    var paramArr = [], i = 0;
    paramArr[i++]=params.orderId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' searchBizSeq ')
        return callback(error,rows);
    });
}

/*need to be called in batch job*/
function batchCancelSubmittedOrderNew(params,callback){
    var query='update order_info set status = 101 ' +
        'where status=110 and biz_id is not null and update_on <= date_sub(CURDATE(),interval -1 day)' ;
    db.dbQuery(query,null,function(error,result){
        logger.debug(' batchCancelSubmittedOrderNew')
        if (error){
            return callback(error);
        }else{
            return callback(null,result.affectedRows);
        }

    });
}
function batchCancelSubmittedTableNew(params,callback){
    var query='update biz_table set status = 300 ' +
        'where biz_id is not null' ;
    db.dbQuery(query,null,function(error,result){
        logger.debug(' batchCancelSubmittedTableNew')
        if (error){
            return callback(error);
        }else{
            return callback(null,result.affectedRows);
        }

    });
}

function batchCancelSubmittedOrder(params,callback){
    var query='update order_info set status = 101 ' +
        'where status=100 and biz_id is not null and update_on <= date_sub(CURDATE(),interval -1 day)' ;
    db.dbQuery(query,null,function(error,result){
        logger.debug(' batchCancelSubmittedOrder')
        if (error){
            return callback(error);
        }else{
            return callback(null,result.affectedRows);
        }

    });
}

/*need to be called in batch job*/
function batchCompleteInProgressOrder(params,callback){
    var query='update order_info set status = 104 ' +
        'where status in (102,103) and biz_id is not null and update_on <= date_sub(CURDATE(),interval -1 day)' ;
    db.dbQuery(query,null,function(error,result){
        logger.debug(' batchCompleteInProgressOrder ')
        if (error){
            return callback(error);
        }else{
            return callback(null,result.affectedRows);
        }
    });
}

/**get all order item related information, it query across multiple tables and may be very expensive*/
function queryOrderItemFullInfo(params,callback){
    var query = " select oi.id,oi.order_id,oi.prod_id,oi.prod_name,oi.promo_info,oi.quantity," +
        " oi.origin_price,oi.actual_price,oi.discount,oi.total_price,oi.prod_name_lang,oi.unit_price," +
        " oi.prod_extend,oi.extend_price,oi.extend_total_price,o.biz_id, o.status order_status, " +
        " b.name biz_name,b.city, b.state, b.latitude, " +
        " b.longitude, o.update_on, o.create_on, o.table_id, o.people_num,p.type_id as typeId,t.name as typeName,t.name_lang as typeNameLang,oi.prod_label "+
        " from order_item oi,order_info o,business b,product p,prod_type t " +
        " where o.id = oi.order_id and o.biz_id = b.biz_id and oi.prod_id=p.prod_id and p.type_id=t.type_id ";
    var paramArr = [], i = 0;
    if (params.orderStatus){
        paramArr[i++]=params.orderStatus;
        query += " and o.status=?";
    }

    if(params.start!=null && params.size != null){
        query += " limit ? , ? " ;
        paramArr[i++] = parseInt(params.start) ;
        paramArr[i++] = parseInt(params.size);
    }
    // if(params.start && params.size){
    //     query += " limit ? , ? " ;
    //     paramArr[i++] = parseInt(params.start) ;
    //     paramArr[i++] = parseInt(params.size);
    // }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' queryOrderItemFullInfo ')
        return callback(error,rows);
    });
}

function getOrderMoneyAleardy(params,callback){
    var query = "select sum(payment_money) as total_payment_money from order_money where status=1 and biz_id=? and order_id=?";
    var paramArr = [], i = 0;
    paramArr[i++]=params.bizId;
    paramArr[i++]=params.orderId;
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getOrderMoneyAleardy ');
        return callback(error,rows);
    });
}
function addOrderMoney(params,callback){
    var query = " insert into order_money (biz_id,order_id,payment_type,payment_money,status,operator,update_on,create_on,remark)" +
        " values (?,?,?,?,?,?,?,?,?) ";
    var paramArr = [], i = 0;
    paramArr[i++]=params.bizId;
    paramArr[i++]=params.order_id;
    paramArr[i++]=params.payment_type;
    paramArr[i++]=params.payment_money;
    paramArr[i++]=1;
    paramArr[i++]=params.operator;
    paramArr[i++]=new Date();
    paramArr[i++]=new Date();
    paramArr[i++]=params.remark;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addOrderMoney ');
        return callback(error,rows);
    });
}
function updateOrderInfoPayState(params,callback){
    var query = " update order_info set status= ? where id=? and biz_id=? ";
    var paramArr = [], i = 0;
    paramArr[i++]=params.status;
    paramArr[i++]=params.orderId;
    paramArr[i++]=params.bizId;
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateOrderInfoPayState ')
        return callback(error,rows);
    });
}

function getOrderMoney(params,callback){
    var query = "select sum(payment_money) as total_payment_money,c.checkout_name,o.payment_type " +
        "from order_money o " +
        "left join biz_checkout_info c on (o.payment_type = c.checkout_id and c.status = 1 and c.biz_id=?) " +
        "where o.status=1 and o.biz_id=? ";
    var paramArr = [], i = 0;
    paramArr[i++]=params.bizId;
    paramArr[i++]=params.bizId;
    if(params.createBeginTime){
        query = query + " and o.create_on >= ? ";
        paramArr[i++] = params.createBeginTime + ' 00:00:00';
    }
    if(params.createEndTime){
        query = query + " and o.create_on <= ? ";
        paramArr[i++] = params.createEndTime + ' 23:59:59';
    }
    query +=' group by c.checkout_name,o.payment_type order by o.payment_type';
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getOrderMoneyAleardy ');
        return callback(error,rows);
    });
}

function getOrderMoneyDetail(params,callback){
    var query = "select m.*,c.checkout_name from order_money m " +
        "left join biz_checkout_info c on (m.payment_type = c.checkout_id and c.biz_id=?)" +
        "where m.order_id=? ";
    var paramArr = [], i = 0;
    paramArr[i++]=params.bizId;
    paramArr[i++]=params.orderId;
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getOrderMoneyDetail ');
        return callback(error,rows);
    });
}


function getOrderByBizStateTableId(params,callback){
    var query = "select * from order_info where active = 1 and biz_id=? and table_id=? and status=?";
    var paramArr = [], i = 0;
    paramArr[i++]=params.bizId;
    paramArr[i++]=params.tableId;
    paramArr[i++]=params.status;
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getOrderByBizStateTableId ');
        return callback(error,rows);
    });
}

function addOrderItemTemp(params,callback){
    var query = " insert into order_item_temp " +
            "(actualPrice,bizId,bizImgUrl,bizKey,bizName,bizNameLang,count,extendTotalPrice,isCheckingPrice,originPrice," +
            "totalDiscount,totalPrice,totalTax,ver,extendName,extendPrice,img_url,img_url_80,img_url_240,img_url_600,img_url_l," +
            "img_url_m,img_url_o,img_url_s,price,prodId,prodLabel,prodName,prodNameLang,qty,tableId,nickName,openId,state,batch_state,qr) " +
            " values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ";
    var paramArr = [], i = 0;
    paramArr[i++]=params.actualPrice;
    paramArr[i++]=params.bizId;
    paramArr[i++]=params.bizImgUrl;
    paramArr[i++]=params.bizKey;
    paramArr[i++]=params.bizName;
    paramArr[i++]=params.bizNameLang;
    paramArr[i++]=params.count;
    paramArr[i++]=params.extendTotalPrice;
    paramArr[i++]=params.isCheckingPrice;
    paramArr[i++]=params.originPrice;
    paramArr[i++]=params.totalDiscount;
    paramArr[i++]=params.totalPrice;
    paramArr[i++]=params.totalTax;
    paramArr[i++]=params.ver;
    paramArr[i++]=params.extendName;
    paramArr[i++]=params.extendPrice;
    paramArr[i++]=params.img_url;
    paramArr[i++]=params.img_url_80;
    paramArr[i++]=params.img_url_240;
    paramArr[i++]=params.img_url_600;
    paramArr[i++]=params.img_url_l;
    paramArr[i++]=params.img_url_m;
    paramArr[i++]=params.img_url_o;
    paramArr[i++]=params.img_url_s;
    paramArr[i++]=params.price;
    paramArr[i++]=params.prodId;
    paramArr[i++]=params.prodLabel;
    paramArr[i++]=params.prodName;
    paramArr[i++]=params.prodNameLang;
    paramArr[i++]=params.qty;
    paramArr[i++]=params.tableId;
    paramArr[i++]=params.nickName;
    paramArr[i++]=params.openId;
    paramArr[i++]=1;//是否有效      结账后0，1有效  0无效
    paramArr[i++]=1;//本次菜品预存  下单后0，1本次有效，0本次无效
    paramArr[i++]=params.qr;
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addOrderItemTemp ');
        return callback(error,rows);
    });
}
function deleteOrderItemTemp(params,callback){
    var query = 'delete from order_item_temp where 1=1';
    var paramArr = [], i = 0;

    if(params.bizId){
        query = query + " and bizId = ? ";
        paramArr[i++] = params.bizId ;
    }
    if(params.tableId){
        query = query + " and tableId = ? ";
        paramArr[i++] = params.tableId ;
    }
    if(params.openId){
        query = query + " and openId = ? ";
        paramArr[i++] = params.openId ;
    }
    if(params.batchState){
        query = query + " and batch_state = ? ";
        paramArr[i++] = params.batchState ;
    }
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' deleteOrderItemTemp ');
        return callback(error,rows);
    });
}
function updateOrderItemTemp(params,callback){
    var query = 'update order_item_temp set state=?,batch_state=? where 1=1 ';
    var paramArr = [], i = 0;
    paramArr[i++] = params.state ;
    paramArr[i++] = params.batchState ;
    if(params.bizId){
        query = query + " and bizId = ? ";
        paramArr[i++] = params.bizId ;
    }
    if(params.tableId){
        query = query + " and tableId = ? ";
        paramArr[i++] = params.tableId ;
    }
    if(params.openId){
        query = query + " and openId = ? ";
        paramArr[i++] = params.openId ;
    }
    if(params.queryState){
        query = query + " and state = ? ";
        paramArr[i++] = params.queryState ;
    }
    if(params.queryBatchState){
        query = query + " and batch_state = ? ";
        paramArr[i++] = params.queryBatchState ;
    }
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateOrderItemTemp ');
        return callback(error,rows);
    });
}
function updateOrderItemTempBatchState(params,callback){
    var query = 'update order_item_temp set batch_state=? where bizId=? and tableId=? and openId=? and state=1';
    var paramArr = [], i = 0;
    paramArr[i++]=params.bizId;
    paramArr[i++]=params.tableId;
    paramArr[i++]=params.openId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateOrderItemTemp ');
        return callback(error,rows);
    });
}
function getOrderItemTempGroup(params,callback){
    var query = "select actualPrice,bizId,bizImgUrl,bizKey,bizName,bizNameLang,count," +
        "extendTotalPrice,isCheckingPrice,originPrice,totalDiscount,totalPrice,totalTax,ver," +
        "tableId,nickName,openId,qr " +
        "from order_item_temp " +
        "where state=?";
    var paramArr = [], i = 0;
    paramArr[i++]=params.state;
    if(params.bizId){
        query +=' and bizId=?';
        paramArr[i++]=params.bizId;
    }
    if(params.tableId){
        query +=' and tableId=?';
        paramArr[i++]=params.tableId;
    }
    if(params.openId){
        query +=' and openId<>?';
        paramArr[i++]=params.openId;
    }
    if(params.batchState){
        query +=' and batch_state=?';
        paramArr[i++]=params.batchState;
    }

    query += ' group by actualPrice,bizId,bizImgUrl,bizKey,bizName,bizNameLang,count,extendTotalPrice,' +
        'isCheckingPrice,originPrice,totalDiscount,totalPrice,totalTax,ver,tableId,nickName,openId,qr';
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getOrderItemTempGroup ');
        return callback(error,rows);
    });
}
function getOrderItemTempProds(params,callback){
    var query = "select * " +
        "from order_item_temp " +
        "where state=1 and bizId=? and tableId = ? and state = 1 and batch_state = 1 order by nickName,prodName";
    var paramArr = [], i = 0;
    paramArr[i++]=params.bizId;
    paramArr[i++]=params.tableId;
    paramArr[i++]=params.openId;
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getOrderItemTempProds ');
        return callback(error,rows);
    });
}
function getOrderMaxUpdateOn(params,callback){
    var query = "select * from order_info where biz_id=? and status = 110 order by update_on desc";
    var paramArr = [], i = 0;
    paramArr[i++]=params.bizId;
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getOrderMaxUpdateOn ');
        return callback(error,rows);
    });
}

function getOrderItemTempProdsAll(params,callback){
    var query = "select * from order_item_temp where 1=1";
    var paramArr = [], i = 0;
    if(params.bizId){
        query +=' and bizId=?';
        paramArr[i++]=params.bizId;
    }
    if(params.tableId){
        query +=' and tableId=?';
        paramArr[i++]=params.tableId;
    }
    if(params.openId){
        query +=' and openId=?';
        paramArr[i++]=params.openId;
    }
    if(params.state){
        query +=' and state=?';
        paramArr[i++]=params.state;
    }
    if(params.batchState != null){
        query +=' and batch_state=?';
        paramArr[i++]=params.batchState;
    }
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getOrderItemTempProds ');
        return callback(error,rows);
    });
}
module.exports = {
    getBizOrders : getBizOrders,
    getCustOrders : getCustOrders,
    getOrderItemById : getOrderItemById,
    addCustOrder : addCustOrder ,
    addOrderItem : addOrderItem ,
    updateOrderStatus  : updateOrderStatus ,
    updateOrderDetail : updateOrderDetail ,
    updateItemStatus : updateItemStatus,
    addItemToOrder : addItemToOrder ,
    getOrderInfoById : getOrderInfoById,
    getOrderInfoWithItem : getOrderInfoWithItem ,
    getProdWithOrderInfo : getProdWithOrderInfo ,
    updateOrderInfoPrice : updateOrderInfoPrice,
    updateOrderItem : updateOrderItem,
    deleteOrderItem  : deleteOrderItem ,
    updateOrderTable : updateOrderTable ,
    getBizTableOrders : getBizTableOrders,
    getProdWithItemInfo : getProdWithItemInfo,
    updateOrderPeopleNum : updateOrderPeopleNum ,
    getOrderWithItemForMail : getOrderWithItemForMail ,
    getBizOrderCustomer : getBizOrderCustomer,
    updateOrderStautsAndSeq : updateOrderStautsAndSeq ,
    getDayOrder : getDayOrder,
    setOrderFinish  : setOrderFinish,
    setOrderExpired : setOrderExpired ,
    deleteOrder : deleteOrder ,
    deleteOrderAllItem : deleteOrderAllItem,
    deleteOrderWithItem : deleteOrderWithItem ,
    setOrderActive : setOrderActive ,
    getBizDailyPayment : getBizDailyPayment ,
    getBizDailyOrder : getBizDailyOrder ,
    getBizDailyPaymentStat : getBizDailyPaymentStat ,
    getBizDailyOrderTypeStat : getBizDailyOrderTypeStat ,
    searchBizOrder : searchBizOrder,
    queryAllOrders: queryAllOrders,
    updateOrderSeq: updateOrderSeq,
    searchBizSeq:searchBizSeq,
    batchCancelSubmittedOrder:batchCancelSubmittedOrder,
    batchCancelSubmittedOrderNew:batchCancelSubmittedOrderNew,
    batchCompleteInProgressOrder:batchCompleteInProgressOrder,
    queryOrderItemFullInfo:queryOrderItemFullInfo,
    addOrderMoney:addOrderMoney,
    updateOrderInfoPayState:updateOrderInfoPayState,
    getOrderMoneyAleardy:getOrderMoneyAleardy,
    getOrderMoney:getOrderMoney,
    getOrderByBizStateTableId:getOrderByBizStateTableId,
    addOrderItemTemp:addOrderItemTemp,
    deleteOrderItemTemp:deleteOrderItemTemp,
    getOrderItemTempGroup:getOrderItemTempGroup,
    getOrderItemTempProds:getOrderItemTempProds,
    updateOrderInfoPriceAddItem:updateOrderInfoPriceAddItem,
    getOrderMoneyDetail:getOrderMoneyDetail,
    getOrderMaxUpdateOn:getOrderMaxUpdateOn,
    updateOrderItemTemp:updateOrderItemTemp,
    updateOrderItemTempBatchState:updateOrderItemTempBatchState,
    getOrderItemTempProdsAll:getOrderItemTempProdsAll,
    batchCancelSubmittedTableNew:batchCancelSubmittedTableNew
};