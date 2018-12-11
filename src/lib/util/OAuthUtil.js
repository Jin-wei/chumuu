/**
 * Created by ibm on 14-3-25.
 */

var baseUtil = require('./BaseUtil.js');
var serializer = require('serializer');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('OAuthUtil.js');
var options ={
    crypt_key: 'mp',
    sign_key: 'bizwise'
};

var extraDataOptions = {
    customer : 'trueMenu',
    business : 'bizwise'

};

var clientType = {
    biz : 'biz',
    customer : 'customer',
    admin : 'admin',
    sa : 'sa'
};

var bizRoleType = {
    owner : 9 ,
    manager : 8 ,
    waiter : 1,
    other : 0
};

var clientId ="mp";

var headerTokenMeta = "auth-token";
var cookieCustomerMeta = 'customer-token';
var cookieBizMeta = 'auth-token';

//The expired time 30 days
var expiredTime = 30*24*60*60*1000;
serializer = serializer.createSecureSerializer(options.crypt_key, options.sign_key);



function _extend(dst,src) {

    var srcs = [];
    if ( typeof(src) == 'object' ) {
        srcs.push(src);
    } else if ( typeof(src) == 'array' ) {
        for (var i = src.length - 1; i >= 0; i--) {
            srcs.push(this._extend({},src[i]))
        };
    } else {
        throw new Error("Invalid argument")
    }

    for (var i = srcs.length - 1; i >= 0; i--) {
        for (var key in srcs[i]) {
            dst[key] = srcs[i][key];
        }
    };

    return dst;
}

function createAccessToken(userId,customerFlag,active){
    var extraData ;
    if(customerFlag){
        extraData = extraDataOptions['customer'];
    }else{
        extraData = extraDataOptions['business'];
    }
    /*var activeFlag = 1;
    if(active){
        activeFlag = active;
    }*/

    var out = _extend({}, {
        access_token: serializer.stringify([userId, clientId, +new Date, extraData]),
        refresh_token: null
    });
    return out.access_token;
}

/**
 *
 * @param client biz or customer
 * @param id bizId or custId
 * @param extraData is a object if customer token then it is null ,if biz token then bizUserId and roleType
 */
function createNewAccessToken(client,id,userId ,roleType){
    var out ;
    if(client && client == clientType.biz){
        //Create biz token
        out = _extend({}, {
            access_token: serializer.stringify([client, id , +new Date ,userId,roleType]),
            refresh_token: null
        });
    }else if(client && client == clientType.admin){
        out = _extend({}, {
            access_token: serializer.stringify([client, id , +new Date ,userId,roleType]),
            refresh_token: null
        });
    }else if(client && client == clientType.sa){
        // create customer token
        out = _extend({}, {
            access_token: serializer.stringify([clientType.sa ,  id ,+new Date ]),
            refresh_token: null
        });
    }else{
        // create customer token
        out = _extend({}, {
            access_token: serializer.stringify([clientType.customer ,  id ,+new Date ]),
            refresh_token: null
        });
    }
    return out.access_token;
}

function createCustAccessToken(cust){
   // create customer token
    out = _extend({}, {
        access_token: serializer.stringify([clientType.customer , cust.customer_id ,+new Date,cust.biz_id ]),
        refresh_token: null
    });
    return out.access_token;
}


/**
 * If biz token return biz,bizId,bizUserId,roleType,grantDate
 * If customer token return customer,custId grantDate
 * @param accessToken
 * @returns {*}
 */
function parseNewAccessToken(accessToken){
    try{
        var data = serializer.parse(accessToken);
        var tokenInfo ={};
        tokenInfo.clientId = data[0];
        tokenInfo.id = data[1];
        tokenInfo.grantDate = data[2];
        if(tokenInfo.clientId == clientType.biz || tokenInfo.clientId == clientType.admin){
            tokenInfo.userId = data[3];
            tokenInfo.roleType = data[4];
        }
        /*if(data.length>3){
         tokenInfo.active = data[4];
         }*/
        return tokenInfo;
    }catch(e){
        logger.error(' parseNewAccessToken :'+ e.message);
        return null;
    }
}

function parseAccessToken(accessToken){
    try{
        var data = serializer.parse(accessToken);
        var tokenInfo ={};
        tokenInfo.userId = data[0];
        tokenInfo.clientId = data[1];
        tokenInfo.grantDate = data[2];
        tokenInfo.extraData = data[3];
        /*if(data.length>3){
            tokenInfo.active = data[4];
        }*/
        return tokenInfo;
    }catch(e){
        logger.error(' parseAccessToken :'+ e.message);
        return null;
    }

}

function parseCustomerCookieToken(req){
    var cookiesToken = getCookie(req.headers.cookie,cookieCustomerMeta);
    if(cookiesToken == undefined){
        return null;
    }
    var tokenInfo = parseNewAccessToken(cookiesToken);
    if(tokenInfo == undefined){
        return null;
    }

    if(tokenInfo.clientId == undefined || tokenInfo.clientId != clientType.customer){
        return null;
    }else if((tokenInfo.grantDate == undefined) || ((tokenInfo.grantDate + expiredTime)<(new Date().getTime()))){
        return null;
    }
    var resultObj = {};
    resultObj ={id:tokenInfo.id,type:clientType.customer};
    return resultObj;
}

