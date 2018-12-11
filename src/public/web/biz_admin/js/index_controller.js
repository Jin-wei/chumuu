/**
 * Created by Josh on 2/12/16.
 */

app.controller("indexController", ['$rootScope','$scope','$mp_ajax','$mpAjax','$cookieStore','$browser','$location','$mpBaseConst','$mpBizInfo','$mpUser',
    function($rootScope,$scope,$mp_ajax,$mpAjax,$cookieStore,$browser,$location,$mpBaseConst,$mpBizInfo,$mpUser) {

    $rootScope.Const = $mpBaseConst;
    $rootScope.OrderConst = Const;
    $scope.$mpUser = $mpUser;
    $rootScope.adminId = $.cookie('userId');
    $rootScope.bizId = $.cookie('bizId');

    var Auth_Token = $.cookie($mpAjax.AUTH_NAME);
    if((Auth_Token && Auth_Token!="") || ($rootScope.adminId && $rootScope.adminId!="")) {
        $mpUser.init($rootScope.adminId);
        console.log($scope.$mpUser.getItem('name'));
    }
    $mpUser.checkRedirect();

        console.log($scope.$mpUser.getItem('name'));

    $scope.onLogout = function() {
        $.cookie($mp_ajax.AUTH_NAME,'');
        window.location.href = "biz_admin_login.html";
    };

    $rootScope.g_bizName = 'NOT INIT';
    $rootScope.bizInfo = {};

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
                $rootScope.L = $rootScope.i18n['en-us'];
            $.cookie('lang',key);
        }
    };
    var lang = $.cookie('lang');
    lang = lang ? lang : 'en-us';
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

    if(gBrowser.sys_config.commonBizId) {
        $rootScope.commonBizId = gBrowser.sys_config.commonBizId;
    }

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

    $rootScope.navTo = function(path) {
        $location.url(path);
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

    SetPositionOfPageContent();

    //Ken 2015-01-09 : looper_array store all objects that created by setInterval, and will clear them after location change.
    $rootScope.looper_array = [];
    $rootScope.$on('$locationChangeStart',function(){
        _.forEach($rootScope.looper_array,function(o){
            clearInterval(o);
        });
        $rootScope.looper_array = [];
    });
}] );
