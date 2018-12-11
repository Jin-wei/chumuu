/**
 * Created by Josh on 2/14/16.
 */

app.controller("orderController", ['$rootScope','$scope','$routeParams','$mp_ajax','$location','$mp_json','$cookieStore','$q','$timeout',
    function($rootScope,$scope,$routeParams,$mp_ajax,$location,$mp_json,$cookieStore,$q,$timeout) {

        var $page = $scope;
        var L = $rootScope.L;

        $scope.order_tabs = {
            id:'order_tab',
            tabs: [
                {
                    name: '订单列表',
                    icon: 'icon-food',
                    active: true
                }
            ],
            last_tab_index: 0,
            cur_tab_index: 0,
            on_switch: function(to,from) {
                this.last_tab_index = from;
            }
        };

        $scope.$on('switch_to_tab',function(event,msg){
            $scope.order_tabs.change_tab(msg.index);
        });

        function PlayWarningSound() {
            var audio = $('#js-audio-warning').get(0);
            if(gBrowser.core.chrome) {
                audio.load();
            }
            audio.play();
        }

        //$scope.$on('order.cur_orders.reloaded',function(event,msg){
        //    $scope.cur_orders = msg.orders;
        //    var pending_count = 0;
        //    _.forEach($scope.cur_orders,function(_o){
        //        if(_o.status==$scope.ORDER_STATUS.PENDING)
        //            pending_count++;
        //    });
        //    $scope.pending_count = pending_count;
        //    if($scope.pending_count>0 && $scope.sound_alert_switch) {
        //        //play_sound('media/warning.wav');
        //        PlayWarningSound();
        //    }
        //});

        //for check pending order loop
//        function check_pending_order_loop() {
//            $scope.LoadCurOrdersPromise().then(function(data){
//                if(_.isArray(data)) {
//                    $rootScope.$broadcast('order.cur_orders.reloaded',{orders:data});
//                }
//            });
////        $timeout(check_pending_order_loop,10*1000);
//        }
//        $rootScope.looper_array.push(setInterval(check_pending_order_loop,60*1000));
//
//        $scope.$watch('pending_count',function(to,from){
//            $scope.pending_alert_message = L.pending_alert_message.replace('{{1}}',to);
//            if($scope.pending_count==1 && $scope.pending_alert_message[$scope.pending_alert_message.length-1]=='s')
//                $scope.pending_alert_message = $scope.pending_alert_message.substring(0,$scope.pending_alert_message.length-1);
//        });

        $scope.sound_alert_switch = false;
        $scope.$watch('sound_alert_switch',function(to,from){
            if(to)
                PlayWarningSound();
        });

        OnViewLoad();
    }]);

