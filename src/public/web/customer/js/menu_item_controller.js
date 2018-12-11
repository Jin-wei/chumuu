/**
 * Created by Ken on 2014-4-18.
 */
app.controller(
    "menuItemController",
    ['$rootScope', '$scope', '$routeParams', '$mpAjax', '$location', '$q', '$timeout', '$log', '$sce',
        '$mpBizInfo', '$mpMenuTypes', '$mpMenuItem', '$mpPromotion', '$mpCustomerFavoriteMenuItems', '$mpMyTable','$mpMenuItemRating','$mpMenuItemComment',
        '$mpCustomer',
        function ($rootScope, $scope, $routeParams, $mpAjax, $location, $q, $timeout, $log, $sce,
                  $mpBizInfo, $mpMenuTypes, $mpMenuItem, $mpPromotion, $mpCustomerFavoriteMenuItems, $mpMyTable,$mpMenuItemRating,$mpMenuItemComment,
                  $mpCustomer
        )
{
    $log.debug('menu_item_controller.js');
    var L = $rootScope.L;

    $scope.bizKey = $routeParams.bizKey ? $routeParams.bizKey : $rootScope.bizKey;
    $scope.scrollTop = $location.search().scrollTop ? $location.search().scrollTop : 0;
    $scope.menuType = $location.search().type ? $location.search().type : '';
    $scope.menuItemId = parseInt($routeParams.menuItemId);
    $scope.star = {rating:0};
    $scope.comment = {rating:0, comment:''};


    //Ken 2015-04-22: try new idea
    $mpBizInfo.init($scope.bizKey,{forceReload:false}).then( DataTranslationAndBinding );

    $mpMenuItemRating.init($scope.menuItemId).then(function(){
        $scope.$mpMenuItemRating = $mpMenuItemRating;
    });

    $mpMenuItemComment.init($scope.menuItemId).then( TranslateMenuItemComments );

    $mpCustomer.onBaseDataLoaded(function(){
        $mpCustomerFavoriteMenuItems.init($mpCustomer.getItem('customer_id')).then(function(data){
            console.log(data);
            $scope.isMyFavorite = _.find(data,{prod_id:$scope.menuItemId}) ? true : false;
            $scope.onToggleFavoriteProd = function() {
                if($scope.isMyFavorite) {
                    $mpCustomerFavoriteMenuItems.unFavorite($mpCustomer.getItem('customer_id'),$scope.menuItemId).then(function(){
                        SuccessBox('UnFavorite Success');
                    });
                }
                else {
                    $mpCustomerFavoriteMenuItems.favorite($mpCustomer.getItem('customer_id'),$scope.menuItemId).then(function(){
                        SuccessBox('Favorite Success');
                    });
                }
                $scope.isMyFavorite = !$scope.isMyFavorite;
            };
        });
        //$mpCustomerFavoriteMenuItems.init($mpCustomer.getItem('customer_id')).then(function(data){
        //    $scope.favoriteProdArray = data;
        //});
    });

    function DataTranslationAndBinding() {
        $scope.$mpBizInfo = $mpBizInfo;
        var loadMenuItemPromise = $mpMenuItem.loadById($mpBizInfo.getItem('biz_id'),$scope.menuItemId).then(function() {
            var depth_of_object = 1;
            $mpPromotion.GetDiscount($mpMenuItem.getData(),depth_of_object);
            $scope.menuItem = $mpMenuItem.getData();
            $rootScope.backToCurrentType=$scope.menuItem.type;


            var sharePath=$location.$$path;
            var shareName=$mpBizInfo.getItem('name')+' - '+$scope.menuItem.productName;
            var shareDesc= $scope.menuItem.description;
            if(shareDesc==''){
                shareDesc=$mpBizInfo.getItem('desc');
            }
            if($scope.menuItem.img_url!=null){
                var shareImg=$scope.menuItem.img_url_l;
                $rootScope.isToGetTicket(sharePath,shareName,shareDesc,shareImg);
            }else{
                var shareImg=window.location.protocol + '//' + window.location.host+'/image/restaurant_icon.png';
                $rootScope.isToGetTicket(sharePath,shareName,shareDesc,shareImg);
            }
            //console.log($scope.menuItem);

            $scope.FBshare_dataObj={name:'1',type:'1',description:'1',image:'1'};
            if ($scope.menuItem.img_url_l == '/image/default_item_pic_600.png') {
                $scope.FBshare_dataObj.name = 'A chumuu recommended Dish';
                $scope.FBshare_dataObj.type = 'dish';
                $scope.FBshare_dataObj.description = 'Help you make the right choices for a fine dining experience you won’t regret';
                $scope.FBshare_dataObj.image = 'http://chumuu.com/customer/image/Homepage-pic04_n.jpg';
            }
            else {
                $scope.FBshare_dataObj.name = $scope.menuItem.productName;
                $scope.FBshare_dataObj.type = 'dish';
                $scope.FBshare_dataObj.description = $scope.menuItem.name_lang;
                $scope.FBshare_dataObj.image = $scope.menuItem.img_url_l;
            }
        });

        $q.all([
            loadMenuItemPromise,
            $mpPromotion.loadByProd($mpBizInfo.getItem('biz_id'),$scope.menuItemId)
        ]).then(function () {
        });

        $mpCustomer.onBaseDataLoaded(function(){
            $mpCustomerFavoriteMenuItems.init($mpCustomer.getItem('customer_id')).then(function () {
                $scope.$mpCustomerFavoriteMenuItems = $mpCustomerFavoriteMenuItems;
            });
        });
    }

    function TranslateMenuItemComments() {
        _.forEach($mpMenuItemComment.getData(),function(c){
            c.fullName = "";
            if (!c.first_name && !c.last_name) {
                c.fullName = c.username;
            }
            if(c.first_name)
                c.fullName += c.first_name;
            if(c.last_name) {
                c.fullName += ',';
                if(c.last_name.length>3) {
                    c.fullName += c.last_name.substring(0, c.last_name.length-3)+'***';
                }
                else {
                    c.fullName += '***';
                }
            }
            c.fullAddress = "";
            if ($rootScope.isCN) {
                if(c.cstate) c.fullAddress += ","+c.cstate;
                if(c.city) c.fullAddress += ","+c.city;
                if(c.fullAddress!=undefined){
                    c.fullAddress = c.fullAddress.substring(1);
                }
            }
            else {
                if(c.city) c.fullAddress += ","+c.city;
                if(c.cstate) c.fullAddress += ","+c.cstate;
                c.fullAddress += ","+ "USA";
                if(c.fullAddress!=undefined){
                    c.fullAddress = c.fullAddress.substring(1);
                }

            }

            //$log.debug(c.fullName, c.fullAddress);
        });
        $scope.$mpMenuItemComment = $mpMenuItemComment;
        //$log.debug($mpMenuItemComment.getData());
    }

    $scope.submitComment = function(isFormValid) {
        if(!$rootScope.isLogin) {
            window.location.href = 'customer/login.html?preUrl='+$location.path();
        }
        if(!isFormValid) {
            WarningBox(L.review_box_text_warning);
            return false;
        }
        if($scope.star.rating<1) {
            WarningBox(L.rating_warning_text_1);
            return false;
        }
        if($scope.comment.comment.trim().length==0) {
            WarningBox(L.rating_warning_text_2);
            return false;
        }
        $scope.comment.rating = $scope.star.rating;
        $mpMenuItemComment.add($mpCustomer.getItem('customer_id'),$scope.menuItemId,$scope.comment)
            .then(function(data){
                var tmpComment = {};
                angular.copy($scope.comment,tmpComment);
                tmpComment.id = data.id;
                tmpComment.createTime = new Date();
                tmpComment.city = $mpCustomer.getItem('city');
                tmpComment.cstate = $mpCustomer.getItem('state');
                tmpComment.first_name = $mpCustomer.getItem('first_name');
                tmpComment.last_name = $mpCustomer.getItem('last_name');
                tmpComment.cust_id =  $mpCustomer.getItem('customer_id');
                tmpComment.isNew = true;
                $mpMenuItemComment.getData().unshift(tmpComment);
                TranslateMenuItemComments();
            }).catch(function(error){
                $log.error('$log',error);
        });

        document.getElementById("commentContent").value = "";
        $scope.$mpMenuItemComment = $mpMenuItemComment;
        $scope.star.rating = 0;
    };

    $scope.deleteComment = function(comment,index) {
        $( "#dialog-confirm" ).removeClass('hide').dialog({
            resizable: false,
            modal: true,
            buttons: [
                {
                    html: "<i class='icon-trash bigger-110'></i>&nbsp;" + L.delete,
                    "class" : "btn btn-danger btn-xs",
                    click: function() {
                        var confirmDlg = $( this );
                        $mpMenuItemComment.delete($mpCustomer.getItem('customer_id'),comment.id)
                            .then(function(){
                                confirmDlg.dialog( "close" );
                                $mpMenuItemComment.getData().splice(index,1);
                            });
                    }
                }
                ,
                {
                    html: "<i class='icon-remove bigger-110'></i>&nbsp;" + L.cancel,
                    "class" : "btn btn-xs",
                    click: function() {
                        $( this ).dialog( "close" );
                    }
                }
            ]
        });
    };

    $scope.jumpToLogin = function () {
        window.location.href ='top-dish-old?login=1&preUrl=' + $location.path();
    };

    $scope.backToCurrentType = function () {
        $rootScope.backToCurrentType=$scope.menuItem.type;
        if($scope.scrollTop>0){
            $rootScope.navTo('restaurant/'+$mpBizInfo.getItem('bizKey')+'/menu' + '?type=' + $scope.menuItem.type + '&scrollTop=' + $scope.scrollTop);
        }else {
            $rootScope.navTo('restaurant/'+$mpBizInfo.getItem('bizKey')+'/menu' + '?type=' + $scope.menuItem.type);
        }
    };

    $(function () {
        window.setTimeout(function () {
            $(document).scrollTop(0);
        },1000);
    })

    jQuery(document).ready(function(){
        OnViewLoad();
    });
}]);

