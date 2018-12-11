/**
 * Created by Ken on 14-11-4.
 */

/**
 * @Author : Ken
 * @Date : 2014-05-19
 * @directive name : anchor
 * @attributes:
 *   target: id of target dom / id array of target dom, if first target is hidden then go to second target
 *          use '|' to separate items
 * @example
 * [example 1]
 *   <anchor target="targetDomId">Click me to jump to target dom</anchor>
 *   ....
 *   <div id="targetDomId"></div>
 * [example 2] if targetDomId1 is hidden(display==none), then jump to targetDomId2, otherwise jump to targetDomId1.
 *              Priority is reduced from left to right.
 *   <anchor target="targetDomId1|targetDomId2">Click me to jump to target dom</anchor>
 *   ....
 *   <div id="targetDomId1"></div>
 *   <div id="targetDomId2"></div>
 * */
app.directive('anchor', function () {
    return {
        restrict: "EA",
        scope: false,
        link: function ($scope, element, attrs ) {
            element.css("cursor","pointer"); //default css
            element.bind('click',function(e){
                e.stopPropagation();
                var target = attrs.target;
                var targetArray = attrs.target.split("|");
                var scrollToElement = null;
                if(targetArray.length>0) {
                    var bFound = false;
                    //allow user to define a target array, if the first target is hidden, then go the second one..
                    for(var i in targetArray) {
                        scrollToElement = $('#'+targetArray[i]);
                        //if the target dom exist and be showed normally
                        if(scrollToElement && scrollToElement.length>0 && scrollToElement.css("display")!='none') {
                            var bIsHidden = false;
                            //make sure no parent doms are hidden, otherwise don't jump to this target
                            var parents = scrollToElement.parents();
                            for(var j=0;j<parents.length;++j) {
                                if($(parents[j]).css("display")=='none') {
                                    bIsHidden = true;
                                    break;
                                }
                            }
                            if(!bIsHidden) {
                                bFound = true;
                                break;
                            }
                        }
                    }
                    if(!bFound)
                        scrollToElement = null;
                }
                else {
                    scrollToElement = $('#'+target);
                }
                if(scrollToElement &&scrollToElement.length>0)
                    window.scrollTo(0,scrollToElement.offset().top);
            });
        }
    };
});


/**
 * @Author : Ken
 * @Date : 2014-07-04
 * @directive name : starrating
 * @attributes:
 *   max        : the max of rating
 *   rating     : the rating
 *   starspace  : the space of every star
 * @example
 * [example 1]
 *   <starrating style="color:green;font-size:20px;" rating="3.5" starspace="3"></starrating>
 * */
app.directive('starrating',function() {
    return {
        restrict: "E",
        scope: false,
        replace: false,
        template: '<ul style="margin:0px;padding:0px;"></ul>',
        link: function($scope,element,attrs) {

            var ul = element.children()[0];
            var max = attrs.max ? attrs.max : 5;
            attrs.$observe('rating',function(value){
                var rating = attrs.rating ? attrs.rating : 0;
                if(rating-parseInt(rating)<0.5)
                    rating = parseInt(rating);
                else
                    rating = parseInt(rating)+0.5;
                var starspace = attrs.starspace ? attrs.starspace : 2;
                var content = '';
                for(var i=0;i<max;++i) {
                    var className = 'icon-star-empty';
                    if(rating-i>=1) {
                        className = 'icon-star';
                    }
                    else if(rating-i==0.5) {
                        className = 'icon-star-half-empty';
                    }
                    content += '<li class="'+className+'" style="white-space: nowrap;padding: 0px '+starspace+'px"></li>';
                }
                ul.innerHTML = (content);
            });
        }
    };
});


/**
 * @Author : Ken
 * @Date : 2014-07-09
 * @directive name : starratingeditor
 * @attributes:
 *   max        : the max of rating
 *   ng-model   : the model of rating
 *   starspace  : the space of every star
 * @example
 * [example 1]
 *   <starratingeditor style="color:green;font-size:20px;" ng-model="myRating" starspace="3"></starratingeditor>
 *   //After you choose a rating, [myRating.rating] will be changed
 * */
