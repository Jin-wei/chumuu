/**
 * Created by Josh on 14-10-3   .
 */

app.controller("loginIndexController", ['$rootScope','$scope','$mp_ajax',function($rootScope,$scope ,$mp_ajax) {
    $rootScope.i18n = {
        'en-us':en_us,
        'zh-cn':zh_cn
    };
    console.log("Hello");
    $rootScope.LoadLanguage = function(key) {
        console.log(key);
        if(key && key!=$rootScope.curLang) {
            $rootScope.curLang = key;
            $rootScope.L = $rootScope.i18n[key];
            $.cookie('lang',key,{path:'/'});
            L = $rootScope.L;
        }
    };
    var lang = $.cookie('lang');
    lang = lang ? lang : 'en-us';
    $rootScope.LoadLanguage(lang);

    $scope.onChangeLanguage = function() {
        $rootScope.LoadLanguage($rootScope.L.next_key);
    };
    var L = $rootScope.L;
}]);