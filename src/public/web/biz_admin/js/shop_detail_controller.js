/**
 * Created by Josh on 2/9/16.
 */

app.controller("shopDetailController", ['$rootScope', '$scope', '$routeParams', '$mpAjax', '$location', '$mp_json', '$cookieStore', '$timeout', '$q',
    '$mpBizInfo', '$routeParams','$mpBizUser',
    function ($rootScope, $scope, $routeParams, $mpAjax, $location, $mp_json, $cookieStore, $timeout, $q,
              $mpBizInfo, $routeParams,$mpBizUser) {

        console.log("shop_detail_controller.js");

        var bizId = $routeParams.id || -1;
        $scope.bizId = bizId;
        $scope.$mpBizInfo = $mpBizInfo;
        $scope.$mpBizUser = $mpBizUser;
        $mpBizInfo.init(bizId).then(function (data) {
            $mpBizUser.init($mpBizInfo.getId());
        });

        $scope.tabs = {
            id: 'shop_tab',
            tabs: [
                {
                    name: '商家信息',
                    icon: 'icon-home',
                    active: true
                },
                {
                    name: '订单',
                    icon: 'icon-th-list'
                },
                {
                    name: '上传餐馆菜单',
                    icon: 'icon-food'

                }

                /*{
                    name: '帐单',
                    icon: 'icon-credit-card'
                }*/
            ],
            on_loaded: null
        };
        $scope.$on('shop.switch_to_tab', function (event, msg) {
            $scope.tabs.change_tab(msg.index);
        });

        var dialog = $('#biz-user-add-update-form');
        function _ShowBox() {
            dialog.css('display','block');
            var rect = GetCenterPosition(dialog);
            dialog.css('left',rect.left+'px');
            g_mask.show();
        }

        function _HideBox() {
            dialog.css('display','none');
            g_mask.hide();
            $scope.cur_table = null;
        }

        $scope.isAdd = false;
        $scope.isEdit = false;
        $scope.showDlgAddBizUser = function() {
            _ShowBox();
            $scope.bizUser = {
                biz_id:$scope.bizId,
                first_name:'',
                last_name:'',
                phone_no:''
            };
            $scope.isAdd = true;
            $scope.isEdit = false;
        };

        $scope.showDlgUpdateBizUser = function(item) {
            _ShowBox();
            $scope.bizUser= $mpBizUser.findUserById(item);
            $scope.isAdd = false;
            $scope.isEdit = true;
        };

        $scope.onSubmitBizUser = function() {
            if($scope.isAdd) {
                if(_.isEmpty($scope.bizUser.username) || _.isEmpty($scope.bizUser.password) || _.isEmpty($scope.bizUser.email)) {
                    WarningBox('用户名/密码/邮箱 不能为空');
                    return false;
                }
                $scope.bizUser.active = 1;

                console.log($scope.bizUser);
                $mpBizUser.add($scope.bizUser).then(function(data){
                    ;
                    _HideBox();
                });
            }
            else if($scope.isEdit) {
                $mpBizUser.update($scope.bizUser).then(function(data){
                    ;
                    _HideBox();
                });
            }
        };

        $scope.onDlgCancel = function() {
            _HideBox();
        };

        $scope.onBtnSendPwdReset = function(item) {
            $mpBizUser.resetPassword(item.email,$scope.bizId).then(function(data){

            });
        };

        $scope.onBtnDeleteBizUser = function(item) {
            $mpBizUser.delete($scope.bizId,item.user_id).then(function(data){
                ;
                _HideBox();
            });
        };

        OnViewLoad();
    }]);

app.controller("orderListController", ['$rootScope', '$scope', '$routeParams', '$mpAjax', '$location', '$mp_json', '$cookieStore', '$timeout', '$q',
    '$mpBizList',
    function ($rootScope, $scope, $routeParams, $mpAjax, $location, $mp_json, $cookieStore, $timeout, $q,
              $mpBizList) {
        var $page = $scope.$parent;

        $scope.orders = [];
        $mpAjax.get('/admin/'+ $rootScope.adminId + '/biz/' + $page.bizId + '/order').then(function (data) {
            if (_.isArray(data)) {
                $scope.orders = data;
                _.forEach($scope.orders,function(o){
                    o.orderStart = DateUtil.format(DateUtil.UTCDateTime2LocalDateTime(o.order_start),'yyyy-MM-dd HH:mm');
                    o.createOn = DateUtil.format(DateUtil.UTCDateTime2LocalDateTime(o.create_on),'yyyy-MM-dd HH:mm');
                });
            }
        });

        $scope.onBtnAddShop = function () {
            $rootScope.$broadcast('shop.item_detail.add', {});
        };

        $scope.showDetail = function (item) {
            $rootScope.$broadcast('shop.item_detail.show', {item: item});
        };

        OnViewLoad();
    }]);

