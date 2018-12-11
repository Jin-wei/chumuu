/**
 * Created by md on 14-11-4.
 */


/**
 * @Author : Ken
 * @CreateOn : 2015-02-15
 * @LastUpdateDate : 2015-04-17
 * @description :
 *  1. this is a wrapper service of HTML5 localStorage
 *  2. support expire on some day, expire after some hours if no action
 *  3. if update this service and dosen't support old data structure, please upgrade version code (this.ver)
 *     old data on customer's browser will be cleared
 */
app.factory('$mpLocalStorage',['$rootScope','$mpAjax','$q','$mpFactory','$log',function($rootScope,$mpAjax,$q,$mpFactory,$log) {
    var _this = {};
    _this.ver = 1; //version of this service. if 'customer browser version' < 'this version', clear customer's localStorage
    _this.prefixOfId = 'mpBizwise_';

    /**
     * Data Structure:
     * {
     *    _createOn: timestamp,
     *    _updateOn: timestamp,
     *    _expiredOn: timestamp,  //this item will be expired on that date, default: new Date('3000-1-1').getTime()
     *    _noActionLife: timestamp, //'noActionLife:30*1000' means if no update over 30s, this item will be expired. default: 3600*24*30*12*100 (100 years)
     *    _value: value
     * }
     *
     * */

    // getter
    _this.getOriginItem = function(id) {
        id = _this.prefixOfId+id;
        return window.localStorage.getItem(id);
    };

    //return null if expired
    _this.get = function(id) {
        var item = angular.fromJson(_this.getOriginItem(id));
        if(!item)
            return null;
        var curTimestamp = new Date().getTime();
        //remove item if expired
        if (item._expiredOn!=null) {
            if (item._expiredOn <= curTimestamp || item._noActionLife < curTimestamp - item._updateOn) {
                _this.remove(id);
                return null;
            }
        }
        return item ? item._value : null;
    };

    _this.isExist = function(id) {
        return _this.getOriginItem(id) ? true : false;
    };

    _this.getAsString = _this.get;

    _this.getAsObject = function(id) {
        var value = _this.get(id);
        return value ? angular.fromJson(value) : null;
    };

    _this.getAsDate = function(id) {
        var value = _this.get(id);
        return value ? Date(value) : null;
    };

    _this.getAsInteger = function(id) {
        var value = _this.get(id);
        return value ? parseInt(value) : null;
    };

    // setter
    /**
     * @description: set private attributes automatically
     * see setting's instruction on top
     * setting {
     *   expiredOn: timestamp,
     *   noActionLife: timestamp,
     * }
     * */
    _this.set = function(id,value,setting) {
        setting = setting || {};
        //number, string, Date can be saved correctly, we just need to care about Object for now
        var tmpValue = _.isObject(value) ? angular.toJson(value) : value;
        //doesn't consider expired when setting
        var originItem = _this.isExist(id) ? angular.fromJson(_this.getOriginItem(id)) : null;
        if(originItem) {
            originItem._updateOn = new Date().getTime();
        }
        else {
            originItem = {};
            originItem._createOn = new Date().getTime();
            originItem._updateOn = originItem.createOn;
        }
        originItem._expiredOn = setting.expiredOn || new Date('3000-1-1').getTime();
        originItem._noActionLife = setting.noActionLife || 3600*24*30*12*100;
        originItem._value = tmpValue;

        //remove it first avoid issue on so many browsers
        _this.remove(id);
        return window.localStorage.setItem(_this.prefixOfId+id,JSON.stringify(originItem));
    };
    _this.remove = function(id) {
        id = _this.prefixOfId+id;
        window.localStorage.removeItem(id);
    };

    _this.clear = function() {
        //clear ours only
        for(var id in window.localStorage) {
            if(id && id.indexOf(_this.prefixOfId)==0)
                window.localStorage.removeItem(id);
        }
    };

    _this.length = function() {
        return window.localStorage.length;
    };

    //init
    {
        var ver = _this.getOriginItem('ver');
        if(ver != _this.ver) {
            _this.clear();
            window.localStorage.setItem(_this.prefixOfId + 'ver', _this.ver);
        }
    }

    return _this;
}]);

/**
 * @Author : Ken
 * @CreateDate : 2015-02-15
 * @LastUpdateDate : 2015-05-14
 * @description : mp service factory, as base class of extension.
 */
