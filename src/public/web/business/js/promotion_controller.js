/**
 * Created by Ken on 2014-4-18.
 */
app.controller("promotionController", ['$rootScope','$scope','$routeParams','$mp_ajax','$location','$mp_json','$cookieStore','$timeout','$q', function($rootScope,$scope,$routeParams,$mp_ajax,$location,$mp_json,$cookieStore,$timeout,$q) {

    var L = $rootScope.L;
    $scope.promotions_tabs = {
        id:'promotion_tab',
        tabs: [
            {
                name: L.menu_promotion,
                icon: 'icon-gift',
                active: true
            },
            {
                name: L.promotion_detail,
                icon: 'icon-inbox'
            }
        ]
    };
    $scope.$on('promotion.switch_to_tab',function(event,msg){
        $scope.promotions_tabs.change_tab(msg.index);
    });
}]);

app.controller("promotionListController", ['$rootScope','$scope','$routeParams','$mp_ajax','$location','$mp_json','$cookieStore','$q',function($rootScope,$scope,$routeParams,$mp_ajax,$location,$mp_json,$cookieStore,$q) {

    var L = $rootScope.L;
    console.log("promotionList_controller.js");
    var $parent = $scope.$parent;
    var $page = $scope.$parent;

    $scope.menuItemId = $routeParams.menuItemId;
    //#123 create object $scope.days for adding week schedule
    $scope.days = [
        {name:'Sun',id:0},
        {name:'Mon',id:1},
        {name:'Tue',id:2},
        {name:'Wed',id:3},
        {name:'Thr',id:4},
        {name:'Fri',id:5},
        {name:'Sat',id:6}
    ];
    var getPromoUrl = '';
    if($routeParams.menuItemId) {
        getPromoUrl = '/biz/' + $rootScope.bizId + '/prod/'+$routeParams.menuItemId+'/promo';
    } else {
        getPromoUrl = '/biz/' + $rootScope.bizId + '/promo?active=1';
    }

    function promiseLoadPromotions() {
        var deferred = $q.defer();
        $mp_ajax.get(getPromoUrl,function (data) {
            $scope.promotions = data;
            var cur_date = new Date();
            //translate discount text
            for(var i in $scope.promotions) {
                var promo = $scope.promotions[i];
                if (promo.prod_id == null){promo.order_level = true;}
                else {promo.order_level = false;}
                promo.discountText = promo.discount_pct>0 ? promo.discount_pct+'%' : '$'+promo.discount_amount;
                //#123: store week schedule as a string into promo.validDay
                promo.valid = '';
                var valid_count = 0;
                promo.validDay = '';
                for(var j in $scope.days) {
                    if (promo.week_sched & 1<<$scope.days[j].id)
                    if (promo.week_sched & 1<<$scope.days[j].id){
                        promo.validDay += ','+$scope.days[j].name;
                        valid_count++;
                    }
                }
                if(valid_count==7)
                    promo.validDay = '['+L.entire_week+']';
                else
                    promo.validDay = promo.validDay.substring(1);
                if(new Date(promo.end_date)>=cur_date) {
                    promo.status_desc = L.valid;
                }
                else {
                    promo.status_desc = L.expired;
                }
            }
            quickSort(0, ($scope.promotions.length - 1));
            return deferred.resolve(data);
        },function (data) {
            console.error(data);
            return deferred.reject("can't load promotions");
        });
        return deferred.promise;
    }

    function promiseLoadMenuItems() {
        var deferred = $q.defer();
        $mp_ajax.get('/biz/'+$rootScope.bizId+'/prodBase',function(data){
            for(var i in data) {
                if(parseInt($scope.menuItemId) == data[i].prod_id) {
                    $scope.title = "------ " + data[i].name + " | " + data[i].name_lang;
                    break;
                }
            }
            return deferred.resolve(data);
        },function (data) {
            console.error(data);
            return deferred.reject("can't load menu items");
        });
        return deferred.promise;
    }
    //set menu-item-name of promotion
    $q.all([promiseLoadMenuItems(),promiseLoadPromotions()]).then(function(datas){
        var items = datas[0];
        var promotions = datas[1];
        for(var i in promotions) {
            for(var j in items) {
                if(items[j].prod_id==promotions[i].prod_id) {
                    if (items[j].name_lang != null) {
                        promotions[i].menuItemName = items[j].name + " | " + items[j].name_lang;
                    }
                    else
                        promotions[i].menuItemName = items[j].name + " | ";
                    break;
                }
            }
        }
        $scope.menuItems = items;
        $scope.promotions = promotions;
        if($location.$$search.tab=='1') {
            $rootScope.$broadcast('promotion.add',{});
        }
    });

    $scope.format = function(date,mask) {
        var ret = "";
        try {
            ret = DateUtil.format(date,mask);
        }catch(e){}
        return ret;
    };

    function quickSort(start_index, end_index) {
        if (start_index < end_index) {
            var partitionIndex = Partition(start_index, end_index);
            quickSort(start_index, (partitionIndex - 1));
            quickSort((partitionIndex + 1), end_index);
        }
    }

    function Partition(start_index, end_index) {
        var pivot = $scope.promotions[end_index];
        var partitionIndex = start_index;
        for(var i = start_index; i < end_index; i++){
            var pivot_end_date = new Date(pivot.end_date);
            if (new Date($scope.promotions[i].end_date) >= pivot_end_date){
                var temp_item = $scope.promotions[i];
                $scope.promotions[i] = $scope.promotions[partitionIndex];
                $scope.promotions[partitionIndex] = temp_item;
                partitionIndex = partitionIndex + 1;
            }
        }
        temp_item = $scope.promotions[partitionIndex];
        $scope.promotions[partitionIndex] = $scope.promotions[end_index];
        $scope.promotions[end_index] = temp_item;
        return partitionIndex;
    }

    $scope.showPromotionDetail = function(promotion) {
        $rootScope.$broadcast('promotion.detail.show',{promotion: promotion});
    };

    $scope.addPromotion = function() {
        $rootScope.$broadcast('promotion.add',{});
    }

    $rootScope.$on('promotion.delete',function (event, msg){
        var id = msg.id;
        _.remove($scope.promotions,function(item){
            return item.promotion_id==id;
        });
    });

    $scope.$on('promotion.update',function (event, msg){
        var promo = msg.newPromo;
        var cur_date = new Date();
        if (promo.prod_id == null){promo.order_level = true;}
        else {promo.order_level = false;}
        promo.menuItemName = promo.item_name + ' | ' + promo.item_name_lang;
        promo.discountText = promo.discount_pct>0 ? promo.discount_pct+'%' : '$'+promo.discount_amount;
        promo.valid = '';
        var valid_count = 0;
        promo.validDay = '';
        for(var j in $scope.days) {
            if (promo.week_sched & 1<<$scope.days[j].id)
                if (promo.week_sched & 1<<$scope.days[j].id){
                    promo.validDay += ','+$scope.days[j].name;
                    valid_count++;
                }
        }
        if(valid_count==7)
            promo.validDay = '['+L.entire_week+']';
        else
            promo.validDay = promo.validDay.substring(1);
        if(new Date(promo.end_date)>=cur_date) {
            promo.status_desc = L.valid;
        }
        else {
            promo.status_desc = L.expired;
        }

        var old_promo = _.find($scope.promotions,function(_o){
            return _o.promotion_id == promo.promotion_id;
        });
        Object.copy(old_promo,promo,[
            'biz_id',
            'description',
            'discountText',
            'discount_amount',
            'discount_level',
            'discount_pct',
            'end_date',
            'img_url',
            'menuItemName',
            'name',
            'order_level',
            'prod_id',
            'promotion_id',
            'start_date',
            'status_desc',
            'updated_on',
            'valid',
            'validDay',
            'week_sched'
        ]);
    });

    $scope.$on('promotion.save',function (event, msg){
        var promo = msg.newPromo;
        var cur_date = new Date();
        if (promo.prod_id == null)
            promo.order_level = true;
        else
            promo.order_level = false;
        promo.menuItemName = promo.item_name + ' | ' + promo.item_name_lang;
        promo.discountText = promo.discount_pct>0 ? promo.discount_pct+'%' : '$'+promo.discount_amount;
        promo.valid = '';
        var valid_count = 0;
        promo.validDay = '';
        for(var j in $scope.days) {
            if (promo.week_sched & 1<<$scope.days[j].id)
                if (promo.week_sched & 1<<$scope.days[j].id){
                    promo.validDay += ','+$scope.days[j].name;
                    valid_count++;
                }
        }
        if(valid_count==7)
            promo.validDay = '['+L.entire_week+']';
        else
            promo.validDay = promo.validDay.substring(1);
        if(new Date(promo.end_date)>=cur_date) {
            promo.status_desc = L.valid;
        }
        else {
            promo.status_desc = L.expired;
        }
        $scope.promotions.unshift(promo);
    });

    $scope.$on('promotion.delete',function (evemt, msg){

    });

    //move page-content a little bit down in case of tabs cover part of it
    OnViewLoad();
}] );