app.directive("starratingeditor", function () {
    return {
        restrict: 'E',
        require: '?ngModel',
        replace: false,
        template: '<ul style="margin:0px 0px 0px 5px"></ul>',
        scope: {
            model: '=ngModel'
        },
        link:function (scope,element,attrs,ngModel) {
            var ul = angular.element(element.children()[0]);
            if(!attrs.max) {
                attrs.max = 5;
            }
            var max = attrs.max;
            //calculate the class of star
            scope.starClass = function(rating) {
                var className = 'icon-star-empty';
                if(scope.ratingSelected>=rating && scope.ratingOver==0 || scope.ratingOver>=rating)
                    className = 'icon-star';
                else if(scope.ratingSelected>=rating && scope.ratingOver<rating)
                    className = 'icon-star lightStar';
                return className;
            };
//            scope.$watch(function () {
//                return ngModel.$modelValue;
//            }, function(newValue) {
//                if(newValue) {
//                    newValue.clear = function() {
//                        console.log('clear');
//                    };
//                }
//            });
            //support "max={{myRating.max}}"
            attrs.$observe('max',function(value){
                var max = value;
                var starspace = attrs.starspace ? attrs.starspace : 2;
                var liContent = '';
                for(var i=0;i<max;++i){
                    liContent += '<li class="icon-star-empty" rating="'+(i+1)+'" style="padding: 0px '+starspace+'px"></li>';
                }
                ul.html(liContent);
                var liArray = ul.children();
                liArray.on('mouseleave',function(){
                    scope.$apply(function(){
                        scope.ratingOver = 0;
                        ngModel.$modelValue.ratingOver = 0;
                    });
                });
                liArray.on('mouseenter',function(){
                    var rating = angular.element(this).attr('rating');
                    scope.$apply(function(){
                        scope.ratingOver = rating;
                        ngModel.$modelValue.ratingOver = rating;
                    });
                });
                function updateClass() {
                    liArray.removeClass();
                    for(var i=0;i<liArray.length;++i) {
                        angular.element(liArray[i]).addClass(scope.starClass(i+1));
                    }
                }
                liArray.on('click',function(){
                    var rating = angular.element(this).attr('rating');
                    updateClass();
                    scope.$apply(function(){
                        scope.ratingSelected = rating;
                        ngModel.$modelValue.rating = rating;
                    });
                });
                scope.$watch('ratingOver',function(to,from){
                    updateClass();
                });
                scope.$watch('model.rating',function(rating){
                    scope.ratingSelected = rating;
                    updateClass();
                });
            });
        }
    };
});


/**
 * @Author : Ken
 * @Date : 2014-07-14
 * @directive name : mpRepeat
 * @attributes:
 *   mp-repeat  : the repeat-count of template
 * @example
 * [example 1]
 *          <div mp-repeat="2">abc</div>
 * Result:
 *          <div mp-repeat="2">abc</div>
 *          <div mp-repeat="2">abc</div>
 * */
app.directive("mpRepeat", function () {
    return {
        restrict: 'A',
        link:function(scope,element,attrs) {
            attrs.$observe('mpRepeat',function(count) {
                for (var i = 0; i < count - 1; ++i) {
                    var newObj = element[0].cloneNode(true);
                    element[0].parentNode.insertBefore(newObj, element[0]);
                }
            });
        }
    };
});

/**
 * @Author : Ken
 * @Date : 2014-07-14
 * @directive name : mpToggle
 * @attributes:
 * @example
 * [example 1]
 *        <a href="javascript:;" mp-toggle="targetId" data-show-text="See more" data-hide-text="See less">See more</a>
 *        <div id="targetId">
 *            abc,def
 *        </div>
 *
 *        //when click <a>, the 'targetId' dom will toggle display to show or hide, at same time changing text itself base on data-show-text/data-hide-text.
 * */
