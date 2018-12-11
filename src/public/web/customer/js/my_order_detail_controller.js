/**
 * Created by Ken on 14-8-5.
 */
app.controller("myOrderDetailController", ['$rootScope', '$scope', '$routeParams', '$location', '$location', '$q', '$timeout','$log',
    '$mpBizInfo','$mpCustomer','$mpCustomerOrder','$mpCustomerOrderItems',
function ($rootScope, $scope, $routeParams, $location, $location, $q, $timeout,$log,
    $mpBizInfo,$mpCustomer,$mpCustomerOrder,$mpCustomerOrderItems) {

    var L = $rootScope.L;
    $rootScope.setTitle('Order Detail');

    $scope.orderId = $routeParams.orderId ? parseInt($routeParams.orderId) : 0;
    if($scope.orderId==0) {
        ErrorBox('No Order Detail');
        return false;
    }
    $scope.backLink = 'my-orders';
    if($location.search().tab) {
        $scope.backLink += '?tab='+$location.search().tab;
    }

    $mpCustomer.onBaseDataLoaded(function(){
        $mpCustomerOrder.newInstance().findOne($scope.orderId).then(function(data){
            if(_.isArray(data) && data.length>0) {
                var o = data[0];
                var bizInfo = $mpBizInfo.newInstance();
                bizInfo.init(o.biz_id).then(function(data){
                    o.bizInfo = data;
                    $scope.bizInfo = data;
                    if($rootScope.coords && $rootScope.coords.latitude) {
                        var distance = GetDistance($rootScope.coords.latitude,$rootScope.coords.longitude, $scope.bizInfo.latitude, $scope.bizInfo.longitude);
                        if(!_.isNaN(distance))
                            $scope.bizInfo.distance = distance;
                    }
                });
                bizInfo.getRating();
                $mpCustomerOrderItems.newInstance().init(o.id).then(function(data){
                    o.items = data;
                    console.log(data);
                });
                $scope.order = o;
                console.log('order',$scope.order);
            }
            else {
                ErrorBox('Load Order Error');
            }
        });
    });

    $scope.onCancelOrder = function(order) {
        $( "#dialog-confirm" ).removeClass('hide').dialog({
            resizable: false,
            modal: true,
            buttons: [
                {
                    html: "<i class='icon-trash bigger-110'></i>&nbsp; "+ L.confirm,
                    "class" : "btn btn-danger btn-xs",
                    click: function() {
                        var confirmDlg = $( this );
                        $mpCustomerOrder.cancel(order.id).
                            then(function(data){
                                confirmDlg.dialog( "close" );
                                $rootScope.navTo('my-orders?tab=today');
                            });
                    }
                }
                ,
                {
                    html: "<i class='icon-remove bigger-110'></i>&nbsp; "+ L.cancel,
                    "class" : "btn btn-xs",
                    click: function() {
                        $( this ).dialog( "close" );
                    }
                }
            ]
        });
    };

    jQuery(document).ready(function(){
        OnViewLoad();
    });
    return;
}]);