app.controller("cur_orders_controller", ['$rootScope','$scope','$routeParams','$mpAjax','$location','$mp_json','$cookieStore','$q',function($rootScope,$scope,$routeParams,$mpAjax,$location,$mp_json,$cookieStore,$q) {
    var $parent = $scope.$parent;
    var $page = $scope.$parent;
    var L = $rootScope.L;
    $scope.orders = [];

    $scope.searchStatus = -1;
    $scope.searchPageNo = 1;
    $scope.searchPageSize = 50;
    $scope.searchGift = 0;
    $scope.searchOrderByCreate = 'createDesc';
    $scope.pageCount = 0;

    $scope.hasPreviousPage = false;
    $scope.hasNextPage = false;

    //$('.date-picker').datepicker({ autoclose:true });

    $('.date-range-picker').daterangepicker({
        locale: {
            applyLabel: '确认',
            cancelLabel: '取消',
            fromLabel: '从',
            toLabel: '到',
            weekLabel: '周',
            customRangeLabel: '自定义范围',
            daysOfWeek: ["日", "一", "二", "三", "四", "五", "六"],
            monthNames: ["一月", "二月", "三月", "四月", "五月", "六月" ,"七月", "八月", "九月", "十月", "十一月", "十二月"],
            firstDay: 0
        }
    }).prev().on(ace.click_event, function(){
        $(this).next().focus();
    });


    function LoadOrdersPromise() {
        var defaultString = '?active=1';
        var search = defaultString;
        $scope.searchPageSize = parseInt($scope.searchPageSize);
        $scope.searchGift = parseInt($scope.searchGift);

        if($scope.searchStatus>0) {
            search += '&status='+$scope.searchStatus;
        }
        if($scope.searchPageNo>0) {
            search += '&start='+($scope.searchPageNo-1)*$scope.searchPageSize;
        }
        if($scope.searchPageSize>0) {
            search += '&size='+($scope.searchPageSize+1);
        }
        if($scope.searchGift>=0) {
            search += '&giftNow='+($scope.searchGift);
        }
        if($('#searchCreateDate').val()) {
            search += '&startDate='+$('#searchCreateDate').data().daterangepicker.startDate.format('YYYY-MM-DD');
            var date = $('#searchCreateDate').data().daterangepicker.endDate.add(1, 'days');
            search += '&endDate='+date.format('YYYY-MM-DD');
        }
        if($('#searchOrderDate').val()) {
            search += '&orderDateStart='+$('#searchOrderDate').data().daterangepicker.startDate.format('YYYY-MM-DD');
            search += '&orderDateEnd='+$('#searchOrderDate').data().daterangepicker.endDate.add(1, 'days').format('YYYY-MM-DD');
        }
        search += '&'+$scope.searchOrderByCreate+'=true';


        if(search.length==defaultString.length) {
            search = '';
        }

        $mpAjax.get('/admin/'+ $rootScope.adminId +'/orders'+search).then(function(data){
            $('#orders th.sortable').removeClass('sorting_asc');
            $('#orders th.sortable').removeClass('sorting_desc');
            $('#orders th.sortable').addClass('sorting');
            $scope.orders = _.isArray(data) ? data : [];
            $scope.hasNextPage = $scope.orders.length>$scope.searchPageSize;
            $scope.hasPreviousPage = $scope.searchPageNo>1;

            if($scope.orders.length>$scope.searchPageSize) {
                $scope.orders.pop();
            }
            _.forEach($scope.orders,function(o){
                o.createOn = DateUtil.format(o.create_on,'yyyy-MM-dd HH:mm');
                o.orderStart = DateUtil.format(DateUtil.UTCDateTime2LocalDateTime(o.order_start),'yyyy-MM-dd HH:mm');
            });

        });
    }

    LoadOrdersPromise();

    $scope.onSelectOrder = function(order) {
        //$rootScope.$broadcast('order.detail.show',{order: order});
    };

    $scope.onBtnSearch = function() {
        LoadOrdersPromise();
    };

    $scope.$watch('searchPageSize',function(to,from){
        if(_.isString(to))
            LoadOrdersPromise();
    });

    $scope.onBtnPageTo = function(key) {
        var isCanLoad = false;
        switch(key) {
            case 'previous':
                if($scope.hasPreviousPage) {
                    $scope.searchPageNo--;
                    isCanLoad = true;
                }
                break;
            case 'next':
                if($scope.hasNextPage) {
                    $scope.searchPageNo++;
                    isCanLoad = true;
                }
                break;
            default:;
        }
        if(isCanLoad)
            LoadOrdersPromise();
    };

    $scope.showDetail = function(item) {
        $rootScope.$broadcast('order.detail.show',{item:item});
    };

}]);

app.controller("order_detail_controller", ['$rootScope','$scope','$routeParams','$mpAjax','$location','$mp_json','$cookieStore','$q',function($rootScope,$scope,$routeParams,$mpAjax,$location,$mp_json,$cookieStore,$q) {
    var $parent = $scope.$parent;
    var $page = $scope.$parent;

    function SwitchTab () {
        if (!_.find($page.order_tabs.tabs, {name: '明细'})) {
            $page.order_tabs.on_loaded = function () {
                $rootScope.$broadcast('switch_to_tab', {index: 1});
            };
            $page.order_tabs.tabs.push({name: '明细', icon: 'icon-inbox'});
        }
        else {
            $rootScope.$broadcast('switch_to_tab', {index: 1});
        }
    }

    $scope.$on('order.detail.show',function(event,msg) {
        SwitchTab();
        $scope.order = msg.item;
        console.log('order',$scope.order);
        if(!$scope.order.orderItems) {
            $mpAjax.get('/biz/'+$scope.order.biz_id+'/order/'+$scope.order.id).then(function(data){
                $scope.order.orderItems = data;
            });
        }

    });
}]);