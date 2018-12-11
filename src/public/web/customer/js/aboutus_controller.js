/**
 * Created by Ken on 2014-7-22.
 */
app.controller("aboutusController", ['$rootScope','$scope','$routeParams','$mp_ajax','$location','$q',
    function($rootScope,$scope,$routeParams,$mp_ajax,$location,$q) {
        $rootScope.setTitle('About Us');
        jQuery(document).ready(function(){
            OnViewLoad();
        });
    }]);