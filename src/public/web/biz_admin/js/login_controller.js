/**
 * Created by Josh on 2/15/16.
 */


app.controller("loginController", ['$rootScope','$scope','$mpAjax','$mpUser', function($rootScope,$scope,$mpAjax,$mpUser) {

    $scope.user = {};

    $rootScope.i18n = {
        'en-us':en_us,
        'zh-cn':zh_cn
    };
    $scope.currency = sys_config.currency;

    $rootScope.LoadLanguage = function(key) {
        if(key && key!=$rootScope.curLang) {
            $rootScope.curLang = key;
            $rootScope.L = $rootScope.i18n[key];
            $.cookie('lang',key,{path:'/'});
            L = $rootScope.L;
        }
    };

    var lang = $.cookie('lang');
    lang = lang ? lang : 'en-us';
    $rootScope.LoadLanguage(lang);

    $scope.onChangeLanguage = function() {
        $rootScope.LoadLanguage($rootScope.L.next_key);
    };
    var L = $rootScope.L;

    console.log('login controller');

    $scope.onLogin = function () {
        $mpUser.login($scope.user).then(function(data){
            console.log(data);
            window.location.href = "/biz_admin.html";
        }).catch(function(error){
            g_loading.hide();
            if(typeof(error) != 'undefined'){
                if (L.key == 'zh-cn' && (error == "This email is not registered with chumuu."))
                    ErrorBox(L.msg_login_fail + ", " + "此邮箱不存在");
                if (L.key == 'zh-cn' && (error == "The email or password you entered is incorrect."))
                    ErrorBox(L.msg_login_fail + ", " + "邮箱或密码输入错误");
                if (L.key == 'en-us')
                    ErrorBox(L.msg_login_fail + ", " + error);
            }
            else
                ErrorBox(L.msg_login_fail+", "+ L.msg_try_again_later+".");
        });
    };

    /*$scope.onLogin = function () {

        console.log('inside onlogin');

        if(_.isEmpty($scope.user.username) || _.isEmpty($scope.user.password)) {
            WarningBox(L.empty_warning_text);
            return false;
        }
        var postData = {};
        postData.user = $scope.user.username;
        postData.password = $scope.user.password;
        var expires = $scope.remember_user ? 30 : null;

        var bizLogin = $mp_ajax.post("/bizUser/do/login?parentFlag=1",postData,function(json){
            $.cookie($mp_ajax.AUTH_NAME, json['accessToken'],{path:'/',expires:expires});
            //$cookieStore.put($mp_ajax.AUTH_NAME,json['accessToken']);
            $.cookie('userId',json['userId'],{path:'/',expires:expires});
            if(!json['bizId']){
                //$.cookie('bizId',json['bizId'],{path:'/'});
                window.location.href = "/biz_admin.html";
                //ErrorBox(L.msg_no_business_info);
            }else{
                $.cookie('bizId',json['bizId'],{path:'/',expires:expires});
                window.location.href = "/biz_admin.html";
            }
        },function(json) {
            if(typeof(json) != 'undefined' && typeof(json.message) != 'undefined'){
                if (L.key == 'zh-cn' && (json.outMsg == "This email is not registered with chumuu."))
                    ErrorBox(L.msg_login_fail + ", " + "此邮箱不存在");
                if (L.key == 'zh-cn' && (json.outMsg == "The email or password you entered is incorrect."))
                    ErrorBox(L.msg_login_fail + ", " + "邮箱或密码输入错误");
                if (L.key == 'en-us')
                    ErrorBox(L.msg_login_fail + ", " + json.outMsg);
            }
            else
                ErrorBox(L.msg_login_fail+", "+ L.msg_try_again_later+".");
        });
    };*/
}] );