app.directive("mpToggle", function(){
    return {
        link:function(scope,element,attrs) {
            if(!attrs.mpToggle)
                return;

            scope.show = attrs.show ? true:false;
            var targetObj = angular.element("#"+attrs.mpToggle);

            if(!scope.show)
                targetObj.css("display","none");

            element.on('click',function(){
                if(scope.show) {
                    targetObj.css("display","none");
                    if(attrs.showText)
                        element.html(attrs.showText);
                }
                else {
                    targetObj.css("display","");
                    if(attrs.hideText)
                        element.html(attrs.hideText);
                }
                scope.show = !scope.show;
            });
        }
    };
});

/**
 * @Author : Ken
 * @Date : 2014-08-05
 * @directive name : mpRepeatDirectiveFinish
 * @attributes:
 *          mp-repeat-directive-finish : [function] this specific function will be invoked after ng-repeat all be repeated.
 * @example
 * [example 1]
 *          //Step1 for html
 *          <div ng-repeat="item in items" mp-repeat-directive-finish="onRepeatFinish"> //!notice: not 'onRepeatFinish()'
 *              {{item.name}}
 *          </div>
 *
 *          //Step2 for controller(js)
 *          $scope.onRepeatFinish = function() {
 *              console.log("loaded");
 *          };
 *
 *          //description: onRepeatFinish will be called after ng-repeat is done.
 *
 * */
app.directive('mpRepeatDirectiveFinish', function() {
    return {
        link:function(scope, element, attrs) {
            if (scope.$last) {
                var functionExpress = attrs.mpRepeatDirectiveFinish;
                var funcName = functionExpress;
                var index = functionExpress.indexOf('(');
                if(index>0) {
                    funcName = functionExpress.substring(0,index);
                }
                var finishFunc = scope.$parent[funcName];
                if(finishFunc) {
                    if(index>0)  //func(params)
                        eval("scope.$parent."+functionExpress);
                    else if(index==-1) //just function name provided
                        finishFunc();
                }
                else
                    console.error("[Directive:mpRepeatDirectiveFinish] no mpRepeatDirectiveFinish function");
            }
        }
    };

});

/**
 * @Author : Ken
 * @Date : 2015-01-31
 * @directive name : mpWeChatShare
 * @attributes:
 * @example
 * <mp-we-chat-share class="fa-weixin green bigger-150 pointer" style="margin-left:5px;"></mp-we-chat-share>
 * */
app.directive("mpWeChatShare", ['$rootScope','$location','$mpLanguage',function ($rootScope, $location,$mpLanguage) {
    var L = $mpLanguage.L;
    var dialog_html = '\
        <div id="js-wechat-share" style="display:none;position: fixed;top:100px;width:312px;height:340px;border:1px solid grey;background-color: #eee;z-index:100;border-radius: 10px;box-shadow: 0px -1px 10px 2px #e4e4e4;">\
            <div class="col-xs-12 mp-dialog-header" style="border:0px solid green;">\
                <div class="col-xs-12 pull-right icon-remove bigger-200 red close" style="height:30px;width:30px;" onclick="$(\'#js-wechat-share\').hide()">\
                </div>\
            </div>\
            <div class="col-xs-12 mp-dialog-content mp-clear text-center" style="border:0px solid green;padding:5px;">\
                <div class="qrcode"></div>\
                <div class="bigger-130" style="margin:5px 0px">'+L.scan_qrcode_with_weichat+'</div>\
            </div>\
        </div>\
        ';

    $('body').append(dialog_html);

    var dialog = $('#js-wechat-share');
    return {
        restrict: 'E',
        link:function(scope,element,attrs) {
            var qrcode = $('#js-wechat-share .qrcode');
            qrcode.html('');
            qrcode.qrcode({width:200,height:200,text:$location.absUrl()});

            element.on('click',function(){
                var rect = GetCenterPosition(dialog);
                dialog.css('left',rect.left+'px');
                dialog.show();
            });
        }
    };
}]);

