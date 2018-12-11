/**
 * Created by Jzou on 12/21/17.
 */

app.controller("unuseQrcodeController", ['$rootScope','$scope','$routeParams','$mpAjax','$location','$mp_json','$cookieStore','$q',function($rootScope,$scope,$routeParams,$mpAjax,$location,$mp_json,$cookieStore,$q) {
    var L = $rootScope.L;
    $scope.qrcodes = [];
    $scope.searchStatus = -1;
    $scope.searchPageNo = 1;
    $scope.searchPageSize = 8;
    $scope.pageCount = 0;
    $scope.searchQrcode="";
    $scope.searchBizName="";
    $scope.searchStartSeq="";
    $scope.searchEndSeq="";

    $scope.hasPreviousPage = false;
    $scope.hasNextPage = false;

    function loadQrcodesPromise(){
        var search="?1=1";
        $scope.searchPageSize = parseInt($scope.searchPageSize);

        if($scope.searchPageNo>0) {
            search += '&start='+($scope.searchPageNo-1)*$scope.searchPageSize;
        }
        if($scope.searchPageSize>0) {
            search += '&size='+($scope.searchPageSize+1);
        }
        if ($scope.searchStartSeq.length>0){
            search+='&startSeq='+$scope.searchStartSeq;
        }
        if ($scope.searchEndSeq.length>0){
            search+='&endSeq='+$scope.searchEndSeq;
        }

        $mpAjax.get('/admin/'+ $rootScope.adminId +'/availableQrCodes'+search).then(function(data){
            $scope.qrcodes = _.isArray(data) ? data : [];
            console.log( "qrcodes")
            console.dir( $scope.qrcodes)
            $scope.hasNextPage = $scope.qrcodes.length>$scope.searchPageSize;
            $scope.hasPreviousPage = $scope.searchPageNo>1;

            if($scope.qrcodes.length>$scope.searchPageSize) {
                $scope.qrcodes.pop();
            }
        });
    }

    loadQrcodesPromise();

    $scope.onBtnSearch = function() {
        //reset page number
        $scope.searchPageNo = 1;
        loadQrcodesPromise();
    };

    $scope.$watch('searchPageSize',function(to,from){
        if(_.isString(to))
            loadQrcodesPromise();
    });

    $scope.onBtnPageTo = function(key) {
        var isCanLoad = false;
        switch(key) {
            case 'previous':
                if($scope.hasPreviousPage) {
                    $scope.searchPageNo--;
                    isCanLoad = true;
                }
                break;
            case 'next':
                if($scope.hasNextPage) {
                    $scope.searchPageNo++;
                    isCanLoad = true;
                }
                break;
            default:;
        }
        if(isCanLoad)
            loadQrcodesPromise();
    };

}]);