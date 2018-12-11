/**
 * Created by Ken on 2014-9-9.
 */
app.controller("settingController",
    ['$rootScope','$scope','$mp_ajax','$mpAjax','$location','$routeParams','$log',
        '$mpCustomer',
function($rootScope,$scope,$mp_ajax,$mpAjax,$location,$routeParams,$log,
         $mpCustomer
) {

    $rootScope.setTitle($rootScope.L.setting);
    var L = $rootScope.L;


    $mpCustomer.onBaseDataLoaded(function(data){
    });

    $scope.onCancel = function(key,callback) {
        $scope['isEdit'+key] = false;
        if(_.isFunction(callback)) {
            callback();
        }
    };

    $scope.onOK = function(key,callback) {
        if (key === 'Phone' &&  $scope.custNewInfo.phone_no.length != $rootScope.phoneLength) {
            return;
        }
        $scope['isEdit'+key] = false;
        //console.log('ok',callback);
        if(_.isFunction(callback)) {
            callback();
        }
    };

    $scope.onEdit = function(key) {
        $scope['isEdit'+key] = true;
    };

    // file upload with preview
    var $file_input = $('.mp-file-upload').next();
    var $image = $($('.mp-file-upload')[0]);
    {
        $file_input.change(function(){
            var filename = $file_input.val();
            if((/\.(jpe?g|png|gif|svg|bmp|tiff?)$/i).test(filename)) {
                //check size
                //$file_input[0].files[0].size
                var max_size_str = $file_input.attr('max_size');
                var max_size = 4*1024*1024; //default: 4M
                var re = /\d+m/i;
                if(re.test(max_size_str))  {
                    max_size = parseInt(max_size_str.substring(0,max_size_str.length-1))*1024*1024;
                }

                if($file_input[0].files[0].size > max_size) {
                    ErrorBox('Max Size Limit: '+max_size_str);
                    return false;
                }

                //show preview
                var reader = new FileReader();
                reader.onload = function () {
                    $image.attr('src',this.result);
                };
                reader.onerror = function() {
                    console.error("read image onerror");
                    ErrorBox('read image onerror');
                };
                reader.readAsDataURL($file_input[0].files[0]);
            }
            else if(filename && filename.length>0){
                $file_input.val('');
                ErrorBox('Unsupport file. (jpeg,jpg,png,gif,svg,bmp,tiff)');
            }
        });

        $('.mp-file-upload').click(function(){
            if($scope.isEditAvatar)
                $file_input.trigger('click');
        });
    }


    $scope.tabs = [
        {
            id:'prof',
            name: L.profile,
            icon:'icon-user',
            active: true
        },
        {
            id:'priv',
            name: L.security,
            icon:'icon-shield',
            active: false
        }
//        ,
//        {
//            id:'setting',
//            name: L.setting,
//            icon:'icon-cog',
//            active: false
//        }
    ];

    $scope.curTab = $scope.tabs[0];
    $scope.changeTab = function(tab) {
        if(tab!=$scope.curTab) {
            $scope.curTab.active = false;
            tab.active = true;
            $scope.curTab = tab;
        }
    };

    $scope.cancelUploadAvatar = function() {
        $($('.mp-file-upload')[0]).attr('src',$mpCustomer.getItem('avatar'));
    };

    $scope.uploadAvatar = function() {
        g_loading.show();
        $mpAjax.formPost($('#js-setting-avatar'),'/cust/'+$mpCustomer.getItem('customer_id')+'/avatar',function(data){
            $rootScope.$apply(function(){
                $mpCustomer.setAvatar(data.avatar);
            });
            g_loading.hide();
        },function(error){
            g_loading.hide();
            $log.error(error);
            ErrorBox("Operation failed");
        });
    };

    $scope.custNewInfo = {};
    ObjectUtil.cover($mpCustomer.getData(),$scope.custNewInfo,['username','first_name','last_name','phone_no','address','city','state','zipcode']);

    $scope.updateUsername = function() {
        g_loading.show();
        var params = {
            username: $scope.custNewInfo.username
        };
        $mpCustomer.updateBaseInfo(params).then(function(data){
        }).catch(function(error){
            $log.error(error);
            ErrorBox(error);
        }).finally(function(){
            g_loading.hide();
        });
    };
    $scope.updateName = function() {
        g_loading.show();
        var params = {
            first_name: $scope.custNewInfo.first_name,
            last_name:  $scope.custNewInfo.last_name
        };
        $mpCustomer.updateBaseInfo(params).then(function(data){
        }).catch(function(error){
            $log.error(error);
            ErrorBox(error);
        }).finally(function(){
            g_loading.hide();
        });
    };
    $scope.updatePhone = function() {
        g_loading.show();
        if ($scope.custNewInfo.phone_no.length === $rootScope.phoneLength) {
            var params = {
                phone_no: $scope.custNewInfo.phone_no
            };
            $mpCustomer.updateBaseInfo(params).then(function(data){
            }).catch(function(error){
                $log.error(error);
                ErrorBox(error);
            }).finally(function(){
                g_loading.hide();
            });
        }
    };
    $scope.updateAddress = function() {
        g_loading.show();
        var params = {
            address:     $scope.custNewInfo.address,
            city:        $scope.custNewInfo.city,
            state:       $scope.custNewInfo.state,
            zipcode:     $scope.custNewInfo.zipcode
        };
        $mpCustomer.updateBaseInfo(params).then(function(data){
        }).catch(function(error){
            $log.error(error);
            ErrorBox(error);
        }).finally(function(){
            g_loading.hide();
        });
    };

    $scope.passInfo = {};
    $scope.updatePassword = function() {
        if(_.isEmpty($scope.passInfo.current)
            || _.isEmpty($scope.passInfo.new)
            || _.isEmpty($scope.passInfo.renew)) {
            WarningBox('Please enter password');
            return false;
        }
        if($scope.passInfo.new !== $scope.passInfo.renew) {
            WarningBox('New passwords are not coordinate');
            return false;
        }
        $scope.passInfo.isCN = $rootScope.isCN;
        g_loading.show();
        $mpCustomer.updatePassword($scope.passInfo).then(function(data){
        }).catch(function(error){
            $log.error(error);
            ErrorBox(L.change_password_fail_text);
        }).finally(function(){
            g_loading.hide();
        });
    };

    $scope.emailInfo = {};
    $scope.updateEmail = function() {
        if(_.isEmpty($scope.emailInfo.current)
            || _.isEmpty($scope.emailInfo.new)
            || _.isEmpty($scope.emailInfo.renew)
            || _.isEmpty($scope.emailInfo.pwd)) {
            WarningBox('Please enter all required information');
            return false;
        }
        if($scope.emailInfo.new === $scope.emailInfo.renew) {
            WarningBox('New emails are not coordinate');
            return false;
        }
        g_loading.show();
        $mpCustomer.updateEmail($scope.emailInfo).then(function(data){
        }).catch(function(error){
            $log.error(error);
            ErrorBox(error);
        }).finally(function(){
            g_loading.hide();
        });
    };

    return true;

    //$scope.edit = function(key) {
    //    var divDom = angular.element('#edit_'+key);
    //    if (divDom && divDom[0].className.indexOf('ui-icon-pencil') > 0) {
    //        divDom.removeClass('ui-icon-pencil');
    //        divDom.addClass('ui-icon-disk');
    //        divDom[0].innerText = L.save;
    //        $scope.edit['is_edit_'+key] = true;
    //    } else {
    //        divDom.removeClass('ui-icon-disk');
    //        divDom.addClass('ui-icon-pencil');
    //        divDom[0].innerText = L.edit;
    //        $scope.edit['is_edit_'+key] = false;
    //        updateCustProfileInfo();
    //    }
    //};
    //
    //$scope.onPasswordChange = function () {
    //    var param = {
    //        "password": $scope.passInfo.current,
    //        "newPassword": $scope.passInfo.new
    //    };
    //    if ($scope.passInfo.new == $scope.passInfo.retypeNew){
    //        $mp_ajax.post('/cust/' + $rootScope.custId + '/changepassword', param, function (data){
    //            $scope.edit.password = false;
    //            SuccessBox(L.change_password_success_text_1);
    //        }, function (json){
    //            if(typeof(json) != 'undefined' && typeof(json.message) != 'undefined')
    //                ErrorBox("Operation failed. " + json.outMsg);
    //            else
    //                ErrorBox("Operation failed, please try again later.");
    //        });
    //    }
    //};
    //
    //$scope.onEmailChange = function() {
    //    var email = $scope.email;
    //    var param = {
    //        email: email.current,
    //        newEmail: email.new,
    //        password: email.pwd
    //    };
    //    $mp_ajax.put('/cust/' + $rootScope.custId + '/loginEmail', param, function (data){
    //        SuccessBox('Update succeed, please login your new email and activate it.',{timeout:3000});
    //    }, function (json){
    //        //The email or password you entered is incorrect.
    //        //The email has been registered
    //        if(json && json.outMsg)
    //            ErrorBox(L.operation_failed +', '+ json.outMsg);
    //        else
    //            ErrorBox(L.operation_failed);
    //    });
    //};
    //
    ////$mp_ajax.get('/customerInfo', function (data) {
    ////
    ////    $scope.custInfo = data;
    ////    console.log($scope.custInfo);
    ////});
    //
    //function updateCustProfileInfo() {
    //    var param = {
    //        //"username": $scope.custInfo.username,
    //        "firstName": $scope.custInfo.first_name,
    //        "lastName": $scope.custInfo.last_name,
    //        "phoneNo": $scope.custInfo.phone_no,
    //
    //        "address": $scope.custInfo.address,
    //        "city": $scope.custInfo.city,
    //        "state": $scope.custInfo.state,
    //        "zipcode": $scope.custInfo.zipcode
    //    };
    //
    //    $mp_ajax.put('/cust/' + $rootScope.custId, param, function (data) {
    //        //console.log(data);
    //    }, function (data) {
    //        alert(data.message);
    //    });
    //}
}]);