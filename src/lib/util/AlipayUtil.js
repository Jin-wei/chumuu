/**
 * Created by ling xue on 2016/3/22.
 */
var sysConfig = require('../config/SystemConfig.js');
var encrypt = require('./Encrypt.js');
var serverLogger = require('./ServerLogger.js');
var logger = serverLogger.createLogger('AlipayUtil.js');

function createAlipayForm(params, method, button_name){
    var paramsTemp = createAlipayParams(params);
    var sHtml = "<html>";
    sHtml += "<head>";
    sHtml +="<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\">";
    sHtml +="<title>厨目 - 手掌上的点餐时代</title>";
    sHtml +="</head>";
    sHtml +="<body>";

    sHtml += "<form id='alipaysubmit' name='alipaysubmit' action='"
        + params.gateway
        +  "_input_charset="
        + params.input_charset.toLowerCase().trim()
        + "' method='" + method + "'>";

    for(var key in paramsTemp){
        var val = paramsTemp[key];
        sHtml += "<input type='hidden' name='" + key + "' value='" + val + "'/>";
    }

    //submit按钮控件不要含有name属性
    sHtml = sHtml+ "<input type='submit' style='display:none'   value='" + button_name + "'></form>";

    sHtml = sHtml + "<script>document.forms['alipaysubmit'].submit();</script>";

    sHtml +="</body>";
    sHtml +="</html>";
    return sHtml;
}

function createAlipayParams(params){
    var newObj = paraFilter(params);
    var sortedParams = argSort(newObj);
    var signStr = createAlipaySign(sortedParams);
    sortedParams['sign'] = signStr;
    sortedParams['sign_type'] =sysConfig.alipayConfig.sign_type.trim().toUpperCase();
    return sortedParams;
}

function addParamToConfig(params){
    var config = sysConfig.alipayConfig;
    for(var key in params){
        config[key] = params[key];
    }
    return config;
}

function paraFilter (para){
    var para_filter = new Object();
    for (var key in para){
        if(key == 'sign' || key == 'sign_type' || para[key] == ''){
            continue;
        }
        else{
            para_filter[key] = para[key];
        }
    }

    return para_filter;
}

function argSort (params){
    var result = new Object();
    var keys = Object.keys(params).sort();
    for (var i = 0; i < keys.length; i++){
        var k = keys[i];
        result[k] = params[k];
    }
    return result;
}

function createQueryString (params){
    //return qs.stringify(para);
    var ls = '';
    for(var k in params){
        ls = ls + k + '=' + params[k] + '&';
    }
    ls = ls.substring(0, ls.length - 1);
    return ls;
}

function createAlipaySign(params){
    var queryString = createQueryString(params);

    var mysign = "";

    var sign_type = sysConfig.alipayConfig.sign_type.trim().toUpperCase();
    if(sign_type == "MD5"){
        mysign = encrypt.encryptByMd5Key(queryString, sysConfig.alipayConfig.key);
    }
    else{
        mysign = "";
    }
    return mysign;
}



module.exports = {
    createAlipayForm : createAlipayForm ,
    addParamToConfig : addParamToConfig ,
    createAlipayParams : createAlipayParams
}