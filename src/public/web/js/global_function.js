/**
 * Created by md on 14-10-15.
 */

var gBrowser = (function(){
    var u = navigator.userAgent, app = navigator.appVersion;
    var browser = {
        core: {
            ie: u.indexOf('Trident') > -1, //IE内核
            opera: u.indexOf('Presto') > -1, //opera内核
            apple: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
            chrome: u.indexOf('Chrome') > -1, //Chrome
            firefox: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
            safari: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部
        },
        ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
        android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
        iPhone: u.indexOf('iPhone') > -1, //是否为iPhone
        iPad: u.indexOf('iPad') > -1, //是否iPad
        windows_phone: u.indexOf('compatible') > -1 || u.indexOf('Windows Phone') > -1, //是否windows phone
        mobile: false,
        isCN: navigator.language.toLowerCase()=='zh-cn',
        isEN: navigator.language.toLowerCase().indexOf('en')>-1,
        map : {
            gaode : navigator.language.toLowerCase()=='zh-cn',
            google : navigator.language.toLowerCase().indexOf('en')>-1
        },
        pageSize : {
            regular : 'Letter',
            large : 'Tabloid'
        },
        language: navigator.language.toLowerCase()
    };
    if(browser.iPhone || browser.android || browser.windows_phone) {
        browser.mobile = true;
    }
    var mapType = $.cookie('map_type');
    if(mapType=='google') {
        browser.map.google = true;
        browser.map.gaode = false;
    }
    else if(mapType=='gaode') {
        browser.map.google = false;
        browser.map.gaode = true;
    }
    if(typeof sys_config == 'object') {
        browser.sys_config = sys_config;
        if(sys_config.isCN)
            browser.isCN = sys_config.isCN;
        if(sys_config.isEN)
            browser.isEN = sys_config.isEN;
        if(sys_config.map)
            browser.map = sys_config.map;
        if (sys_config.pageSize){
            browser.pageSize=sys_config.pageSize;
        }
        if(sys_config.language)
            browser.language = sys_config.language;
        if(sys_config.currency)
            browser.currency = sys_config.currency;
        if(sys_config.distanceName)
            browser.distanceName = sys_config.distanceName;
        if(sys_config.commonBizId)
            browser.commonBizId = sys_config.commonBizId;
        if(sys_config.image_server)
            browser.image_server = sys_config.image_server;
    }
    else {
        browser.sys_config = {}; //Ken: make sure 'gBrowser.sys_config.xxxx' is OK
        console.log('no system config');
    }
    return browser;
})();

function DisableAutoZoom() {
// disable autozoom when input is focused
//var $viewportMeta = $('head > meta[name="viewport"]');
//$('input, select, textarea').bind('touchend', function(event) {
//    $viewportMeta.attr('content', 'width=640, user-scalable=0');
//    setTimeout(function(){ $viewportMeta.attr('content', 'width=640, user-scalable=1'); }, 1)
//});
    var $viewportMeta = $('meta[name="viewport"]');
    $('input, select, textarea').bind('focus blur', function(event) {
        $viewportMeta.attr('content', 'width=device-width,initial-scale=1,maximum-scale=' + (event.type == 'blur' ? 10 : 1));
    });
}

/**
 * @Author Ken
 * @description 获取元素居中时的left,top
 * @LastUpdateDate 2014-08-17
 */
function GetCenterPosition(dom) {
    return {
        left:($(window).width() - dom.outerWidth())/2,
        top:($(window).height() - dom.outerHeight())/2
    };
}
/**
 * @Author Ken
 * @description 获取box显示时的left,top, (1/2,1/4)
 * @LastUpdateDate 2014-08-17
 */
function GetBoxPosition(dom) {
    return {
        left:($(window).width() - dom.outerWidth())/2,
        top:($(window).height() - dom.outerHeight())/4
    };
}

/**
 * @Author Ken
 * @description 显示基本提示框,由调用者指定显示的样式与内容
 * @parameter
 *      setting: {timeout: 300, stick: true}
 * @LastUpdateDate 2015-01-04
 */
