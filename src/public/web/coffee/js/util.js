/**
 * Created by Ken on 15/6/9.
 */

function DisableAutoZoom() {
    var $viewportMeta = $('meta[name="viewport"]');
    $('input, select, textarea').bind('focus blur', function(event) {
        $viewportMeta.attr('content', 'width=device-width,initial-scale=1,maximum-scale=' + (event.type == 'blur' ? 10 : 1));
    });
}

var DateUtil = DateUtil || {};
DateUtil.format = function(date,mask) {
    var d = date;
    var type = Object.prototype.toString.call(d);
    if(type==="[object Date]") {
        ;
    } else if(type==="[object String]") {
        d = new Date(d);
    } else {
        throw new TypeError("Unsupported data type of parameter, param1's type="+type);
    }
    var zeroize = function (value, length) {
        if (!length) length = 2;
        value = String(value);
        for (var i = 0, zeros = ''; i < (length - value.length); i++) {
            zeros += '0';
        }
        return zeros + value;
    };
    return mask.replace(/(dddd|ddd|dd|d|MMMM|MMM|MM|M|yyyy|yy|hh|h|HH|H|mm|m|ss|s|l|L|tt|TT|Z|)/g, function($0) {
        switch($0) {
            case 'd':   	return d.getDate();
            case 'dd':  	return zeroize(d.getDate());
            case 'ddd': 	return ['Sun','Mon','Tue','Wed','Thr','Fri','Sat'][d.getDay()];
            case 'dddd':	return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()];
            case 'M':   	return d.getMonth() + 1;
            case 'MM':  	return zeroize(d.getMonth() + 1);
            case 'MMM': 	return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()];
            case 'MMMM':	return ['January','February','March','April','May','June','July','August','September','October','November','December'][d.getMonth()];
            case 'yy':	    return String(d.getFullYear()).substr(2);
            case 'yyyy':	return d.getFullYear();
            case 'h':	    return d.getHours() % 12 || 12;
            case 'hh':	    return zeroize(d.getHours() % 12 || 12);
            case 'H':   	return d.getHours();
            case 'HH':  	return zeroize(d.getHours());
            case 'm':   	return d.getMinutes();
            case 'mm':  	return zeroize(d.getMinutes());
            case 's':   	return d.getSeconds();
            case 'ss':  	return zeroize(d.getSeconds());
            case 'l':   	return zeroize(d.getMilliseconds(), 3);
            case 'L':   	var m = d.getMilliseconds(); if (m > 99) m = Math.round(m / 10); return zeroize(m);
            case 'tt':  	return d.getHours() < 12 ? 'am' : 'pm';
            case 'TT':  	return d.getHours() < 12 ? 'AM' : 'PM';
            case 'Z':   	return d.toUTCString().match(/[A-Z]+$/);
            // Return quoted strings with the surrounding quotes removed
            default:        return $0.substr(1, $0.length - 2);
        }
    });
};

function isObject(value) {
    var type = typeof value;
    return type == 'function' || (value && type == 'object') || false;
}

function GetCenterPosition(dom) {
    return {
        left:($(window).width() - dom.outerWidth())/2,
        top:($(window).height() - dom.outerHeight())/2
    };
}

function SetCenter(dom) {
    var rect = GetCenterPosition(dom);
    dom.css({'left':rect.left,'top':rect.top});
}

function getParameter(param) {
    var reg = new RegExp("(^|&)" + param + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null)
        return decodeURIComponent(r[2]);
    return null;
}

function SetWeChatConfig(setting) {
    setting = setting  || {};
    var href = window.location.href;
    href = href.substring(0,href.indexOf('.html')+5);
    var url ="/api/wechat/ticket?url="+encodeURIComponent(href);
    var data = $.ajax({
        url:url,
        type:'get',
        async: false
    });
    var wxConfig = data.responseJSON;
    wxConfig.appId = GC.appId;
    setting.jsApiList && (wxConfig.jsApiList = setting.jsApiList);
    wx.config(wxConfig);

    wx.error(function (res) {
        console.log('wx.error', res);
        alert('wx.error' + JSON.stringify(res));
    });
}

function SearchBiz(params,success,failure) {
    params = params || {};
    params.distance = params.distance || GC.minSearchDistance;
    //get biz
    var url = '/api/cust/do/searchWechatBiz?name=2&from=0&size=120&lat='+params.latitude+'&lon='+params.longitude+'&start=0&end='+params.distance;
    $.ajax({
        url: url,
        type: 'get',
        success: success,
        error: failure
    });
}

function GetDistance(myLati, myLongi,latitude, longitude) {
    var a=Math.pow(Math.sin((latitude-myLati)*Math.PI/180/2),2);
    var b=Math.cos(latitude*Math.PI/180)*Math.cos(myLati*Math.PI/180)*Math.pow(Math.sin((longitude-myLongi)*Math.PI/180/2),2);
    var c=Math.sqrt(a+b);
    var d=Math.asin(c)*2*6378.137;

    //#414 km to mile
    return d*0.621371192237;
}

