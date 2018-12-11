/**
 * Created by Ken on 15-3-2.
 */
app.controller("paymentController",
    ['$rootScope', '$scope', '$routeParams', '$mpAjax', '$location', '$q', '$timeout','$log',
    '$mpCustomer','$mpMyTable','$mpCustomerOrder',
function ($rootScope, $scope, $routeParams, $mpAjax, $location, $q, $timeout,$log,
          $mpCustomer,$mpMyTable,$mpCustomerOrder) {

    var L = $rootScope.L;

    if(!$mpMyTable.getData().orderInfo || !$mpMyTable.getData().orderInfo.id) {
        $rootScope.navTo('my-table');
        return false;
    }
    else {
        $mpCustomer.onBaseDataLoaded(function(){
            if(!$rootScope.isLogin)
                $rootScope.navTo('my-table');
        });
    }

    $scope.payment_type = $rootScope.isCN ? $rootScope.Const.PAYMENT_TYPE.PERSON : $rootScope.Const.PAYMENT_TYPE.CREDIT_CARD;
    $scope.orderId = $mpMyTable.getData().orderInfo.id;
    $scope.clientToken = "";
    $scope.paymentPrice = "";
    $scope.expirationYears = [];
    $scope.myTable = $mpMyTable.getData();
    console.log($scope.myTable);
    var curYear = new Date().getYear()-100;
    for(var i=0;i<30;++i) {
        $scope.expirationYears.push(curYear+i);
    }

    var errorMsg = $location.search().err;
    if(errorMsg) {
        ErrorBox(errorMsg.split('|').join('<br>'));
    }

    $scope.onBtnBackToCheckOut = function() {
        $mpCustomer.onBaseDataLoaded(function(){
            if($scope.orderId)
                $mpAjax.delete('/cust/'+$mpCustomer.getItem('customer_id')+'/order/'+$scope.orderId);
            $rootScope.navTo('checkout-order');
        });
    };

    $scope.onBtnBackToMyTable = function() {
        $mpCustomer.onBaseDataLoaded(function(){
            if($scope.orderId)
                $mpAjax.delete('/cust/'+$mpCustomer.getItem('customer_id')+'/order/'+$scope.orderId);
            $rootScope.navTo('my-table');
        });
    };

    $mpCustomer.onBaseDataLoaded(function(){
        if( !$rootScope.isCN ){
            $mpAjax.get("/cust/"+$mpCustomer.getItem('customer_id')+"/paymentToken").then(function(success){
                $scope.clientToken = success.token;
                braintree.setup($scope.clientToken, 'paypal', {
                    container: 'paypal-button',
                    onSuccess : function(nonce,email){
                        $mpAjax.post("/cust/"+$mpCustomer.getItem('customer_id')+"/order/"+$scope.orderId+"/paypal",{payment_method_nonce:nonce ,email:email}).then(function(result){
                            $rootScope.navTo('checkout-order-success');
                        }).catch(function(error){
                            ErrorBox(error.message);
                        });
                    }
                });
                $('#card_checkout').attr('action',"/api/cust/"+$mpCustomer.getItem('customer_id')+"/order/"+$scope.orderId+"/payment");
                braintree.setup($scope.clientToken,"custom", {id: "card_checkout"});
            }).catch(function(error){
                ErrorBox(error.message);
            });
        }

    });

    $scope.payInPerson = function() {
        $mpCustomerOrder.active().then(function (data) {
            $rootScope.navTo('checkout-order-success');
        }).catch(function (error) {
            $log.error(error);
            ErrorBox(L.operation_failed);
        });
    };
    $scope.payInAli = function(){
        /*var param ={
            orderId:$mpMyTable.getData().orderInfo.id
        }

        $mpAjax.post('/cust/'+$mpCustomer.getItem('customer_id')+'/alipay',param).then(function(result){
            document.write(result);
        }).catch(function(e){

        })*/
        window.open('#/alipay/'+$scope.orderId);
        $( "#dialog-alipay" ).removeClass('hide').dialog({
            resizable: false,
            modal: true,
            close: function(){
                window.location.reload();
            },
            buttons: [
                {
                    html: "支付遇到问题",
                    "class" : "btn btn-default btn-xs",
                    click: function() {
                        window.location.reload();
                    }
                }
                ,
                {
                    html: "支付成功",
                    "class" : "btn btn-success btn-xs",
                    click: function() {
                        window.location.reload();
                    }
                }
            ]
        });
    }

    jQuery(document).ready(function(){
        OnViewLoad();
    });
}]);