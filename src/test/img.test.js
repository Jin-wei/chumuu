/**
 * Created by ling xue on 14-9-14.
 */
var assert = require("assert");
var batchJob = require("../lib/resource/batchJob.js");

exports.test = function (client) {
    describe('service: search', function () {
        it('should get a list of prod', function (done) {
            batchJob.resetAllImage("1",function(error,result){
                console.log(result);
                done();
            })
        });
    });
};