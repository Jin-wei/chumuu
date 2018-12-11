/**
 * Created by Ken on 2014-4-18.
 */

app.controller("promotionAddAndUpdateController", ['$rootScope','$scope','$routeParams','$mp_ajax','$location','$mp_json','$window','$filter',
function($rootScope,$scope,$routeParams,$mp_ajax,$location,$mp_json,$window,$filter) {
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

    //load menu items
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
    $scope.promo_level = $scope.PROMO_LEVEL.MENU_ITEM_LEVEL;
    if(angular.isUndefined($scope.promotionId)) {  //For create new promotion
        $scope.isAddPage = true;
        $scope.title = L.create_new_promotion;
        $scope.promotion = {
            discount_level:0
        };
        $scope.menuItemSelect = $scope.menuItemId>0 ? $scope.menuItemId : 0;
        //#203
        $scope.promotion.start_date = DateUtil.format(new Date(),'MM/dd/yyyy');
    }
    else {  //For Update promotion
        $scope.isUpdatePage = true;
        $scope.title = L.promo_update_promotion_title;
        //load promotion
        $mp_ajax.get('/biz/'+$scope.bizId+'/promo/'+$scope.promotionId,function(data){
            var promo = data;
            if(promo.prod_id==null)
                $scope.promo_level = $scope.PROMO_LEVEL.ORDER_LEVEL;
            if(!promo.discount_level) {
                promo.discount_level = 0;
            }
            try{
                promo.start_date = DateUtil.format(promo.start_date,'MM/dd/yyyy');
                promo.end_date = DateUtil.format(promo.end_date,'MM/dd/yyyy');
            } catch(e) {}
            if(promo.discount_pct>0) {
                $scope.discountType = $scope.DISCOUNT_TYPE.PERCENT;
                promo.discountValue = promo.discount_pct;
            }
            else if(promo.discount_amount>0) {
                $scope.discountType = $scope.DISCOUNT_TYPE.AMOUNT;
                promo.discountValue = promo.discount_amount;
            }
            else
                $scope.discountType = $scope.DISCOUNT_TYPE.PERCENT;
            $scope.menuItemSelect = promo.prod_id>0 ? promo.prod_id : 0;
            $scope.promotion = promo;
            //for week schedule
            for(var i in $scope.days) {
                var day = $scope.days[i];
                if(promo.week_sched & 1<<day.id) {
                    day.isChosen = true;
                }
            }
        });
    }
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
        tmpObj.start_date = DateUtil.format(DateUtil.parseDate(tmpObj.start_date,'MM/dd/yyyy'),'yyyy-MM-dd');
        tmpObj.end_date = DateUtil.format(DateUtil.parseDate(tmpObj.end_date,'MM/dd/yyyy'),'yyyy-MM-dd');
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
        if($scope.promotionId>0) { //update
            $mp_ajax.put('/biz/' + $rootScope.bizId + '/promo/' + $scope.promotionId, tmpObj,function (data) {
                console.log(data);
//                $location.path(backPath);
                window.history.back(-1);
            },function (data) {
                console.error(data);
            });
        }
        else { //save
            $mp_ajax.post('/biz/'+$rootScope.bizId+'/promo',tmpObj,function(data){
                console.log(data);
//                $location.path(backPath);
                window.history.back(-1);
            },function(data){
                console.error(data);
            });
        }
    }

    $scope.onBack = function() {
        window.history.back(-1);
//        $history.goBack();
//        $location.path("/promotion");
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
                                window.history.back(-1);
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


    //move page-content a little bit down in case of tabs cover part of it
    OnViewLoad();
}] );

