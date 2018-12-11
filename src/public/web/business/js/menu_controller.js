/**
 * Created by Ken on 2014-4-18.
 */

app.controller("menuController", ['$rootScope','$scope','$routeParams','$mp_ajax','$location','$mp_json','$cookieStore','$timeout','$q', function($rootScope,$scope,$routeParams,$mp_ajax,$location,$mp_json,$cookieStore,$timeout,$q) {

    console.log("menu_controller.js");

    var L = $rootScope.L;
    //$scope.menuTypes = [];
    $scope.menu_big_arr=[];
    $scope.menu_tabs = {
        id:'menu_tab',
        tabs: [
            {
                name: L.all_big_menu_type,
                icon: 'icon-th-list'
            },
            {
                name: L.all_small_menu_type,
                icon: 'icon-tag'
            },
            {
                name: L.dishes_type,
                icon: 'icon-bitbucket'
            },
            {
                name: L.all_menu_item,
                icon: 'icon-food',
                active: true
            }

        ],
        on_loaded: null
    };

    $scope.$on('menuItem.switch_to_tab',function(event,msg){
        $scope.menu_tabs.change_tab(msg.index);
    });

    //获得大类
    $scope.menu_big_arr=[];
    $scope.getMenuBigList=function () {
        $scope.menu_big_arr=[];
        $mp_ajax.get('/biz/'+$rootScope.bizId+'/getBizMenu',function(data){
            if(data.succeed){
                $scope.menu_big_arr = data.result;
                if($scope.menu_big_arr.length>0){
                    $scope.menu_big_search=$scope.menu_big_arr[0].menu_id;
                }
            }else{
                console.error(data);
            }
            /*$rootScope.$broadcast('menuItem.switch_to_tab',{index:1});*/
        });
    };

    //获得小类
    $scope.getProdType=function (type) {
        if(type){
            $scope.bizMenuId=$('#menu_big_search2').val();
            $('#menu_big_search').val($scope.bizMenuId)
        }else {
            $scope.bizMenuId=$('#menu_big_search').val();
            $('#menu_big_search2').val($scope.bizMenuId)
        }
        var url='';
        if($scope.bizMenuId!=='null'){
            url='/biz/'+$rootScope.bizId+'/prodType/'+$scope.bizMenuId;
        }else{
            url='/biz/'+$rootScope.bizId+'/prodType';
        }
        $mp_ajax.get(url,function(data){
            if(_.isArray(data)){
                $scope.menu_types = data;
                _.forEach($scope.menu_types, function(type){
                    type.menuItems = [];
                });
            }else {
                $scope.menu_types=[];
            }
            $rootScope.$broadcast('menu.items.load',{});
        });
    }

    $scope.menu_types = [];

    $scope.getMenuBigList();
    $scope.getProdType();
}] );

app.controller("menuBigTypeController", ['$rootScope','$scope','$routeParams','$mp_ajax','$location','$mp_json','$cookieStore','$q','$timeout',function($rootScope,$scope,$routeParams,$mp_ajax,$location,$mp_json,$cookieStore,$q,$timeout) {
    var L = $rootScope.L;
    var $parent = $scope.$parent;
    var $page = $scope.$parent;

    var dialog = $('#menu_big_type_add_update_form');
    $scope.menu_big_data = {
        menuName:"",
        menuNameLang:"",
        displayType:"",
        startTime:"",
        endTime:"",
        bizId:"",
        menuId:"",
    };
    $scope.is_big_edit = false;

    function clearMenuData() {
        $scope.menu_big_data = {
            menuName:"",
            menuNameLang:"",
            displayType:"",
            startTime:"",
            endTime:"",
            bizId:"",
            menuId:"",
        };
        promotionDateCalender();
        $scope.is_big_edit = false;
        $('#startTime').val('');
        $('#endTime').val('');
    }

    function _ShowMenuBigBox(data) {
        dialog.show();
        clearMenuData();
        if(data) {
            $scope.menu_big_data.menuId=data.menu_id;
            $scope.menu_big_data.menuName = data.menu_name;
            $scope.menu_big_data.menuNameLang =data.menu_name_lang;
            $scope.menu_big_data.displayType = data.display_type.toString();
            $scope.menu_big_data.bizId =data.biz_id;
            $scope.menu_big_data.systemFlag =data.system_flag;//2用户增加 1脚本
            $scope.is_big_edit = true;
            var start_time=timeForamt(data.start_time);
            var end_time=timeForamt(data.end_time);
            if(start_time!='00:00:00'){
                $('#startTime').val(start_time);
            }
            if(end_time!='00:00:00'){
                $('#endTime').datetimepicker('startDate',getNowDate());
                $('#endTime').val(end_time);
            }


        }
    }

    function _HideMenuBigBox() {
        dialog.hide();
        clearMenuData();
    }

    $scope.onBtnNewBigMenu = function() {
        _ShowMenuBigBox();
    };

    $scope.editMenuBig=function (data) {
        _ShowMenuBigBox(data);
    }

    $scope.showDetailMenu=function (id) {
        $('#menu_big_search2').val(id);
        $page.getProdType(2);
        $rootScope.$broadcast('menuItem.switch_to_tab',{index:3});
    }

    $scope.onMenuSubmit = function() {
        var start_time=$('#startTime').val();
        var end_time=$('#endTime').val();
        if($scope.menu_big_data.menuName===""){
            ErrorBox(L.menu_name_null);
            return
        }else if($scope.menu_big_data.displayType===""){
            ErrorBox(L.menu_type_null);
            return
        }else if($scope.menu_big_data.displayType==="2"){
            if(start_time===""){
                ErrorBox(L.menu_start_time_null);
                return
            }
            if(end_time===""){
                ErrorBox(L.menu_end_time_null);
                return
            }
        }
        var params = $.extend(true,{},$scope.menu_big_data);

        var nowDate=getNowDate();//yyyy-mm-dd
        params.startTime= moment(nowDate + ' ' + start_time).format('YYYY-MM-DD HH:mm:ss Z');
        params.endTime= moment(nowDate + ' ' + end_time).format('YYYY-MM-DD HH:mm:ss Z');
        if($scope.is_big_edit) {
            var url = '/biz/' + $rootScope.bizId + '/updateBizMenu/'+$scope.menu_big_data.menuId;
            $mp_ajax.put(url, params,function (data) {
                if(data.succeed){
                    $page.getMenuBigList();
                    window.setTimeout(function () {
                        $('#menu_big_search').val('null');
                        $page.getProdType();
                    },100)
                    _HideMenuBigBox();
                }else{
                    console.log(data);
                    _HideMenuBigBox();
                }
            },function (data) {
                console.error(data);
                _HideMenuBigBox();
            });
        }
        else {
            var url = '/biz/' + $rootScope.bizId + '/addBizMenu';
            $mp_ajax.post(url, params,function(data){
                if(data.succeed){
                    $page.getMenuBigList();
                    window.setTimeout(function () {
                        $('#menu_big_search').val('null');
                        $page.getProdType();
                    },100)
                    _HideMenuBigBox();
                }else{
                    console.log(data);
                    _HideMenuBigBox();
                }
            },function(error){
                if(error.outMsg){
                    if(error.outMsg.indexOf("Duplicate entry")!=-1){
                        ErrorBox(L.menu_name_exit);
                    }else{
                        console.log(error);
                    }
                }
                console.log(error);
            });
        }
    };

    $scope.onCancel = function() {
        _HideMenuBigBox();
    };

    $scope.onBizMenuDelete = function(data) {
        $mp_ajax.delete('/biz/' + $rootScope.bizId + '/deleteBizMenu/' +$scope.menu_big_data.menuId,function (data) {
            if(data.succeed){
                $page.getMenuBigList();
                window.setTimeout(function () {
                    $('#menu_big_search').val('null');
                    $page.getProdType();
                },100)
                _HideMenuBigBox();
            }else{
                console.log(data);
            }
            //delete cur_type
        },function (error) {
            if(error.outMsg){
                if(error.outMsg.indexOf("a foreign key constraint fails")!=-1){
                    ErrorBox(L.delete_menu_have_prod);
                }else{
                    console.log(error);
                }
            }
        });
    };

    function promotionDateCalender () {
        var currentDate=
        $('#startTime').datetimepicker({
            autoclose:true,
            format: "hh:ii:00",
            startView: 1,
            weekStart: 1,
            minView:0,
            maxView:1,
            startDate:getNowDate(),
        }).on('changeDate',function(e){
            var startTime = e.date;
            $('#endTime').val('');
            $('#endTime').datetimepicker('startDate',getNowDate());
            $('#endTime').datetimepicker('setStartDate',startTime);
        })

        $('#endTime').datetimepicker({
            autoclose:true,
            format: "hh:ii:00",
            startView: 1,
            weekStart: 1,
            minView:0,
            maxView:1,
            startDate:getNowDate(),
            endDate:getNextDate(),
            initialDate:getNowDate(),
        }).on('changeDate',function(e){
            var endTime = e.date;
            $('#startTime').datetimepicker('startDate',getNowDate());
            $('#startTime').datetimepicker('setEndDate',endTime);
        })
    }

    $scope.changeMenuType=function () {
        if($scope.menu_big_data.displayType!=='2'){
            $('#startTime').val("");
            $('#endTime').val("");
            $('#endTime').datetimepicker('setStartDate','');
            $('#startTime').datetimepicker('setEndDate','');
            $scope.menu_big_data.startTime="";
            $scope.menu_big_data.endTime="";
        }
    };

    promotionDateCalender();
    OnViewLoad();
}] );


