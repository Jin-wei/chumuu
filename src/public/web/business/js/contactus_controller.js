/**
 * Created by Ken on 2014-7-22.
 */
app.controller("contactusController", ['$rootScope','$scope','$routeParams','$mp_ajax','$location','$q',
    function($rootScope,$scope,$routeParams,$mp_ajax,$location,$q) {
        $rootScope.setTitle('Contant Us');
        OnViewLoad();
    }]);