function _BaseBox(boxClass,iconClass,msg,setting) {
    setting = setting || {};

        if($(document).find('body').find('#baseBox')) {
            $(document).find('body').find('#baseBox').remove();
        }
        var box = $('<div id="baseBox">');
        var content = '';
        content += '<button type="button" class="close" data-dismiss="alert"><i class="icon-remove"></i></button>';
        content += '<strong style="position: absolute;"><i class="'+iconClass+'"></i></strong>';
        content += '<span style="display:inline-block;max-width:500px;margin:0px 10px 0px 20px;">';
        content += msg;
        content += '</span>';

        box.html(content);
        $(document).find('body').append(box);

    box.addClass(boxClass);
    box.css({position:'fixed','z-index':9999,display:'none'});
    var rect = GetBoxPosition(box);
//    console.log(rect);
    box.css(rect);
    box.fadeIn(500);

    var timeout = 3000;
    if(setting.timeout)
        timeout = setting.timeout;

    box.children('.close').click(function(){
        if(this && this.parentNode) {
            box[0].outerHTML = ''
        }
    });

    if(!setting.stick) {
        if(timeout>0) {
            setTimeout(function(){
                box.fadeOut(1000,function(){
                    if(this.parentNode)
                        this.outerHTML = '';
                });
            },timeout);
        }
    }
}

/**
 * @Author Ken
 * @description 警告,信息,错误, 成功 提示框
 * @LastUpdateDate 2014-08-17
 */
function WarningBox(msg,setting) {
    var boxClass = 'alert alert-warning';
    var iconClass = 'icon-warning-sign';
    setting = setting || {};
    if(!setting.timeout)
        setting.timeout = 10000;
    _BaseBox(boxClass,iconClass,msg,setting);
}
function ErrorBox(msg,setting) {
    var boxClass = 'alert alert-danger';
    var iconClass = 'icon-exclamation-sign';
    setting = setting || {};
    /*if(_.isUndefined(setting.stick))
        setting.stick = true;*/
    if(!setting.timeout)
        setting.timeout = 15000;
    _BaseBox(boxClass,iconClass,msg,setting);
}
function InfoBox(msg,setting) {
    var boxClass = 'alert alert-info';
    var iconClass = 'icon-info-sign';
    _BaseBox(boxClass,iconClass,msg,setting);
}
function SuccessBox(msg,setting) {
    var boxClass = 'alert alert-success';
    var iconClass = 'icon-ok';
    setting = setting || {};
    if(!setting.timeout)
        setting.timeout = 300*6;
    _BaseBox(boxClass,iconClass,msg,setting);
}

/**
 * @Author Ken
 * @description 显示基本对话框,由调用者指定显示的样式与内容
 * @LastUpdateDate 2014-08-17
 */
function _BaseDialog(msg,confirmCallback) {
    bootbox.dialog({
        message: msg,
        buttons:
        {
            "click" :
            {
                "label" : "确认",
                "className" : "btn-sm btn-primary",
                "callback": confirmCallback
            },
            "button" :
            {
                "label" : "取消",
                "className" : "btn-sm"
            }
        }
    });
}
/**
 * @Author Ken
 * @description confirm框
 * @LastUpdateDate 2014-08-17
 */
function DelConfirm(confirmCallback) {
    _BaseDialog("确认删除数据?",confirmCallback);
}
function Confirm(msg,confirmCallback) {
    _BaseDialog(msg,confirmCallback);
}

function _TranslateImageUrl(arr, img_name, default_name) {
    var image_server = gBrowser.image_server ? gBrowser.image_server : '';
    function trans(item) {
        if (!item[img_name]) {
            item[img_name + "_80"]  = "/image/" + default_name + "_80.png";
            item[img_name + "_240"] = "/image/" + default_name + "_240.png";
            item[img_name + "_600"] = "/image/" + default_name + "_600.png";
            item[img_name + "_s"]   = item[img_name + "_80"];
            item[img_name + "_m"]   = item[img_name + "_240"];
            item[img_name + "_l"]   = item[img_name + "_600"];
            item[img_name + "_o"] = "/image/" + default_name + ".png";
        } else {
            item[img_name + "_s"]   = image_server + "/api/image/" + item[img_name] + "/s";
            item[img_name + "_m"]   = image_server + "/api/image/" + item[img_name] + "/m";
            item[img_name + "_l"]   = image_server + "/api/image/" + item[img_name] + "/l";
            item[img_name + "_80"]  = image_server + "/api/image/" + item[img_name] + "/80";
            item[img_name + "_240"] = image_server + "/api/image/" + item[img_name] + "/240";
            item[img_name + "_600"] = image_server + "/api/image/" + item[img_name] + "/600";
            item[img_name + "_o"]   = item[img_name + "_l"];
        }
    }
    if(_.isArray(arr)) {
        for (var i in arr) {
            trans(arr[i]);
        }
    }
    else if(_.isObject(arr)) {
        trans(arr);
    }
}

