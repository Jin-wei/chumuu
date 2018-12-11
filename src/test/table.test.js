/**
 * Created by ling xue on 14-11-5.
 */
var assert = require("assert");
var table = require('../lib/table.js');

exports.test = function (client) {
    describe('service: table', function () {
        var tableId = 0;
        it('should create  a table', function (done) {
            var tableObj = {
                name: 'a1',
                remark : 'a1 remark' ,
                tableType : 400,
                seats : 3
            };
            client.post('/biz/103072/table',tableObj,function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    tableId = data.tableId;
                    assert(data.tableId, "the order  should be created");
                    done();
                }
            });
        });
        it('should update  a table info', function (done) {
            var tableNewObj ={
                name: 'a2',
                remark : 'a2 remark' ,
                tableType : 401,
                seats : 10
            }
            client.put('/biz/103072/table/'+tableId,tableNewObj,function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.success, "the table info  should be updated");
                    done();
                }
            });
        });
        it('should update  a table status', function (done) {

            client.put('/biz/103072/table/'+tableId+'/status/301',function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.length>0, "the table status  should be updated ");
                    done();
                }
            });
        });
        it('should get business tables ', function (done) {

            client.get('/biz/103072/table/?sortBy=name',function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.success, "the business tables should be get");
                    done();
                }
            });
        });
        it('should delete a business table ', function (done) {

            client.del('/biz/103072/table/'+tableId,function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.success, "the business tables should be delete");
                    done();
                }
            });
        });
    });
}