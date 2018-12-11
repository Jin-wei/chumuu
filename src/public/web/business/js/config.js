/**
 * Created by md on 14-8-22.
 */

app.config(['$routeProvider','$locationProvider',function($routeProvider,$locationProvider) {
//    $locationProvider.html5Mode(true);
    $routeProvider
        /*.when('/add_business', {
            templateUrl: './business/view/_add_business.html',
            controller: 'addBusinessController'
        })*/
        /*.when('/multi_business', {
         templateUrl: './business/view/_multi_business.html',
         controller: 'MultiBusinessController'
         })*/
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
                    return "profile"
                }
            }
        })
//        .when('/business.html', {
//            redirectTo:function(current, path, search) {
//                if (search.path) {
//                    // if we were passed in a search param, and it has a path
//                    // to redirect to, then redirect to that path
//                    return search.path;
//                }
//                else {
//                    // else just redirect back to this location
//                    // angular is smart enough to only do this once.
//                    return "profile"
//                }
//            }
//        })
        .when('/profile', {
            templateUrl: './business/view/_profile.html',
            controller: 'profileController'
        })
        .when('/menu', {
            templateUrl: './business/view/_menu.html',
            controller: 'menuController'
        })
        .when('/menu-add/:typeId', {
            templateUrl: './business/view/_menu_add_update.html',
            controller: 'menuAddAndUpdateController'
        })
        .when('/menu-type', {
            templateUrl: './business/view/_menu_type.html',
            controller: 'menuTypeController'
        })
        .when('/menu-update/:menuItemId', {
            templateUrl: './business/view/_menu_add_update.html',
            controller: 'menuAddAndUpdateController'
        })
        .when('/order', {
            templateUrl: './business/view/_order.html',
            controller: 'orderController'
        })
        .when('/customer', {
            templateUrl: './business/view/_customer.html',
            controller: 'customerController'
        })
        .when('/promotion', {
            templateUrl: './business/view/_promotion.html',
            controller: 'promotionController'
        })
        .when('/promotion/:menuItemId', {
            templateUrl: './business/view/_promotion.html',
            controller: 'promotionController'
        })
        .when('/promotion-add', {
            templateUrl: './business/view/_promotion_add_update.html',
            controller: 'promotionAddAndUpdateController'
        })
        .when('/promotion-add/:menuItemId', {
            templateUrl: './business/view/_promotion_add_update.html',
            controller: 'promotionAddAndUpdateController'
        })
        .when('/promotion-update/:promotionId', {
            templateUrl: './business/view/_promotion_add_update.html',
            controller: 'promotionAddAndUpdateController'
        })
        .when('/insight', {
            templateUrl: './business/view/_insight.html',
            controller: 'insightController'
        })
        .when('/editHours', {
            templateUrl: './business/view/_profile_hours_edit.html',
            controller: 'profileHoursController'
        })
        .when('/about-us', {
            templateUrl: './view/_about_us.html',
            controller: 'aboutusController'
        })
        .when('/contact-us', {
            templateUrl: './view/_contact_us.html',
            controller: 'contactusController'
        })
        .when('/terms', {
            templateUrl: './view/_terms.html',
            controller: 'termsController'
        })
        .when('/privacy-policy', {
            templateUrl: './view/_privacy_policy.html',
            controller: 'privacyPolicyController'
        })
        .when('/setting', {
            templateUrl: './business/view/_setting.html',
            controller: 'settingController'
        })
        .when('/order-list', {
        templateUrl: './business/view/_order_list.html',
        controller: 'orderListController'
        })
        .when('/order-list-detail', {
            templateUrl: './business/view/_order_list_detail.html',
            controller: 'orderListDetailController'
        })
        .otherwise({
            templateUrl: './business/view/_profile.html',
            controller: 'profileController'
        });
}]);
