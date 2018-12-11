/**
 * Created by md on 14-8-22.
 */


//move page-content a little bit down in case of tabs cover part of it
function SetPositionOfPageContent() {
    if('block' == $("#menu-toggler").css("display")) {
        $("#ngViewDiv").css("paddingTop","50px");
    }
    else {
        $("#ngViewDiv").css("paddingTop","0px");
    }
}

function OnViewLoad() {
    SetPositionOfPageContent();
    preInit();
    //limitation of input
    $('.input-mask-number').keypress(function(event){
        var key = event.keyCode;
        if(key>=48 && key<=57) //0-9
            return true;
        return false;
    });
    $('.input-mask-price').keypress(function(event){
        var key = event.keyCode;
        if(key>=48 && key<=57) //0-9
            return true;
        if(key==46) { //[.] for float
            var val = $(this).val();
            if(val.length>0 && val.indexOf('.')==-1)
                return true;
        }
        return false;
    });
    //set related tab to active when refresh page with routing information
    var routePath = window.location.hash;
    if(routePath.length>0) {
        $(".nav-list .active").removeClass('active');
        $(".nav-list>li>a").each(function(){
            var link = $(this).attr("href");
            if(link.indexOf('#/')==0)
                link = link.substring(2);
            if(routePath.indexOf(link)>=0) {
                $(this).parent().addClass('active');
            }
        });
    }
    DisableAutoZoom();
}

function preInit(){
    $('[data-rel=tooltip]').tooltip({container:'body'});
    $('[data-rel=popover]').popover({container:'body'});
    $('.date-picker').datepicker({autoclose:true}).next().on(ace.click_event, function(){
        $(this).prev().focus();
    });
}

function objToStr(obj){
    var paramStr="";
    if(obj !=null){
        var keyStr = Object.keys(obj);
        for(var i=0; i<keyStr.length;i++){
            if(obj[keyStr[i]] != null){
                paramStr+="&"+keyStr[i]+"="+obj[keyStr[i]];
            }
        }
        paramStr = paramStr.substr(1,paramStr.length);
        paramStr = encodeURI("?"+paramStr);
    }
    return paramStr;
}


//检查平台
function checkPlatform(){
    var isMobile = false;
    if(/android/i.test(navigator.userAgent)){
        isMobile = true;//这是Android平台下浏览器
    }
    if(/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)){
        isMobile = true;//这是iOS平台下浏览器
    }
    if(/Linux/i.test(navigator.userAgent)){
        //这是Linux平台下浏览器
    }
    if(/Linux/i.test(navigator.platform)){
        //这是Linux操作系统平台
    }
    if(/MicroMessenger/i.test(navigator.userAgent)){
        //这是微信平台下浏览器
    }
    return isMobile;
}

//get the current date:yyyy-mm-dd
function getNowDate(){
    var nowDateStr="";
    var nowDate = new Date();
    var year = nowDate.getFullYear();
    var month = nowDate.getMonth()+1;
    var date = nowDate.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (date >= 0 && date <= 9) {
        date = "0" + date;
    }
    nowDateStr = year+"-"+month+"-"+date;
    return nowDateStr;
}

//get the current date:dd/mm/yyyy
function getNowDate2() {
    var nowDateStr = "";
    var nowDate = new Date();
    var year = nowDate.getFullYear();
    var month = nowDate.getMonth() + 1;
    var date = nowDate.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (date >= 0 && date <= 9) {
        date = "0" + date;
    }
    nowDateStr = +date + '/' + month + '/' + year;
    return nowDateStr;
}

function getNextDate(){
    var nowDateStr="";
    var nowDate = new Date();
    var year = nowDate.getFullYear();
    var month = nowDate.getMonth()+1;
    var date = nowDate.getDate()+1;
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (date >= 0 && date <= 9) {
        date = "0" + date;
    }
    nowDateStr = year+"-"+month+"-"+date;
    return nowDateStr;
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


        if(minute<10){
            minute="0"+minute;
        }
        if(seconds<10){
            seconds="0"+seconds;
        }
        if(hour<10){
            hour="0"+hour;
        }
        var allTime = hour+":"+minute+":"+seconds;
        return allTime;
    }
}