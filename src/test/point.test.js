var assert = require("assert");

 
exports.test=function(client){describe('service: point', function() {
 
    describe('Test list point', function() {
        it('should get a list of point', function(done) {
            client.get('/point', function(err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.length>0,"point list length>0");
                    done();
                }
            });
        });
    });
    
    describe('Test get point by id', function() {
          it('should get a point', function(done) {
            client.get('/point/1001', function(err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    assert(data.point_id==1001," point found");
                    done();
                }
            });
        });
    });
    
    
     describe('Test get point by wrong id', function() {
          it('should get a error 404', function(done) {
            client.get('/point/1', function(err, req, res, data) {
                  assert(res.statusCode==404);
                  done();
                //  assert(res.body.message);
            });
        });
    });
})}