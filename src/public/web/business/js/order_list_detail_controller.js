/**
 * Created by Ken on 2014-10-23.
 */

app.controller("orderListDetailController", ['$rootScope','$scope','$routeParams','$mp_ajax','$location','$mp_json','$cookieStore','$q','$timeout',
    function($rootScope,$scope,$routeParams,$mp_ajax,$location,$mp_json,$cookieStore,$q,$timeout) {
        var $page = $scope;
        var L = $rootScope.L;
        var detailOrderId=$location.search().orderId;

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
                if(to==1){
                    window.location.href="#/order?type=1";
                }else if(to==2){
                    window.location.href="#/order?type=2";
                }else if(to==3){
                    window.location.href="#/order?type=3";
                }else if(to==4){
                    window.location.href="#/order?type=4";
                }
                this.last_tab_index = from;
            }
        };


        //for order details page
        $scope.cur_orders = [];
        $scope.past_orders = [];
        $scope.tables = [];
        $scope.cur_table = {};
        $scope.cur_order=[];

        if($rootScope.bizInfo.order_status==0) {
            $location.path('/');
        }

        $scope.$on('order.switch_to_tab',function(event,msg){
            $scope.order_tabs.change_tab(msg.index);
        });

        $scope.LoadCurOrdersPromise = function() {
            return $mp_ajax.promiseGet('/biz/'+$rootScope.bizId+'/order?status='+[$scope.ORDER_STATUS.PENDING,$scope.ORDER_STATUS.CONFIRMED,$scope.ORDER_STATUS.PROGRESS].join(',')+"&orderId="+detailOrderId);
        };


        $q.all([ $scope.LoadCurOrdersPromise()]).then(function(dataArr){
            var cur_orders = dataArr[0];
            $scope.pending_count=0;
            var pending_count = 0;
            $scope.cur_orders = _.isArray(cur_orders) ? cur_orders : [];
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
            if( $scope.cur_orders.length>0){
                $scope.cur_order=$scope.cur_orders[0];
                $scope.showDetail($scope.cur_orders[0]);
            }

            $scope.pending_count = pending_count;

            //page
            $scope.hasNextPage = $scope.past_orders.length>$scope.searchPageSize;
            $scope.hasPreviousPage = $scope.searchPageNo>1;

            if($scope.past_orders.length>$scope.searchPageSize) {
                $scope.past_orders.pop();
            }
        });



        $scope.testaudio = function(){
            // var audio = $('#js-audio-warning').get(0);
            var audio = $('#call_out').get(0);
            // audio.load();
            audio.play();
        }
        var audioTimer="";//音乐定时器
        function PlayWarningSound(loop) {
            var audio = $('#js-audio-warning').get(0);
            audio.load();
            audio.play();
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
        }

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

        function check_pending_order_loop() {
            $scope.LoadCurOrdersPromise().then(function(data){
                if(_.isArray(data)) {
                    var pending_count = 0;
                    $scope.cur_orders = _.isArray(data) ? data : [];
                    _.forEach($scope.cur_orders,function(_o){
                        if(_o.status==$scope.ORDER_STATUS.PENDING)
                            pending_count++;
                    });
                    $scope.pending_count = pending_count;
                    if($scope.pending_count>0 && $scope.sound_alert_switch) {
                        PlayWarningSound(false);
                    }else{
                    }
                }
            });
        }


        // Let us open a web socket

            var ws = new WebSocket(sys_config.biz_websocket_url +"/"+ $rootScope.bizId+"/user/"+$rootScope.userId);
            console.log(sys_config.biz_websocket_url +"/"+ $rootScope.bizId+"/user/"+$rootScope.userId);
            console.log(ws);
            ws.onmessage = function (evt)
            {
                var received_msg = JSON.parse(evt.data);
                console.log(received_msg);
                if (received_msg.status==1){//新订单提醒
                    check_pending_order_loop();
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

        //跳转其他tab页面
        $scope.toSelectOrder = function(order) {
            StopWarningSound();
            window.location.href="#/order?type=2&orderId="+order.id;
        };

        //显示详情
        $scope.showDetail=function (order) {
            $scope.cur_order=order;
            $scope.cur_order.is_can_confirm = $scope.cur_order.status==$scope.ORDER_STATUS.PENDING;
            $scope.cur_order.is_can_cancel = _.contains([$scope.ORDER_STATUS.PENDING,$scope.ORDER_STATUS.CONFIRMED],$scope.cur_order.status);
            $scope.cur_order.is_can_booktable = $scope.sub_tab!=$scope.BOOKTABLE_PAGE && _.contains([$scope.ORDER_STATUS.PENDING,$scope.ORDER_STATUS.CONFIRMED,$scope.ORDER_STATUS.PROGRESS],$scope.cur_order.status);
            //#461
            $scope.cur_order.is_can_print_invoice = _.contains([$scope.ORDER_STATUS.COMPLETED,$scope.ORDER_STATUS.PROGRESS],$scope.cur_order.status);
            $scope.cur_order.is_can_complete = $scope.cur_order.status==$scope.ORDER_STATUS.CONFIRMED;
            $scope.cur_order.is_pasted = _.contains([$scope.ORDER_STATUS.CANCELED,$scope.ORDER_STATUS.COMPLETED],$scope.cur_order.status);

            $scope.cur_order.is_can_add_items = true;
            $scope.cur_order.is_can_modify_items = false;
            $scope.cur_order.is_can_delete_items = false;
            $scope.cur_order.is_can_send_items_to_kitchen = false;
            $scope.cur_order.is_can_serve_items = false;

            $scope.cur_order.menu_items = [];

            $mp_ajax.promiseGet('/biz/'+$rootScope.bizId+'/order/'+$scope.cur_order.id).then(function(data){
                if(_.isArray(data)) {
                    $scope.cur_order.menu_items = data;
                    // #334 only progress order need to be checked
                    if($scope.cur_order.status==$scope.ORDER_STATUS.PROGRESS) {
                        var b_print_complete = _.every($scope.cur_order.menu_items,function(item){
                            return item.status != $scope.ORDER_ITEM_STATUS.PENDING;
                        });
                        $scope.cur_order.is_can_print_invoice = $scope.cur_order.is_can_complete = b_print_complete;
                    }
                }
            });
        };

        //删除订单详情中的一条
        $scope.onBtnDeleteMenuItem=function (id,index) {
            var params = {
                itemArray : []
            };
            if(id){
                params.itemArray.push(id);
                $mp_ajax.delete('/biz/'+$rootScope.bizId+'/order/'+$scope.cur_order.id+'/item',params,function(data){
                    $scope.cur_order.menu_items.splice(index,1);
                },function(error){
                    ErrorBox(L.msg_operate_fail);
                    console.error(error);
                });
            }
        };

        var _UpdateTableStatusPromise = function (table,status) {
            if(table){
                return $mp_ajax.promisePut('/biz/'+$rootScope.bizId+'/table/'+table.id+'/status/'+status).then(function(data){
                    table.status = status;
                    if($scope.TABLE_STATUS.OPEN==status) {
                        table.order = null;
                    }
                });
            }
        };


        function _DisableAllOperations() {
            $scope.cur_order.is_can_confirm = false;
            $scope.cur_order.is_can_cancel = false;
            $scope.cur_order.is_can_booktable = false;
            $scope.cur_order.is_can_print_invoice = false;
            $scope.cur_order.is_can_complete = false;

            $scope.cur_order.is_can_add_items = false;
            $scope.cur_order.is_can_modify_items = false;
            $scope.cur_order.is_can_delete_items = false;
            $scope.cur_order.is_can_send_items_to_kitchen = false;
            $scope.cur_order.is_can_serve_items = false;
        }

        $scope.$on('order.tables.update_status',function(event,msg){
            var table = msg.table ? msg.table : $scope.GetTableById(msg.table_id);
            var status = msg.status;
            var callback = msg.callback;
            if(table!=null){
                _UpdateTableStatusPromise(table,status).then(function(){
                    if(_.isFunction(callback))
                        callback();
                });
            }
        });

        $scope.$on('order.tables.cancel_order',function(event,msg){
            var order = msg.order;
            var table = $scope.GetTableById(order.table_id);
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

        $scope.$on('order.cur_orders.set_as_past',function (event,msg){
            var order = msg.order;
            var index = _.findIndex($page.cur_orders, function(_o) { return _o.id == order.id; });
            if(index>-1) {
                $page.cur_orders.splice(index,1);
                $page.past_orders.unshift(order);
            }
        });

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
                    $scope.pending_alert_message = L.pending_alert_message.replace('{{1}}',$scope.pending_count--);
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

        $scope.onBtnComplete = function() {
            $scope.$emit('order.detail.update_status',{status:$page.ORDER_STATUS.COMPLETED,callback:function(){
                $rootScope.$broadcast('order.tables.update_status',{table_id:$scope.cur_order.table_id,status:$page.TABLE_STATUS.OPEN});
                $rootScope.$broadcast('order.cur_orders.set_as_past',{order:$scope.cur_order});
                window.setTimeout(function () {
                    $scope.returnList();
                },100)
            }});
        };

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
                                $rootScope.$broadcast('order.tables.cancel_order',{order:$scope.cur_order});
                                $rootScope.$broadcast('order.cur_orders.set_as_past',{order:$scope.cur_order});
                                confirmDlg.dialog( "close" );
                                window.setTimeout(function () {
                                    $scope.returnList();
                                },100)
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

        $scope.onBtnConfirmOrder = function() {
            var params = {
                bizName:$('#headerBizName').text(),
                table:$scope.cur_order && $scope.cur_order.table_name ? $scope.cur_order.table_name : '[Book One]',
                orderType:$('#orderType').val(),
                seq:$scope.cur_order.seq
            }

            $scope.$emit('order.detail.update_status',{status:$page.ORDER_STATUS.CONFIRMED,callback:function(){
                //#295
                $scope.cur_order.is_can_confirm = false;
                $mp_ajax.post('/biz/'+$rootScope.bizId+'/printeOrder/' + $scope.cur_order.id,params,function(data){
                    if(data.success){
                        window.setTimeout(function () {
                            $scope.returnList();
                        },100)
                    }else{
                        window.setTimeout(function () {
                            $scope.returnList();
                        },100)
                        /*ErrorBox(L.msg_operate_fail);*/
                    }
                },function(error){
                    window.setTimeout(function () {
                        $scope.returnList();
                    },100)
                    /*ErrorBox(L.msg_operate_fail);*/
                });
            }
            });
        };

        $scope.onBtnPrintInvoice = function() {
            g_loading.show({timeout:5*60*1000});
            $rootScope.$broadcast('order.detail.calc_order_price',{callback:function(){
                $mp_ajax.get('/biz/'+$rootScope.bizId+"/order/"+$scope.cur_order.id+"/invoice",function(data){
                    g_printer.front.printInvoice({
                        invoiceData:data,
                        onSuccess:function(){
                            if($scope.cur_order.status==$page.TABLE_STATUS.SEATED) {
                                $rootScope.$broadcast('order.tables.update_status',{table_id:$scope.cur_order.table_id,status:$page.TABLE_STATUS.CLEAN_UP});
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

        $scope.returnList=function () {
            window.location.href="#/order-list";
        }

        OnViewLoad();

    }]);






