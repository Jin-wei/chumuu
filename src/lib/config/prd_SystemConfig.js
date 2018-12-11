
/**
 * Created by ling xue on 14-4-11.
 * The file used to store the config parameter;
 * When publish new version on server ,reset the configuration parameters
 */

var serverUrl = "https://tru-menu.com";

var servicePhone = "(855) 984-1861";

var elasticUrl = "45.79.69.64:9200";

var activeUserBaseUrl = serverUrl + "customer/active.html";

var activeBizBaseUrl = serverUrl + "bizUser/do/active?data=";

var spyName = "bizwise.";
var spyPassword = "esiwizb";
var maxAge=2592000;

var mysqlConnectOptions ={
    user: 'biz',
    password: 'wise',
    database:'bw',
    host: 'localhost'
};

/*PRODUCTION !!!
 var mysqlConnectOptions ={
 user: 'root',
 password: 'Mission94539',
 database:'bw',
 host: 'bw.c9erfktsehne.us-west-1.rds.amazonaws.com'
 };*/

/* STAGING
 var mysqlConnectOptions ={
 user: 'root',
 password: 'Mission94539',
 database:'bw',
 host: 'bw.ca1khqs4nesh.us-west-1.rds.amazonaws.com'
 };*/



var yelpOauthOptions = {
    consumer_key: 'CyvsvK0jH_F-z7NpzpJl7w',
    consumer_secret: 'V88_1911vFFCdP36FsfuVNRkLNo',
    token: 't0w6T9vfyhxnQY3a1qLkxySz4RfyvrDC',
    token_secret: 'e3l3G1p3MunZ8yiE-eq8lE1Q0IA',
    base_url  : "http://api.yelp.com/v2/" ,
    ssl: true
};

var logLevel = 'DEBUG';
var loggerConfig = {
    appenders: [
        //{ type: 'console' },
        {
            "type": "file",
            "filename": "/var/log/trumenu/bizwise.log",
            "maxLogSize": 2048000,
            "backups": 10
        }
    ]
}

//  sandbox
/*var brainTreeConfig  = {
    merchantId: "7yjy9df3b82q2vz8",
    publicKey: "zsct56f7wtvnmnb8",
    privateKey: "9a10aa429a033a9314b52190bf0d7910"
}*/

var brainTreeConfig  = {
 merchantId: "ydh7629zyzcpc693",
 publicKey: "gj6nvtszwhdzph6w",
 privateKey: "c153702caa959512a756257c418e9121"
 }

var brainTreeEnvironment = 1;
//var brainTreeEnvironment = 0;


var elasticSearchOption ={
    host: elasticUrl
}


function getServerUrl(){
    return serverUrl;
}

function getMysqlConnectOptions (){
    return mysqlConnectOptions;
}

function getActiveUserBaseUrl (userId ,activeData){
    return activeUserBaseUrl+"?data="+activeData+"&uid="+userId;
}
function getActiveBizBaseUrl (userId){
    return activeBizBaseUrl.replace('do',userId);
}

function getYelpOauthOptions (){
    return yelpOauthOptions;
}

function getSearchOption(){
    return elasticSearchOption
}

var systemMailConfig = {
    fromEmail : 'service@tru-menu.com',
    smtp : 'SMTP',
    options : {
        host: "smtp.zoho.com",
        secureConnection: true,
        port: 465,
        auth: {
            user: 'service@tru-menu.com',
            pass: "Mission94539"
        }
    }
}

/*var systemMailConfig = {
    fromEmail : 'service@missionpublic.com',
    smtp : 'SMTP',
    options : {
        host: "smtp.zoho.com",
        secureConnection: true,
        port: 465,
        auth: {
            user: "service@missionpublic.com",
            pass: "Mission2015"
        }
    }
}*/
/*var systemMailConfig = {
 fromEmail : 'trumenu@gmail.com',
 smtp : 'SMTP',
 options : {
 host: "smtp.gmail.com",
 port: 587,
 auth: {
 user: 'trumenu@gmail.com',
 pass: "Mission94539"
 }
 }
 }*/
var mailForward = "";

var prerenderServiceUrl="http://localhost:3000";

function getServerProtocol(){
    return serverUrl.substring(0,serverUrl.indexOf(":"));
}


var iosPushConfig = {
    production: false,
    cert: 'cert.pem',
    key : 'key.pem',
    gateway: 'gateway.sandbox.push.apple.com'
}

var iosNewOrderPushParam = {
    text : 'You have a new order need to confirm',
    badge : 1
}

var mongoConfig = {
    connect : 'mongodb://biz:wise@45.79.69.64:27017/bizwise'
};
var rabbitUrl = 'amqp://biz:wise@123.57.27.64' ;

var serverName = "chumuu";

var alipayConfig = {
    gateway : 'https://mapi.alipay.com/gateway.do?',
    partner:'2088121906293676',
    key:'d3aryvmm6bjwyukwytxnsiptrwspea8p',
    seller_email:'mpdalian@126.com',
    host:'http://chumuu.com/',
    cacert:'cacert.pem',
    return_url:"http://chumuu.com/api/alipay/return",
    notify_url:"http://chumuu.com/api/alipay/notify",
    transport:'https' ,
    input_charset:'utf-8' ,
    service:'create_direct_pay_by_user',
    sign_type:"MD5"
}

var webSocketServiceURL="http://localhost:3000";
var emailTemplates= {
    resetBizPasswordEmailTemplate: "./lib/util/emailTemplate/resetBizPassword_cn.html",
    resetBizPasswordEmailTitle: "重设厨目商家密码"
}

var weixinConfig = {
    app_id:'',
    appsecret:''
}
var text2audioConfig={
    "grant_type": "client_credentials",                 // 固定
    "client_id": "ieyCABQF7lRx7tNTPmWv907r",            // api key
    "client_secret": "KL9dt0IvSDgPhBfBpGT9rucZIic5ktkL" // Secret Key
}
module.exports = {
    getServerUrl : getServerUrl,
    getServerProtocol: getServerProtocol,
    getMysqlConnectOptions : getMysqlConnectOptions,
    getActiveUserBaseUrl : getActiveUserBaseUrl,
    getActiveBizBaseUrl : getActiveBizBaseUrl,
    getYelpOauthOptions : getYelpOauthOptions,
    getSearchOption : getSearchOption,
    loggerConfig : loggerConfig,
    servicePhone : servicePhone,
    spyName : spyName ,
    spyPassword : spyPassword ,
    systemMailConfig : systemMailConfig ,
    logLevel : logLevel ,
    mailForward : mailForward,
    brainTreeConfig : brainTreeConfig ,
    getServerProtocol: getServerProtocol,
    prerenderServiceUrl:prerenderServiceUrl,
    brainTreeEnvironment : brainTreeEnvironment ,
    iosPushConfig : iosPushConfig ,
    iosNewOrderPushParam : iosNewOrderPushParam ,
    mongoConfig : mongoConfig ,
    rabbitUrl : rabbitUrl,
    serverName : serverName ,
    alipayConfig : alipayConfig,
    webSocketServiceURL:webSocketServiceURL,
    emailTemplates:emailTemplates,
    maxAge:maxAge,
    weixinConfig:weixinConfig,
    text2audioConfig:text2audioConfig
}
