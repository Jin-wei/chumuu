/**
 * Created by Ken on 2014-7-22.
 */
app.controller("privacyPolicyController", ['$rootScope','$scope','$routeParams','$mp_ajax','$location','$q',
    function($rootScope,$scope,$routeParams,$mp_ajax,$location,$q) {
        $rootScope.setTitle('Privacy Policy');
        OnViewLoad();
    }]);