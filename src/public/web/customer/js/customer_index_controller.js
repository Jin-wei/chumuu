/**
 * Created by Cici on 2018/2/6.
 */
app.controller("customerController", ['$rootScope','$scope','$location','$mp_ajax','$mpCustomer','$mpMyTable','$mpAjax',
    function($rootScope,$scope,$location,$mp_ajax,$mpCustomer,$mpMyTable,$mpAjax) {
        //空白页，微信授权使用
        var is_weixn=isWeiXin();//判断是否是微信
        var operator_id = $.cookie('operator_id');//操作者Id
        var qr=$location.$$search.q;//用于登录的code
        if(qr){
            $.cookie('qr',qr);
        }
        var autoLoginUserName = $location.$$search.t;
        var autoLoginPassword = $location.$$search.p;
        var newPath='';
        var weixinSwitch=sys_config.weixinConfig.authIsOpen;//微信认证开关
        var isAutoLogin=(($location.$$search.t!=null && $location.$$search.p!=null) || $location.$$search.q!=null);
        var L = $rootScope.L;

        //微信授权参数
        var wxd={
            wxHost:  window.location.protocol + '//' + window.location.host,
            authUrl:'https://open.weixin.qq.com/connect/oauth2/authorize',
            wxAppId:sys_config.weixinConfig.app_id,
            secret:sys_config.weixinConfig.appsecret,
            wxScope:"snsapi_userinfo",
            path:''
        }

       /* newPath='/top-dish-old'+window.location.search;*/
        g_loading.show();

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

        //前往微信授权页面
        var toWeixinAuthPath=function (wxd,path) {
            wxd.path=newPath;
            console.log('newPath');
            console.log(newPath);
            const redirectUrl = encodeURIComponent(wxd.wxHost+wxd.path);
            var weixinAuthParh=wxd.authUrl+'?appid='+wxd.wxAppId+'&redirect_uri='+
                redirectUrl+'&response_type=code&scope='+ wxd.wxScope+'&state=STATE#wechat_redirect';
            g_loading.hide();
            console.log(weixinAuthParh);
            console.log("weixinAuthParh");
            window.location =weixinAuthParh;
        };


        //判断当前页面是否在微信打开
        function toNextPage() {
            if(isAutoLogin && !operator_id){
                if(is_weixn && weixinSwitch){
                    toWeixinAuthPath(wxd);
                }else{
                    var url='/addOperatorUser';
                    var ua = navigator.userAgent.toLowerCase();
                    var params={
                        ip:returnCitySN["cip"],
                        user_agent:ua
                    };
                    $mpAjax.post(url,params).then(
                        function(data){
                            setOperatorIdCcookie(data.result[0].operator_id);
                            addUserHistory($mpAjax,2,data.result[0].operator_id);
                            g_loading.hide();
                            $rootScope.navTo(newPath);
                        }
                    );
                }
            }else{
                g_loading.hide();
                if(operator_id){
                    var  params={
                        operator_id:operator_id,
                        operation:2,//1 login  2 scan
                        customer_id:$.cookie('customerId')
                    }
                    if(params.operator_id){
                        var url='/addOperatorHistory';
                        $mpAjax.post(url, params).then(function (data) {
                            if (data.success) {
                                $rootScope.navTo(newPath);
                            } else {
                                $rootScope.navTo(newPath);
                            }
                        });
                    }
                }else{
                    $rootScope.navTo(newPath);
                }
            }
        }

        var doLogin = function () {
            var postData = {};

            if (isAutoLogin) {
                postData.phone = autoLoginUserName;
                postData.password = autoLoginPassword;
                postData.qr=qr;
                delete postData.email;
            }else{
                return
            }

            $mpCustomer.login(postData).then(function(data){
                if(jQuery("#remember-me").prop('checked') && !$rootScope.isAutoLogin) {
                    jQuery.cookie($mp_ajax.CUST_USER, $scope.cust_user, {path: '/', expires: 30});
                    jQuery.cookie($mp_ajax.CUST_PASSWORD, $scope.cust_password, {path: '/', expires: 30});
                }else {
                    jQuery.cookie($mp_ajax.CUST_USER, '', {path: '/', expires: -1});
                    jQuery.cookie($mp_ajax.CUST_PASSWORD, '', {path: '/', expires: -1})
                }
                $mpCustomer.init().then(function(data) {
                    var preUrl = getUrlParam("preUrl");
                    if (preUrl != null && !isAutoLogin) {
                        g_loading.hide();
                        $rootScope.navTo(preUrl);
                        return;
                    } else {
                        if ($mpCustomer.getItem("biz_id")!=null){
                            //clear my table if login into another biz
                            if ($mpMyTable.getData().bizId !=$mpCustomer.getItem("biz_id")){
                                $mpMyTable.clear();
                            }
                            newPath='/restaurant/'+$mpCustomer.getItem("biz_id")+'/menu';
                            console.log(newPath);
                            toNextPage();
                        }else {
                            g_loading.hide();
                            $rootScope.navTo('/');
                        }
                        return;
                    }

                }).catch(function(error){
                    if (isAutoLogin){
                        g_loading.hide();
                        return $rootScope.navTo('/404');
                    }else {
                        ErrorBox(error);
                    }
                });
            }).catch(function(json){
                g_loading.hide();
                if (isAutoLogin){
                    return $rootScope.navTo('/404');
                }
                if(typeof(json) != 'undefined' && typeof(json.message) != 'undefined') {
                    if (!$rootScope.isCN && L.key == 'en-us') {
                        ErrorBox("Login failed. " + json.outMsg);
                    }
                    if ($rootScope.isCN ||  L.key == 'zh-cn') {
                        if (json.outMsg == 'The email or password you entered is incorrect.') {
                            ErrorBox("登录失败，邮箱或密码错误");
                        }
                        if (json.outMsg == 'This email is not registered with tru-menu.') {
                            ErrorBox("登录失败，此邮箱尚未注册");
                        }
                        if (json.outMsg == 'The phone or password you entered is incorrect.') {
                            ErrorBox("登录失败，电话号码或密码错误");
                        }
                        if (json.outMsg == 'This phone number is not registered with tru-menu.') {
                            ErrorBox("登录失败，此电话号码尚未注册");
                        }
                    }
                }
                else {
                    ErrorBox(L.login_external_error);
                }
            });

            return true;
        };




        doLogin();
    }] );
