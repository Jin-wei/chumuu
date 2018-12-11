var assert = require("assert")

exports.test = function (client) {
    describe('service: /', function () {

        // Test #1
        describe('Test list api', function () {
            it('should get a list of api', function (done) {
                client.get('/', function (err, req, res, data) {
                    if (err) {
                        //throw new Error(err);
                    }
                    else {
                        assert(data.length > 0, "biz list length>0");
                        done();
                    }
                });
            });
            // Add more tests as needed...
        });
    });
}