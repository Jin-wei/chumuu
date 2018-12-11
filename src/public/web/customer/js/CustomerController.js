/**
 * Created by ling xue on 14-6-19.
 */



app.controller("customerController", ['$rootScope','$scope','$mp_ajax',function($rootScope,$scope ,$mp_ajax) {
    $rootScope.customerId = $.cookie('customerId');
    $rootScope.bizId = $.cookie('bizId');

    $scope.isLogin = false;
    if($.cookie($mp_ajax.CUST_AUTH_NAME)){
        $scope.isLogin = true;
    }
    $scope.doLogout = function() {
        $.cookie($mp_ajax.CUST_AUTH_NAME,'');
        window.location.href = "customer/login.html";
    };



}] );




