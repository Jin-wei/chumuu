/**
 * Created by Ken on 2014-10-23.
 */

app.controller("orderListController", ['$rootScope','$scope','$routeParams','$mp_ajax','$location','$mp_json','$cookieStore','$q','$timeout',
    function($rootScope,$scope,$routeParams,$mp_ajax,$location,$mp_json,$cookieStore,$q,$timeout) {
        var $page = $scope;
        var L = $rootScope.L;
        $scope.isMobile = checkPlatform();

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


        //for order details page
        $rootScope.cur_orders = [];
        $scope.past_orders = [];
        $scope.tables = [];
        $scope.cur_table = {};

        if($rootScope.bizInfo.order_status==0) {
            $location.path('/');
        }

        $scope.$on('order.switch_to_tab',function(event,msg){
            $scope.order_tabs.change_tab(msg.index);
        });

        $scope.LoadCurOrdersPromise = function() {
            return $mp_ajax.promiseGet('/biz/'+$rootScope.bizId+'/order?status='+[$scope.ORDER_STATUS.PENDING,$scope.ORDER_STATUS.CONFIRMED,$scope.ORDER_STATUS.PROGRESS].join(','));
        };


        $q.all([ $scope.LoadCurOrdersPromise()]).then(function(dataArr){
            var cur_orders = dataArr[0];
            $scope.pending_count=0;
            var pending_count = 0;
            $rootScope.cur_orders = _.isArray(cur_orders) ? cur_orders : [];
            _.forEach($rootScope.cur_orders,function(_o){
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
                    $rootScope.cur_orders = _.isArray(data) ? data : [];
                    _.forEach($rootScope.cur_orders,function(_o){
                        if(_o.status==$scope.ORDER_STATUS.PENDING)
                            pending_count++;
                    });
                    $scope.pending_count = pending_count;
                    if($scope.pending_count>0 && $scope.sound_alert_switch) {
                        PlayWarningSound(false);
                    }else{
                    }

                    /* $rootScope.$broadcast('order.cur_orders.reloaded',{orders:data});*/
                }
            });
//        $timeout(check_pending_order_loop,10*1000);
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
            window.location.href="#/order-list-detail?orderId="+order.id;
        };


        OnViewLoad();

    }]);