app.controller("menuTypeController", ['$rootScope','$scope','$routeParams','$mp_ajax','$location','$mp_json','$cookieStore','$q','$timeout',function($rootScope,$scope,$routeParams,$mp_ajax,$location,$mp_json,$cookieStore,$q,$timeout) {
    var L = $rootScope.L;
    var $parent = $scope.$parent;
    var $page = $scope.$parent;

    var dialog = $('#menu_type_add_update_form');
    $scope.menu_type_edit_form = {};
    $scope.cur_type = null;
    $scope.is_edit = false;
    $scope.is_changing_sequence = false;

    function _ShowBox(type) {
        dialog.show();
        var rect = GetCenterPosition(dialog);
        dialog.css('left',rect.left+'px');
        g_mask.show();
        $scope.cur_type = type ? type : null;
        if(type) {
            $scope.menu_type_edit_form.name = $scope.cur_type.name;
            $scope.menu_type_edit_form.name_lang = $scope.cur_type.name_lang;
            $scope.menu_type_edit_form.menu_id=$scope.cur_type.menu_id.toString();
            $scope.is_edit = true;
        }
        else {
            $scope.menu_type_edit_form = {};
            $scope.is_edit = false;
        }
    }

    function _HideBox() {
        dialog.hide();
        g_mask.hide();
        $scope.cur_type = null;
    }

    $scope.onBtnNewType = function() {
        _ShowBox();
    };

    $scope.onClickType = function(index) {
        if(!$scope.is_changing_sequence) {
            var type = $page.menu_types[index];
            type.index = index;
            _ShowBox(type);
        }
    };

    $scope.onSubmit = function() {
        var params = {
            name:       $scope.menu_type_edit_form.name,
            name_lang:  $scope.menu_type_edit_form.name_lang,
            menu_id:  $scope.menu_type_edit_form.menu_id,
            menu_name:$('#edit_form_menu_id').find("option:selected").text(),
            menu_name_lang:null,
            display_order: 0
        };
        if($scope.menu_type_edit_form.name===''  || $scope.menu_type_edit_form.name===undefined){
            ErrorBox(L.type_prod_name_not_null);
            return
        }
        if($scope.menu_type_edit_form.menu_id==='' || $scope.menu_type_edit_form.menu_id===undefined){
            ErrorBox(L.menu_big_not_null);
            return
        }
        var url = '/biz/' + $rootScope.bizId + '/prodType';
        if($scope.is_edit) {
            params.display_order = $scope.cur_type.display_order;
            $mp_ajax.put(url+'/'+$scope.cur_type.type_id, params,function (data) {
                console.log(data);
                $page.getProdType();
                $rootScope.$broadcast('menuItem.switch_to_tab',{index:1});
                _HideBox();
            },function (data) {
                console.error(data);
                if(data.message.indexOf("ER_DUP_ENTRY: Duplicate entry")==0){
                    ErrorBox(L.error_msg_duplicate_entry);
                }
                _HideBox();
            });
        }
        else {
            var max_display_order_type = _.max($page.menu_types,'display_order');
            params.display_order = max_display_order_type.display_order ? max_display_order_type.display_order+1 : 1;
            $mp_ajax.post(url, params,function(data){
                $page.getProdType();
                $rootScope.$broadcast('menuItem.switch_to_tab',{index:1});
                _HideBox();
            },function(error){
                console.error(error);
                if(error.message.indexOf("ER_DUP_ENTRY: Duplicate entry")==0){
                    ErrorBox(L.error_msg_duplicate_entry);
                }
                _HideBox();
            });
        }
    };

    $scope.onCancel = function() {
        _HideBox();
    };

    $scope.onDelete = function() {
        $mp_ajax.delete('/biz/' + $rootScope.bizId + '/prodType/' + $scope.cur_type.type_id,function (data) {
            //move items to Others
            var other_type = _.find($page.menu_types,function(_t){
                return !_t.type_id && _t.name=='Others';
            });
            if(!other_type) {
                other_type = {name:'Others',name_lang:'其他',type_id:null,menuItems:[]};
                $page.menu_types.push(other_type);
            }
            other_type.menuItems = other_type.menuItems.concat($scope.cur_type.menuItems);
            other_type.menuItems = _.sortBy(other_type.menuItems,'display_order');

            //delete cur_type
            $page.menu_types.splice($scope.cur_type.index,1);
            _HideBox();
        },function (error) {
            console.error(error);
            _HideBox();
        });
    };

    $scope.menu_type_sort_option = { group: 'menu_types', animation: 150, disabled:true };
    $scope.onBtnChangeSequence = function() {
//        $("#js_menu_type").dragsort({ dragSelector: ".menu_type", dragBetween: true, placeHolderTemplate: '<div class="pull-left menu_type mp-no-select pointer" style="width:152px;height:102px;background-color: #EEE"></div>'});
        $scope.is_changing_sequence = true;
        $scope.menu_type_sort_option.disabled = false;
    };

    $scope.onBtnUpdateSequence = function() {
//        var types = $("#js_menu_type .menu_type");
        var promiseArray = [];
//        for(var i=0;i<types.length;++i){
//            var $type = $(types[i]);
//            var display_order = $type.attr('data-display-order');
//            var type_id = $type.attr('data-type-id');
//
//            var type = _.find($page.menu_types,function(_o){
//                return _o.type_id==type_id;
//            });
//
//            if(display_order!=i+1 && type && type.type_id>0) {
//                type.display_order = i+1;
//                (function(type){
//                    promiseArray.push($mp_ajax.promisePut('/biz/' + $rootScope.bizId + '/prodType/' + type.type_id, type));
//                }(type));
//            }
//        }
        for(var i=0;i<$page.menu_types.length;++i) {
            var type = $page.menu_types[i];

            if(type.display_order!=i+1 && type.type_id>0) {
                type.display_order = i+1;
                (function(type){
                    promiseArray.push($mp_ajax.promisePut('/biz/' + $rootScope.bizId + '/prodType/' + type.type_id, type));
                }(type));
            }
        }
        if(promiseArray.length>0) {
            g_loading.show();
            $q.all(promiseArray).then(function(){
                g_loading.hide();
//                SuccessBox(L.msg_operate_succeed);
                $scope.is_changing_sequence = false;
//                $("#js_menu_type").dragsort('destroy');
                //TODO: broadcast menu.items.change_type_sequence
//                $page.menu_types = _.sortBy($page.menu_types,'display_order');
//                $rootScope.$broadcast('menu.items.change_type_sequence',{menu_types:$page.menu_types});
            },function(){
                g_loading.hide();
                ErrorBox(L.msg_operate_fail);
            });
        }
        else {
            $scope.is_changing_sequence = false;
            $scope.menu_type_sort_option.disabled = true;
//            $("#js_menu_type").dragsort('destroy');
        }
    };

    OnViewLoad();
}] );

