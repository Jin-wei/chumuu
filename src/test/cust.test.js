var assert = require("assert");
var db = require('./../lib/db.js');
var custdao = require('./../lib/dao/custdao.js');
var encrypt = require('./../lib/util/Encrypt.js');


exports.test = function (client) {
    describe('service: cust', function () {

        /*// Test #1
        describe('Test get cust', function () {

            it('should get a cust', function (done) {
                client.get('/cust/100001', function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.customer_id == 100001, "customer id found");
                        done();
                    }
                });
            });

            it('should get a customer info', function (done) {
                client.get('/customerInfo', function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.customer_id == 100001, "customer id found");
                        done();
                    }
                });
            });
        });

        describe('Test get biz list for cust', function () {
            it('should get a list of biz for this cust', function (done) {
                client.get('/cust/100001/biz', function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.length > 0, "biz found");
                        done();
                    }
                });
            });
        });

        describe('Test get biz list for cust with distance info', function () {
            it('should get a list of biz for this cust', function (done) {
                client.get('/cust/100001/biz?latitude=100&longitude=1000', function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.length > 0, "biz found");
                        assert(data[0].distance > 0, "distance calculated");
                        done();
                    }
                });
            });
        });


        // Test #2
        describe('Test CRUD a cust', function () {
            var custId = null;

            it('-- create new customer', function (done) {
                client.post('/cust', {first_name: "aa", last_name: "bb", email: "abc", phone_no: '123', username: "aabb", password: "pwd"}, function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        custId = data.customer_id;
                        assert(custId > 0, "customer should be created");
                        done();
                    }
                });
            });


            it('-- get new created customer', function (done) {
                client.get('/cust/' + custId, function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        console.log('======');
                        console.dir(data);
                        assert('aa' == data.first_name, "first name match");
                        assert('bb' == data.last_name, "last name match");
                        assert('abc' == data.email, "email match");
                        assert('123' == data.phone_no, "phone number match");
                        assert('aabb' == data.username, "user name match");
                        assert('pwd' == data.password, "password match");
                        assert(0 == data.total_points_earned, "total point earned default to be 0");
                        assert(0 == data.total_points_redempted, "total points redempted default to be 0");
                        assert('Regular' == data.tryit_level, "try it level default to be Regular");
                        done();
                    }


                });
            });

            it('-- update customer', function (done) {
                client.put('/cust/' + custId, {first_name: "aa1", last_name: "bb1", email: "abc1", phone_no: '1234', username: "aabb1"}, function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.succeed == true, "customer should be updated ");
                        done();
                    }
                });
            });

            it('--change password', function (done) {
                client.post('/cust/' + custId + '/changepassword', {password: "aa1"}, function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.succeed == true, "password should be updated ");
                        done();
                    }
                });
            });

            it('-- verify updated customer', function (done) {
                client.get('/cust/' + custId, function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert('aa1' == data.first_name, "first name match");
                        assert('bb1' == data.last_name, "last name match");
                        assert('abc1' == data.email, "email match");
                        assert('1234' == data.phone_no, "phone number match");
                        //no change on username and password
                        assert('aabb' == data.username, "user name match");
                        //assert('pwd'==data.password,"password match");
                        done();
                    }

                });
            });

            var custId2;
            it('-- create new customer without first name and last name', function (done) {
                client.post('/cust', {email: "xueling794@yeah.net",  password: "pwd1"}, function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        custId2 = data.customer_id;
                        assert(custId > 0, "customer should be created without first name and last name");
                        done();
                    }
                });
            });
            //delet test data
            after(function (done) {
                custdao.del({cust_id: custId}, done)
            });
            after(function (done) {
                custdao.del({cust_id: custId2}, done)
            });

        });

        // Test #1
        describe('Test customer check in', function () {

            it('should create a check in activity', function (done) {
                client.post('/cust/100001/biz/100001/checkin', function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.activity_id > 0, "activity created");
                        done();
                    }
                });
            });
        });*/

        // Test #4 add user,active user ,user login
        describe('Test customer login', function () {
            /*var activeCode = "";
            var customerId = "";

            it('-- sign in a  email user without active', function (done) {
                client.post('/cust', {email: "dalianyg@126.com", password: "mp"}, function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.customerId != undefined, "Customer should sign in success by email");
                        customerId = data.customerId;
                        done();
                    }
                });
            });

            it('-- active user by code', function (done) {
                var activeCode = "17750b00d3cbc0956fc611b5bd0e4035566657e705d19cffb0707c0c39aa4f123910d1d3fde3cba68d3ee16caa7dfb83";
                client.get('/cust/100369/active?data='+activeCode,function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.customerId != undefined, "Customer should login success by email");
                        assert(data.accessToken != undefined, "Customer should get a token success");
                        done();
                    }
                });
            });

            it('-- login user by email', function (done) {
                client.post('/cust/do/login', {user: "dalianyg@126.com", password: "mp"}, function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.customerId != undefined, "Customer should login success by email");
                        assert(data.accessToken != undefined, "Customer should get a token success");
                        done();
                    }
                });
            });

            it('-- send active email to user ', function (done) {
                client.post('/cust/send/activeMail', {email: "dalianyg@126.com"}, function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.success == true, "Customer should received active email");
                        done();
                    }
                });
            });
            it('-- send new password email to user ,', function (done) {
                client.post('/cust/send/passwordMail', {email: "dalianyg@126.com"}, function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.success == true, "Customer should received password email");
                        done();
                    }
                });
            });*/
            /*it('--   update favorite user biz relation', function (done) {
                client.post('/cust/100001/biz/100006/favorite', {favorite: 1}, function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.length>0 && data[0].relation_id != null, "Customer should favorite the biz");
                        done();
                    }
                });
            });

            it('--   get favorite user biz relation', function (done) {
                client.get('/cust/100001/favoriteBiz', function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data != null && data.length>0, "Customer should  get the favorite biz ");
                        done();
                    }
                });
            });*/

            /*it('--   add favorite user product relation', function (done) {
                client.post('/cust/100001/prod/102372/favorite',{}, function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data != null && data.affectedRows>0, "Customer should  get the favorite biz ");
                        done();
                    }
                });
            });

            it('--   get favorite user product relation', function (done) {
                client.get('/cust/100001/favoriteProd', function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data != null && data.length>0, "Customer should  get the favorite biz ");
                        done();
                    }
                });
            });

            it('--   get favorite user product relation', function (done) {
                client.del('/cust/100001/prod/102372/favorite', function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data != null && data.affectedRows>0, "Customer should  get the favorite biz ");
                        done();
                    }
                });
            });*/
        });

        // Test #1
        describe('Test customer feedback', function () {

            /*it('should create a feedback in server', function (done) {
                client.post('/cust/do/feedback', {content: "aa",contact_email:"temp@temp.cn"},function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.length > 0, "feedback created");
                        done();
                    }
                });
            });
            it('should get a feedback list from server', function (done) {
                client.get('/cust/do/feedback',function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.length > 0, "feedback list should be get");
                        done();
                    }
                });
            });
            it('should create a biz customer relation ', function (done) {
                client.post('/cust/100385/biz/103072/bizCustRel',function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        assert(data.success > 0, "biz customer relation should be created");
                        done();
                    }
                });
            });*/
            /*var encodeData = "";
            it('create a encode data for reset user email ', function (done) {
                client.post('/cust/100385/loginEmail/test@test.com',function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {
                        encodeData = data.encodeData;
                        assert(data.encodeData , "customer create encode data success");
                        done();
                    }
                });
            });*/
            it('create a encode data for reset user email ', function (done) {
                client.put('/cust/100385/loginEmail',{newEmail:'dalianyg@126.com',email:'ling.xue@missionpublic.com',password:'123456'},function (err, req, res, data) {
                    if (err) {
                        throw new Error(err);
                    }
                    else {

                        assert(data.success , "customer create encode data success");
                        done();
                    }
                });
            });
        });
    })
}
