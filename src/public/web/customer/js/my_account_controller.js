/**
 * Created by Ken on 14-8-5.
 */
app.controller("myAccountController", ['$rootScope', '$scope', '$routeParams', '$mp_ajax', '$location', '$q', '$timeout',
    '$mpCustomer',
function ($rootScope, $scope, $routeParams, $mp_ajax, $location, $q, $timeout,
    $mpCustomer ) {

    var L = $rootScope.L;
    $rootScope.setTitle($rootScope.L.my_table);

    $scope.tabs = {
        id: 'js-account-tab',
        tabs : [
            {
                name: L.my_favorite,
                //icon: 'icon-th-list',
                active: true
            },
            {
                name: L.setting,
                //icon: 'icon-th-list'
            }
        ]
    };

    jQuery(document).ready(function(){
        OnViewLoad();
    });
}]);