app.controller("menuItemController", ['$rootScope','$scope','$routeParams','$mp_ajax','$location','$mp_json','$cookieStore','$timeout','$q', function($rootScope,$scope,$routeParams,$mp_ajax,$location,$mp_json,$cookieStore,$timeout,$q) {
    var $parent = $scope.$parent;
    var $page = $scope.$parent;
    $scope.menu_items = [];
    $scope.promos = [];
    $scope.search_keyword = '';
    $scope.search_result = [];
    $scope.filter_special = false;
    $scope.curMenuType = {};
    var search_timeout = null;
    var DELAY = 500;
    var MIN_SEARCH_CHAR_LENGTH = 2;
    //view style [get/set this configuration in cookie]
    $scope.menu_view_style = $.cookie('menu_view_style');
    if(angular.isUndefined($scope.menu_view_style)) {
        $scope.menu_view_style = 'gallery';
        $.cookie('menu_view_style','gallery');
    }

    $scope.menu_view_loaded_array = {};
    $scope.menu_view_loaded_array[$scope.menu_view_style] = true;

    $scope.onMenuViewChange = function(view_style) {
        $scope.menu_view_style = view_style;
        $scope.menu_view_loaded_array[view_style] = true;
        $.cookie('menu_view_style',view_style);
    };

    var menuItemsPromise = $mp_ajax.promiseGet('/biz/'+$rootScope.bizId+'/prodBase');
    var promoPromise = $mp_ajax.promiseGet('/biz/'+$rootScope.bizId+'/promo');

    $scope.$on('menu.items.load',function(event,msg){
        if($page.bizMenuId!=='null'){
            menuItemsPromise=$mp_ajax.promiseGet('/biz/'+$rootScope.bizId+'/prodBase/'+$page.bizMenuId)
        }else {
            menuItemsPromise = $mp_ajax.promiseGet('/biz/'+$rootScope.bizId+'/prodBase')
        }
        $q.all([menuItemsPromise,promoPromise]).then(function(dataArray){
            if(_.isArray(dataArray[0])){
                $scope.menu_items = dataArray[0];
            }else {
                $scope.menu_items =[];
            }
            if(_.isArray(dataArray[1])){
                $scope.promos = dataArray[1];
            }else {
                $scope.promos=[];
            }

            var menuTypes = $page.menu_types;
            var menuItems = $scope.menu_items;
            var promos = $scope.promos;

            //#112
            for(var i in menuItems) {
                if(!menuItems[i].type_id) {
                    menuTypes.push({name:'Others',name_lang:'其他',type_id:null,menuItems:[]});
                    break;
                }
            }

            TranslateMenuItemImageUrl(menuItems);

            for(var i in menuTypes) {
                var menuType = menuTypes[i];
                for(var j in menuItems) {
                    var menuItem = menuItems[j];
                    if(menuType.type_id==menuItem.type_id) {
                        menuType.menuItems.push(menuItem);
                    }
                }
            }

            for(var i in menuItems) {
                var item = menuItems[i];
                //for _menu.html
                item.promoClass = 'menu-promotion-btn';
                item.promoHref = '#/promotion/'+item.prod_id+'?tab=1';
                item.promoIcon = 'icon-plus-sign'
                item.active = item.active==0 ? false : true;
                item.special = item.special==0 ? false : true;

                for(var j in promos) {
                    var promo = promos[j];

                    if(promo.prod_id==item.prod_id) {
                        item.promoClass = 'menu-promotion-add-btn';
                        item.promoHref = '#/promotion/'+item.prod_id;
                        item.promoIcon = 'icon-arrow-right';

                        //calculate price with discount
                        if(angular.isUndefined(item.promotions)) {
                            item.promotions = [];
                            item.priceAfterDiscount = $scope.calcPriceAfterDiscount(item,promo);
                        }
                        else {
                            item.priceAfterDiscount = MathUtil.min(
                                $scope.calcPriceAfterDiscount(item,promo),
                                item.priceAfterDiscount
                            );
                        }
                        item.promotions.push(promo);
                        break;
                    }
                }
            }

            if(menuTypes.length>0){
                $scope.curMenuType = menuTypes[0];
                $scope.search_result = $scope.curMenuType.menuItems;
            }else{
                $scope.curMenuType=[];
                $scope.search_result=[];
            }


        });
    });

    $scope.$on('menu.items.add',function(event,msg){
        var item = msg.item;
        TranslateMenuItemImageUrl(item);
        item.promoClass = 'menu-promotion-btn';
        item.promoHref = '#/promotion_add/'+item.prod_id;
        item.promoIcon = 'icon-plus-sign';
        item.promotions = [];
        item.typeName = $scope.curMenuType.name;

        $scope.menu_items.unshift(item);

        $scope.menu_items = _.sortBy($scope.menu_items,'display_order');


        $scope.curMenuType.menuItems.unshift(item);

        $scope.curMenuType.menuItems = _.sortBy($scope.curMenuType.menuItems,'display_order');


        on_search();
        //Ken 2015-01-05 : 'menu.items.add' called by [ajax callback], so we have to invoke $apply manually
    });

    $scope.$on('menu.items.delete',function(event,msg){
        var id = msg.id;
        _.remove($scope.menu_items,function(item){
            return item.prod_id==id;
        });
        _.remove($scope.curMenuType.menuItems,function(item){
            return item.prod_id==id;
        });
        on_search();
    });

    $scope.$on('menu.items.update',function(event,msg){
        var item = msg.item;
        var id = item.prod_id;
        if(item.type_id!=$scope.curMenuType.type_id) {
            _.remove($scope.curMenuType.menuItems,function(item){
                return item.prod_id==id;
            });
            var new_menu_type = _.find($page.menu_types,function(type){
                return type.type_id == item.type_id;
            });
            new_menu_type.menuItems.push(item);
            $scope.menu_items = _.sortBy($scope.menu_items,'display_order');
            new_menu_type.menuItems = _.sortBy(new_menu_type.menuItems,'display_order');
        }
        else {
            var old_item = _.find($scope.menu_items,function(_o){
                return _o.prod_id == item.prod_id;
            });

            Object.copy(item,old_item,[
                'biz_id',
                'calorie',
                'description',
                'description_lang',
                'img_url',
                'img_url_80',
                'img_url_240',
                'img_url_600',
                'img_url_s',
                'img_url_m',
                'img_url_l',
                'ingredient',
                'name',
                'name_lang',
                'price',
                'priceAfterDiscount',
                'prod_id',
                'special',
                'spiciness',
                'display_order',
                'extend',
                'unitofmeasure',
                'label',
                'prod_label',
                'sold_out_flag'
            ]);

            $scope.curMenuType.menuItems = _.sortBy($scope.curMenuType.menuItems,'display_order');
        }
        on_search();

    });

    function on_search() {
        $scope.search_result=[];
        $scope.search_result = _.filter($scope.curMenuType.menuItems,function(_p){
            var name = _p.name ? _p.name.toLowerCase() : '';
            var name_lang = _p.name_lang ? _p.name_lang.toLowerCase() : '';
            var keyword = $scope.search_keyword.toLowerCase();
            var ret = name.indexOf(keyword)>-1 || name_lang.indexOf(keyword)>-1;
            if($scope.filter_special)
                ret = ret & _p.special;
            return ret;
        });

        if($scope.search_result.length>0){
            setTimeout(function(){
                $scope.$apply();
            },1)

        }
    }

    $scope.$watch('search_keyword',function(to,from){
        if(to && to.length>=MIN_SEARCH_CHAR_LENGTH) {
            clearTimeout(search_timeout);
            search_timeout = $timeout(on_search,DELAY);
            console.log('search_keyword',to);
        }
        else if(to.length==0){
            $scope.search_result = $scope.curMenuType.menuItems;
        }
    });

    $scope.$watch('filter_special',function(to,from){
        on_search();
    });

    //function
    $scope.calcPriceAfterDiscount = function(item,promo) {
        var retVal = 0;
        if(promo.discount_pct>0) {
            retVal = MathUtil.max(item.price*(1-promo.discount_pct*0.01),0);
        }
        else if(promo.discount_amount>0) {
            retVal = MathUtil.max(item.price - promo.discount_amount,0);
        }
        else
            retVal = item.price;
        return retVal;
    };

    $scope.onChangeMenuType = function(new_type) {
        $scope.curMenuType = new_type;
        on_search();
    };

    $scope.onClearFilter = function() {
        $scope.filter_special = false;
        $scope.search_keyword = '';
    };

    $scope.onPrintMenu = function(size) {
        var url = "/biz/"+$rootScope.bizId+"/menupdf";

        if (size=='regular'){
            url="/biz/"+$rootScope.bizId+"/menupdf/"+gBrowser.pageSize.regular;
        }else if (size=='large'){
            url="/biz/"+$rootScope.bizId+"/menupdf/"+gBrowser.pageSize.large;
        }
        if(gBrowser.map.gaode) {
            url += "?map=gaode";
        }
        else {
            url += "?map=google";
        }
        window.open(url);
    };

    $scope.showMenuItemDetail = function(item) {
        $rootScope.$broadcast('menu.item_detail.show',{item:item,type:$scope.curMenuType});
    };

    $scope.addMenuItem = function() {
        $rootScope.$broadcast('menu.item_detail.add',{type:$scope.curMenuType});
    };

    $scope.onActiveChange = function(item) {
        item.disabled_for_page = true;
        var tmpObj = {};
        angular.copy(item,tmpObj);
        tmpObj.active = item.active==true ? 0 : 1; //angular will change module first then go ng-click, so we need the reverse logic here
        $mp_ajax.put('/biz/'+item.biz_id+'/prodActive/'+item.prod_id,tmpObj,function(data){
            if(data.success) {
                item.disabled_for_page = false;
            }
        },function(data){
            item.disabled_for_page = false;
            item.active = !item.active;
            ErrorBox(L.msg_operate_fail);
        });
    };

    $scope.onSpecialChange = function(item) {
        item.disabled_for_page = true;
        var tmpObj = {};
        angular.copy(item,tmpObj);
        tmpObj.special = item.special==true ? 0 : 1; //angular will change module first then go ng-click, so we need the reverse logic here
        $mp_ajax.put('/biz/'+item.biz_id+'/specialProduct/'+item.prod_id,tmpObj,function(data){
            item.disabled_for_page = false;
        },function(data){
            item.disabled_for_page = false;
            item.active = !item.active;
            ErrorBox(L.msg_operate_fail);
        });
    };

    OnViewLoad();
}] );

