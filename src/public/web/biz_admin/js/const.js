/**
 * Created by Josh on 2/24/16.
 */

var Const = Const || {};
Const.TICKET_STATUS = {
    UN_USE:1,
    USED:2,
    DESC : {
        1:'未消费',
        2:'已消费'
    }
};

Const.ORDER_STATUS = {
    PENDING:100,
    CANCELED:101,
    CONFIRMED:102,
    PROGRESS:103,
    COMPLETED:104,
    EXPIRED:109,
    DINING:110,
    PADY:111,
    DESC : {
        100:'待确认',
        101:'已取消',
        102:'已确认',
        103:'进行中',
        104:'已完成',
        109:'已失效',
        110:'就餐中',
        111:'已结账'
    }
};

Const.ORDER_TYPE = {
    DINE_IN: 1,
    TOGO: 2,
    DESC: {
        1: '堂吃',
        2: '配送'
    }
};

Const.ORDER_COMPLAINT_STATUS = {
    PENDING: 1,
    CONFIRMED: 2,
    COMPLETED: 3,
    DESC: {
        1: '待处理',
        2: '已受理',
        3: '已解决'
    }
};

Const.COUPON_STATUS = {
    VALID: 1,
    USED: 2,
    EXPIRED: 3,
    DESC: {
        1: '有效',
        2: '已使用',
        3: '已过期'
    }
};

/**
 * 下面表示: 此时 add_contact 是在order的流程中 (因为不同的状态, 需要跳转到不同的页面)
 * var progressStatus = (1<<Const.PROGRESS_STATUS.ORDER) | (1<<Const.PROGRESS_STATUS.ADD_CONTACT);
 * 注:
 * 低15位表示page, 高15位显示method
 * */
Const.PROGRESS_STATUS = {
    ORDER:0,
    GIVE:1,
    USE_TICKET:2,
    CONTACT_LIST:3,

    EDIT_CONTACT:16,
    ADD_CONTACT:17,
    SELECT_CONTACT:18
};

Const.COOKIE_VER  = 1;
