/**
 * Created by Josh on 2/18/16.
 */

app.controller("invoiceController", ['$rootScope','$scope','$routeParams','$mpAjax','$location','$mp_json','$cookieStore','$timeout','$q',
    '$mpComplaint',
    function($rootScope,$scope,$routeParams,$mpAjax,$location,$mp_json,$cookieStore,$timeout,$q,
             $mpComplaint
        ) {

        console.log("complaint_controller.js");

        $scope.tabs = {
            id:'complaint_tab',
            tabs: [
                {
                    name: '帐单列表',
                    icon: 'icon-th-list',
                    active: true
                }
            ],
            on_loaded: null
        };
        $scope.$on('switch_to_tab',function(event,msg){
            $scope.tabs.change_tab(msg.index);
        });

        OnViewLoad();
    }] );

app.controller("invoiceListController", ['$rootScope','$scope','$routeParams','$mpAjax','$location','$mp_json','$cookieStore','$timeout','$q',
    '$mpComplaint','$mpBizInfo','$mpInvoice',
    function($rootScope,$scope,$routeParams,$mpAjax,$location,$mp_json,$cookieStore,$timeout,$q,
             $mpComplaint,$mpBizInfo,$mpInvoice
        ) {
        $scope.hasPreviousPage = false;
        $scope.hasNextPage = false;
        $scope.searchPageNo = 1;
        $scope.searchPageSize = 50;

        $scope.$mpComplaint = $mpComplaint;

        $scope.$mpInvoice = $mpInvoice;

        function LoadInvoicePromise() {
            $scope.searchPageSize = parseInt($scope.searchPageSize);
            return $mpInvoice.init({pageNo:$scope.searchPageNo,pageSize:$scope.searchPageSize}).then(function(data){
                $scope.hasNextPage = data.length>$scope.searchPageSize;
                $scope.hasPreviousPage = $scope.searchPageNo>1;
            });
        }

        $mpBizInfo.onBaseDataLoaded(function(){
            LoadInvoicePromise();
        });

        $scope.$watch('searchPageSize',function(to,from){
            if(_.isString(to))
                LoadInvoicePromise();
        });

        $scope.onBtnPageTo = function(key) {
            var isCanLoad = false;
            switch(key) {
                case 'previous':
                    if($scope.hasPreviousPage) {
                        $scope.searchPageNo--;
                        isCanLoad = true;
                    }
                    break;
                case 'next':
                    if($scope.hasNextPage) {
                        $scope.searchPageNo++;
                        isCanLoad = true;
                    }
                    break;
                default:;
            }
            if(isCanLoad)
                LoadInvoicePromise();
        };


        $scope.showDetail = function (item) {
            $rootScope.$broadcast('invoice.detail.show', {item: item});
        };

        OnViewLoad();
    }] );

app.controller("invoiceDetailController", ['$rootScope','$scope','$routeParams','$mpAjax','$location','$mp_json','$cookieStore','$timeout','$q',
    '$mpComplaint','$mpBizInfo','$mpInvoice',
    function($rootScope,$scope,$routeParams,$mpAjax,$location,$mp_json,$cookieStore,$timeout,$q,
             $mpComplaint,$mpBizInfo,$mpInvoice
        ) {
        var $page = $scope.$parent;
        $scope.$mpComplaint = $mpComplaint;
        $mpBizInfo.onBaseDataLoaded(function(){
        });

        function SwitchTab(tab_name) {
            if (!$page.tabs.tabs[1]) {
                $page.tabs.on_loaded = function () {
                    $rootScope.$broadcast('switch_to_tab', {index: 1});
                };
                $page.tabs.tabs.push({name: tab_name, icon: 'icon-inbox'});
            }
            else {
                $page.tabs.tabs[1].name = tab_name;
                $rootScope.$broadcast('switch_to_tab', {index: 1});
            }
        }

        $rootScope.$on('invoice.detail.show', function (event, msg) {
            $scope.item = msg.item;
            SwitchTab($scope.item.year_week);
            if(!$scope.item.items)
                $mpInvoice.loadListByCycle($scope.item.year_week);
        });

        OnViewLoad();
    }] );