app.factory('$mpFactory',['$mpAjax','$q',function($mpAjax,$q){
    function BaseService() {
        this.LOAD_STATUS = {NOT_INIT:0,LOADING:1,LOADED:2,FAILED:3};
        //primary data ajax event
        //primary data ajax call would fire these two events
        //if you wanna catch related event, just do it
        this.EVENT_DATA_SUCCESS = '[#data success#]';
        this.EVENT_DATA_FAILURE = '[#data failure#]';
        this.loadStatus = this.LOAD_STATUS.NOT_INIT;
        this.isLoading = false;
        this.isLoaded = false;
        this._data = {};
        this.onEventCallbacks = {};
        //Ken 2015-05-08 !important
        //
        this.primaryDeferred = $q.defer();
        this.primaryPromise = this.primaryDeferred.promise;
    }

    BaseService.prototype.getData = function() {
        return this._data;
    };

    BaseService.prototype.setData = function(data) {
        this._data = data;
    };

    BaseService.prototype.getItem = function(key) {
        return this._data[key];
    };

    BaseService.prototype.setItem = function(key,value) {
        this._data[key] = value;
    };
    BaseService.prototype.get = function(key) {
        return this._data[key];
    };

    BaseService.prototype.set = function(key,value) {
        this._data[key] = value;
    };

    BaseService.prototype.sortBy = function(obj,asc) {
        if(_.isUndefined(asc)) {
            asc = 1;
        }
        else {
            asc = asc ? 1 : -1;
        }
        if(_.isArray(this._data)) {
            if(_.isString(obj)) {
                var _sort = function(a,b){
                    if(a[obj]==b[obj])
                        return 0;
                    else {
                        var ret = a[obj] < b[obj] ? -1 : 1;
                        ret *= asc;
                        return ret;
                    }
                };
                this._data.sort(_sort);
            }
            else if(_.isFunction(obj)) {
                this._data.sort(obj);
            }
            else {
                console.error('BaseService->sortBy, un-support params, ',obj);
            }
        }
        else
            console.error('BaseService->sortBy, data is not array');
    };

    BaseService.prototype.baseLoad = function(url,setting,startNum) {
        setting = setting || {};
        var deferred = $q.defer();
        this.primaryPromise = deferred.promise;
        this.loadStatus = this.LOAD_STATUS.LOADING;
        this.isLoading = true;
        this.isLoaded = false;
        this._data = {};
        var module = this;

        if(setting.pageNo>0 && setting.pageSize>0) {
            if(url.indexOf('?')==-1) {
                url += "?null=null";
            }
            url += '&start='+(setting.pageNo-1)*setting.pageSize;
            url += '&size='+(setting.pageSize+1);
        }

        if(startNum >= 0 && startNum != null){
            url+='?start='+startNum+'&size='+$rootScope.page_size;
        }
        $mpAjax.get(url).then(function(data){
            module._data = data;
            module.isLoading = false;
            module.isLoaded = true;
            module.loadStatus = module.LOAD_STATUS.LOADED;
            deferred.resolve(data);
            //alert(data.length);
            console.log('aaa',module._data);
            console.log('_data',this._data);
        }).catch(function(error){
            module.loadStatus = module.LOAD_STATUS.FAILED;
            deferred.reject(error);
        });
        return this.primaryPromise;
    };

    BaseService.prototype.broadcast = function(event_name) {
        _.forEach(this.onEventCallbacks[event_name],function(func){
            func.fn.apply(func.fn,func.args);
        });
    };

    BaseService.prototype.on = function(event_name,event) {
        this.onEventCallbacks[event_name] = this.onEventCallbacks[event_name] || [];
        this.onEventCallbacks[event_name].push(event);
    };

    BaseService.prototype.clearEventStack = function() {
        this.onEventCallbacks = {};
        //for(var key in this.onEventCallbacks) {
        //    this.onEventCallbacks[key] = [];
        //}
    };

    //just for load primary data, handle loading status and other event binding.
    BaseService.prototype.ajaxGetPrimaryData = function(url, _deferred,setting) {
        setting = setting || {isClearEventStack:true};
        var module = this;
        var deferred = $q.defer();
        if(setting.isClearEventStack)
            module.clearEventStack();
        module.loadStatus = this.LOAD_STATUS.LOADING;
        module.isLoading = true;
        module.isLoaded = false;
        module._data = {};
        $mpAjax.get(url).then(function(data){
            module._data = data;
            module.isLoading = false;
            module.isLoaded = true;
            module.loadStatus = module.LOAD_STATUS.LOADED;
            module.broadcast(module.EVENT_DATA_SUCCESS);
            deferred.resolve(data);
            //Ken 2015-05-11 : .then may do extra operations on data
            //_deferred.resolve(data);
        },function(error){
            module.loadStatus = module.LOAD_STATUS.FAILED;
            module.broadcast(module.EVENT_DATA_FAILURE);
            deferred.reject(error);
            _deferred.reject(error);
        });
        return deferred.promise;
    };

    BaseService.prototype.callAfterReady = function (params) {
        var deferred = params.deferred;
        var event = params.event;

        switch (this.loadStatus) {
            case this.LOAD_STATUS.NOT_INIT:
                deferred.reject('not init');
                break;
            case this.LOAD_STATUS.LOADING:
                this.on(params.eventKey,event);
                break;
            case this.LOAD_STATUS.LOADED:
                event.fn.apply(event.fn,event.args);
                break;
            case this.LOAD_STATUS.FAILED:
                deferred.reject('init failed');
                break;
            default:
                deferred.reject('no this loadStatus');
        }
    };

    BaseService.prototype.addDependency = function($service,callback,eventKey) {
        eventKey = eventKey || this.EVENT_DATA_SUCCESS;
        var deferred = $q.defer();
        $service.callAfterReady({
            deferred: deferred,
            eventKey: eventKey,
            event: {fn:callback,args:[deferred]}
        });
        return deferred.promise;
    };

    BaseService.prototype.baseInit = function(url, setting) {
        var deferred = this.primaryDeferred = $q.defer();
        this.primaryPromise = deferred.promise;
        this.ajaxGetPrimaryData(url, deferred, setting).then(function(data){
            deferred.resolve(data);
        });
        return this.primaryPromise;
    };

    BaseService.prototype.onBaseDataLoaded = function(callback) {
        if(_.isFunction(callback)) {
            this.primaryPromise.then(function(data){
                callback(data);
            });
        }
    };

    function SubService() {
        //extend attributes
        BaseService.call(this);
    }
    function FuncForExtend( ) { };
    FuncForExtend.prototype = BaseService.prototype;
    //extend functions
    SubService.prototype = new FuncForExtend();
    SubService.prototype.constructor = SubService;


    var _this = {};

    _this.newService = function() {
        return new SubService();
    };

    return _this;
}]);

