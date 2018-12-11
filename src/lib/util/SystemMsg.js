/**
 * Created by ling xue on 14-4-29.
 * The file is include all the client message of system.
 * The message used to be a tip on the client.
 * EX. module_api_logic_result
 */

/**
 * The module of system basic module
 * @type {string}
 */
var SYS_AUTH_TOKEN_ERROR ="Access token error ,the Api can't be accessed" ; //The token info in request headers is error,can't access api.
var SYS_VALIDATE_EMAIL_ERROR = "The email is not correct"; // The email will be used format is not correct.
var SYS_INTERNAL_ERROR_MSG = "Web Service Internal Error . ";
var SYS_TABLE_DUPLICATE_ERROR_MSG = "Duplicate parameter !";
var SYS_TAX_DUPLICATE_ERROR_MSG = "Duplicate parameter !";
var SYS_MESSAGE_QUEUE_ERROR_MSG = "Message queue is down !";
/**
 * The module of customer
 * @type {string}
 */
var CUST_SIGNUP_EMAIL_REGISTERED = "The user with the same email address already exists.";//Cutomer do signup ,but the current email has been exist in system.
var CUST_LOGIN_EMAIL_UNREGISTERED = "This email is not registered with tru-menu."; //Customer use a email that not exist in system to login.
var CUST_LOGIN_PHONE_UNREGISTERED = "This phone number is not registered with tru-menu."; //Customer use a phone that not exist in system to login.
var CUST_LOGIN_PSWD_ERROR = "or password you entered is incorrect." ; // Customer enter a wrong password on login
var CUST_ORIGIN_PSWD_ERROR = "The Origin Password is not correct" ; //Customer need enter origin password before change new login password

var CUST_SIGNUP_PHONE_REGISTERED = "手机号已被注册";//Cutomer do signup ,but the current phone has been exist in system.
var CUST_LOGIN_USER_PHONE_UNREGISTERED = "手机号尚未注册"; //Customer use a email that not exist in system to login.
var CUST_SMS_CAPTCHA_ERROR = "短信验证码错误";

var CUST_ACTIVE_DATA_ERROR = "The active url is not valid"; //The active data is wrong in active url.
var CUST_ACTIVE_DUPLICATE_ERROR = "The user has been actived" // User do active when user state is active.
var CUST_ACTIVE_STATE_ERROR = "The user is not actived" // User do active when user state is active.
var CUST_FORBIDDEN_STATE_ERROR = "The user is forbidden" // User status is forbidden.
var CUST_CHANGE_EMAIL_DATA_ERROR = "The change email url is not valid" // User do active when user state is active.

/**
 * The module for admin
 */
var ADMIN_LOGIN_USER_UNREGISTERED = "用户不存在"; //Customer use a email that not exist in system to login.
var ADMIN_INPUT_DATA_PRICE_ERROR = " prices is not a number format or equal to zero!";// Customer input the menu prices is not a number format or equal to zero
var ADMIN_FAILED_INSERT_PRODUCT_ERROR = "Failed insert new prod at index: ";
var ADMIN_FAILED_UPDATE_PRODUCT_ERROR = "Failed update new prod at index: ";


/**
 * The module of business
 * @type {string}
 */
var BIZ_QUERY_NO_EXIST = "Thi business is not found";//Can not get the biz by id or location.

/**
 * The module of biz user
 * @type {string}
 */
var BIZUSER_SIGNUP_EMAIL_REGISTERED = "an user with the same email address already exists.";//Biz user do signup ,but the current email has been exist in system.
var BIZUSER_LOGIN_USER_UNREGISTERED = "This email is not registered with tru-menu."; //Biz user use a email that not exist in system to login.
var BIZUSER_LOGIN_PSWD_ERROR = "The email or password you entered is incorrect." ; // Biz user enter a wrong password on login
var BIZUSER_ORIGIN_PSWD_ERROR = "The Origin Password is incorrect." ; //Biz user need enter origin password before change new login password
var BIZUSER_ACTIVE_DATA_ERROR = "The active url is not invalid."; //The active data is wrong in active url.
var BIZUSER_ACTIVE_DUPLICATE_ERROR = "The user has been actived." // Biz user is active by active url.



/**
 * The module of products
 * @type {string}
 */
var PROD_QUERY_BIZ_NO_DATA = "Product List of Biz is not found." ;// The data of business product is null.
var PROD_QUERY_NO_EXIST = "Product is not found." // The product is not exist
var PROD_QUERY_TYPE_BIZ_NULL = "Product categories of this Biz are not found."; //The product category of business is null.
var PROD_QUERY_TOP_NULL = "Get Top Dishes List is not found." ; //The data of recommend dishes is null.
var PROD_CREATE_TYPE_DUPLICATE = "The product type has been exist in business" ; // Create a product type with duplicate type name in biz
var BIZ_MENU_NAME_DUPLICATE = "The menu has been exist in business" ;
var BIZ_MENU_HAVE_PROD_TYPE = "This menu is classified." ;
var BIZ_MENU_PRODID_NO_EXIST = "BaiduTranslate name or bizId or prodId is not exit" ;
/**
 * The module of coupon
 * @type {string}
 */
