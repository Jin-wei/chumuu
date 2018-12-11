/**
 * Created by Ken on 2014-4-15.
 */

/*var crypto = require('crypto');*/
app.controller("indexController", ['$rootScope','$scope','$mp_ajax','$mpAjax','$browser','$location','$q',
    '$mpCustomer','$mpMyTable','$mpLanguage','$mpBaseConst','$mpBizInfo',
function($rootScope,$scope,$mp_ajax,$mpAjax,$browser,$location,$q,
         $mpCustomer,$mpMyTable,$mpLanguage,$mpBaseConst,$mpBizInfo) {
    $rootScope.Const = $mpBaseConst;

    $rootScope.$mpMyTable = $mpMyTable;
    $rootScope.$mpCustomer = $mpCustomer;
    $scope.currentPath = $location.path();
    var L = $rootScope.L;

    var Auth_Token = $.cookie($mp_ajax.CUST_AUTH_NAME);
    $rootScope.isLogin = false;
    if(Auth_Token && Auth_Token!="") {
        $mpCustomer.init().then(function(data){
            $scope.bizKey =data.biz_id;
            $scope.initAutoComplete();
        });
    }
    //constant
    $rootScope.CONST = {
        restaurant_open_state : {open:1,close:0,unknown:-1}
    };
    //search start
    $scope.searchText = "";
    $scope.onGlobalSearch = function() {
        if($("#searchText").val().length>0
              //#109
//            && $('.ac_results').css('display')=='none'
            ) {
            $location.url("search-menu-name/"+$("#searchText").val());
        }
    };
    $scope.initAutoComplete=function () {
        $("#searchText").on('keydown',function(event){
            if(event.keyCode==13) {
                $scope.$apply(function(){
                    $scope.onGlobalSearch();
                });
            }
        });
        $("#searchText").autocomplete('', {
            width: 320,
            urls:['/api/cust/do/searchBizTip?from=0&size=10','/api/cust/do/searchProdTip?from=0&size=10&bizId='+$scope.bizKey],
            max: 100,
            delay: 1000,
            highlight: false,
            multiple: true,
            multipleSeparator: "",
            scroll: true,
            //#109
            selectCallback: function() {
                console.log("on selected");
                $scope.$apply(function(){
                    $scope.onGlobalSearch();
                });
            },
            scrollHeight: 300
        });
    }

//    $scope.$watch('searchText',function(to,from){
//        console.log('searchText',to,from);
//    });
    //search end

    //$scope.onLogin = function() {
    //    $.cookie($mp_ajax.CUST_AUTH_NAME, '');
    //    $.cookie('customerId', '');
    //};

    $scope.onLogout = function() {
        //$.cookie($mpAjax.CUST_AUTH_NAME, '');
        //$.cookie('customerId', '');
        //$mpCustomer.setData(null);
        //$rootScope.custInfo = null;
        //$rootScope.custId = null;
        //$rootScope.isLogin = false;
        //window.location.href = '/';
        $mpCustomer.logout();
    };

    $rootScope.navTo = function(path) {
        $location.url(path);
    };

    $rootScope.isLoginBoxDisplay = false;
    $scope.onSignin = function() {
        if($location.path().indexOf('/top_dish')===0) {
            $rootScope.isLoginBoxDisplay = !$rootScope.isLoginBoxDisplay;
        }
        else {
            $rootScope.navTo('login');
        }
    };
    $rootScope.isMobileNavDisplay = false;
    $scope.onBtnToggleMobileNav = function() {
        $rootScope.isMobileNavDisplay = !$rootScope.isMobileNavDisplay;
    };
    //fired after click nav item
    $scope.onClickMobileNav = function() {
        $rootScope.isMobileNavDisplay = false;
    };
    $scope.onClickMobileNavItem = function() {
        console.log('2');
    };
    $scope.onClickUserOnNav = function() {
        $scope.showUserOptionsOnNav = !$scope.showUserOptionsOnNav;
        /*g_mask.show({opacity:0.4,onclick:function(){
            g_mask.hide();
            $scope.$apply(function(){
                $scope.showUserOptionsOnNav = false;
            });
        }});*/
    };
    $scope.onClickActionNav = function($event) {
        $scope.showUserOptionsOnNav = false;
        $event.stopPropagation();
        return false;
    };


    $rootScope.getRealBizId = function(bizId) {
        var deferred = $q.defer();
        var reg = /^\d+$/;
        if(reg.test(bizId)) {
            deferred.resolve(bizId);
        }
        else if(bizId && bizId.length>0) {
            $mp_ajax.promiseGet('/biz/'+bizId+'/uniqueName').then(function(data){
                deferred.resolve(data);
            });
        }
        else {
            console.log('getRealBizId -> wrong bizId');
            deferred.reject('getRealBizId -> wrong bizId');
        }
        return deferred.promise;
    };
    $rootScope.setTitle = function(title) {
        $rootScope.title = title + " - Chumuu";
    };
    $rootScope.setTitleEx = function(title) {
        $rootScope.title = title;
    };
    $rootScope.setGoogleSEO = function (googleSEO) {
        $rootScope.googleSEO = [];
        $rootScope.googleSEO.titleContent = googleSEO.titleContent;
        $rootScope.googleSEO.descriptionContent = googleSEO.descriptionContent;
        $rootScope.googleSEO.keywordsContend = googleSEO.keywordsContend;
    };
    $rootScope.setFBshare = function(FBshare) {
        $rootScope.FBshare_url = FBshare.url;
        $rootScope.FBshare_type = FBshare.type;
        $rootScope.FBshare_title = FBshare.title;
        $rootScope.FBshare_description = FBshare.description;
        $rootScope.FBshare_image = FBshare.image;
    };

    var curr = '$';
    var disName = 'mile';
    if(gBrowser.sys_config.distanceName) {
        disName = gBrowser.sys_config.distanceName;
    }
    $rootScope.disName = disName;

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

    //try to get location, save in $rootScope
    var location = $.cookie('location');
    if(location) {
        $rootScope.coords = angular.fromJson(location);
    }
    else {
        $rootScope.coords = {};
        GEOGetLocation(function(position){
            $rootScope.$apply(function(){
                $rootScope.coords = position.coords;
                console.log('get gaodeGEOLocation ',position.coords);
            });
        });
    }

    $scope.onChangeLanguage = function() {
//        $rootScope.LoadLanguage($rootScope.L.next_key);
        $mpLanguage.LoadLanguage($rootScope.L.next_key);
        //$.cookie('lang', $rootScope.L.next_key);
        window.location.reload();
    };

    //NG global function Start
    $rootScope.onOpenBizMapNavigator = function(biz) {
        window.open(GetNavigatedUrl(biz));
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
    //NG global function End

    //Ken 2015-01-09 : looper_array store all objects that created by setInterval, and will clear them after location change.
    $rootScope.looper_array = [];
    $rootScope.$on('$locationChangeStart',function(){
        $rootScope.gCurPath = $location.path();
        _.forEach($rootScope.looper_array,function(o){
            clearInterval(o);
        });
        $rootScope.looper_array = [];
    });
    $rootScope.$on('$locationChangeSuccess',function(){
        $rootScope.gCurPath = $location.path();
        $scope.initAutoComplete();
        window.setTimeout(function () {
            var currentPath=$rootScope.gCurPath;
            if(currentPath.indexOf('restaurant')==-1 && currentPath.indexOf('top-dish')==-1 && currentPath!=='/'){
                $rootScope.isToGetTicket();
            }
        },100)
    });


    //微信JS-SDK
    var wxdata = {
        app_id: sys_config.weixinConfig.app_id,
        secret: sys_config.weixinConfig.appsecret,

        jsapi_ticket: "", // 凭证
        ticket_expires_in: "", // 凭证过期时间 单位：s
        url: "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + sys_config.weixinConfig.app_id + "&secret=" + sys_config.weixinConfig.appsecret,
    }

    function indexIsWeiXin(){
        var ua = navigator.userAgent.toLowerCase();
        if(ua.match(/MicroMessenger/i)=="micromessenger") {
            return true;
        } else {
            return false;
        }
    }

    function isAndroid() {
        if(/android/i.test(navigator.userAgent)){
            document.write("This is Android'browser.");//这是Android平台下浏览器
            return true;
        }else{
            return false;
        }

    }

    function getNonceStr() {
        return Math.random().toString(36).substr(2, 15);
    };

    function getTimestamp() {
        return parseInt(new Date().getTime() / 1000);
    };

    function toSha1(value) {
        var shaStr=sha1(value);
        return shaStr
    }

    //微信 config参数
    function getWxcJSdkData(ticket) {
        var timestamp = getTimestamp();
        var nonceStr = getNonceStr();
        var urlStr =window.location.href.split('#')[0];
        var signStr = 'jsapi_ticket=' + ticket + '&noncestr=' + nonceStr + '&timestamp=' + timestamp + '&url=' + urlStr;
        var signature = toSha1(signStr);
        console.log('signStr: ', signStr, 'signature:', signature);
        return {
            debug: false,
            appId: wxdata.app_id,
            timestamp: timestamp,
            nonceStr: nonceStr,
            signature: signature,
            jsApiList: [
                'checkJsApi',
                'getLocation',
                'chooseImage',
                'previewImage',
                'onMenuShareTimeline',//分享到朋友圈
                'onMenuShareAppMessage',//分享给朋友
                'onMenuShareQQ',//分享到QQ
                'onMenuShareWeibo',//分享到腾讯微博
                'onMenuShareQZone'//分享到QQ空间
            ]
        };
    }

    //获得sdk ticket
    function getJsapiTticket(path,name,desc,img) {
        var url = 'getWxSDKAccessToken'
        $mp_ajax.get(url, function (data) {
            if (data.success) {
                var temy=data.result;
                wx.jsapi_ticket= data.result.jsapi_ticket;
                wx.ticket_expires_in=data.result.ticket_expires_in;
                var expiration_time = new Date().getTime() + (1000* (temy.ticket_expires_in-500));//过期时间戳

                $.cookie('jsapi_ticket', temy.jsapi_ticket);
                $.cookie('ticket_expires_in', temy.ticket_expires_in);
                $.cookie('expiration_time', expiration_time);//秒
                wxAddConfig(temy.jsapi_ticket,path,name,desc,img);
            }
        });
    }


    //注入 Config
    function wxAddConfig(ticket,path,name,desc,img) {
        var sdkConfigParams=getWxcJSdkData(ticket);
        wx.config(sdkConfigParams);


        wx.ready(function(){
            /*分享开始*/
            var shareTitle = L.share_title;
            var shareDesc= L.share_desc;
            var shareImg = window.location.protocol + '//' + window.location.host+"/image/logo200.png";
            var shareUrl=$location.$$absUrl;
            var currentPath=$location.$$path;

            if(currentPath=='/deal'){
                shareTitle=L.share_short+L.deals;
            }else if(currentPath=='/my-table'){
                shareTitle=L.share_short+L.my_table;
            }else if(currentPath=='/my-orders'){
                shareTitle=L.share_short+L.my_orders;
            }else if(currentPath=='/top-dish-old?login=1'){
                shareTitle=L.share_short+L.sign_in_out;
            }else if(currentPath=='/about-us'){
                shareTitle=L.share_short+L.about_us;
            }else if(currentPath=='/contact-us'){
                shareTitle=L.share_short+L.contact_us;
            }else if(currentPath=='/terms'){
                shareTitle=L.share_short+L.terms;
            }else if(currentPath=='/feedback'){
                shareTitle=L.share_short+L.feedbacks;
            }

            if(path){
                shareUrl=window.location.protocol + '//' + window.location.host+path;
            }
            if(name){
                shareTitle=name;
            }
            if(desc){
                shareDesc=desc;
            }
            if(img){
                shareImg=img;
            }

            /*alert(shareTitle);*/
            wx.onMenuShareTimeline({
                title : shareTitle, // 分享标题
                link :  shareUrl, // 分享链接
                imgUrl : shareImg, // 分享图标
                success : function() {
                    // 用户确认分享后执行的回调函数
                },
                cancel : function() {
                    // 用户取消分享后执行的回调函数
                }
            });

            wx.onMenuShareAppMessage({
                title: shareTitle, // 分享标题
                desc: shareDesc, // 分享描述
                link: shareUrl, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                imgUrl: shareImg, // 分享图标
                type: 'link', // 分享类型,music、video或link，不填默认为link
                dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                success: function () {
                    // 用户确认分享后执行的回调函数
                },
                cancel: function () {
                    // 用户取消分享后执行的回调函数
                }
            });

            wx.onMenuShareQQ({
                title: shareTitle, // 分享标题
                desc: shareDesc, // 分享描述
                link: shareUrl, // 分享链接
                imgUrl: shareImg, // 分享图标
                success: function () {
                   // 用户确认分享后执行的回调函数
                },
                cancel: function () {
                    // 用户取消分享后执行的回调函数
                }
            });

            wx.onMenuShareWeibo({
                title: shareTitle, // 分享标题
                desc: shareDesc, // 分享描述
                link: shareUrl, // 分享链接
                imgUrl: shareImg, // 分享图标
                success: function () {
                    // 用户确认分享后执行的回调函数
                },
                cancel: function () {
                    // 用户取消分享后执行的回调函数
                }
            });

            wx.onMenuShareQZone({
                title: shareTitle, // 分享标题
                desc: shareDesc, // 分享描述
                link: shareUrl, // 分享链接
                imgUrl: shareImg, // 分享图标
                success: function () {
                    // 用户确认分享后执行的回调函数
                },
                cancel: function () {
                    // 用户取消分享后执行的回调函数
                }
            });
            //wx.hideOptionMenu();/***隐藏分享菜单****/


        })
        /*wx.error(function(res){
            $rootScope.isToGetTicket(ticket,path,name,desc,img);
        });*/
    }




    //判断是否开始微信js-sdk
    $rootScope.isToGetTicket=function (path,name,desc,img) {
        var isWeiXin = indexIsWeiXin();
        var weixinSwitch = sys_config.weixinConfig.jsdIsOpen;
        if (isWeiXin && weixinSwitch) {
            var getTicket= $.cookie('jsapi_ticket');
            var expiration_time= $.cookie('expiration_time');
            var current_time=new Date().getTime();

            if(getTicket && (current_time<expiration_time)){
                wxAddConfig(getTicket,path,name,desc,img);
            }else{
                getJsapiTticket(path,name,desc,img);
            }
        }
    }




}] );
