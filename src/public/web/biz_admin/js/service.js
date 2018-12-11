/**
 * Created by Josh on 2/15/16.
 */


/**
 * @Author : Ken
 * @CreateDate : 2015-02-27
 * @LastUpdateDate : 2015-02-27
 * @description : ajax service
 */
//For ajax call
app.factory('$mp_ajax',['$http','$cookieStore','$location','$q',function($http,$cookieStore,$location,$q){
    var $mp_ajax = {};
    $mp_ajax.AUTH_NAME = "auth-token";

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

/**
 * @Author : Ken
 * @CreateDate : 2015-02-27
 * @LastUpdateDate : 2015-02-27
 * @description : new ajax service
 */
//For ajax call
app.factory('$mpAjax',['$http','$location','$q',function($http,$location,$q){
    var _this = {};
    _this.AUTH_NAME = "auth-token";
    _this.CUST_AUTH_NAME = "customer-token";

    _this.setHeader = function(name,value) {
        $http.defaults.headers.common[name] = value;
    };

    _this.setHeader('Content-Type','application/json');

    _this.formPost = function(dom,url,success,error) {
        url = '/api' + (url[0]==='/'?'':'/') + url;
        var options = {
            url: url,
            type:'post',
            beforeSend: function(xhr) {
                xhr.setRequestHeader(_this.AUTH_NAME,$.cookie(_this.AUTH_NAME));
                //xhr.setRequestHeader('Content-Type','multipart/form-data');
            },
            success: function(data) {
                if(_.isFunction(success)) {
                    success(data);
                }
            },
            error: function(data) {
                checkAuthorizedStatus(data);
                if(_.isFunction(error)) {
                    error(data);
                }
            }
        };
        $(dom).ajaxSubmit(options);
    };

    var fnArray = ['get','delete','jsonp','head','post','put'];
    for(var i in fnArray) {
        (function(fn) {
            _this[fn] = function(url,param) {
                url = '/api' + (url[0]==='/'?'':'/') + url;
                var deferred = $q.defer();
                //only 'post,put' need 2nd parameter
                $http[fn](url,param).success(function(data){
                    deferred.resolve(data);
                }).error(function(data){
                    checkAuthorizedStatus(data);
                    deferred.reject(data);
                });
                return deferred.promise;
            };
        })(fnArray[i]);
    }

    function checkAuthorizedStatus(data) {
        if(!angular.isUndefined(data.outMsg) && data.outMsg=="Access token error ,the Api can't be accessed") {
            $.cookie(_this.AUTH_NAME,"");
            window.location.href="biz_admin_login.html";
        }
        if(!angular.isUndefined(data.message) && data.message=="Access token error ,the Api can't be accessed") {
            $.cookie($mp_ajax.AUTH_NAME,"");
            window.location.href="biz_admin_login.html";
        }
    }
    return _this;
}]);

/**
 * @Author : Josh
 * @CreateDate : 2016-02-10
 * @LastUpdateDate : 2016-02-10
 * @description : admin user service
 */
app.factory('$mpUser',['$rootScope','$q','$mpAjax','$mpFactory','$location',function($rootScope,$q,$mpAjax,$mpFactory,$location) {
    var newInstance = function() {
        var _this = $mpFactory.newService();

        _this.init = function(id,setting) {

            var url = '/admin/'+id;

            return _this.baseLoad(url,setting);
        };

        _this.getId = function() {
            return _this.getItem('id');
        };

        _this.checkRedirect = function () {
            var Auth_Token = $.cookie($mpAjax.AUTH_NAME);
            var User_Id = $.cookie('userId');

            if(_.isEmpty(Auth_Token) || _.isEmpty(User_Id)) {
                _this.clearCookie();
                window.location.href = "/biz_admin_login.html";
            }
        };

        _this.login = function(user) {
            var deferred = $q.defer();

            _this.clearCookie();

            var postData = {};
            postData.username = user.username;
            postData.password = user.password;

            $mpAjax.post("/admin/do/login",postData).then(function(json) {
                //$.cookie($mpAjax.CUST_AUTH_NAME, json['accessToken'],{path:'/'});
                if(!json.userId) {
                    deferred.reject(json.errMsg);
                }
                else {
                    _this.setCookie(json.userId,json.accessToken);
                    deferred.resolve(json);
                }
            }).catch(function(json) {
                deferred.reject(json.message);
            });
            return deferred.promise;
        };

        _this.logout = function() {
            _this.clearCookie();
            window.location.href = "/biz_admin_login.html";
        };

        _this.clearCookie = function() {
            $.cookie($mpAjax.AUTH_NAME, '');
            $.cookie('userId', '');
        };

        _this.setCookie = function(userId,token) {
            $.cookie('userId', userId);
            $.cookie($mpAjax.AUTH_NAME, token);
            $mpAjax.setHeader($mpAjax.AUTH_NAME,token);
        };

        _this.newInstance = newInstance;
        return _this;
    };
    return newInstance();
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


/**
 * @Author : Ken
 * @CreateDate : 2015-07-16
 * @LastUpdateDate : 2015-07-16
 * @description : coffee customer complaint service
 */
//For ajax call
app.factory('$mpComplaint',['$http','$location','$q','$mpAjax','$mpFactory','$mpBizInfo',function($http,$location,$q,$mpAjax,$mpFactory,$mpBizInfo) {
    var newInstance = function() {
        var _this = $mpFactory.newService();

        _this.init = function(setting) {
            var deferred = $q.defer();
            setting = setting || {};

            var defaultString = '/biz/'+$mpBizInfo.getId()+'/orderComplain?a=a';
            var search = defaultString;

            if(setting.pageNo>0) {
                search += '&start='+(setting.pageNo-1)*setting.pageSize;
            }
            if(setting.pageSize>0) {
                search += '&size='+(setting.pageSize+1);
            }

            _this.baseInit(search).then(function(data){
                _.forEach(data,function(o){
                    o.createOn = DateUtil.format(o.created_on,'yyyy-MM-dd HH:mm:ss');
                    o.bizId = o.biz_id;

                    var orderDate = DateUtil.format(DateUtil.UTCDateTime2LocalDateTime(o.order_start),'yyyy-MM-dd HH:mm');
                    var dateStart = DateUtil.UTCDateTime2LocalDateTime(o.order_start);
                    dateStart.setMinutes(dateStart.getMinutes()+30);
                    orderDate += '-'+DateUtil.format(dateStart,'HH:mm');

                    o.orderStart = orderDate;
                    o.fullAddress = o.city+' '+o.address;
                });
                deferred.resolve(data);
            }).catch(function(error){
                deferred.reject(error);
            });
            return deferred.promise;
        };

        _this.update = function(complaint) {
            var deferred = $q.defer();
            var url = '/order/'+complaint.order_id+'/orderComplain/'+complaint.id;
            $mpAjax.put(url,complaint).then(function(data){
                complaint.updated_on = new Date();
                deferred.resolve(data);
            }).catch(function(error){
                deferred.reject(error);
            });
            return deferred.promise;
        };

        _this.newInstance = newInstance;
        return _this;
    };
    return newInstance();
}]);

/**
 * @Author : Ken
 * @CreateDate : 2015-07-28
 * @LastUpdateDate : 2015-07-28
 * @description : coffee biz invoice service
 */
//For ajax call
app.factory('$mpInvoice',['$http','$location','$q','$mpAjax','$mpFactory','$mpBizInfo',function($http,$location,$q,$mpAjax,$mpFactory,$mpBizInfo) {
    var newInstance = function() {
        var _this = $mpFactory.newService();

        _this.init = function(setting) {
            var deferred = $q.defer();
            setting = setting || {};

            var defaultString = '/admin/payment/do/allWeekStat?a=a';//'/biz/'+$mpBizInfo.getId()+'/orderComplain?a=a';
            var search = defaultString;

            if(setting.pageNo>0) {
                search += '&start='+(setting.pageNo-1)*setting.pageSize;
            }
            if(setting.pageSize>0) {
                search += '&size='+(setting.pageSize+1);
            }
            _this.baseInit(search).then(function(data){
                //_.forEach(data,function(o){
                //    o.actualPrice = o.biz_id;
                //});
                deferred.resolve(data);
            }).catch(function(error){
                deferred.reject(error);
            });
            return deferred.promise;
        };

        _this.loadListByCycle = function(cycle_key) {
            var deferred = $q.defer();
            var cycle = _.find(_this.getData(),{year_week:cycle_key});
            if(cycle) {
                $mpAjax.get('/admin/payment/do/bizWeekStat?yearWeek='+cycle_key).then(function(data){
                    //_.forEach(data,function(o){
                    //    o.actualPrice = o.biz_id;
                    //});
                    cycle.items = data || [];
                    deferred.resolve(data);
                }).catch(function(error){
                    deferred.reject(error);
                });
            }
            else {
                deferred.reject('no this cycle');
            }
            return deferred.promise;
        };

        _this.getListByBiz = function(bizId) {
            var deferred = $q.defer();
            _this.baseInit('/payment/bizInvoice?bizId='+bizId).then(function(data){
                //_.forEach(data,function(o){
                //    o.actualPrice = o.biz_id;
                //});
                deferred.resolve(data);
            }).catch(function(error){
                deferred.reject(error);
            });
            return deferred.promise;
        };

        _this.newInstance = newInstance;
        return _this;
    };
    return newInstance();
}]);

/**
 * @Author : Josh
 * @LastUpdateDate : 2015-02-29
 * @LastUpdateDate : 2015-02-29
 * @description : for biz list.
 */
app.factory('$mpAdminBizList',['$mpAjax','$q','$mpFactory',function($mpAjax,$q,$mpFactory){
    var _this = $mpFactory.newService();

    _this.init = function(url) {
        var deferred = $q.defer();
        url = url || '/biz?active=1';
        _this.ajaxGetPrimaryData(url, deferred).then(function(data){
            _.forEach(data, function(_b){
                var phones = _b.phone_no ? _b.phone_no.split(/[,;]/) : [''];
                _b.phoneNo = phones[0];
                //_b.active = 1;
                _b.bizKey = _b.biz_unique_name ? _b.biz_unique_name : _b.biz_id;
            });
            TranslateBizImageUrl(data);
            deferred.resolve(data);
        });
        return deferred.promise;
    };

    _this.add = function(formDom,params) {
        var deferred = $q.defer();
        if(!params) {
            console.error('$mpBizList -> add -> params is null');
        }
        $mpAjax.formPost(formDom,'/biz',function(data){
            params.biz_id = data.bizId;
            _this.getData().push(params);
            deferred.resolve(data);
        },function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    };

    _this.update = function(_old,_new) {
        var deferred = $q.defer();
        $mpAjax.put('/bizHard',_new).then(function(data){
            $.extend(_old,_new);
            deferred.resolve(data);
        }).catch(function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    };

    _this.delete = function() {
        alert('in developing');
    };

    return _this;
}]);