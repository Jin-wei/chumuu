/**
 * Created by Ken on 2014-5-21.
 * @description
 *      this util.js will include all util class, like DateUtil, StringUtil, MathUtil
 */

DateUtil = {};
//StringUtil = {};
MathUtil = {};
ObjectUtil = {};
//
/**
 * @Author Ken
 * @description
 *      format date to string
 * @parameter
 *      param1 : date [could be string or date]
 *      param2 : mask
 * @return
 *      string of date
 * @example
 *      DateUtil.format(new Date('2013-01-02'),'MM/dd/yyyy') = '02/01/2013';
 *      DateUtil.format('2013-01-02','MM/dd/yyyy') = '02/01/2013';
 * */
DateUtil.format = function(date,mask) {
    var d = date;
    var type = Object.prototype.toString.call(d);
    if(type==="[object Date]") {
        ;
    } else if(type==="[object String]") {
        d = new Date(d);
    } else {
        throw new TypeError("Unsupported data type of parameter, param1's type="+type);
    }
    var zeroize = function (value, length) {
        if (!length) length = 2;
        value = String(value);
        for (var i = 0, zeros = ''; i < (length - value.length); i++) {
            zeros += '0';
        }
        return zeros + value;
    };
    return mask.replace(/(dddd|ddd|dd|d|MMMM|MMM|MM|M|yyyy|yy|hh|h|HH|H|mm|m|ss|s|l|L|tt|TT|Z|)/g, function($0) {
        switch($0) {
            case 'd':   	return d.getDate();
            case 'dd':  	return zeroize(d.getDate());
            case 'ddd': 	return ['Sun','Mon','Tue','Wed','Thr','Fri','Sat'][d.getDay()];
            case 'dddd':	return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()];
            case 'M':   	return d.getMonth() + 1;
            case 'MM':  	return zeroize(d.getMonth() + 1);
            case 'MMM': 	return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()];
            case 'MMMM':	return ['January','February','March','April','May','June','July','August','September','October','November','December'][d.getMonth()];
            case 'yy':	    return String(d.getFullYear()).substr(2);
            case 'yyyy':	return d.getFullYear();
            case 'h':	    return d.getHours() % 12 || 12;
            case 'hh':	    return zeroize(d.getHours() % 12 || 12);
            case 'H':   	return d.getHours();
            case 'HH':  	return zeroize(d.getHours());
            case 'm':   	return d.getMinutes();
            case 'mm':  	return zeroize(d.getMinutes());
            case 's':   	return d.getSeconds();
            case 'ss':  	return zeroize(d.getSeconds());
            case 'l':   	return zeroize(d.getMilliseconds(), 3);
            case 'L':   	var m = d.getMilliseconds(); if (m > 99) m = Math.round(m / 10); return zeroize(m);
            case 'tt':  	return d.getHours() < 12 ? 'am' : 'pm';
            case 'TT':  	return d.getHours() < 12 ? 'AM' : 'PM';
            case 'Z':   	return d.toUTCString().match(/[A-Z]+$/);
            // Return quoted strings with the surrounding quotes removed
            default:        return $0.substr(1, $0.length - 2);
        }
    });
};

/**
 * @Author Ken
 * @description
 *      parse string to date
 * @parameter
 *      param1 : string of date
 *      param2 : mask. [For now, param just accept yyyy,MM,dd]
 * @return
 *      Date
 * @example
 *      DateUtil.parseDate('24/03/2013','dd/MM/yyyy') = new Date('2013/03/24');
 * */
DateUtil.parseDate = function(strDate,mask) {
    switch(mask) {
        case 'yyyy-MM-dd':
        case 'MM/dd/yyyy':
        case 'yyyy/MM/dd':
            return new Date(strDate);
    }
    var dIndex = mask.indexof('dd');
    var MIndex = mask.indexof('MM');
    var yIndex = mask.indexof('yyyy');
    if(dIndex==-1 || MIndex==-1 || yIndex==-1) {
        throw new Error('Unsupported mask, mask='+mask);
    }
    var day   = parseInt(strDate.substring(dIndex,2));
    var month = parseInt(strDate.substring(MIndex,2))-1;
    var year  = parseInt(strDate.substring(yIndex,4));
    return new Date(year,month,day);
};