function TranslateBizImageUrl(arr, name) {
    var img_name = (name && name.length > 0) ? name : "img_url";
    _TranslateImageUrl(arr,img_name, 'restaurant_icon');
}

function TranslateMenuItemImageUrl(arr, name) {
    var img_name = (name && name.length > 0) ? name : "img_url";
    _TranslateImageUrl(arr,img_name,'default_item_pic');
}

function TranslateMenuNameItemImageUrl(arr, name) {
    var img_name = (name && name.length > 0) ? name : "imgUrl";
    _TranslateNameImageUrl(arr,img_name,'default_item_pic');
}


function _TranslateNameImageUrl(arr, img_name, default_name) {
    var image_server = gBrowser.image_server ? gBrowser.image_server : '';
    function trans(item) {
        if (!item._source[img_name]) {
            item._source[img_name + "_80"]  = "/image/" + default_name + "_80.png";
            item._source[img_name + "_240"] = "/image/" + default_name + "_240.png";
            item._source[img_name + "_600"] = "/image/" + default_name + "_600.png";
            item._source[img_name + "_s"]   = item._source[img_name + "_80"];
            item._source[img_name + "_m"]   = item._source[img_name + "_240"];
            item._source[img_name + "_l"]   = item._source[img_name + "_600"];
            item._source[img_name + "_o"] = "/image/" + default_name + ".png";
        } else {
            item._source[img_name + "_s"]   = image_server + "/api/image/" + item._source[img_name] + "/s";
            item._source[img_name + "_m"]   = image_server + "/api/image/" + item._source[img_name] + "/m";
            item._source[img_name + "_l"]   = image_server + "/api/image/" + item._source[img_name] + "/l";
            item._source[img_name + "_80"]  = image_server + "/api/image/" + item._source[img_name] + "/80";
            item._source[img_name + "_240"] = image_server + "/api/image/" + item._source[img_name] + "/240";
            item._source[img_name + "_600"] = image_server + "/api/image/" + item._source[img_name] + "/600";
            item._source[img_name + "_o"]   = item._source[img_name + "_l"];
        }
    }
    if(_.isArray(arr)) {
        for (var i in arr) {
            trans(arr[i]);
        }
    }
    else if(_.isObject(arr)) {
        trans(arr);
    }
}
//handle scroll event
gScrollCallbackArr = [];
$(window).scroll(function(event){
    for(var i in gScrollCallbackArr) {
        gScrollCallbackArr[i].func(event);
    }
});
gResizeCallbackArr = [];
$(window).resize(function(event){
    var width = $(window).width();
    var height = $(window).height();
    for(var i in gResizeCallbackArr) {
        gResizeCallbackArr[i].func(width,height);
    }
});
function ClearAllEventCallback() {
    gScrollCallbackArr.length = 0;
    gResizeCallbackArr.length = 0;
}


/**
 * mask
 * */
var g_mask = {
    id: 'mp-loading-mask',
    _mask_bg : null,
    loaded : false,
    is_show: false,
    setting:{},
    init: function() {
        var mask_bg = $('<div>');
        mask_bg.attr('id',this.id);
        mask_bg.css({
            'width':5000, //enough to cover browser
            'height':5000,
            'background-color':'#ccc',
            'opacity': 0.4,
            'display':'none',
            'position':'fixed',
            'left':0,
            'top':0,
            'z-index':888
        });
        this._mask_bg = mask_bg;
        $('body').append(mask_bg);
    },
    /**
     * accept setting
     * */
    show: function(setting) {
        setting = setting || {};
        var $mask = $('#'+this.id);
        if(!_.isUndefined(setting.opacity)) {
            $mask.css('opacity',setting.opacity);
        }
        else {
            $mask.css('opacity',0.4);
        }
        $mask.unbind('click');
        if(_.isFunction(setting.onclick)) {
            $mask.click(setting.onclick);
        }
        this.setting = setting;
        this._mask_bg.show();
        this.is_show = true;
    },
    hide: function() {
        this._mask_bg.hide();
        this.is_show = false;
    }
};
g_mask.init();

/**
 * loading
 * */
