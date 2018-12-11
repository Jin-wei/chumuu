/**
 * Created by Ken on 2014-7-25.
 */
function onCenterChangedCallback(position) {
    console.log('center changed, saved in cookie',position.lat(),position.lng());
}
app.controller("searchResultController", ['$rootScope','$scope','$routeParams','$mp_ajax','$location','$q', function($rootScope,$scope,$routeParams,$mp_ajax,$location,$q) {
    $rootScope.setTitle('Search');

    $scope.searchText = $routeParams.searchText;

    function GetAddressCallback(address) {
        if (address) {
            $scope.$apply(function(){
                $scope.geoLocation = address;
            });
        }
    }

    $rootScope.$watch('coords',function(to,from) {
        if(to.latitude) {
            SetCenter(to);
            FireAfterGoogleResourceLoad({fn:function(){
                GetAddressByCoords(GetMarkerPosition() ,GetAddressCallback);
            }});
        }
    });

    $scope.menuItems = [];
    $scope.bizes = [];
    var bizUrl = '/cust/do/searchBiz?name='+$scope.searchText+'&from=0&size=120';
    var prodUrl = '/cust/do/searchProd?name='+$scope.searchText+'&from=0&size=120';


    function search(bizUrl,prodUrl) {
        ClearMarker();
        $mp_ajax.promiseGet(bizUrl).then(function(data){
            if(data && data.length>0) {
//                for(var i in data) {
//                    data[i].distance = GetDistance($rootScope.coords.latitude,$rootScope.coords.longitude,data[i].latitude,data[i].longitude);
//                }
                data.sort(function(a,b){
                    return a.distance > b.distance ? 1:-1;
                });
                $scope.bizes = data;
                _.forEach($scope.bizes,function(biz){
                    var phones =biz.phone_no ? biz.phone_no.split(/[,;]/) : [''];
                    biz.phoneNo = phones[0];
                    biz.bizKey = biz.biz_unique_name ? biz.biz_unique_name : biz.biz_id;
                });

                SetMarker(data);
                Fitbounds();
            }
            else {
                $scope.bizes = [];
            }
        });
        $mp_ajax.promiseGet(prodUrl).then(function(data){
            if(data && data.length>0) {
                for(var i in data) {
                    var item = data[i];
                    item.distance = GetDistance($rootScope.coords.latitude,$rootScope.coords.longitude,item.latitude,item.longitude);
                }
                TranslateMenuItemImageUrl(data);
                data.sort(function(a,b){
                    return a.distance > b.distance ? 1:-1;
                });
                $scope.menuItems = data;
                var bizArr = [];
                for(var i in data) {
                    var item = data[i];
                    if(_.findIndex(bizArr,{biz_id:item.biz_id})==-1) {
                       bizArr.push({
                           biz_id:      item.biz_id,
                           name:        item.biz_name,
                           address:     item.address,
                           phone_no:    item.phone_no,
                           latitude:    item.latitude,
                           longitude:   item.longitude
                       });
                    }
                }

                SetMarker(bizArr);
                Fitbounds()

            }
            else {
                $scope.menuItems = [];
            }
            $scope.isResearching = false;
        });
    }

    $scope.distance = 5;
    if($rootScope.coords && $rootScope.coords.latitude) {
        var str = '&lat='+$rootScope.coords.latitude+'&lon='+$rootScope.coords.longitude+'&start=0&end='+$scope.distance;
        SetCenter($rootScope.coords);
        search(bizUrl+str,prodUrl+str);
    }
    else {
        search(bizUrl,prodUrl);
    }

    var distanceArray = [0.5,1,3,5,10,20,35,50];
    $( "#input-size-slider" ).css('width','200px').slider({
        value:4,
        range: "min",
        min: 1,
        max: 8,
        step: 1,
        slide: function( event, ui ) {
            var val = parseInt(ui.value);
            $scope.$apply(function(){
                $scope.distance = distanceArray[val-1];
            });
        }
    });

    //user click research button
    $scope.research = function() {
        var latLng = GetMapCenter();
        SetCenter(latLng);
        $.cookie('location',angular.toJson(latLng));
        $scope.isResearching = true;
        var str = '&lat='+latLng.latitude+'&lon='+latLng.longitude+'&start=0&end='+$scope.distance;
        search(bizUrl+str,prodUrl+str);
    };
    $scope.findMyLocation = function () {
        $scope.isFindlocation = true;
        GEOGetLocation(function(position){
            $rootScope.$apply(function(){
                $rootScope.coords = position.coords;
                $scope.isFindlocation = false;
            });
        });
    };

    jQuery(document).ready(function(){
        OnViewLoad();
    });
}]);