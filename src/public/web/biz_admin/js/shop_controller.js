/**
 * Created by Josh on 2/8/16.
 */


app.controller("shopController", ['$rootScope','$scope','$routeParams','$mpAjax','$location','$mp_json','$cookieStore','$timeout','$q',
    '$mpAdminBizList',
    function($rootScope,$scope,$routeParams,$mpAjax,$location,$mp_json,$cookieStore,$timeout,$q,
             $mpAdminBizList
        ) {

        console.log("shop_controller.js");

        //$scope.shop_tabs = {
        //    id:'shop_tab',
        //    tabs: [
        //        {
        //            name: '列表',
        //            icon: 'icon-th-list',
        //            active: true
        //        }
        //    ],
        //    on_loaded: null
        //};
        //$scope.$on('shop.switch_to_tab',function(event,msg){
        //    $scope.shop_tabs.change_tab(msg.index);
        //});

        OnViewLoad();
    }] );

app.controller("shopListController", ['$rootScope','$scope','$routeParams','$mpAjax','$location','$mp_json','$cookieStore','$timeout','$q',
    '$mpAdminBizList',
    function($rootScope,$scope,$routeParams,$mpAjax,$location,$mp_json,$cookieStore,$timeout,$q,
             $mpAdminBizList
        ) {

        $scope.$mpAdminBizList = $mpAdminBizList;
        //Ken: GC is defined in Coffee/js/config.js/admin/:adminId/biz/:bizId
        $mpAdminBizList.init('/admin/' + $rootScope.adminId + '/biz').then(function(data) {
            ;
        });
        console.log($scope.$mpAdminBizList);

        $scope.onBtnAddShop = function() {
            //$rootScope.$broadcast('shop.item_detail.add',{});
            $rootScope.navTo('add_shop');
        };

        $scope.showShopDetail = function(item) {
            //$rootScope.$broadcast('shop.item_detail.show',{item:item});
            //$rootScope.$broadcast('shop_detail.show',{item:item});
            $rootScope.navTo('shop_detail/'+item.biz_id);
        };

        $scope.onResetElasticSearchBizData = function() {
            $mpAjax.get('/cust/do/createWechatBizIndex').then(function(data){
                if(data.success) {
                    SuccessBox('更新成功');
                }
                else {
                    WarningBox('更新失败');
                }
            }).catch(function(error){
                ErrorBox('更新出错');
            });
        };

        OnViewLoad();
    }] );