var g_loading = {
    _mask_bg : null,
    _mask_loading : null,
    loaded : false,
    is_show: false,
    timeout: 60,
    called_count: 0,
    init: function() {

        var mask_loading = $('<div>');
        mask_loading.css({
            'border':'2px solid lightsteelblue',
            'background-color': 'white',
            'text-align':'center',
            'display':'none',
            'position':'fixed',
            'width':200,
            'height':100,
            'opacity':1,
            'z-index':900
        });
        mask_loading.html('<div class="icon-spinner icon-spin orange" style="font-size: 30pt;"></div><div class="Arial bigger-130">Please wait...</div>');

        this._mask_loading = mask_loading;
        $('body').append(mask_loading);

//        var win_width = $(window).width();
//        var win_height = $(window).height();
//        mask_loading.css({'top':(win_height-mask_loading.height())/2-50});
        this.loaded = true;
    },
    /**
     * accept setting
     * */
    show: function(setting) {
        var timeout = this.timeout;
        if(setting && setting.timeout) {
            timeout = setting.timeout;
        }
        g_mask.show();
        this._mask_loading.show();
        var rect = GetCenterPosition(this._mask_loading);
        this._mask_loading.css({'left':rect.left,'top':rect.top-50});
        this.is_show = true;
        this.called_count++;
        setTimeout(function(){
            if(g_loading.is_show) {
                g_loading.hide();
                ErrorBox("Operation timeout");
            }
        },timeout*1000);
    },
    hide: function() {
        this.called_count--;
        if(this.called_count==0) {
            g_mask.hide();
            this._mask_loading.hide();
            this.is_show = false;
        }
    }

};
g_loading.init();

/**
 * @Author Ken
 * @date 2014-11-07
 * @description
 * @parameter
 *      src, [object]
 *      desc,[object]
 *      attrs, array of attr name [string]
 * @example
 *      var src = {id:1,name:'Ken',age:28};
 *      var desc = {};
 *      Object.copy(src,desc,['id','name']);
 *      //desc = {id:1,name:'Ken'};
 * */
Object.copy = function(src,dest,attrs) {
    if(attrs && attrs.length>0) {
        for(var i in attrs) {
            var attr = attrs[i];
            dest[attr] = src[attr];
        }
    }
    else {
        for(var key in dest) {
            dest[key] = src[key];
        }
    }
};

/**
 * @Author Ken
 * @date 2014-11-17
 * @description pad num with zero
 * @example:
 *  pad(123,5) = '00123'
 * */
function pad(num, n) {
    var len = num.toString().length;
    while(len < n) {
        num = "0" + num;
        len++;
    }
    return num;
}

/**
 * Ken 2015-01-09
 * @example:
 *      play_sound('media/warning.wav');
 * */
function play_sound(url) {
    var embed_div = $('#play_sound');
    //create embed container if none
    if(embed_div.length==0) {
        embed_div = $('<div>');
        //hidden dom would NOT load resource, so we move it out of screen
//        embed_div.css('display','none');
        embed_div.css({position:'absolute',left:-1000,top:-1000});
        embed_div.attr('id','play_sound');
        $('body').append(embed_div);
    }
    // hidden="true"
    embed_div.html('<embed src="'+url+'" loop="0" autostart="true"></embed>');
}

//****************************************************************************************************
/**
 * Ken 2015-05-04
 * resource file(script) loading event system
 * */

/**
 * Data Structure Example:
 * onEventCallbacks : {
 *      google: [
 *        {
 *          fn:callback_func1,
 *          args:callback_args1
 *        },
 *        {
 *          fn:callback_func2,
 *          args:callback_args2
 *        }
 *      ]
 * }
 * */
var gResourceManager = {
    loadedResources : {},
    onEventCallbacks : {},
    on : function(key,event) {
        gResourceManager.onEventCallbacks[key] = gResourceManager.onEventCallbacks[key] || [];
        gResourceManager.onEventCallbacks[key].push(event);
    },
    fire : function(key) {
        _.forEach(gResourceManager.onEventCallbacks[key],function(event){
            event.fn.apply(event.fn,event.args);
        });
        gResourceManager.onEventCallbacks[key] = [];
    }
};
function OnResourceLoaded(key) {
    if(gResourceManager.loadedResources[key]) {
        console.error('OnResourceLoaded-->duplicated key, key=',key);
        return false;
    }
    gResourceManager.loadedResources[key] = 1;
    gResourceManager.fire(key);
}
function FireAfterResourceLoad(key,event) {
    if(gResourceManager.loadedResources[key]) {
        //already loaded, just fire it
        event.fn.apply(event.fn,event.args);
    }
    else {
        gResourceManager.on(key,event);
    }
}
function FireAfterGoogleResourceLoad(event) {
    FireAfterResourceLoad('google_map',{fn:function(){
        //Ken 2015-05-04 : inject google's Load function, call our specific function
        //google is not ready after first script loaded, first script will load other scripts.
        var oldLoad = google.maps.Load;
        //if google.maps has 'Load', means google map is not ready.
        if(oldLoad) {
            var newLoad = function(apiLoad) {
                oldLoad(apiLoad);
                event.fn.apply(event.fn,event.args);
            };
            google.maps.Load = newLoad;
        }
        else {
            event.fn.apply(event.fn,event.args);
        }
    },args:[]});
}
function FireAfterGaodeResourceLoad(event) {
    FireAfterResourceLoad('gaode_map',{fn:function(){
        //Ken 2015-05-04 : inject google's Load function, call our specific function
        //google is not ready after first script loaded, first script will load other scripts.
        //var oldLoad = google.maps.Load;
        ////if google.maps has 'Load', means google map is not ready.
        //if(oldLoad) {
        //    var newLoad = function(apiLoad) {
        //        oldLoad(apiLoad);
        //        event.fn.apply(event.fn,event.args);
        //    };
        //    google.maps.Load = newLoad;
        //}
        //else {
            event.fn.apply(event.fn,event.args);
        //}
    },args:[]});
}
//****************************************************************************************************

