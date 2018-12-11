/**
 * Created by ling xue on 17-6-13.
 */


app.controller("activeController", ['$rootScope','$scope','$mp_ajax',function($rootScope,$scope ,$mp_ajax) {

    /*$scope.user = "";
     $scope.password = "";*/
    /**
     * get param by url
     */

    var paramData = getUrlParam('data');
    var uid = getUrlParam('uid');
    $scope.active = 0;

    $mp_ajax.get("/cust/"+uid+"/active?data="+paramData,function(success){
        $.cookie($mp_ajax.CUST_AUTH_NAME, success['accessToken'],{path:'/'});
        $scope.active = 1;
        if(success['customerId']){

            $.cookie('customerId',success['customerId'],{path:'/'});
            window.location.href = "/";
        }
    },function(error){
        $scope.active = 0;
        //AlertBox(error.outMsg || error.message);
    });



}] );




