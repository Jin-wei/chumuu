/**
 * Created by ling xue on 2016/3/21.
 */

app.controller("alipayController", ['$rootScope','$scope','$mpAjax','$location','$mpCustomer', '$routeParams',
    function($rootScope,$scope ,$mpAjax,$location,$mpCustomer ,$routeParams) {
        $scope.paymentInfo ="正在跳转到支付宝";
        $scope.orderId = $routeParams.orderId;
        var param ={

        }

        $mpAjax.post('/cust/'+$mpCustomer.getItem('customer_id')+'/order/'+$scope.orderId+'/alipay',param).then(function(result){
            if(result && result.success ==false){
                $scope.paymentInfo = result.msg;
            }else{
                document.write(result.html);
            }
        }).catch(function(e){

        })
    }
]);