var COUPON_SEND_INVALID_USER = "Invalid to customer"; // User create a coupon and send to a invalid user in system.


/**
 * The module of promotion
 * @type {string}
 */
var PROMO_QUERY_BIZ_NO_DATA = "The business have no promotion"; //The data of business promotion is null.
var PROMO_QUERY_PROD_NULL ="The product have no promotion"; //The data of product promotion is null.
var PROMO_QUERY_NO_EXIST = "The promotion is not exsit now" ;//The promotion is not exist or  expired.

/**
 * The module of image
 * @type {string}
 */
var IMG_QUERY_NO_EXIST = "The image is not found"; //can not get image by meta data.

/**
 * The module of image
 * @type {string}
 */
var POINT_QUERY_NO_EXIST = "The point is not found"; //can not get point by id.


/**
 * The module of api record status
 * @type {string}
 */
var SYS_ADD_API_RECORD_ERROR = "Can not add api to mongodb";


/**
 * The module of order
 * @type {string}
 */
var ORDER_CREATE_ORDER_ERROR = "Create order error";
var ORDER_CREATE_ORDER_ITEM_ERROR = "Create menu item error";

/**
 * The module of payment
 */
var PAYMENT_GET_NONCE_ERROR = "Can not get authorization from braintree";
var PAYMENT_GET_TOKEN_ERROR = "Can not create braintree token for payment";
var PAYMENT_SERVICE_ERROR = 'Payment error';
var PAYMENT_SERVICE_ORDER_ERROR = '订单信息错误，支付失败';
var PAYMENT_ALIPAY_NOTIFY_SIGN_ERROR = "接收支付宝通知错误,签名不匹配";

/**
 * The module of weixin
 */
var WEIXIN_ACCESSENTOKEN_CODE_ERROR='wx code missing';
var WEIXIN_ACCESSENTOKEN_ERROR='wx access token missing';
var WEIXIN_USER_DATA_ERROR='wx access token or openid missing';

/**
 * Export
 * @type {{SYS_AUTH_TOKEN_ERROR: string, SYS_VALIDATE_EMAIL_ERROR: string, CUST_SIGNUP_EMAIL_REGISTERED: string, CUST_LOGIN_USER_UNREGISTERED: string, CUST_ORIGIN_PSWD_ERROR: string, CUST_LOGIN_PSWD_ERROR: string, CUST_ACTIVE_DATA_ERROR: string, CUST_ACTIVE_DUPLICATE_ERROR: string, PROD_QUERY_BIZ_NO_DATA: string, PROD_QUERY_NO_EXIST: string, PROD_QUERY_TYPE_BIZ_NULL: string, PROD_QUERY_TOP_NULL: string, COUPON_SEND_INVALID_USER: string}}
 */
