/**
 * Created by mac on 14-4-11.
 */

var app = angular.module("myapp", ['ngCookies','ngRoute']);

app.factory('myservice',function () {
	var obj = {
		data: '',
		getData: function() {
			return "abc";
		}};
	obj.test = function() {
		return "test";
	};
	return obj;
});

app.controller("MyController",['$scope','myservice','$cookieStore',function($scope,myservice,$cookieStore){
	$scope.test = myservice.test();
	$scope.user = {'id':1,'name':'ken'};
    $scope.page = "sub.html";
    $cookieStore.put("abc","ddddd");
    //alert($cookieStore.get("abc"));
	$scope.click = function(){
		console.log("test click");
        $scope.page = "_profile.html";
	};
}]);

app.config(['$routeProvider',function($routeProvider){
    $routeProvider
        .when('/test/a',{
            template:'<h2>aaaaaaa</h2>',
            controller:'MyController'
        })
        .when('/test/b',{
            template:'<h1>bbbbbbbb</h1>',
            controller:'MyController'
        })
        .otherwise({redirectTo:'/'});
}]);
