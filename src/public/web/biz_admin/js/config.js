/**
 * Created by Josh on 2/8/16.
 */


app.config(['$routeProvider','$locationProvider',function($routeProvider,$locationProvider) {
//    $locationProvider.html5Mode(true);
    $routeProvider
        .when('/', {
            redirectTo:function(current, path, search) {
                if (search.path) {
                    // if we were passed in a search param, and it has a path
                    // to redirect to, then redirect to that path
                    return search.path;
                }
                else {
                    // else just redirect back to this location
                    // angular is smart enough to only do this once.
                    return "shop"
                }
            }
        })

        .when('/shop', {
            templateUrl: './biz_admin/view/_shop.html',
            controller: 'shopController'
        })
        /*.when('/menu', {
            templateUrl: './biz_admin/view/_menu.html',
            controller: 'menuController'
        })*/
        .when('/order', {
            templateUrl: './biz_admin/view/_order.html',
            controller: 'orderController'
        })
        .when('/shop_detail/:id', {
            templateUrl: './biz_admin/view/_shop_detail.html',
            controller: 'shopDetailController'
        })
        .when('/add_shop/', {
            templateUrl: './biz_admin/view/_shop_add_update.html',
            controller: 'shopAddUpdateController'
        })
        .when('/update_shop/:id', {
            templateUrl: './biz_admin/view/_shop_add_update.html',
            controller: 'shopAddUpdateController'
        })
        /*.when('/complaint', {
            templateUrl: './biz_admin/view/_complaint.html',
            controller: 'complaintController'
        })*/
        .when('/invoice', {
            templateUrl: './biz_admin/view/_invoice.html',
            controller: 'invoiceController'
        })
        .when('/setting', {
            templateUrl: './biz_admin/view/_setting.html',
            controller: 'settingController'
        })
        .when('/inuseqrcode', {
            templateUrl: './biz_admin/view/_qrcode.html',
            controller: 'qrcodeController'
        })
        .when('/unuseqrcode', {
            templateUrl: './biz_admin/view/_unuse_qrcode.html',
            controller: 'unuseQrcodeController'
        })
        .otherwise({
            templateUrl: './biz_admin/view/_shop.html',
            controller: 'shopController'
        });
}]);