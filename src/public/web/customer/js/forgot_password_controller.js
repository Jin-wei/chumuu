/**
 * Created by Ken on 15-4-13.
 */

app.controller("forgotPasswordController", ['$rootScope','$scope','$mpAjax','$location',
    '$mpCustomer',
function($rootScope,$scope ,$mpAjax,$location,
         $mpCustomer) {

    $scope.resetPassInfo = {};

    $scope.onBtnSendCaptcha = function() {
        var paramObj = {};
        $mpAjax.post('/sms/'+$scope.resetPassInfo.phone+"/password",paramObj).then(function(result){
            if(result && result.success){
                SuccessBox('验证码发送成功,请注意查收');
                timer();
            }else{
                WarningBox('验证码发送失败,'+result.errMsg);
            }
        }).catch(function(fail){
            ErrorBox('服务器内部错误')
        })
    };

    $scope.onBtnConfirm = function() {

        if($rootScope.isCN) {
            if(_.isEmpty($scope.resetPassInfo.phone) || _.isEmpty($scope.resetPassInfo.code) || _.isEmpty($scope.resetPassInfo.password)){
                WarningBox(L.enter_all_fields);
                return false;
            }

            var paramObj = {};
            paramObj.password = $scope.resetPassInfo.password;
            paramObj.code = $scope.resetPassInfo.code;
            $mpAjax.post('/cust/'+$scope.resetPassInfo.phone+"/password",paramObj).then(function(result){
                if(result && result.success){
                    SuccessBox('密码重置成功,请记住新密码');
                    window.location.href ="/top-dish-old";
                }else{
                    WarningBox('密码重置失败,'+result.errMsg);
                }
            }).catch(function(fail){
                ErrorBox('服务器内部错误')
            });
        }
        else {
            $mpCustomer.forgotPassword($scope.resetPassInfo.email).then(function(json){
                if(json != null && json.success){
                    SuccessBox("Reset password email has been sent to you. Please follow the instructions in the email.");
                }else{
                    ErrorBox("Send reset password email failed");
                }
            }).catch(function(json){
                if(typeof(json) != 'undefined' && typeof(json.message) != 'undefined')
                    ErrorBox("Send reset password email failed, " + json.outMsg);
                else
                    ErrorBox("Send reset password email failed, please try again later.");
            })
        }
    };

    var s = 60;
    function timer(){
        $('#smsBtn').enable(false);
        if(s<=0){
            s=60;
            $('#smsBtn').text('发送');
            $('#smsBtn').enable(true);
        }else{
            s-- ;
            $('#smsBtn').text('（'+s+'）');
            setTimeout(function() {
                    timer()
                },
                1000)
        }
    }
}] );