/**
 * @Author : Josh
 * @Date : 2015-06-01
 * @directive name : mpFaceBookShare
 * @attributes:
 * @example
 * <mp-face-book-share class="fa-facebook-square mp-pointer" style="font-size: 150%;margin-left:15px;" id="share_button" fbshare="FBshare_dataObj"></mp-face-book-share>
 * */
app.directive("mpFaceBookShare", ['$rootScope','$location','$mpLanguage',function ($rootScope, $location,$mpLanguage) {
    var FBshare_html = '\
        <div id="fb-root"></div>\
        <script>\
            window.fbAsyncInit = function() { FB.init({appId: \'814884431855774\', status : true, cookie : true, xfbml  : true});};\
            (function() {\
                var e = document.createElement(\'script\');\
                e.src = document.location.protocol + \'//connect.facebook.net/en_US/all.js\';\
                e.async = true;\
                document.getElementById(\'fb-root\').appendChild(e);\
            }());\
        </script>\
        ';
    //var FBshare_html = '<div id="fb-root"></div>';

    $('body').append(FBshare_html);

    var button = $('#share_button');

    var display = 'iframe';

    if (navigator.userAgent.toLowerCase().indexOf("chrome") != -1){
        display = "popup"
    }

    return {
        restrict: 'E',
        scope: {
            fbshare:'='
        },
        link:function(scope,element,attrs) {
            if (!window.location.origin)
                window.location.origin = window.location.protocol+"//"+window.location.host;
            scope.fbshare = _.cloneDeep(scope.fbshare);

            var fbshare = {
                name: scope.fbshare.name,
                link: window.location.href,
                description: scope.fbshare.description,
                image: scope.fbshare.image
            };

            $(document).ready(function(){
                $('#share_button').click(function(e){
                    e.preventDefault();
                    FB.ui(
                        {
                            method: 'feed',
                            display: display,
                            name: fbshare.name,
                            link: fbshare.link,
                            picture: fbshare.image,
                            caption: 'Chumuu',
                            description: fbshare.description,
                            redirect_uri: window.location.origin + '/popup_auto_close',
                            message: ''
                        });
                });
            });
        }
    };
}]);

/**
 * @Author : Ken
 * @Date : 2015-02-04
 * @directive name : mpSortable
 * @description : mpSortable will sorts array by clicking column, then angular renders UI after that.
 * @example
    array = [
        {id:1,name:'Tom'},
        {id:2,name:'Jim'},
        {id:3,name:'Alice'}
    ];
    <table mp-sortable="array">
        <thead>
            <tr>
                <th data-sorting-column="id">ID</th>
                <th data-sorting-column="name">Name</th>
            </tr>
        </thead>
        <tbody>
            <tr ng-repeat="user in array">
                <td ng-bind="user.id"></td>
                <td ng-bind="user.name"></td>
            </tr>
        </tbody>
    </table>
 * */
app.directive("mpSortable", ['$rootScope','$location',function ($rootScope, $location) {
    return {
        restrict: 'A',
//        require: '?ngModel',
//        scope: {
//            model: '=ngModel'
//        },
        link: function(scope,element,attrs, ngModel) {
            element.addClass('mp-sortable');
            var $columns = element.find('[data-sorting-column]');
            $columns.addClass('sorting');

            $columns.on('click',function(){
                var $this = $(this);
                var column = $this.attr('data-sorting-column');
                var list = scope.$parent[attrs.mpSortable];
                if(!list || !column) {
                    console.error('mp-sortable error, list , list name =',attrs.mpSortable);
                    return false;
                }

                var hasAsc = $this.hasClass('sorting_asc');
                $columns.removeClass('sorting_asc sorting_desc');
                $columns.addClass('sorting');
                if(hasAsc) {
                    $this.removeClass('sorting_asc');
                    $this.addClass('sorting_desc');
                }
                else {
                    $this.removeClass('sorting_desc sorting');
                    $this.addClass('sorting_asc');
                }

                var asc = hasAsc ? 1 : -1;
                var _sort = function(a,b){
                    if(a[column]==b[column])
                        return 0;
                    else {
                        var ret = a[column] < b[column] ? -1 : 1;
                        ret *= asc;
                        return ret;
                    }
                };
                list.sort(_sort);
                scope.$parent.$apply();
            });
        }
    }
}]);

