/**
 * Created by Ken on 14-8-5.
 */
app.controller("myPastOrdersController", ['$rootScope', '$scope', '$routeParams', '$mp_ajax', '$location', '$q', '$timeout',
function ($rootScope, $scope, $routeParams, $mp_ajax, $location, $q, $timeout) {

    var L = $rootScope.L;

    $scope.ORDER_STATUS = {
        PENDING:100,
        CANCELED:101,
        CONFIRMED:102,
        PROGRESS:103,
        COMPLETED:104,
        EXPIRED:109,
        DESC : {
            100: L.order_status_100,
            101: L.order_status_101,
            102: L.order_status_102,
            103: L.order_status_103,
            104: L.order_status_104,
            109: L.order_status_109
        }
    };
    $scope.ORDER_TYPE = {
        DINE_IN:1,
        TOGO:2,
        DESC : {
            1: L.dine_in,
            2: L.to_go
        }
    };

    $scope.orders = [];

    function LoadMyOrder() {
        $mp_ajax.promiseGet('/cust/' + $scope.custId + '/order').then(function (data) {
            $scope.orders = [];
            for (var i = 0; i < data.length; ++i) {
                var order = data[i];
                $scope.orders.push({
                    id: order.id,
                    time: order.order_start,
                    biz_name: order.name,
                    menu_item_count: _.random(4, 8),
                    total_price: order.total_price,
                    status: order.status,
                    show_details: false,
                    loading: false
                });
            }
        }, function (error) {
            console.error(error);
        });
    }

    if ($rootScope.isLogin) {
        LoadMyOrder();
    }

    $scope.toggleOrder = function (order, id) {
        if (!order.menu_items) {
            order.loading = true;
            if ($scope.isLogin) {
                $mp_ajax.promiseGet('/cust/' + $scope.custId + '/order/' + order.id).then(function (data) {
                    order.show_details = !order.show_details;
                    order.loading = false;

                    order.menu_items = [];
                    for (var j = 0; j < data.length; ++j) {
                        var prod = data[j];
                        order.menu_items.push({
                            prod_id: prod.prod_id,
                            name: prod.prod_name,
                            price: prod.total_price / prod.quantity,
                            actual_price: prod.actual_price / prod.quantity,
                            discount: prod.discount,
                            desc: prod.remark,
                            qty: prod.quantity
                        });
                    }
                    order.menu_item_count = data.length;
                }, function (error) {
                    console.error(error);
                });
            }
        }
        else {
            order.show_details = !order.show_details;
            $(id).slideToggle("slow");
        }
    };

    $scope.subMenuItemLoaded = function (id) {
        $(id).slideToggle("slow");
    };

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
                        //#293
                        $mp_ajax.put('/cust/'+$rootScope.custId+'/order/'+order.id+'/status/'+$scope.ORDER_STATUS.CANCELED,{},function(data){
                            order.status = $scope.ORDER_STATUS.CANCELED;
                            confirmDlg.dialog( "close" );
                        },function(error){
                            ErrorBox('Operation error');
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

}]);