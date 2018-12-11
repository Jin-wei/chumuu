/**
 * Created by Ken on 14-8-5.
 */
app.controller("checkoutOrderSuccessController", ['$rootScope', '$scope', '$routeParams', '$mpAjax', '$location', '$q',
    '$timeout','$mpMyTable','$mpCustomer','$mp_ajax',
function ($rootScope, $scope, $routeParams, $mpAjax, $location, $q, $timeout,$mpMyTable,$mpCustomer,$mp_ajax) {

    var L = $rootScope.L;

    if(!$mpMyTable.getData().orderInfo || !$mpMyTable.getData().orderInfo.id) {
        WarningBox("You don't have any order or your order already be submitted.");
        $rootScope.navTo('my-table');
        return false;
    }
    $scope.orderId = $mpMyTable.getData().orderInfo.seq;


    var orderStart =$mpMyTable.getData().orderInfo.orderStart;
    $scope.order_date = DateUtil.format(DateUtil.UTCDateTime2LocalDateTime(orderStart),'yyyy-MM-dd HH:mm');
    $mpMyTable.clear();

    $scope.onBtnGoToFeedback = function() {
        $location.path('feedback');
    };

    $scope.onBtnGoToHome = function() {
        if ($mpCustomer.getItem("biz_id")!=null){
            $location.path('/restaurant/'+$mpCustomer.getItem("biz_id")+ '/menu');
        }else {
            $location.path('/');
        }
    };
    jQuery(document).ready(function(){
        OnViewLoad();

    })
}]);