/**
 * @Author : Ken
 * @CreateDate : 2015-02-15
 * @LastUpdateDate : 2015-04-22
 * @description : get biz information by bizKey(unique name | bizId), and provides getting extra biz information functions.
 */
app.factory('$mpBizInfo',['$rootScope','$mpAjax','$q','$mpFactory','$log',function($rootScope,$mpAjax,$q,$mpFactory,$log) {

    var newInstance = function() {
        var _this = $mpFactory.newService();

        _this.getRealBizId = function(bizKey) {
            var deferred = $q.defer();
            var reg = /^\d+$/;
            if(reg.test(bizKey)) {
                deferred.resolve(bizKey);
            }
            else if(bizKey && bizKey.length>0) {
                $mpAjax.get('/biz/'+bizKey+'/uniqueName').then(function(data){
                    if(reg.test(data))
                        deferred.resolve(data);
                    else
                        deferred.reject('$mpBizInfo -> getRealBizId -> wrong bizKey');
                });
            }
            else {
                $log.error('$mpBizInfo -> getRealBizId -> wrong bizKey');
                deferred.reject('$mpBizInfo -> getRealBizId -> wrong bizKey');
            }
            return deferred.promise;
        };

        /**
         * @parameter:
         * setting: {
         *  forceReload: true | false, false: means return cache if exists, default value: true
         * }
         * */
        _this.init = function(bizKey,setting) {
            setting = setting || {forceReload:true};
            var deferred = $q.defer();
            //Ken 2015-07-16 : support onBaseDataLoaded
            _this.primaryDeferred = deferred;
            _this.primaryPromise = deferred.promise;
            if(!setting.forceReload && _this.getItem('bizKey')===bizKey) {
                $log.debug('use cache for bizInfo');
                deferred.resolve(_this.getData());
                return deferred.promise;
            }
            //promise isLoading=true when oad read biz id
            _this.loadStatus = this.LOAD_STATUS.LOADING;
            _this.isLoading = true;
            _this.isLoaded = false;
            _this.getRealBizId(bizKey).then(function(bizId){
                _this.ajaxGetPrimaryData('biz/'+bizId, deferred,{isClearEventStack:false}).then(function(data){
                    TranslateBizImageUrl(data);
                    _this.hours = _this._data.hours ? angular.fromJson(_this._data.hours) : {};
                    _this.broadcast('hours_ready');
                    _this.setItem('meShareVideo', false);
                    _this.setItem('fullName', _.isEmpty(_this.getItem('name_lang')) ? _this.getItem('name') : _this.getItem('name')+' ('+_this.getItem('name_lang')+')');
                    _this.setItem('phoneArr', _this.getItem('phone_no') ? _this.getItem('phone_no').split(/[,;]/) : []);
                    _this.setItem('hoursDisplay', _this.getItem('hours') ? _ConvertHoursToDisplay(_this.getItem('hours')).split(';') : []);
                    _this.setItem('bizKey',_this.getItem('biz_id'));
                    var staticMapUrl = '';
                    if(!_.isEmpty(_this.getItem('website')) && _this.getItem('website').slice(13,20) == 'meshare') {
                        _this.setItem('meShareVideo', true);
                    }
                    if(gBrowser.map.gaode) {
                        staticMapUrl = 'http://restapi.amap.com/v3/staticmap?location='+_this.getItem('longitude')+','+_this.getItem('latitude')+'&zoom=16&size=450*200&markers=mid,,A:'+_this.getItem('longitude')+','+_this.getItem('latitude')+'&key=58c19c77dbbc919ab1455f4fac9a058a';
                    }
                    else {
                        staticMapUrl = 'http://maps.google.com/maps/api/staticmap?center='+_this.getItem('latitude')+','+_this.getItem('longitude')+'&zoom=12&size=450x200&maptype=roadmap&markers='+_this.getItem('latitude')+','+_this.getItem('longitude');
                    }
                    _this.setItem('staticMapUrl',staticMapUrl);
                    if($rootScope.coords && $rootScope.coords.latitude) {
                        var distance = GetDistance($rootScope.coords.latitude,$rootScope.coords.longitude,_this.getItem('latitude'),_this.getItem('longitude'));
                        if(!_.isNaN(distance))
                           _this.setItem('distance',distance);
                    }
                    deferred.resolve(data);
                });
            }).catch(function(error){
                deferred.reject(404);
            });
            return deferred.promise;
        };

        _this.getId = function() {
            return _this.getData().biz_id;
        };

        _this.getValidDayOfWeek = function () {
            var deferred = $q.defer();

            var _callback = function(deferred) {
                //operate days of a week, example: [1,2] = tuesday,wednesday
                _this.openDaysOfWeek = [];
                var daysOfWeek = DateUtil.daysOfWeek;
                for (var i = 0; i < 7; i++) {
                    if (_this.hours[daysOfWeek[i]]) {
                        _this.openDaysOfWeek.push(i);
                    }
                }
                deferred.resolve(_this.openDaysOfWeek);
            };

            if(_this.loadStatus == _this.LOAD_STATUS.LOADED && _this.openDaysOfWeek) {
                deferred.resolve(_this.openDaysOfWeek);
            }
            else {
                _this.callAfterReady({
                    deferred: deferred,
                    eventKey: 'hours_ready',
                    event: {fn:_callback,args:[deferred]}
                });
            }

            return deferred.promise;
        };

        _this.getValidHours = function(date) {
            var deferred = $q.defer();

            var _callback = function(deferred,date){
                var validHoursOfChosenDay = [];
                date = DateUtil.new(date);
                date.setSeconds(0);
                date.setMilliseconds(0);

                var hoursArray = _this.hours[DateUtil.daysOfWeek[date.getDay()]];

                _.forEach(hoursArray,function(hours){
                    var timeRange = hours.toString().match(/\d{2}/g); //like: ["06", "00", "16", "30"]

                    if(timeRange.length!=4)
                        deferred.reject('wrong hours format');

                    var dateStart = _.cloneDeep(date);
                    dateStart.setHours(timeRange[0]);
                    dateStart.setMinutes(timeRange[1]);

                    var dateEnd = _.cloneDeep(date);
                    dateEnd.setHours(timeRange[2]);
                    dateEnd.setMinutes(timeRange[3]);

                    if (dateStart > dateEnd) {
                        dateEnd.setDate(dateEnd.getDate() + 1);
                        for (var i = 0; i < 100; ++i) {
                            if (dateStart.getDate() < dateEnd.getDate() && date <= dateStart) {
                                validHoursOfChosenDay.push({
                                    value: dateStart.getTime(),
                                    exp: DateUtil.format(dateStart, 'hh:mm tt')
                                });
                            }
                            else if (dateStart <= dateEnd && dateStart.getDate() == dateEnd.getDate() && date <= dateStart) {
                                validHoursOfChosenDay.push({
                                    value: dateStart.getTime(),
                                    exp: DateUtil.format(dateStart, 'hh:mm tt') + ' (next day)'
                                });
                            }
                            else if (dateStart > dateEnd) {
                                break;
                            }
                            dateStart.setMinutes(dateStart.getMinutes() + 15);
                        }
                    }
                    else {
                        for (var i = 0; i < 100; ++i) {
                            if (dateStart <= dateEnd && date <= dateStart) {
                                validHoursOfChosenDay.push({
                                    value: dateStart.getTime(),
                                    exp: DateUtil.format(dateStart, 'hh:mm tt')
                                });
                            }
                            else if (dateStart > dateEnd) {
                                break;
                            }
                            dateStart.setMinutes(dateStart.getMinutes() + 15);
                        }
                    }
                });
                deferred.resolve(validHoursOfChosenDay);
            };

            _this.callAfterReady({
                deferred: deferred,
                eventKey: 'hours_ready',
                event: {fn:_callback,args:[deferred,date]}
            });

            return deferred.promise;
        };

        _this.getFavoriteCount = function() {
            var deferred = $q.defer();

            var _callback = function(deferred) {
                $mpAjax.get('/biz/'+_this.getData().biz_id+'/favoriteCount').then(function(data){
                    _this.getData().extraFavoriteCount = data.favorite_count;
                    deferred.resolve(data);
                }).catch(function(error){
                    deferred.reject(error);
                });
            };

            _this.callAfterReady({
                deferred: deferred,
                eventKey: _this.EVENT_DATA_SUCCESS,
                event: {fn:_callback,args:[deferred]}
            });
            return deferred.promise;
        };

        _this.getRating = function() {
            var deferred = $q.defer();

            var _callback = function(deferred) {
                $mpAjax.get('/biz/'+_this.getData().biz_id+'/ratBizComment').then(function(data){
                    data.avgRatingForStar = data.avg_rating/100*5;
                    _this.getData().extraRating = data;
                    deferred.resolve();
                }).catch(function(error){
                    deferred.reject(error);
                });
            };

            _this.callAfterReady({
                deferred: deferred,
                eventKey: _this.EVENT_DATA_SUCCESS,
                event: {fn:_callback,args:[deferred]}
            });
            return deferred.promise;
        };

        _this.getPicWall = function() {
            var deferred = $q.defer();

            var _callback = function(deferred) {
                $mpAjax.get('/biz/'+_this.getData().biz_id+'/bizImg').then(function(data){
                    TranslateBizImageUrl(data);
                    _this.getData().extraPicWall = data;
                    deferred.resolve(data);
                }).catch(function(error){
                    deferred.reject(error);
                });
            };

            _this.callAfterReady({
                deferred: deferred,
                eventKey: _this.EVENT_DATA_SUCCESS,
                event: {fn:_callback,args:[deferred]}
            });
            return deferred.promise;
        };

        _this.getYelpInfo = function() {
            var deferred = $q.defer();

            var _callback = function(deferred) {
                $mpAjax.get('/biz/'+_this.getData().yelp_id+'/yelpInfo').then(function(data){
                    _this.getData().extraYelpInfo = data;
                    deferred.resolve(data);
                }).catch(function(error){
                    deferred.reject(error);
                });
            };

            _this.callAfterReady({
                deferred: deferred,
                eventKey: _this.EVENT_DATA_SUCCESS,
                event: {fn:_callback,args:[deferred]}
            });
            return deferred.promise;
        };

        _this.getTax = function() {
            var deferred = $q.defer();

            var _callback = function(deferred) {
                $mpAjax.get('/biz/'+_this.getData().biz_id+'/taxRate').then(function(data){
                    _this.getData().extraTaxRate = data.tax_rate;
                    deferred.resolve(data);
                }).catch(function(error){
                    deferred.reject(error);
                });
            };

            _this.callAfterReady({
                deferred: deferred,
                eventKey: _this.EVENT_DATA_SUCCESS,
                event: {fn:_callback,args:[deferred]}
            });
            return deferred.promise;
        };

        function _ConvertHoursToDisplay( hoursJsonStr){
            if ($rootScope.isCN === true) {
                var weekDayArray = [ '星期一','星期二','星期三','星期四','星期五','星期六','星期天'];
            }
            else {
                weekDayArray = [ 'Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
            }

            var fullWeekDayArray = [ 'monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

            if(hoursJsonStr == null || hoursJsonStr.trim() == "" || hoursJsonStr.trim() == "{}"){
                return $rootScope.isCN ? "无法获取营业时间" : "Without the correct time";
            }
            try{
                var hoursJson =  eval("(" + hoursJsonStr + ")");
                var hoursObjArray = [];

                for(var i =0 , j=fullWeekDayArray.length; i<j ; i++){

                    var dayHours = hoursJson[fullWeekDayArray[i]];
                    if(dayHours != null && dayHours.length>0 && dayHours[0].length>0){
                        var hoursObj = {};
                        hoursObj.day = weekDayArray[i];
                        for(var m= 0,n=dayHours.length ; m<n; m++){
                            var startArray = dayHours[m][0].split(":");
                            var endArray = dayHours[m][1].split(":");
                            var segStartHour = Number(startArray[0]);
                            var segStartFlag = "am";
                            var segEndFlag = "am";
                            var segEndHour = Number(endArray[0]);
                            if(segStartHour==0){
                                segStartHour = 12;
                                segStartFlag = "am"
                            }else if(segStartHour >12){
                                segStartHour = segStartHour -12;
                                segStartFlag = "pm";
                            }
                            if(segEndHour==0){
                                segEndHour = 12;
                                segEndFlag = "am"
                            }else if(segEndHour >12){
                                segEndHour = segEndHour -12;
                                segEndFlag = "pm";
                            }
                            dayHours[m] = segStartHour+":"+startArray[1]+segStartFlag + "-" + segEndHour+":"+endArray[1]+segEndFlag;
                            //dayHours[m] = dayHours[m].join('-');
                        }
                        hoursObj.hours = dayHours.join(', ');
                        var hoursObjArrLen = hoursObjArray.length;
                        if(hoursObjArrLen>0 && hoursObjArray[hoursObjArrLen -1].hours == hoursObj.hours){
                            var dayName = hoursObjArray[hoursObjArrLen -1].day;
                            hoursObjArray[hoursObjArrLen -1].day = dayName.split('-')[0]+"-" +weekDayArray[i];
                        }else{
                            hoursObjArray.push(hoursObj);
                        }

                    }


                }
                if(hoursObjArray == null || hoursObjArray.length ==0){
                    return $rootScope.isCN ? "无法获取营业时间" : "Without the correct time";
                }
                if(hoursObjArray.length==1 && hoursObjArray[0].day=="Mon-Sun"){
                    hoursObjArray[0].day= $rootScope.isCN ? "每天营业" : "Open Daily";
                }

                //console.log("\n\n\n");
                //console.log(hoursObjArray);
                for(var x= 0, y=hoursObjArray.length ; x<y ;x++){
                    hoursObjArray[x] =  hoursObjArray[x].day +" " + hoursObjArray[x].hours;
                }
                return hoursObjArray.join(";");
            }catch(error){
                logger.warn(' convert hours ' + 'false');
                return "Without the correct time";
            }

        }

        _this.newInstance = newInstance;
        return _this;
    };
    return newInstance();
}]);

/**
 * @Author : Ken
 * @LastUpdateDate : 2015-02-15
 * @LastUpdateDate : 2015-07-14
 * @description : for biz list.
 */
app.factory('$mpBizList',['$mpAjax','$q','$mpFactory',function($mpAjax,$q,$mpFactory){
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

/**
 * @Author : Ken
 * @CreateDate : 2015-07-28
 * @LastUpdateDate : 2015-07-29
 * @description : coffee biz user service
 */
//For ajax call
app.factory('$mpBizUser',['$rootScope','$http','$location','$q','$mpAjax','$mpFactory','$mpBizInfo','$mpBaseConst',function($rootScope,$http,$location,$q,$mpAjax,$mpFactory,$mpBizInfo,$mpBaseConst) {
    var newInstance = function() {
        var _this = $mpFactory.newService();

        _this.init = function(bizId) {
            var deferred = $q.defer();
            if(!bizId) {
                var msg = '$mpBizUser init got wrong params,biz='+biz+',bizId='+bizId;
                deferred.reject(msg);
                throw new Error(msg);
            }
            else {
                _this.baseInit('/admin/'+ $rootScope.adminId +'/bizUserRel?bizId='+bizId).then(function(data){
                    deferred.resolve(data);
                }).catch(function(error){
                    deferred.reject(error);
                });
            }
            return deferred.promise;
        };

        _this.add = function(user) {
            var deferred = $q.defer();
            var userUrl = '/admin/'+$rootScope.adminId+'/biz/'+ user.biz_id +'/bizUser';
            var userRelUrl = '/admin/'+$rootScope.adminId+'/biz/'+ user.biz_id +'/bizUserRel';
            $mpAjax.post(userUrl,user).then(function(data){
                user.user_id = data.bizUserId;
                   console.log(data);
                var userRel = {
                    bizId: user.biz_id,
                    userId: data.userId,
                    roleType: $mpBaseConst.ROLE_TYPE.OWNER,
                    remark: ''
                };
                $mpAjax.post(userRelUrl,userRel).then(function(data){
                    _this.getData().push(user);
                    deferred.resolve(data);
                }).catch(function(error){
                    deferred.reject(error);
                });
            }).catch(function(error){
                if(error) {
                    if(error.message.indexOf('ER_DUP_ENTRY')>-1 && error.message.indexOf('username')>-1) {
                        ErrorBox('该用户名已重复');
                    }
                    else if(error.outMsg.indexOf('an user with the same email address already exists')>-1) {
                        ErrorBox('该邮箱已存在');
                    }
                    else if(error.outMsg.indexOf('This email is not registered with Chumuu')>-1) {
                        ErrorBox('请输入正确的邮箱');
                    }
                }
                deferred.reject(error);
            });
            return deferred.promise;
        };

        _this.delete = function(bizId,userId) {
            var deferred = $q.defer();
            var url = '/admin/'+$rootScope.adminId+'/biz/'+bizId+'/bizUser/'+userId+'/bizUserRel';
            $mpAjax.delete(url).then(function(data){
                _.remove(_this.getData(),{user_id:userId});
                deferred.resolve(data);
            }).catch(function(error){
                ErrorBox(error.message);
                deferred.reject(error);
            });
            return deferred.promise;
        };

        _this.update = function(newObj) {
            var deferred = $q.defer();
            var userUrl = '/admin/'+$rootScope.adminId+'/biz/'+ newObj.biz_id +'/bizUser/' + newObj.user_id + '/bizUser';

            $mpAjax.put(userUrl,newObj).then(function(data){
                deferred.resolve(data);
            }).catch(function(error){
                if(error && error.message) {
                    if(error.message.indexOf('ER_DUP_ENTRY')>-1 && error.message.indexOf('username')>-1) {
                        ErrorBox('该用户名已重复');
                    }
                }
                deferred.reject(error);
            });
            return deferred.promise;
        };

        _this.findUserById= function(id){
            return _.find(_this.getData(), {user_id: id});
        }

        _this.resetPassword = function(email,bizId) {
            var deferred = $q.defer();
            var url = '/admin/'+$rootScope.adminId+'/biz/'+bizId+'/sendBizUserResetPasswordMail';
            $mpAjax.post(url,{email:email}).then(function(data){
                SuccessBox("邮件已发送。");
                deferred.resolve(data);
            }).catch(function(error){
                ErrorBox(error.message);
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
 * @LastUpdateDate : 2015-02-15
 * @description : get menu types of business
 */
app.factory('$mpMenuTypes',['$rootScope','$mpAjax','$q','$mpFactory','$log',function($rootScope,$mpAjax,$q,$mpFactory,$log) {
    var _this = $mpFactory.newService();

    _this.init = function(bizId) {
        var deferred = $q.defer();
        _this.ajaxGetPrimaryData('/biz/'+bizId+'/prodType',deferred).then(function(data){
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
 * @LastUpdateDate : 2015-02-15
 * @description : get menu items of business
 */
app.factory('$mpMenuItem',['$rootScope','$mpAjax','$q','$mpFactory','$log',function($rootScope,$mpAjax,$q,$mpFactory,$log) {
    var _this = $mpFactory.newService();

    //Ken 2015-02-15 : For 'products', there are many APIs, so design as depending on params
    _this.init = function(url) {
        var deferred = $q.defer();
        _this.ajaxGetPrimaryData(url,deferred).then(function(data){
            TranslateMenuItemImageUrl(data);
            deferred.resolve(data);
        }).catch(function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    };
    _this.loadById = function(bizId,prodId) {
        return _this.init('/biz/'+bizId+'/prod/'+prodId);
    };

    return _this;
}]);

/**
 * @Author : Ken
 * @LastUpdateDate : 2015-04-27
 * @description : get promotions of business
 */
app.factory('$mpPromotion',['$rootScope','$mpAjax','$q','$mpFactory','$log',function($rootScope,$mpAjax,$q,$mpFactory,$log) {
    var _this = $mpFactory.newService();

    //Ken 2015-02-15 : For 'promotions', there are many APIs, so design as depending on params
    _this.init = function(url) {
        var deferred = $q.defer();
        _this.ajaxGetPrimaryData(url,deferred).then(function(data){
            deferred.resolve(data);
        }).catch(function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    };

    _this.loadByBizOfToday = function(bizId) {
        return _this.init('/biz/'+bizId+'/promoNow');
    };

    _this.loadByProd = function(bizId,prodId) {
        return _this.init('/biz/'+bizId+'/prod/'+prodId+'/promo');
    };

    _this.GetDiscount = function(menuItem_obj, depth_of_obj) {

        if (!depth_of_obj) {
            $log.error('Please assign a value to depth_of_obj');
        }
        if (depth_of_obj == 0) {
            $log.error('value of depth_of_obj starts from 1');
        }
        if (depth_of_obj == 1) {
            generatePromotion(menuItem_obj);
        }
        if (depth_of_obj == 2) {
            _.forEach(menuItem_obj, function(item){
                generatePromotion(item);
            });
        }
    };

    function generatePromotion(item) {
        _.forEach(_this.getData(), function(promo){
            if(promo.prod_id==item.prod_id) {
                item.promoClass = 'menu-promotion-add-btn';
                item.promoHref = '#/promotion_add/'+item.prod_id;
                item.promoIcon = 'icon-arrow-right';

                //calculate price with discount
                if(angular.isUndefined(item.promotions)) {
                    item.promotions = [];
                    item.priceAfterDiscount = calcPriceAfterDiscount(item,promo);
                }
                else {
                    item.priceAfterDiscount = MathUtil.min(
                        calcPriceAfterDiscount(item,promo),
                        item.priceAfterDiscount
                    );
                }
                item.promotions.push(promo);
            }
        });
    }

    function calcPriceAfterDiscount(item,promo) {
        var retVal = 0;
        if(promo.discount_pct>0) {
            retVal = MathUtil.max(item.price*(1-promo.discount_pct*0.01),0);
        }
        else if(promo.discount_amount>0) {
            retVal = MathUtil.max(item.price - promo.discount_amount,0);
        }
        else
            retVal = item.price;
        return retVal;
    }

    return _this;
}]);

/**
 * @Author : Ken
 * @LastUpdateDate : 2015-04-23
 * @description : for i18n
 *  Please inject it for directive/service where you need, not for controller
 */
app.factory('$mpLanguage',['$rootScope','$log',function($rootScope,$log) {
    var _this = {
        L:null,
        i18n:{
            'en-us':en_us,
            //'zh-tw':zh_tw,
            'zh-cn':zh_cn
        }
    };

    _this.LoadLanguage = function(key) {
        if(key && key != _this.curLang) {
            _this.curLang = key;
            _this.L = _this.i18n[key];
            //#188
            if(!_this.L)
                _this.L = gBrowser.sys_config.isCN ? _this.i18n['zh-cn'] : _this.i18n['en-us'];
            $rootScope.L = _this.L;
            $.cookie('lang',key);
        }
    };

    var lang = $.cookie('lang') || (gBrowser.sys_config.isCN ? 'zh-cn' : 'en-us');
    _this.displayChangeLanguage = true;
    if(gBrowser.sys_config.language) {
        lang = gBrowser.sys_config.language;
        //disable language changing, if we have system config
        _this.displayChangeLanguage = false;
    }
    $log.debug('load language');

    _this.LoadLanguage(lang);
    $rootScope.displayChangeLanguage = _this.displayChangeLanguage;

    //Ken 2015-04-23
    //normally, we should inject this service where we need, but it's too complicated.
    //inject into $rootScope is OK, index_controller will dependent this service, so this service will be initial at that time.
    //Warning: this is for controller only, if we need to use this service in directive or service, we should inject it surely.

    return _this;
}]);

/**
 * @Author : Ken
 * @CreateDate : 2015-02-27
 * @LastUpdateDate : 2015-02-27
 * @description : base constant service
 */
app.factory('$mpBaseConst',['$rootScope','$mpLanguage',function($rootScope,$mpLanguage) {
    var L = $mpLanguage.L;
    var _this = {};
    _this.TABLE_STATUS = {
        //...
    };
    _this.ORDER_STATUS = {
        PENDING:100,
        CANCELED:101,
        CONFIRMED:102,
        PROGRESS:103,
        COMPLETED:104,
        EXPIRED:109,
        DINING:110,
        PADY:111,
        DESC : {
            100:L.order_status_100,
            101:L.order_status_101,
            102:L.order_status_102,
            103:L.order_status_103,
            104:L.order_status_104,
            109:L.order_status_109,
            110:L.order_status_110,
            111:L.order_status_111,
        }
    };
    _this.ORDER_TYPE = {
        DINE_IN:1,
        TOGO:2,
        DESC : {
            1: L.dine_in,
            2: L.to_go
        }
    };

    _this.PAYMENT_TYPE = {
        PERSON:2,
        CREDIT_CARD:1,
        PAYPAL : 0,
        DESC : {
            0: L.paypal,
            1: L.credit_card,
            2: L.pay_in_person,
            3: L.pay_in_alipay
        }
    };

    _this.ROLE_TYPE = {
        WAITER:  1,
        MANAGER: 8,
        OWNER:   9,
        DESC : {
            0: '服务员',
            1: '经理',
            2: '店主'
        }
    };

    //{ name: "北京", cities: ["西城", "东城", "崇文", "宣武", "朝阳", "海淀", "丰台", "石景山", "门头沟", "房山", "通州", "顺义", "大兴", "昌平", "平谷", "怀柔", "密云", "延庆"] },
    //{ name: "上海", cities: ["浦东", "杨浦", "徐汇", "静安", "卢湾", "黄浦", "普陀", "闸北", "虹口", "长宁", "宝山", "闵行", "嘉定", "金山", "松江", "青浦", "崇明", "奉贤", "南汇"] },
    //{ name: "天津", cities: ["青羊", "河东", "河西", "南开", "河北", "红桥", "塘沽", "汉沽", "大港", "东丽", "西青", "北辰", "津南", "武清", "宝坻", "静海", "宁河", "蓟县", "开发区"] },
    //{ name: "重庆", cities: ["渝中", "大渡口", "江北", "沙坪坝", "九龙坡", "南岸", "北碚", "万盛", "双桥", "渝北", "巴南", "万州", "涪陵", "黔江", "长寿"] },
    //{ name: "香港", cities: ["中西区", "湾仔区", "东区", "南区", "九龙-油尖旺区", "九龙-深水埗区", "九龙-九龙城区", "九龙-黄大仙区", "九龙-观塘区", "新界-北区", "新界-大埔区", "新界-沙田区", "新界-西贡区", "新界-荃湾区", "新界-屯门区", "新界-元朗区", "新界-葵青区", "新界-离岛区"] },
    //{ name: "澳门", cities: ["花地玛堂区", "圣安多尼堂区", "大堂区", "望德堂区", "风顺堂区", "嘉模堂区", "圣方济各堂区", "路氹城"]}
    _this.CITY = [
        { name: "北京", cities: ["北京"] },
        { name: "天津", cities: ["天津"] },
        { name: "河北", cities: ["石家庄", "秦皇岛", "廊坊", "保定", "邯郸", "唐山", "邢台", "衡水", "张家口", "承德", "沧州", "衡水"] },
        { name: "山西", cities: ["太原", "大同", "长治", "晋中", "阳泉", "朔州", "运城", "临汾"] },
        { name: "内蒙古", cities: ["呼和浩特", "赤峰", "通辽", "锡林郭勒", "兴安"] },
        { name: "辽宁", cities: ["大连", "沈阳", "鞍山", "抚顺", "营口", "锦州", "丹东", "朝阳", "辽阳", "阜新", "铁岭", "盘锦", "本溪", "葫芦岛"] },
        { name: "吉林", cities: ["长春", "吉林", "四平", "辽源", "通化", "延吉", "白城", "辽源", "松原", "临江", "珲春"] },
        { name: "黑龙江", cities: ["哈尔滨", "齐齐哈尔", "大庆", "牡丹江", "鹤岗", "佳木斯", "绥化"] },
        { name: "上海", cities: ["上海"] },
        { name: "江苏", cities: ["南京", "苏州", "无锡", "常州", "扬州", "徐州", "南通", "镇江", "泰州", "淮安", "连云港", "宿迁", "盐城", "淮阴", "沐阳", "张家港"] },
        { name: "浙江", cities: ["杭州", "金华", "宁波", "温州", "嘉兴", "绍兴", "丽水", "湖州", "台州", "舟山", "衢州"] },
        { name: "安徽", cities: ["合肥", "马鞍山", "蚌埠", "黄山", "芜湖", "淮南", "铜陵", "阜阳", "宣城", "安庆"] },
        { name: "福建", cities: ["福州", "厦门", "泉州", "漳州", "南平", "龙岩", "莆田", "三明", "宁德"] },
        { name: "江西", cities: ["南昌", "景德镇", "上饶", "萍乡", "九江", "吉安", "宜春", "鹰潭", "新余", "赣州"] },
        { name: "山东", cities: ["青岛", "济南", "淄博", "烟台", "泰安", "临沂", "日照", "德州", "威海", "东营", "荷泽", "济宁", "潍坊", "枣庄", "聊城"] },
        { name: "河南", cities: ["郑州", "洛阳", "开封", "平顶山", "濮阳", "安阳", "许昌", "南阳", "信阳", "周口", "新乡", "焦作", "三门峡", "商丘"] },
        { name: "湖北", cities: ["武汉", "襄樊", "孝感", "十堰", "荆州", "黄石", "宜昌", "黄冈", "恩施", "鄂州", "江汉", "随枣", "荆沙", "咸宁"] },
        { name: "湖南", cities: ["长沙", "湘潭", "岳阳", "株洲", "怀化", "永州", "益阳", "张家界", "常德", "衡阳", "湘西", "邵阳", "娄底", "郴州"] },
        { name: "广东", cities: ["广州", "深圳", "东莞", "佛山", "珠海", "汕头", "韶关", "江门", "梅州", "揭阳", "中山", "河源", "惠州", "茂名", "湛江", "阳江", "潮州", "云浮", "汕尾", "潮阳", "肇庆", "顺德", "清远"] },
        { name: "广西", cities: ["南宁", "桂林", "柳州", "梧州", "来宾", "贵港", "玉林", "贺州"] },
        { name: "海南", cities: ["海口", "三亚"] },
        { name: "重庆", cities: ["重庆"] },
        { name: "四川", cities: ["成都", "达州", "南充", "乐山", "绵阳", "德阳", "内江", "遂宁", "宜宾", "巴中", "自贡", "康定", "攀枝花"] },
        { name: "贵州", cities: ["贵阳", "遵义", "安顺", "黔西南", "都匀"] },
        { name: "云南", cities: ["昆明", "丽江", "昭通", "玉溪", "临沧", "文山", "红河", "楚雄", "大理"] },
        { name: "西藏", cities: ["拉萨", "林芝", "日喀则", "昌都"] },
        { name: "陕西", cities: ["西安", "咸阳", "延安", "汉中", "榆林", "商南", "略阳", "宜君", "麟游", "白河"] },
        { name: "甘肃", cities: ["兰州", "金昌", "天水", "武威", "张掖", "平凉", "酒泉"] },
        { name: "青海", cities: ["黄南", "海南", "西宁", "海东", "海西", "海北", "果洛", "玉树"] },
        { name: "宁夏", cities: ["银川", "吴忠"] },
        { name: "新疆", cities: ["乌鲁木齐", "哈密", "喀什", "巴音郭楞", "昌吉", "伊犁", "阿勒泰", "克拉玛依", "博尔塔拉"] },
        { name: "香港", cities: ["香港"] },
        { name: "澳门", cities: ["澳门"]}
    ];

    return _this;
}]);



