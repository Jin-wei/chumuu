app.controller("wxpayController", ['$rootScope', '$scope', '$routeParams', '$mpAjax', '$location', '$q',
    '$timeout','$mpMyTable','$mpCustomer','$mp_ajax','$mpBizInfo',
    function ($rootScope, $scope, $routeParams, $mpAjax, $location, $q, $timeout,$mpMyTable,$mpCustomer,$mp_ajax,$mpBizInfo) {

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
                $location.path('/restaurant/'+$mpCustomer.getItem("biz_id"));
            }else {
                $location.path('/');
            }
        };


        function getParameter(param) {
            var reg = new RegExp("(^|&)" + param + "=([^&]*)(&|$)", "i");
            var r = window.location.search.substr(1).match(reg);
            if (r != null)
                return unescape(r[2]);
            return null;
        }
        var code = getParameter('code');
        var orderId = getParameter('orderId');
        var data = $.ajax({
            url:'/api/getWXPayParams?code=' + code + '&orderId=' + orderId,
            type:'get',
            async: false
        });
        console.log(data);
        var jsParams={
            "appId" :data.responseJSON.appId,   //公众号名称，由商户传入
            "timeStamp":data.responseJSON.timeStamp,  //时间戳，自1970年以来的秒数
            "nonceStr" : data.responseJSON.nonceStr, //随机串
            "package" : data.responseJSON.package,
            "signType" : "MD5",  //微信签名方式：
            "paySign" : data.responseJSON.paySign //微信签名
        }
        function onBridgeReady(){
            console.log("jsParams:"+jsParams);
            WeixinJSBridge.invoke(
                'getBrandWCPayRequest', jsParams,function(res){
                    if(res.err_msg == "get_brand_wcpay_request：ok" ) {} // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回 ok，但并不保证它绝对可靠。
                }
            );
        }

        jQuery(document).ready(function(){
            OnViewLoad();
            if (typeof WeixinJSBridge == "undefined"){
                if( document.addEventListener ){
                    document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
                }else if (document.attachEvent){
                    document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
                    document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
                }
            }else{
                onBridgeReady();
            }

        })
    }]);