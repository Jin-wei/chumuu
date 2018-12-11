/**
 * Created by Josh on 2-7-16.
 */

var app = angular.module("mp_admin", ['ngRoute','ngCookies','localytics.directives','infinite-scroll','pasvaz.bindonce']);

app.config(['$httpProvider',function($httpProvider) {
//    $httpProvider.defaults.headers.common['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.common["auth-token"] = $.cookie("auth-token");
}]);
