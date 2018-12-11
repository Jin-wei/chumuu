/**
 * Created by md on 14-7-29.
 */

//return a url which can navigate customer to this biz
function GetNavigatedUrl(biz) {
    var url = '';
    if(gBrowser.map.gaode) {
//        url = "http://www.amap.com/#!poi!!q="+biz.longitude+"%2C"+biz.latitude+"&_t="+Date.parse(new Date());
     //   url = "http://www.amap.com/#!poi!!q="+biz.city+"%2C"+biz.address+"&_t="+Date.parse(new Date());
        url = "http://ditu.amap.com/search?query=" +  biz.address + "&city=" + biz.zipcode;
    }
    else {
        url = "http://www.google.com/maps/place/"+biz.address+","+biz.city+", "+biz.state+" "+biz.zipcode;
    }
    return url;
}

function OnViewLoad() {
    DisableAutoZoom();
    //#154
    $('body').scrollTop(0);
    //remove all callback functions
    ClearAllEventCallback();
    $('textarea[class*=autosize]').autosize({append: "\n"});

    $('.date-picker').datepicker({autoclose:true}).next().on(ace.click_event, function(){
        $(this).prev().focus();
    });
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
    var position=new AMap.LngLat(120.397428,34.90923);
    gMap = new AMap.Map(divID,{
        view: new AMap.View2D({//创建地图二维视口
            center:position,//创建中心点坐标
            zoom:14, //设置地图缩放级别
            rotation:0 //设置地图旋转角度
        }),
        lang:"zh_cn"//设置地图语言类型，默认：中文简体
    });//创建地图实例

    myMarker = new AMap.Marker({
        icon:new AMap.Icon({    //复杂图标
//            size:new AMap.Size(28,37),//图标大小
            image:'customer/image/marker.png'
//            image: "http://webapi.amap.com/images/custom_a_j.png",
//            imageOffset:new AMap.Pixel(-28,0)//相对于大图的取图位置
        }),
        position:new AMap.LngLat(120.597428,38.90923)
    });
    myMarker.setMap(gMap);  //在地图上添加点

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
    myMarker.setMap(null);
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

function SetCenter(position) {
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

    if(typeof sys_config == 'object') {
        if(sys_config.distanceFactor){
            return d*sys_config.distanceFactor;
        }
        else
            return d*0.621371192237;
    }
    else {
        //#414 km to mile
        return d*0.621371192237;
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


function getWeiXinAccessToken($mp_ajax,$mpAjax) {
    var is_weixn=isWeiXin();
    var wxCode=getParameter('code');
    var refresh_token=null;
    console.log('wxCode'+wxCode);
    if($.cookie('refresh_token')){
        refresh_token=$.cookie('refresh_token');
    }
    if(wxCode && is_weixn){
        var url='/getWeiXinAccessToken/code/'+wxCode+'/refreshToken/'+refresh_token;
        $mp_ajax.get(url,function(data){
            var temy=data;
            $.cookie('access_token',data.access_token);
            $.cookie('refresh_token',data.refresh_token);
            $.cookie('openid',data.openid);
            getWeiXinUser($mpAjax);
        });
    }
}

function getWeiXinUser($mpAjax) {
    var openid=$.cookie('openid');
    var access_token=$.cookie('access_token');
    var ua = navigator.userAgent.toLowerCase();
    if(openid && access_token){
        var params={
            access_token:access_token,
            openid:openid,
            ip:returnCitySN["cip"],
            user_agent:ua
        }
        var url='/getWeiXinUser';
        $mpAjax.post(url,params).then(function(data){
            if(data.success){
                setOperatorIdCcookie(data.result[0].operator_id);
                addUserHistory($mpAjax,2,data.result[0].operator_id);
                $.cookie('nickName',data.result[0].nickname);
            }
        });
    }

}

var addUserHistory=function ($mpAjax,type,operator_id) {
    var  params={
        operator_id:operator_id,
        operation:type,//1 login  2 scan
        customer_id:$.cookie('customerId')
    }
    if(params.operator_id){
        var url='/addOperatorHistory';
        $mpAjax.post(url, params).then(function (data) {
            if (data.success) {
                return true
            } else {
                return false
            }
        });
    }
}

function isWeiXin(){
    var ua = navigator.userAgent.toLowerCase();
    if(ua.match(/MicroMessenger/i)=="micromessenger") {
        return true;
    } else {
        return false;
    }
}

function setOperatorIdCcookie(operator_id) {
    var maxDate = new Date();
    maxDate.setTime(maxDate.getTime() + (3* 31536000000));
    $.cookie('operator_id', operator_id, { expires: maxDate });
}

function getTime() {
    var d = new Date();
    var hours=d.getHours();
    var minutes=d.getMinutes();
    var seconds=d.getSeconds();

    var time=hours+":"+minutes+":"+seconds;

    return time
}

function compareTime(a1,b1){
    var a2 = new Date(a1);
    var utc8 = a2.getTime();
    var a = new Date(utc8);

    var b2 = new Date(b1);
    var utc8 = b2.getTime();
    var b = new Date(utc8);

    var i= a.getHours()*60*60+ a.getMinutes()*60+ a.getSeconds();
    var n= b.getHours()*60*60+ b.getMinutes()*60+ b.getSeconds();
    if(i>n){
        return "bigger";
    }else if(i<n){
        return "small";
    }else{
        return "equal";
    }
}

function timeForamt(date){
    if(date == null || date==""){
        return null;
    }else {
        var d = new Date(date);
        var utc8 = d.getTime();
        var newTime = new Date(utc8);
        var Year = newTime.getFullYear();
        var Month = newTime.getMonth()+1;
        var myDate = newTime.getDate();
        var hour = newTime.getHours();
        var minute = newTime.getMinutes();
        var seconds = newTime.getSeconds();
        var allTime = hour+":"+minute+":"+seconds;

        return allTime;
    }
}

//var promise = new Promise(function (resolve, reject) {
//  get('http://www.google.com', function (err, res) {
//    if (err) reject(err);
//    else resolve(res);
//  });
//});