/**
 * @Author : Ken
 * @CreateOn : 2015-04-21
 * @LastModifyOn : 2015-04-21
 * @directive name : mpPrintMenu
 * @description : mpPrintMenu will open
 * @example
 * */
app.directive("mpPrintMenu", ['$rootScope',function ($rootScope) {
    return {
        restrict: 'A',
        scope: {
            bizInfo:'=' //getItem is a function of prototype, JSON.parse dosen't work well here. So can't use '@'
                        //we can't use bizId because bizInfo's data is fetched by ajax
        },
        link: function (scope, element, attrs, ngModel) {
            element.on('click',function(){
                var url = "/api/biz/"+scope.bizInfo.getItem('biz_id')+"/menupdf";
                if(gBrowser.map.gaode) {
                    url += "?map=gaode";
                }
                else {
                    url += "?map=google";
                }
                window.open(url);
            });
        }
    }
}]);

/**
 * @Author : Josh
 * @CreateOn : 2015-05-11
 * @LastModifyOn : 2015-05-11
 * @directive name : mpReformatPhoneNumber
 * @description : mpReformatPhoneNumber will reformat a phone number to the standard form: (xxx) xxx-xxxx after users input a phone number.
 * @example
 * */
app.directive("mpReformatPhoneNumber", ['$rootScope',function ($rootScope) {
    return {
        scope: {
            model: '=ngModel'
        },
        link: function (scope, element, attrs, ngModel) {
            element.on('blur',function(event){
                var phoneNum = (""+element.val()).replace(/\D/g, '');
                var standardNum = /(^(13\d|14[57]|15[^4,\D]|17[678]|18\d)\d{8}|170[059]\d{7})$/;
                if ($rootScope.isCN) {
                    if (phoneNum.length != 11 || !standardNum.test(phoneNum)) {
                        WarningBox('号码格式有误或号码不存在');
                        if (phoneNum.length == 11) {
                            phoneNum += ' ';
                        }
                        scope.model = phoneNum;
                        scope.$apply();
                    }
                    else  {
                        scope.model = phoneNum;
                        scope.$apply();
                        phoneNum = phoneNum.match(/^(\d{3})(\d{4})(\d{4})$/);
                        phoneNum = (!phoneNum) ? null : phoneNum[1] + phoneNum[2] + phoneNum[3];
                    }
                }
                else {
                    if (phoneNum.length != 10) {
                        WarningBox('Please input the right format of phone number');
                        phoneNum += ' ';
                        scope.model = phoneNum;
                        scope.$apply();
                    }
                    else  {
                        scope.model = phoneNum;
                        scope.$apply();
                        phoneNum = phoneNum.match(/^(\d{3})(\d{3})(\d{4})$/);
                        phoneNum = (!phoneNum) ? null : '('+phoneNum[1]+ ') ' + phoneNum[2] + '-' + phoneNum[3];
                    }
                }

                event.target.value = phoneNum;
            });
        }
    }
}]);

app.directive("mpTableQr",['$location',function ($location) {
    return {
        scope: false,
        replace: false,
        restrict: 'E',
        template:"<div class='mpTableQrQrcode'></div><div class='mpTableQrSeq'>abc</div>",
        link:function($scope,element,attrs) {
           attrs.$observe('code',function(value){
                var qrcode = $(element).find("div.mpTableQrQrcode");
                qrcode.html('');
                //check the code is well formatted
                if (value !=null && value.indexOf("q=")==0 && value.length>=35) {
                    qrcode.qrcode({width: 200, height: 200, text: sys_config.auto_login_url+value});
                }
            })
            attrs.$observe('seq',function(value){
                var seq= $(element).find("div.mpTableQrSeq");
                seq.html('');
                if (value !=null) {
                   seq.html(value);
                }
            })
        }
    }}]);
