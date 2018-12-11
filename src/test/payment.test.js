/**
 * Created by ling xue on 14-12-24.
 */

var assert = require("assert");
var table = require('../lib/payment.js');

exports.test = function (client) {
    describe('service: payment', function () {
        var nonce = '39caf266-6111-49eb-bf11-0c9713ad314b';
       /* it('should delete a business table ', function (done) {

            client.post('/order/21/payment',{payment_method_nonce:nonce},function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.success, "the business tables should be delete");
                    done();
                }
            });
        });*/

        /*it('should get client payment token ', function (done) {

            client.get('/payment/100385/clientToken',function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.token, "the client payment token should be get");
                    done();
                }
            });
        });*/
        /*it('should get customer payment info ', function (done) {

            client.get('/cust/100385/payment',function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.length, "the customer payment info should be get");
                    done();
                }
            });
        });*/

        it('should get business payment info ', function (done) {

            client.get('/biz/103072/payment',function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.length, "the business payment info should be get");
                    done();
                }
            });
        });
    });

};