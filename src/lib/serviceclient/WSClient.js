var restify = require('restify');
var sysConfig = require('../config/SystemConfig.js');
var http = require('http');
function WSClient(options) {
    var self = this;
    if (options!=null && options.url !=null) {
        this.url = options.url;
    }else{
        this.url=sysConfig.webSocketServiceURL;
    }
    this.client = restify.createClient({
        url:this.url
    });
}

WSClient.prototype.notifyChangeDish = function notifyNewOrder(bizId,qr,cb) {
    this.client.get('/changeDish/biz/'+bizId + '/qr/' + qr, function (err, req, res, obj) {
        if (cb) {
            if (err) {
                cb(err);
            } else {
                cb(null, obj);
            }
        }
    })
};

WSClient.prototype.notifyCompleteOrder = function notifyNewOrder(bizId,qr,openIdParty,cb) {
    this.client.get('/completeOrder/biz/'+bizId + '/qr/' + qr + '/openIdParty/' + openIdParty, function (err, req, res, obj) {
        if (cb) {
            if (err) {
                cb(err);
            } else {
                cb(null, obj);
            }
        }
    })
};

WSClient.prototype.notifyNewOrderCreated = function notifyNewOrder(bizId,cb) {
    this.client.get('/newOrder/biz/'+bizId, function (err, req, res, obj) {
        if (cb) {
            if (err) {
                cb(err);
            } else {
                cb(null, obj);
            }
        }
    })
};
WSClient.prototype.callOutCreated = function callOut(params,cb) {
    this.client.get('/callOut/biz/'+params.bizId + '/audio/'+ JSON.stringify(params.audioStream), function (err, req, res, obj) {
        if (cb) {
            if (err) {
                cb(err);
            } else {
                cb(null, obj);
            }
        }
    })
};

module.exports = {
    createClient: function createClient(options) {
        return (new WSClient(options));
    }
};