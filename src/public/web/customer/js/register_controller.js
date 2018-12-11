/**
 * Created by Ken on 15-4-13.
 */

app.controller("registerController", ['$rootScope','$scope','$mpAjax','$location',
    '$mpCustomer',
function($rootScope,$scope ,$mpAjax,$location,
         $mpCustomer) {
    $scope.user = {};

    $scope.testSend = function () {
      console.log('Here');
    };

    $scope.onBtnSendCaptcha = function() {
        $mpCustomer.sendCaptcha($scope.user.phone).then(function(success){
            SuccessBox(success);
        }).catch(function(error){
            ErrorBox(error);
        });
    };

    $scope.onBtnRegister = function() {
        var L = $rootScope.L;
        if(($rootScope.isCN ? false : _.isEmpty($scope.user.email)) ||
            _.isEmpty($scope.user.password) ||
            _.isEmpty($scope.user.repassword) ||
            _.isEmpty($scope.user.phone) ||
            ($rootScope.isCN ? false : _.isEmpty($scope.user.first_name))||
            ($rootScope.isCN ? false : _.isEmpty($scope.user.last_name))||
            (!$rootScope.isCN ? false : _.isEmpty($scope.user.username))||
            (!$rootScope.isCN ? false : _.isEmpty($scope.user.text_code))
        ){
            WarningBox(L.enter_all_fields);
            return false;
        }

        if($scope.user.password != $scope.user.repassword) {
            WarningBox(L.change_password_warning_text_3);
            return false;
        }

        g_loading.show();
        $mpCustomer.register($scope.user).then(function(data){
            if (data.success === true) {
                $mpCustomer.init().then(function(data){
                    g_loading.hide();
                    $rootScope.navTo('/');
                }).catch(function(error){
                    g_loading.hide();
                    //ErrorBox(error);
                });
            }
            else {
                g_loading.hide();
                ErrorBox(data.errMsg);
            }
        }).catch(function(error){
            g_loading.hide();
            ErrorBox(error.outMsg);
        });
    };

//    postData.email = $scope.regEmail;
//    postData.password = $scope.newPassword;
//    postData.first_name = $scope.firstName;
//    postData.last_name = $scope.lastName;
//    postData.fbToken=$scope.fbToken;
}] );

