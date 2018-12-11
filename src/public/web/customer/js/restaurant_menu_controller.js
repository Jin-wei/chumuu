/**
 * Created by Ken on 2014-4-18.
 */


app.controller(
    "restaurantMenuController",
    ['$rootScope','$scope','$routeParams','$mpAjax','$location','$q','$timeout','$log','$sce',
    '$mpBizInfo','$mpMenuTypes','$mpMenuItem','$mpPromotion','$mpCustomerFavoriteMenuItems','$mpMyTable','$mpCustomer','$mp_ajax',
    function(
        $rootScope,$scope,$routeParams,$mpAjax,$location,$q,$timeout,$log,$sce,
         $mpBizInfo,$mpMenuTypes,$mpMenuItem,$mpPromotion,$mpCustomerFavoriteMenuItems,$mpMyTable,$mpCustomer,$mp_ajax
    )
{
    var L = $rootScope.L;

    $scope.bizKey = $routeParams.bizKey ? $routeParams.bizKey : $rootScope.bizKey;
    $scope.scrollTop = $location.search().scrollTop ? $location.search().scrollTop : 0;

    $scope.$mpBizInfo = $mpBizInfo;
    $scope.$mpMenuTypes = $mpMenuTypes;
    $scope.$mpMenuItem = $mpMenuItem;
    $scope.$mpPromotion = $mpPromotion;
    $scope.$mpCustomerFavoriteMenuItems = $mpCustomerFavoriteMenuItems;
    $scope.curDate = moment().format("dddd MMMM M YYYY");

    var qr = $.cookie('qr');
    var openId = $.cookie('openid');
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


    function getOrderItemTemp(type){
        $mpMyTable.getData().bizId = $mpBizInfo.getItem('biz_id');
        $mpMyTable.getData().bizKey = $mpBizInfo.getItem('bizKey');
        $mpMyTable.getData().bizName =  $mpBizInfo.getItem('name');
        $mpMyTable.getData().bizNameLang = $mpBizInfo.getItem('name_lang');
        $mpMyTable.getData().bizImgUrl = $mpBizInfo.getItem('img_url');
        $mpMyTable.getData().prods = [];
        $mpMyTable.getData().count = 0;
        $mp_ajax.get('/biz/' + $scope.bizKey + '/qr/' + qr + '/openId/' + openId +  '/getOrderItemTemp').then(function (data) {
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
                        openId: data.data[i].openId
                    })
                    $mpMyTable.getData().count += data.data[i].qty
                }
                $scope.curMenuType = {};
                $scope.curMenuType = $scope.nowType;
            }
        });
    }
    // test web socket for table
    var ws = new WebSocket(sys_config.biz_websocket_url +"/"+ $scope.bizKey +"/qr/" + qr + "/openId/" + openId);
    console.log(sys_config.biz_websocket_url +"/"+ $scope.bizKey +"/qr/" + qr + "/openId/" + openId);
    console.log(ws);
    ws.onmessage = function (evt)
    {
        var received_msg = JSON.parse(evt.data);
        console.log(received_msg)
        if (received_msg.status == 88){//下单
            if(received_msg.openId != openId){
                g_loading.hide();
                // $mpMyTable.clear();
                // $rootScope.navTo('checkout-order-success');
                // $location.url('checkout-order-success')
                // window.location.href ="/checkout-order-success/";
                location.reload();
            }
        }
        if (received_msg.status == 87){//点菜
            getOrderItemTemp()
        }
    };


    //$log.debug($scope.$mpPromotion);
    $scope.toMenuDetail=function (prod_id) {
        var scrollTop=$(document).scrollTop();
        $mpMenuTypes.getData()[0]
        $rootScope.navTo('/restaurant/' + $mpBizInfo.getItem('bizKey') + '/menu-item/' + prod_id + '?scrollTop='+scrollTop);
    }
    $scope.callOut = function(callOut){
        $('.call_out').attr('disabled',"true");
        // var q = '1MoKVbZKGOdrscgZratNdHMTBuyuFCITa';
        var q = $.cookie('qr');
        var url='/sendCallOut/' + $scope.bizKey + '/code/' + q + '/type/' + callOut.id ;
        $mp_ajax.get(url,function(data){});

        window.setTimeout(function(){
            $('.call_out').removeAttr("disabled");
        },8000)
    };

    var initData=function () {
        $mpBizInfo.init($scope.bizKey).then(function(){
            var type_pin = null;
            $scope.onMenuTypesLoaded = function() {
                //type_pin = $('.js-menu-types').pin({containerSelector: '.js-menu-types-parent'});
            };
            $scope.onMenuItemLoaded = function() {
                //type_pin.recalculateLimits();
                //type_pin.setPinDataTop();
            };
            $q.all([
                $mpMenuTypes.init($mpBizInfo.getItem('biz_id')),
                $mpMenuItem.init('/prod/'+$mpBizInfo.getItem('biz_id')+'/prodWithComment?active=1'),
                $mpPromotion.init('/biz/'+$mpBizInfo.getItem('biz_id')+'/promoNow')
            ]) .then(function(){
                var depth_of_object = 2;
                var type =$rootScope.backToCurrentType;
                $mpPromotion.GetDiscount($mpMenuItem.getData(),depth_of_object);

                if (type) {
                    _.forEach($scope.prodTypeArr,function(t){
                        if (type == t.name) {
                            $scope.curMenuType = t;
                        }
                    });
                }
                else {
                    // $scope.curMenuType = $scope.prodTypeArr[0];
                    $scope.nowType  = $scope.prodTypeArr[0];
                }

                var menuItems = $mpMenuItem.getData();
                $scope.specialItems = [];
                //handle null img_url
                for(var i=0;i<menuItems.length;++i) {
                    var menuItem = menuItems[i];
                    if(menuItem.special==1) {
                        $scope.specialItems.push(menuItem);
                    }
                    var menuType = _.find($scope.prodTypeArr,{type_id:menuItem.type_id});
                    if(menuType) {
                        menuType.items = menuType.items || [];
                        menuType.items.push(menuItem);
                    }
                }
                if($scope.scrollTop>0){
                    window.setTimeout(function () {
                        $(document).scrollTop($scope.scrollTop);
                    },1000);

                }
                //$log.debug($scope.$mpMenuTypes);
                getOrderItemTemp()
            });
            $scope.onClickMenuType = function(type) {
                $scope.nowType = type;
                $scope.curMenuType = type;
            };
            $mpCustomer.onBaseDataLoaded(function(){
                $mpCustomerFavoriteMenuItems.init($mpCustomer.getItem('customer_id')).then(function(){
                });
            });
        }).then(function () {

        }).catch(function(error){
            $log.error('$log',error);
        });
    }


    $mpBizInfo.getPicWall().then(function(){
        //$mpBizInfo has many $digest, it will all trigger onSliderLoaded, so use an alisa instead
        $scope.pics = $mpBizInfo.getItem('extraPicWall');
        if ($scope.pics.length==0 || !$scope.pics){
            $scope.pics[0] = {img_url_l:'/image/restaurant_icon.png'};
        }
        if ($mpBizInfo.getItem('meShareVideo')) {
            $scope.meSharePicUrl = $scope.pics[$scope.pics.length - 1].img_url_s;
        }
        //微信分享
        var sharePath=$location.$$path;
        var shareName=$mpBizInfo.getItem('name');
        var shareDesc=$mpBizInfo.getItem('desc');
        if($mpBizInfo.getItem('extraPicWall') && $mpBizInfo.getItem('extraPicWall').length>0){
            var shareImg=$mpBizInfo.getItem('extraPicWall')[0].img_url_l;
            $rootScope.isToGetTicket(sharePath,shareName,shareDesc,shareImg);
        }else{
            var shareImg=window.location.protocol + '//' + window.location.host+'/image/restaurant_icon_240.png';
            $rootScope.isToGetTicket(sharePath,shareName,shareDesc,shareImg);
        }

    });



    var productWithCommentLabel=function () {
        var url='/prod/'+$scope.bizKey+'/productWithCommentLabel';
        $mp_ajax.get(url,function(data){
            $scope.prodCommentLabelArr=data;
            TranslateMenuItemImageUrl(data)
            for(var l in $scope.prodLabel){
                $scope.prodLabel[l].items=[];
                for(var i in $scope.prodCommentLabelArr){
                    if($scope.prodCommentLabelArr[i].label_id==$scope.prodLabel[l].id){
                        $scope.prodLabel[l].items.push($scope.prodCommentLabelArr[i]);
                    }
                }
            }

        })
    }

    var prodLabel=function () {
        var url='/biz/'+$scope.bizKey+'/prodLabel' ;
        $mp_ajax.get(url,function(data){
            $scope.prodLabel=data;
            productWithCommentLabel();
        })
    }

    //按时间类型显示
    var formateProdType=function (data) {
        var temy =[];
        for(var i in data){
            if(data[i].display_type==1) {
                temy.push(data[i]);
            }else if(data[i].display_type==2){
                if(data[i].start_time !==null && data[i].end_time !==null){
                    var now =moment(new Date()).format('YYYY-MM-DD HH:mm:ss Z');

                    var start_time=moment(data[i].start_time, 'YYYY-MM-DD HH:mm:ss Z').format('YYYY-MM-DD HH:mm:ss');
                    var end_time=moment(data[i].end_time, 'YYYY-MM-DD HH:mm:ss Z').format('YYYY-MM-DD HH:mm:ss');
                    var coparem1=compareTime(start_time,now);
                    var coparem2=compareTime(end_time,now);
                    //大于等于开始时间 小于等于结束时间
                    if((coparem1 == 'small' || coparem1 == 'equal') && (coparem2=='bigger' ||  coparem2 == 'equal')){
                        temy.push(data[i]);
                    }
                }
            }
        }
        return temy
    };

    //获得小类
    var getprodType=function () {
        var url='/biz/'+$scope.bizKey+'/prodType' ;
        $mp_ajax.get(url,function(data){
            $scope.prodTypeAll=data;
            var temy =formateProdType(data);
            $scope.prodTypeArr=temy;
            initData();
        })
    }

    //更新菜单
    var intervalTime=60000;
    var lastPath=window.location.pathname;
    var refreshProdType=function () {
      var proTypeInterval=window.setInterval(function () {
          var temy=formateProdType($scope.prodTypeAll);
          $scope.$apply(($scope.prodTypeArr=temy));
          var currentPath=window.location.pathname;
          if(currentPath!==lastPath){
              window.clearInterval(proTypeInterval);
          }
      },intervalTime)
    };

    $scope.onClickLabel = function(label) {
        $scope.curMenuType =label;

    };

    $scope.showMenuType=function () {
        $("#mp-menu-type-list").slideToggle(300);
    }

    $scope.getAllCallOut = function(){
        $mp_ajax.promiseGet('/biz/' + $scope.bizKey + '/callout').then(function(data){
            if(_.isArray(data))
                $scope.callOutAllArr = data;
        });
    };
    var wxCode = getParameter('code')
    var operator_id = $.cookie('operator_id')
    if (wxCode && !operator_id) {
        getWeiXinAccessToken($mp_ajax,$mpAjax);
    }
    getprodType();
    productWithCommentLabel();
    prodLabel();
    $("#mp-menu-type-list").hide();
    $scope.getAllCallOut()
}] );