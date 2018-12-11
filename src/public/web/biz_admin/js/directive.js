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
        template: '<ul class="nav nav-tabs"></ul>',
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
                    if(tab.active) {
                        li.addClass('active');
                        active_tab_index = i;
                    }
                    var a = $('<a>');
                    a.attr('href','javascript:;');
                    a.html('<i class="green '+tab.icon+' bigger-110"><\/i> '+tab.name);
                    li.append(a);
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