app.controller("menuAddAndUpdateController", ['$rootScope','$scope','$routeParams','$mp_ajax','$location','$mp_json','$window','$q',function($rootScope,$scope,$routeParams,$mp_ajax,$location,$mp_json,$window,$q) {

    var L = $rootScope.L;
    $rootScope.types=[];
    var $parent = $scope.$parent;
    var $page = $scope.$parent;
    $scope.is_edit = false;
    $scope.is_clear_img = false;
    var $table=$('#typeTable');
    $scope.checkedLabelArr=[];

    //set spinner
    $('#menu_add_spiciness').ace_spinner({
        value:0, min:0, max:5, step:1, on_sides: true,
        icon_up:'icon-plus smaller-75',
        icon_down:'icon-minus smaller-75',
        btn_up_class:'btn-danger' ,
        btn_down_class:'btn-success'
    });
    //change style from ace framework to ourselves
    var $spiciness = $('#menu_add_spiciness').parent().parent();
    $spiciness.css("width","");

    function SetDefaultItem() {
        $scope.menuItem = {};
        $scope.menuItem.img_url_240 = "/image/default_item_pic_240.png";
        $scope.is_edit = false;
        $scope.menuItem.togo = true; //set default value
        $scope.menuItem.active = true; //set default value
        $scope.menuItem.price = 0;
        $scope.menuItem.calorie = 0;
        $scope.menuItem.display_order = 1;
        $spiciness.spinner('value',0);
        $scope.menuItem.extend=[];
        $scope.menuItem.lalel=[];
       /* $scope.$apply();*/
    }
    SetDefaultItem();

    function nullCheckbox(){
        var tableData= $rootScope.types;
        for(var i=0;i<tableData.length;i++){
            tableData[i].checkbox=false;
        }
        $table.bootstrapTable('load', {
            data:$.extend(true, {}, $rootScope.types)
        });
    }

    $scope.$on('menu.item_detail.add',function(event,msg){
        $scope.menuItem.extend=[];
        $scope.menuItem.sold_out_flag='0';
        $scope.autoCompleteArr=[];
        nullCheckbox();
        $scope.temyLabel();
        $('#typeTable').bootstrapTable('load', {
            data: $.extend(true,  [], $rootScope.types)
        })
        if(!_.find($page.menu_tabs.tabs,{name: $page.L.item_detail})) {
            $page.menu_tabs.on_loaded = function(){
                $rootScope.$broadcast('menuItem.switch_to_tab',{index:4});
            };
            $page.menu_tabs.tabs.push( { name: $page.L.item_detail, icon: 'icon-inbox' } );
        }
        else {
            $rootScope.$broadcast('menuItem.switch_to_tab',{index:4});
        }

        $scope.is_clear_img = false;
        $scope.is_edit=false;
        SetDefaultItem();
        var type = msg.type;
        //$scope.menuItem = {img_url:null,price:0,calorie:0};//clear data remains, fire ng update
        TranslateMenuItemImageUrl($scope.menuItem);
        $scope.menuItem.type_id = type.type_id;

        $scope.onMenuItemSubmit = function(isFormValid) {
            if(!isFormValid) {
                WarningBox('Please confirm the information again');
                return false;
            }
            //api expects integer on 'togo' and 'active' columns
            angular.element("#menu_add_togo").val($scope.menuItem.togo==true ? 1:0);
            angular.element("#menu_add_active").val($scope.menuItem.active==true ? 1:0);

            g_loading.show();

            /**
             * param1 =  form's id
             * param2 =  url
             * param3 =  success function
             * */
            var item={};
            $mp_ajax.formPost($('#menuItemForm'),'/biz/'+$rootScope.bizId+'/prod',
                function(data){
                    if(data.prodId>0) {
                        item = {
                            prod_id: data.prodId,
                            active: true,
                            biz_id: $rootScope.bizId,
                            name: $scope.menuItem.name,
                            name_lang: $scope.menuItem.name_lang,
                            description: $scope.menuItem.description,
                            description_lang: $scope.menuItem.description_lang,
                            ingredient: $scope.menuItem.ingredient,
                            type_id: $scope.menuItem.type_id,
                            calorie: $scope.menuItem.calorie,
                            spiciness: $spiciness.spinner('value'),
                            price: $scope.menuItem.price,
                            //#319
                            priceAfterDiscount: 0,
                            img_url: data.productImgUrl,
                            special: false,
                            togo: $scope.menuItem.togo,
                            display_order:$scope.menuItem.display_order,
                            extend:$scope.menuItem.extend,
                            label:$scope.checkedLabelArr,
                            prod_label:$scope.menuItem.prod_label,
                            sold_out_flag:0
                        };
                        $rootScope.$broadcast('menu.items.add',{item:item});
                        $rootScope.$broadcast('menuItem.switch_to_tab',{index:3});
                        g_loading.hide();
                    }
                },function(data){
                    console.error("create menu item error, msg = "+data.responseJSON.message);
                    if(data.responseJSON.message.slice(0,29) == "ER_DUP_ENTRY: Duplicate entry"){
                        ErrorBox(L.error_msg_duplicate_entry);
                    }
                    g_loading.hide();
                }
            )
        };

    });

    // file upload with preview
    var $file_input = $('.mp-file-upload').next();
    var $image = $($('.mp-file-upload img')[0]);
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
            $file_input.trigger('click');
        });
    }

    $scope.$on('menu.item_detail.show',function(event,msg){
        $scope.typeCancel();
        $scope.autoCompleteArr=[];
        $scope.checkedLabelArr=[];
        nullCheckbox();
        $scope.temyLabel();
        $scope.menuItem.extend=[];
        $scope.menuItem.sold_out_flag='0';
        if(!_.find($page.menu_tabs.tabs,{name: $page.L.item_detail})) {
            $page.menu_tabs.on_loaded = function(){
                $rootScope.$broadcast('menuItem.switch_to_tab',{index:4});
            };
            $page.menu_tabs.tabs.push( { name: $page.L.item_detail, icon: 'icon-inbox' } );
        }
        else {
            $rootScope.$broadcast('menuItem.switch_to_tab',{index:4});
        }

        //#322
        $file_input.val('');

        $scope.is_clear_img = false;
        angular.copy(msg.item,$scope.menuItem);
        $image.attr('src',$scope.menuItem.img_url_600);//Ken 2015-01-05 : same image_url would not fire ng-src to update src automatically
        var item = $scope.menuItem;
        if($scope.menuItem.sold_out_flag){
            $scope.menuItem.sold_out_flag=$scope.menuItem.sold_out_flag.toString();
        }
        $scope.is_edit = true;
        $spiciness.spinner('value',item.spiciness);

        if($scope.menuItem.label){
            $scope.checkedLabelArr=$scope.menuItem.label;
        }

        $scope.labelParams=$scope.formateLabelParams($scope.menuItem.label);
        setExtend();


        $scope.onMenuItemSubmit = function(isFormValid) {
            if(!isFormValid) {
                WarningBox('Please confirm the information again');
                return false;
            }
            var paramObj = {};
            angular.copy($scope.menuItem,paramObj);
            paramObj.label=$scope.labelParams;
//            paramObj.name = $scope.menuItem.name;
            paramObj.spiciness = $spiciness.spinner('value');
            $mp_json.translateBoolean2Integer(paramObj);

            function UpdateItemDataPromise(img_url) {
                var deferred = $q.defer();
                if(!_.isUndefined(img_url)){
                    paramObj.img_url = img_url;
                }
                $mp_ajax.put('/biz/'+$scope.menuItem.biz_id+'/prod/'+$scope.menuItem.prod_id, paramObj,function(data){
                    $scope.menuItem.spiciness = paramObj.spiciness;
                    if(!_.isUndefined(img_url)){
                        $scope.menuItem.img_url = img_url;
                        TranslateMenuItemImageUrl($scope.menuItem);
                    }
                    $rootScope.$broadcast('menu.items.update',{item:$scope.menuItem});
                    $rootScope.$broadcast('menuItem.switch_to_tab',{index:3});
                    deferred.resolve();
                },function(data){
                    deferred.reject();
                    console.error("create menu item error, msg = "+data.message);
                    if(data.message.indexOf("ER_DUP_ENTRY: Duplicate entry")==0){
                        ErrorBox(L.error_msg_duplicate_entry);
                    }
                });
                return deferred.promise;
            }

            g_loading.show();
            if($scope.is_clear_img && $('input[name=image]').val()=='') { //clear image
                $mp_ajax.put('/biz/'+$rootScope.bizId+'/prod/'+$scope.menuItem.prod_id+'/clearImage',{}, function(data){
                    UpdateItemDataPromise(null).finally(function(){
                        g_loading.hide();
                    });
                });
            }
            else if($('input[name=image]').val()=='') { //just update item
                UpdateItemDataPromise().finally(function(){
                    g_loading.hide();
                });
            }else if($('input[name=image]').val()=='' && $scope.menuItem.img_url!=''){
                UpdateItemDataPromise($scope.menuItem.img_url).finally(function(){
                    g_loading.hide();
                });
            }
            else { //update image first then item
                $mp_ajax.formPost($('#menuItemForm'),'/biz/'+$rootScope.bizId+'/prod/'+$scope.menuItem.prod_id+'/image',function(data){
                    console.log(data);
                    UpdateItemDataPromise(data).finally(function(){
                        g_loading.hide();
                    });
                },function(error){
                    g_loading.hide();
                    ErrorBox("Operation failed");
                });
            }
        }
    });


    $scope.onBack = function() {
        $rootScope.$broadcast('menuItem.switch_to_tab',{index:3});
    };

    $scope.deleteMenuItemPicture = function() {
        $scope.is_clear_img = true;
        $file_input.val('');
        $scope.menuItem.img_url = null;
        TranslateMenuItemImageUrl($scope.menuItem);
    };

    $scope.deleteMenuItem = function(item) {
        $( "#dialog-confirm" ).removeClass('hide').dialog({
            resizable: false,
            modal: true,
            buttons: [
                {
                    html: "<i class='icon-trash bigger-110'></i>&nbsp; "+ L.delete,
                    "class" : "btn btn-danger btn-xs",
                    click: function() {
                        var confirmDlg = $( this );
                        $mp_ajax.delete('/biz/'+item.biz_id+'/prod/'+item.prod_id,function(data){
                            //if server return succeed, remove it in angular's scope
                            if(data.succeed==true) {
                                confirmDlg.dialog( "close" );
                                $rootScope.$broadcast('menu.items.delete',{id:item.prod_id});
                                $rootScope.$broadcast('menuItem.switch_to_tab',{index:3});
                            }
                        });
                    }
                }
                ,
                {
                    html: "<i class='icon-remove bigger-110'></i>&nbsp; "+ L.cancel,
                    "class" : "btn btn-xs",
                    click: function() {
                        $( this ).dialog( "close" );
                    }
                }
            ]
        });

    };


    function initTable() {
        var tableData=[];
        var detailData=[];
        window.tableEvents = {
            'click .showChild': function (e, value, row, index) {
                var iconTarget = $(e.currentTarget);
                var tableData =$table.bootstrapTable('getData');
                if (iconTarget.hasClass('icon-minus')) {
                    iconTarget.removeClass('icon-minus').addClass('icon-plus');
                    for (var indexH = 0; indexH < tableData.length; indexH++) {
                        if (tableData[indexH].parent_id === row.id && tableData[indexH].extend_type==1) {
                            $table.bootstrapTable('hideRow', {
                                index: indexH
                            })
                        }
                    }
                } else {
                    iconTarget.removeClass('icon-plus').addClass('icon-minus');
                    for (var indexE = 0; indexE < tableData.length; indexE++) {
                        if (tableData[indexE].parent_id === row.id) {
                            $table.bootstrapTable('showRow', {
                                index: indexE
                            })
                        }
                    }
                }
                $table.bootstrapTable('resetView');
            }
        };
        var typeClassForamt=function (value, row) {
            if (value === 0) {
                return L.type_class_first;
            } else if(value === 1) {
                return L.type_class_second;
            }
        }

        var parentForamt=function (value,row) {
            for(var i=0;i<$rootScope.types.length;i++){
                if(value==$rootScope.types[i].id){
                    return $rootScope.types[i].extend_name
                }
            }
        }

        function inputFormat(value, row) {
            if(value===1 || value===true){
                return true
            }else if(value===0 || value===false){
                return false
            }
        }

        var currentRow='';
        function priceFormat(value, row) {
            currentRow=row
            if(row.extend_type===1){
                return value
            }else if(row.extend_type===0){
                return ''
            }
        }

        function menuNameFormatter(value, row) {
            var formatValue = '';
            if (row.extend_type === 0) {
                formatValue = '<span class="glyphicon glyphicon-minus icon-minus detail-icon showChild"><i class="hidden">' + row.op_id + '</i></span>' + value;
                return formatValue
            } else if (row.extend_type === 1) {
                formatValue = '<span class="indent"></span><span class="indent"></span>' + value;
                return formatValue
            }

        }

        $table.bootstrapTable({
            columns: [
                {
                    field: 'checkbox',
                    checkbox: true,
                    formatter: inputFormat
                },
                {
                    field: 'extend_name',
                    align: 'left',
                    title:  L.type_name_cn,
                    formatter: menuNameFormatter,
                    events: tableEvents
                },
                BTRowFormat('extend_name_lan', L.type_name_en),
                BTRowFormatWithFormatter('extend_type', L.type_class,typeClassForamt),
                BTRowFormatWithFormatter('parent_id', L.type_parent_class,parentForamt),
                BTRowFormatEdNum('extend_price',L.type_price,priceFormat),
                BTRowFormat('remark',L.remark)
            ],
            clickToSelect:false,
            idField: 'id',
            uniqueId: 'id',
            locale: 'zh-CN',
            undefinedText:'',
            onCheckAll: function (rows,$detail) {
                var tableData=$table.bootstrapTable('getData');
                for (var i = 0; i < tableData.length; i++) {
                    tableData[i].checkbox = true;
                }
                var tableSroll=$table.bootstrapTable('getScrollPosition');
                $table.bootstrapTable('load', {
                    data:tableData
                });
                $table.bootstrapTable('scrollTo',tableSroll);
            },
            onUncheckAll: function (rows,$detail) {
                var tableData=$table.bootstrapTable('getData');
                for (var i = 0; i < tableData.length; i++) {
                    tableData[i].checkbox = false;
                }
                var tableSroll=$table.bootstrapTable('getScrollPosition');
                $table.bootstrapTable('load', {
                    data:tableData
                });
                $table.bootstrapTable('scrollTo',tableSroll);
            },
            onCheck: function (row, index,$element) {
                var rowData=row;
                var tableData=$table.bootstrapTable('getData');
                if(rowData.extend_type==1){
                    for(var j=0;j<tableData.length;j++){
                        if (tableData[j].id === row.parent_id) {
                            tableData[j].checkbox = true;
                        }
                    }
                }
                var tableSroll=$table.bootstrapTable('getScrollPosition');
                $table.bootstrapTable('load', {
                    data: tableData
                })
                $table.bootstrapTable('scrollTo',tableSroll);
            },
            onUncheck: function (row, $element) {
                var rowData=row;
                var tableData=$table.bootstrapTable('getData');
                if(rowData.extend_type==0){
                    for(var j=0;j<tableData.length;j++){
                        if (tableData[j].parent_id === row.id && tableData[j].extend_type==1 ) {
                            tableData[j].checkbox = false;
                        }
                    }
                }
                var tableSroll=$table.bootstrapTable('getScrollPosition');
                $table.bootstrapTable('load', {
                    data: tableData
                })
                $table.bootstrapTable('scrollTo',tableSroll);
            },
            onPostBody: function() {
                $('[data-toggle="popover"]').each(function() {
                    $(this).popover()
                })
            }
        })

        changeTableClass($table)
    }

    $scope.showAddType = function () {
        var typeDialog = $('#add_type_form');
        var rect = GetCenterPosition(typeDialog);
        typeDialog.css('left', rect.left + 'px');
        typeDialog.show();
        $('#typeTable').bootstrapTable('scrollTo',0);
    };

    $scope.typeCancel = function () {
        $('.typeCheckbox').attr("checked",false);
        $('#add_type_form').hide();
    };

    var setArr=[];
    $scope.onSubmit=function () {
        setArr=[];
        $scope.menuItem.extend=[];
        var tableData=$table.bootstrapTable('getData');
        for(var i=0;i<tableData.length;i++){
           if(tableData[i].checkbox==true){
               var tem={
                   id:tableData[i].id,
                   extend_price:tableData[i].extend_price
               }
               $scope.menuItem.extend.push(tem);
           }
        }
        $scope.menuItem.extendParams=JSON.stringify($scope.menuItem.extend);
        $('#add_type_form').hide();
    }

    function setExtend() {
        var tableData=$.extend(true,  [], $rootScope.types);
        for(var i=0;i<$scope.menuItem.extend.length;i++){
            for(var j=0;j<tableData.length;j++){
               if($scope.menuItem.extend[i].id==tableData[j].id){
                   tableData[j].checkbox=true;
                   tableData[j].extend_price=$scope.menuItem.extend[i].extend_price;
               }
            }
        }
        for(var i=0;i<$scope.menuItem.extend.length;i++){
            for(var j=0;j<tableData.length;j++){
                if($scope.menuItem.extend[i].itemArr){
                    for(var k=0;k<$scope.menuItem.extend[i].itemArr.length;k++){
                        if($scope.menuItem.extend[i].itemArr[k].id==tableData[j].id && $scope.menuItem.extend[i].itemArr[k].extend_type==1 ){
                            tableData[j].checkbox=true;
                            tableData[j].extend_price=$scope.menuItem.extend[i].itemArr[k].extend_price;
                        }
                    }
                }
            }
        }
        $table.bootstrapTable('load', {
            data:  $.extend(true,  [], tableData)
        });

    }


    //百度翻译
    $scope.baiduTranslate = function (name) {
        var params={
            lang: $.cookie('lang'),
            name:name
        };
        $mp_ajax.post('/baiduTranslate',params,function(data){
            if(data.succeed){
                console.log('baiduTranslate:'+data)
                $scope.menuItem.name_lang=data.result.dst;
            }else{
                console.error(data);
            }
        });
    };

    $scope.autoCompleteArr=[];
    $scope.searchName=function () {
        $scope.autoCompleteArr=[];
        var menuItemName=$('#menuItemName').val();
        if(menuItemName){
            $mp_ajax.get('/cust/do/searchProdLike?name='+menuItemName).then(function (data) {
                if (_.isArray(data.data.hits))
                    var temy=data.data.hits;
                    TranslateMenuNameItemImageUrl(temy);
                    for(var i in temy) {
                        $scope.autoCompleteArr.push(temy[i]);
                    }
            });
            $scope.baiduTranslate(menuItemName);//百度翻译
        }else{
            $scope.$apply();
        }

    }



    //监听name输入框
    $('#menuItemName').bind('input propertychange', function() {
        window.setTimeout(function () {
            $scope.searchName();
        },100);
    });

    $scope.repeatData=function (data) {
        var temporaire=data._source;
        $scope.menuItem.name=temporaire.prodName;
        $scope.menuItem.name_lang=temporaire.prodNameLang;
        $scope.menuItem.description=temporaire.description;
        $scope.menuItem.price=temporaire.price;
        $scope.menuItem.unitofmeasure=temporaire.unitofmeasure;
        console.log('temporaire');
        console.log(temporaire);
        if(temporaire.imgUrl!==null){
            $scope.menuItem.img_url_600=temporaire.imgUrl_600;
            $scope.menuItem.img_url_240=temporaire.imgUrl_240;
            $scope.menuItem.img_url=temporaire.imgUrl;
            $image.attr('src',$scope.menuItem.img_url_600);
            $file_input.val('');
        }
    };

    $scope.showLabelModal=function () {
        $('#label_form').modal('show');
    };

    $scope.typeLabelCancel=function () {
        $('#label_form').modal('hide');
    }

    $scope.formateLabelParams=function (data) {
        var params=[];
        var nameString='';
        for(var i in data){
            var temy={
                labelId:data[i].id,
                labelName:data[i].label_name,
            }
            if(i==data.length-1){
                nameString=nameString+data[i].label_name;
            }else{
                nameString=nameString+data[i].label_name+'/';
            }
            params.push(temy);
        }
        return params
    }



    $scope.labelSubmit=function () {
        $scope.labelParams=[];
        $scope.labelParams=$scope.formateLabelParams($scope.checkedLabelArr);
        var nameString='';
        for(var i in $scope.checkedLabelArr){
            nameString=nameString+$scope.checkedLabelArr[i].label_name+'/';
        }
        $scope.menuItem.prod_label=nameString;
        $('#label_form').modal('hide');
    };

    $scope.addLabel=function (label) {
        for(var i in $scope.checkedLabelArr){
            if(label.id==$scope.checkedLabelArr[i].id){
                return
            }
        }
        $scope.checkedLabelArr.push(label);
    };

    $scope.addEidteLabel = function () {
        var labelName = $('#labelSearch').val();
        if (labelName) {
            var temy = {
                id:'',
                label_name: $('#labelSearch').val(),
            }
            console.log('$scope.checkedLabelArr');
            console.log($scope.checkedLabelArr);
            $scope.checkedLabelArr.push(temy);
        }
    }

    $scope.removeLabel=function (label) {
        for(var i in $scope.checkedLabelArr){
            if(label.id==$scope.checkedLabelArr[i].id){
                $scope.checkedLabelArr.splice(i,1);
            }
        }
    };

    $scope.getLabelList=function () {
        var labelSearch=$('#labelSearch').val();
        if(labelSearch){
            $mp_ajax.get('/allLabel?lableName='+labelSearch).then(function (data) {
                if (_.isArray(data.data))
                    $scope.labelList=data.data;
            });
        }else{
            $scope.labelList=[];
        }

    }

    $scope.temyLabel=function () {
        $('#labelSearch').val('');
        $scope.labelList=[];
        $scope.checkedLabelArr=[];
        $scope.labelParams=[];
    }


    //监听标签输入框
    $('#labelSearch').bind('input propertychange', function() {
        window.setTimeout(function () {
            $scope.getLabelList();
        },100);
    });


    $(function () {
        window.setTimeout(function () {
            initTable();
           /* getTypeList();*/
        },500)
    });

    //move page-content a little bit down in case of tabs cover part of it
    OnViewLoad();

}] );

