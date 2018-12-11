var sysConfig = require('../../lib/config/SystemConfig');

var WECHAT_APPID =sysConfig.weixinConfig.app_id;

var WECHAT_SECRET = sysConfig.weixinConfig.appsecret;

var WECHAT_PAYMENT_KEY = "904edce3704a927559b620ee833bde45";

var WECHAT_MCH_ID = "1247094701";

var WECHAT_EXPIRED_TIME = 7100;

var WECHAT_POST_MSG_TYPE = "event" ;

var WECHAT_TEST_APPID ="wxa67b910a8b3bc02b";

var WECHAT_TEST_SECRET ="df70f9896a68bbf8aa8b46827a8ab39f";

var WECHAT_NONCESTR = "903197632";

var WECHAT_EVENT_UNSUB_TYPE = "unsubscribe";
var WECHAT_EVENT_SUB_TYPE = "subscribe";

var WECHAT_MSG_TYPE_TEXT = "text";
var WECHAT_MSG_TYPE_VOICE = "voice";
var WECHAT_MSG_TYPE_IMAGE = "image";
var WECHAT_MSG_TYPE_VIDEO = "video";
var WECHAT_MSG_TYPE_MUSIC = "music";
var WECHAT_MSG_TYPE_NEWS = "news";

var WECHAT_USER_STATUS_ACTIVE = 1;
var WECHAT_USER_STATUS_NO_ACTIVE = 0;


var WECHAT_INFO_WELCOME_CONST = {
    type : "text",
    text : "欢迎访问厨目,在这里您可以获取更多的吃货信息"
}

/*var WECHAT_INFO_WELCOME_CONST = {
    type : "news",
    articles :[
        {
            title:"欢迎关注厨目" ,
            description: "厨目为您提供最新的饮食咨询，餐馆查询以及优惠信息",
            url: "http://yipincaidan.com",
            picurl: "https://tru-menu.com/customer/image/Homepage-pic1.jpg"
        }
    ]

}*/

var WECHAT_MENU = {
    "button": [
        {
            "type": "view",
            "name": "订咖啡",
            "url": "http://m.yipincaidan.com/coffee/coffee_order.html",
            "sub_button": [ ]
        },
        {
            "type": "view",
            "name": "请人喝",
            "url": "http://m.yipincaidan.com/coffee/coffee_give.html",
            "sub_button": [ ]
        },
        {
            "name": "我的",
            "sub_button": [
                {
                    "type": "view",
                    "name": "账户",
                    "url": "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx8c637901f2bca3ae&redirect_uri=http%3A%2F%2Fm.yipincaidan.com%2Fcoffee%2Fcoffee_profile.html&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect",
                    "sub_button": [ ]
                },
                {
                    "type": "view",
                    "name": "订单",
                    "url": "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx8c637901f2bca3ae&redirect_uri=http%3A%2F%2Fm.yipincaidan.com%2Fcoffee%2Fcoffee_order_list.html&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect",
                    "sub_button": [ ]
                },
                {
                    "type": "view",
                    "name": "反馈",
                    "url": "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx8c637901f2bca3ae&redirect_uri=http%3A%2F%2Fm.yipincaidan.com%2Fpayment%2FwechatPay.html&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect",
                    "sub_button": [ ]
                }
            ]
        }
    ]
};

var WECHAT_PAYMENT_CALLBACK = encodeURIComponent("http://m.yipincaidan.com/api/wechat/paymentCallback");

module.exports = {
    WECHAT_APPID : WECHAT_APPID,
    WECHAT_SECRET : WECHAT_SECRET,
    WECHAT_EXPIRED_TIME : WECHAT_EXPIRED_TIME ,
    WECHAT_MENU : WECHAT_MENU,
    WECHAT_MSG_TYPE_TEXT : WECHAT_MSG_TYPE_TEXT,
    WECHAT_MSG_TYPE_VOICE : WECHAT_MSG_TYPE_VOICE,
    WECHAT_MSG_TYPE_IMAGE : WECHAT_MSG_TYPE_IMAGE,
    WECHAT_MSG_TYPE_VIDEO : WECHAT_MSG_TYPE_VIDEO,
    WECHAT_MSG_TYPE_MUSIC : WECHAT_MSG_TYPE_MUSIC,
    WECHAT_MSG_TYPE_NEWS  : WECHAT_MSG_TYPE_NEWS ,
    WECHAT_POST_MSG_TYPE : WECHAT_POST_MSG_TYPE ,
    WECHAT_EVENT_UNSUB_TYPE : WECHAT_EVENT_UNSUB_TYPE ,
    WECHAT_EVENT_SUB_TYPE : WECHAT_EVENT_SUB_TYPE ,
    WECHAT_INFO_WELCOME_CONST : WECHAT_INFO_WELCOME_CONST,
    WECHAT_USER_STATUS_NO_ACTIVE : WECHAT_USER_STATUS_NO_ACTIVE,
    WECHAT_USER_STATUS_ACTIVE : WECHAT_USER_STATUS_ACTIVE,
    WECHAT_MCH_ID : WECHAT_MCH_ID,
    WECHAT_PAYMENT_KEY : WECHAT_PAYMENT_KEY,
    WECHAT_PAYMENT_CALLBACK : WECHAT_PAYMENT_CALLBACK ,
    WECHAT_NONCESTR : WECHAT_NONCESTR,
    WECHAT_TEST_APPID:WECHAT_TEST_APPID,
    WECHAT_TEST_SECRET:WECHAT_TEST_SECRET
}