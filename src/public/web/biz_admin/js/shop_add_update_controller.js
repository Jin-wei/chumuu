/**
 * Created by Josh on 2/9/16.
 */

app.controller("shopAddUpdateController", ['$rootScope','$scope','$routeParams','$mpAjax','$location','$mp_json','$cookieStore','$timeout','$q',
    '$mpBizInfo','$routeParams',
    function($rootScope,$scope,$routeParams,$mpAjax,$location,$mp_json,$cookieStore,$timeout,$q,
             $mpBizInfo,$routeParams
        ) {
        var bizId = $routeParams.id || -1;
        $scope.bizId = bizId;
        $scope.item = {latitude:0,longitude:0};
        $scope.cities = [];
        $scope.defaultItem = {
            name:'',
            address:'',
            city:$rootScope.Const.CITY[0].name,
            state: $rootScope.Const.CITY[0].name,
            zipcode:'',
            latitude:0,
            longitude:0,
            phone_no:'',
            opened_date:null,
            owner_name:'',
            category:'',
            note:'',
            img_url:'',
            active:1,
            order_status:1,
            country:'',
            kids_goodfor:0,
            neighborhood:'',
            alcohol:'',
            attire:'',
            chain_name:'',
            kids_menu:0,
            services:'',
            options:'',
            payment_cashonly:0,
            price_level:0,
            reservations:0,
            website:'',
            wifi:0,
            fax:'',
            groups_goodfor:0,
            hours:'',
            hours_display:'',
            open_24hrs:0,
            rating:0,
            email:'',
            smoking:0,
            parking:0,
            seating_outdoor:0,
            accessible_wheelchair:0,
            room_private:0,
            country:sys_config.countryCode,
            time_offset:sys_config.timeOffset,
            parentId: sys_config.commonBizId,
            created_by:  $rootScope.adminId
        };

        var isAdd = false;
        var isUpdate = false;
        if(bizId===-1) {
            isAdd = true;
        }
        else {
            isUpdate = true;
            $mpBizInfo.init(bizId);
        }

        if(isAdd) {
            console.log("parentid:"+$rootScope.commonBizId);
            $scope.pageTitle = '新增商家';
            $.extend($scope.item, $scope.defaultItem);
            SetCity();
            $scope.onSubmit = function() {
               // $('#parentId').val($rootScope.commonBizId);
                if(_.isEmpty($scope.item.name)) {
                    WarningBox('请输入名称');
                    return false;
                }
                if($scope.item.latitude==0 || $scope.item.longitude==0 || !$scope.item.latitude || !$scope.item.longitude) {
                    WarningBox('请填写地址后定位以获取经纬度');
                    return false;
                }
                if (!_.isEmpty($scope.item.opened_date) && !isValidDate($scope.item.opened_date)){
                    WarningBox('开业日期格式不对');
                    return false;
                }
                g_loading.show();
                $mpAjax.formPost($('#shop'),'/admin/' + $rootScope.adminId + '/biz',function(data){
                    console.log(data);
                    SuccessBox('添加成功');
                    $scope.$apply(function(){
                        $rootScope.navTo('shop');
                    });
                    g_loading.hide();
                },function(error){
                    ErrorBox(JSON.stringify(error));
                    g_loading.hide();
                });
            };
        }
        else if(isUpdate) {
            $scope.pageTitle = '编辑商家';
            $mpBizInfo.onBaseDataLoaded(function() {
                $scope.item = $mpBizInfo.getData();
                $scope.previousActive = $scope.item.active;
                $scope.pageTitle = '编辑商家' + ' : ' + $scope.item.name;
                $scope.cities = _.find($rootScope.Const.CITY, {name: $scope.item.state});
                if (_.isEmpty($scope.cities)) {
                    $scope.item.state = $rootScope.Const.CITY[0].name;
                }
                SetCity();

                $scope.onSubmit = function () {
                    var params={};
                    $.extend(params,$scope.item);
                    if (_.isEmpty($scope.item.name)) {
                        WarningBox('请输入名称');
                        return false;
                    }
                    if (params.latitude == 0 || params.longitude == 0 || !params.latitude || !params.longitude) {
                        WarningBox('请填写地址后定位以获取经纬度');
                        g_loading.hide();
                        return false;
                    }
                    if (!_.isEmpty($scope.item.opened_date) && !isValidDate($scope.item.opened_date)){
                        WarningBox('开业日期格式不对');
                        return false;
                    }
                    g_loading.show();
                    $mpAjax.put('/admin/' + $rootScope.adminId + '/biz/' + params.biz_id + '/hardInfo', params).then(function (data) {
                        SuccessBox('更新成功');
                        g_loading.hide();
                    }).catch(function (error) {
                        ErrorBox(error);
                        g_loading.hide();
                    })
                };
            });
        }


        function SetCity() {
            if($scope.item && $scope.item.state) {
                var state = _.find($rootScope.Const.CITY,{name:$scope.item.state});
                if(state) {
                    $scope.cities = state.cities;
                    var city = _.contains(state.cities,$scope.item.city);
                    if(!city) {
                        $scope.item.city = $scope.cities[0];
                    }
                }
            }
        }

        $scope.$watch('item.state',function(to,from){
            SetCity();
        });

        var isFirstTimeEnter = true;
        $scope.$watch('item.city',function(to) {
            if(isFirstTimeEnter && $scope.item.latitude!==0 && $scope.item.longitude!==0) {
                SetMapToCenter({latitude:$scope.item.latitude, longitude:$scope.item.longitude});
                isFirstTimeEnter = false;
            }
            else {
                if($scope.item.city) {
                    gMap.setCity($scope.item.city);
                }
            }
        });

        $scope.searchAddress = function() {
            //返回地理编码结果
            //地理编码
            var address = $scope.item.state+' '+$scope.item.city+' '+$scope.item.address;
            geoCoder.getLocation(address, function (status, result) {
                if (status === 'complete' && result.info === 'OK') {
                    var lat = result.geocodes[0].location.getLat();
                    var lng = result.geocodes[0].location.getLng();
                    $scope.$apply(function() {
                        $scope.item.latitude = lat;
                        $scope.item.longitude = lng;
                    });

                    SetMapToCenter({latitude:lat, longitude:lng});
                    $('#latitude').addClass('page-set-coordinate');
                    $('#longitude').addClass('page-set-coordinate');
                    setTimeout(function(){
                        $('#latitude').removeClass('page-set-coordinate');
                        $('#longitude').removeClass('page-set-coordinate');
                    },700);
                }
            });
        };

        OnViewLoad();
    }] );