app.controller("bizInvoiceController", ['$rootScope', '$scope', '$routeParams', '$mpAjax', '$location', '$mp_json', '$cookieStore', '$timeout', '$q',
    '$mpBizList','$mpInvoice',
    function ($rootScope, $scope, $routeParams, $mpAjax, $location, $mp_json, $cookieStore, $timeout, $q,
              $mpBizList,$mpInvoice) {
        var $page = $scope.$parent;

        //$scope.invoices = [{
        //    id: 1,
        //    start: "2015-05-26T00:59:03.000Z",
        //    end: "2015-06-01T00:59:03.000Z",
        //    cycle: '2015-25周',
        //    total_price: 3233,
        //    platform_price: 322,
        //    delivery_price: 100,
        //    net_price: 2232
        //}];
        $scope.$mpInvoice = $mpInvoice;
        //$mpInvoice.getListByBiz($page.bizId);
        //$mpAjax.get('/biz/'+$page.bizId+'/order').then(function(data){
        //    if(_.isArray(data)) {
        //        $scope.orders = data;
        //    }
        //});

        $scope.showDetail = function (item) {
            $rootScope.$broadcast('shop.invoice_detail.show', {item: item});
        };

        OnViewLoad();
    }]);

app.controller("bizInvoiceDetailController", ['$rootScope', '$scope', '$routeParams', '$mpAjax', '$location', '$mp_json', '$cookieStore', '$timeout', '$q',
    '$mpBizList',
    function ($rootScope, $scope, $routeParams, $mpAjax, $location, $mp_json, $cookieStore, $timeout, $q,
              $mpBizList) {
        var $page = $scope.$parent;

        $scope.orders = [];

        $scope.item = {};
        //$mpAjax.get('/biz/'+$page.bizId+'/order').then(function(data){
        //    if(_.isArray(data)) {
        //        $scope.orders = data;
        //    }
        //});
        function SwitchTab() {
            if (!_.find($page.tabs.tabs, {name: '帐单明细'})) {
                $page.tabs.on_loaded = function () {
                    $rootScope.$broadcast('shop.switch_to_tab', {index: 3});
                };
                $page.tabs.tabs.push({name: '帐单明细', icon: 'icon-inbox'});
            }
            else {
                $rootScope.$broadcast('shop.switch_to_tab', {index: 3});
            }
        }

        $rootScope.$on('shop.invoice_detail.show', function (event, msg) {
            SwitchTab();
            $scope.item = msg.item;

            if($scope.item.orders) {
                $scope.orders = $scope.item.orders;
            }
            else {
                var finishStart = DateUtil.format($scope.item.settle_start,'yyyy-MM-dd HH:mm:ss');
                var endDate = new Date($scope.item.settle_end);
                endDate.setSeconds(endDate.getSeconds()-1);
                var finishEnd = DateUtil.format(endDate,'yyyy-MM-dd HH:mm:ss');
                $mpAjax.get('/wechat/payment?bizId='+$page.bizId+'&finishStart='+finishStart+'&finishEnd='+finishEnd).then(function (data) {
                    if (_.isArray(data)) {
                        $scope.orders = data;
                        $scope.item.orders = data;
                        _.forEach($scope.orders,function(o){
                            o.orderStart = DateUtil.format(DateUtil.UTCDateTime2LocalDateTime(o.order_start),'yyyy-MM-dd HH:mm');
                            o.createOn = DateUtil.format(DateUtil.UTCDateTime2LocalDateTime(o.create_on),'yyyy-MM-dd HH:mm');
                        });
                    }
                });
            }

        });

        OnViewLoad();
    }]);

app.controller("uploadFileController", ['$rootScope', '$scope', '$routeParams', '$mp_ajax', '$mpAjax', '$location', '$mp_json', '$cookieStore', '$timeout', '$q',

    function ($rootScope, $scope, $routeParams, $mp_ajax, $mpAjax, $location, $mp_json, $cookieStore, $timeout, $q) {
        $scope.$routeParams=$routeParams;
        $scope.settingFilesSubmit = function() {
            //#280
            //check for file type
            var filename = $('#inputfile').val();
            var extension = filename.replace(/^.*\./,'');
            if(extension==filename){
                extension='';
            }else{
                extension = extension.toLowerCase();
            }
            if(extension=='csv'){
                var max_size = 1*1024*1024;
                var max_size_str = '1M';
                $scope.filesize = $('#inputfile')[0].files[0].size;

                if($('#inputfile')[0].files[0].size < max_size){
                    $mpAjax.formPost($('#file-form'),'/admin/' + $rootScope.adminId + '/biz/' + $routeParams.id + '/importFile',function(data){
                        if(data){
                            $scope.showdata = true;
                            $scope.insertNewType = data.insertNewType;
                            $scope.insertNewProd =  data.insertNewProd;
                            $scope.updateProd =  data.updateProd;
                            $scope.priceFaileCase = data.priceFaileCase;
                            $scope.faileCase = data.faileCase;
                        }else{
                            $scope.showdata = false;
                        }
                    },function(error){
                        var L = $rootScope.L;
                        if (L.key == 'zh-cn')
                            ErrorBox("上传失败");
                        if (L.key == 'en-us')
                            ErrorBox("Upload failed");
                        $scope.$apply(function() {
                            $scope.isUploading = false;
                        });
                    });
                }
                else{
                    ErrorBox('Max Size Limit: '+max_size_str);
                    return false;
                }
            }else{
                ErrorBox('file type should be csv only ');
            }
        };
    }]);