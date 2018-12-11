var assert = require("assert");


exports.test = function (client) {
    describe('service: Biz User Role Base', function () {
        /*it('should crud a user for waiter', function (done) {

            client.post('/biz/103072/bizUser/2/waiter',{remark:'remark 2'},function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.success, "the user  should be a biz waiter");
                    done();
                }
            });
            client.put('/biz/103072/bizUser/2/waiter',{remark:'remark 2'},function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.success, "the user  should be updated to a biz waiter");
                    done();
                }
            });
            client.del('/biz/103072/bizUser/2/waiter',function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.success, "the user  should be removed from biz waiter");
                    done();
                }
            });
        });

        it('should crud  a user for manager', function (done) {

            client.post('/biz/103072/bizUser/3/manager',{remark:'remark 3'},function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.success, "the user  should be a biz manager");
                    done();
                }
            });
            client.put('/biz/103072/bizUser/3/manager',{remark:'remark 3'},function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.success, "the user  should be updated to a biz manager");
                    done();
                }
            });
            client.del('/biz/103072/bizUser/3/manager',function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.success, "the user  should be removed from biz manager");
                    done();
                }
            });
        });*/
        it('should crud  a user for manager', function (done) {
            client.get('/biz/103072/bizUser/bowen.wang@missionpublic.com',function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.length, "the biz user  should be found");
                    done();
                }
            });
        });
    })
};