/**
 * Created by Josh on 2/12/16.
 */

app.controller("settingController", ['$rootScope','$scope','$mpAjax','$location','$routeParams',function($rootScope,$scope,$mpAjax ,$location,$routeParams) {
    var L = $rootScope.L;

    $scope.tabs = {
        id:'setting_tab',
        tabs: [
            {
                name: L.security,
                icon: 'icon-lock',
                active: true
            }
//            {
//                name: L.setting,
//                icon: 'icon-cog'
//            },
//            {
//                name: L.table_management,
//                icon: 'icon-food',
//                active: true
//            },
//            {
//                name: L.printers,
//                icon: 'icon-print'
//            }
//            {
//                name: 'L.functions',
//                icon: 'icon-tags'
//            }
        ]
    };

    if($rootScope.bizInfo.order_status==0) {
        $scope.tabs.tabs.pop();
//        $scope.tabs.tabs[0].active = true;
    }

    $scope.passInfo = {};
    $scope.edit = {};
    $scope.edit.password = false;


    $scope.onPasswordChange = function () {
        //#183
        var new_pwd_length = $scope.passInfo.new.length;
        if(new_pwd_length<6 || new_pwd_length>15) {
            ErrorBox("New password length should between 6 and 15");
            return false;
        }
        else if(new_pwd_length === $scope.passInfo.current) {
            ErrorBox("New password should be different from old password");
            return false;
        }
        var param = {
            "originPassword": $scope.passInfo.current,
            "newPassword": $scope.passInfo.new
        };
        if($rootScope.bizId){
            param.bizId = $rootScope.bizId;
        }
        if ($scope.passInfo.new == $scope.passInfo.retypeNew){
            $mpAjax.put('/admin/' + $rootScope.adminId + '/password', param, function (data){
                $scope.edit.password = false;
                SuccessBox(L.change_password_success_text_1);
            }, function (json){
                if(typeof(json) != 'undefined'){
                    if (L.key == 'zh-cn')
                        ErrorBox(L.msg_operate_fail + ", " + "当前密码输入错误");
                    if (L.key == 'en-us')
                        ErrorBox(L.msg_operate_fail + ", " + json.outMsg);
                }
                else
                    ErrorBox(L.msg_operate_fail + ", " + L.msg_try_again_later + ".");
            });
        }
    };

    OnViewLoad();
}]);