app.controller("setting_tab_type_controller", ['$rootScope','$scope','$mp_ajax','$location','$routeParams',function($rootScope,$scope,$mp_ajax ,$location,$routeParams) {
    var L = $rootScope.L;
    $scope.typesList = [];
    $scope.fristTypes=[];
    $scope.edit_types = {
        extendName:'',
        extendNameLan:'',
        extendPrice:'',
        parentId:'',
        remark:'',
        extendId:'',
        extendType:0
    };
    var dialog = $('#setting_add_type_form');
    var $table=$('#settingtypeTable');
    var apiUrl='/biz/'+$rootScope.bizId+'/printer';
    $scope.func = {
        menu_item:false,
        promotion:true,
        order: $rootScope.bizInfo.order_status==1 ? true : false
    };

    function nullEditTypes() {
        $scope.edit_types = {
            extendName:'',
            extendNameLan:'',
            extendPrice:0,
            parentId:'',
            remark:'',
            extendId:'',
            extendType:0
        };
    }

    function _ShowBox(row) {
        dialog.show();
        var rect = GetCenterPosition(dialog);
        dialog.css('left',rect.left+'px');
        g_mask.show();
        if(row) {
            $scope.is_edit = true;
            $scope.edit_types=[];
            $scope.edit_types={
                extendName: row.extend_name,
                extendNameLan:row.extend_name_lan,
                extendPrice:row.extend_price,
                parentId:row.parent_id,
                remark:row.remark,
                extendId:row.id,
                extendType:row.extend_type
            };
            $scope.$apply(function() {});

            console.log($scope.edit_types)
        }
        else {
            nullEditTypes();
            $scope.is_edit = false;
        }
    }

    function _HideBox() {
        dialog.hide();
        g_mask.hide();
        nullEditTypes();
        $scope.cur_printer = null;
    }

    $scope.onBtnNewTest = function() {
        _ShowBox();
    };
    $scope.onCancel = function() {
        _HideBox();
    };


    function initTable() {
        var typeClassForamt=function (value, row) {
            if (value === 0) {
                return L.type_class_first;
            } else if(value === 1) {
                return L.type_class_second;
            }
        }

        var parentForamt=function (value,row) {
            for(var i=0;i<$scope.fristTypes.length;i++){
                if(value==$scope.fristTypes[i].id){
                    return $scope.fristTypes[i].extend_name
                }
            }
        }
        function expandTable (index,row, $detail) {
            var $el = $detail.html('<table></table>').find('table');
            var data = row.itemArr;
            window.tableEvents = {
                'click .delete2': function(e, value, row, index) {
                }
            }

            $el.bootstrapTable({
                data: data,
                undefinedText:'',
                columns: [
                    BTRowFormat('extend_name', L.type_name_cn),
                    BTRowFormat('extend_name_lan', L.type_name_en),
                    BTRowFormatWithFormatter('extend_type', L.type_class,typeClassForamt),
                    BTRowFormatWithFormatter('parent_id', L.type_parent_class,parentForamt),
                    BTRowFormat('extend_price',L.type_price),
                    BTRowFormat('remark',L.remark)
                ],
                onClickRow:function (index, row) {
                    _ShowBox(index);
                }
            })
        }

        $table.bootstrapTable({
            columns: [
                BTRowFormat('extend_name', L.type_name_cn),
                BTRowFormat('extend_name_lan', L.type_name_en),
                BTRowFormatWithFormatter('extend_type', L.type_class,typeClassForamt),
                BTRowFormat('extend_price',L.type_price),
                BTRowFormat('remark',L.remark)
            ],
            idField: 'file_id',
            uniqueId: 'file_id',
            clickToSelect: true,
            locale: 'zh-CN',
            detailView:true,
            undefinedText:'',
            onExpandRow: function (index, row, $detail) {
                expandTable(index,row, $detail)
            },
            onClickRow:function (index, row) {
                _ShowBox(index);
            }
        })
        changeTableClass($table)
    }

    var getTypeList=function () {
        $scope.fristTypes=[];
        $scope.typesList=[];
        $mp_ajax.promiseGet('/biz/'+$rootScope.bizId+'/extend').then(function(data){
            if(_.isArray(data))
                $scope.typesList = data;
                for(var i=0;i<$scope.typesList.length;i++){
                    if($scope.typesList[i].extend_type==0){
                        $scope.fristTypes.push($scope.typesList[i]);
                    }
                }
                $table.bootstrapTable('load', {
                    data: $.extend(true,  [], $scope.typesList)
                })

                //更新types
                var  types= data;
                $rootScope.types=[];
                for(var i=0;i<types.length;i++){
                    $rootScope.types.push(types[i]);
                    for(var j=0;j<types[i].itemArr.length;j++){
                        $rootScope.types.push(types[i].itemArr[j]);
                    }
                }
                $('#typeTable').bootstrapTable('load', {
                    data: $.extend(true, [],$rootScope.types)
                })
        });
    };


    $scope.onSubmit = function() {
        var params=$scope.edit_types;
        if($scope.edit_types.extendName==''  || $scope.edit_types.extendName===null){
            ErrorBox(L.type_name_cn_null);
            return
        }
        if($scope.edit_types.extendType==='' || $scope.edit_types.extendType===null){
            ErrorBox(L.type_class_null);
            return
        }
        if($scope.edit_types.extendPrice==='' || $scope.edit_types.extendPrice===null){
            ErrorBox(L.type_price_null);
            return
        }
        if($scope.edit_types.extendType==1 && (  $scope.edit_types.parentId===''  || $scope.edit_types.parentId===null)){
            ErrorBox(L.type_parent_null);
            return
        }

        if(params.parentId==''){
            delete params.parentId
        }else {
            params.parentId=parseInt(params.parentId);
        }
        params.bizId= $rootScope.bizId;
        if ($scope.is_edit) {
            $mp_ajax.promisePut('/biz/' + $rootScope.bizId + '/extend/' + $scope.edit_types.extendId, params).then(function (data) {
                if (data.success) {
                    _HideBox();
                    getTypeList();
                } else {
                    ErrorBox(L.msg_operate_fail);
                }
            }, function (error) {
                ErrorBox(L.msg_operate_fail);
            });
        }else{
            $mp_ajax.post('/biz/'+$rootScope.bizId+'/extend',params,function(data){
                if(data.success){
                    getTypeList();
                    _HideBox();
                }else{
                    ErrorBox(L.msg_operate_fail);
                }

            },function(error){
                ErrorBox(L.msg_operate_fail);
            });
        }
    }

    $scope.onDelete = function() {
        g_loading.show();
        var params={
            extendType:$scope.edit_types.extendType
        }
        $mp_ajax.delete('/biz/'+$rootScope.bizId+'/extend/'+$scope.edit_types.extendId,params,function(data){
            g_loading.hide();
            SuccessBox(L.msg_operate_succeed);
            _HideBox();
            getTypeList();
        },function(error) {
            console.log(error);
            g_loading.hide();
            ErrorBox(L.msg_operate_fail);
        });
    };

    $(function () {
        window.setTimeout(function () {
            initTable();
            getTypeList();
        },100)
    });


}]);

