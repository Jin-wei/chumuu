/**
 * Created by ling xue on 14-6-13.
 */


var app = angular.module("mp_customer", ['ngRoute','pasvaz.bindonce']);

app.config(['$httpProvider',function($httpProvider) {
//    $httpProvider.defaults.headers.common['Cache-Control'] = 'no-cache';
//    $httpProvider.defaults.headers.common['Pragma'] = '';
      $httpProvider.defaults.headers.common["customer-token"] = $.cookie("customer-token");
}]);