//return a url which can navigate customer to this biz
function GetNavigatedUrl(biz) {
    var url = '';
    if(gBrowser.map.gaode) {
//        url = "http://www.amap.com/#!poi!!q="+biz.longitude+"%2C"+biz.latitude+"&_t="+Date.parse(new Date());
        url = "http://www.amap.com/#!poi!!q="+biz.city+"%2C"+biz.address+"&_t="+Date.parse(new Date());
    }
    else {
        url = "http://www.google.com/maps/place/"+biz.address+","+biz.city+", "+biz.state+" "+biz.zipcode;
    }
    return url;
}

//Google Map Start

//GEO location
function GoogleGEOGetLocation(success) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, GoogleGEOLocationErrorHandler);
    }
    else {
        console.log("Geolocation is not supported by this browser.");
    }
}
function GoogleGEOLocationErrorHandler(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            console.log("GEOLocation","User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            console.log("GEOLocation","Location information is unavailable.");
            break;
        case error.TIMEOUT:
            console.log("GEOLocation","The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            console.log("GEOLocation","An unknown error occurred.");
            break;
        default:
            console.log("GEOLocation",error);
    }
}
var gMap;
var geoCoder;
var myMarker;
var bizMarker = [];
var isCenterChanged = false; // 'isCenterChanged = true' when user relocate a new position.
//var goldStar = {
//    path: 'M 125,5 155,90 245,90 175,145 200,230 125,180 50,230 75,145 5,90 95,90 z',
//    fillColor: "yellow",
//    fillOpacity: 0.8,
//    scale: 1,
//    strokeColor: "gold",
//    strokeWeight: 14
//};
function GoogleInitMap(divID,onCenterChangedCallback) {
    var centerPoint = new google.maps.LatLng(37.533497,-121.920906);
    var mapOptions = {
        center: centerPoint,
        zoom: 18,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var gMapDom = document.getElementById(divID);
    gMap = new google.maps.Map(gMapDom,mapOptions);
    myMarker = new google.maps.Marker({
        position: centerPoint,
        map: gMap,
        title: 'You are here',
        icon: 'customer/image/marker.png'
    });

    if(onCenterChangedCallback) {
        google.maps.event.addListener(gMap, 'click', function(event) {
            myMarker.position = event.latLng;
            if(typeof onCenterChangedCallback == 'function')
                onCenterChangedCallback(myMarker.position);
            myMarker.setMap(gMap);
            isCenterChanged = true;
        });
    }
    geoCoder = new google.maps.Geocoder();
}
function GoogleCreateInfoWindow(marker,biz) {
    var infoWindow = new google.maps.InfoWindow({
        content: '<b>'+biz.name+'</b><br>'+
        biz.address+'<br>'+
        biz.phone_no+'<br>'
    });
    marker.infoWindow = infoWindow;
    google.maps.event.addListener(marker, 'mouseover', function() {
        infoWindow.open(gMap,marker);
    });
    google.maps.event.addListener(marker, 'mouseout', function() {
        infoWindow.close(gMap,marker);
    });
}
function GoogleClearMarker() {
    for(var i in bizMarker) {
        bizMarker[i].setMap(null);
    }
    bizMarker = [];
}
function GoogleSetMarker(bizs) {
    for(var i in bizs) {
        var latLng = new google.maps.LatLng(bizs[i].latitude,bizs[i].longitude);
        var marker = new google.maps.Marker({
            position: latLng,
            map: gMap
        });
        bizMarker.push(marker);
        CreateInfoWindow(marker,bizs[i]);
    }
}
function GoogleFitbounds() {
    var bounds = new google.maps.LatLngBounds();
    for(var i in bizMarker){
        bounds.extend(new google.maps.LatLng(bizMarker[i].getPosition().lat()
            ,bizMarker[i].getPosition().lng()));
    }
    gMap.fitBounds(bounds);
}

//set google map center
function GoogleSetCenter(position) {
    var centerPoint = new google.maps.LatLng(position.latitude,position.longitude);
    myMarker.position = centerPoint;
    myMarker.setMap(gMap);
    gMap.setCenter(centerPoint);
}

//get address by coords
function GoogleGetAddressByCoords(position,callback) {
    var latlng = new google.maps.LatLng(position.latitude,position.longitude);
    if (geoCoder) {
        geoCoder.geocode({'latLng': latlng}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if(typeof callback == 'function') {
                    if (results[0]) {
                        callback(results[0].formatted_address);
                    }
                }
                else {
                    console.log("GetAddressByCoords, callback is not a function");
                }
            } else {
                console.log("Geocoder failed due to: " + status);
            }
        });
    }
}
//Google Map End