var LocalStoreUtil = (function() {
    var _this = {};
    _this.ver = 1; //version of this service. if 'customer browser version' < 'this version', clear customer's localStorage
    _this.prefixOfId = 'mpCoffeeBizwise_';

    /**
     * Data Structure:
     * {
     *    _createOn: timestamp,
     *    _updateOn: timestamp,
     *    _expiredOn: timestamp,  //this item will be expired on that date, default: new Date('3000-1-1').getTime()
     *    _noActionLife: timestamp, //'noActionLife:30*1000' means if no update over 30s, this item will be expired. default: 3600*24*30*12*100 (100 years)
     *    _value: value
     * }
     *
     * */

        // getter
    _this.getOriginItem = function(id) {
        id = _this.prefixOfId+id;
        return window.localStorage.getItem(id);
    };

    //return null if expired
    _this.get = function(id) {
        var item = JSON.parse(_this.getOriginItem(id));
        if(!item)
            return null;
        var curTimestamp = new Date().getTime();
        //remove item if expired
        if(item._expiredOn <= curTimestamp || item._noActionLife < curTimestamp-item._updateOn) {
            _this.remove(id);
            return null;
        }
        return item ? item._value : null;
    };

    _this.isExist = function(id) {
        return _this.getOriginItem(id) ? true : false;
    };

    _this.getAsString = _this.get;

    _this.getAsObject = function(id) {
        var value = _this.get(id);
        return value ? JSON.parse(value) : null;
    };

    _this.getAsDate = function(id) {
        var value = _this.get(id);
        return value ? Date(value) : null;
    };

    _this.getAsInteger = function(id) {
        var value = _this.get(id);
        return value ? parseInt(value) : null;
    };

    // setter
    /**
     * @description: set private attributes automatically
     * see setting's instruction on top
     * setting {
     *   expiredOn: timestamp,
     *   noActionLife: timestamp,
     * }
     * */
    _this.set = function(id,value,setting) {
        setting = setting || {};
        //number, string, Date can be saved correctly, we just need to care about Object for now
        var tmpValue = isObject(value) ? JSON.stringify(value) : value;
        //doesn't consider expired when setting
        var originItem = _this.isExist(id) ? JSON.parse(_this.getOriginItem(id)) : null;
        if(originItem) {
            originItem._updateOn = new Date().getTime();
        }
        else {
            originItem = {};
            originItem._createOn = new Date().getTime();
            originItem._updateOn = originItem.createOn;
        }
        originItem._expiredOn = setting.expiredOn || new Date('3000-1-1').getTime();
        originItem._noActionLife = setting.noActionLife || 3600*24*30*12*100;
        originItem._value = tmpValue;

        //remove it first avoid issue on so many browsers
        _this.remove(id);
        return window.localStorage.setItem(_this.prefixOfId+id,JSON.stringify(originItem));
    };
    _this.remove = function(id) {
        id = _this.prefixOfId+id;
        window.localStorage.removeItem(id);
    };

    _this.clear = function() {
        //clear ours only
        for(var id in window.localStorage) {
            if(id && id.indexOf(_this.prefixOfId)==0)
                window.localStorage.removeItem(id);
        }
    };

    _this.length = function() {
        return window.localStorage.length;
    };

    //init
    {
        var ver = _this.getOriginItem('ver');
        if(ver != _this.ver) {
            _this.clear();
            window.localStorage.setItem(_this.prefixOfId + 'ver', _this.ver);
        }
    }

    return _this;
})();

function LocateToWeiXinPage(url) {
    var baseUrl = "https://open.weixin.qq.com/connect/oauth2/authorize?appid="+GC.appId+"&redirect_uri="+encodeURIComponent(url)+"&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect";
    alert(baseUrl);
    window.location.href = baseUrl;
}

function WechatPay(paymentConfig){

    var jsParams = {
        "appId" : paymentConfig.appId,
        "timeStamp": paymentConfig.timeStamp+"",
        "nonceStr" : paymentConfig.nonceStr,
        "package" : "prepay_id="+paymentConfig.prepayId,
        "signType" : "MD5",
        "paySign" : paymentConfig.sign
    };
    alert(JSON.stringify(jsParams));
    WeixinJSBridge.invoke(
        'getBrandWCPayRequest',jsParams ,
        function(res){
            if(res.err_msg == "get_brand_wcpay_request:ok" ) {
                alert("ok");
            }else if(res.err_msg == "get_brand_wcpay_request:cancel"){
                alert("cancel")
            }else if(res.err_msg == "get_brand_wcpay_request:fail"){
                alert("failed")
            }else{
                alert("error");
            }
        }
    );
}

function Get(url,success,failure) {
    var userInfo = getCookieAsObject('userInfo');
    if(!userInfo) {
        alert('没有用户信息, 无法发起Get请求');
        return false;
    }

    url = '/api' + (url[0]==='/'?'':'/') + url;
    $.ajax({
        url: url,
        type:'get',
        contentType:'application/json',
        beforeSend: function(xhr) {
            xhr.setRequestHeader(GC.tokenName,userInfo.accessToken);
        },
        success: success,
        error: function(data) {
            alert('请求失败,url='+url);
            if(isObject(data))
                alert('错误信息:'+JSON.stringify(data));
            else
                alert('错误信息:'+data);
            if(failure)
                failure();
        }
    });
}

function Post(url,data,success,failure) {
    var userInfo = getCookieAsObject('userInfo');
    if(!userInfo) {
        alert('没有用户信息, 无法发起Post请求');
        return false;
    }

    url = '/api' + (url[0]==='/'?'':'/') + url;
    $.ajax({
        url: url,
        type:'post',
        contentType:'application/json',
        beforeSend: function(xhr) {
            xhr.setRequestHeader(GC.tokenName,userInfo.accessToken);
        },
        data: JSON.stringify(params),
        success: success,
        error: function(data) {
            alert('请求失败,url='+url);
            if(isObject(data))
                alert('错误信息:'+JSON.stringify(data));
            else
                alert('错误信息:'+data);
            if(failure)
                failure();
        }
    });
}

function setCookie(name,value) {
    var _value = isObject(value) ? JSON.stringify(value) : value;
    $.cookie(name,_value);
}

function getCookie(name) {
    return $.cookie(name);
}

function getCookieAsObject(name) {
    var ret = $.cookie(name);
    if(ret) {
        ret = JSON.parse(ret);
    }
    return ret;
}

