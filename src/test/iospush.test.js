/**
 * Created by ling xue on 15-4-21.
 */

var assert = require("assert");
var iosPush = require('../lib/IOSPush.js');

exports.test = function (client) {
    describe('service: apn', function () {
        it('should send  a apple push notification', function (done) {
            /*var params ={
                token : ["c79d3adb adf26c79 6ef2aeee f04043ca 4466a759 9cea59e0 37d92f8f 25256a33"],
                text : "test 123",
                badge : 1,
                sound : 1
            }
            *//*iosPush.pushNotification(params,function(error,result){
                console.log("Test result: "+result);
                done();
            });*//*
            client.post('/api/biz/103072/apn',params,function (err, req, res, data) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log(data);

                }
                done();
            });*/
            var d = new Date('2015-01-15 07:00:00');
            console.log(d.toLocaleString());
            console.log(d.toUTCString());
            done();
        });

    });
}