/**
 * Created by Ken on 14-8-5.
 */
app.controller("myTableController", ['$rootScope', '$scope', '$routeParams', '$mp_ajax', '$location', '$q', '$timeout','$log',
    '$mpBizInfo','$mpMyTable','$mpCustomer','$mpCustomerOrder',
function ($rootScope, $scope, $routeParams, $mp_ajax, $location, $q, $timeout,$log,
    $mpBizInfo,$mpMyTable,$mpCustomer,$mpCustomerOrder) {

    var L = $rootScope.L;
    $rootScope.setTitle($rootScope.L.my_table);
    // $scope.wxpayFlag = $mpBizInfo._data.wxpay_flag;
    
    if($mpMyTable.getData().count>0) {
        $scope.myTable = $mpMyTable;
        $mpBizInfo.init($mpMyTable.getData().bizId,{forceReload:false}).then(function(){
            $scope.bizInfo = $mpBizInfo.getData();
            $log.debug('bizInfo',$mpBizInfo.getData(), 'myTable',$mpMyTable.getData());
            getOrderItemTemp()
        });
        $mpBizInfo.getRating().then(function(){
            $scope.rating = $mpBizInfo.getItem('extraRating');
        });
    }

    $mpBizInfo.getTax();
    $mpMyTable.calcPrice();

    var operator_id=$.cookie('operator_id');
    var qr = $.cookie('qr');
    var openId = $.cookie('openid');
    var bizId = $mpMyTable.getData().bizId;

    //为了在本地测试
    if(!openId){
        qr = '130gdTOyvpWmPXWXMREagaiRtdpHSkUYatI';//七彩牛222号桌
        if(navigator.userAgent.indexOf('iPhone')>-1){//微信开发工具
            openId = 'o6-f30ZHhi8uGwT1V35bdXlwpdJ4'
        }else if(navigator.userAgent.indexOf('Android')>-1){//Android手机
            openId = 'o6-f30Tk_03XzHvllpMojEPQ4o-U'
        }else if(navigator.userAgent.indexOf('Macintosh')>-1){//mac
            openId = 'o6-f30Tk_03XzHvllpMojEPQ4o-U'
        }
    }
    var ws = new WebSocket(sys_config.biz_websocket_url +"/"+ bizId +"/qr/" + qr + "/openId/" + openId);
    console.log(sys_config.biz_websocket_url +"/"+ bizId +"/qr/" + qr + "/openId/" + openId);
    console.log(ws);
    ws.onmessage = function (evt)
    {
        var received_msg = JSON.parse(evt.data);
        if (received_msg.status == 88){//下单
            if(received_msg.openId != openId){
                g_loading.hide();
                $mpMyTable.clear();
                window.location.href ="/restaurant/" + bizId + '/menu';
                // window.location.href ="/checkout-order-success/";
            }
        }
        if (received_msg.status == 87){//点菜
            getOrderItemTemp()
        }
    };

    function getOrderItemTemp(){
        $mpMyTable.getData().bizId = $mpBizInfo.getItem('biz_id');
        $mpMyTable.getData().bizKey = $mpBizInfo.getItem('bizKey');
        $mpMyTable.getData().bizName =  $mpBizInfo.getItem('name');
        $mpMyTable.getData().bizNameLang = $mpBizInfo.getItem('name_lang');
        $mpMyTable.getData().bizImgUrl = $mpBizInfo.getItem('img_url');
        $mpMyTable.getData().prods = [];
        $mpMyTable.getData().count = 0;
        $mp_ajax.get('/biz/' +  $mpBizInfo.getItem('biz_id') + '/qr/' + qr + '/openId/' + openId +  '/getOrderItemTemp').then(function (data) {
            if(_.isObject(data)) {
                for(var i=0;i<data.data.length;i++){
                    $mpMyTable.getData().prods.push({
                        prodId: data.data[i].prodId,
                        prodName: data.data[i].prodName,
                        prodNameLang: data.data[i].prodNameLang,
                        price: data.data[i].price,
                        actual_price: data.data[i].actualPrice,
                        img_url: data.data[i].img_url,
                        img_url_80: data.data[i].img_url_80,
                        img_url_240: data.data[i].img_url_240,
                        img_url_600: data.data[i].img_url_600,
                        img_url_l: data.data[i].img_url_l,
                        img_url_m: data.data[i].img_url_m,
                        img_url_o: data.data[i].img_url_o,
                        img_url_s: data.data[i].img_url_s,
                        qty: data.data[i].qty,
                        nickName: data.data[i].nickName,
                        openId: data.data[i].openId,
                        remark:''
                    })
                    $mpMyTable.getData().count += data.data[i].qty
                }
            }
        });
    }

    $scope.onPlaceOrder = function() {
        $mpMyTable.save();
        if (!$rootScope.isLogin) {
            if (sys_config.orderFlow !=null && sys_config.orderFlow==1) {
                window.location.href = '/top-dish-old?login=1&preUrl=' + 'checkout-order';
            }else{
                window.location.href = '/top-dish-old?login=1&preUrl=' + 'my-table';
            }
        }
        else if(sys_config.orderFlow !=null && sys_config.orderFlow==1){
            //full order flow support take out and payment
            $rootScope.navTo('checkout-order');
        }else{
            //by default it is simple flow to place order directly
            $mpMyTable.getData().orderInfo  = {
                username:$mpCustomer.getItem('fullName'),
                phone:$scope.$mpCustomer.getItem('phone_no'),
                address:'',
                orderStart:DateUtil.format(DateUtil.localDateTime2UTCDateTime(new Date()), 'yyyy-MM-dd HH:mm:ss'),
                orderType:$rootScope.Const.ORDER_TYPE.DINE_IN,
                peopleNum : 1,
                remark:'',
                bizId:$mpMyTable.getData().bizId,
                status : $rootScope.Const.ORDER_STATUS.DINING,
                active:1,
                itemArray:[],
                operator_id:operator_id?operator_id: '',
                qr:qr,
                openId:openId
            };
            $mpMyTable.save();
            var params = _.cloneDeep($mpMyTable.getData().orderInfo);
            _.forEach($mpMyTable.getData().prods,function(prod){
                params.itemArray.push({
                    prodId: prod.prodId,
                    quantity: prod.qty,
                    remark: prod.remark || '',
                    prodExtend:prod.extendName,
                    extendPrice:prod.extendPrice,
                    extendTotalPrice:prod.extendPrice*prod.qty,
                    status: $rootScope.Const.ORDER_STATUS.PENDING,
                    operator_id:operator_id?operator_id: '',
                    prodLabel:prod.prodLabel?prod.prodLabel: ''
                });
            });


            g_loading.show();

            // $mp_ajax.get('/biz/' + $mpBizInfo.getItem('biz_id') + '/qr/' + qr +  '/getOrderItemTempProdsAll?batchState=1').then(function (result) {
            //     console.log('result',result)
            //     if(result.data.length==0){
            //         g_loading.hide();
            //         window.location.href ="/restaurant/" + $mpBizInfo.getItem('biz_id') + '/menu';
            //         $mpMyTable.clear();
            //         return
            //     }
            // }).then(function(){
                $mp_ajax.get('/biz/' + $mpBizInfo.getItem('biz_id') + '/qr/' + qr +  '/getOrderParamsNew').then(function (result) {
                    if(!$.isEmptyObject(result.data)){
                        result.data.openIdParty = openId;
                        for(var i=0;i<$mpMyTable.getData().prods.length;i++){
                            for(var j=0;j<result.data.itemArray.length;j++){
                                if($mpMyTable.getData().prods[i].prodId == result.data.itemArray[j].prodId){
                                    result.data.itemArray[j].remark = $mpMyTable.getData().prods[i].remark
                                }
                            }
                        }
                        console.log('result.data',result.data);
                        console.log('$mpMyTable.getData()',$mpMyTable.getData());
                        $mpCustomerOrder.add(result.data).then(function(data){
                            g_loading.hide();
                            $mpMyTable.getData().orderInfo.id = data.orderId;
                            $mpMyTable.getData().orderInfo.seq = data.seq;
                            $mpMyTable.save();

                            if($mpBizInfo._data.wxpay_flag == 0){
                                $rootScope.navTo('checkout-order-success');
                            }else{
                                $scope.orderIdWX = $mpMyTable.getData().orderInfo.id;
                                var url = sys_config.weixinConfig.redirect_uri+'?orderId='+$scope.orderIdWX;
                                var baseUrl = "https://open.weixin.qq.com/connect/oauth2/authorize?appid="+ sys_config.weixinConfig.app_id +
                                    "&redirect_uri="+encodeURIComponent(url)+"&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect";
                                window.location = baseUrl;
                            }
                        }).catch(function(error){
                            g_loading.hide();
                            $log.error(error);
                            ErrorBox($rootScope.L.operation_failed);
                        });
                    }else{
                        window.location.href ="/restaurant/" + $mpBizInfo.getItem('biz_id') + '/menu';
                        $mpMyTable.clear();
                        return
                    }

                })
            // })
        };
    };
    $scope.onDeleteAll = function() {
        $mpMyTable.clear();
    };

    $scope.onOrderMore = function() {
        $rootScope.navTo('/restaurant/'+$mpMyTable.getData().bizId+'/menu');
    };


    $scope.$on('$mpMyTable:prodCountChange',function(msg){
        $scope.$apply(function(){
            $mpMyTable.calcPrice();
        });
    });
    jQuery(document).ready(function(){
        OnViewLoad();
    });
    //return;

    /*$scope.day_of_week = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    $scope.start_date = DateUtil.format(new Date(), 'MM/dd/yyyy');
    $scope.order_hour = 0;
    $scope.order_minute = 0;
    $scope.comment = '';

    $scope.myTable = {};
    $scope.orders = [];
    angular.copy($rootScope.myTable, $scope.myTable);
    //Ken 2014-10-11, use 'shallow copy', make sure these two attributes are the same,
    //so we can archive rootScope with latest 'prods'.
    $scope.myTable.prods = $rootScope.myTable.prods ? $rootScope.myTable.prods : [];
    $scope.sub_total = 0;
    $scope.taxRate = 0;
    /*var paramsCalcPrice = {
        startDate: DateUtil.format(new Date(), 'yyyy-MM-dd'),
        orderStart: DateUtil.format(new Date(), 'yyyy-MM-dd')
    };*/

    /*if ($rootScope.myTable.bizId > 0) {
        $mp_ajax.get("/biz/" + $rootScope.myTable.bizId + "/taxRate", function (data) {
            $scope.taxRate = data['tax_rate'];
        });
        $scope.cur_biz_info = null;
        $mp_ajax.get("/biz/" + $rootScope.myTable.bizId, function (data) {
            if(_.isObject(data)) {
                $scope.cur_biz_info = data;
            }
        });
    }

    //if items have remark, then show edit boxes
    _.forEach($scope.myTable.prods,function(_p){
        if(_p.desc) {
            $scope.is_show_more_options = true;
            return false;
        }
    });

    /*function SaveMyTableTo2Cookie() {
        angular.copy($scope.myTable,$rootScope.myTable);
        $.cookie("MyTable", angular.toJson($scope.myTable));
    };

    /*$scope.onSelectChange = function () {
        calcPrice();
        SaveMyTableTo2Cookie();
    };

    //remove cur_order's information
    /*function _remove_all_items() {
        $scope.myTable = {};
        $rootScope.myTable = {};
        calcPrice();
        SaveMyTableTo2Cookie();
    }
    /*$scope.onRemoveAll = function () {
        $("#dialog-confirm-favorite-removeAll").removeClass('hide').dialog({
            resizable: false,
            modal: true,
            buttons: [
                {
                    html: "<i class='icon-trash bigger-110'></i>&nbsp;" + L.remove,
                    "class": "btn btn-danger btn-xs",
                    click: function () {
                        var confirmDlg = $(this);
                        $rootScope.$apply(function(){
                            _remove_all_items();
                        });
                        confirmDlg.dialog("close");
                    }
                }
                ,
                {
                    html: "<i class='icon-remove bigger-110'></i>&nbsp;" + L.cancel,
                    "class": "btn btn-xs",
                    click: function () {
                        $(this).dialog("close");
                    }
                }
            ]
        });
    };
    /*$scope.onPrint = function () {
        var params = {};
        angular.copy($scope.myTable, params);
//            params.sub_total = $scope.sub_total.toFixed(2);
        params.taxRate = $scope.taxRate;
//            params.tax_total = ($scope.sub_total * $scope.taxRate / 100).toFixed(2);
//            params.total_price = ($scope.sub_total * (1 + $scope.taxRate / 100)).toFixed(2);
        params.prods = [];
        for (var i in $scope.myTable.prods) {
            var prod = $scope.myTable.prods[i];
            var tmpProd = {};
            //reduce size of url
            tmpProd.n = prod.prodName;
            tmpProd.nl = prod.prodNameLang;
            tmpProd.pc = prod.discount && prod.discount>0 ? prod.actualPrice/prod.qty : prod.price;
            tmpProd.qty = prod.qty;
            tmpProd.desc = prod.desc;
            params.prods.push(tmpProd);
        }
        var myTableStr = angular.toJson(params);
        myTableStr = new Base64().encode(myTableStr);
        myTableStr = encodeURIComponent(myTableStr);
        SaveMyTableTo2Cookie();
        window.open('export_my_table_as_pdf?myTable=' + myTableStr);
    };

   /* $scope.onCheckout = function() {
        SaveMyTableTo2Cookie();
        if (!$rootScope.isLogin) {
            //#373
            var abs_url = $location.absUrl();
            var cur_path = $location.path();
            abs_url = abs_url.substring(0,abs_url.length-cur_path.length)+'/checkout_order';
            window.location.href = 'customer/login.html?preUrl=' + escape(abs_url);
        }
        else {
            $rootScope.navTo('checkout_order');
        }
    };

   /* function calcPrice() {
        paramsCalcPrice.itemArray = [];
        for (var i in $scope.myTable.prods) {
            var prod = $scope.myTable.prods[i];
            paramsCalcPrice.itemArray.push({
                prodId: prod.prodId,
                quantity: prod.qty
            });
        }
        if ($rootScope.myTable.bizId > 0) {
            $mp_ajax.post('/biz/' + $rootScope.myTable.bizId + '/orderPrice', paramsCalcPrice, function (data) {
                if (angular.isObject(data)) {
                    for (var i in data.itemArray) {
                        var item = data.itemArray[i];
                        if (item.discount > 0) {
                            $scope.myTable.prods[i].discount = item.discount;
                            $scope.myTable.prods[i].actualPrice = item.actualPrice;
                        }
                    }
                    $scope.myTable.totalDiscount = data.totalDiscount;
                    $scope.myTable.actualPrice = data.actualPrice;
                    $scope.myTable.totalTax = data.totalTax;
                    $scope.myTable.originPrice = data.originPrice;
                    $scope.myTable.totalPrice = data.totalPrice;
                }
            }, function (error) {
                console.log('error', error);
            });
        }
    }
    $scope.onBefore = function (date){
        if (date < new Date()){
            return [false];
        }
        return [true];
    };

    calcPrice();

    $scope.onBtnMoreOptions = function() {
        $scope.is_show_more_options = true;
    };

    $scope.onAddToCart = function(item) {
        item.qty++;
        $rootScope.myTable.count++;
        $.cookie('MyTable', angular.toJson($rootScope.myTable));
        calcPrice();
    };

    $scope.onReduceFromCart = function(item) {
        RemoveFromMyTable($rootScope.myTable, item.prodId);
        calcPrice();
    };*/

    $scope.onBtnGoToPay = function() {
        var url = sys_config.weixinConfig.redirect_uri+'?orderId='+$scope.orderIdWX  + '&totalPrice=' + $scope.totalPrice;
        var baseUrl = "https://open.weixin.qq.com/connect/oauth2/authorize?appid="+ sys_config.weixinConfig.app_id +
            "&redirect_uri="+encodeURIComponent(url)+"&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect";
        window.location = baseUrl;
    };

    $(function () {
        var o=$(".dining-table");
        $('.tabble-btn').on('click', function () {
            if(!o.hasClass('tabble-show')){
                o.addClass('tabble-show');
                $(this).text(L.table_open);
            }else{
                o.removeClass('tabble-show');
                $(this).text(L.table_close);
            }
        });
    })


}]);
