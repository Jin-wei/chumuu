/**
 * Created by Ken on 14-8-5.
 */
app.controller("checkoutOrderController", ['$rootScope', '$scope', '$routeParams', '$mpAjax', '$location', '$q', '$timeout','$log',
    '$mpBizInfo','$mpLocalStorage','$mpMyTable','$mpCustomer','$mpCustomerOrder',
function ($rootScope, $scope, $routeParams, $mpAjax, $location, $q, $timeout,$log,
          $mpBizInfo,$mpLocalStorage,$mpMyTable,$mpCustomer,$mpCustomerOrder) {

    var L = $rootScope.L;
    $rootScope.setTitle($rootScope.L.my_table);

    $scope.myTable = $mpMyTable;
    if(!$mpMyTable.getData().count || $mpMyTable.getData().count<1) {
        $log.debug('no prods');
        $rootScope.navTo('my-table');
    }
    else {
        $mpCustomer.onBaseDataLoaded(function(){
            if(!$rootScope.isLogin)
                $rootScope.navTo('my-table');
        });
    }

    $scope.order_type = $mpMyTable.getData().orderType || $rootScope.Const.ORDER_TYPE.DINE_IN;
    $scope.day_of_week = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    $scope.order_minute = 0;

    $scope.peopleNum = $mpMyTable.getData().peopleNum || 1;
    $scope.remark = $mpMyTable.getData().remark || '';
    $scope.start_date = ($mpMyTable.getData().orderStart && $mpMyTable.getData().orderStart.indexOf('NaN')===-1) ? DateUtil.format($mpMyTable.getData().orderStart, $rootScope.dateFormat) : DateUtil.format(new Date(), $rootScope.dateFormat);
    $scope.openDineInDayOfWeek = [1,2,3,4];

    $scope.orders = [];
    $scope.sub_total = 0;
    $scope.taxRate = 0;
    $scope.bizOpen = true;
    $scope.payment_type = $rootScope.Const.PAYMENT_TYPE.PERSON;

    if($rootScope.isLogin) {
        if($mpMyTable.getData().orderInfo) {
            $scope.guest_info = {
                name    : $mpMyTable.getData().orderInfo.username,
                email   : $mpCustomer.getItem('email'),
                address : $mpMyTable.getData().orderInfo.address,
                phone   : $mpMyTable.getData().orderInfo.phone
            };
        }
        else {
            $scope.guest_info = {
                //#374
                name    : $mpCustomer.getItem('fullName'),
                email   : $mpCustomer.getItem('email'),
                address : $mpCustomer.getItem('address'),
                phone   : $mpCustomer.getItem('phone_no')
            };
        }
    }

    $mpBizInfo.init($mpMyTable.getData().bizKey,{forceReload:false});
    $mpBizInfo.getTax();

    $mpBizInfo.getValidDayOfWeek().then(function(data){
        $scope.openDayOfWeek = data;
    });

    $scope.$watch('order_type', function () {
        var cur_date = new Date();
        var day = cur_date.getDay();
        var date = cur_date.getDate();
        if ($scope.order_type == 1){
            if (day == 5 || day == 6 || day == 0){
                var dayToSet = 1;
                var distance = (dayToSet + 7 - day) % 7;
                cur_date.setDate(date + distance);
                $scope.start_date = DateUtil.format(cur_date, $rootScope.dateFormat);
            }
            else {
                $scope.start_date = DateUtil.format(new Date(), $rootScope.dateFormat);
            }
        }
        if ($scope.order_type == 2){
            $scope.start_date = DateUtil.format(new Date(), $rootScope.dateFormat);
        }
    });

    $scope.$watch('start_date', function (to, from) {
        if(to && to.length>0) {
            var date = DateUtil.parseDate(to, $rootScope.dateFormat);

            var cur_date = new Date();
            var param_date = DateUtil.format(date,'yyyyMMdd')>DateUtil.format(cur_date,'yyyyMMdd') ? date : cur_date;

            $mpBizInfo.getValidHours(param_date).then(function(data){
                $scope.valid_operate_hours_of_chosen = data;
                $scope.bizOpen = data.length>0;
                $scope.order_hour = data.length>0 ? data[0].value : null;
            },function(error){
                $log.error('error',error);
            });
        }
    });
    //$scope.$watch('order_hour',function(to,from){
    //    //console.log('order_hour',to,from);
    //});

    //be fired after valid hours render.
    var first_set_valid_hours = true;
    $scope.validHoursFinished = function() {
        if(first_set_valid_hours) {
            $scope.order_hour = $mpBizInfo.getData().orderStart ? DateUtil.UTCDateTime2LocalDateTime($mpBizInfo.getData().orderStart).getTime() : $scope.order_hour;
            first_set_valid_hours = false;
        }
    };

    $scope.onConfirm = function (formValid) {
        if (formValid && $rootScope.isLogin) {
            if((_.isString($scope.order_hour) && _.isEmpty($scope.order_hour)) || !parseInt($scope.order_hour)) {
                ErrorBox('Please choose correct order date');
                return false;
            }

            var start_date = new Date(parseInt($scope.order_hour));
            var date = DateUtil.format(DateUtil.localDateTime2UTCDateTime(start_date), 'yyyy-MM-dd HH:mm:ss');

            $mpMyTable.getData().orderInfo = {
                username:$scope.guest_info.name,
                phone:$scope.guest_info.phone,
                address:$scope.guest_info.address,
                orderStart:date,
                orderType:$scope.order_type,
                peopleNum : $scope.peopleNum,
                remark:$scope.remark
            };
            $mpMyTable.save();

            var params = _.cloneDeep($mpMyTable.getData().orderInfo);
            params.bizId = $mpMyTable.getData().bizId;
            params.status = $rootScope.Const.ORDER_STATUS.PENDING;
            params.itemArray = [];

            _.forEach($mpMyTable.getData().prods,function(prod){
                params.itemArray.push({
                    prodId: prod.prodId,
                    quantity: prod.qty,
                    remark: prod.remark || '',
                    status: $rootScope.Const.ORDER_STATUS.PENDING
                });
            });

            g_loading.show();
            $mpCustomerOrder.add(params).then(function(data){
                g_loading.hide();
                $mpMyTable.getData().orderInfo.id = data.orderId;
                $mpMyTable.save();
                $rootScope.navTo('payment');
            }).catch(function(error){
                g_loading.hide();
                $log.error(error);
                ErrorBox('Create Order Failed');
            });
        }
    };

    function placeOrderCalender(){
        $('.checkout-order-date-picker').datepicker({
            autoclose:true,
            minDate: new Date(),
            maxDate: '7',
            dateFormat: $rootScope.datePickerFormat,
            beforeShowDay: function(date){
                var day = date.getDay();
                if ($scope.order_type == 1){
                    return [ bizDineInStatus(day) ];
                }
                if ($scope.order_type == 2) {
                    return [ bizTogoStatus(day) ];
                }
            },
            beforeShow:function(input) {
                $(input).css({
                    "position": "relative",
                    "z-index": 999999
                });
            }
        }).attr( 'readOnly' , 'true' ).next().on(ace.click_event, function(){
            $(this).prev().focus();
        });
    }

    function bizDineInStatus(day) {
        for (var i in $scope.openDineInDayOfWeek){
            if (day == $scope.openDineInDayOfWeek[i])
                return true;
        }
        return false;
    }

    function bizTogoStatus(day) {
        for (var i in $scope.openDayOfWeek){
            if (day == $scope.openDayOfWeek[i])
                return true;
        }
        return false;
    }

    placeOrderCalender();

    jQuery(document).ready(function(){
        OnViewLoad();
    });
}]);