//GaoDe Map Start

var gaodeGEOLocation;
var gaodeGetPositionListener = null;
var onGaoDeGEOLocationComplete = function(data) {
    if(typeof gaodeGetPositionListener == 'function') {
        gaodeGetPositionListener({coords:{
            latitude: data.position.lat,
            longitude: data.position.lng
        }});
    }
    else {
        console.error('gaodeGetPostionListener is not function');
    }
//    str += '<p>精度：' + data.accuracy + ' 米</p>';
//    str += '<p>是否经过偏移：' + (data.isConverted ? '是' : '否') + '</p>';
};
var gaodeGetAddressListener = null;
var geoGetAddressCompleteCallback = function(results) {
    if(results) {
        gaodeGetAddressListener(results.regeocode.formattedAddress);
    }
};

function GaoDeGEOGetLocation(success) {
    gaodeGetPositionListener = success;
    gaodeGEOLocation.getCurrentPosition();
}
function GaoDeInitMap(divID,onCenterChangedCallback) {
    //var position=new AMap.LngLat(116.202281,39.825741);
    gMap = new AMap.Map(divID,{
        view: new AMap.View2D({//创建地图二维视口
            //center:position,//创建中心点坐标
            zoom:11, //设置地图缩放级别
            rotation:0 //设置地图旋转角度
        }),
        lang:"zh_cn"//设置地图语言类型，默认：中文简体
    });//创建地图实例

//    myMarker = new AMap.Marker({
//        icon:new AMap.Icon({    //复杂图标
////            size:new AMap.Size(28,37),//图标大小
//            image:'customer/image/marker.png'
////            image: "http://webapi.amap.com/images/custom_a_j.png",
////            imageOffset:new AMap.Pixel(-28,0)//相对于大图的取图位置
//        }),
//        position:new AMap.LngLat(116.202281,39.825741)
//    });
//    myMarker.setMap(gMap);  //在地图上添加点

    gMap.plugin('AMap.Geolocation', function () {
        gaodeGEOLocation = new AMap.Geolocation({
            enableHighAccuracy: true,//是否使用高精度定位，默认:true
            timeout: 10000,          //超过10秒后停止定位，默认：无穷大
            maximumAge: 0,           //定位结果缓存0毫秒，默认：0
            convert: true,           //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
            showButton: false,        //显示定位按钮，默认：true
            buttonPosition: 'LB',    //定位按钮停靠位置，默认：'LB'，左下角
            buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
            showMarker: false,        //定位成功后在定位到的位置显示点标记，默认：true
            showCircle: true,        //定位成功后用圆圈表示定位精度范围，默认：true
            panToLocation: true,     //定位成功后将定位到的位置作为地图中心点，默认：true
            zoomToAccuracy:true      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
        });
        gMap.addControl(gaodeGEOLocation);
        AMap.event.addListener(gaodeGEOLocation, 'complete', onGaoDeGEOLocationComplete);//返回定位信息
        AMap.event.addListener(gaodeGEOLocation, 'error', onGaoDeGEOLocationError);      //返回定位出错信息
    });
    gMap.plugin(["AMap.ToolBar"],function(){
        //加载工具条
        var tool = new AMap.ToolBar();
        gMap.addControl(tool);
    });

    gMap.plugin(["AMap.Geocoder"],function(){
        geoCoder = new AMap.Geocoder({
            radius:1000, //以已知坐标为中心点，radius为半径，返回范围内兴趣点和道路信息
            extensions: "all"//返回地址描述以及附近兴趣点和道路信息，默认"base"
        });
        AMap.event.addListener(geoCoder, "complete", geoGetAddressCompleteCallback);
    });

    AMap.service(["AMap.Geocoder"], function() {
        geoCoder = new AMap.Geocoder({
            //city: "010", //城市，默认：“全国”
            radius: 1000 //范围，默认：500
        });
    });

    //gMap.setZoom(7);

    if(_.isFunction(onCenterChangedCallback)) {
        AMap.event.addListener(gMap,'click',function(event){
            //myMarker = new AMap.Marker({
            //    icon:new AMap.Icon({    //复杂图标
            //        image:'customer/image/marker.png'
            //    }),
            //    position:event.latLng
            //});
            //myMarker.setMap(gMap);  //在地图上添加点

            onCenterChangedCallback(event);
            isCenterChanged = true;
        });
    }
}
function GaoDeCreateInfoWindow(marker,biz) {
    var infoWindow = new AMap.InfoWindow({
        content: '<b>'+biz.name+'</b><br>'+
        biz.address+'<br>'+
        biz.phone_no+'<br>'
    });
    marker.infoWindow = infoWindow;
    var position = new AMap.LngLat(marker.getPosition().lng,marker.getPosition().lat+0.0001);
    AMap.event.addListener(marker,'mouseover',function(){
        infoWindow.open(gMap,position);
    });
    AMap.event.addListener(marker,'mouseout',function(){
        infoWindow.close(gMap,position);
    });
}
function GaoDeClearMarker() {
//    gMap.clearMap();
    for(var i in bizMarker) {
        bizMarker[i].setMap(null);
    }
    bizMarker = [];
}
function GaoDeSetMarker(bizs) {
    for(var i in bizs) {
        var latLng = new AMap.LngLat(bizs[i].longitude,bizs[i].latitude);
        var marker = new AMap.Marker({
            position: latLng,
            map: gMap
        });
        bizMarker.push(marker);
        GaoDeCreateInfoWindow(marker,bizs[i]);
    }
}
function GaoDeFitbounds() {
    gMap.setFitView();
}

