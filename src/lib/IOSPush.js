var apn=require("apn");
var sysConfig = require('./config/SystemConfig.js');
var serverLogger = require('./util/ServerLogger.js');
var logger = serverLogger.createLogger('IOSPush.js');
var Seq = require('seq');
var orderDao = require('./dao/orderDao.js');

function errorHappened(err, notification){
    console.log(err);
    console.log(notification);
}
var apnOptions = sysConfig.iosPushConfig;
apnOptions.errorCallback =errorHappened ;
var service = new apn.connection(apnOptions);

service.on("connected", function() {
   logger.debug("Connected APN");
});

service.on("transmitted", function(notification, device) {
    logger.info("Notification transmitted to:" + device.token.toString("hex"));
});

service.on("transmissionError", function(errCode, notification, device) {
    logger.error("Notification caused error: " + errCode + " for device ", device, notification);
    if (errCode === 8) {
        logger.log("A error code of 8 indicates that the device token is invalid. This could be for a number of reasons - are you using the correct environment? i.e. Production vs. Sandbox");
    }

});

service.on("timeout", function (err) {
    logger.error("Connection APN Timeout");

});

service.on("disconnected", function() {
    logger.error("Disconnected from APNS");
    //console.log('5')
});

service.on("socketError", function(error){
    logger.error(error.message);

});

/*var feedbackOptions = {
    "batchFeedback": true,
    "interval": 300
};

var feedback = new apn.Feedback(feedbackOptions);
feedback.on("feedback", function(devices) {
    devices.forEach(function(item) {
        console.log(item);
    });
});*/
function pushAPNTest(req,res,next) {
    var params = req.params;
    var token = 'c79d3adb adf26c79 6ef2aeee f04043ca 4466a759 9cea59e0 37d92f8f 25256a33';
    var note = new apn.notification();
    var myDevice = new apn.Device(token);
    note.setAlertText('test');
    note.badge = 1;
    if(params.sound){
        note.sound = "ping.aiff";
    }
    note.payload = {'messageFrom': 'tru-menu'};
    note.expiry = Math.floor(Date.now() / 1000) + 3600;

    service.pushNotification(note, myDevice);
    res.send(200,{success:true});
    next();
}
function pushNotificationToMany(req,res,next) {

    var params = req.params;
    var token = params.token;
    var note = new apn.notification();
    note.setAlertText(params.text);
    note.badge = params.badge;
    if(params.sound){
        note.sound = "ping.aiff";
    }
    note.payload = {'messageFrom': 'tru-menu'};
    note.expiry = Math.floor(Date.now() / 1000) + 3600;

    service.pushNotification(note, token);
    res.send(200,{success:true});
    next();
}


function pushNotification(req,res,next) {

    var params = req.params;
    var note = new apn.notification();
    var myDevice = new apn.Device(params.token);
    note.setAlertText(params.text);
    note.badge = params.badge;
    if(params.sound){
        note.sound = "ping.aiff";
    }
    note.payload = {'messageFrom': 'tru-menu'};
    note.expiry = Math.floor(Date.now() / 1000) + 3600;
    service.pushNotification(note, myDevice);
    res.send(200,{success:true});
    next();
}

function newOrderAPNS(params,callback){
    var token = params.token;
    if(token == null || token.length<1){
        return callback(null,{success:true});
    }else{
        var note = new apn.notification();
        note.setAlertText(params.text);
        note.badge = params.badge;
        if(params.sound){
            note.sound = "ping.aiff";
        }
        note.payload = {'messageFrom': 'tru-menu'};
        note.expiry = Math.floor(Date.now() / 1000) + 3600;
        for(var i =0; i<token.length; i++){
            var myDevice = new apn.Device(token[i]);
            service.pushNotification(note, myDevice);
        }
        logger.info("send to APNS");
        callback(null,{success:true});
    }

}


module.exports = {
    pushNotificationToMany : pushNotificationToMany,
    pushNotification : pushNotification,
    newOrderAPNS : newOrderAPNS,
    pushAPNTest : pushAPNTest
}