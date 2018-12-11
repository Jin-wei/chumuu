/**
 * Created by ibm on 14-6-13.
 */

app.controller("loginController", ['$rootScope','$scope','$mpAjax','$location','$mpCustomer','$mp_ajax','$timeout','$mpMyTable',
    function($rootScope,$scope ,$mpAjax,$location,$mpCustomer,$mp_ajax,$timeout,$mpMyTable) {
        //auto login one

        if ($rootScope.isAutoLogin){
            $scope.cust_user="a";
            $scope.cust_password="b";
            //trigger the login button automatically
            $timeout(function() {
                angular.element('#btn2').triggerHandler('click');
            },0);
        }else{
            //remeber me one
            $scope.cust_user=$mp_ajax.getCookie($mp_ajax.CUST_USER);
            $scope.cust_password=$mp_ajax.getCookie($mp_ajax.CUST_PASSWORD);
        }

        /**
         * Auto login after check auth_token
         */
        var L = $rootScope.L;

        jQuery("#mp-login-input input").on('keydown',function(event){
            if(event.keyCode==13) {
                $scope.$apply(function(){
                    $scope.doLogin();
                });
            }
        });
        $scope.remember_user = true;
        $scope.$on('facebook.login',function(event,msg){
            var postData = {};
            postData.user = msg.postData.email;
            postData.password = msg.postData.password;
            postData.fbToken= msg.postData.fbToken;
            console.log("fbToken==========="+postData.fbToken);
            $mpAjax.post("/cust/do/login",postData).then(function(json){
                jQuery.cookie($mpAjax.CUST_AUTH_NAME, json['accessToken'],{path:'/'});
                //$cookieStore.put($mpAjax.AUTH_NAME,json['accessToken']);
                if(!json['customerId']){
                    WarningBox('No customer info');
                }else{
                    jQuery.cookie('customerId',json['customerId'],{path:'/'});
                    jQuery.cookie($mpAjax.CUST_AUTH_NAME,json.accessToken,{path:'/'});
                    //Redirect to pre url
                    var preUrl = getUrlParam("preUrl")
                    if(preUrl != null ){
                        window.location.href = preUrl;
                        return;
                    }
                    window.location.href = "/";
                }
            }).catch(function(json) {
                if(typeof(json) != 'undefined' && typeof(json.message) != 'undefined')
                    ErrorBox("Login failed. " + json.outMsg);
                else
                    ErrorBox("Login failed, please try again later.");
            });
        });
        $scope.doLogin = function () {
            var postData = {};
            if ($rootScope.isCN) {
                postData.phone = $scope.cust_user;

            }
            else {
                postData.email = $scope.cust_user;
            }
            postData.password = $scope.cust_password;
            postData.fbToken=$scope.fbToken;

            if ($rootScope.isAutoLogin) {
                postData.phone = $rootScope.autoLoginUserName;
                postData.password = $rootScope.autoLoginPassword;
                postData.qr=$rootScope.autoLoginQR;
                delete postData.email;
            }

            $mpCustomer.login(postData).then(function(data){
                if(jQuery("#remember-me").prop('checked') && !$rootScope.isAutoLogin) {
                    jQuery.cookie($mp_ajax.CUST_USER, $scope.cust_user, {path: '/', expires: 30});
                    jQuery.cookie($mp_ajax.CUST_PASSWORD, $scope.cust_password, {path: '/', expires: 30});
                }else {
                    jQuery.cookie($mp_ajax.CUST_USER, '', {path: '/', expires: -1});
                    jQuery.cookie($mp_ajax.CUST_PASSWORD, '', {path: '/', expires: -1})
                }
                if(data.tableQrCode!==''){
                    $.cookie('qr',data.tableQrCode);
                }
                $mpCustomer.init().then(function(data) {
                    var preUrl = getUrlParam("preUrl");
                    if (preUrl != null && !$rootScope.isAutoLogin) {
                        $rootScope.navTo(preUrl);
                        return;
                    } else {
                        if ($mpCustomer.getItem("biz_id")!=null){
                            //clear my table if login into another biz
                            if ($mpMyTable.getData().bizId !=$mpCustomer.getItem("biz_id")){
                                $mpMyTable.clear();
                            }
                            $rootScope.navTo('/restaurant/'+$mpCustomer.getItem("biz_id")+'/menu');

                        }else {
                            $rootScope.navTo('/');
                        }
                        return;
                        //window.location.reload();
                    }

                }).catch(function(error){
                    if ($rootScope.isAutoLogin){
                        return $rootScope.navTo('/404');
                    }else {
                        ErrorBox(error);
                    }
                });
            }).catch(function(json){
                if ($rootScope.isAutoLogin){
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
            //$.cookie($mpAjax.CUST_AUTH_NAME, '');
            //$.cookie('customerId', '');
            //var postData = {};
            //postData.user = $scope.user;
            //postData.password = $scope.password;
            //postData.fbToken=$scope.fbToken;
            //
            //$mpAjax.post("/cust/do/login",postData).then(function(json){
            //    $.cookie($mpAjax.CUST_AUTH_NAME, json['accessToken'],{path:'/'});
            //    if(!json['customerId']){
            //        WarningBox('No customer info');
            //    }else{
            //        $.cookie('customerId',json['customerId'],{path:'/'});
            //        //Redirect to pre url
            //        var preUrl = getUrlParam("preUrl");
            //        if(preUrl != null ){
            //            window.location.href = preUrl;
            //            return;
            //        }
            //        window.location.href = "/";
            //    }
            //}).catch(function(json) {
            //    if(typeof(json) != 'undefined' && typeof(json.message) != 'undefined')
            //        ErrorBox("Login failed. " + json.outMsg);
            //    else
            //        ErrorBox("Login failed, please try again later.");
            //});
        };
    }] );

/*app.controller("forgetPasswordController", ['$rootScope','$scope','$mpAjax',function($rootScope,$scope ,$mpAjax) {

 //$scope.email = "";
 $scope.sendResetPasswordEmail = function () {
 $("#sendEmailBtn")[0].disabled = true;
 var postData = {};
 postData.email = $scope.email;


 $mpAjax.post("/cust/send/passwordMail",postData,function(json){

 $("#sendEmailBtn")[0].disabled = false;
 if(json != null && json.success){
 SuccessBox("Reset password email has been send,please check it",{timeout:4000});
 }else{
 ErrorBox("Send reset password email failed");
 }
 },function(json) {
 $("#sendEmailBtn")[0].disabled = false;
 if(typeof(json) != 'undefined' && typeof(json.message) != 'undefined')
 ErrorBox("Send reset password email failed, " + json.outMsg);
 else
 ErrorBox("Send reset password email failed, please try again later.");
 });
 };


 }] );*/

