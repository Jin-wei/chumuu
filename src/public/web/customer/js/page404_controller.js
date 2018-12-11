/**
 * Created by Ken on 2014-9-3.
 */
app.controller("page404Controller", ['$rootScope','$scope','$routeParams','$mp_ajax','$location','$q',
function($rootScope,$scope,$routeParams,$mp_ajax,$location,$q) {
    $rootScope.setTitle('404 Error');
    jQuery(document).ready(function(){
        OnViewLoad();
    });
}]);