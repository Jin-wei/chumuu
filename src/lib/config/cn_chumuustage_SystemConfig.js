
/**
 * Created by ling xue on 14-4-11.
 * The file used to store the config parameter;
 * When publish new version on server ,reset the configuration parameters
 */

var serverUrl = "http://stg.cn.chumuu.com";

var servicePhone = "408-934-3970";

var elasticUrl = "127.0.0.1:9200";

var activeUserBaseUrl = serverUrl + "customer/active.html";

var activeBizBaseUrl = serverUrl + "bizUser/do/active?data=";

var spyName = "bizwise.";
var spyPassword = "esiwizb";
var maxAge=0;


var mysqlConnectOptions ={
    user: 'biz',
    password: 'wise',
    database:'bw',
    host: 'localhost'
};
// var mysqlConnectOptions ={
//     user: 'mproot',
//     password: 'Mission2014!',
//     database:'bw_44',
//     host: 'rds8ys63039798x4d7w1.mysql.rds.aliyuncs.com'
// };

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


var brainTreeEnvironment = 0;

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
// var mongoConfig = {
//     connect : 'mongodb://localhost:27017/bizwise'
// }
var mongoConfig = {
    connect : 'mongodb://39.106.69.210:27017/bizwise'
}
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
    app_id:'wxa67b910a8b3bc02b',//测试公众号的app_id
    appsecret:'df70f9896a68bbf8aa8b46827a8ab39f',//测试公众号的app_secret
    // app_id:'wxd3c16e96825dc6b8',
    // appsecret:'b5e5969b63f77b1d8d123536553eeb4a',
    mch_id:'1502319041',
    partner_key:"Cp3Td1x4nRv9rzPQPMdKof2Gxs1rCl2X",
    notify_url:'http://stg.cn.chumuu.com/api/wxPayResource',
    redirect_url:"http://stg.cn.chumuu.com/wxpay",
    spbill_create_ip:"60.205.227.44"
};

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
