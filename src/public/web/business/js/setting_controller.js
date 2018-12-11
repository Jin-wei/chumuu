//安全
app.controller("settingController", ['$rootScope','$scope','$mp_ajax','$location','$routeParams',function($rootScope,$scope,$mp_ajax ,$location,$routeParams) {
    var L = $rootScope.L;
    $scope.tabs = {
        id:'setting_tab',
        tabs: [
            {
                name: L.security,
                icon: 'icon-lock'
            },
//            {
//                name: L.setting,
//                icon: 'icon-cog'
//            },
            {
                name: L.table_management,
                icon: 'icon-food',
                active: true
            },
            {
                name: L.printers,
                icon: 'icon-print'
            },
            {
                name: L.call_out,
                icon: 'icon-music'
            },
            {
                name: L.checkout_manage,
                icon: 'icon-tags'
            }
//            {
//                name: 'L.functions',
//                icon: 'icon-tags'
//            }
        ]
    };

    if($rootScope.bizInfo.order_status==0) {
        $scope.tabs.tabs.pop();
//        $scope.tabs.tabs[0].active = true;
    }

    $scope.passInfo = {};
    $scope.edit = {};
    $scope.edit.password = false;


    $scope.onPasswordChange = function () {
        //#183
        var new_pwd_length = $scope.passInfo.new.length;
        if(new_pwd_length<6 || new_pwd_length>15) {
            ErrorBox("New password length should between 6 and 15");
            return false;
        }
        else if(new_pwd_length === $scope.passInfo.current) {
            ErrorBox("New password should be different from old password");
            return false;
        }
        var param = {
            "password": $scope.passInfo.current,
            "newPassword": $scope.passInfo.new
        };
        if($rootScope.bizId){
            param.bizId = $rootScope.bizId;
        }
        if ($scope.passInfo.new == $scope.passInfo.retypeNew){
            $mp_ajax.post('/bizUser/' + $rootScope.userId + '/changePassword', param, function (data){
                $scope.edit.password = false;
                SuccessBox(L.change_password_success_text_1);
            }, function (json){
                if(typeof(json) != 'undefined'){
                    if (L.key == 'zh-cn')
                        ErrorBox(L.msg_operate_fail + ", " + "当前密码输入错误");
                    if (L.key == 'en-us')
                        ErrorBox(L.msg_operate_fail + ", " + json.outMsg);
                }
                else
                    ErrorBox(L.msg_operate_fail + ", " + L.msg_try_again_later + ".");
            });
        }
    };

    OnViewLoad();
  }]);
