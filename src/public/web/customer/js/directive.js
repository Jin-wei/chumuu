/**
 * @Author : Ken
 * @Date : 2015-04-15
 * @LastUpdateOn: 2015-04-24
 * @directive name : mpShoppingCartControl
 * @attributes:
 *  prod: should be the menu_item from ajax call
 * @example
 * [example 1]
 *   <mp-shopping-cart-control prod="item"></mp-shopping-cart-control>
 * */
app.directive('mpShoppingCartControl', ['$rootScope','$mpMyTable','$mpBizInfo','$mpLanguage',function ($rootScope,$mpMyTable,$mpBizInfo,$mpLanguage) {
    return {
        restrict: "E",
        template: '\
                <div style="display: flex;align-items: center">\
                    <a class="mp-shopping-cart-reduce-button mp-pointer iconfont icon-shandiao" data-action="-1" ng-show="count>0" style="font-size: 46px;color: #fcb232"></a>\
                    <span class="mp-shopping-cart-count" ng-bind="count" ng-show="count>0"></span>\
                    <a class="mp-shopping-cart-add-button mp-pointer iconfont icon-tianjia" data-action="1" style="font-size:46px;color:#fcb232"></a>\
                </div>\
            ',
        replace: false,
        scope: {
            prod:'='
        },
        link: function (scope, element, attrs ) {
            //1. init
            scope.count = 0;
            //deep clone: '=' is double-way binding, '@' is one-way binding, but '@' needs expression, like {{item}}
            //but it will gives json string to element, so use deep clone to isolate it.
            scope.prod = _.cloneDeep(scope.prod);
            var bizInfo = {
                bizId: $mpBizInfo.getItem('biz_id'),
                bizKey: $mpBizInfo.getItem('bizKey'),
                bizName: $mpBizInfo.getItem('name'),
                bizNameLang: $mpBizInfo.getItem('name_lang'),
                bizImgUrl: $mpBizInfo.getItem('img_url')
            };
            var prod = {
                prodId: scope.prod.prod_id || scope.prod.prodId,
                img_url: scope.prod.img_url,
                price: scope.prod.price,
                prodName: scope.prod.name || scope.prod.prodName,
                prodNameLang: scope.prod.name_lang || scope.prod.prodNameLang,
                qty:1,
                prodLabel:scope.prod.label_name?scope.prod.label_name:''

            };
            if(scope.prod.extendId){
                prod.extendId=scope.prod.extendId;
            }

            //2. load count from $mpMyTable
            var searchParams={};
            searchParams.prodId=scope.prod.prod_id || scope.prod.prodId;
            if(scope.prod.extendId){
                searchParams.extendId=scope.prod.extendId;
            }
            var itemStored = _.find($mpMyTable.getData().prods,searchParams);
            if(itemStored) {
                scope.count = itemStored.qty;
            }

            //3. bind events
            jQuery(element).find(".mp-pointer").on('click',function(){
                var dataAction = parseInt($(this).attr('data-action'));
                var ok = true;
                if(dataAction>0) {
                    if(!$mpMyTable.appendMenuItem(bizInfo,prod)) {
                        ok = false;
                    }
                }
                else if (dataAction<0){
                    $mpMyTable.reduceMenuItem(prod.prodId,prod.extendId);
                }
                if(ok) {
                    scope.$apply(function(){
                        scope.count = scope.count + dataAction;
                    });
                }
            });
        }
    };
}]);

