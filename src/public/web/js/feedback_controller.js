/**
 * Created by Ken on 2014-8-8.
 */
app.controller("feedbackController", ['$rootScope','$scope','$routeParams','$mp_ajax','$location','$q',
    function($rootScope,$scope,$routeParams,$mp_ajax,$location,$q) {
        $rootScope.setTitle('Feedbacks');
        var L =$rootScope.L;

        $scope.feedback = {
            contactEmail:'',
            contactPhone:'',
            content:''
        };

        $scope.onSubmit = function() {
            if($scope.feedback.contactEmail.trim().length==0 && $scope.feedback.contactPhone.trim().length==0) {
                WarningBox("Email or Phone is required");
                return;
            }
            $mp_ajax.post("cust/do/feedback",$scope.feedback,function(data){
                $scope.feedback.contactEmail = '';
                $scope.feedback.contactPhone = '';
                $scope.feedback.content = '';
                SuccessBox(L.feedback_success_text_1);
            },function(error) {
                ErrorBox(error.message);
            });
        };

        OnViewLoad();
    }]);