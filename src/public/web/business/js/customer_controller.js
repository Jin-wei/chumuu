/**
 * Created by Ken on 2014-4-18.
 */

app.controller("customerController", ['$rootScope','$scope','$routeParams','$mp_ajax','$location','$mp_json','$cookieStore',function($rootScope,$scope,$routeParams,$mp_ajax,$location,$mp_json,$cookieStore) {

    console.log("customerController");
    var L = $rootScope.L;

    $scope.ORDER_TYPE = {
        DINE_IN:1,
        TOGO:2,
        DESC : {
            1: L.order_type_1,
            2: L.order_type_2
        }
    };

    $scope.customers_tabs = {
        id:'customer_tab',
        tabs: [
            {
                name: L.menu_customer,
                icon: 'icon-group',
                active: true
            },
            {
                name: L.customer_detail,
                icon: 'icon-inbox'
            }
        ]
    };
    $scope.$on('customer.switch_to_tab',function(event,msg){
        $scope.customers_tabs.change_tab(msg.index);
    });
    //move page-content a little bit down in case of tabs cover part of it
    OnViewLoad();
}] );

app.controller("customerListController", ['$rootScope','$scope','$routeParams','$mp_ajax','$location','$mp_json','$cookieStore',function($rootScope,$scope,$routeParams,$mp_ajax,$location,$mp_json,$cookieStore) {

    console.log("customerListController");

    var $parent = $scope.$parent;
    var $page = $scope.$parent;
    $scope.customerKeyword = [];

    $mp_ajax.get('/biz/' + $rootScope.bizId + '/orderCustomer', function (data) {
        console.log("I got orderCustomer data!");
        $scope.customers = data;
        _.forEach($scope.customers, function (item) {
            if (item.address && item.city && item.state && item.zipcode) {
                item.full_address = item.address + ', ' + item.city + ', ' + item.state + ' ' + item.zipcode;
            }
            else if (item.address && item.city && item.state && !(item.zipcode)) {
                item.full_address = item.address + ', ' + item.city + ', ' + item.state;
            }
            else
                item.full_address = '';
        });
        $scope.customers_by_filter = $scope.customers;
    });

    $scope.$watch('customerKeyword',function(to,from){

        if ($scope.customerKeyword){
            $scope.customers_by_filter = [];
            for (var i in $scope.customers){
                var fullName_firstName_first = $scope.customers[i].first_name + ' ' + $scope.customers[i].last_name;
                var fullName_lastName_first = $scope.customers[i].last_name + ' ' + $scope.customers[i].first_name;
                if (
                    $scope.customers[i].first_name.toLowerCase().indexOf($scope.customerKeyword.toLowerCase()) >= 0 ||
                    $scope.customers[i].last_name.toLowerCase().indexOf($scope.customerKeyword.toLowerCase()) >= 0 ||
                    fullName_firstName_first.toLowerCase().indexOf($scope.customerKeyword.toLowerCase()) >= 0 ||
                    fullName_lastName_first.toLowerCase().indexOf($scope.customerKeyword.toLowerCase()) >= 0 ||
                    $scope.customers[i].phone_no.indexOf($scope.customerKeyword) >= 0 ||
                    $scope.customers[i].email.toLowerCase().indexOf($scope.customerKeyword.toLowerCase()) >= 0 ||
                    $scope.customers[i].address.toLowerCase().indexOf($scope.customerKeyword.toLowerCase()) >= 0 ||
                    $scope.customers[i].city.toLowerCase().indexOf($scope.customerKeyword.toLowerCase()) >= 0 ||
                    $scope.customers[i].state.toLowerCase().indexOf($scope.customerKeyword.toLowerCase()) >= 0 ||
                    $scope.customers[i].zipcode.indexOf($scope.customerKeyword) >= 0 ||
                    $scope.customers[i].full_address.toLowerCase().indexOf($scope.customerKeyword.toLowerCase()) >= 0)
                {
                    $scope.customers_by_filter.push($scope.customers[i]);
                }
            }
        }
        else
            $scope.customers_by_filter = $scope.customers;
        console.log($scope.customers_by_filter);
    });

    $scope.showCustomerDetail = function(customer) {
        $rootScope.$broadcast('customer.detail.show',{customer:customer});
        $rootScope.$broadcast('customer.switch_to_tab',{index:1});
    }

    //move page-content a little bit down in case of tabs cover part of it
    OnViewLoad();
}] );

app.controller("customerDetailController", ['$rootScope','$scope','$routeParams','$mp_ajax','$location','$mp_json','$cookieStore',function($rootScope,$scope,$routeParams,$mp_ajax,$location,$mp_json,$cookieStore) {

    console.log("customerDetailController");

    var $parent = $scope.$parent;
    var $page = $scope.$parent;


    $scope.onBack = function() {
        $rootScope.$broadcast('customer.switch_to_tab',{index:0});
    };



    $scope.$on('customer.detail.show', function(event,msg){
        $scope.customer = msg.customer;
        $rootScope.$broadcast('customer.switch_to_tab',{index:1});

        $mp_ajax.get('/biz/' + $rootScope.bizId + '/order?custId=' + $scope.customer.cust_id,function(data){
            console.log("I got customerDetail data!");
            $scope.customer_orders = data;
            _.forEach($scope.customer_orders, function(item){
                if (item.status_info == 'Pending'){
                    item.status_info = $page.L.order_status_100;
                }
                if (item.status_info == 'Cancelled'){
                    item.status_info = $page.L.order_status_101;
                }
                if (item.status_info == 'Confirmed'){
                    item.status_info = $page.L.order_status_102;
                }
                if (item.status_info == 'In Progress'){
                    item.status_info = $page.L.order_status_103;
                }
                if (item.status_info == 'Completed'){
                    item.status_info = $page.L.order_status_104;
                }
                if (item.status_info == 'Expired'){
                    item.status_info = $page.L.order_status_109;
                }
            });

            console.log($scope.customer_orders);
        });

        $mp_ajax.get('/biz/' + $rootScope.bizId + '/cust/' + $scope.customer.cust_id + '/bizCustRel', function(data){
            console.log("I got bizCustRel!");
            $scope.relation = data;
            $scope.commentOnCustomer = $scope.relation[0].comment;
        });

        $scope.onCustomerNotesSubmit = function(comment) {
            var param = {
                "comment": comment
            }
            if (comment.length <= 100) {
                $mp_ajax.put('/biz/' + $rootScope.bizId + '/cust/' + $scope.customer.cust_id + '/custComment', param,function (data) {
                    SuccessBox($page.L.customer_comment_success_text);
                });
            }
            else
                WarningBox($page.L.customer_comment_warning_text);
        };
    });

    //move page-content a little bit down in case of tabs cover part of it
    OnViewLoad();
}] );