//餐桌管理
app.controller("setting_tab_table_controller", ['$rootScope','$scope','$mp_ajax','$location','$routeParams',function($rootScope,$scope,$mp_ajax ,$location,$routeParams) {
    var L = $rootScope.L;

    var TABLE_STATUS = $scope.TABLE_STATUS = {
        OPEN: 300,
        RESERVED: 301,
        SEATED: 302,
        CLEAN_UP: 303,
        DESC : {
            300: 'Open',
            301: 'Reserved',
            302: 'Seated',
            303: 'Clean up'
        }
    };

    var TABLE_TYPE = $scope.TABLE_TYPE = {
//        DISPERSED: 400,
        SEPARATE: 401,
        BOOTH: 402,
        ROUND: 403,
        SQUARE: 404,
        RECTANGULAR: 405,
        DESC : {
            'en-us':{
//            400: 'Dispersed',
                401: 'Private Room',
                402: 'Booth',
                403: 'Round',
                404: 'Square',
                405: 'Rectangular'
            },
            'zh-cn':{
//            400: 'Dispersed',
                401: '包间',
                402: '火车椅',
                403: '圆桌',
                404: '方桌',
                405: '长方桌'
            }
        },
        COLOR: {
//            400: 'floralwhite',
            401: 'aliceblue',
            402: 'lightpink',
            403: 'bisque',
            404: 'burlywood',
            405: 'chartreuse'
        }
    };

    //Tab 2 : Table Management;
    $scope.tables = [];
    $scope.is_edit = false;
    $scope.new_table = {
        seats: 1,
        table_type: TABLE_TYPE.BOOTH,
        remark: ''
    };
    $scope.cur_table = {};
    $scope.last_new_table = {};
    $mp_ajax.promiseGet('/biz/'+$rootScope.bizId+'/table').then(function(data){
        if(_.isArray(data))
            $scope.tables = data;
    });

    var dialog = $('#add_update_form');
    function _ShowBox() {
        dialog.css('display','block');
        var rect = GetCenterPosition(dialog);
        dialog.css('left',rect.left+'px');
        g_mask.show();
    }

    function _HideBox() {
        dialog.css('display','none');
        g_mask.hide();
        $scope.cur_table = null;
    }

    $scope.onNewTable = function() {
        $scope.is_edit = false;
        var name = $scope.last_new_table.name;
        //if name='A012', fill new name as 'A013'
        if(name) {
            var ep = /\d+$/g;
            if(ep.test(name)) {
                var str_match_ret = name.match(ep)[0];
                var int_match_ret = parseInt(str_match_ret);
                var new_name = name.substring(0,name.length-str_match_ret.length) + pad(int_match_ret+1,str_match_ret.length);
                $scope.new_table.name = new_name;
            }
        }
        $mp_ajax.promiseGet('/biz/'+$rootScope.bizId+'/availableTableQrCodes').then(function(data){
            if(_.isArray(data))
                $scope.availableQrCodes = data;
        });
        _ShowBox();
    };

    $scope.onEditTable = function(index) {
        $scope.is_edit = true;
        $scope.cur_table = $scope.tables[index];
        $scope.cur_table.index = index;
        //$scope.tableQR=qrcode({width:200,height:200,text:$location.absUrl()});
        angular.copy($scope.cur_table,$scope.new_table);

        console.log("new table:");
        console.dir($scope.new_table);

        _ShowBox();
    };

    $scope.onSubmit = function() {
        var params = {
            name : $scope.new_table.name,
            seats: $scope.new_table.seats,
            remark: $scope.new_table.remark,
            tableType: $scope.new_table.table_type,
            tableQrSeq:$scope.new_table.qr_seq_id.seq_id
        };
        if(params.seats<1) {
            WarningBox('Please enter correct number');
            return false;
        }
        g_loading.show();
        if($scope.is_edit) {
            $mp_ajax.put('/biz/'+$rootScope.bizId+'/table/'+$scope.cur_table.id,params,function(data){
                Object.copy($scope.new_table,$scope.cur_table,['name','seats','remark','table_type']);
                g_loading.hide();
//                SuccessBox(L.msg_operate_succeed);
                _HideBox();
            },function(error) {
                console.log(error);
                g_loading.hide();
                ErrorBox(L.msg_operate_fail);
            });
        }
        else {
            $mp_ajax.post('/biz/'+$rootScope.bizId+'/table',params,function(data){
                var id=data.tableId;
                //refresh it from back end
                $mp_ajax.get('/biz/'+$rootScope.bizId+'/table?tableId='+id,function(data){
                    $scope.last_new_table = data[0];
                    $scope.tables.push(data[0]);
                    g_loading.hide();
//                SuccessBox(L.msg_operate_succeed);
                    _HideBox();
                },function(error) {
                    console.log(error);
                    g_loading.hide();
                   ErrorBox(L.msg_operate_fail);
                });
            },function(error) {
                console.log(error);
                g_loading.hide();
                if(error && error.message && error.message.indexOf('ER_DUP_ENTRY')>-1) {
                    ErrorBox(L.duplicate_data);
                }
                else
                    ErrorBox(L.msg_operate_fail);
            });
        }
    };

    $scope.onDelete = function() {
        g_loading.show();
        $mp_ajax.delete('/biz/'+$rootScope.bizId+'/table/'+$scope.cur_table.id,function(data){
            g_loading.hide();
//            SuccessBox(L.msg_operate_succeed);
            $scope.tables.splice($scope.cur_table.index,1);
            _HideBox();
        },function(error) {
            console.log(error);
            g_loading.hide();
            ErrorBox(L.msg_operate_fail);
        });
    };

    $scope.onCancel = function() {
        _HideBox();
    };
}]);
//打印设备
app.controller("setting_tab_printer_controller", ['$rootScope','$scope','$mp_ajax','$location','$routeParams',function($rootScope,$scope,$mp_ajax ,$location,$routeParams) {
    var L = $rootScope.L;
    var dialog = $('#printer_add_update_form');

    $scope.PRINTER_TYPE = {
        FRONT_END:0,
        KITCHEN:1,
        DESC: {
            0: L.cashier,
            1: L.kitchen
        }
    };
    $scope.BIND_STATUS = {
        failed:0,
        success:1,
        DESC: {
            0: L.bind_status_0,
            1: L.bind_status_1
        }
    };

    $scope.cur_printer = null;
    $scope.printer_edit_form = null;
    $scope.printers = [];
    $scope.is_edit = false;
    $scope.is_delete = false;
    $mp_ajax.promiseGet('/biz/'+$rootScope.bizId+'/printer').then(function(data){
        if(_.isArray(data))
            $scope.printers = data;
    });

    function _ShowBox(printer) {
        dialog.show();
        var rect = GetCenterPosition(dialog);
        dialog.css('left',rect.left+'px');
        g_mask.show();
        if(printer) {
            $scope.cur_printer = printer;
            $scope.printer_edit_form = {
                name: printer.name,
                ip: printer.ip,
                local: printer.local,
                remark: printer.remark,
                type: printer.type,
                device_name: printer.device_name,
                print_num: printer.print_num,


            };
            $scope.is_edit = true;
        }
        else {
            $scope.cur_printer = null;
            $scope.is_edit = false;
            $scope.printer_edit_form = {
                type: $scope.PRINTER_TYPE.KITCHEN
            };
        }
    }

    function _HideBox() {
        dialog.hide();
        g_mask.hide();
        $scope.cur_printer = null;
    }

    $scope.onBtnNewPrinter = function() {
        _ShowBox();
    };

    $scope.onClickPrinter = function(printer) {
        $scope.printInfo = printer
        _ShowBox(printer);
    };

    $scope.onDelete = function(printer) {
        // var id = printer.id;
        if(printer){
            $scope.printInfo = printer;
        }
        if($scope.printInfo) {
            id = $scope.printInfo.id;
            $mp_ajax.delete('/biz/'+$rootScope.bizId+'/printer/'+id,function(data){
                _.remove($scope.printers,{id:id});
                if($scope.printInfo.type==$scope.PRINTER_TYPE.KITCHEN) {
                    g_printer.kitchen.destroy();
                }
                else if($scope.printInfo.type==$scope.PRINTER_TYPE.FRONT_END) {
                    g_printer.front.destroy();
                }
    //            SuccessBox(L.msg_operate_succeed);
                _HideBox();
            },function(error){
                ErrorBox(L.msg_operate_fail);
                _HideBox();
            });
        }
    };

    $scope.onSubmit = function() {
        var params = {
            name: $scope.printer_edit_form.name,
            ip: $scope.printer_edit_form.ip,
            local: $scope.printer_edit_form.local,
            remark: $scope.printer_edit_form.remark,
            type: $scope.printer_edit_form.type,
            deviceName:$scope.printer_edit_form.device_name,
            printNum:$scope.printer_edit_form.print_num
        };
        if($scope.is_edit) {
            $mp_ajax.promisePut('/biz/'+$rootScope.bizId+'/printer/'+$scope.cur_printer.id,params).then(function(data){
                if(data.success){
                    $scope.cur_printer.name = $scope.printer_edit_form.name;
                    $scope.cur_printer.ip = $scope.printer_edit_form.ip;
                    $scope.cur_printer.local = $scope.printer_edit_form.local;
                    $scope.cur_printer.remark = $scope.printer_edit_form.remark;
                    $scope.cur_printer.type = $scope.printer_edit_form.type;//#300
                    $scope.cur_printer.device_name = $scope.printer_edit_form.device_name;//#300
                    $scope.cur_printer.print_num = $scope.printer_edit_form.print_num;//#300
                    $scope.cur_printer.type = $scope.printer_edit_form.bind_status;//#300
                    if(params.type==$scope.PRINTER_TYPE.KITCHEN) {
                        g_printer.kitchen.ip = params.ip;
                    }
                    else if(params.type==$scope.PRINTER_TYPE.FRONT_END) {
                        g_printer.front.ip = params.ip;
                    }
//                SuccessBox(L.msg_operate_succeed);
                    $mp_ajax.promiseGet('/biz/'+$rootScope.bizId+'/printer').then(function(data){
                        if(_.isArray(data))
                            $scope.printers = data;
                    });
                    _HideBox();
                }else{
                    ErrorBox(L.msg_operate_fail);
                }

            },function(error){
                ErrorBox(L.msg_operate_fail);
            });
        }
        else {
            $mp_ajax.post('/biz/'+$rootScope.bizId+'/printer',params,function(data){
                if(_.isObject(data)) {
                    params.id = data.id;
                    if(data.success){
                        // $scope.printers.push(params);
                        if(params.type==$scope.PRINTER_TYPE.KITCHEN) {
                            g_printer.kitchen.ip = params.ip;
                        }
                        else if(params.type==$scope.PRINTER_TYPE.FRONT_END) {
                            g_printer.front.ip = params.ip;
                        }
                        //                SuccessBox(L.msg_operate_succeed);
                        $mp_ajax.promiseGet('/biz/'+$rootScope.bizId+'/printer').then(function(data){
                            if(_.isArray(data))
                                $scope.printers = data;
                        });
                        _HideBox();
                    }else{
                        ErrorBox(L.msg_operate_fail);
                    }
                }

            },function(error){
                ErrorBox(L.msg_operate_fail);
            });
        }

    };

    $scope.onCancel = function() {
        _HideBox();
    };

    $scope.onPrintTest = function(){
        if($scope.printInfo){
            var params = {
                deviceName:$scope.printInfo.device_name,
                operatorId:$scope.printInfo.operator_id
            };
            $mp_ajax.post('/biz/'+$rootScope.bizId+'/printerTest',params,function(data){
                if(_.isObject(data)) {
                    if(data.success){
                        _HideBox();
                    }else{
                        ErrorBox(L.msg_operate_fail);
                    }
                }
            },function(error){
                ErrorBox(L.msg_operate_fail);
            });
        }
    }
}]);
//呼叫管理
app.controller("setting_tab_callOut_controller", ['$rootScope','$scope','$mp_ajax','$location','$routeParams',function($rootScope,$scope,$mp_ajax ,$location,$routeParams) {
    var L = $rootScope.L;
    $scope.showCallOut = function(){
        $scope.checkStatus = false;

        for(var i=0;i<$scope.callOutAllArr.length;i++){
            for(var j=0;j<$scope.callOutArr.length;j++){
                if($scope.callOutAllArr[i].id==$scope.callOutArr[j].id){
                    $(".checkCall:eq(" + i + ")").prop("checked", true)
                }
            }
        }

        $('#add_callOut').show();
    }
    $scope.hideCallOut = function(){
        $('#add_callOut').hide();
    }
    $scope.getBizCallOut = function(){
        $mp_ajax.promiseGet('/biz/'+$rootScope.bizId+'/callout').then(function(data){
            if(_.isArray(data))
                $scope.callOutArr = data;
        });
    };
    $scope.getAllCallOut = function(){
        $mp_ajax.promiseGet('/callout').then(function(data){
            if(_.isArray(data))
                $scope.callOutAllArr = data;
        });
    };
    $scope.onDeleteBizCall = function(call){
        $mp_ajax.delete('/biz/'+$rootScope.bizId+'/callout/'+call.id,function(data){
            _.remove($scope.callOutArr,{id:call.id});
            $scope.hideCallOut()
        },function(error){
            ErrorBox(L.msg_operate_fail);
            $scope.hideCallOut();
        });
    };
    $scope.modifyCheckStatus = function(){
        $scope.checkStatus = $('#checkTitle').is(':checked')
    };

    $scope.addBizCallOut = function(){
        var params = [];
        var exist
        $(".checkCall").each(function(a,b){
            if($(b).is(':checked')){
                exist=false;
                for(var i=0;i<$scope.callOutArr.length;i++){
                    if($scope.callOutAllArr[a].id==$scope.callOutArr[i].id){
                        exist =true
                    }
                }
                if(!exist){
                    params.push({
                        bizId:$rootScope.bizId,
                        callOutId:$scope.callOutAllArr[a].id
                    })
                }
            }
        });

        $mp_ajax.post('/biz/'+$rootScope.bizId+'/callout',params,function(data){
            if(_.isObject(data)) {
                if(data.success){
                    $scope.hideCallOut();
                    $scope.getBizCallOut();
                }else{
                    ErrorBox(L.msg_operate_fail);
                }
            }
        },function(error){
            ErrorBox(L.msg_operate_fail);
        });
    }
    $scope.getBizCallOut();
    $scope.getAllCallOut();

    }]);
