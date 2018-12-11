/**
 * Created by Ken on 2014-4-18.
 */
function Play() {
    var Page = (function() {
        var $navArrows = $( '#nav-arrows' ).hide(),
            $navOptions = $( '#nav-options' ).hide(),
            $shadow = $( '#shadow' ).hide(),
            slicebox = $( '#sb-slider' ).slicebox( {
                onReady : function() {
                    $navArrows.show();
                    $navOptions.show();
                    $shadow.show();
                },
                orientation : 'h',
                cuboidsCount : 3
            } ),
            init = function() {
                initEvents();
            },
            initEvents = function() {
                // add navigation events
                $navArrows.children( ':first' ).on( 'click', function() {
                    slicebox.next();
                    return false;
                } );
                $navArrows.children( ':last' ).on( 'click', function() {
                    slicebox.previous();
                    return false;
                } );
                $( '#navPlay' ).on( 'click', function() {
                    slicebox.play();
                    return false;
                } );
                $( '#navPause' ).on( 'click', function() {
                    slicebox.pause();
                    return false;
                } );
            };
        return {
            init : init,
            slicebox : slicebox
        };
    })();

    Page.init();
    Page.slicebox.play();
}
function Slider(options) {
    $('.banner li').css('background-size', 'cover');
    $('.banner li').css('background-position', 'center center');

    var unslider = $('.banner').unslider({
        fluid: options && typeof (options.fluid) ==='boolean' ? options.fluid : true,
        dots: true,
        speed: 500
    });
    $('.banner').on('swipeleft', function(e) {
        unslider.prev();
    }).on('swiperight', function(e) {
        unslider.next();
    });
    //  Find any element starting with a # in the URL
    //  And listen to any click events it fires
//    $('a[href^="#"]').click(function() {
//        //  Find the target element
//        var target = $($(this).attr('href'));
//
//        //  And get its position
//        var pos = target.offset(); // fallback to scrolling to top || {left: 0, top: 0};
//
//        //  jQuery will return false if there's no element
//        //  and your code will throw errors if it tries to do .offset().left;
//        if(pos) {
//            //  Scroll the page
//            $('html, body').animate({
//                scrollTop: pos.top,
//                scrollLeft: pos.left
//            }, 1000);
//        }
//
//        //  Don't let them visit the url, we'll scroll you there
//        return false;
//    });
}
app.controller("topDishController", ['$rootScope','$scope','$routeParams','$mp_ajax','$location','$q','$mpTopDish','$mpBizList','$log','$mpAjax',
    function($rootScope,$scope,$routeParams,$mp_ajax,$location,$q,$mpTopDish,$mpBizList,$log,$mpAjax) {
        $rootScope.setTitleEx('Chumuu Home Page');
        $log.debug("top_dish_controller.js");
        var googleSEO = [];
        if ($rootScope.currency != '¥') {
            googleSEO.titleContent = 'Chumuu - Explore and order food from your local restaurants';
        }
        if ($rootScope.currency == '¥') {
            googleSEO.titleContent = '厨目 - 手掌上的点餐时代';
        }
        googleSEO.descriptionContent = 'Tru-Menu offers free online food ordering from your local restaurants on your desktop, Android, or iPhone. Save time and avoid waiting when you order to go or dine in.';
        googleSEO.keywordsContend = 'Tru-Menu,restaurant,true menu, dish, dine in, to go, 中餐馆，堂吃点餐，外卖点餐';
        $rootScope.setGoogleSEO(googleSEO);
//    Play();
        Slider();

//    $scope.$mpTopDish = $mpTopDish;
//    $scope.$mpTopDish.init();

        //to pass down to login controller
        $rootScope.isLoginBoxDisplay = $location.$$search.login ? true : false;
        $rootScope.isAutoLogin=(($location.$$search.t!=null && $location.$$search.p!=null) || $location.$$search.q!=null);

        if ($rootScope.isAutoLogin) {
            $rootScope.autoLoginUserName = $location.$$search.t;
            $rootScope.autoLoginPassword = $location.$$search.p;
            $rootScope.autoLoginQR = $location.$$search.q;
        }

        $rootScope.isToGetTicket();
        $scope.$mpBizList = $mpBizList;
        $mpBizList.init().then(function(){
            var list = $mpBizList.getData();
            _.forEach(list,function(_b){
                (function(biz){
                    $mp_ajax.promiseGet('/biz/'+_b.biz_id+'/ratBizComment').then(function(data){
                        data.avg_rating = data.avg_rating || 0;
                        data.avg_ratingForStar = data.avg_rating/100*5;
                        biz.commentRating = data;
                    });
                })(_b);
                _b.meShareVideo = false;
                if (!_.isEmpty(_b.website) && _b.website.slice(13,20) == 'meshare') {
                    _b.meShareVideo = true;
                }
                if($rootScope.coords && $rootScope.coords.latitude) {
                    var distance = GetDistance($rootScope.coords.latitude,$rootScope.coords.longitude,_b.latitude,_b.longitude);
                    if(!_.isNaN(distance))
                        _b.distance = distance;
                }
            });
            // Sort by order status , remove code temperay
            // $scope.$mpBizList.sortBy('distance');
            //console.log('BizList',$mpBizList.getData());
        });

        $scope.showMenuItem = function(menuItem) {
            var biz_key = menuItem.biz_unique_name ? menuItem.biz_unique_name : menuItem.biz_id;
            $rootScope.navTo('/restaurant/'+biz_key+'/menu-item/'+menuItem.prod_id);
        };

        $scope.onShowBiz = function(biz) {
            $rootScope.navTo('/restaurant/'+biz.bizKey);
        };

        OnViewLoad();
    }] );
