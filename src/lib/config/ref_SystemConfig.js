
/**
 * Created by ling xue on 14-4-11.
 * The file used to store the config parameter;
 * When publish new version on server ,reset the configuration parameters
 */

var serverUrl = "http://localhost:8080";

var servicePhone = "408-934-3970";

var elasticUrl = "127.0.0.1:9200";

var activeUserBaseUrl = serverUrl + "customer/active.html";

var activeBizBaseUrl = serverUrl + "bizUser/do/active?data=";

var spyName = "bizwise.";
var spyPassword = "esiwizb";
var maxAge=2592000;


var mysqlConnectOptions ={
    user: 'biz',
    password: 'wise',
    database:'bw',
    host: '127.0.0.1'
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


var brainTreeConfig  = {

    merchantId: "7yjy9df3b82q2vz8",
    publicKey: "zsct56f7wtvnmnb8",
    privateKey: "9a10aa429a033a9314b52190bf0d7910"
}

/* product
 var brainTreeConfig  = {
 merchantId: "ydh7629zyzcpc693",
 publicKey: "gj6nvtszwhdzph6w",
 privateKey: "c153702caa959512a756257c418e9121"
 }
 */

var brainTreeEnvironment = 1;

var elasticSearchOption ={
    host: elasticUrl
}


function getServerUrl(){
    return serverUrl;
}

function getServerProtocol(){
    return serverUrl.substring(0,serverUrl.indexOf(":"));
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

/*var systemMailConfig = {
 fromEmail : 'ling.xue@missionpublic.com',
 smtp : 'SMTP',
 options : {
 host: "smtpout.secureserver.net",
 //secureConnection: true,
 port: 25,
 auth: {
 user: "ling.xue@missionpublic.com",
 pass: "Dalian2014"
 }
 }
 }*/
var systemMailConfig = {
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
}
var mailForward = "order-no-reply@tru-menu.com";

var prerenderServiceUrl="http://localhost:3000";

var iosPushConfig = {
    cert: 'cert.pem',
    key:  'key.pem',
    gateway: 'gateway.sandbox.push.apple.com',
    port: 2195
}
var iosNewOrderPushParam = {
    text : 'You have a new order need to confirm',
    badge : 1
}
var mongoConfig = {
    connect : 'mongodb://localhost:27017/bizwise'
}

var webSocketServiceURL="http://localhost:3000"
var emailTemplates= {
    resetBizPasswordEmailTemplate: "./lib/util/emailTemplate/resetBizPassword_cn.html",
    resetBizPasswordEmailTitle: "重设厨目商家密码"
}

var weixinConfig = {
    app_id:'wxa67b910a8b3bc02b',
    appsecret:'df70f9896a68bbf8aa8b46827a8ab39f'
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
    servicePhone : servicePhone,
    spyName : spyName ,
    spyPassword : spyPassword ,
    systemMailConfig : systemMailConfig ,
    mailForward : mailForward,
    brainTreeConfig : brainTreeConfig,
    prerenderServiceUrl:prerenderServiceUrl,
    brainTreeEnvironment : brainTreeEnvironment,
    iosPushConfig : iosPushConfig ,
    iosNewOrderPushParam : iosNewOrderPushParam,
    mongoConfig : mongoConfig,
    webSocketServiceURL:webSocketServiceURL,
    emailTemplates:emailTemplates,
    maxAge:maxAge,
    weixinConfig:weixinConfig,
    text2audioConfig:text2audioConfig
}
