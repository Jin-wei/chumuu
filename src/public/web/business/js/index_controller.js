/**
 * Created by Ken on 2014-4-15.
 */

app.controller("indexController", ['$rootScope','$scope','$mp_ajax','$cookieStore','$browser','$location',function($rootScope,$scope,$mp_ajax,$cookieStore,$browser,$location) {
    var authToken = $.cookie($mp_ajax.AUTH_NAME);
    $rootScope.bizId = $.cookie('bizId');
    $rootScope.userId = $.cookie('userId');
    $rootScope.maxAgeTime = $.cookie('maxAgeTime');
    $scope.showLeftMenu=true;

    if(_.isEmpty(authToken) || _.isEmpty($rootScope.bizId) || _.isEmpty($rootScope.userId)) {
        $.cookie($mp_ajax.AUTH_NAME,'');
        window.location.href = "biz_login.html";
    }
    $scope.onLogout = function() {
        $.cookie($mp_ajax.AUTH_NAME,'');
        window.location.href = "biz_login.html";
    };

    $rootScope.g_bizName = 'NOT INIT';
    $rootScope.bizInfo = {};
    if ($rootScope.bizId) {
        $mp_ajax.promiseGet('/biz/' + $rootScope.bizId).then(function (data) {
            if(_.isObject(data)) {
                $rootScope.g_bizName = data.name;
                $rootScope.bizInfo = data;
                $mp_ajax.promiseGet('/biz/'+$rootScope.bizId+'/taxRate').then(function (data) {
                    $rootScope.bizInfo.tax_rate = data.tax_rate;
                });
            }
        });
        $mp_ajax.promiseGet('/bizUser/' + $rootScope.bizId).then(function (data) {
            console.log(data);
            for(var i in data){
                if($rootScope.userId == data[i].user_id){
                    $rootScope.g_user = data[i];
                }
            }
        });
    }
    //Handle tab changing event
    $(".nav-list>li>a").each(function() {
        $(this).click(function() {
            $(".nav-list .active").removeClass('active');
            $(this).parent().addClass('active');
        });
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

    $scope.doClick = function () {
        var getBiz = $mp_ajax.get("/biz",function(data){
            console.log("ajax success");
            $scope.users = data;
        },function() {
            alert("ajax error");
        });
    };

    window.onresize = function() {
        SetPositionOfPageContent();
    };

    //#120
    $rootScope.i18n = {
        'en-us':en_us,
        'zh-cn':zh_cn
    };
    $rootScope.LoadLanguage = function(key) {
        if(key && key!=$rootScope.curLang) {
            $rootScope.curLang = key;
            $rootScope.L = $rootScope.i18n[key];
            //#188
            if(!$rootScope.L)
                $rootScope.L = gBrowser.sys_config.isCN ? $rootScope.i18n['zh-cn'] : $rootScope.i18n['en-us'];
            $.cookie('lang',key);
        }
    };
    var lang = $.cookie('lang') || (gBrowser.sys_config.isCN ? 'zh-cn' : 'en-us');
    /*lang = lang ? lang : 'en-us';*/
    $scope.displayChangeLanguage = true;
    if(gBrowser.sys_config.language) {
        lang = gBrowser.sys_config.language;
        //disable language changing, if we have system config
        $scope.displayChangeLanguage = false;
    }
    $rootScope.LoadLanguage(lang);

    var curr = '$';

    if(gBrowser.sys_config.currency) {
        curr = gBrowser.sys_config.currency;
    }
    $rootScope.currency = curr;

    $rootScope.isCN = false;
    $rootScope.phoneLength = 10;
    $rootScope.dateFormat = 'MM/dd/yyyy';
    $rootScope.todaySdateFormat = 'dddd MMMM D YYYY';
    $rootScope.dateTimeFormat = 'MM/dd/yyyy hh:mm TT';
    $rootScope.datePickerFormat = 'mm/dd/yy';

    if (gBrowser.sys_config.isCN && gBrowser.sys_config.isCN === true) {
        $rootScope.isCN = gBrowser.sys_config.isCN;
        $rootScope.phoneLength = 11;
        $rootScope.dateFormat = 'yyyy-MM-dd';
        $rootScope.todaySdateFormat = 'YYYY-MM-DD';
        $rootScope.dateTimeFormat = 'yyyy-MM-dd hh:mm TT';
        $rootScope.datePickerFormat = 'yy-mm-dd';
    }

    $rootScope.setTitle = function(title) {
        $rootScope.title = title + " - Chumuu";
    };

    $scope.onChangeLanguage = function() {
        //$rootScope.LoadLanguage($rootScope.L.next_key);
        $.cookie('lang', $rootScope.L.next_key);
        window.location.reload();
    };
    $rootScope.DateFormat = function(date,mask) {
        var ret = "";
        try {
            ret = DateUtil.format(date,mask);
        }catch(e){}
        return ret;
    };

    $rootScope.range = function(start, count) {
        var ret = [];
        if(arguments.length==1) {
            count = start;
            start = 0;
        }
        for(var i=start;i<count;++i) {
            ret.push(i);
        }
        return ret;
    };

    //load printer information
    $mp_ajax.promiseGet('/biz/'+$rootScope.bizId+'/printer').then(function(data){
        if(_.isArray(data)) {
            g_printer.init(data);
        }
    });
    SetPositionOfPageContent();


    var matchMaxAgeTime=function () {
        //判断是否超时
        var currentDate=(new Date()).getTime();
        $rootScope.maxAgeTime = $.cookie('maxAgeTime');
        if(currentDate>$rootScope.maxAgeTime){
            window.location.href = "biz_login.html";
        }
    }

    //Ken 2015-01-09 : looper_array store all objects that created by setInterval, and will clear them after location change.
    $rootScope.looper_array = [];
    $rootScope.$on('$locationChangeStart',function(){
        _.forEach($rootScope.looper_array,function(o){
            clearInterval(o);
        });
        $rootScope.looper_array = [];
    });
    $rootScope.$on('$locationChangeSuccess',function(){
        $('#menu-toggler').removeClass('display');
        $('#sidebar').removeClass('display');
        matchMaxAgeTime();
        var temy=$location.$$path;
        var HistoryUrl=$location.$$url;
        localStorage.setItem("HistoryUrl",HistoryUrl);
        if(temy==='/order-list' || temy==='/order-list-detail'){
            $scope.showLeftMenu=false;
        }else{
            $scope.showLeftMenu=true;
        }
    });

}] );