//set google map center
function GaoDeSetCenter(position) {
    var center = new AMap.LngLat(position.longitude,position.latitude);
    gMap.setZoomAndCenter(18,center);
    gMap.clearMap();
    myMarker = new AMap.Marker({
        icon:new AMap.Icon({    //复杂图标
//            size:new AMap.Size(28,37),//图标大小
            image:'customer/image/marker.png'
//            image: "http://webapi.amap.com/images/custom_a_j.png",
//            imageOffset:new AMap.Pixel(-28,0)//相对于大图的取图位置
        }),
        position:center
    });
    myMarker.setMap(gMap);
}

//get address by coords
function GaoDeGetAddressByCoords(position,callback) {
    gaodeGetAddressListener = callback;

    var latLng = new AMap.LngLat(position.longitude,position.latitude);
    geoCoder.getAddress(latLng);
}
function onGaoDeGEOLocationError (data) {
    switch(data.info) {
        case 'PERMISSION_DENIED':
            console.log("GEOLocation","User denied the request for Geolocation.");
            break;
        case 'POSITION_UNAVAILBLE':
            console.log("GEOLocation","Location information is unavailable.");
            break;
        case 'TIMEOUT':
            console.log("GEOLocation","The request to get user location timed out.");
            break;
        default:
            console.log("GEOLocation",error);
    }
};
//GaoDe Map End

//Map API Start
function GEOGetLocation(success) {
    if(gBrowser.map.gaode) {
        var timer = setInterval(function(){
            clearInterval(timer);
            //ensure gaodeGEOLocation is ready
            if(gaodeGEOLocation) {
                GaoDeGEOGetLocation(success);
            }
        },1000);
    }
    else {
        FireAfterGoogleResourceLoad({fn:function(){
            GoogleGEOGetLocation(success);
        },args:[]})
    }
}
function InitMap(divID,onChangeCenterCallback) {
    if(gBrowser.map.gaode) {
        GaoDeInitMap(divID,onCenterChangedCallback);
    }
    else {
        FireAfterGoogleResourceLoad({fn:function(){
            GoogleInitMap(divID,onCenterChangedCallback);
        },args:[]})
    }
}
function CreateInfoWindow(marker,biz) {
    if(gBrowser.map.gaode) {
        GaoDeCreateInfoWindow(marker,biz);
    }
    else {
        FireAfterGoogleResourceLoad({fn:function(){
            GoogleCreateInfoWindow(marker,biz);
        },args:[]})
    }
}
function ClearMarker() {
    if(gBrowser.map.gaode) {
        GaoDeClearMarker();
    }
    else {
        FireAfterGoogleResourceLoad({fn:function(){
            GoogleClearMarker();
        },args:[]})
    }
}
function SetMarker(bizs) {
    if(gBrowser.map.gaode) {
        GaoDeSetMarker(bizs);
    }
    else {
        FireAfterGoogleResourceLoad({fn:function(){
            GoogleSetMarker(bizs);
        },args:[]})
    }
}
function Fitbounds() {
    if(gBrowser.map.gaode) {
        GaoDeFitbounds();
    }
    else {
        FireAfterGoogleResourceLoad({fn:function(){
            GoogleFitbounds();
        },args:[]})
    }
}

