/**
 * Created by Ken on 2014-4-21.
 */

app.controller("insightController", ['$rootScope','$scope','$mp_ajax','$q',function($rootScope,$scope ,$mp_ajax,$q) {

    $rootScope.$watch('L',function(to,from) {L = $rootScope.L;});
    var L = $rootScope.L;
    $scope.monthOrderChartData=[];
    $scope.dayOrderChartData=[];
    $scope.weekOrderChartData=[];
    $scope.selectProdType='';

    //page
    $scope.searchOrderStatus = '-1';
    $scope.searchPageNo = 1;
    $scope.searchPageSize = 50;
    $scope.pageCount = 0;

    $scope.hasPreviousPage = false;
    $scope.hasNextPage = false;

    $mp_ajax.get('/biz/'+$rootScope.bizId+"/getBizConsume",function(data){
        $scope.productTypeCount = data.productType;
        $scope.productCount = data.activeProduce;
        $scope.totalClickCount = data.sumConsume;
        $scope.SumConsumeMoney=data.sumConsumeMoney;
    });

    /*$mp_ajax.get('/biz/'+$rootScope.bizId+"/productTypeCount",function(data){
        $scope.productTypeCount = data.productTypeCount;
    });

    $mp_ajax.get('/biz/'+$rootScope.bizId+"/productCount",function(data){
        $scope.productCount = data.productCount;
    });

    $mp_ajax.get('/biz/'+$rootScope.bizId+"/customerCount",function(data){
        $scope.customerCount = data.customerCount;
    });

    $mp_ajax.get('/biz/'+$rootScope.bizId+"/totalClickCount",function(data){
        $scope.totalClickCount = data.total_count || 0;
    });*/

    /*$mp_ajax.get('/biz/'+$rootScope.bizId+"/lastCustCount",function(data){
        $scope.lastCustomerCount = data.total_count || 0 ;
    });

    $mp_ajax.get('/biz/'+$rootScope.bizId+"/lastClickCount",function(data){
        $scope.lastClickCount = data.total_count || 0;
    });*/

    $mp_ajax.get('/biz/'+$rootScope.bizId+"/topClickProdType/10",function(data){
        $scope.prodType = data;
    });

    $mp_ajax.get('/biz/'+$rootScope.bizId+"/topClickProd/10",function(data){
        $scope.orderMenu= data;
    });

    $mp_ajax.get('/biz/'+$rootScope.bizId+"/dayClick",function(data){
       console.log(data);
        $scope.dayClickChartData = {};
        var xCategory =[],clickCount=[],totalMoney=[];
        for(var i=0;i<data.length-1;i++){
           /* var dayItem = data[i].month+"-"+ data[i].day;*/
            xCategory.push(data[i].day.substring(5));
            totalMoney.push(parseFloat(data[i].total_money));
            clickCount.push(data[i].total_count);
        }
        $scope.dayClickChartData.xCategory = xCategory ;
        $scope.dayClickChartData.yTitle = L.menu_item_click;
        $scope.dayClickChartData.seriesArray = [{
            name: L.click,
            data: totalMoney

        }];
        if($scope.menuDateSel == 3){
            showChart($("#dayMenuChart"), L.daily_menu_click ,$scope.dayClickChartData);
        }

        $scope.dayOrderChartData.xCategory = xCategory ;
        $scope.dayOrderChartData.yTitle = L.menu_item_order;
        $scope.dayOrderChartData.seriesArray = [{
            name: L.order,
            data: clickCount

        }];
        if($scope.menuOrderDateSel == 3){
            showChart($("#dayChart"), L.daily_menu_order ,$scope.dayOrderChartData);
        }
    });

    $mp_ajax.get('/biz/'+$rootScope.bizId+"/weekClick",function(data){
        console.log(data);
        $scope.weekClickChartData = {};
        var xCategory =[],clickCount=[],totalMoney=[];
        for(var i=0;i<data.length-1;i++){
            /*var dayItem = data[i].year+"-"+ data[i].week;*/
            xCategory.push(i+1);
            totalMoney.push(parseFloat(data[i].total_money));
            clickCount.push(data[i].total_count);
        }
        $scope.weekClickChartData.xCategory = xCategory ;
        $scope.weekClickChartData.yTitle = L.menu_item_click;
        $scope.weekClickChartData.seriesArray = [{
            name: L.click,
            data: totalMoney

        }];
        if($scope.menuDateSel == 2){
            showChart($("#weekMenuChart"),L.weekly_menu_click ,$scope.monthClickChartData);
        }
        $scope.weekOrderChartData.xCategory = xCategory ;
        $scope.weekOrderChartData.yTitle = L.menu_item_order;
        $scope.weekOrderChartData.seriesArray = [{
            name: L.order,
            data: clickCount

        }];
        if($scope.menuOrderDateSel == 2){
            showChart($("#weekChart"), L.weekly_menu_order ,$scope.monthOrderChartData);
        }
    });

    $mp_ajax.get('/biz/'+$rootScope.bizId+"/monthClick",function(data){
        console.log(data);
        $scope.monthClickChartData = {};
        var xCategory =[],clickCount=[],totalMoney=[];
        for(var i=0;i<data.length-1;i++){
            var dayItem = data[i].year+"-"+ data[i].month;
            xCategory.push(data[i].month);
            totalMoney.push(parseFloat(data[i].total_money));
            clickCount.push(data[i].total_count);
        }
        $scope.monthClickChartData.xCategory = xCategory ;
        $scope.monthClickChartData.yTitle = L.menu_item_click;
        $scope.monthClickChartData.seriesArray = [{
            name: L.click,
            data: totalMoney

        }];
        if($scope.menuDateSel == 1){
            showChart($("#monthMenuChart"),L.monthly_menu_click ,$scope.monthClickChartData);
        }
        $scope.monthOrderChartData.xCategory = xCategory ;
        $scope.monthOrderChartData.yTitle = L.menu_item_order;
        $scope.monthOrderChartData.seriesArray = [{
            name: L.order,
            data: clickCount

        }];
        if($scope.menuOrderDateSel == 1){
            showChart($("#monthChart"), L.monthly_menu_order ,$scope.monthOrderChartData);
        }
    });

    /*$mp_ajax.get('/biz/'+$rootScope.bizId+"/dayOrder",function(data){
        console.log(data);
        $scope.dayOrderChartData = {};
        var xCategory =[],orderCount=[];
        for(var i=data.length-1;i>=0;i--){
            var dayItem = data[i].month+"-"+ data[i].day;
            xCategory.push(dayItem);
            orderCount.push(data[i].total_click);
        }

    });

    $mp_ajax.get('/biz/'+$rootScope.bizId+"/weekOrder",function(data){
        console.log(data);
        $scope.weekOrderChartData = {};
        var xCategory =[],orderCount=[];
        for(var i=data.length-1;i>=0;i--){
            var dayItem = data[i].year+"-"+ data[i].week;
            xCategory.push(dayItem);
            orderCount.push(data[i].total_click);
        }
        $scope.weekOrderChartData.xCategory = xCategory ;
        $scope.weekOrderChartData.yTitle = L.menu_item_order;
        $scope.weekOrderChartData.seriesArray = [{
            name: L.order,
            data: orderCount

        }];
        if($scope.menuOrderDateSel == 2){
            showChart($("#weekChart"), L.weekly_menu_order ,$scope.monthOrderChartData);
        }
    });

    $mp_ajax.get('/biz/'+$rootScope.bizId+"/monthOrder",function(data){
        console.log(data);
        $scope.monthOrderChartData = {};
        var xCategory =[],orderCount=[];
        for(var i=data.length-1;i>=0;i--){
            var dayItem = data[i].year+"-"+ data[i].month;
            xCategory.push(dayItem);
            orderCount.push(data[i].total_click);
        }
        $scope.monthOrderChartData.xCategory = xCategory ;
        $scope.monthOrderChartData.yTitle = L.menu_item_order;
        $scope.monthOrderChartData.seriesArray = [{
            name: L.order,
            data: orderCount

        }];
        if($scope.menuOrderDateSel == 1){
            showChart($("#monthChart"), L.monthly_menu_order ,$scope.monthOrderChartData);
        }
    });*/


    //$scope.topProductItem = [{productName:"Item 1",count:"400"} ,{productName:"Item 2" , count:"321"}];
    //$scope.topCustomerPoint = [{customerName:"customer 1",custId:"1",point:"400"} ,{customerName:"customer 2" ,custId:"2", point:"321"}];

    $scope.menuDateSel = 1;



    $scope.menuOrderDateSel = 1;

    var monthCustomerChartData = {};
    monthCustomerChartData.xCategory = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] ;
    monthCustomerChartData.yTitle = 'Active customer number (person)' ;
    monthCustomerChartData.seriesArray = [{
        name: 'Customers',
        data: [49, 71, 106, 129, 144, 176, 135,148, 216, 194, 95, 54]

    }];
    var monthProductChartData = {};
    monthProductChartData.xCategory = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] ;
    monthProductChartData.yTitle = L.menu_item_click;
    monthProductChartData.seriesArray = [{
        name: 'Click',
        data: [490, 2160, 1943, 951, 544, 711, 1067, 1295, 1444, 1762, 1355,1489]

    }];

    var dayCustomerChartData = {};
    dayCustomerChartData.xCategory = ['Mon', 'Tus', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] ;
    dayCustomerChartData.yTitle = 'Active customer number (person)' ;
    dayCustomerChartData.seriesArray = [{
        name: 'Customers',
        data: [7, 10, 20, 8, 30, 1, 3 ]

    }];

    var dayProductChartData = {};
    dayProductChartData.xCategory = ['Mon', 'Tus', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] ;
    dayProductChartData.yTitle = 'Active customer number (person)' ;
    dayProductChartData.seriesArray = [{
        name: 'Customers',
        data: [73, 302, 21, 93,107, 220, 88  ]

    }];

    /*initChart();
    function initChart(){
        if($scope.menuOrderDateSel == 1){
            showChart($("#monthChart"),"Monthly active customers" ,$scopoe.);
        }else if($scope.menuOrderDateSel == 2){
            showChart($("#weekChart"),"Weekly active customers" ,monthCustomerChartData);
        }else{
            showChart($("#dayChart"),"Daily active customers" ,dayCustomerChartData);
        }


    }*/

    $scope.menuOrderStateSel = function(){
        //console.log($scope.menuOrderDateSel);
        if($scope.menuOrderDateSel == 1){
            showChart($("#monthChart"), L.monthly_menu_order ,$scope.monthOrderChartData);
        }else if($scope.menuOrderDateSel == 2){
            showChart($("#weekChart"), L.weekly_menu_order ,$scope.weekOrderChartData);
        }else{
            showChart($("#dayChart"), L.daily_menu_order ,$scope.dayOrderChartData);
        }

    }

    $scope.menuStateSel = function(){
        if($scope.menuDateSel == 1){
            showChart($("#monthMenuChart"), L.monthly_menu_click ,$scope.monthClickChartData);
        }else if($scope.menuDateSel == 2){
            showChart($("#weekMenuChart"), L.weekly_menu_click ,$scope.weekClickChartData);
        }else{
            showChart($("#dayMenuChart"), L.daily_menu_click ,$scope.dayClickChartData);
        }
    }


    function showChart(dom ,title ,options){
        var width=dom.parent().width();
        dom.highcharts({
            chart: {
                type: 'column',
                width: width
            },
            credits: {
                enabled: false
            },
            exporting: {
                enabled: false
            },
            title: {
                text: title
            },
            xAxis: {
                categories:options.xCategory
            },
            yAxis: {
                min: 0,
                title: {
                    text: options.yTitle
                }
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0
                }
            },
            series:options.seriesArray
        });

    }

    $scope.onBtnPageTo = function(key) {
        var isCanLoad = false;
        switch(key) {
            case 'previous':
                if($scope.hasPreviousPage) {
                    $scope.searchPageNo--;
                    isCanLoad = true;
                }
                break;
            case 'next':
                if($scope.hasNextPage) {
                    $scope.searchPageNo++;
                    isCanLoad = true;
                }
                break;
            default:;
        }
        if(isCanLoad)
            $scope.refreshDishesArr();
    };
    $scope.refreshOrderMoneyArr = function(){
        var params = {};
        console.log('$scope.orderMoneyArr')
        if($('#searchCreateDateMoney').val()) {
            params.createBeginTime=$('#searchCreateDateMoney').data().daterangepicker.startDate.format('YYYY-MM-DD');
            params.createEndTime=$('#searchCreateDateMoney').data().daterangepicker.endDate.format('YYYY-MM-DD');
        }
        var searchParams=objToStr(params);
        $mp_ajax.promiseGet('/biz/'+$rootScope.bizId+'/getOrderMoney' + searchParams).then(function(data){

            $scope.orderMoneyArr = data.item;
            $scope.totalOrderMoney = data.total_money;

        });
    };
    var getDishesArr=function () {
        var params={};
        if($scope.searchPageNo>0) {
            params.start=(parseInt($scope.searchPageNo)-1)*parseInt($scope.searchPageSize);
        }
        if($scope.searchPageSize>0) {
            params.size=(parseInt($scope.searchPageSize)+1);
        }
        if($('#searchCreateDate').val()) {
            params.createBeginTime=$('#searchCreateDate').data().daterangepicker.startDate.format('YYYY-MM-DD');
            params.createEndTime=$('#searchCreateDate').data().daterangepicker.endDate.format('YYYY-MM-DD');
        }
        if($scope.selectProdType){
            params.typeId=$scope.selectProdType;
        }
        var searchParams=objToStr(params);
       /* $mp_ajax.get('/biz/'+$rootScope.bizId+"/consumeGroup"+searchParams,function(data){
            $scope.dishesArr= data;
        });*/
        return $mp_ajax.promiseGet('/biz/'+$rootScope.bizId+"/consumeGroup"+searchParams);
    }

    $scope.refreshDishesArr=function () {
        $q.all([getDishesArr()]).then(function(dataArr){
            $scope.dishesArr = dataArr[0].rows;
            $scope.hasNextPage = $scope.dishesArr.length>$scope.searchPageSize;
            $scope.hasPreviousPage = $scope.searchPageNo>1;
            $scope.totalMoney = dataArr[0].totalMoney;
            if($scope.dishesArr.length>$scope.searchPageSize) {
                $scope.dishesArr.pop();
            }
        })
    };

    $scope.getProdAllType=function () {
        $mp_ajax.get('/biz/'+$rootScope.bizId+"/prodType",function(data){
            $scope.prodTypeAll= data;
        });
    }

    $scope.$watch('searchPageSize',function(to,from){
        if(_.isString(to))
            $scope.refreshDishesArr();
    });

    OnViewLoad();
    if(L.lang=='中文'){
        $('#searchCreateDate').daterangepicker({
            startDate: getNowDate2(),
            endDate:getNowDate2(),
            format:'DD/MM/YYYY',
            locale: {
                applyLabel: '确认',
                cancelLabel: '取消',
                fromLabel: '从',
                toLabel: '到',
                weekLabel: '周',
                customRangeLabel: '自定义范围',
                daysOfWeek: ["日", "一", "二", "三", "四", "五", "六"],
                monthNames: ["一月", "二月", "三月", "四月", "五月", "六月" ,"七月", "八月", "九月", "十月", "十一月", "十二月"],
                firstDay: 0
            }
        }).prev().on(ace.click_event, function(){
            $(this).next().focus();
        });
    }else{
        $('#searchCreateDate').daterangepicker({
            startDate: getNowDate2(),
            endDate:getNowDate2(),
            format:'DD/MM/YYYY',
        }).prev().on(ace.click_event, function(){
            $(this).next().focus();
        });
    }

    if(L.lang=='中文'){
        $('#searchCreateDateMoney').daterangepicker({
            startDate: getNowDate2(),
            endDate:getNowDate2(),
            format:'DD/MM/YYYY',
            locale: {
                applyLabel: '确认',
                cancelLabel: '取消',
                fromLabel: '从',
                toLabel: '到',
                weekLabel: '周',
                customRangeLabel: '自定义范围',
                daysOfWeek: ["日", "一", "二", "三", "四", "五", "六"],
                monthNames: ["一月", "二月", "三月", "四月", "五月", "六月" ,"七月", "八月", "九月", "十月", "十一月", "十二月"],
                firstDay: 0
            }
        }).prev().on(ace.click_event, function(){
            $(this).next().focus();
        });
    }else{
        $('#searchCreateDateMoney').daterangepicker({
            startDate: getNowDate2(),
            endDate:getNowDate2(),
            format:'DD/MM/YYYY',
        }).prev().on(ace.click_event, function(){
            $(this).next().focus();
        });
    }
   /* $('#searchCreateDate').daterangepicker({startDate:getNowDate2(), endDate:getNowLastDate()})*/

    $('#searchCreateDate').val(getNowDate2()+'-'+getNowDate2());
    $('#searchCreateDateMoney').val(getNowDate2()+'-'+getNowDate2());

    $scope.refreshDishesArr();
    $scope.getProdAllType();
    $scope.refreshOrderMoneyArr();
}] );