module.exports = {
    SYS_AUTH_TOKEN_ERROR : SYS_AUTH_TOKEN_ERROR,
    SYS_VALIDATE_EMAIL_ERROR : SYS_VALIDATE_EMAIL_ERROR,
    SYS_INTERNAL_ERROR_MSG : SYS_INTERNAL_ERROR_MSG,
    SYS_TABLE_DUPLICATE_ERROR_MSG : SYS_TABLE_DUPLICATE_ERROR_MSG ,
    SYS_TAX_DUPLICATE_ERROR_MSG : SYS_TAX_DUPLICATE_ERROR_MSG ,

    CUST_SIGNUP_EMAIL_REGISTERED : CUST_SIGNUP_EMAIL_REGISTERED,
    //CUST_LOGIN_USER_UNREGISTERED : CUST_LOGIN_USER_UNREGISTERED,
    CUST_LOGIN_EMAIL_UNREGISTERED : CUST_LOGIN_EMAIL_UNREGISTERED,
    CUST_LOGIN_PHONE_UNREGISTERED : CUST_LOGIN_PHONE_UNREGISTERED,
    CUST_ORIGIN_PSWD_ERROR : CUST_ORIGIN_PSWD_ERROR,
    CUST_LOGIN_PSWD_ERROR : CUST_LOGIN_PSWD_ERROR,

    CUST_SIGNUP_PHONE_REGISTERED : CUST_SIGNUP_PHONE_REGISTERED,
    CUST_LOGIN_USER_PHONE_UNREGISTERED : CUST_LOGIN_USER_PHONE_UNREGISTERED,
    CUST_SMS_CAPTCHA_ERROR : CUST_SMS_CAPTCHA_ERROR,

    CUST_ACTIVE_DATA_ERROR : CUST_ACTIVE_DATA_ERROR,
    CUST_ACTIVE_DUPLICATE_ERROR : CUST_ACTIVE_DUPLICATE_ERROR,
    CUST_ACTIVE_STATE_ERROR : CUST_ACTIVE_STATE_ERROR,
    CUST_CHANGE_EMAIL_DATA_ERROR : CUST_CHANGE_EMAIL_DATA_ERROR,
    CUST_FORBIDDEN_STATE_ERROR : CUST_FORBIDDEN_STATE_ERROR ,

    BIZ_QUERY_NO_EXIST : BIZ_QUERY_NO_EXIST,

    BIZUSER_SIGNUP_EMAIL_REGISTERED : BIZUSER_SIGNUP_EMAIL_REGISTERED,
    BIZUSER_LOGIN_USER_UNREGISTERED : BIZUSER_LOGIN_USER_UNREGISTERED,
    BIZUSER_LOGIN_PSWD_ERROR : BIZUSER_LOGIN_PSWD_ERROR,
    BIZUSER_ORIGIN_PSWD_ERROR : BIZUSER_ORIGIN_PSWD_ERROR,
    BIZUSER_ACTIVE_DATA_ERROR :BIZUSER_ACTIVE_DATA_ERROR,
    BIZUSER_ACTIVE_DUPLICATE_ERROR : BIZUSER_ACTIVE_DUPLICATE_ERROR,

    PROD_QUERY_BIZ_NO_DATA : PROD_QUERY_BIZ_NO_DATA,
    PROD_QUERY_NO_EXIST : PROD_QUERY_NO_EXIST,
    PROD_QUERY_TYPE_BIZ_NULL : PROD_QUERY_TYPE_BIZ_NULL,
    PROD_QUERY_TOP_NULL : PROD_QUERY_TOP_NULL,
    PROD_CREATE_TYPE_DUPLICATE : PROD_CREATE_TYPE_DUPLICATE,

    COUPON_SEND_INVALID_USER : COUPON_SEND_INVALID_USER,

    PROMO_QUERY_BIZ_NO_DATA : PROMO_QUERY_BIZ_NO_DATA,
    PROMO_QUERY_PROD_NULL : PROMO_QUERY_PROD_NULL,
    PROMO_QUERY_NO_EXIST : PROMO_QUERY_NO_EXIST,

    IMG_QUERY_NO_EXIST : IMG_QUERY_NO_EXIST,

    POINT_QUERY_NO_EXIST : POINT_QUERY_NO_EXIST,

    SYS_ADD_API_RECORD_ERROR : SYS_ADD_API_RECORD_ERROR,

    ORDER_CREATE_ORDER_ERROR : ORDER_CREATE_ORDER_ERROR,
    ORDER_CREATE_ORDER_ITEM_ERROR : ORDER_CREATE_ORDER_ITEM_ERROR ,

    PAYMENT_GET_NONCE_ERROR : PAYMENT_GET_NONCE_ERROR,
    PAYMENT_GET_TOKEN_ERROR : PAYMENT_GET_TOKEN_ERROR,
    PAYMENT_SERVICE_ERROR : PAYMENT_SERVICE_ERROR ,
    PAYMENT_SERVICE_ORDER_ERROR : PAYMENT_SERVICE_ORDER_ERROR ,
    PAYMENT_ALIPAY_NOTIFY_SIGN_ERROR : PAYMENT_ALIPAY_NOTIFY_SIGN_ERROR ,

    ADMIN_LOGIN_USER_UNREGISTERED : ADMIN_LOGIN_USER_UNREGISTERED ,
    SYS_MESSAGE_QUEUE_ERROR_MSG : SYS_MESSAGE_QUEUE_ERROR_MSG,
    ADMIN_INPUT_DATA_PRICE_ERROR:ADMIN_INPUT_DATA_PRICE_ERROR,
    ADMIN_FAILED_INSERT_PRODUCT_ERROR:ADMIN_FAILED_INSERT_PRODUCT_ERROR,
    ADMIN_FAILED_UPDATE_PRODUCT_ERROR:ADMIN_FAILED_UPDATE_PRODUCT_ERROR,

    WEIXIN_ACCESSENTOKEN_CODE_ERROR:WEIXIN_ACCESSENTOKEN_CODE_ERROR,
    WEIXIN_ACCESSENTOKEN_ERROR:WEIXIN_ACCESSENTOKEN_ERROR,
    WEIXIN_USER_DATA_ERROR:WEIXIN_USER_DATA_ERROR,
    BIZ_MENU_NAME_DUPLICATE:BIZ_MENU_NAME_DUPLICATE,
    BIZ_MENU_HAVE_PROD_TYPE:BIZ_MENU_HAVE_PROD_TYPE,
    BIZ_MENU_PRODID_NO_EXIST:BIZ_MENU_PRODID_NO_EXIST
}