app.controller("promotionAddAndUpdateController", ['$rootScope','$scope','$routeParams','$mp_ajax','$location','$mp_json','$window','$filter',
    function($rootScope,$scope,$routeParams,$mp_ajax,$location,$mp_json,$window,$filter) {

        var $parent = $scope.$parent;
        var $page = $scope.$parent;
        var L = $rootScope.L;

        $scope.bizId = $rootScope.bizId;
        $scope.promotionId = $routeParams.promotionId;
        $scope.menuItemId = parseInt($routeParams.menuItemId);
        $scope.DISCOUNT_TYPE = {PERCENT:1,AMOUNT:2};
        $scope.PROMO_LEVEL = {MENU_ITEM_LEVEL:1,ORDER_LEVEL:2};
        $scope.discountType = $scope.DISCOUNT_TYPE.PERCENT;

        $rootScope.$watch('L',function(to,from){
//        $scope.menuItems = $scope.menuItems.slice(1);
//        $scope.menuItems.unshift({name:$rootScope.L.all_menu_items,prod_id:0});
            $scope.days = [
                {name: $rootScope.L.sunday_short,id:0,isChosen:false,hover:false},
                {name: $rootScope.L.monday_short,id:1,isChosen:false,hover:false},
                {name: $rootScope.L.tuesday_short,id:2,isChosen:false,hover:false},
                {name: $rootScope.L.wednesday_short,id:3,isChosen:false,hover:false},
                {name: $rootScope.L.thursday_short,id:4,isChosen:false,hover:false},
                {name: $rootScope.L.friday_short,id:5,isChosen:false,hover:false},
                {name: $rootScope.L.saturday_short,id:6,isChosen:false,hover:false}
            ];
        });

        $scope.days = [
            {name: L.sunday_short,id:0,isChosen:false,hover:false},
            {name: L.monday_short,id:1,isChosen:false,hover:false},
            {name: L.tuesday_short,id:2,isChosen:false,hover:false},
            {name: L.wednesday_short,id:3,isChosen:false,hover:false},
            {name: L.thursday_short,id:4,isChosen:false,hover:false},
            {name: L.friday_short,id:5,isChosen:false,hover:false},
            {name: L.saturday_short,id:6,isChosen:false,hover:false}
        ];



        //load menu items //list of prod without promotion info of a business
        $mp_ajax.get('/biz/'+$rootScope.bizId+'/prodBase',function(data){
//        data.unshift({name:L.all_menu_items,prod_id:0});
            $scope.menuItems = data;
            _.forEach($scope.menuItems, function(item){
                if (item.name_lang == null){
                    item.name_lang = '';
                }
            });
        });
        $scope.menuItemSelectChange = function(){
//        console.log ($scope.menuItemSelect);
        };


        $scope.$on('promotion.add', function(event,msg){
            //For create new promotion
            $rootScope.$broadcast('promotion.switch_to_tab',{index:1});
            $scope.isAddPage = true;
            $scope.isUpdatePage = false;
            $scope.promo_level = $scope.PROMO_LEVEL.MENU_ITEM_LEVEL;
            $scope.promotion = {
                discount_level:0
            };
            $scope.menuItemSelect = $scope.menuItemId>0 ? $scope.menuItemId : 0;
            //#203
            $scope.promotion.start_date = DateUtil.format(new Date(),'MM/dd/yyyy');

            _.forEach($scope.days, function(item){
                if (item.isChosen == true){
                    item.isChosen = false;
                }
            });
        });

        $scope.$on('promotion.detail.show',function(event,msg){
            $scope.promotion = msg.promotion;
            console.log("promotion.detail.show", msg.promotion);
            $rootScope.$broadcast('promotion.switch_to_tab',{index:1});

            $scope.isUpdatePage = true;
            $scope.isAddPage = false;
            //load promotion

            if($scope.promotion.prod_id==null)
                $scope.promo_level = $scope.PROMO_LEVEL.ORDER_LEVEL;
            if($scope.promotion.prod_id)
                $scope.promo_level = $scope.PROMO_LEVEL.MENU_ITEM_LEVEL;
            if(!$scope.promotion.discount_level) {
                $scope.promotion.discount_level = 0;
            }
            try{
                $scope.promotion.start_date = DateUtil.format($scope.promotion.start_date,'MM/dd/yyyy');
                $scope.promotion.end_date = DateUtil.format($scope.promotion.end_date,'MM/dd/yyyy');
            } catch(e) {}
            if($scope.promotion.discount_pct>0) {
                $scope.discountType = $scope.DISCOUNT_TYPE.PERCENT;
                $scope.promotion.discountValue = $scope.promotion.discount_pct;
            }
            else if($scope.promotion.discount_amount>0) {
                $scope.discountType = $scope.DISCOUNT_TYPE.AMOUNT;
                $scope.promotion.discountValue = $scope.promotion.discount_amount;
            }
            else
                $scope.discountType = $scope.DISCOUNT_TYPE.PERCENT;
            $scope.menuItemSelect = $scope.promotion.prod_id>0 ? $scope.promotion.prod_id : 0;
                //for week schedule

            _.forEach($scope.days, function(item){
                if (item.isChosen == true){
                    item.isChosen = false;
                }
            });

            _.forEach($scope.days, function(item){
                if ($scope.promotion.week_sched & 1<<item.id){
                    item.isChosen = true;
                }
            });
        });

        $scope.onPromotionSubmit = function(isFormValid, promo) {
            if(!isFormValid) {
                WarningBox('Please check your form');
                return false;
            }
            var tmpObj = {};
            angular.copy(promo,tmpObj);
            if($scope.promo_level==$scope.PROMO_LEVEL.ORDER_LEVEL) {
                tmpObj.prod_id = null;
            }
            else {
                //discount_level should be zero under menu_item_level
                tmpObj.discount_level = 0;
                if($scope.menuItemSelect>0)
                    tmpObj.prod_id = $scope.menuItemSelect;
                else {
                    WarningBox(L.promo_no_menu_item_selected);
                    return false;
                }
            }
            //translate date from one format to another
            console.log(tmpObj.start_date, tmpObj.end_date);
            tmpObj.start_date = DateUtil.format(DateUtil.localDate2UTCDate(DateUtil.parseDate(tmpObj.start_date,'MM/dd/yyyy')),'yyyy-MM-dd');
            tmpObj.end_date = DateUtil.format(DateUtil.localDate2UTCDate(DateUtil.parseDate(tmpObj.end_date,'MM/dd/yyyy')),'yyyy-MM-dd');

            if($scope.discountType==$scope.DISCOUNT_TYPE.PERCENT) {
                tmpObj.discount_pct = tmpObj.discountValue;
                tmpObj.discount_amount = 0;
            }
            else {
                tmpObj.discount_pct = 0;
                tmpObj.discount_amount = tmpObj.discountValue;
            }
            tmpObj.week_sched = 0;
            for(var i in $scope.days) {
                var day = $scope.days[i];
                if(day.isChosen) {
                    tmpObj.week_sched |= 1<<day.id;
                }
            }
            if(tmpObj.week_sched==0) {
                tmpObj.week_sched = (1<<7)-1;
            }
            if($scope.isUpdatePage) { //update
                console.log();
                $mp_ajax.put('/biz/' + $rootScope.bizId + '/promo/' + $scope.promotion.promotion_id, tmpObj,function (data) {
                    console.log(data);
//                $location.path(backPath);
                    var newPromo = tmpObj;
                    if (newPromo.prod_id) {
                        _.forEach($scope.menuItems, function(item){
                            if (item.prod_id == newPromo.prod_id){
                                newPromo.item_name = item.name;
                                newPromo.item_name_lang = item.name_lang;
                            }
                        });
                    }
                    $rootScope.$broadcast('promotion.update',{newPromo:newPromo});
                    $rootScope.$broadcast('promotion.switch_to_tab',{index:0});
                },function (data) {
                    console.error(data);
                });
            }
            else { //save
                $mp_ajax.post('/biz/'+$rootScope.bizId+'/promo',tmpObj,function(data){
                    console.log(data);
//                $location.path(backPath);
                    var newPromo = tmpObj;
                    if (newPromo.prod_id) {
                        _.forEach($scope.menuItems, function(item){
                            if (item.prod_id == newPromo.prod_id){
                                newPromo.item_name = item.name;
                                newPromo.item_name_lang = item.name_lang;
                            }
                        });
                    }
                    $rootScope.$broadcast('promotion.save',{newPromo:newPromo});
                    if($location.$$search.tab=='1')
                        window.location.href = '#/promotion';
                    else
                        $rootScope.$broadcast('promotion.switch_to_tab',{index:0});
                },function(data){
                    console.error(data);
                });
            }
        };

        $scope.onBack = function() {
            if($location.$$search.tab=='1') {
                window.location.href = '#/menu?tab=1';
            }
            else
                $rootScope.$broadcast('promotion.switch_to_tab',{index:0});
        };


        $scope.deletePromotion = function(item) {

            $( "#dialog-confirm" ).removeClass('hide').dialog({
                resizable: false,
                modal: true,
//            title: "",
//            title_html: true,
                buttons: [
                    {
                        html: "<i class='icon-trash bigger-110'></i>&nbsp; "+ L.delete,
                        "class" : "btn btn-danger btn-xs",
                        click: function() {
                            var confirmDlg = $( this );
                            $mp_ajax.delete('/biz/'+$scope.bizId+'/promo/'+item.promotion_id,function(data){
                                if(data.succeed==true) {
                                    confirmDlg.dialog( "close" );
                                    $rootScope.$broadcast('promotion.delete',{id:item.promotion_id});
                                    $rootScope.$broadcast('promotion.switch_to_tab',{index:0});
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

        $scope.onDayClick = function(day) {
            day.isChosen = !day.isChosen;
        };
        $scope.onDayMouseEnter = function(day) {
            day.hover = true;
        };
        $scope.onDayMouseLeave = function(day) {
            day.hover = false;
        };

        function promotionDateCalender () {
            $('.start-date-picker').datepicker({
                autoclose:true,
                beforeShowDay: function(date){
                    var day = date;
                    return [ disableDatesAfterEndDate(day) ];
                }
            }).next().on(ace.click_event, function(){
                $(this).prev().focus();
            });

            $('.end-date-picker').datepicker({
                autoclose:true,
                beforeShowDay: function(date){
                    var day = date;
                    return [ disableDatesBeforeStartDate(day) ];
                }
            }).next().on(ace.click_event, function(){
                $(this).prev().focus();
            });
        }

        function disableDatesAfterEndDate(day) {

            if (day < new Date($scope.promotion.end_date))
                return true;
            else
                return false;
        }

        function disableDatesBeforeStartDate(day) {

            if (day > new Date($scope.promotion.start_date))
                return true;
            else
                return false;
        }
        //move page-content a little bit down in case of tabs cover part of it
        promotionDateCalender ();
        OnViewLoad();
    }] );