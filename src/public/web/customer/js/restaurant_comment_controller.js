/**
 * Created by Ken on 2014-7-7.
 */
app.controller("restaurantCommentController", ['$rootScope','$scope','$routeParams','$mp_ajax','$location','$q','$timeout',
    '$mpBizInfo','$mpBizComment','$mpCustomer',
    function($rootScope,$scope,$routeParams,$mp_ajax,$location,$q,$timeout, $mpBizInfo, $mpBizComment, $mpCustomer) {
        var L = $rootScope.L;
        console.log("restaurant_comment_controller.js");
        $scope.bizKey = $routeParams.bizKey ? $routeParams.bizKey : $rootScope.bizKey;
        $scope.star = {};


        $mpBizInfo.init($scope.bizKey).then(function(){
            $scope.$mpBizInfo=$mpBizInfo;
            $mpBizComment.init($mpBizInfo.getItem('biz_id')).then(function(){
                $scope.$mpBizComment = $mpBizComment;
            });
        }).catch(function(error){
            $log.error('$log',error);
        });

        $mpBizInfo.getFavoriteCount();
        $mpBizInfo.getRating();

        $scope.starFood = {rating: 0};
        $scope.starService = {rating: 0};
        $scope.starPrice = {rating: 0};

        $scope.comment = {};
        $scope.comment.comment = '';

        $scope.onAddComment = function (isFormValid) {
            if(!$rootScope.isLogin) {
                window.location.href ='top-dish-old?login=1&preUrl=' + $location.path();
            }
            if (!isFormValid) {
                return false;
            }
            if ($scope.starFood.rating < 1 || $scope.starService.rating < 1 || $scope.starPrice.rating < 1) {
                WarningBox(L.rating_warning_text_1);
                return false;
            }
            if ($scope.comment.comment.trim().length == 0) {
                WarningBox(L.rating_warning_text_2);
                return false;
            }
            $scope.comment.foodQuality = $scope.starFood.rating;
            $scope.comment.serviceLevel = $scope.starService.rating;
            $scope.comment.priceLevel = $scope.starPrice.rating;

            $mpBizComment.add($mpCustomer.getItem('customer_id'),$mpBizInfo.getItem('biz_id'),$scope.comment);
            document.getElementById("commentContent").value = "";
            $scope.starFood.rating = 0;
            $scope.starService.rating = 0;
            $scope.starPrice.rating = 0;
        };

        $scope.onDeleteComment = function (comment, index) {
            $("#dialog-confirm").removeClass('hide').dialog({
                resizable: false,
                modal: true,
                buttons: [
                    {
                        html: "<i class='icon-trash bigger-110'></i>&nbsp;" + L.delete,
                        "class": "btn btn-danger btn-xs",
                        click: function () {
                            var confirmDlg = $(this);
                            $mpBizComment.delete($mpCustomer.getItem('customer_id'),comment.id)
                                .then(function(){
                                    confirmDlg.dialog( "close" );
                                });
                        }
                    }
                    ,
                    {
                        html: "<i class='icon-remove bigger-110'></i>&nbsp;" + L.cancel,
                        "class": "btn btn-xs",
                        click: function () {
                            $(this).dialog("close");
                        }
                    }
                ]
            });
        };

        $scope.jumpToLogin = function () {
            window.location.href ='top-dish-old?login=1&preUrl=' + $location.path();
        };

        //move page-content a little bit down in case of tabs cover part of it
        jQuery(document).ready(function(){
            OnViewLoad();
        });
    }] );

