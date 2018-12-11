/**
 * Created by Ken on 14-8-5.
 */
app.controller("myOrdersController", ['$rootScope', '$scope', '$routeParams', '$location', '$q', '$timeout','$log',
    '$mpBizInfo','$mpMyTable','$mpCustomer','$mpCustomerOrder','$mpCustomerOrderItems','$mpBaseConst',
function ($rootScope, $scope, $routeParams, $location, $q, $timeout,$log,
    $mpBizInfo,$mpMyTable,$mpCustomer,$mpCustomerOrder,$mpCustomerOrderItems,$mpBaseConst) {

    var L = $rootScope.L;
    $rootScope.setTitle($rootScope.L.my_table);

    $scope.tab = $location.search().tab || 'today';

    $mpCustomer.onBaseDataLoaded(function(){
        $mpCustomerOrder.loadOrders().then(function(data){
            //$scope.$mpCustomerOrder = $mpCustomerOrder;
            $scope.todayOrders = [];
            $scope.pastOrders = [];
            //$scope.futureOrders = [];
            //var today = moment().startOf('day');
            _.forEach($mpCustomerOrder.getData(),function(_o){
                console.log(_o);
                if(_o.payment_type!=null) {
                    _o.paymentTypeText = $rootScope.Const.PAYMENT_TYPE.DESC[_o.payment_type];
                }
                else {
                    _o.paymentTypeText = $rootScope.Const.PAYMENT_TYPE.DESC[$rootScope.Const.PAYMENT_TYPE.PERSON];
                }
                if($rootScope.coords && $rootScope.coords.latitude) {
                    var distance = GetDistance($rootScope.coords.latitude,$rootScope.coords.longitude,_o.latitude,_o.longitude);
                    if(!_.isNaN(distance))
                        _o.distance = distance;
                }
                //var dayOfOrder = moment(_o.order_start).startOf('day');
                var isToday = _.contains([$mpBaseConst.ORDER_STATUS.PENDING,$mpBaseConst.ORDER_STATUS.PROGRESS,$mpBaseConst.ORDER_STATUS.CONFIRMED],_o.status);//dayOfOrder.isSame(today);
                if(isToday) {
                    $scope.todayOrders.push(_o);
                    var bizInfo = $mpBizInfo.newInstance();
                    bizInfo.init(_o.biz_id).then(function(data){
                        _o.bizInfo = data;
                    });
                    bizInfo.getRating();
                }
                //else if(dayOfOrder>today) {
                //    $scope.futureOrders.push(_o);
                //    var bizInfo = $mpBizInfo.newInstance();
                //    bizInfo.init(_o.biz_id).then(function(data){
                //        _o.bizInfo = data;
                //    });
                //    bizInfo.getRating();
                //}
                else {
                    $scope.pastOrders.push(_o);
                }
            });
            console.log($scope.pastOrders);
        });
    });

    $scope.onToggleOrder = function(o) {
        o.open = o.open || false;
        if(!o.open && !o.bizInfo) {
            var bizInfo = $mpBizInfo.newInstance();
            bizInfo.init(o.biz_id).then(function(data){
                o.bizInfo = data;
            });
            bizInfo.getRating();
            $mpCustomerOrderItems.newInstance().init(o.id).then(function(data){
                o.items = data;
            });
        }
        o.open = !o.open;
    };

    jQuery(document).ready(function(){
        OnViewLoad();
    });
    return;
}]);