/**
 * Created by Ken on 2014-10-23.
 */

app.controller("orderController", ['$rootScope','$scope','$routeParams','$mp_ajax','$location','$mp_json','$cookieStore','$q','$timeout',
    function($rootScope,$scope,$routeParams,$mp_ajax,$location,$mp_json,$cookieStore,$q,$timeout) {
        var $page = $scope;
        var L = $rootScope.L

        //page
        $scope.searchOrderStatus = '-1';
        $scope.searchPageNo = 1;
        $scope.searchPageSize = 50;
        $scope.pageCount = 0;

        $scope.hasPreviousPage = false;
        $scope.hasNextPage = false;

        $scope.ORDER_STATUS = {
            PENDING:100,
            CANCELED:101,
            CONFIRMED:102,
            PROGRESS:103,
            COMPLETED:104,
            EXPIRED:109,
            DINING:110,
            PADY:111,
            DESC : {
                100:L.order_status_100,
                101:L.order_status_101,
                102:L.order_status_102,
                103:L.order_status_103,
                104:L.order_status_104,
                109:L.order_status_109,
                110:L.order_status_110,
                111:L.order_status_111
            }
        };

        $scope.ORDER_ITEM_STATUS = {
            PENDING:201,
            KITCHEN:202,
            CANCELED:203,
            SERVED:204,
            DESC : {
                201:L.order_item_status_201,
                202:L.order_item_status_202,
                203:L.order_item_status_203,
                204:L.order_item_status_204
            }
        };

        $scope.ORDER_TYPE = {
            DINE_IN:1,
            TOGO:2,
            DESC : {
                1:L.order_type_1,
                2:L.order_type_2
            }
        };

        $scope.TABLE_STATUS = {
            OPEN: 300,
            RESERVED: 301,
            SEATED: 302,
            CLEAN_UP: 303,
            DESC : {
                300:L.table_status_300,
                301:L.table_status_301,
                302:L.table_status_302,
                303:L.table_status_303
            }
        };

        $scope.TABLE_TYPE = {
//        DISPERSED: 400,
            SEPARATE: 401,
            BOOTH: 402,
            ROUND: 403,
            SQUARE: 404,
            RECTANGULAR: 405,
            DESC : {
//            400: L.table_type_400,
                401:L.table_type_401,
                402:L.table_type_402,
                403:L.table_type_403,
                404:L.table_type_404,
                405:L.table_type_405
            }
        };

        $scope.PRINTER_LANG = {
            1: ['prodName','prodNameLang'],
            2: ['prodNameLang','prodName'],
            3: ['prodName'],
            4: ['prodNameLang']
        };

//    $scope.table_type_values = [];
//    for(var key in $scope.TABLE_TYPE) {
//        if(_.isNumber($scope.TABLE_TYPE[key])) {
//            $scope.table_type_values.push($scope.TABLE_TYPE[key]);
//        }
//    }
//    _.sortBy($scope.table_type_values);

        $scope.order_tabs = {
            id:'order_tab',
            tabs: [
                {
                    name: L.order_tab_3,
                    icon: 'icon-food',
                    active: true
                },
                {
                    name: L.order_tab_1,
                    icon: 'icon-th'

                }
                ,{
                    name: L.order_tab_2,
                    icon: 'icon-tag'
                }
                ,{
                    name: L.order_tab_4,
                    icon: 'icon-inbox'
                }
                ,{
                    name: 'payment',
                    icon: 'icon-usd'
                }
            ],
            last_tab_index: 0,
            cur_tab_index: 0,
            on_switch: function(to,from) {
                this.last_tab_index = from;
            }
        };


        //for order details page
        $scope.cur_orders = [];
        $scope.past_orders = [];
        $scope.tables = [];
        $scope.cur_table = {};

        if($rootScope.bizInfo.order_status==0) {
            $location.path('/');
        }

        $scope.$on('order.switch_to_tab',function(event,msg){
            $scope.order_tabs.change_tab(msg.index);
        });

        //查询活跃订单
        $scope.LoadCurOrdersPromise = function() {
            // return $mp_ajax.promiseGet('/biz/'+$rootScope.bizId+'/order?status='+[$page.ORDER_STATUS.PENDING,$page.ORDER_STATUS.CONFIRMED,$page.ORDER_STATUS.PROGRESS].join(','));
            return $mp_ajax.promiseGet('/biz/'+$rootScope.bizId+'/order?status=110');
        };

        // 查询历史账单
        $scope.LoadPastOrdersPromise = function () {
            var search ={};
            $scope.searchPageSize = parseInt($('#searchPageSize').val());
            var searchOrderStatus=parseInt($('#searchOrderStatus').val());
            if(searchOrderStatus>0) {
                search.status=searchOrderStatus;
            }else{
                search.status=[$page.ORDER_STATUS.PADY,$page.ORDER_STATUS.CANCELED].join(',');
            }
            if($scope.searchPageNo>0) {
                search.start=($scope.searchPageNo-1)*$scope.searchPageSize;
            }
            if($scope.searchPageSize>0) {
                search.size=($scope.searchPageSize+1);
            }
            if($('#searchCreateDate').val()) {
                search.startDate=$('#searchCreateDate').data().daterangepicker.startDate.format('YYYY-MM-DD');
                var date = $('#searchCreateDate').data().daterangepicker.endDate.add(1, 'days');
                search.endDate=date.format('YYYY-MM-DD');
            }
            var searchParams=objToStr(search);
            return $mp_ajax.promiseGet('/biz/'+$rootScope.bizId+'/orderHistory'+searchParams);
        };

        $scope.LoadTablesPromise = function () {
            return $mp_ajax.promiseGet('/biz/'+$rootScope.bizId+'/table');
        };

        $scope.LoadPaymentStatPromise = function() {
            return $mp_ajax.promiseGet('/biz/'+$rootScope.bizId+'/paymentStat');
        }

        $q.all([ $scope.LoadCurOrdersPromise(),$scope.LoadPastOrdersPromise(),$scope.LoadTablesPromise() ,$scope.LoadPaymentStatPromise() ]).then(function(dataArr){
            var cur_orders = dataArr[0];
            var past_orders = dataArr[1];
            var tables = dataArr[2];
            var paymentStat = dataArr[3];
            var creditCardSettle = {amount :0,update_on : new Date()};
            var paypalSettle = { amount :0,update_on : new Date()};
            var paypalRefund = {amount :0,update_on : new Date()};
            var creditCardRefund = {amount :0,update_on : new Date()};
            for(var i = 0; i<paymentStat.length; i++){
                var ps = paymentStat[i];
                if(ps.payment_type == 0){
                    if(ps.status==4){
                        paypalRefund.amount =  ps.amount;
                        paypalRefund.update_on =  ps.update_on || new Date();
                    }else{
                        paypalSettle.amount = paypalSettle.amount + ps.amount;
                        paypalSettle.update_on =  ps.update_on || new Date();
                    }

                }else{
                    if(ps.status==4){
                        creditCardRefund.amount =  ps.amount;
                        creditCardRefund.update_on =  ps.update_on|| new Date();
                    }else{
                        creditCardSettle.amount = creditCardSettle.amount + ps.amount;
                        creditCardSettle.update_on =  ps.update_on;
                    }
                }
            }
            $scope.pending_count=0;
            var pending_count = 0;
            $scope.cur_orders = _.isArray(cur_orders) ? cur_orders : [];
            $scope.past_orders = _.isArray(past_orders) ? past_orders : [];
            $scope.totalMoney = 0;
            $scope.totalMoneyDiscount = 0;
            $scope.totalMoneyCheckout = 0;

            for(var i=0;i<$scope.past_orders.length;i++){
                $scope.totalMoney+=$scope.past_orders[i].total_price;
                $scope.totalMoneyDiscount+=$scope.past_orders[i].orderMoneyDiscount;
                $scope.totalMoneyCheckout+=$scope.past_orders[i].orderMoney

            }
            $scope.tables = _.isArray(tables) ? tables : [];
            $scope.paymentStat = {
                paypalSettle : paypalSettle ,
                creditCardSettle : creditCardSettle,
                paypalRefund : paypalRefund ,
                creditCardRefund : creditCardRefund
            };
            _.forEach($scope.cur_orders,function(_o){
                if(_o.status==$scope.ORDER_STATUS.PENDING)
                    pending_count++;
                _.forEach($scope.tables,function(_t){
                    if(_o.table_id==_t.id) {
                        _t.order = _o;
                        return false;
                    }
                });
            });
            $scope.pending_count = pending_count;

            //page
            $scope.hasNextPage = $scope.past_orders.length>$scope.searchPageSize;
            $scope.hasPreviousPage = $scope.searchPageNo>1;

            if($scope.past_orders.length>$scope.searchPageSize) {
                $scope.past_orders.pop();
            }
        });


        $scope.GetTableById = function(table_id) {
            var table = null;
            _.forEach($scope.tables,function(t){
                if(table_id==t.id) {
                    table = t;
                    return false;
                }
            });
            return table;
        };
        $scope.testaudio = function(){
            // var audio = $('#js-audio-warning').get(0);
            var audio = $('#call_out').get(0);
            // audio.load();
            audio.play();
        }
        var audioTimer="";//音乐定时器
        function PlayWarningSound(loop) {
            var audio = $('#js-audio-warning').get(0);
            //if (gBrowser.core.chrome) {
                audio.load();
            //}
            audio.play();
            /*audio.onplay =function () {
                audioTimer=window.setTimeout(function () {
                    audio.pause();
                    if($scope.sound_alert_switch==false || audio.paused){
                        clearInterval(audioTimer);
                    }
                },3500);
            };*/
            if (loop) {
                audio.addEventListener('ended', function() {
                    this.currentTime = 0;
                    this.play();
                }, false);
            }

        }

        function StopWarningSound() {
            var audio = $('#js-audio-warning').get(0);
            audio.pause();
            /*clearInterval(audioTimer);*/
        }


        $scope.$on('order.cur_orders.reloaded',function(event,msg){
            $scope.cur_orders = msg.orders;
            var pending_count = 0;
            _.forEach($scope.cur_orders,function(_o){
                if(_o.status==$scope.ORDER_STATUS.DINING)
                    pending_count++;
            });
            $scope.pending_count = pending_count;
            if($scope.pending_count>0 && $scope.sound_alert_switch) {
                //play_sound('media/warning.wav');
                PlayWarningSound(false);
            }else{
               // StopWarningSound();
            }
        });

        //for check pending order loop
        function check_pending_order_loop() {
            $scope.LoadCurOrdersPromise().then(function(data){
                if(_.isArray(data)) {
                    $rootScope.$broadcast('order.cur_orders.reloaded',{orders:data});
                }
            }).then(function(data){
                $scope.LoadTablesPromise().then(function(data){
                    $scope.tables = data?data:[]
                })
            })
//        $timeout(check_pending_order_loop,10*1000);
        }
        //put the loop time to configuration file, currently is 30 seconds
        //$rootScope.looper_array.push(setInterval(check_pending_order_loop,30*1000));

        $scope.$watch('pending_count',function(to,from){
            $scope.pending_alert_message = L.pending_alert_message.replace('{{1}}',to);
            if($scope.pending_count==1 && $scope.pending_alert_message[$scope.pending_alert_message.length-1]=='s')
                $scope.pending_alert_message = $scope.pending_alert_message.substring(0,$scope.pending_alert_message.length-1);
        });

        $scope.menu_lang_switch = $.cookie('menu_lang_switch')=='true' ? true : false;
        $scope.menu_lang_en_us = !$scope.menu_lang_switch;
        $scope.onClickMenuLangSwitch = function() {
            $scope.menu_lang_en_us = $scope.menu_lang_switch;
            $.cookie('menu_lang_switch',!$scope.menu_lang_switch);
        };

        //move it to biz properties
        $scope.sound_alert_switch = true;
        $scope.$watch('sound_alert_switch',function(to,from){
            if(!from && to){
                PlayWarningSound(false);
            }else {
                StopWarningSound();
            }

        });

        // Let us open a web socket

            var ws = new WebSocket(sys_config.biz_websocket_url +"/"+ $rootScope.bizId+"/user/"+$rootScope.userId);
            console.log(sys_config.biz_websocket_url +"/"+ $rootScope.bizId+"/user/"+$rootScope.userId);
            console.log(ws);
            ws.onmessage = function (evt)
            {
                var received_msg = JSON.parse(evt.data);
                if (received_msg.status==1){//新订单提醒
                    check_pending_order_loop();
                    $mp_ajax.get('/biz/'+$rootScope.bizId+'/getOrderMaxUpdateOn',function(data) {
                        if(data && data.length>0){
                            $scope.pending_alert_message_seq ='   单号:' + data[0].seq
                        }
                    });

                }else if (received_msg.status==99){//呼叫服务员
                    var audio = $('#call_out').get(0);
                    audio.src = received_msg.audioStream;
                    audio.play();
                }
            };

            ws.onclose = function()
            {
                $scope.pending_alert_message= L.lost_ws_connection_to_server;
            };

            ws.onerror = function(e)
            {
                $scope.pending_alert_message= L.lost_ws_connection_to_server;
            };

        $scope.refreshPastOrders=function () {
            $q.all([$scope.LoadPastOrdersPromise()]).then(function(dataArr){
                $scope.past_orders = dataArr[0];
                $scope.hasNextPage = $scope.past_orders.length>$scope.searchPageSize;
                $scope.hasPreviousPage = $scope.searchPageNo>1;

                if($scope.past_orders.length>$scope.searchPageSize) {
                    $scope.past_orders.pop();
                }
            })
        };

        $scope.clearPastOrders=function () {
            $('#searchCreateDate').val('');
            $('#searchOrderStatus').val('-1');
            $scope.refreshPastOrders();
        };

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
                $scope.refreshPastOrders();
        };




        $scope.$watch('searchPageSize',function(to,from){
            if(_.isString(to))
                $scope.refreshPastOrders();
        });


        OnViewLoad();
        if(L.lang=='中文'){
            $('#searchCreateDate').daterangepicker({
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
        }else{
            $('#searchCreateDate').daterangepicker({
            }).prev().on(ace.click_event, function(){
                $(this).next().focus();
            });
        }

    }]);

app.controller("order_tables_controller", ['$rootScope','$scope','$routeParams','$mp_ajax','$location','$mp_json','$cookieStore','$q',function($rootScope,$scope,$routeParams,$mp_ajax,$location,$mp_json,$cookieStore,$q) {
    var $parent = $scope.$parent;
    var $page = $parent;
    var L = $rootScope.L;

    $scope.head_count = 1;
    $scope.cur_table = null;
    var new_dialog = $('#order_view #new_order_form');
    var new_togo_dialog = $('#order_view #new_togo_order_form');
    var reopen_dialog = $('#order_view #reopen_table_form');

    $scope.onClickTable = function(table) {
        if(table.order && table.status!=$page.TABLE_STATUS.OPEN) {
            $rootScope.$broadcast('order.detail.show',{order: table.order,table: table});
        }
        else if(!table.order && table.status!=$page.TABLE_STATUS.OPEN) {
            _ShowBox(reopen_dialog,table);
        }
        else {
            _ShowBox(new_dialog,table);
        }
    };

    $scope.onBtnShowNewToGoOrderDialog = function() {
        //get delivery date
        var cur_date = new Date();
        var hourEx = DateUtil.trans24to12(cur_date.getHours());
        var minute = cur_date.getMinutes();

        cur_date.setHours(hourEx.hour);

        if(minute>=45) {
            cur_date.setMinutes(60); //will plus one hour
        }
        else if(minute>=30) {
            cur_date.setMinutes(45);
        }
        else if(minute>=15) {
            cur_date.setMinutes(30);
        }
        else {
            cur_date.setMinutes(15);
        }
        $scope.new_togo_order = {
            order_date: DateUtil.format(cur_date,'MM/dd/yyyy'),
            hour: cur_date.getHours(),
            minute: cur_date.getMinutes(),
            hour_extend: hourEx.hour_extend
        };
        _ShowBox(new_togo_dialog);
    };

    $scope.onNewOrder = function() {
        var table = $scope.cur_table;
        if($scope.head_count>0) {
            var cur_date_str = DateUtil.format(DateUtil.localDateTime2UTCDateTime(new Date()),'yyyy-MM-dd HH:mm:ss');
            var order_params = {
                type: $page.ORDER_TYPE.DINE_IN,
                order_date: cur_date_str,
                head_count: $scope.head_count
            };
            $rootScope.$broadcast('order.cur_orders.new_order',{table_id:table.id, order_params:order_params, callback:function(order){
                table.order = order;
                $rootScope.$broadcast('order.tables.update_status',{table: table, status:$page.TABLE_STATUS.RESERVED, callback:function(data){
                    $rootScope.$broadcast('order.detail.show',{order: table.order,table: table});
                }});
                _HideBox(new_dialog);
            }});
        }
        else {
            ErrorBox('Please enter correct number');
        }
    };

    $scope.onNewToGoOrder = function() {
        var order = $scope.new_togo_order;
        if(_.isEmpty(order.cust_phone)
            || _.isEmpty(order.cust_address)
            || _.isEmpty(order.cust_name)
//            || _.isEmpty(order.remark)
            ) {
            ErrorBox('Please enter name, phone and address');
        }
        else {
            var order_date = DateUtil.parseDate(order.order_date,'MM/dd/yyyy');
            var hour = DateUtil.trans12to24(order.hour,order.hour_extend);
            order_date.setHours(hour);
            order_date.setMinutes(order.minute);
            order_date.setSeconds(0);
            var date_str = DateUtil.format(DateUtil.localDateTime2UTCDateTime(order_date),'yyyy-MM-dd HH:mm:ss');
            var order_params = {
                type: $page.ORDER_TYPE.TOGO,
                order_date: date_str,
                username: order.cust_name,
                address: order.cust_address,
                phone: order.cust_phone,
                remark: order.remark
            };
            $rootScope.$broadcast('order.cur_orders.new_order',{order_params:order_params, callback:function(order){
                _HideBox(new_togo_dialog);
                $rootScope.$broadcast('order.detail.show',{order: order});
            }});
        }
    };

    //#502
    $scope.onReopenTable = function() {
        g_loading.show();
        _UpdateTableStatusPromise($scope.cur_table,$page.TABLE_STATUS.OPEN).then(function(data){
            _HideBox(reopen_dialog);
        }).catch(function(error){
            console.error(error);
            ErrorBox('Reopen table error, msg=',error);
        }).finally(function(){
            g_loading.hide();
        });
    };

    $scope.onCancel = function() {
        _HideBox(new_dialog);
        _HideBox(new_togo_dialog);
        _HideBox(reopen_dialog);
    };

    function _ShowBox(dialog,table) {
        dialog.show();
        var rect = GetCenterPosition(dialog);
        dialog.css('left',rect.left+'px');
        g_mask.show();
        $scope.cur_table = table ? table : null;
        $scope.is_togo_order = table ? false : true;
    }

    function _HideBox(dialog) {
        dialog.hide();
        g_mask.hide();
        $scope.cur_table = null;
    }
    var _UpdateTableStatusPromise = function (table,status) {
        return $mp_ajax.promisePut('/biz/'+$rootScope.bizId+'/table/'+table.id+'/status/'+status).then(function(data){
            table.status = status;
            if($page.TABLE_STATUS.OPEN==status) {
                table.order = null;
            }
        });
    };

    $scope.$on('order.tables.update_status',function(event,msg){
        var table = msg.table ? msg.table : $page.GetTableById(msg.table_id);
        var status = msg.status;
        var callback = msg.callback;
        _UpdateTableStatusPromise(table,status).then(function(){
            if(_.isFunction(callback))
                callback();
        });
    });

    $scope.$on('order.tables.cancel_order',function(event,msg){
        var order = msg.order;
        var table = $page.GetTableById(order.table_id);
        if(table) {
            var new_status = $page.TABLE_STATUS.OPEN;
            switch (table.status) {
                case $page.TABLE_STATUS.RESERVED:
                    new_status = $page.TABLE_STATUS.OPEN;
                    break;
                case $page.TABLE_STATUS.SEATED:
                    new_status = $page.TABLE_STATUS.CLEAN_UP;
                    break;
            }
            _UpdateTableStatusPromise(table,new_status);
        }
    });

    $scope.$on('order.tables.switch_table',function(event,msg){
        var cur_table = msg.cur_table;
        var target_table = msg.target_table;
        var callback = msg.callback;
        var callback_data = {};

        if(cur_table.status==$parent.TABLE_STATUS.CLEAN_UP) {
            callback_data.msg = "Can NOT move cleaning table";
            callback_data.success = false;
            if(_.isFunction(callback)) {
                callback(callback_data);
            }
        }
        else if(target_table.status==$parent.TABLE_STATUS.OPEN) {
            var target_table_status = cur_table.status;

            //Rule : (reserved->open, seated->clean up)
            var cur_table_status = cur_table.status==$page.TABLE_STATUS.SEATED ? $page.TABLE_STATUS.CLEAN_UP : $page.TABLE_STATUS.OPEN;

            var order = cur_table.order; //Ken 2015-02-04 : order would be cleaned by _UpdateTableStatusPromise
            $q.all([_UpdateTableStatusPromise(cur_table,cur_table_status), _UpdateTableStatusPromise(target_table,target_table_status)]).then(function(data){
                target_table.order = order;
//                cur_table.order = null;
                callback_data.success = true;
                if(_.isFunction(callback)) {
                    callback(callback_data);
                }
            });
        }
        else {
            callback_data.msg = 'This table has been used';
            callback_data.success = false;
            if(_.isFunction(callback)) {
                callback(callback_data);
            }
        }
    });

    $scope.$on('order.tables.assign_table_to_order',function(event,msg){
        var order = msg.order;
        var table = msg.table;
        var callback = msg.callback;
        var callback_data = {};

        if(table.status==$parent.TABLE_STATUS.OPEN) {
            _UpdateTableStatusPromise(table,$parent.TABLE_STATUS.RESERVED).then(function(data){
                table.order = order;
                callback_data.success = true;
                if(_.isFunction(callback)) {
                    callback(callback_data);
                }
            });
        }
        else {
            callback_data.msg = 'This table has been used';
            callback_data.success = false;
            if(_.isFunction(callback)) {
                callback(callback_data);
            }
        }

    });

}]);

app.controller("order_detail_controller", ['$rootScope','$scope','$routeParams','$mp_ajax','$location','$mp_json','$cookieStore','$q',function($rootScope,$scope,$routeParams,$mp_ajax,$location,$mp_json,$cookieStore,$q) {
    var $parent = $scope.$parent;
    var $page = $scope.$parent;
    var L = $rootScope.L;

    $scope.NONE_SELECTED = 0;
    $scope.PARTIAL_SELECTED = 1;
    $scope.ALL_SELECTED = 2;
    $scope.ADD_PAGE = 0;
    $scope.MODIFY_PAGE = 1;
    $scope.BOOKTABLE_PAGE = 2;

    $scope.cur_order = null;
    $scope.sub_tab = $scope.ADD_PAGE;

    $scope.$on('order.detail.update_status',function (event,msg){
        var status = msg.status;
        var callback = msg.callback;
        var errorFn = msg.errorFn;
        g_loading.show();
        //for send mail
        var extra_param = $scope.cur_order.cust_id ? '?custId='+$scope.cur_order.cust_id : '';
        $mp_ajax.promisePut('/biz/'+$rootScope.bizId+'/order/'+$scope.cur_order.id+'/status/'+status+extra_param,{}).then(function(data){
            if(_.isObject(data)) {
                $scope.cur_order.status = status;
                if(_.isFunction(callback)) {
                    callback(data);
                }
                $parent.pending_alert_message = L.pending_alert_message.replace('{{1}}',$parent.pending_count--);
            }
            else {
                ErrorBox('Operation failed, please reload page to get new data.');
                if(_.isFunction(errorFn)) {
                    errorFn(data);
                }
            }
            g_loading.hide();
        },function(error){
            ErrorBox(L.msg_operate_fail);
            g_loading.hide();
            console.error(error);
        });
    });

    $scope.$on('order.detail.set_table',function(event,msg){
        var table = msg.table;
        $mp_ajax.promisePut('/biz/'+$rootScope.bizId+'/order/'+$scope.cur_order.id+'/table/'+table.id).then(function(data){
            $scope.cur_order.table_id = table.id;
            $scope.cur_order.table_name = table.name;
        });
    });

    $scope.$on('order.detail.update_selected_items',function(event,msg){
        var callback = msg.callback;
        var menu_item = msg.menu_item;
        _UpdateSelectedMenuItemsPromise(menu_item).then(function(){
            if(_.isFunction(callback))
                callback();
        });
    });

    $scope.$on('order.detail.calc_order_price',function(event,msg){
        var callback = msg.callback;
        var params = {
            orderStart: DateUtil.format(new Date(),'yyyy-MM-dd')
        };
        params.itemArray = [];
        _.forEach($scope.cur_order.menu_items,function(_o){
            params.itemArray.push({
                prodId: _o.prod_id,
                quantity:_o.quantity
            });
        });
        $mp_ajax.promisePut('/biz/' + $rootScope.bizId + '/order/'+$scope.cur_order.id+'/orderPrice', params).then(function (data) {
            if (_.isObject(data) && data.success) {
                var info = data.orderInfo;
                var co = $scope.cur_order;
                co.actual_price = info.actualPrice;
                co.total_price = info.totalPrice;
                co.origin_price = info.originPrice;
                co.unit_price = info.unitPrice;
                co.tax_rate = info.tax_rate;
                co.total_discount = info.totalDiscount;
                co.total_tax = info.totalTax;
                if(_.isFunction(callback)) {
                    callback();
                }
            }
        }, function (error) {
            console.log('error', error);
        });
    });

    //update status/remark  (menu_item = {status,remark})
    var _UpdateSelectedMenuItemsPromise = function (menu_item) {
        var deferred = $q.defer();
        var promiseArr = [];
        var selectedArr = [];

        //append promises
        _.forEach($scope.cur_order.menu_items,function(item){
            if(item.selected) {
                selectedArr.push(item);
                var status = menu_item.status ? menu_item.status : item.status;
                var params = {};
                params.remark = menu_item.remark ? menu_item.remark : item.remark;
                promiseArr.push($mp_ajax.put('/biz/'+$rootScope.bizId+'/order/'+$scope.cur_order.id+'/item/'+item.id+'/status/'+status,params));
            }
        });
        if(promiseArr.length>0) {
            g_loading.show();
            $q.all(promiseArr).then(function(dataArr){
                g_loading.hide();
//                SuccessBox(L.msg_operate_succeed);
                //update status of selected items
                _.forEach(selectedArr,function(item){
                    if(menu_item.status)
                        item.status = menu_item.status;
                    if(menu_item.remark)
                        item.remark = menu_item.remark;
                });
                deferred.resolve();
            },function(error){
                g_loading.hide();
                ErrorBox(L.msg_operate_fail);
                console.error(error);
                deferred.reject();
            });
        }
        return deferred.promise;
    };

}]);

app.controller("cur_orders_controller", ['$rootScope','$scope','$routeParams','$mp_ajax','$location','$mp_json','$cookieStore','$q',function($rootScope,$scope,$routeParams,$mp_ajax,$location,$mp_json,$cookieStore,$q) {
    var $parent = $scope.$parent;
    var $page = $scope.$parent;
    var L = $rootScope.L;

    function StopWarningSound() {
        var audio = $('#js-audio-warning').get(0);
        audio.pause();
    }

    $scope.onSelectOrder = function(order) {
        StopWarningSound();
        $rootScope.$broadcast('order.detail.show',{order: order});
    };

    $scope.$on('order.cur_orders.new_order',function(event,msg){
        var table_id = msg.table_id;
        var callback = msg.callback;
        var order_params = msg.order_params;

        var head_count = order_params.head_count ? order_params.head_count : 0;
        var type = order_params.type;
        var order_start = order_params.order_date;
        var remark = order_params.remark ? order_params.remark : '';

        var params = {
            bizId: $rootScope.bizId,
            orderType: type,
            remark: remark,
            status: $page.ORDER_STATUS.CONFIRMED,
            orderStart: order_start,
            tableId: table_id,
            username: order_params.username,
            phone: order_params.phone,
            address: order_params.address,
            peopleNum: head_count,
            active: 1
        };
        $mp_ajax.post('/biz/'+$rootScope.bizId+'/order',params,function(data) {
            if(_.isObject(data)) {
                var order = {
                    id: data.orderId,
                    order_type: params.orderType,
                    orderUsername: params.username,
                    phone: params.phone,
                    address: params.address,
                    remark: params.remark,
                    status: params.status,
                    order_start: params.orderStart,
                    table_id: params.tableId,
                    people_num: params.peopleNum,
                    create_on: new Date(),
                    total_price: 0
                };
                $page.cur_orders.unshift(order);
                callback(order);
            }
        });
    });

    $scope.$on('order.cur_orders.reload_list',function(event,msg){
        var callback = msg.callback;
        $page.LoadCurOrdersPromise().then(function(data){
            if(_.isArray(data)) {
                $page.cur_orders = data;
                if(_.isFunction(callback)) {
                    callback();
                }
            }
        });
    });

    //Modify order array
    //Rule: if 'cancel or complete', move to past_orders
    $scope.$on('order.cur_orders.set_as_past',function (event,msg){
        var order = msg.order;
        var index = _.findIndex($page.cur_orders, function(_o) { return _o.id == order.id; });
        if(index>-1) {
            $page.cur_orders.splice(index,1);
            $page.past_orders.unshift(order);
        }
    });

}]);

//历史订单
app.controller("past_orders_controller", ['$rootScope','$scope','$routeParams','$mp_ajax','$location','$mp_json','$cookieStore','$q',function($rootScope,$scope,$routeParams,$mp_ajax,$location,$mp_json,$cookieStore,$q) {
    var $page = $scope.$parent;
    var L = $rootScope.L;

    $scope.onSelectOrder = function(order) {
        $rootScope.$broadcast('order.detail.show',{order: order});
    };

    $scope.$watch('searchPageSize',function(to,from){
        if(_.isString(to))
            $page.refreshPastOrders();
    });


    $scope.$on('order.past_orders.reload_list',function(event,msg){
        $page.refreshPastOrders();

    });
    /*$(document).ready(function () {
        $('.date-range-picker').daterangepicker({
            locale: {
                applyLabel: '确认',
                cancelLabel: '取消',
                fromLabel: '从',
                toLabel: '到',
                weekLabel: '周',
                customRangeLabel: '自定义范围',
                daysOfWeek: ["日", "一", "二", "三", "四", "五", "六"],
                monthNames: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
                firstDay: 0
            }
        }).prev().on(ace.click_event, function () {
            $(this).next().focus();
        });
    })*/

}]);

//订单详情
app.controller("order_detail_left_controller", ['$rootScope','$scope','$routeParams','$mp_ajax','$location','$mp_json','$cookieStore','$q',function($rootScope,$scope,$routeParams,$mp_ajax,$location,$mp_json,$cookieStore,$q) {
    var $parent = $scope.$parent;
    var $page = $scope.$parent.$parent;
    var L = $rootScope.L;

    $scope.order_item_select = $parent.NONE_SELECTED;

    $scope.$on('order.detail.show',function(event,msg){
        $parent.cur_order = msg.order;
        var table = msg.table;
        $rootScope.$broadcast('order.switch_to_tab',{index:2});

        if($parent.cur_order) {
//            $scope.order_type = order.order_type;
//            $scope.order_status = order.status;
            $parent.cur_order.is_can_payment = $parent.cur_order.pay_state;
            $parent.cur_order.is_can_confirm = $parent.cur_order.status==$page.ORDER_STATUS.PENDING;
            $parent.cur_order.is_can_cancel = _.contains([$page.ORDER_STATUS.PENDING,$page.ORDER_STATUS.CONFIRMED],$parent.cur_order.status);
            $parent.cur_order.is_can_booktable = $parent.sub_tab!=$page.BOOKTABLE_PAGE && _.contains([$page.ORDER_STATUS.PENDING,$page.ORDER_STATUS.CONFIRMED,$page.ORDER_STATUS.PROGRESS],$parent.cur_order.status);
            //#461
            $parent.cur_order.is_can_print_invoice = _.contains([$page.ORDER_STATUS.COMPLETED,$page.ORDER_STATUS.PROGRESS],$parent.cur_order.status);
            $parent.cur_order.is_can_complete = $parent.cur_order.status==$page.ORDER_STATUS.CONFIRMED;
            $parent.cur_order.is_pasted = _.contains([$page.ORDER_STATUS.CANCELED,$page.ORDER_STATUS.COMPLETED],$parent.cur_order.status);

            $parent.cur_order.is_can_add_items = true;
            $parent.cur_order.is_can_modify_items = false;
            $parent.cur_order.is_can_delete_items = false;
            $parent.cur_order.is_can_send_items_to_kitchen = false;
            $parent.cur_order.is_can_serve_items = false;

            $parent.cur_order.menu_items = [];
            $parent.cur_order.is_items_loaded = false;

            if($parent.cur_order.table_id>0) {
                var _t = table ? table : $page.GetTableById($parent.cur_order.table_id);
                $parent.cur_order.table_name = _t ? _t.name : '';
            }

            DeselectAllMenuItem();
            getBizCheckOut();

            $mp_ajax.promiseGet('/biz/'+$rootScope.bizId+'/order/'+$parent.cur_order.id).then(function(data){
                if(_.isArray(data)) {
                    $parent.cur_order.menu_items = data;
                    // #334 only progress order need to be checked
                    if($parent.cur_order.status==$page.ORDER_STATUS.PROGRESS) {
                        var b_print_complete = _.every($parent.cur_order.menu_items,function(item){
                            return item.status != $page.ORDER_ITEM_STATUS.PENDING;
                        });
                        $parent.cur_order.is_can_print_invoice = $parent.cur_order.is_can_complete = b_print_complete;
                    }
                }
                $parent.cur_order.is_items_loaded = true;
            });
        }
    });

    $scope.$on('order.detail.update_btn_status',function(event,msg){
        //can Print Invoice? can Complete?
        $parent.cur_order.is_can_print_invoice = _.contains([$page.ORDER_STATUS.COMPLETED,$page.ORDER_STATUS.PROGRESS],$parent.cur_order.status);
        $parent.cur_order.is_can_complete = $parent.cur_order.status==$page.ORDER_STATUS.PROGRESS;

        var b_print_complete = _.every($parent.cur_order.menu_items,function(item){
            return item.status != $page.ORDER_ITEM_STATUS.PENDING;
        });
        $parent.cur_order.is_can_print_invoice = $parent.cur_order.is_can_complete = b_print_complete;
    });


    $scope.onBtnConfirmOrder = function() {
        var params = {
            bizName:$('#headerBizName').text(),
            table:$scope.cur_order && $scope.cur_order.table_name ? $scope.cur_order.table_name : '[Book One]',
            orderType:$('#orderType').val(),
            seq:$scope.cur_order.seq
        }

        $scope.$emit('order.detail.update_status',{status:$page.ORDER_STATUS.CONFIRMED,callback:function(){
                //#295
                $parent.cur_order.is_can_confirm = false;
                $mp_ajax.post('/biz/'+$rootScope.bizId+'/printeOrderAll/' + $scope.cur_order.id,params,function(data){
                    if(data.success){
                        window.setTimeout(function () {
                            $rootScope.$broadcast('order.switch_to_tab',{index:0});
                        },500);
                    }else{
                        /*ErrorBox(L.msg_operate_fail);*/
                        window.setTimeout(function () {
                            $rootScope.$broadcast('order.switch_to_tab',{index:0});
                        },500);
                    }
                },function(error){
                    /*ErrorBox(L.msg_operate_fail);*/
                    window.setTimeout(function () {
                        $rootScope.$broadcast('order.switch_to_tab',{index:0});
                    },500);
                });
            }
        });
    };

    function _DisableAllOperations() {
        $parent.cur_order.is_can_confirm = false;
        $parent.cur_order.is_can_cancel = false;
        $parent.cur_order.is_can_booktable = false;
        $parent.cur_order.is_can_print_invoice = false;
        $parent.cur_order.is_can_complete = false;

        $parent.cur_order.is_can_add_items = false;
        $parent.cur_order.is_can_modify_items = false;
        $parent.cur_order.is_can_delete_items = false;
        $parent.cur_order.is_can_send_items_to_kitchen = false;
        $parent.cur_order.is_can_serve_items = false;

        $parent.cur_order.is_can_payment = false;
    }

    $scope.onBtnCancelOrder = function() {
        $( "#dialog-confirm" ).removeClass('hide').dialog({
            resizable: false,
            modal: true,
            buttons: [
                {
                    html: "<i class='icon-trash bigger-110'></i>&nbsp; "+ L.confirm,
                    "class" : "btn btn-danger btn-xs",
                    click: function() {
                        var confirmDlg = $( this );
                        $scope.$emit('order.detail.update_status',{status:$page.ORDER_STATUS.CANCELED,callback:function(data){
                            _DisableAllOperations();
                            $rootScope.$broadcast('order.tables.cancel_order',{order:$parent.cur_order});
                            $rootScope.$broadcast('order.cur_orders.set_as_past',{order:$parent.cur_order});
                            $rootScope.$broadcast('order.switch_to_tab',{index:0});
                            confirmDlg.dialog( "close" );
                        },errorFn:function(){
                            confirmDlg.dialog( "close" );
                        }});
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

    $scope.onBtnBookTable = function() {
        $parent.sub_tab = $parent.BOOKTABLE_PAGE;
    };

    $scope.onBtnPrintInvoice = function() {
        g_loading.show({timeout:5*60*1000});
        $rootScope.$broadcast('order.detail.calc_order_price',{callback:function(){
            $mp_ajax.get('/biz/'+$rootScope.bizId+"/order/"+$parent.cur_order.id+"/invoice",function(data){
                g_printer.front.printInvoice({
                    invoiceData:data,
                    onSuccess:function(){
                        if($parent.cur_order.status==$page.TABLE_STATUS.SEATED) {
                            $rootScope.$broadcast('order.tables.update_status',{table_id:$parent.cur_order.table_id,status:$page.TABLE_STATUS.CLEAN_UP});
                        }
                        g_loading.hide();
                    },
                    onFailure:function() {
                        g_loading.hide();
                    }
                });
            });
        }});
    };

    $scope.onBtnComplete = function() {
        $scope.$emit('order.detail.update_status',{status:$page.ORDER_STATUS.COMPLETED,callback:function(){
            $rootScope.$broadcast('order.tables.update_status',{table_id:$parent.cur_order.table_id,status:$page.TABLE_STATUS.OPEN});
            $rootScope.$broadcast('order.cur_orders.set_as_past',{order:$parent.cur_order});
            $rootScope.$broadcast('order.switch_to_tab',{index:0});
        }});
    };

    function _SetOperationPrivilege() {
        var selected_count = 0;
        $parent.cur_order.is_can_delete_items = true;
        $parent.cur_order.is_can_modify_items = true;
        $parent.cur_order.is_can_send_items_to_kitchen = true;
        $parent.cur_order.is_can_serve_items = true;

        _.forEach($parent.cur_order.menu_items,function(item){
            if(item.selected) {
                selected_count++;
                switch(item.status) {
                    case $page.ORDER_ITEM_STATUS.KITCHEN:
                        $parent.cur_order.is_can_send_items_to_kitchen = false;
                        $parent.cur_order.is_can_modify_items = false;
                        break;
                    case $page.ORDER_ITEM_STATUS.SERVED:
                        $parent.cur_order.is_can_send_items_to_kitchen = false;
                        $parent.cur_order.is_can_delete_items = false;
                        $parent.cur_order.is_can_modify_items = false;
                        $parent.cur_order.is_can_serve_items = false;
                        break;
                    default:
                        $parent.cur_order.is_can_serve_items = false;
                }
            }
        });
        if(selected_count<1) {
            $parent.cur_order.is_can_delete_items = false;
            $parent.cur_order.is_can_modify_items = false;
            $parent.cur_order.is_can_send_items_to_kitchen = false;
            $parent.cur_order.is_can_serve_items = false;
            $scope.order_item_select = $parent.NONE_SELECTED;
        }
        else if(selected_count<$parent.cur_order.menu_items.length)
            $scope.order_item_select = $parent.PARTIAL_SELECTED;
        else
            $scope.order_item_select = $parent.ALL_SELECTED;
        return selected_count;
    }

    $scope.onChooseMenuItem = function(item) {
        if($parent.cur_order.is_pasted)
            return false;
        item.selected = item.selected ? false : true;
        _SetOperationPrivilege();
    };

    //toggle all menu items select status
    function SelectAllMenuItem() {
        _.forEach($parent.cur_order.menu_items,function(item){
            item.selected = true;
        });
        _SetOperationPrivilege();
    }

    function DeselectAllMenuItem() {
        _.forEach($parent.cur_order.menu_items,function(item){
            item.selected = false;
        });
        _SetOperationPrivilege();
    }

    $scope.onClickMenuItemSelectHeader = function() {
        if($parent.cur_order.is_pasted)
            return false;
        if($scope.order_item_select != $parent.ALL_SELECTED) {
            SelectAllMenuItem();
        }
        else {
            DeselectAllMenuItem();
        }
    };

    $scope.onBtnClickAddMenuItem = function() {
        $parent.sub_tab = $parent.ADD_PAGE;
    };

    $scope.onBtnModifyMenuItem = function() {
        //check all selected items have same remark or not
        //only do this check when click [Modify] button (After desc confirmed, select/deselect items would NOT update it.)
        var hasSelected = false;
        var desc = null;
        _.forEach($parent.cur_order.menu_items,function(item) {
            if (item.selected) {
                hasSelected = true;
                if(desc == null)
                    desc = item.remark;
                //dependency: no remark==null
                if(desc != item.remark) {
                    desc = '';
                    return false;
                }
            }
        });
        if(hasSelected) {
            $rootScope.$broadcast('order.sub_tab_modify_page.set_desc',{desc:desc});
            $parent.sub_tab = $parent.MODIFY_PAGE;
        }
    };

    $scope.onBtnSendToKitchen = function() {
        var b_is_dine_in = $parent.cur_order.order_type==$page.ORDER_TYPE.DINE_IN;
        if(b_is_dine_in && $parent.cur_order.table_id<=0) {
            WarningBox('Please book a table first');
            return false;
        }
        g_loading.show({timeout:5*60*1000});
        $scope.$emit('order.detail.update_selected_items',{menu_item:{status:$page.ORDER_ITEM_STATUS.KITCHEN},callback:function(){
            var table = $page.GetTableById($parent.cur_order.table_id);
            if(!table && b_is_dine_in) {
                ErrorBox('Invalid table');
                console.error('Invalid table');
                $scope.$emit('order.detail.update_selected_items',{menu_item:{status:$page.ORDER_ITEM_STATUS.PENDING}});
                g_loading.hide();
                return false;
            }

            var printObjArray = [];
            _.forEach($parent.cur_order.menu_items,function(item){
                if(item.selected) {
                    var obj = {};
                    obj.prodName = item.prod_name;
                    obj.prodNameLang = item.prod_name_lang;
                    obj.quantity = item.quantity;
                    obj.remark = item.remark;
                    obj.price = item.origin_price;
                    printObjArray.push(obj);
                }
            });

            function PrintMenuItemsForWaiterPromise() {
                var deferred = $q.defer();
                g_printer.front.printForWaiter({
                    waiterData: {
                        bizInfo: $rootScope.bizInfo,
                        orderInfo: $parent.cur_order,
                        itemArray: printObjArray,
                        nameList: $page.PRINTER_LANG[$rootScope.bizInfo.printer_lang] || ['prodName','prodNameLang']
                    },
                    onSuccess:function(){
                        deferred.resolve();
                    },
                    onFailure: function(){
                        deferred.reject();
                    }
                });
                return deferred.promise;
            }
            function PrintMenuItemsForKitchenPromise() {
                var deferred = $q.defer();
                g_printer.kitchen.print({
                    orderInfo: $parent.cur_order,
                    itemArray:printObjArray,
                    nameList: $page.PRINTER_LANG[$rootScope.bizInfo.printer_lang] || ['prodName','prodNameLang'],
                    onSuccess:function(){
                        deferred.resolve();
                    },
                    onFailure: function(error){
                        deferred.reject();
                    }
                });
                return deferred.promise;
            }

            function UpdateOrderStatusPromise() {
                var deferred = $q.defer();
                if(_.contains([$page.ORDER_STATUS.PENDING,$page.ORDER_STATUS.CONFIRMED],$parent.cur_order.status)) {
                    $parent.cur_order.is_can_cancel = false;
                    $scope.$emit('order.detail.update_status',{status:$page.ORDER_STATUS.PROGRESS,callback:function(data){
                        if(_.isObject(data))
                            $parent.cur_order.seq = data.seq;
                        deferred.resolve();
                    }});
                }
                else {
                    deferred.resolve();
                }
                return deferred.promise;
            }

            UpdateOrderStatusPromise()
                .then(PrintMenuItemsForKitchenPromise)
                .then(PrintMenuItemsForWaiterPromise)
                .then(function(){
                    $rootScope.$broadcast('order.detail.update_btn_status',{});
                    DeselectAllMenuItem();
                    if(table && table.status!=$page.TABLE_STATUS.SEATED) {
                        $rootScope.$broadcast('order.tables.update_status',{table:table,status:$page.TABLE_STATUS.SEATED});
                    }
                })
                .catch(function(){
                    $scope.$emit('order.detail.update_selected_items',{menu_item:{status:$page.ORDER_ITEM_STATUS.PENDING}});
                })
                .finally(function(){
                    g_loading.hide();
                });
        }});
    };

    $scope.onBtnDeleteMenuItem = function() {
        var selectedIndexArr = [];
        var params = {
            itemArray : []
        };
        //append promises
        for(var i in $parent.cur_order.menu_items) {
            var item = $parent.cur_order.menu_items[i];
            if(item.selected && item.status!=$page.ORDER_ITEM_STATUS.SERVED) {
                selectedIndexArr.push(i);
                params.itemArray.push(item.id);
            }
        }
        if(selectedIndexArr.length>0) {
            g_loading.show();
            $mp_ajax.delete('/biz/'+$rootScope.bizId+'/order/'+$parent.cur_order.id+'/item',params,function(data){
//                var info = data.orderInfo;
//                $parent.cur_order.actual_price = info.actualPrice;
//                $parent.cur_order.origin_price = info.originPrice;
//                $parent.cur_order.totl_discount = info.totalDiscount;
//                $parent.cur_order.total_price = info.totalPrice;
//                $parent.cur_order.total_tax = info.totalTax;

                //delete selected items from tail
                _.forEachRight(selectedIndexArr,function(index){
                    $parent.cur_order.menu_items.splice(index,1);
                });

                DeselectAllMenuItem();

                $rootScope.$broadcast('order.detail.update_btn_status',{});

                g_loading.hide();
//                SuccessBox(L.msg_operate_succeed);
            },function(error){
                g_loading.hide();
                ErrorBox(L.msg_operate_fail);
                console.error(error);
            });
        }
    };

    $scope.onBtnServeMenuItem = function() {
        $scope.$emit('order.detail.update_selected_items',{menu_item:{status:$page.ORDER_ITEM_STATUS.SERVED},callback:function(){
            $rootScope.$broadcast('order.detail.update_btn_status',{});
            DeselectAllMenuItem();

            $parent.cur_order.is_can_serve_items = false;
        }});
    };


    function getBizCheckOut(){
        $mp_ajax.promiseGet('/biz/'+$rootScope.bizId+'/checkoutInfo').then(function(data){
            if(_.isArray(data))
                $scope.checkoutArr = data;
        });
    }
    $scope.onPaymentOrder = function(){
        $scope.now_order_money = 0;
        $scope.total_now_order_money = 0;
        console.log('$rootScope.orderId',$parent.cur_order.id);
        $mp_ajax.promiseGet('/order/'+$parent.cur_order.id+'/getOrderInfoById').then(function(data){
            if(_.isArray(data))
                // $scope.checkoutArr = data;
            $scope.total_checkout_money = data[0].total_price;
            $scope.total_should_money = data[0].total_price;
        });
        // $scope.total_should_money = $scope.cur_order.total_price;


        $('#add_checkout').show()
    };
    $scope.onEraseOdd = function(){
        $scope.erase_odd_money = 0;
        $('#add_eraseOdd').show()
    };
    $scope.onCheckoutCancel = function() {
        $('#add_checkout').hide()
    };
    $scope.onEraseOddCancel = function() {
        $('#add_eraseOdd').hide()
    };
    $scope.addEraseOddMoney = function(){
        var regu = /^(\-|\+)?\d+(\.\d+)?$/;
        if(!regu.test($scope.erase_odd_money)){
            ErrorBox(L.order_checkout_14);
            return
        }

        if($scope.total_checkout_money - $scope.erase_odd_money<0){
            ErrorBox(L.order_checkout_14);
            return
        }
        if($scope.erase_odd_money<0){
            ErrorBox(L.order_checkout_14);
            return
        }
        $scope.total_should_money = $scope.total_checkout_money - $scope.erase_odd_money;
        $('#add_eraseOdd').hide()
    };


    $scope.addOrderMoney = function(){
        var params = {};

        if($scope.now_order_money == 0){
            ErrorBox(L.order_checkout_11);
            return
        }
        if($scope.now_order_money != $scope.total_should_money){
            ErrorBox(L.order_checkout_10);
            return
        }
        params.order_id = $scope.cur_order.id;
        params.payment_type=$('#checkoutSelect').val();
        params.total_money = $scope.cur_order.total_price;//总金额
        params.payment_money = $scope.now_order_money;//本次结账金额
        params.total_should_money = $scope.total_should_money;//实收
        params.tableId = $scope.cur_order.table_id;//台号

        var erase_odd_money = $scope.erase_odd_money?$scope.erase_odd_money:0;
        if(erase_odd_money>0){
            erase_odd_money = 0 - erase_odd_money
        }

        params.erase_odd_money = erase_odd_money;//折扣
        params.operator = $rootScope.userId;//结账人
        params.table_no = $scope.cur_order && $scope.cur_order.table_name ? $scope.cur_order.table_name : '[Book One]';//台号
        console.log(params);
        $mp_ajax.post('/biz/'+$rootScope.bizId+'/orderMoney',params,function(data){
            if(_.isObject(data)) {
                if(data.success){
                    // $scope.total_now_order_money+=$scope.now_order_money - 0;
                    // $scope.now_order_money = 0;
                    // if($scope.total_order_money_already == $scope.cur_order.total_price){
                        $scope.onCheckoutCancel();
                        $parent.cur_order.status=$scope.ORDER_STATUS.PADY;
                        // $scope.cur_order.status=$scope.ORDER_STATUS.PADY;
                        //
                        // window.setTimeout(function () {
                        //     $rootScope.$broadcast('order.switch_to_tab',{index:0});
                        // },500);


                    _.forEach($scope.tables,function(_t){
                        if($scope.cur_order.table_id==_t.id) {
                            _t.status = $scope.TABLE_STATUS.OPEN;
                        }
                    });


                    // $scope.$emit('order.detail.update_status',{status:$page.ORDER_STATUS.PADY,callback:function(){
                        $rootScope.$broadcast('order.tables.update_status',{table_id:$parent.cur_order.table_id,status:$page.TABLE_STATUS.OPEN});
                        $rootScope.$broadcast('order.cur_orders.set_as_past',{order:$parent.cur_order});
                        $rootScope.$broadcast('order.switch_to_tab',{index:0});
                        $rootScope.$broadcast('order.past_orders.reload_list');

                    // }});


                    // }
                    SuccessBox(L.order_checkout_12)
                }
            }
        },function(error){
            ErrorBox(L.msg_operate_fail);
        });
    }
    $scope.onBtnSendToKitchenPrint = function(){
        var selectedIndexArr = [];
        for(var i in $parent.cur_order.menu_items) {
            var item = $parent.cur_order.menu_items[i];
            if(item.selected) {
                selectedIndexArr.push(item);
            }
        }
        var params = {
            bizName:$('#headerBizName').text(),
            table:$scope.cur_order && $scope.cur_order.table_name ? $scope.cur_order.table_name : '[Book One]',
            orderType:$('#orderType').val(),
            seq:$scope.cur_order.seq,
            orderItem:selectedIndexArr
        };
        if(selectedIndexArr.length==0){
            ErrorBox(L.printe_01);
            return
        }
        $scope.$emit('order.detail.update_selected_items',{menu_item:{status:$page.ORDER_ITEM_STATUS.KITCHEN},callback:function(){
            $rootScope.$broadcast('order.detail.update_btn_status',{});
            DeselectAllMenuItem();
            $parent.cur_order.is_can_serve_items = false;
            $mp_ajax.post('/biz/'+$rootScope.bizId+'/printeOrderSendKitchen',params,function(data){
                if(data.success){}else{
                    ErrorBox(L.msg_operate_fail);
                }
            },function(error){
                ErrorBox(L.msg_operate_fail);
            });
        }});
    };
    $scope.onBtnOrderUrgePrint = function(){
        var selectedIndexArr = [];
        for(var i in $parent.cur_order.menu_items) {
            var item = $parent.cur_order.menu_items[i];
            if(item.selected) {
                selectedIndexArr.push(item);
            }
        }
        var params = {
            bizName:$('#headerBizName').text(),
            table:$scope.cur_order && $scope.cur_order.table_name ? $scope.cur_order.table_name : '[Book One]',
            orderType:$('#orderType').val(),
            seq:$scope.cur_order.seq,
            orderItem:selectedIndexArr
        };

        if(selectedIndexArr.length==0){
            ErrorBox(L.printe_01);
            return
        }
        $mp_ajax.post('/biz/'+$rootScope.bizId+'/printeOrderUrge',params,function(data){
            if(!data.success){
                ErrorBox(L.msg_operate_fail);
            }
        },function(error){
            ErrorBox(L.msg_operate_fail);
        });
    };
    $scope.onBtnPrintOrderAll = function(){
        var params = {
            bizName:$('#headerBizName').text(),
            table:$scope.cur_order && $scope.cur_order.table_name ? $scope.cur_order.table_name : '[Book One]',
            orderType:$('#orderType').val(),
            seq:$scope.cur_order.seq
        }

        $mp_ajax.post('/biz/'+$rootScope.bizId+'/printeOrderAll/' + $scope.cur_order.id,params,function(data){
            if(!data.success){
                ErrorBox(L.msg_operate_fail);
            }
        },function(error){
            ErrorBox(L.msg_operate_fail);
        });
    }
}]);

app.controller("sub_tab_add_page_controller", ['$rootScope','$scope','$routeParams','$mp_ajax','$location','$mp_json','$cookieStore','$q',function($rootScope,$scope,$routeParams,$mp_ajax,$location,$mp_json,$cookieStore,$q)  {
    var $parent = $scope.$parent;
    var $page = $scope.$parent.$parent;

    $scope.menuTypes = [];
    var menuTypesPromise = $mp_ajax.promiseGet('/biz/'+$rootScope.bizId+'/prodType');
    var menuItemsPromise = $mp_ajax.promiseGet('/biz/'+$rootScope.bizId+'/prodBase?active=1');
    $q.all([menuTypesPromise,menuItemsPromise]).then(function(dataArray){
        var menuTypes = dataArray[0];
        var menuItems = dataArray[1];
        //#112
        _.forEach(menuItems,function(item){
            if(!item.type_id) {
                menuTypes.push({name:'Others',name_lang:'其他',type_id:null});
                return false;
            }
            if(!item.active) {
                console.log('inactive',item);
            }
        });

        _.forEach(menuTypes,function(menuType){
            _.forEach(menuItems,function(menuItem){
                if(menuType.type_id==menuItem.type_id) {
                    if(!menuType.menuItems)
                        menuType.menuItems = [];
                    menuType.menuItems.push(menuItem);
                }
            });
        });

        $scope.menuTypes = menuTypes;
        $scope.menuItems = menuItems;
        $scope.cur_menu_type = menuTypes[0];
    });

    $scope.onChangeMenuType = function(new_type) {
        $scope.cur_menu_type = new_type;
        $scope.cur_menu_item = null;
    };

    $scope.onClickMenuItem = function(item) {
        if($parent.cur_order) {
            if($parent.cur_order.is_pasted)
                return false;
            $scope.cur_menu_item = item;
            var menu_item = _.find($parent.cur_order.menu_items,function(obj){
                //#394
                return obj.prod_id==item.prod_id && obj.status==$page.ORDER_ITEM_STATUS.PENDING;
            });
            if(menu_item) {
                _RiseMenuItemCountPromise(menu_item);
            }
            else {
                _AddMenuItemToOrder(item);
            }
        }
        else {
            ErrorBox('No order selected');
            console.log('No order selected');
        }
    };

    function _RiseMenuItemCountPromise(menu_item) {
        var params = {};
        params.itemArray = [];
        params.itemArray.push({
            itemId:menu_item.id,
            prodId:menu_item.prod_id,
            quantity:menu_item.quantity+1
        });
        g_loading.show();
        $mp_ajax.put('/biz/'+$rootScope.bizId+'/order/'+$parent.cur_order.id+'/resetSize',params,function(data){
            menu_item.quantity++;
            //TODO: Ken css breathlight
//            SuccessBox(L.msg_operate_succeed);
            g_loading.hide();
        },function(error){
            ErrorBox(L.msg_operate_fail);
            g_loading.hide();
        });
    }

    function _AddMenuItemToOrder(item) {
        var params = {};
        params.itemArray = [];
        params.itemArray.push({
            prodId:item.prod_id,
            remark:'',
            quantity:1
        });
        g_loading.show();
        $mp_ajax.post('/biz/'+$rootScope.bizId+'/order/'+$parent.cur_order.id+'/addItem',params,function(data){
            var id = data.itemIds && data.itemIds[0] ? data.itemIds[0] : -1;
            if(id==-1) {
                ErrorBox(L.msg_operate_fail);
                console.error('id is -1');
                g_loading.hide();
                return false;
            }
            $parent.cur_order.menu_items.push({
                discount: 0,
                id: id,
                operator: ""+$rootScope.userId,
                order_id: $parent.cur_order.order_id,
                origin_price: item.price,
                unit_price: item.price,
                prod_id: item.prod_id,
                prod_name: item.name,
                prod_name_lang: item.name_lang,
                promo_info: null,
                quantity: 1,
                remark: '',
                status: $page.ORDER_ITEM_STATUS.PENDING,
                status_desc: "The item is pending ,the order not in progress",
                status_info: "Pending",
                total_price: item.price
            });

            $rootScope.$broadcast('order.detail.update_btn_status',{});

            g_loading.hide();
        },function(error){
            ErrorBox(L.msg_operate_fail);
            g_loading.hide();
        });
    }

}]);

app.controller("sub_tab_modify_page_controller", ['$rootScope','$scope','$routeParams','$mp_ajax','$location','$mp_json','$cookieStore','$q',function($rootScope,$scope,$routeParams,$mp_ajax,$location,$mp_json,$cookieStore,$q) {
    var $parent = $scope.$parent;
    var $page = $scope.$parent.$parent;

    //for modify desc of menu_items, [verb & adj / n]
    $scope.menu_item_desc_opt_list = [
        $page.L.menu_item_desc_opt_list_1,
        $page.L.menu_item_desc_opt_list_2,
        $page.L.menu_item_desc_opt_list_3,
        $page.L.menu_item_desc_opt_list_4,
        $page.L.menu_item_desc_opt_list_5,
        $page.L.menu_item_desc_opt_list_6,
        $page.L.menu_item_desc_opt_list_7
    ];

    $scope.menu_item_desc_ingredient_list = [
        $page.L.menu_item_desc_ingredient_list_1,
        $page.L.menu_item_desc_ingredient_list_2,
        $page.L.menu_item_desc_ingredient_list_3,
        $page.L.menu_item_desc_ingredient_list_4,
        $page.L.menu_item_desc_ingredient_list_5,
        $page.L.menu_item_desc_ingredient_list_6,
        $page.L.menu_item_desc_ingredient_list_7,
        $page.L.menu_item_desc_ingredient_list_8,
        $page.L.menu_item_desc_ingredient_list_9,
        $page.L.menu_item_desc_ingredient_list_10
    ];

    //for modify desc of menu_items
    $scope.selected_menu_items_desc = '';

    $scope.$on('order.sub_tab_modify_page.set_desc',function(event,msg){
        $scope.selected_menu_items_desc = msg.desc || '';
    });

    $scope.onConfirmMenuItemDescription = function() {
        $scope.$emit('order.detail.update_selected_items',{
            menu_item:{remark:$scope.selected_menu_items_desc},
            callback:function(){
                $parent.sub_tab = $parent.ADD_PAGE;
            }
        });
    };

    //change selected menu items desc.
    $scope.onClickDescOpt = function(opt) {
        var desc = $scope.selected_menu_items_desc ? $scope.selected_menu_items_desc.trim() : '';
        var index = _.lastIndexOf(desc,';');
        if(index>0) {
            desc = desc.substring(0,index+1);
        }
        else if(index==-1 && desc.length>0) {
            desc += ';';
        }
        if(desc.length>0)
            desc += ' ';
        desc += opt;
        $scope.selected_menu_items_desc = desc;
    };

    $scope.onClickDescIngredient = function(obj) {
        var desc = $scope.selected_menu_items_desc ? $scope.selected_menu_items_desc.trim() : '';
        desc += ' '+obj+';';
        $scope.selected_menu_items_desc = desc;
    };

    $scope.onBackspaceMenuItemDescription = function() {
        // Example : 'Add Peanuts; More Shrimp;' => 'Add Peanuts;'
        var desc = $scope.selected_menu_items_desc ? $scope.selected_menu_items_desc.trim() : '';
        var from = desc.length - 1;
        if(desc[from]==';') {
            from -= 1;
        }
        var index = _.lastIndexOf(desc,';',from);
        desc = desc.substring(0,index+1);
        $scope.selected_menu_items_desc = desc;
    };
}]);

app.controller("sub_tab_booktable_page_controller", ['$rootScope','$scope','$routeParams','$mp_ajax','$location','$mp_json','$cookieStore','$q',function($rootScope,$scope,$routeParams,$mp_ajax,$location,$mp_json,$cookieStore,$q) {
    var $parent = $scope.$parent;
    var $page = $scope.$parent.$parent;

    $parent.onClickTable = function(table) {
        if($parent.cur_order.table_id > 0) {
            var cur_table = $page.GetTableById($parent.cur_order.table_id);
            $rootScope.$broadcast('order.tables.switch_table',{cur_table:cur_table, target_table:table, callback:function(data){
                if(!data.success){
                    ErrorBox(data.msg);
                }
                else {
                    $scope.$emit('order.detail.set_table',{table:table});
                    $parent.sub_tab = $parent.ADD_PAGE;
                }
            }});
        }
        else {
            $rootScope.$broadcast('order.tables.assign_table_to_order',{table:table, order:$parent.cur_order, callback:function(data){
                if(!data.success){
                    ErrorBox(data.msg);
                }
                else {
                    $scope.$emit('order.detail.set_table',{table:table});
                    $parent.sub_tab = $parent.ADD_PAGE;
                }
            }});
        }
    };

}]);

app.controller("payment_status_controller", ['$rootScope','$scope','$routeParams','$mp_ajax','$location','$mp_json','$cookieStore','$q',function($rootScope,$scope,$routeParams,$mp_ajax,$location,$mp_json,$cookieStore,$q) {

}]);

