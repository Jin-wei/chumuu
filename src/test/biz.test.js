var assert = require("assert");

 
exports.test=function(client){describe('service: biz', function() {
 
    /*describe('Test list biz', function() {
        it('should get a list of business', function(done) {
            client.get('/biz', function(err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.length>0,"biz list length>0");
                    done();
                }
            });
        });
    });
    
    describe('Test get biz by id', function() {
          it('should get a business', function(done) {
            client.get('/biz/100001', function(err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.biz_id==100001,"biz id found");
                    done();
                }
            });
        });
    });
    
    
     describe('Test get biz by wrong id', function() {
          it('should get a error 404', function(done) {
            client.get('/biz/1', function(err, req, res, data) {
            	  console.dir(res);
                  assert(res.statusCode==404);
                 // assert(res.body.message);
                  done();
            });
        });
    });
    */
         // Test #1
    describe('Test list biz custormer', function() {
          /*it('should get a list of customer of this business', function(done) {
            client.get('/biz/100001/cust', function(err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.length>0,"customers found");
                    done();
                }
            });
        });
        
          it('should get a list of customer activities of this business', function(done) {
            client.get('/biz/100001/cust/100001/act', function(err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.length>0,"activities found");
                    done();
                }
            });
        });

        it('biz base info should be update', function(done) {
            var param  ={};
            param.phoneNo = "1232132";
            param.categroy = "dsaf,abd";
            param.cashOnly = '0';
            param.reservations = '1';
            param.wifi = '1';
            param.hours = '';
            param.parking  = '1';
            param.seatOutDoor  = '1';
            param.privateRoom  = '1';
            param.desc  = 'descpe';
            param.bizId = 100001;

            client.put('/biz', param, function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.success == true, "The biz base info should be update success");
                    applyId = data.applyId;
                    done();
                }
            });
        });
        it('get biz id by unique name', function(done) {

            client.get('/biz/CA-fremont-mission-coffee/uniqueName', function(err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.length>0,"bizId found");
                    done();
                }
            });
        });
        it('get biz info by biz id', function(done) {

            client.get('/biz/103072', function(err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.user_id>0,"biz user info found");
                    done();
                }
            });
        })*/
    });


    // Test #2
    describe('Test CRUD for biz user', function() {
        var bizUserId = ""

        /*it('should add a new biz user', function(done) {
            client.post('/bizUser', {email: "dalianyg@126.com", password: "mp",username:"dalianyg",first_name:"first",last_name:"last"}, function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.bizUserId != undefined, "biz user should sign up success by email");
                    bizUserId = data.bizUserId;
                    done();
                }
            });
        });

        it('-- send active email to biz user ', function (done) {
            client.post('/bizUser/send/activeMail', {email: "dalianyg@126.com"}, function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.success == true, "biz user should received active email");
                    done();
                }
            });
        });

        it('biz user should be active', function(done) {
            var activeCode = "17750b00d3cbc0956fc611b5bd0e40357c5c4f597de5a3239312e774d99a3475e2e02102e73a18e8853e69c944c3ca21";
            client.get('/bizUser/12/active?data='+activeCode,null, function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.userId != undefined, "biz user should login success by email");
                    assert(data.accessToken != undefined, "biz user should get a token success");
                    done();
                }
            });
        });

        it('-- biz user should login by email', function (done) {
            client.post('/bizUser/do/login', {user: "dalianyg@126.com", password: "mp"}, function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.userId != undefined, "biz user should login success by email");
                    assert(data.accessToken != undefined, "biz user should get a token success");
                    done();
                }
            });
        });

        it('-- biz user should change password success', function (done) {
            client.post('/bizUser/12/changePassword', {password: "mp" , newPassword :"pm"}, function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.success == true, "biz user should change password success ");
                    done();
                }
            });
        });

        it('-- send new password email to biz user ,', function (done) {
            client.post('/bizUser/send/passwordMail', {email: "dalianyg@126.com"}, function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.success == true, "biz user should received password email");
                    done();
                }
            });
        });*/
        /*it('biz user profile info should be update', function(done) {
            var param  ={};
            param.phoneNo = "1232132";
            param.userId = 1;
            param.first_name = "bowen";
            param.last_name = "wang";
            param.username = "bowenw";
            param.bizId = 103072;

            client.put('/bizUser', param, function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.success == true, "The biz base info should be update success");

                    done();
                }
            });
        });*/
    });

    // Test #2
    /*describe('Test CRUD for biz user application', function() {
        var applyId = "";
        var application = {};
        application.bizName = "BizTest";
        application.address = "Us SF 1st street 16th ";
        application.city = "SF";
        application.state  ="CA";
        application.zipcode = '100010';
        application.country = 'US';
        application.phone_num = "12334343";
        application.category = 'Fast Food';
        application.latitude = '34.123' ;
        application.longitude = '-121.234';

        it('should add a new application for biz user', function(done) {
            client.post('/bizApp', application, function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.applyId != undefined, "The application id  should be not null");
                    applyId = data.applyId;
                    done();
                }
            });
        });

        it('should get biz user application', function(done) {
            client.get('/bizApp',function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.id != undefined, "biz user application should not be null");
                    done();
                }
            });
        });


        it('biz user application should be update', function(done) {
            application.city='LA';
            application.zipcode = '100020';
            application.bizName = "updateBizName";
            client.put('/bizApp/'+applyId, application, function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.success == true, "The application should be update success");
                    applyId = data.applyId;
                    done();
                }
            });
        });



    });*/

    // Test #2
    describe('Test biz customer count', function() {
        /*it('-- get business active customer count', function (done) {
            client.get('/biz/100001/customerCount', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {

                    assert(data.customerCount > 0, "business customer count should be get");
                    done();
                }
            });
        });*/
        /*it('-- get business menu click count by day', function (done) {
            client.get('/biz/103072/dayClick/7', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {

                    assert(data.length > 0, "business day click count should be get");
                    done();
                }
            });
        });
        it('-- get business menu click count by week', function (done) {
            client.get('/biz/103072/weekClick/10', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {

                    assert(data.length > 0, "business week click count should be get");
                    done();
                }
            });
        });
        it('-- get business menu click count by month', function (done) {
            client.get('/biz/103072/monthClick/12', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {

                    assert(data.customerCount > 0, "business month click count should be get");
                    done();
                }
            });
        });*/

    });


    // Test #2
    describe('Test biz comment module', function() {
        /*it('should add a biz comment ', function (done) {
            client.post('/cust/100378/biz/103072/comment', {'comment': 'none', 'priceLevel': 3,'serviceLevel': 3,'foodQuality': 3}, function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.affectedRows > 0, "biz comment add record length>0");
                    done();
                }
            });
        });

        it('should get customer comment', function (done) {
            client.get('/cust/100378/custBizComment', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.length > 0, "customer comment  found");
                    done();
                }
            });
        });

        it('should get biz comment', function (done) {
            client.get('/cust/103072/bizComment', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.length >0, "biz comment found");
                    done();
                }
            });
        });

        it('should get biz comment count and rating ', function (done) {
            client.get('/cust/103072/ratBizComment', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.length >0, "biz comment count and average rating get");
                    done();
                }
            });
        });

        it('should update biz comment  ', function (done) {
            client.put('/cust/100378/bizComment/1/',{comment: "product",  'priceLevel': 4,'serviceLevel': 4,'foodQuality': 4}, function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.affectedRows >0, "product comment count get");
                    done();
                }
            });
        });

        it('should delete biz comment ', function (done) {
            client.del('/cust/100378/bizComment/1/', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.affectedRows >0, "product comment count get");
                    done();
                }
            });
        });

        it('should get  biz with comment ', function (done) {
            client.get('/biz/do/bizWithComment', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.length >0, "biz with comment info get");
                    done();
                }
            });
        });*/

       /* it('should get  biz favorite count ', function (done) {
            client.get('/biz/103072/favoriteCount', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.favorite_count >=0, "biz  favorite count get");
                    done();
                }
            });
        });
        it('should get  biz tax rate ', function (done) {
            client.get('/biz/103072/taxRate', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.favorite_count >=0, "biz  tax rate get");
                    done();
                }
            });
        });*/

    });

    // Test #2
    describe('Test biz img crud', function() {
        /*it('should get  biz image ', function (done) {
            client.get('/biz/103072/bizImg', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.length >=0, "biz  image should be get");
                    done();
                }
            });
        });

        it('should set a biz image to default', function (done) {
            client.put('/biz/103072/bizImg/1', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.success , "biz  image should be set default");
                    done();
                }
            });
        });

        it('should delete a biz image ', function (done) {
            client.del('/biz/103072/bizImg/1', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.success , "biz  image should be delete");
                    done();
                }
            });
        });*/
        /*it('should get  biz favorite customer info ', function (done) {
            client.get('/biz/103072/allFavorCust', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.length >=0, "biz  favorite customer should be get");
                    done();
                }
            });
        });*/
        /*it('should update  biz order status ', function (done) {
            client.put('/biz/103072/orderStatus/0', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.success, "biz  order status  should be update");
                    done();
                }
            });
        });*/
        var printerId = 0;
        /*it('should create a  biz printer ', function (done) {
            client.post('/biz/103072/printer',{type:1,name:'name1',ip:'192.168.1.222',local:'local1',remark:'remark1'}, function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    printerId = data.id;
                    assert(data.id, "biz  printer  should be created");
                    done();
                }
            });
        });
        it('should update  biz printer ', function (done) {
            client.put('/biz/103072/printer/'+printerId,{type:1,name:'name2',ip:'192.168.1.111',local:'local2',remark:'remark2'}, function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.success, "biz  printer  should be update");
                    done();
                }
            });
        });

        it('should get  biz printers ', function (done) {
            client.get('/biz/103072/printer', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.length, "biz  printers  should be get");
                    done();
                }
            });
        });

        it('should get  biz printers ', function (done) {
            client.get('/biz/103072/printer', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.length, "biz  printers  should be get");
                    done();
                }
            });
        });

        it('should delete  biz printers ', function (done) {
            client.del('/biz/103072/printer/2', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.success, "biz  printers  should be delete");
                    done();
                }
            });
        });

        it('should get  biz relation customer ', function (done) {
            client.get('/biz/103072/cust/100385/bizCustRel', function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.length, "biz  relation customer  should be get");
                    done();
                }
            });
        });

        it('should   biz user mobile login  ', function (done) {
            client.post('/api/bizUser/do/mLogin',{user: "bowen.wang@missionpublic.com", password: "mp",deviceToken:'bac'}, function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {

                    assert(data.bizId, "biz id  should be get");
                    done();
                }
            });
        });

        it('should   biz user mobile log out  ', function (done) {
            client.post('/api/biz/103072/mLoginOut',{deviceToken:'bac'}, function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.success, "biz id  should be log out");
                    done();
                }
            });
        });*/
        it('should   biz user mobile log out  ', function (done) {
            client.put('/api/biz/103072/mobileSound/0',{deviceToken:'bac'}, function (err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.success, "biz id  should be log out");
                    done();
                }
            });
        });

    });




});
}