DateUtil.timezoneoffset = new Date().getTimezoneOffset();

/**
 * @param date : [type: string | Date]
 * */
DateUtil.new = function(date) {
    var d = _.clone(date);
    var type = Object.prototype.toString.call(d);
    console.log("date type:"+type);

    if(type==="[object Date]") {
        ;
    } else if(type==="[object String]") {
        d = moment(d).toDate();;
    } else {
        throw new TypeError("Unsupported data type of parameter, param1's type="+type);
    }
    return d;
};

DateUtil.translateTimezone = function(date,offset) {
    var d = this.new(date);
    d.setMinutes(d.getMinutes()+offset);
    return d;
};

DateUtil.localDate2UTCDate = function(date) {
    //the 'this.new(date)' will translate UTC to local one time
    var count = typeof date==='string' ? 1 : 0;
    var d = this.new(date);
    if(this.timezoneoffset>0) {
        d.setDate(d.getDate()+1+count);
    }
    return d;
};

DateUtil.localDateTime2UTCDateTime = function(date) {
    return this.translateTimezone(date,this.timezoneoffset);
};
DateUtil.UTCDateTime2LocalDateTime = function(date) {
    return this.translateTimezone(date,-this.timezoneoffset);
};

DateUtil.trans12to24 = function (hour, pm_val) {
    if(typeof pm_val==='string')
        pm_val = parseInt(pm_val);
    return (hour==12 ? (pm_val ? 12 : 0) : (hour+pm_val));
};

DateUtil.trans24to12 = function (hour) {
    return {
        hour: hour>12 ? hour-12 : hour,
        hour_extend: hour>12 ? 12 : 0
    };
};

DateUtil.daysOfWeek = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];

/**
 * @Author Ken
 * @description
 *      return max value of parameters, support mutil-params
 * @parameter
 *      params : can be integer , float
 * @return
 *      max
 * @example
 *      MathUtil.max(24,8,23) = 24;
 * */
MathUtil.max = function(){
    var max = -99999999999999;
    for(var i in arguments){
        if(arguments[i]>max)
            max = arguments[i];
    }
    return max;
};
/**
 * @reference
 *      MathUtil.max
 * */
MathUtil.min = function(){
    var mix = 99999999999999;
    for(var i in arguments){
        if(arguments[i]<mix)
            mix = arguments[i];
    }
    return mix;
};

/**
 * @Author Ken
 * @date 2015-01-07
 * @description pad num with zero
 * @example:
 *  pad(123,5) = '00123'
 * */
MathUtil.pad = function(num, n) {
    var len = num.toString().length;
    while(len < n) {
        num = "0" + num;
        len++;
    }
    return num;
};

getUrlParam = function (name){
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null)
        return unescape(r[2]);
    return null;
};

/**
 *
 *  Base64 encode / decode
 */
function Base64() {

    // private property
    _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+=";

    // public method for encoding
    this.encode = function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        input = _utf8_encode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output +
                _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
                _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
        }
        return output;
    }

    // public method for decoding
    this.decode = function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length) {
            enc1 = _keyStr.indexOf(input.charAt(i++));
            enc2 = _keyStr.indexOf(input.charAt(i++));
            enc3 = _keyStr.indexOf(input.charAt(i++));
            enc4 = _keyStr.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output = output + String.fromCharCode(chr1);
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
        }
        output = _utf8_decode(output);
        return output;
    }

    // private method for UTF-8 encoding
    _utf8_encode = function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }
        return utftext;
    }

    // private method for UTF-8 decoding
    _utf8_decode = function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;
        while ( i < utftext.length ) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            } else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            } else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    }
}

/**
 * @Author Ken
 * @date 2015-01-07
 * @description
 * @parameter
 *      src, [object]
 *      desc,[object]
 *      attrs, array of attr name [string]
 * @example
 *      var src = {id:1,name:'Ken',age:28};
 *      var desc = {};
 *      ObjectUtil.cover(src,desc,['id','name']);
 *      //desc = {id:1,name:'Ken'};
 * */
ObjectUtil.cover = function(src,dest,attrs) {
    if(attrs && attrs.length>0) {
        for(var i in attrs) {
            var attr = attrs[i];
            dest[attr] = src[attr];
        }
    }
    else {
        for(var key in src) {
            dest[key] = src[key];
        }
    }
};
