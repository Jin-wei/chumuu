/**
 * Created by Ken on 14-7-17.
 */
app.controller("myFavoriteController", ['$rootScope','$scope','$routeParams','$mp_ajax','$location','$q',
    '$mpCustomerFavoriteBusiness','$mpCustomerFavoriteMenuItems','$mpCustomer',
function($rootScope,$scope,$routeParams,$mp_ajax,$location,$q,
    $mpCustomerFavoriteBusiness ,$mpCustomerFavoriteMenuItems,$mpCustomer)
{

    var L = $rootScope.L;
    $rootScope.setTitle($rootScope.L.my_favorite);

    $mpCustomer.onBaseDataLoaded(function(){
        $mpCustomerFavoriteBusiness.init($mpCustomer.getItem('customer_id')).then(function(data){
            $scope.$mpCustomerFavoriteBusiness = $mpCustomerFavoriteBusiness;
        });
        $mpCustomerFavoriteMenuItems.init($mpCustomer.getItem('customer_id')).then(function(data){
            $scope.$mpCustomerFavoriteMenuItems = $mpCustomerFavoriteMenuItems;
        });
    });

    $scope.tabs = [
        {
            id:'biz',
            name: L.businesses,
            icon:'icon-home',
            active: true
        },
        {
            id:'prod',
            name: L.menu_items,
            icon:'icon-food',
            active: false
        }
    ];
    $scope.curTab = $scope.tabs[0];
    $scope.changeTab = function(tab) {
        if(tab!=$scope.curTab) {
            $scope.curTab.active = false;
            tab.active = true;
            $scope.curTab = tab;
        }
    };

    $scope.undoFavoriteBiz = function(item){
        console.log('undoFavoriteBiz',item);
        $( "#dialog-confirm" ).removeClass('hide').dialog({
            resizable: false,
            modal: true,
            buttons: [
                {
                    html: "<i class='icon-trash bigger-110'></i>&nbsp;" + L.remove,
                    "class" : "mp btn btn-danger btn-xs",
                    click: function() {
                        var confirmDlg = $( this );
                        $mpCustomerFavoriteBusiness.unFavorite($mpCustomer.getItem('customer_id'),item.biz_id).then(function(data){
                        }).catch(function(error){
                            ErrorBox("Undo Favorite Business failed");
                        }).finally(function(){
                            confirmDlg.dialog( "close" );
                        });
                    }
                }
                ,
                {
                    html: "<i class='icon-remove bigger-110'></i>&nbsp;" + L.cancel,
                    "class" : "mp btn btn-xs",
                    click: function() {
                        $( this ).dialog( "close" );
                    }
                }
            ]
        });
    };

    $scope.undoFavoriteProd = function(item){
        $( "#dialog-confirm" ).removeClass('hide').dialog({
            resizable: false,
            modal: true,
            buttons: [
                {
                    html: "<i class='icon-trash bigger-110'></i>&nbsp;" + L.remove,
                    "class" : "mp btn btn-danger btn-xs",
                    click: function() {
                        var confirmDlg = $( this );
                        $mpCustomerFavoriteMenuItems.unFavorite($mpCustomer.getItem('customer_id'),item.prod_id).then(function(data){
                        }).catch(function(error){
                            ErrorBox("Undo Favorite Product failed");
                        }).finally(function(){
                            confirmDlg.dialog( "close" );
                        });
                    }
                }
                ,
                {
                    html: "<i class='icon-remove bigger-110'></i>&nbsp;" + L.cancel,
                    "class" : "mp btn btn-xs",
                    click: function() {
                        $( this ).dialog( "close" );
                    }
                }
            ]
        });
    };

    jQuery(document).ready(function(){
        OnViewLoad();
    });
}]);