app.directive('mpShoppingCartTypeControl', ['$rootScope','$mpMyTable','$mpBizInfo','$mpLanguage',function ($rootScope,$mpMyTable,$mpBizInfo,$mpLanguage) {
    return {
        restrict: "E",
        templateUrl:'./customer/view/_chocie_taste.html',
        replace: false,
        scope: {
            prod:'='
        },
        link: function (scope, element, attrs ) {
            //1. init
            scope.count = 0;
            scope.detailCount=0;
            scope.extendName='';
            scope.extendId='';
            scope.extendIdArray=[];
            scope.extendPrice=0;

            //deep clone: '=' is double-way binding, '@' is one-way binding, but '@' needs expression, like {{item}}
            //but it will gives json string to element, so use deep clone to isolate it.
            scope.prod = _.cloneDeep(scope.prod);

            var bizInfo = {
                bizId: $mpBizInfo.getItem('biz_id'),
                bizKey: $mpBizInfo.getItem('bizKey'),
                bizName: $mpBizInfo.getItem('name'),
                bizNameLang: $mpBizInfo.getItem('name_lang'),
                bizImgUrl: $mpBizInfo.getItem('img_url')
            };
            var prod = {
                prodId: scope.prod.prod_id || scope.prod.prodId,
                img_url: scope.prod.img_url,
                price: scope.prod.price,
                prodName: scope.prod.name || scope.prod.prodName  || scope.prod.productName,
                prodNameLang: scope.prod.name_lang || scope.prod.prodNameLang,
                extendId:scope.extendId,
                extendName:scope.extendName,
                extendPrice:scope.extendPrice,
                extendIdArray:scope.extendIdArray,
                qty:1,
                prodLabel:scope.prod.label_name?scope.prod.label_name:''
            };

            scope.updateExtend=function () {
                scope.extendName='';
                scope.extendId='';
                scope.extendPrice=0;
                scope.extendIdArray=[];
                for(var i=0;i<scope.prod.extend.length;i++){
                    for(var j=0;j<scope.prod.extend[i].itemArr.length;j++){
                        if(scope.prod.extend[i].itemArr[j].selected==true){
                            if(i==scope.prod.extend.length-1){
                                scope.extendName=scope.extendName+scope.prod.extend[i].itemArr[j].extend_name;
                                scope.extendId=scope.extendId+scope.prod.extend[i].itemArr[j].id;
                            }else{
                                scope.extendName=scope.extendName+scope.prod.extend[i].itemArr[j].extend_name+",";
                                scope.extendId=scope.extendId+scope.prod.extend[i].itemArr[j].id+",";
                            }
                            scope.extendPrice=scope.extendPrice+scope.prod.extend[i].itemArr[j].extend_price;
                            var temy={
                                id:scope.prod.extend[i].itemArr[j].id,
                                name:scope.prod.extend[i].itemArr[j].extend_name,
                                price:scope.prod.extend[i].itemArr[j].extend_price
                            }
                            scope.extendIdArray.push(temy);
                        }
                    }
                }
                var extendStored = _.find($mpMyTable.getData().prods,{prodId:scope.prod.prod_id || scope.prod.prodId,extendId:scope.extendId});
                if(extendStored) {
                    scope.detailCount = extendStored.qty;
                }else{
                    scope.detailCount=0;
                }

            }

            //2. load count from $mpMyTable
            var itemStored = _.find($mpMyTable.getData().prods,{prodId:scope.prod.prod_id});
            var itemsData=$mpMyTable.getData().prods;
            if(itemsData){
                for(var i=0;i<itemsData.length;i++){
                    if(itemsData[i].prodId==scope.prod.prod_id){
                        scope.count =scope.count+ itemsData[i].qty;
                    }
                }
            }
            if(itemStored) {
                for(var d=0;d<itemStored.extendIdArray.length;d++){
                    for(var i=0;i<scope.prod.extend.length;i++){
                        for(var j=0;j<scope.prod.extend[i].itemArr.length;j++){
                            if(scope.prod.extend[i].itemArr[j].id==itemStored.extendIdArray[d].id){
                                scope.prod.extend[i].itemArr[j].selected=true;
                            }
                        }
                    }
                }
                scope.updateExtend();
            }else{
                //set [0]extend
                for(var i=0;i<scope.prod.extend.length;i++){
                    if(scope.prod.extend[i].itemArr[0]){
                        if(i==scope.prod.extend.length-1){
                            scope.extendName=scope.extendName+scope.prod.extend[i].itemArr[0].extend_name;
                            scope.extendId=scope.extendId+scope.prod.extend[i].itemArr[0].id;
                        }else{
                            scope.extendName=scope.extendName+scope.prod.extend[i].itemArr[0].extend_name+",";
                            scope.extendId=scope.extendId+scope.prod.extend[i].itemArr[0].id+",";
                        }
                        scope.prod.extend[i].itemArr[0].selected=true;
                        scope.extendPrice=scope.extendPrice+scope.prod.extend[i].itemArr[0].extend_price;

                        var temy={
                            id:scope.prod.extend[i].itemArr[0].id,
                            name:scope.prod.extend[i].itemArr[0].extend_name,
                            price:scope.prod.extend[i].itemArr[0].extend_price
                        }
                        scope.extendIdArray.push(temy);
                    }

                }

            }


            //3. bind events
            jQuery(element).find(".mp-pointer").on('click',function(){
                var dataAction = parseInt($(this).attr('data-action'));
                var ok = true;
                prod = {
                    prodId: scope.prod.prod_id || scope.prod.prodId,
                    img_url: scope.prod.img_url,
                    price: scope.prod.price,
                    prodName: scope.prod.name || scope.prod.prodName  || scope.prod.productName,
                    prodNameLang: scope.prod.name_lang || scope.prod.prodNameLang,
                    extendId:scope.extendId,
                    extendName:scope.extendName,
                    extendPrice:scope.extendPrice,
                    extendIdArray:scope.extendIdArray,
                    qty:1
                };
                if(dataAction>0) {
                    if(!$mpMyTable.appendMenuItem(bizInfo,prod,1)) {
                        ok = false;
                    }
                }
                else if (dataAction<0){
                    $mpMyTable.reduceMenuItem(prod.prodId,prod.extendId);
                }
                if(ok) {
                    scope.$apply(function(){
                        scope.count = scope.count + dataAction;
                        scope.detailCount = scope.detailCount + dataAction;
                    });
                }
            });


            scope.showTypeModal=function () {
                scope.typeDetail=[];
                $('#AddModal'+prod.prodId).modal('show');
                scope.typeDetail=scope.prod;
            }



            scope.changeExtend=function (data) {
                for(var i=0;i<scope.prod.extend.length;i++){
                    for(var j=0;j<scope.prod.extend[i].itemArr.length;j++){
                        if(scope.prod.extend[i].id==data.parent_id){
                            if(scope.prod.extend[i].itemArr[j].id==data.id){
                                scope.prod.extend[i].itemArr[j].selected=true;
                            }else{
                                scope.prod.extend[i].itemArr[j].selected=false;
                            }
                        }
                    }
                }
                scope.updateExtend();
            }
        },
        controller:['$rootScope','$scope',function ($rootScope,$scope) {
            $scope.L = $rootScope.L;
            $scope.currency = $rootScope.currency;
        }]
    };
}]);


