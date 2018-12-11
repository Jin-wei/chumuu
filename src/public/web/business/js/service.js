/**
 * Created by md on 14-8-22.
 */

//For ajax call
app.factory('$mp_ajax',['$http','$cookieStore','$location','$q',function($http,$cookieStore,$location,$q){
    var $mp_ajax = {};
    $mp_ajax.AUTH_NAME = "auth-token";
    $mp_ajax.USER="user";
    $mp_ajax.PASSWORD="pass-word";

    $mp_ajax.setHeader = function(name,value) {
        $http.defaults.headers.common[name] = value;
    };

    $mp_ajax.setHeader('Content-Type','application/json');

    $mp_ajax.get = function(url,success,error) {
        url = '/api' + (url[0]==='/'?'':'/') + url;
        var ajax = $http.get(url).success(function(data){
//            console.log('mp get', data);
            onSuccess(data,success);
        }).error(function(data){
            onError(data,error);
        });
        return ajax;
    };

    $mp_ajax.getCookie = function (name) {
        return $.cookie(name);
    };

    $mp_ajax.promiseGet = function(url,param) {
        url = '/api' + (url[0]==='/'?'':'/') + url;
        var deferred = $q.defer();
        $http.get(url,param).success(function(data){
            deferred.resolve(data);
        }).error(function(data){
            checkAuthorizedStatus(data);
            deferred.reject(data);
        });
        return deferred.promise;
    };

    $mp_ajax.post = function(url,data,success,error) {
        url = '/api' + (url[0]==='/'?'':'/') + url;
        var ajax = $http.post(url,data).success(function(data){
            onSuccess(data,success);
        }).error(function(data){
            onError(data,error);
        });
        return ajax;
    };

    $mp_ajax.formPost = function(dom,url,success,error) {
        url = '/api' + (url[0]==='/'?'':'/') + url;
        var options = {
            url: url,
            type:'post',
            beforeSend: function(xhr) {xhr.setRequestHeader($mp_ajax.AUTH_NAME,$.cookie($mp_ajax.AUTH_NAME));},
            success: function(data) {onSuccess(data,success)},
            error: function(data) {onError(data,error)}
        };
        $(dom).ajaxSubmit(options);
    };

    $mp_ajax.delete = function(url,data,success,error) {
        if(_.isFunction(data)) {
            error = success;
            success = data;
            data = {};
        }
        else if(_.isObject(data)) {
            //Ken 2014-11-06
            //angular don't support data with DELETE/GET/HEAD/JSONP
            //but we can make it work after referring angular source code
            data = {data:data};
        }
        url = '/api' + (url[0]==='/'?'':'/') + url;
        var ajax = $http.delete(url,data).success(function(data){
            onSuccess(data,success);
        }).error(function(data){
            onError(data,error);
        });
        return ajax;
    };

    $mp_ajax.put = function(url,data,success,error) {
        url = '/api' + (url[0]==='/'?'':'/') + url;
        var ajax = $http.put(url,data).success(function(data){
            onSuccess(data,success);
        }).error(function(data){
            onError(data,error);
        });
        return ajax;
    };

    $mp_ajax.promisePut = function(url,param) {
        url = '/api' + (url[0]==='/'?'':'/') + url;
        var deferred = $q.defer();
        $http.put(url,param).success(function(data){
            deferred.resolve(data);
        }).error(function(data){
            checkAuthorizedStatus(data);
            deferred.reject(data);
        });
        return deferred.promise;
    };
    function onSuccess(data,success) {
        if(!angular.isUndefined(success) && success!=null) {
            success(data);
        }
    }
    function onError(data,error) {
        checkAuthorizedStatus(data);
        if(!angular.isUndefined(error) && error!=null) {
            error(data);
        }
    }
    function checkAuthorizedStatus(data) {
        if(!angular.isUndefined(data.outMsg) && data.outMsg=="Access token error ,the Api can't be accessed") {
            $.cookie($mp_ajax.AUTH_NAME,"");
            window.location.href="biz_login.html";
        }
        if(!angular.isUndefined(data.message) && data.message=="Access token error ,the Api can't be accessed") {
            $.cookie($mp_ajax.AUTH_NAME,"");
            window.location.href="biz_login.html";

        }
    }
    return $mp_ajax;
}]);

app.factory('$mp_json',function(){
    var $mp_json = {};
    /**
     * @param obj the obj you want to translate (required)
     * @param keyArray the keys you want to translate (optional)
     * */
    $mp_json.translateBoolean2Integer = function(obj,keyArray) {
        if(angular.isUndefined(keyArray) || keyArray==null) {
            for (var key in obj) {
                if (typeof obj[key] === 'boolean') {
                    obj[key] = obj[key] == false ? 0 : 1;
                }
            }
        }
        else {
            for(var i in keyArray) {
                obj[keyArray[i]] = obj[keyArray[i]] == false ? 0 : 1;
            }
        }
        return obj;
    };
    /**
     * @param obj the obj you want to translate (required)
     * @param keyArray the keys you want to translate (required)
     * */
    $mp_json.translateInteger2Boolean = function(obj,keyArray) {
        for(var i in keyArray) {
            obj[keyArray[i]] = obj[keyArray[i]] == 0 ? false : true;
        }
        return obj;
    };
    return $mp_json;
});
