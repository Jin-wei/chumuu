/**
 * Created by md on 14-7-9.
 */


//For ajax call
app.factory('$mp_ajax',['$http','$location','$q',function($http,$location,$q){
    var $mp_ajax = {};
    $mp_ajax.AUTH_NAME = "auth-token";
    $mp_ajax.CUST_AUTH_NAME = "customer-token";
    $mp_ajax.CUST_USER="user";
    $mp_ajax.CUST_PASSWORD="pass-word";

    $mp_ajax.getCookie = function (name) {
        return $.cookie(name);
    };


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
            beforeSend: function(xhr) {xhr.setRequestHeader($mp_ajax.AUTH_NAME,$.cookie($mp_ajax.CUST_AUTH_NAME));},
            success: function(data) {onSuccess(data,success)},
            error: function(data) {onError(data,error)}
        };
        $(dom).ajaxSubmit(options);
    };

    $mp_ajax.delete = function(url,success,error) {
        url = '/api' + (url[0]==='/'?'':'/') + url;
        var ajax = $http.delete(url).success(function(data){
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
        if( data != null && data.code=="NotAuthorized") {
            $.cookie($mp_ajax.CUST_AUTH_NAME,"");

            console.log("not authorized")
            window.location.href="/login?preUrl="+escape($location.absUrl());
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
                xhr.setRequestHeader(_this.CUST_AUTH_NAME,$.cookie(_this.CUST_AUTH_NAME));
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
        if( data != null && data.code=="NotAuthorized") {
            $.cookie(_this.CUST_AUTH_NAME,"");
            window.location.href="/customer/login.html?preUrl="+escape($location.absUrl());
        }
    }
    return _this;
}]);


/**
 * @Author : Ken
 * @CreateDate : 2015-02-15
 * @LastUpdateDate : 2015-05-21
 * @description : customer information service
 */
app.factory('$mpCustomer',['$rootScope','$mpAjax','$q','$mpFactory','$location',function($rootScope,$mpAjax,$q,$mpFactory,$location){
    var _this = $mpFactory.newService();

    _this.setAvatar = function(url) {
        _this.setItem('avatar','/api/image/'+url+'/m');
    };

    //$mpAjax.get('/cust/26/order').then(function(data){
    //    console.log(';',data);
    //}).catch(function(error){
    //    console.log('22',error);
    //});

    _this.init = function() {
        var deferred = $q.defer();
        _this.baseInit('/customerInfo').then(function(data){
            var _fullName='';
            if (! $rootScope.isCN){
                if (data.first_name!=null && data.first_name !='null'){
                    _fullName+=data.first_name;
                }
                if (data.last_name!=null && data.last_name !='null'){
                    if (_fullName.length>0){
                        _fullName+=' ';
                    }
                    _fullName+=data.last_name;
                }
            }else{
                if (data.last_name!=null && data.last_name !='null'){
                    _fullName+=data.last_name;
                }
                if (data.first_name!=null && data.first_name !='null'){
                    if (_fullName.length>0){
                        _fullName+=' ';
                    }
                    _fullName+=data.first_name;
                }
            }
            _this.setItem('fullName',_fullName);
            _this.setItem('biz_id',data.biz_id);
            _this.setItem('avatar',_this.getItem('avatar') ? '/api/image/'+_this.getItem('avatar')+'/m' : '/image/default-avatar.png');
            $rootScope.isLogin = true;
            deferred.resolve(data);
        }).catch(function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    };

    //update customer information
    _this.updateBaseInfo = function(param) {
        var _params = {
            username:    param.username     || _this.getItem('username'),
            firstName:   param.first_name   || _this.getItem('first_name'),
            lastName:    param.last_name    || _this.getItem('last_name'),
            phoneNo:     param.phone_no     || _this.getItem('phone_no'),
            gender:      param.gender       || _this.getItem('gender'),
            address:     param.address      || _this.getItem('address'),
            city:        param.city         || _this.getItem('city'),
            state:       param.state        || _this.getItem('state'),
            zipcode:     param.zipcode      || _this.getItem('zipcode')
        };
        var deferred = $q.defer();
        $mpAjax.put('/cust/'+_this.getItem('customer_id'), _params).then(function(data){
            //save
            for(var key in param) {
                _this.setItem(key,param[key]);
            }
            deferred.resolve(data);
        }).catch(function(error){
            $log.error(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };

    //update password
    _this.updatePassword = function(param) {
        var _params = {
            password: param.current,
            newPassword: param.new
        };
        return $mpAjax.post('/cust/'+_this.getItem('customer_id')+'/changepassword',_params).then(function(){SuccessBox('Password has been changed!')});
    };

    //update email/username
    _this.updateEmail = function(param) {
        var _params = {
            email: param.current,
            newEmail: param.new,
            password: param.pwd
        };
        return $mpAjax.put('/cust/'+_this.getItem('customer_id')+'/loginEmail', _params);
    };

    _this.clearCookie = function() {
        $.cookie($mpAjax.CUST_AUTH_NAME, '');
        $.cookie('customerId', '');
    };

    _this.setCookie = function(custId,token) {
        var expDate = new Date();
        expDate.setTime(expDate.getTime() + (2*60*60 * 1000)); // add 2 hours
        $.cookie('customerId', custId,{expires: expDate});
        $.cookie($mpAjax.CUST_AUTH_NAME, token,{expires: expDate});
        $mpAjax.setHeader($mpAjax.CUST_AUTH_NAME,token);
    };

    /**
     * @params user = {email,password,fbToken};
     * */
    _this.login = function(user) {
        var deferred = $q.defer();

        _this.clearCookie();

        var postData = {};
        //postData.user = user.email ? user.email : user.phone;

        if (user.email) {
            postData.email = user.email;
        }
        if (user.phone) {
            postData.phone = user.phone;
        }
        postData.password = user.password;
        postData.fbToken = user.fbToken;
        postData.qr=user.qr;

        $mpAjax.post("/cust/do/login",postData).then(function(json) {
            if(!json.customerId) {
                deferred.reject('No customer info');
            }
            else {
                console.log("login info:")
                console.dir(json)
                _this.setCookie(json.customerId,json.accessToken);
                deferred.resolve(json);
            }
        }).catch(function(json) {
            deferred.reject(json);
        });
        return deferred.promise;
    };

    _this.logout = function() {
        _this.clearCookie();
        _this.setData({});
        $rootScope.isLogin = false;
        $rootScope.navTo('/');
    };

    _this.register = function(user) {
        var deferred = $q.defer();

        if ($rootScope.isCN) {
            $mpAjax.post('/cust/cn',user).then(function(data){
                if (data.success === true) {
                    _this.setCookie(data.userId,data.accessToken);
                }
                deferred.resolve(data);
            }).catch(function(error){
                deferred.reject(error);
            });
        }
        else {
            $mpAjax.post('/cust/us',user).then(function(data){
                if (data.success === true) {
                    _this.setCookie(data.userId,data.accessToken);
                }
                deferred.resolve(data);
            }).catch(function(error){
                deferred.reject(error);
            });
        }

        return deferred.promise;
    };

    _this.sendCaptcha = function(phone) {
        var deferred = $q.defer();

        $mpAjax.post('/sms/' + phone + '/sign', {phone: phone}).then(function (json) {
            if (!json.success) {
                deferred.reject("验证码发送失败"+json.errMsg);
            }
            if (json.success === true) {
                deferred.resolve("验证码发送成功，请注意查收");
            }
        }).catch(function (json) {
            deferred.reject("服务器内部错误");
        });

        return deferred.promise;
    };

    _this.forgotPassword = function(email) {
        return $mpAjax.post("/cust/send/passwordMail",{email:email});
    };

    return _this;
}]);

/**
 * @Author : Ken
 * @LastUpdateDate : 2015-02-15
 * @description : for top ten dishes page.
 */
app.factory('$mpTopDish',['$mpAjax','$q','$mpFactory',function($mpAjax,$q,$mpFactory){
    var _this = $mpFactory.newService();

    _this.init = function() {
        var deferred = $q.defer();
        _this.ajaxGetPrimaryData('/biz/get/topDish', deferred).then(function(data){
            TranslateMenuItemImageUrl(data);
            deferred.resolve(data);
        });
        return deferred.promise;
    };

    return _this;
}]);

/**
 * @Author : Ken
 * @LastUpdateDate : 2015-02-15
 * @description : for customer handle biz list.
 */
/*app.factory('$mpBizList',['$mpAjax','$q','$mpFactory',function($mpAjax,$q,$mpFactory){
    var _this = $mpFactory.newService();

    _this.init = function() {
        var deferred = $q.defer();
        _this.ajaxGetPrimaryData('/biz', deferred).then(function(data){
            _.forEach(data, function(_b){
                var phones = _b.phone_no ? _b.phone_no.split(/[,;]/) : [''];
                _b.phoneNo = phones[0];
                _b.bizKey = _b.biz_unique_name ? _b.biz_unique_name : _b.biz_id;
                _b.meShareVideo = false;
                if (!_.isEmpty(_b.website) && _b.website.slice(13,20) == 'meshare') {
                    _b.meShareVideo = true;
                }
            });
            TranslateBizImageUrl(data);
            deferred.resolve(data);
        });
        return deferred.promise;
    };

    return _this;
}]);*/

/**
 * @Author : Ken
 * @CreateOn : 2015-02-17
 * @LastUpdateOn : 2015-04-17
 * @description : for MyTable(Shopping Cart)
 */
app.factory('$mpMyTable',['$rootScope','$q','$mpFactory','$log','$mpLocalStorage','$mpAjax','$mpLanguage',
function($rootScope,$q,$mpFactory,$log,$mpLocalStorage,$mpAjax,$mpLanguage){
    var VER = 2;
    var INIT_DATA = {
        ver:VER, //version: we would change data-structure many times, if saved-version != cur-version, clear cache.
        count:0,
        isCheckingPrice: false //show loading icon
    };
    var MODULE_NAME = 'MyTable';

    var _this = {};
    _this.myTable={};

    /**
     * Data Structure :
     *  bizId
     *  bizKey
     *  bizName
     *  bizNameLang
     *  ver
     *  count
     *  prods [
     *        prodId
     *        prodName
     *        prodNameLang
     *        price
     *        actual_price
     *        img_url
     *        qty
     *  ]
     * */
    //getter & setter
    _this.getData = function() {
        return _this.myTable;
    };
    _this.setData = function(data) {
        this.myTable={};
        angular.extend(_this.myTable, data);
    };
    _this.save = function() {
        $mpLocalStorage.set(MODULE_NAME,_this.getData());
    };
    _this.clear = function() {
        _this.setData(INIT_DATA);
        _this.save();
    };

    //save & load
    _this.load = function() {
        _this.setData($mpLocalStorage.getAsObject(MODULE_NAME) || INIT_DATA);
        if( _this.getData().ver != VER ) {
            WarningBox($mpLanguage.L.add_to_table_warning_text_1);
            _this.setData(INIT_DATA);
            _this.save();
        }
    };
    //load immediately when initialization
    _this.load();

    //methods
    _this.calcPrice = function() {
        var deferred = $q.defer();
        var paramsCalcPrice = {
            startDate: moment().format("YYYY-MM-DD"), // DateUtil.format(new Date(), 'yyyy-MM-dd'),
            orderStart: moment().format("YYYY-MM-DD")
        };
        paramsCalcPrice.itemArray = [];
        var extendTotalPrice=0;
        _.forEach(_this.getData().prods,function(_p){
            if(_p.extendName){
                paramsCalcPrice.itemArray.push({
                    prodId: _p.prodId,
                    quantity: _p.qty,
                    prodExtend:_p.extendName,
                    extendPrice:_p.extendPrice,
                    extendTotalPrice:_p.extendPrice*_p.qty
                });
            }else{
                paramsCalcPrice.itemArray.push({
                    prodId: _p.prodId,
                    quantity: _p.qty
                });
            }
            if(_p.extendPrice){
                extendTotalPrice=extendTotalPrice+_p.extendPrice* _p.qty;
            }
        });
        if (_this.getData().bizId > 0 && _this.getData().prods && _this.getData().prods.length>0) {
            _this.getData().isCheckingPrice = true;
            $mpAjax.post('/biz/' + _this.getData().bizId + '/orderPrice', paramsCalcPrice).then(function (data) {
                if (_.isObject(data)) {
                    _.forEach(data.itemArray, function(item,i){
                        if (item.discount > 0) {
                            _this.getData().prods[i].discount = item.discount;
                            _this.getData().prods[i].actualPrice = item.actualPrice;
                        }
                    });
                    _this.getData().totalDiscount = data.totalDiscount;
                    _this.getData().actualPrice = data.actualPrice;
                    _this.getData().totalTax = data.totalTax;
                    _this.getData().originPrice = data.originPrice;
                    _this.getData().totalPrice = data.totalPrice;
                    _this.getData().isCheckingPrice = false;
                    _this.getData().extendTotalPrice = extendTotalPrice;
                    deferred.resolve();
                }
            }).catch(function (error) {
                $log.error('error', error);
                _this.getData().isCheckingPrice = false;
                deferred.reject(error);
            });
        }
        return deferred.promise;
    };

    _this.appendMenuItem = function(bizInfo,item,type) {
        item.nickName = $.cookie('nickName');
        //_this.load();
        //if this is the first time adding, mark bizId.
        if(!_this.getData().bizId) {
            _this.getData().bizId = bizInfo.bizId;
            _this.getData().bizKey = bizInfo.bizKey;
            _this.getData().bizName = bizInfo.bizName;
            _this.getData().bizNameLang = bizInfo.bizNameLang;
            _this.getData().bizImgUrl = bizInfo.bizImgUrl;
            //_this.getData().ver = VER;
            _this.getData().count = 0;
            _this.getData().prods = [];
        }
        else {
            //dose it cross restaurant?
            if (_this.getData().bizId != bizInfo.bizId) {
                WarningBox($mpLanguage.L.add_to_table_warning_text_2);
                return false;
            }
        }
        //check duplicate
        var searchParams={}
        searchParams.prodId=item.prodId;
        if(item.extendId){
            searchParams.extendId=item.extendId;
        }
        var duplicateItem = _.find(_this.getData().prods,searchParams);
        if(duplicateItem) {
            duplicateItem.qty++
        }
        else {
            TranslateMenuItemImageUrl(item);
            _this.getData().prods.push(item);
        }
        _this.getData().count++;
        _this.save();
        $rootScope.$broadcast('$mpMyTable:prodCountChange',{prodId:item.prodId,change:1});
        //_this.load();
        console.log(_this.getData());

        var qr = $.cookie('qr');
        var openId = $.cookie('openid');
        if(!openId){
            qr = '130gdTOyvpWmPXWXMREagaiRtdpHSkUYatI';//七彩牛222号桌
            if(navigator.userAgent.indexOf('iPhone')>-1){//微信开发工具
                openId = 'o6-f30ZHhi8uGwT1V35bdXlwpdJ4'
            }else if(navigator.userAgent.indexOf('Android')>-1){//Android手机
                openId = 'o6-f30Tk_03XzHvllpMojEPQ4o-U'
            }else if(navigator.userAgent.indexOf('Macintosh')>-1){//mac
                openId = 'o6-f30Tk_03XzHvllpMojEPQ4o-U'
            }
        }

        var paramsItemTemp = JSON.parse(JSON.stringify(_this.getData()));
        paramsItemTemp.openId = openId;

        console.log('paramsItemTemp',paramsItemTemp);

        $(".icon-tianjia").css("pointer-events","none");
        $(".icon-shandiao").css("pointer-events","none");
        $mpAjax.post('/biz/' + bizInfo.bizId + '/qr/' + qr +  '/addOrderItemTemp', paramsItemTemp).then(function (data) {
            window.setTimeout(function(){
                $(".icon-tianjia").css("pointer-events","");
                $(".icon-shandiao").css("pointer-events","");
            },1000)
        });

        return true;
    };

    _this.reduceMenuItem = function(prodId,extendId) {
        //_this.load();
        if(_.isArray(_this.getData().prods)) {
            var searchParams={}
            var bizId = _this.getData().bizId;
            searchParams.prodId=prodId;
            if(extendId){
                searchParams.extendId=extendId;
            }
            var index = _.findIndex(_this.getData().prods, searchParams);
            if(index>-1) {
                var prod = _this.getData().prods[index];
                if (prod.qty > 1) {
                    prod.qty--;
                }
                else {
                    _this.getData().prods.splice(index, 1);
                }
                _this.getData().count--;
                if(_this.getData().count<1) {
                    _this.setData(INIT_DATA);
                }
                _this.save();
                $rootScope.$broadcast('$mpMyTable:prodCountChange',{prodId:prodId,change:-1});

                console.log(_this.getData());

                var qr = $.cookie('qr');
                var openId = $.cookie('openid');
                if(!openId){
                    qr = '130gdTOyvpWmPXWXMREagaiRtdpHSkUYatI';//七彩牛222号桌
                    if(navigator.userAgent.indexOf('iPhone')>-1){//微信开发工具
                        openId = 'o6-f30ZHhi8uGwT1V35bdXlwpdJ4'
                    }else if(navigator.userAgent.indexOf('Android')>-1){//Android手机
                        openId = 'o6-f30Tk_03XzHvllpMojEPQ4o-U'
                    }else if(navigator.userAgent.indexOf('Macintosh')>-1){//mac
                        openId = 'o6-f30Tk_03XzHvllpMojEPQ4o-U'
                    }
                }

                var paramsItemTemp = JSON.parse(JSON.stringify(_this.getData()));
                paramsItemTemp.openId = openId;

                console.log('paramsItemTemp',paramsItemTemp);

                $(".icon-tianjia").css("pointer-events","none");
                $(".icon-shandiao").css("pointer-events","none");
                $mpAjax.post('/biz/' + bizId + '/qr/' + qr +  '/addOrderItemTemp', paramsItemTemp).then(function (data) {
                    window.setTimeout(function(){
                        $(".icon-tianjia").css("pointer-events","");
                        $(".icon-shandiao").css("pointer-events","");
                    },500)
                });

            }
        }
        return true;
    };

//    _this.calcPrice = function() {
//    };
//
//    _this.calcPrice = function() {
//    };
//
//    _this.calcPrice = function() {
//    };

    return _this;
}]);

/**
 * @Author : Ken
 * @LastUpdateDate : 2015-02-17
 * @description : for customer history orders
 */
app.factory('$mpCustomerHistoryOrder',['$rootScope','$mpAjax','$q','$mpFactory','$log','$mpLocalStorage','$mpBaseConst',function($rootScope,$mpAjax,$q,$mpFactory,$log,$mpLocalStorage,$mpBaseConst){
    var _this = $mpFactory.newService();

    _this.init = function(custId) {
        var deferred = $q.defer();
        _this.ajaxGetPrimaryData('/cust/'+custId+'/order',deferred).then(function(data){
            _.forEach(data,function(_o,index){
                _o.showDetail = false;
            });
            //_this.broadcast('data_ready');
            deferred.resolve(data);
        });
        return deferred.promise;
    };

    //return order detail by order id , insert detail into associated order
    _this.getOrderDetail = function(custId,orderId) {
        var deferred = $q.defer();

        var order = _.find(_this.getData(),{id:orderId});
        if(order) {
            order.isLoadingDetail = true;
            $mpAjax.promiseGet('/cust/'+custId+'/order/'+orderId)
                .then(function(data){
                    if(_.isArray(data)) {
                        order.showDetail = true;
                        _.forEach(data,function(prod,index){
                            order.menuItems.push({
                                prod_id: prod.prod_id,
                                name: prod.prod_name,
                                price: prod.total_price / prod.quantity,
                                actual_price: prod.actual_price / prod.quantity,
                                discount: prod.discount,
                                desc: prod.remark,
                                qty: prod.quantity
                            });
                        });
                        order.menuItemCount = data.length;
                    }
                })
                .catch(function(error){
                    $log.error('$mpCustomerHistoryOrder-->getOrderDetail',error);
                })
                .finally(function(){
                    order.isLoadingDetail = false;
                });
        }
        else {
            deferred.reject('no this order, orderId=',orderId);
        }

        return deferred.promise;
    };

    _this.cancel = function(custId,orderId) {
        return $mpAjax.put('/cust/'+custId+'/order/'+orderId+'/state/'+$mpBaseConst.ORDER_STATUS.CANCELED);
    };

    return _this;
}]);

/**
 * @Author : Ken
 * @LastUpdateDate : 2015-02-18
 * @description : for customer favorite business
 */
app.factory('$mpCustomerFavoriteBusiness',['$rootScope','$mpAjax','$q','$mpFactory','$log','$mpLocalStorage',function($rootScope,$mpAjax,$q,$mpFactory,$log,$mpLocalStorage){
    var _this = $mpFactory.newService();

    _this.init = function(custId) {
        var deferred = $q.defer();
        _this.ajaxGetPrimaryData('/cust/'+custId+'/favoriteBiz',deferred).then(function(data){
            TranslateBizImageUrl(data);
            _.forEach(data,function(biz){
                //#243
                var phones = biz.phone_no ? biz.phone_no.split(/[,;]/) : [];
                biz.phoneArr = [];
                _.forEach(phones,function(_o){
                    _o = _o.trim();
                    if(_o.length>0)
                        biz.phoneArr.push(_o);
                });
                biz.bizKey = biz.biz_unique_name ? biz.biz_unique_name : biz.biz_id;
                if($rootScope.coords && $rootScope.coords.latitude) {
                    var distance = GetDistance($rootScope.coords.latitude,$rootScope.coords.longitude, biz.latitude, biz.longitude);
                    if(!_.isNaN(distance))
                        biz.distance = distance;
                }
            });
            deferred.resolve(data);
        });
        return deferred.promise;
    };

    //CURD methods
    _this.favorite = function(custId,bizId) {
        return $mpAjax.post('/cust/'+custId+'/biz/'+bizId+'/favorite',{favorite:1});
        //var deferred = $q.defer();
        //$mpAjax.post('/cust/'+custId+'/biz/'+bizId+'/favorite',{favorite:1}).then(function(){
        //    //_.remove(_this.getData(),{biz_id:bizId});
        //    deferred.resolve();
        //}).catch(function(error){
        //    deferred.reject(error);
        //});
        //return deferred.promise;
    };
    _this.unFavorite = function(custId,bizId) {
        var deferred = $q.defer();
        $mpAjax.post('/cust/'+custId+'/biz/'+bizId+'/favorite',{favorite:0}).then(function(){
            _.remove(_this.getData(),{biz_id:bizId});
            deferred.resolve();
        }).catch(function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    };

    return _this;
}]);

/**
 * @Author : Ken
 * @LastUpdateDate : 2015-02-18
 * @description : for customer favorite menu item
 */
app.factory('$mpCustomerFavoriteMenuItems',['$rootScope','$mpAjax','$q','$mpFactory','$log','$mpLocalStorage',function($rootScope,$mpAjax,$q,$mpFactory,$log,$mpLocalStorage){
    var _this = $mpFactory.newService();

    _this.init = function(custId) {
        var deferred = $q.defer();
        _this.ajaxGetPrimaryData('/cust/'+custId+'/favoriteProd',deferred).then(function(data){
            TranslateMenuItemImageUrl(data);
            _.forEach(data,function(prod){
                prod.bizKey = prod.biz_unique_name ? prod.biz_unique_name : prod.biz_id;
            });
            deferred.resolve(data);
        });
        return deferred.promise;
    };

    //CURD methods
    _this.favorite = function(custId,prodId) {
        return $mpAjax.post('/cust/'+custId+'/prod/'+prodId+'/favorite',{favorite:1});
    };
    _this.unFavorite = function(custId,prodId) {
        var deferred = $q.defer();
        $mpAjax.delete('/cust/'+custId+'/prod/'+prodId+'/favorite').then(function(){
            _.remove(_this.getData(),{prod_id:prodId});
            deferred.resolve();
        }).catch(function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    };

    return _this;
}]);

/**
 * @Author : Ken
 * @CreateDate : 2015-02-26
 * @LastUpdateDate : 2015-02-26
 * @description : for restaurant comments
 */
app.factory('$mpBizComment',['$rootScope','$mpAjax','$q','$mpFactory','$log','$mpLocalStorage','$mpCustomer',function($rootScope,$mpAjax,$q,$mpFactory,$log,$mpLocalStorage,$mpCustomer){
    var _this = $mpFactory.newService();

    function _TranslateInfo(c) {
        c.fullName = "";
        if (!c.first_name && !c.last_name) {
            c.fullName = c.username;
        }
        if(c.first_name)
            c.fullName += c.first_name;
        if(c.last_name) {
            c.fullName += ',';
            if(c.last_name.length>3) {
                c.fullName += c.last_name.substring(0, c.last_name.length-3)+'***';
            }
            else {
                c.fullName += '***';
            }
        }
        c.fullAddress = "";
        if(c.city) c.fullAddress += ","+c.city;
        if(c.cstate) c.fullAddress += ","+c.cstate;
        c.fullAddress += ","+"USA";
        c.fullAddress = c.fullAddress.substring(1);
    }

    _this.init = function(bizId) {
        var deferred = $q.defer();
        _this.ajaxGetPrimaryData('/biz/'+bizId+'/bizComment',deferred).then(function(data){

            _.forEach(data,_TranslateInfo);

            deferred.resolve(data);
        });
        return deferred.promise;
    };

    //CURD methods
    _this.add = function(custId,bizId,obj) {
        var deferred = $q.defer();
        $mpAjax.post('/biz/'+custId+'/biz/'+bizId+'/comment',obj).then(function(data){
            var tmpComment = {};
            tmpComment.id = data.id;
            tmpComment.first_name = $mpCustomer.getItem('first_name');
            tmpComment.last_name = $mpCustomer.getItem('last_name');
            tmpComment.cust_id = $mpCustomer.getItem('customer_id');
            tmpComment.city = $mpCustomer.getItem('city');
            tmpComment.cstate = $mpCustomer.getItem('state');
            tmpComment.food_quality = obj.foodQuality;
            tmpComment.service_level = obj.serviceLevel;
            tmpComment.price_level = obj.priceLevel;
            tmpComment.comment = obj.comment;
            tmpComment.createtime = new Date();
            tmpComment.isNew = true;
            _TranslateInfo(tmpComment);
            _this.getData().unshift(tmpComment);
            deferred.resolve(tmpComment);
        }).catch(function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    };

    _this.delete = function(custId,commentId) {
        var deferred = $q.defer();
        $mpAjax.delete('/biz/'+custId+'/bizComment/'+commentId).then(function(data){
            _.remove(_this.getData(),{id:commentId});
            deferred.resolve(data);
        }).catch(function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    };

    return _this;
}]);

/**
 * @Author : Ken
 * @CreateDate : 2015-02-26
 * @LastUpdateDate : 2015-02-26
 * @description : for menu item comments
 */
app.factory('$mpMenuItemComment',['$rootScope','$mpAjax','$q','$mpFactory','$log','$mpLocalStorage',function($rootScope,$mpAjax,$q,$mpFactory,$log,$mpLocalStorage){
    var _this = $mpFactory.newService();

    _this.init = function(prodId) {
        var deferred = $q.defer();
        _this.ajaxGetPrimaryData('/prod/'+prodId+'/prodComment',deferred).then(function(data){
            deferred.resolve(data);
        });
        return deferred.promise;
    };

    //CURD methods
    _this.add = function(custId,prodId,obj) {
        return $mpAjax.post('/prod/'+custId+'/prod/'+prodId+'/comment',obj);
    };
    _this.delete = function(custId,commentId) {
        return $mpAjax.delete('/prod/'+custId+'/comment/'+commentId);
    };

    return _this;
}]);

/**
 * @Author : Ken
 * @CreateDate : 2015-04-23
 * @LastUpdateDate : 2015-04-23
 * @description : for menu item rating
 */
app.factory('$mpMenuItemRating',['$rootScope','$mpAjax','$q','$mpFactory','$log','$mpLocalStorage',function($rootScope,$mpAjax,$q,$mpFactory,$log,$mpLocalStorage){
    var _this = $mpFactory.newService();

    _this.init = function(prodId) {
        var deferred = $q.defer();
        _this.ajaxGetPrimaryData('/prod/'+prodId+'/ratComment',deferred).then(function(data){
            deferred.resolve(data);
        });
        return deferred.promise;
    };

    return _this;
}]);

/**
 * @Author : Ken
 * @CreateDate : 2015-05-07
 * @LastUpdateDate : 2015-05-18
 * @description : for customer order
 */
app.factory('$mpCustomerOrder',['$rootScope','$mpAjax','$q','$mpFactory','$log','$mpCustomer','$mpBaseConst','$mpMyTable',
function($rootScope,$mpAjax,$q,$mpFactory,$log,$mpCustomer,$mpBaseConst,$mpMyTable){
    //Ken 2015-05-07: try new idea (support create new instance)
    //Usage: $mpOrder.newInstance(); (create a new instance that has all functionality of $mpOrder)
    //Warning: We use prototype in BaseService, so deep clone can't help this
    var newInstance = function() {
        var _this = $mpFactory.newService();

        //$mpCustomer be inited by index_controller
        //so this service should be used under sub-controller of ng-view
        _this.loadOrders = function() {
            return _this.baseInit('/cust/'+$mpCustomer.getItem('customer_id')+'/order');
        };

        _this.findOne = function(orderId) {
            return _this.baseInit('/cust/'+$mpCustomer.getItem('customer_id')+'/order?orderId='+orderId);
        };

        _this.add = function(order) {
            return $mpAjax.post('/cust/'+$mpCustomer.getItem('customer_id')+'/order',order);
        };

        _this.updateStatus = function(orderId,status) {
            return $mpAjax.put('/cust/'+$mpCustomer.getItem('customer_id')+'/order/'+orderId+'/status/'+status,{});
        };

        _this.active = function(orderId,bizId) {
            var orderId = $mpMyTable.getData().orderInfo.id;
            var bizId = $mpMyTable.getData().bizId;
            return $mpAjax.put('/cust/'+$mpCustomer.getItem('customer_id')+'/order/'+orderId+'/active', {orderId:orderId,bizId:bizId});
        };

        _this.cancel = function(orderId) {
            return _this.updateStatus(orderId,$mpBaseConst.ORDER_STATUS.CANCELED);
        };

        _this.newInstance = newInstance;
        return _this;
    };
    return newInstance();
}]);


/**
 * @Author : Ken
 * @CreateDate : 2015-05-08
 * @LastUpdateDate : 2015-05-08
 * @description : for customer order detail
 */
app.factory('$mpCustomerOrderItems',['$rootScope','$mpAjax','$q','$mpFactory','$log','$mpCustomer','$mpBaseConst',
function($rootScope,$mpAjax,$q,$mpFactory,$log,$mpCustomer,$mpBaseConst){
    var newInstance = function() {
        var _this = $mpFactory.newService();

        _this.init = function(orderId) {
            return _this.baseInit('/cust/'+$mpCustomer.getItem('customer_id')+'/order/'+orderId);
        };

        _this.newInstance = newInstance;
        return _this;
    };
    return newInstance();
}]);
//
//if(gBrowser.sys_config.unit_test) {
//    app.run(['$mpCustomerOrder','$mpCustomer',function($mpCustomerOrder,$mpCustomer){
//        console.log('======== unit test on =========');
//        $mpCustomer.onBaseDataLoaded(function(){
//            $mpCustomerOrder.loadOrders(26).then(function(data){
//                console.log('UNIT_TEST customer orders',data);
//            });
//        });
//    }]);
//}

