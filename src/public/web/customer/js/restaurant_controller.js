/**
 * Created by Ken on 2014-4-18.
 */


app.controller(
    "restaurantController",
    ['$rootScope','$scope','$routeParams','$mpAjax','$location','$q','$timeout','$log','$sce',
    '$mpBizInfo','$mpMenuTypes','$mpMenuItem','$mpPromotion','$mpCustomerFavoriteMenuItems','$mpMyTable','$mpCustomerFavoriteBusiness',
    '$mpCustomer',
    function(
        $rootScope,$scope,$routeParams,$mpAjax,$location,$q,$timeout,$log,$sce,
         $mpBizInfo,$mpMenuTypes,$mpMenuItem,$mpPromotion,$mpCustomerFavoriteMenuItems,$mpMyTable,$mpCustomerFavoriteBusiness,
         $mpCustomer
    )
{

    //var googleSEO = [];
    //googleSEO.titleContent = '厨目 - 手掌上的点餐时代';
    //googleSEO.descriptionContent = '';
    //$rootScope.setGoogleSEO(googleSEO);

    var L = $rootScope.L;

    $scope.bizKey = $routeParams.bizKey ? $routeParams.bizKey : $rootScope.bizKey;

    $scope.$mpBizInfo = $mpBizInfo;
    //$scope.$mpMenuTypes = $mpMenuTypes;
    //$scope.$mpMenuItem = $mpMenuItem;
    $scope.$mpCustomerFavoriteMenuItems = $mpCustomerFavoriteMenuItems;
    $scope.curDate = moment().format($rootScope.todaySdateFormat);

    $mpBizInfo.init($scope.bizKey).then(function(){
        TranslateBizInformation();
        $q.all([
            $mpMenuTypes.init($mpBizInfo.getItem('biz_id')),
            $mpMenuItem.init('/prod/'+$mpBizInfo.getItem('biz_id')+'/prodWithComment?active=1'),
            $mpPromotion.init('/biz/'+$mpBizInfo.getItem('biz_id')+'/promoNow')
        ]) .then(function(){

            var depth_of_object = 2;
            $mpPromotion.GetDiscount($mpMenuItem.getData(),depth_of_object);
            var menuItems = $mpMenuItem.getData();
            $scope.specialItems = [];
            //handle null img_url
            for(var i=0;i<menuItems.length;++i) {
                if(menuItems[i].special==1) {
                    $scope.specialItems.push(menuItems[i]);
                }
            }

            $scope.edit = {};
            $scope.edit.more_less = false;
            $scope.promotions = $mpPromotion.getData();

            if($rootScope.coords && $rootScope.coords.latitude) {
                var distance = GetDistance($rootScope.coords.latitude,$rootScope.coords.longitude, $mpBizInfo.getItem('latitude'), $mpBizInfo.getItem('longitude'));
                if(!_.isNaN(distance))
                    $scope.distance = distance;
            }

            //console.log($scope.$mpBizInfo._data);
            $scope.FBshare_dataObj={name:'1',type:'1',description:'1',image:'1'};
            if ($scope.$mpBizInfo._data.img_url_l == '/image/restaurant_icon_600.png') {
                $scope.FBshare_dataObj.name = 'A Chumuu recommended Restaurant';
                $scope.FBshare_dataObj.type = 'restaurant';
                $scope.FBshare_dataObj.description = 'Find nearby restaurants with the most reliable business information';
                $scope.FBshare_dataObj.image = 'http://chumuu.com/customer/image/Homepage-pic01_n.jpg';
            }
            else {
                $scope.FBshare_dataObj.name = $scope.$mpBizInfo._data.fullName;
                $scope.FBshare_dataObj.type = 'restaurant';
                $scope.FBshare_dataObj.description = $scope.$mpBizInfo._data.desc;
                $scope.FBshare_dataObj.image = $scope.$mpBizInfo._data.img_url_l;
            }

            var googleSEO = [];
            googleSEO.titleContent = '厨目 - 手掌上的点餐时代';
            googleSEO.descriptionContent =  $scope.$mpBizInfo._data.desc;
            $rootScope.setGoogleSEO(googleSEO);
        });

        $mpCustomer.onBaseDataLoaded(function(){
            $mpCustomerFavoriteBusiness.init($mpCustomer.getItem('customer_id')).then(function(data){
                $scope.isMyFavorite = _.find(data,{biz_id:$mpBizInfo.getItem('biz_id')}) ? true : false;

                $scope.favoriteCount = $scope.isMyFavorite ? $mpBizInfo.getItem('extraFavoriteCount') - 1 :  $mpBizInfo.getItem('extraFavoriteCount');

                $scope.onToggleFavoriteBiz = function() {
                    if($scope.isMyFavorite) {
                        $mpCustomerFavoriteBusiness.unFavorite($mpCustomer.getItem('customer_id'),$mpBizInfo.getItem('biz_id')).then(function(){
                            SuccessBox(L.unfavorite_success);
                        });
                    }
                    else {
                        $mpCustomerFavoriteBusiness.favorite($mpCustomer.getItem('customer_id'),$mpBizInfo.getItem('biz_id')).then(function(){
                            SuccessBox(L.favorite_success);
                        });
                    }
                    $scope.isMyFavorite = !$scope.isMyFavorite;
                };
            });
            //$mpCustomerFavoriteMenuItems.init($mpCustomer.getItem('customer_id')).then(function(data){
            //    $scope.favoriteProdArray = data;
            //});
        });
    }).catch(function(error){
        $log.error('$log',error);
    });
    $mpBizInfo.getFavoriteCount();
    $mpBizInfo.getRating();
   // $mpBizInfo.getYelpInfo();
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
        if($mpBizInfo.getItem('extraPicWall').length>0){
            var shareImg=$mpBizInfo.getItem('extraPicWall')[0].img_url_l;
            $rootScope.isToGetTicket(sharePath,shareName,shareDesc,shareImg);
        }else{
            var shareImg=window.location.protocol + '//' + window.location.host+'/image/restaurant_icon_240.png';
            $rootScope.isToGetTicket(sharePath,shareName,shareDesc,shareImg);
        }
    });

    $scope.onSliderLoaded = function() {
        //.dots will be created every time after Slider(), bizes have different count of sliders.
        $('.banner .dots').remove();
        //set style to avoid error below
        //Resource interpreted as Image but transferred with MIME type text/html: "http://localhost:8080/%7B%7BbizImg.img_url_m%7D%7D".
        $('.banner>ul>li').each(function(i){
            this.style.backgroundImage = "url('"+$scope.pics[i].img_url_l+"')";
        });
        Slider();
    };

    $scope.openUrl = function(){
        window.open($mpBizInfo.getItem('website'), '_blank','height=700,width=1000');
    };

    function TranslateBizInformation() {
        $scope.services = [];
        //image-url, color-class, text
        var serviceArr = [
            ['reservations','reserve', L.serv_take_reservation],
            ['root_private','room', L.serv_private_room],
            ['seating_outdoor','outdoor', L.serv_outdoor_seating],
            ['parking','parking', L.serv_free_parking],
            ['wifi','wifi', L.serv_free_wifi],
            ['cash','cash', L.serv_cash_only]
        ];
        _.forEach(serviceArr, function(_s){
            var serviceFlag = $mpBizInfo.getItem(_s[0]) ? 'green':'gray';
            $scope.services.push({
                img_url:'/image/icon/icon_'+_s[1]+'_'+serviceFlag+'.png',
                class:'service_'+serviceFlag,
                text: _s[2]
            });
        });

        $scope.hoursDisplay = [];
        _.forEach($mpBizInfo.getItem('hoursDisplay'),function(_h,i){
            var html = $scope.$mpBizInfo.getItem('hoursDisplay')[i];
            var _index = html.indexOf(' ');
            if(html.indexOf('Open')==0) {
                _index = html.indexOf(' ',_index+1);
            }
            $scope.hoursDisplay[i] = $sce.trustAsHtml('<span style="color:orange;">' + html.substring(0,_index) + '</span>' + html.substring(_index));
        });
    }

    //to menu
    $scope.toMenuList=function () {
        $rootScope.navTo('restaurant/'+$scope.bizKey+'/menu');
    };

    window.setTimeout(function(){
        $(document).scrollTop(0);
    },100)
}] );