//结账方式设置
app.controller("setting_tab_checkout_controller", ['$rootScope','$scope','$mp_ajax','$location','$routeParams',function($rootScope,$scope,$mp_ajax ,$location,$routeParams) {
    var L = $rootScope.L;

    $scope.onClickCheckout = function(checkout) {
        if(checkout.checkout_id ==1 || checkout.checkout_id ==2 || checkout.checkout_id ==3 || checkout.checkout_id ==4){
            ErrorBox(L.deleteCheckout_03);
            return
        }
        $scope.checkoutId = checkout.id;
        $scope.checkoutInfoItem = checkout;
        $('#add_checkout').show();
    };

    $scope.onCancel = function() {
        $scope.checkoutInfoItem = null;
        $('#add_checkout').hide();
    };

    $scope.showCheckOut = function(){
        $scope.checkoutInfoItem = null;
        $scope.checkoutId = 0;
        $('#add_checkout').show();
    }
    $scope.hideCheckOut = function(){
        $scope.checkoutInfoItem = null;
        $('#add_checkout').hide();
    }
    $scope.getBizCheckOut = function(){
        $mp_ajax.promiseGet('/biz/'+$rootScope.bizId+'/checkoutInfo').then(function(data){
            if(_.isArray(data))
                $scope.checkoutArr = data;
        });
    };
    $scope.onDeleteBizCheckOut = function(checkout){
        if(checkout.checkout_id ==1 || checkout.checkout_id ==2 || checkout.checkout_id ==3 || checkout.checkout_id ==4){
            ErrorBox(L.deleteCheckout_03);
            return
        }
        console.log('checkout',checkout);
        $mp_ajax.delete('/biz/'+$rootScope.bizId+'/checkoutInfo/'+checkout.checkout_id+'/'+checkout.id,function(data){
            if(!data.success){
                if(data.errMsg == 1){
                    ErrorBox(L.deleteCheckout_01);
                    return
                }
            }else{
                _.remove($scope.checkoutArr,{id:checkout.id});
                $scope.hideCheckOut()
            }
        },function(error){
            ErrorBox(L.msg_operate_fail);
            $scope.hideCheckOut();
        });
    };
    $scope.addBizCheckOut = function(){
        var params = $scope.checkoutInfoItem;
        if($scope.checkoutId){
            $mp_ajax.promisePut('/biz/'+$rootScope.bizId+'/checkoutInfo/' + $scope.checkoutId,params,function(data){
                console.log('data',data);
                if(_.isObject(data)) {
                    if(data.success){
                        $scope.hideCheckOut();
                        $scope.getBizCheckOut();
                    }else{
                        ErrorBox(L.msg_operate_fail);
                        return
                    }
                }
            },function(error){
                ErrorBox(L.msg_operate_fail);
            });

        }else{
            $mp_ajax.post('/biz/'+$rootScope.bizId+'/checkoutInfo',params,function(data){
                if(_.isObject(data)) {
                    if(data.success){
                        $scope.hideCheckOut();
                        $scope.getBizCheckOut();
                    }else{
                        if(data.errMsg == 1){
                            ErrorBox(L.addCheckout);
                        }else{
                            ErrorBox(L.msg_operate_fail);
                        }
                        return
                    }
                }
            },function(error){
                ErrorBox(L.msg_operate_fail);
            });
        }

    };
    $scope.getBizCheckOut();
}]);



app.controller("setting_tab_module_controller", ['$rootScope','$scope','$mp_ajax','$location','$routeParams',function($rootScope,$scope,$mp_ajax ,$location,$routeParams) {
        var L = $rootScope.L;

        $scope.func = {
            menu_item:false,
            promotion:true,
            order: $rootScope.bizInfo.order_status==1 ? true : false
        };


        $scope.onClickModule = function(module,value){
            if(module=='order') {
                var order_status = value ? 0:1;
                g_loading.show();
                $mp_ajax.promisePut('/biz/'+$rootScope.bizId+'/orderStatus/'+order_status).then(function(date){
                    g_loading.hide();
//                SuccessBox('Operation Succeed');
                    $rootScope.bizInfo.order_status = order_status;
                },function(error){
                    g_loading.hide();
                    ErrorBox('Operation Failed');
                    console.error(error);
                });
            }
        };

    }]);