/**
 * @Author : Ken
 * @Date : 2014-11-04
 * @directive name : mp-tab
 * @refer:
 *      business/js/order_controller.js
 *      business/view/_order.html
 * @attributes:
 *      ng-model : {id:'unique id' (optional), tabs:[{name:string,icon:string,active:boolean}]}
 * @example
 * [example 1]
 * controller.js:
 $scope.order_tabs = {
         id:'order_tab',
         tabs: [
            {
                name: 'Current Orders',
                icon: 'icon-food',
                active: true
            },
            {
                name: 'Past Orders',
                icon: 'icon-inbox',
                active: false
            },
            {
                name: 'Order Details',
                icon: 'icon-tag',
                active: false
            }
         ],
         onswitch: function(to, from) {} //tab index change
     };
 html:
 <mp-tab ng-model="order_tabs"></mp-tab>
 <div id="{{order_tabs.id}}">  (id is optional, if you don't provide id, the div must follow mp-tab in same level)
 <div>page 1</div>
 <div>page 2</div>
 <div>page 3</div>
 </div>
 * */
app.directive('mpTab', function () {
    return {
        restrict: 'E',
        require: '?ngModel',
        replace: false,
        template: '<ul class="mp"></ul>',
        scope: {
            model: '=ngModel'
        },
        link: function (scope, element, attrs, ngModel) {
            var tab_id = scope.model.id;
            var tabs = scope.model.tabs;
            //Ken 2014-12-01: no response when watch 'model.tabs'
            scope.$watch('model.tabs.length',function(value){
                var ul = $(element.children()[0]);
                if(!tab_id || !_.isArray(tabs)) {
                    console.error('mpTab -> scope error');
                    return false;
                }
                ul.html('');
                ul.attr('id','tab_'+tab_id);
                var active_tab_index = 0;
                for(var i in tabs) {
                    var tab = tabs[i];
                    var li = $('<li>');
                    li.attr('data-index',i);
                    li.addClass('mp mp-pointer');
                    if(tab.active) {
                        li.addClass('active');
                        active_tab_index = i;
                    }
                    //var a = $('<a>');
                    //a.attr('href','javascript:;');
                    li.html('<i class="green '+tab.icon+' bigger-110"><\/i> <span>'+tab.name+'<\/span>');
                    //li.append(a);
                    ul.append(li);
                }

                var li_arr = ul.children();
                var content = $('#'+tab_id);
                if(content.length==0) {
                    content = ul.parent().next();
                    if(content.length==0) {
                        console.error('directive.js -> mp-tab : no content object');
                    }
                }

                function change_tab(li) {
                    if(!li)
                        return false;
                    li_arr.removeClass('active');
                    li.addClass('active');
                    var index = li.attr('data-index');
                    var tab_divs = content.children();
                    tab_divs.css('display','none');
                    $(tab_divs[index]).css('display','block');
                    if(_.isFunction(scope.model.on_switch)) {
                        scope.model.cur_tab_index = index;
                        scope.model.on_switch(index,active_tab_index);
                    }
                    active_tab_index = index;
                }

                //switch tab event
                li_arr.on('click',function(){
                    change_tab(angular.element(this));
                    scope.$apply();
                });

                //display tab's sub page
                var sub_pages = content.children();
                sub_pages.css('display','none');
                $(sub_pages[active_tab_index]).css('display','block');

                scope.model.change_tab = function(index) {
                    change_tab(angular.element(li_arr[index]));
                };

                if(_.isFunction(scope.model.on_loaded)) {
                    scope.model.on_loaded();
                }
            });
        }
    }
});


