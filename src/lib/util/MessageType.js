/**
 * Created by ling xue  on 15-10-23.
 */

/**
 * RABBIT QUEUE TYPE
 * */

var RABBIT_QUEUE_ERROR = "error" ;
var RABBIT_QUEUE_NORMAL = "chumuu";

var MESSAGE_TYPE_SMS = "1" ;
var MESSAGE_TYPE_ORDER= "2";
var MESSAGE_TYPE_USER= "3";
var MESSAGE_TYPE_OTHER = "9" ;

var MESSAGE_SUB_TYPE_SIGNIN = "1" ;
var MESSAGE_SUB_TYPE_PASSWORD = "2";
var MESSAGE_SUB_TYPE_VERIFY_CONFIRM = "301";
var MESSAGE_SUB_TYPE_VERIFY_REJECT = "302";
var MESSAGE_SUB_TYPE_ORDER_SENT = '101';
var MESSAGE_SUB_TYPE_ORDER_ACCEPTED = '102';
var MESSAGE_SUB_TYPE_ORDER_CONFIRMED = '103';
var MESSAGE_SUB_TYPE_ORDER_CANCELED = '104';
var MESSAGE_SUB_TYPE_ORDER_TRANSPORTING = '105';
var MESSAGE_SUB_TYPE_ORDER_FINISHED = '106';
var MESSAGE_SUB_TYPE_ORDER_AUTO_FINISHED = '107';
var MESSAGE_SUB_TYPE_ORDER_EXPIRED = '109';

var MESSAGE_SUB_TYPE_ORDER_CONTAINER = '201';


var RABBIT_EXCHANGE = "chumuu";
var RABBIT_TOPIC_NOTIFICATION = "notification";
var RABBIT_TOPIC_ORDER = "order";

var MESSAGE_SMS_PASSWORD = {
    type : MESSAGE_TYPE_SMS ,
    subType : MESSAGE_SUB_TYPE_PASSWORD,
    phone : 'phone',
    code : 'captchaKey'
}

var MESSAGE_SMS_SIGNIN = {
    type : MESSAGE_TYPE_SMS ,
    subType : MESSAGE_SUB_TYPE_SIGNIN,
    phone : 'phone',
    code : 'captchaKey'
}

var MESSAGE_SMS_VERIFY_CONFIRM = {
    type : MESSAGE_TYPE_USER ,
    subType : MESSAGE_SUB_TYPE_VERIFY_CONFIRM,
    userId : 'userId'
}

var MESSAGE_SMS_VERIFY_REJECT = {
    type : MESSAGE_TYPE_USER ,
    subType : MESSAGE_SUB_TYPE_VERIFY_REJECT,
    userId : 'userId'
}

var MESSAGE_ORDER_TAKED = {
    type : MESSAGE_TYPE_ORDER ,
    subType : MESSAGE_SUB_TYPE_ORDER_ACCEPTED,
    orderId : 'orderId'
}

var MESSAGE_ORDER_CONFIRM = {
    type : MESSAGE_TYPE_ORDER ,
    subType : MESSAGE_SUB_TYPE_ORDER_CONFIRMED,
    orderId : 'orderId'
}


var MESSAGE_ORDER_CANCELLED = {
    type : MESSAGE_TYPE_ORDER ,
    subType : MESSAGE_SUB_TYPE_ORDER_CANCELED,
    orderId : 'orderId'
}

var MESSAGE_ORDER_FINISHED = {
    type : MESSAGE_TYPE_ORDER ,
    subType : MESSAGE_SUB_TYPE_ORDER_FINISHED,
    orderId : 'orderId'
}

var MESSAGE_ORDER_CONTAINER = {
    type : MESSAGE_TYPE_ORDER ,
    subType : MESSAGE_SUB_TYPE_ORDER_CONTAINER,
    orderId : 'orderId',
    containerId : 'containerId',
    sealId : 'sealId',
    cabinId : 'cabinId'
}

module.exports ={
    RABBIT_QUEUE_ERROR : RABBIT_QUEUE_ERROR,
    RABBIT_QUEUE_NORMAL : RABBIT_QUEUE_NORMAL ,
    MESSAGE_TYPE_SMS : MESSAGE_TYPE_SMS ,
    MESSAGE_TYPE_ORDER : MESSAGE_TYPE_ORDER ,
    MESSAGE_TYPE_USER: MESSAGE_TYPE_USER ,
    MESSAGE_TYPE_OTHER :  MESSAGE_TYPE_OTHER ,
    MESSAGE_SUB_TYPE_PASSWORD : MESSAGE_SUB_TYPE_PASSWORD ,
    MESSAGE_SUB_TYPE_SIGNIN : MESSAGE_SUB_TYPE_SIGNIN ,
    MESSAGE_SUB_TYPE_VERIFY_CONFIRM : MESSAGE_SUB_TYPE_VERIFY_CONFIRM ,
    MESSAGE_SUB_TYPE_VERIFY_REJECT : MESSAGE_SUB_TYPE_VERIFY_REJECT ,
    MESSAGE_SUB_TYPE_ORDER_SENT : MESSAGE_SUB_TYPE_ORDER_SENT ,
    MESSAGE_SUB_TYPE_ORDER_ACCEPTED : MESSAGE_SUB_TYPE_ORDER_ACCEPTED ,
    MESSAGE_SUB_TYPE_ORDER_CONFIRMED : MESSAGE_SUB_TYPE_ORDER_CONFIRMED ,
    MESSAGE_SUB_TYPE_ORDER_CANCELED : MESSAGE_SUB_TYPE_ORDER_CANCELED ,
    MESSAGE_SUB_TYPE_ORDER_TRANSPORTING : MESSAGE_SUB_TYPE_ORDER_TRANSPORTING ,
    MESSAGE_SUB_TYPE_ORDER_FINISHED :MESSAGE_SUB_TYPE_ORDER_FINISHED ,
    MESSAGE_SUB_TYPE_ORDER_AUTO_FINISHED :MESSAGE_SUB_TYPE_ORDER_AUTO_FINISHED ,
    MESSAGE_SUB_TYPE_ORDER_EXPIRED :MESSAGE_SUB_TYPE_ORDER_EXPIRED ,
    MESSAGE_SUB_TYPE_ORDER_CONTAINER : MESSAGE_SUB_TYPE_ORDER_CONTAINER ,
    RABBIT_EXCHANGE : RABBIT_EXCHANGE ,
    RABBIT_TOPIC_NOTIFICATION : RABBIT_TOPIC_NOTIFICATION ,
    RABBIT_TOPIC_ORDER : RABBIT_TOPIC_ORDER ,
    MESSAGE_SMS_PASSWORD : MESSAGE_SMS_PASSWORD ,
    MESSAGE_SMS_SIGNIN : MESSAGE_SMS_SIGNIN ,
    MESSAGE_SMS_VERIFY_CONFIRM : MESSAGE_SMS_VERIFY_CONFIRM ,
    MESSAGE_SMS_VERIFY_REJECT : MESSAGE_SMS_VERIFY_REJECT ,
    MESSAGE_ORDER_TAKED : MESSAGE_ORDER_TAKED ,
    MESSAGE_ORDER_CONFIRM : MESSAGE_ORDER_CONFIRM ,
    MESSAGE_ORDER_CANCELLED : MESSAGE_ORDER_CANCELLED,
    MESSAGE_ORDER_FINISHED: MESSAGE_ORDER_FINISHED ,
    MESSAGE_ORDER_CONTAINER : MESSAGE_ORDER_CONTAINER

}