function parseBizCookieToken(req){
    var cookiesToken = getCookie(req.headers.cookie,cookieBizMeta);
    if(cookiesToken == undefined){
        return null;
    }
    var tokenInfo = parseNewAccessToken(cookiesToken);
    if(tokenInfo == undefined){
        return null;
    }

    if(tokenInfo.clientId == undefined || tokenInfo.clientId != clientType.customer){
        return null;
    }else if((tokenInfo.grantDate == undefined) || ((tokenInfo.grantDate + expiredTime)<(new Date().getTime()))){
        return null;
    }
    var resultObj = {};
    resultObj ={id:tokenInfo.id,type:clientType.customer};
    return resultObj;
}

function parseCustomerToken(req){
    var cookiesToken = req.headers[cookieCustomerMeta] ;
    if(cookiesToken == undefined){
        return null;
    }
    var tokenInfo = parseNewAccessToken(cookiesToken);
    if(tokenInfo == undefined){
        return null;
    }

    if(tokenInfo.clientId == undefined || tokenInfo.clientId != clientType.customer){
        return null;
    }else if((tokenInfo.grantDate == undefined) || ((tokenInfo.grantDate + expiredTime)<(new Date().getTime()))){
        return null;
    }
    var resultObj = {};
    resultObj ={id:tokenInfo.id,type:clientType.customer};
    return resultObj;
}

function parseBizToken(req){
    var cookiesToken = req.headers[headerTokenMeta];
    if(cookiesToken == undefined){
        return null;
    }
    var tokenInfo = parseNewAccessToken(cookiesToken);
    if(tokenInfo == undefined){
        return null;
    }

    if(tokenInfo.clientId == undefined ){
        return null;
    }else if(!(tokenInfo.clientId != clientType.biz || tokenInfo.clientId != clientType.admin)){
        return null;
    }else if((tokenInfo.grantDate == undefined) || ((tokenInfo.grantDate + expiredTime)<(new Date().getTime()))){
        return null;
    }
    var resultObj = {};
    resultObj ={
        id:tokenInfo.id,
        type:tokenInfo.clientId,
        userId : tokenInfo.userId,
        roleType : tokenInfo.roleType
    };
    req.params.bizUserId = tokenInfo.userId;
    return resultObj;
}

function parseAdminToken(req){
    var cookiesToken = req.headers[headerTokenMeta];
    if(cookiesToken == undefined){
        return null;
    }
    var tokenInfo = parseNewAccessToken(cookiesToken);
    if(tokenInfo == undefined){
        return null;
    }

    if(tokenInfo.clientId == undefined || tokenInfo.clientId != clientType.sa){
        return null;
    }else if((tokenInfo.grantDate == undefined) || ((tokenInfo.grantDate + expiredTime)<(new Date().getTime()))){
        return null;
    }
    var resultObj = {};
    resultObj ={id:tokenInfo.id,type:clientType.sa};
    return resultObj;
}
function checkAccessToken(req){
    var cookiesToken = req.headers[headerTokenMeta] ;
    if(cookiesToken == undefined){
        return null;
    }
    var tokenInfo = parseAccessToken(cookiesToken);
    if(tokenInfo == undefined){
        return null;
    }
    //console.log(tokenInfo);
    //console.log((tokenInfo.grantDate + expiredTime)>new Date);
    //console.log(tokenInfo.grantDate +expiredTime);
    //console.log(+new Date);
    var resultObj = {};
    if(tokenInfo.clientId == undefined || tokenInfo.clientId != clientId){
        return null;
    }else if((tokenInfo.grantDate == undefined) || ((tokenInfo.grantDate + expiredTime)<(new Date().getTime()))){
        logger.warn(' checkAccessToken :'+ "Token info is expired");
        return null;
    }else if(tokenInfo.extraData == extraDataOptions['customer']){
        resultObj = {id:tokenInfo.userId,type:'customer'};
        return resultObj;
    }else if(tokenInfo.extraData == extraDataOptions['business']){
        resultObj ={id:tokenInfo.userId,type:'business'};
        return resultObj
    }else{
        logger.warn(' checkAccessToken :'+ "Token info is error");
        return  null;
    }

}

/**
 * Check biz id and customer id can access api token
 * @param req
 */
function checkCombineToken(req){
    var params=req.params;
    var tokenInfo = checkAccessToken(req);
    if(tokenInfo == null || params.custId != tokenInfo.id&&params.bizId!=tokenInfo.id){
        logger.warn(' checkCombineToken :'+ "Token info is error");
        return false;
    }else if(params.custId && params.custId == tokenInfo.id){
        return true;
    }else if(params.bizId && params.bizId == tokenInfo.id){
        return true;
    }else{
        logger.warn(' checkCombineToken :'+ "Token info is error");
        return false;
    }
}

function getCookie(cookie ,name)
{
    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
    if(arr=cookie.match(reg))
        return (unescape(arr[2]));
    else
        return null;
}

module.exports = {
    createAccessToken: createAccessToken,
    parseAccessToken : parseAccessToken,
    checkAccessToken : checkAccessToken,
    checkCombineToken : checkCombineToken,
    createNewAccessToken : createNewAccessToken,
    createCustAccessToken:createCustAccessToken,
    parseNewAccessToken : parseNewAccessToken ,
    parseBizToken : parseBizToken ,
    parseCustomerToken : parseCustomerToken ,
    bizRoleType : bizRoleType ,
    clientType : clientType,
    parseCustomerCookieToken : parseCustomerCookieToken ,
    parseBizCookieToken : parseBizCookieToken ,
    parseAdminToken : parseAdminToken
};
