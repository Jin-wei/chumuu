/**
 * Created by Ling Xue on 14-3-23.
 */



/**
 * Generate a customer info for open
 * Without password , customerId
 * @param customer
 * @returns {{}}
 */

//推送
const JPush = require("jpush-sdk")
const client = JPush.buildClient('fce136e0cfe73fd458418f59', 'b963c77607ec234d6ebc10f3',45, false);



function getCustOutInfo(customer){
    var customerOut = {};
    customerOut.username = customer.username;
    customerOut.first_name = customer.first_name;
    customerOut.last_name = customer.last_name;
    customerOut.email = customer.email;
    customerOut.phone_no = customer.phone_no ;
    customerOut.total_points_earned = customer.total_points_earned;
    customerOut.total_points_redempted = customer.total_points_redempted;
    customerOut.tryit_level = customer.tryit_level;
    customerOut.active = customer.active;
    customerOut.created_on = customer.created_on;
    return customerOut;
};

/**
 * Generate a random key with length
 * @param length
 * @returns {string}
 */
function random36(length){
    var lists = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
        ret = [],
        total = lists.length;
    for (var i = 0; i < length; i++) {
        ret.push(lists[Math.floor(Math.random() * total)]);
    }
    return ret.join('');
};

/**
 * generate a parameter object from url
 * @param url
 * @returns {{}}
 */
function getParamsFromUrl(url){
        var ret = {},
            data = url.split('&');
        for (var i = 0; i < data.length; i++) {
            var oc = data[i].split('=');
            ret[oc[0]] = oc[1];
        }
        return ret;

}

function encodeBase64(text){
    var a = new Buffer(text).toString('base64');
    return a;
}

function decodeBase64(text){
    var a = new Buffer(text, 'base64').toString();
    return a ;
}

/**
 * Get the judgement of the request come from Apple IOS, or not.
 * @param req
 * @returns {boolean}
 */
function isIOSRequest(req){
    var userAgent = req.headers['user-agent'].toString().toLowerCase();
    if(userAgent.indexOf('ios')>=0){
        return true;
    }else{
        return false;
    }

}

function getBitByWeekday(weekday){
    var bitArray =[10000000,1000000,100000,10000,1000,100,10];
    return bitArray[weekday];
}

function getWeekByDate(){
    var d1 = new Date();
    var d2 = new Date();
    d2.setMonth(0);
    d2.setDate(1);
    var rq = d1-d2;
    var s1 = Math.ceil(rq/(24*60*60*1000));
    var s2 = Math.ceil(s1/7);
    return s2;
}

function spaceTrim(s){
    if(s){
        return s.replace(/\s+/g,"");
    }else{
        return s;
    }

}


function pushNotification(alertTitle, alertContent, extras, alias) {
    client.push().setPlatform('ios', 'android')
        .setAudience(JPush.alias(alias))
        .setNotification(JPush.android(alertContent, alertTitle, 1), JPush.ios(alertContent, alertTitle, 1))
        .setMessage(alertContent, null, null, extras)
        .send(function(err, res) {
            if (err) {
                console.log(err.message)
            } else {
                console.log('Sendno: ' + res.sendno)
                console.log('Msg_id: ' + res.msg_id)
            }
        });
}


module.exports = {
    getUserOut : getCustOutInfo,
    random36 : random36,
    getParamsFromUrl : getParamsFromUrl,
    encodeBase64 : encodeBase64,
    decodeBase64 : decodeBase64,
    isIOSRequest : isIOSRequest,
    getBitByWeekday :getBitByWeekday ,
    getWeekByDate : getWeekByDate,
    spaceTrim : spaceTrim,
    pushNotification : pushNotification
}