function SetMapToCenter(position) {
    if(gBrowser.map.gaode) {
        GaoDeSetCenter(position);
    }
    else {
        FireAfterGoogleResourceLoad({fn:function(){
            GoogleSetCenter(position);
        },args:[]})
    }
}
function GetCenterLatitude() {
    return gBrowser.map.gaode ? gMap.getCenter().getLat() : gMap.getCenter().lat();
}
function GetCenterLongitude() {
    return gBrowser.map.gaode ? gMap.getCenter().getLng() : gMap.getCenter().lng();
}
function GetMapCenter() {
    return {latitude:GetCenterLatitude(),longitude:GetCenterLongitude()};
}

//get address by coords
function GetAddressByCoords(position,callback) {
    if(gBrowser.map.gaode) {
        GaoDeGetAddressByCoords(position,callback);
    }
    else {
        FireAfterGoogleResourceLoad({fn:function(){
            GoogleGetAddressByCoords(position,callback);
        },args:[]})
    }
}

function GetMarkerLatitude() {
    return gBrowser.map.gaode ? myMarker.getPosition().lat : myMarker.position.lat;
}
function GetMarkerLongitude() {
    return gBrowser.map.gaode ? myMarker.getPosition().lng : myMarker.position.lng;
}
//please make sure call this function in FireAfterGoogleResourceLoad
function GetMarkerPosition() {
    return {latitude:GetMarkerLatitude(),longitude:GetMarkerLongitude()};
}
//Map API End

function GetDistance(myLati, myLongi,latitude, longitude) {
    var a=Math.pow(Math.sin((latitude-myLati)*Math.PI/180/2),2);
    var b=Math.cos(latitude*Math.PI/180)*Math.cos(myLati*Math.PI/180)*Math.pow(Math.sin((longitude-myLongi)*Math.PI/180/2),2);
    var c=Math.sqrt(a+b);
    var d=Math.asin(c)*2*6378.137;

    //#414 km to mile
    return d*0.621371192237;
}

function isValidDate(dateString) {
    var regEx = /^\d{4}-\d{2}-\d{2}$/;
    return dateString.match(regEx) != null;
}

function changeTableClass(tableObj) {
    tableObj.on('click-row.bs.table', function(e, row, $element) {
        $('.success').removeClass('success')
        $($element).addClass('success')
    })
}

function BTRowFormat(rowid, rowname) {
    return {
        field: rowid,
        title: rowname,
        class: 'text-nowrap',
        align: 'center',
        valign: 'middle'
    }
}
function BTRowFormatWithFormatter(rowid, rowname, rFormatter) {
    return {
        field: rowid,
        title: rowname,
        formatter: rFormatter,
        class: 'text-nowrap',
        align: 'center',
        valign: 'middle'
    }
}

function BTRowFormatEdNum(rowid, rowname,rFormatter,row) {
    return {
        field: rowid,
        title: rowname,
        class: 'text-nowrap',
        formatter: rFormatter,
        align: 'center',
        valign: 'middle',
        editable: {
            type: 'text',
            placement:'bottom',
            title:rowname,
            emptytext:'',
            validate: function(value) {
                value = $.trim(value)
                if (!value) {
                    return 'Please enter the amount of money'
                }
                if (!/^(-)?\d+(\.\d+)?$/.test(value)) {
                    return 'Please enter the correct amount format'
                }

                return ''
            }
        }
    }
}

function getParameter(param) {
    var reg = new RegExp("(^|&)" + param + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return decodeURIComponent(r[2]);
    }
    return null;
}

//var promise = new Promise(function (resolve, reject) {
//  get('http://www.google.com', function (err, res) {
//    if (err) reject(err);
//    else resolve(res);
//  });
//});
//****************************************************************************************************