/**
 * Created by ling xue on 25-12-14.
 */


app.controller("paymentController", ['$rootScope','$scope','$mp_ajax',function($rootScope,$scope ,$mp_ajax) {

   console.log('payment ');
    $scope.clientToken = "";

    $scope.paymentAction = '/cust/100385/order/28/payment';
    $mp_ajax.get("/cust/"+100385+"/paymentToken",function(success){
        $scope.clientToken = success.token;
        console.log($scope.clientToken);
        braintree.setup($scope.clientToken, 'paypal', {
            container: 'paypal-button',
            onSuccess : function(nonce,email){
               $mp_ajax.post("/order/23/paypal",{payment_method_nonce:nonce ,email:email},function(){
                    alert('success');
               },function(){
                    alert('error');
               });
            }
        });

        braintree.setup($scope.clientToken,"custom", {id: "checkout"});
    },function(error){
        alert(error);
        //AlertBox(error.outMsg || error.message);
    });

}] );




