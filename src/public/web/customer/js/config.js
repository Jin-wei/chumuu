/**
 * Created by md on 14-7-29.
 */


app.config(['$routeProvider','$locationProvider','$analyticsProvider',function($routeProvider,$locationProvider,$analyticsProvider) {
    $locationProvider.html5Mode(true);//.hashPrefix("!").hasba
    $routeProvider
        .when('/', {
            redirectTo:function(current, path, search) {
                if (search.path) {
                    // if we were passed in a search param, and it has a path
                    // to redirect to, then redirect to that path
                    var path = search.query ? search.path+'?'+search.query : search.path;
                    return (path);
                }
                else {
                    // else just redirect back to this location
                    // angular is smart enough to only do this once.
                    return "/home"
                }
            }
        })
        .when('/login', {
            redirectTo:function(current, path, search) {
                return 'top-dish-old?login=1';
            }
        })
        .when('/restaurant', {
            templateUrl: '/customer/view/_restaurant.html',
            controller: 'restaurantController'
        })
        .when('/restaurant/:bizKey', {
            templateUrl: '/customer/view/_restaurant.html',
            controller: 'restaurantController'
        })
        .when('/restaurant/:bizKey/comment', {
            templateUrl: './customer/view/_restaurant_comment.html',
            controller: 'restaurantCommentController'
        })
        .when('/restaurant-list', {
            templateUrl: './customer/view/_restaurant_list.html',
            controller: 'restaurantListController'
        })
        .when('/top-dish-old', {
            templateUrl: './customer/view/_top_dish.html',
            controller: 'topDishController'
        })
        .when('/myfavorite', {
            templateUrl: './customer/view/_myfavorite.html',
            controller: 'myFavoriteController'
        })
        .when('/my-table', {
            templateUrl: './customer/view/_my_table.html',
            controller: 'myTableController'
        })
        .when('/restaurant/:bizKey/menu', {
            templateUrl: './customer/view/_restaurant_menu.html',
            controller: 'restaurantMenuController'
        })
        .when('/restaurant/:bizKey/menu-item/:menuItemId', {
            templateUrl: './customer/view/_menu_item.html',
            controller: 'menuItemController'
        })
        .when('/search-result/:searchText', {
            templateUrl: './customer/view/_search_result.html',
            controller: 'searchResultController'
        })
        .when('/search-menu-name/:searchName', {
            templateUrl: './customer/view/_search_menu_name.html',
            controller: 'searchMenuNameController'
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
        .when('/feedback', {
            templateUrl: './view/_feedback.html',
            controller: 'feedbackController'
        })
        .when('/deal', {
            templateUrl: './customer/view/_deal.html',
            controller: 'dealController'
        })
        .when('/404', {
            templateUrl: './view/_page404.html',
            controller: 'page404Controller'
        })
        .when('/setting', {
            templateUrl: './customer/view/_setting.html',
            controller: 'settingController'
        })
        .when('/checkout-order', {
            templateUrl: './customer/view/_checkout_order.html',
            controller: 'checkoutOrderController'
        })
        .when('/checkout-order-success', {
            templateUrl: './customer/view/_checkout_order_success.html',
            controller: 'checkoutOrderSuccessController'
        })
        .when('/my-account', {
            templateUrl: './customer/view/_my_account.html',
            controller: 'myAccountController'
        })
        .when('/popup-auto-close', {
            templateUrl: './customer/view/_pop_up_auto_close.html'
        })
        .when('/payment', {
            templateUrl: './customer/view/_payment.html',
            controller: 'paymentController'
        })
        .when('/alipay/:orderId', {
            templateUrl: './customer/view/_alipay.html',
            controller:'alipayController'
        })
        .when('/register', {
            templateUrl: './customer/view/_register.html',
            controller: 'registerController'
        })
        .when('/forgot-password', {
            templateUrl: './customer/view/_forgot_password.html',
            controller: 'forgotPasswordController'
        })
        .when('/my-orders', {
            templateUrl: './customer/view/_my_orders.html',
            controller: 'myOrdersController'
        })
        .when('/my-order-detail/:orderId', {
            templateUrl: './customer/view/_my_order_detail.html',
            controller: 'myOrderDetailController'
        })
        .when('/top-dish', {
            templateUrl: './customer/customer_index.html',
            controller: 'customerController'
        })
        .when('/home', {
            templateUrl: './customer/view/_home.html',
            controller: 'homeController'
        })
        .when('/wxpay', {
            templateUrl: './customer/view/_wxpay.html',
            controller: 'wxpayController'
        })
        .otherwise({
            templateUrl: './customer/view/_page404.html',
            controller: 'page404Controller'
        });
}]);