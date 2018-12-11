/**
 * Created by Ken on 2014-4-18.
 */

app.controller("restaurantListController", ['$rootScope','$scope','$routeParams','$mp_ajax','$location','$q',function($rootScope,$scope,$routeParams,$mp_ajax,$location,$q) {
    $rootScope.setTitle('Search');
    console.log("restaurant_list_controller.js");
//        $mp_ajax.promiseGet('/biz/103072/totalClickCount').then(function(data){
//            console.log(data);
//        });

//    $mp_ajax.promiseGet('/biz').then(function(data) {
////            $scope.bizArray = data;
//        $scope.bizArray = [];
//        for(var i in data) {
//            if(i==10)
//                break;
//            $scope.bizArray.push(data[i]);
//        }
//        if(data && data.length>0)
//            $scope.showPosition(data[0]);
//    });

//    getLocation();
    $scope.searchNearby = function() {
        var url = '/biz?latitude='+myMarker.position.lat()
            +'&longitude='+myMarker.position.lng()
            +'&distance='+$scope.distance;
        ClearMarker();
        $mp_ajax.promiseGet(url).then(function(data){
            $scope.bizArray = data;
            if(data && data.length>0){
                $scope.noresult = false;
                $scope.showPosition(data[0]);
                SetMarker(data);
                Fitbounds();
            }
            else {
                $scope.noresult = true;
            }
        });
    };

    $scope.showPosition = function(biz) {
        //myMarker.position = new google.maps.LatLng(biz.latitude,biz.longitude);
        //markMyPosition();
        //myMarker.setMap(gMap);
        var latLng = new google.maps.LatLng(biz.latitude,biz.longitude);
        gMap.setCenter(latLng);
    };
    $scope.showInfoWindow = function(index) {
        if(bizMarker.length>0) {
            bizMarker[index].infoWindow.open(gMap,bizMarker[index]);
        }
    };
    $scope.hideInfoWindow = function(index) {
        if(bizMarker.length>0) {
            bizMarker[index].infoWindow.close(gMap,bizMarker[index]);
        }
    };

    //move page-content a little bit down in case of tabs cover part of it
    jQuery(document).ready(function(){
        OnViewLoad();
    });
}] );

