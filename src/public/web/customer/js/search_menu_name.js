/**
 * Created by Ken on 2014-4-18.
 */


app.controller(
    "searchMenuNameController",
    ['$rootScope','$scope','$routeParams','$mpAjax','$location','$q','$timeout','$log','$sce',
    '$mpBizInfo','$mpMenuTypes','$mpMenuItem','$mpPromotion','$mpCustomerFavoriteMenuItems','$mpMyTable','$mpCustomer','$mp_ajax',
    function(
        $rootScope,$scope,$routeParams,$mpAjax,$location,$q,$timeout,$log,$sce,
         $mpBizInfo,$mpMenuTypes,$mpMenuItem,$mpPromotion,$mpCustomerFavoriteMenuItems,$mpMyTable,$mpCustomer,$mp_ajax
    )
{
    console.log('restaurant_menu_controller.js');
    var L = $rootScope.L;

    /*$scope.bizKey = $rootScope.bizKey;*/
    var searchName=$routeParams.searchName;
    $scope.bizKey =$mpCustomer.getItem("biz_id") ?$mpCustomer.getItem("biz_id"):null;
    $scope.height = $location.search().height ? $location.search().height : 0;

    $scope.$mpBizInfo = $mpBizInfo;
    $scope.$mpMenuTypes = $mpMenuTypes;
    $scope.$mpMenuItem = $mpMenuItem;
    $scope.$mpPromotion = $mpPromotion;
    $scope.$mpCustomerFavoriteMenuItems = $mpCustomerFavoriteMenuItems;
    $scope.curDate = moment().format("dddd MMMM M YYYY");
    $scope.MenuArr=[];
    $scope.information='';

    console.log($mpMenuTypes.getData());

    //$log.debug($scope.$mpPromotion);
    $scope.toMenuDetail=function (prod_id) {
        var height=$(document).scrollTop();
        $mpMenuTypes.getData()[0]
        $rootScope.navTo('/restaurant/' + $mpBizInfo.getItem('bizKey') + '/menu-item/' + prod_id);
    }

    var initMenu=function () {
        $scope.information='';
        $mpBizInfo.init($scope.bizKey).then(function(){
            var type_pin = null;
            $scope.onMenuTypesLoaded = function() {
                //type_pin = $('.js-menu-types').pin({containerSelector: '.js-menu-types-parent'});
            };
            $scope.onMenuItemLoaded = function() {
                //type_pin.recalculateLimits();
                //type_pin.setPinDataTop();
            };
            var url='';
            if(searchName!==''){
                url='/prod/'+$mpBizInfo.getItem('biz_id')+'/prodWithComment?active=1&name='+searchName
            }else {
                url='/prod/'+$mpBizInfo.getItem('biz_id')+'/prodWithComment?active=1'
            }
            $q.all([
                $mpMenuItem.init(url),
                $mpPromotion.init('/biz/'+$mpBizInfo.getItem('biz_id')+'/promoNow')
            ]) .then(function(){
                var depth_of_object = 2;
                $mpPromotion.GetDiscount($mpMenuItem.getData(),depth_of_object);

                var menuItems = $mpMenuItem.getData();
                $scope.MenuArr=menuItems;
                if($scope.MenuArr.length==0){
                    $scope.information=L.search_name_no_data;
                }
                $scope.specialItems = [];

                if($scope.height>0){
                    window.setTimeout(function () {
                        $(document).scrollTop($scope.height);
                    },1000);

                }
            });
            $scope.onClickMenuType = function(type) {
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
            console.log($scope.meSharePicUrl);
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

    $scope.onClickLabel = function(label) {
        $scope.curMenuType =label;

    };

    $scope.showMenuType=function () {
        $("#mp-menu-type-list").slideToggle(300);
    }


    var wxCode = getParameter('code')
    var operator_id = $.cookie('operator_id')
    if (wxCode && !operator_id) {
        getWeiXinAccessToken($mp_ajax,$mpAjax);
    }
    $("#mp-menu-type-list").hide();

    if($scope.bizKey !==null){
        initMenu();
    }else{
        $scope.information=L.search_name_no_login;
    }




}] );