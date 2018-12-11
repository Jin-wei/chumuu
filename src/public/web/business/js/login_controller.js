/**
 * Created by Ken on 2014-4-15.
 */

app.controller("loginController", ['$rootScope','$scope','$mp_ajax','$cookieStore',function($rootScope,$scope ,$mp_ajax, $cookieStore) {
    $scope.user=$mp_ajax.getCookie($mp_ajax.USER);
    $scope.password=$mp_ajax.getCookie($mp_ajax.PASSWORD);
    //#120
    /*$rootScope.i18n = {
        'en-us':en_us,
        'zh-cn':zh_cn
    };
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
    };*/
    var L = $rootScope.L;

//    $scope.user = 'kfish@gmail.com';
//    $scope.password = 'mp';
  //  $scope.remember_user = true;

    $scope.onLogin = function () {

        if(_.isEmpty($scope.user) || _.isEmpty($scope.password)) {
            WarningBox('Please enter your username and password');
            return false;
        }
        var postData = {};
        postData.user = $scope.user;
        postData.password = $scope.password;
       // var expires = $scope.remember_user ? 30 : null;

        var bizLogin = $mp_ajax.post("/bizUser/do/login",postData,function(json){
            if($("#remember-me").prop('checked')){
                //maxAgeTime
                var currentDate=new Date();
                currentDate.setTime(currentDate.getTime() + (29* 86400000));
                $.cookie('maxAgeTime',currentDate.getTime(),{path:'/',expires:30});

                $.cookie($mp_ajax.AUTH_NAME, json['accessToken'],{path:'/',expires:30});
                //$cookieStore.put($mp_ajax.AUTH_NAME,json['accessToken']);
                $.cookie('userId',json['userId'],{path:'/',expires:30});
                $.cookie($mp_ajax.USER,$scope.user,{path:'/',expires:30});
                $.cookie($mp_ajax.PASSWORD,$scope.password,{path:'/',expires:30});
                if(!json['bizId']){
//                $.cookie('bizId',json['bizId'],{path:'/'});
                    window.location.href = "/business.html#/add_business";
                    //ErrorBox(L.msg_no_business_info);
                }else{
                    $.cookie('bizId',json['bizId'],{path:'/',expires:30});
                    var HistoryUrl=localStorage.getItem("HistoryUrl");
                    if(HistoryUrl){
                        window.location.href = "/business.html#"+HistoryUrl;
                    }else {
                        window.location.href = "/business.html#/profile";
                    }
                }
            }else{
                console.log("in unchecked box");
                $.cookie($mp_ajax.AUTH_NAME, json['accessToken'],{path:'/',expires:30});
                $.cookie($mp_ajax.USER,'',{path:'/',expires:-1});
                $.cookie($mp_ajax.PASSWORD,'',{path:'/',expires:-1});
                //$cookieStore.put($mp_ajax.AUTH_NAME,json['accessToken']);
                $.cookie('userId',json['userId'],{path:'/',expires:30});
                if(!json['bizId']){
//                $.cookie('bizId',json['bizId'],{path:'/'});
                    window.location.href = "/business.html#/add_business";
                    //ErrorBox(L.msg_no_business_info);
                }else{
                    $.cookie('bizId',json['bizId'],{path:'/',expires:30});
                    var HistoryUrl=localStorage.getItem("HistoryUrl");
                    if(HistoryUrl){
                        window.location.href = "/business.html#"+HistoryUrl;
                    }else {
                        window.location.href = "/business.html#/profile";
                    }
                }
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
    };
    /*$scope.showBox = function(name) {
        angular.element(".widget-box").css("display","none");
        angular.element("#"+name).css("display","block");
    };*/


}] );

app.controller("signUpController", ['$rootScope','$scope','$mp_ajax',function($rootScope,$scope ,$mp_ajax) {
    $scope.doSignUp = function () {
        $("#signUpBtn")[0].disabled = true;
        var postData = {};
        postData.email = $scope.regEmail;
        if ($scope.newPassword==$scope.retypeNewPassword) {
            postData.password = $scope.newPassword;
        }
        postData.username = $scope.userName;
        postData.first_name = $scope.firstName;
        postData.last_name = $scope.lastName;
        postData.phone_num = $scope.phoneNum;

        $mp_ajax.post("/bizUser",postData,function(json){

            $("#signUpBtn")[0].disabled = false;
            if(json != null && json.success){
                if (!json.loginInfo){
                    SuccessBox("New user registration successful. Please check your email to activate your account.");
                }else{
                    //logined directly
                    $.cookie('customerId',json.loginInfo['customerId'],{path:'/'});
                    //Redirect to pre url
                    var preUrl = getUrlParam("preUrl")
                    if(preUrl != null ){
                        window.location.href = preUrl;
                        return;
                    }
                    window.location.href = "/";
                }
                //window.location.href("/success.html");
            }else{
                ErrorBox("New user registration failed")
            }
        },function(json) {
            $("#signUpBtn")[0].disabled = false;
            if(typeof(json) != 'undefined' && typeof(json.message) != 'undefined')
                ErrorBox("New user registration failed: " + json.outMsg);
            else
                ErrorBox("New user registration failed, please try again later.");
        });
    };


}] );