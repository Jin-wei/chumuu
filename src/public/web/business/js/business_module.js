/**
 * Created by Ken on 14-4-16.
 */

var app = angular.module("mp_business", ['ngRoute','ngCookies','localytics.directives','infinite-scroll','pasvaz.bindonce']);

app.config(['$httpProvider',function($httpProvider) {
//    $httpProvider.defaults.headers.common['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.common["auth-token"] = $.cookie("auth-token");
}]);
