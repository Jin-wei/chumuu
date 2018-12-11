/**
 * Created by ling xue on 14-5-22.
 */
var oAuthUtil = require('./OAuthUtil.js');
var mdb = require('../resource/resourcedb');
var bizDao = require('../dao/bizdao.js');
var sysMsg = require('./SystemMsg.js');
var sysError = require('./SystemError.js');
var Seq = require('seq');

function save(req ,res ,next){
    //console.log(new Date().getTime());
    var url = req.url;
    if(url.indexOf('?') >0){
        //console.log(url);
        url = url.substring(0,url.indexOf('?'));

    }
    if(!url.toLowerCase().match(".json|.html|.png|.css|.js|.jpg|.woff|.map|.gif|.ico" )){
        //console.log(url);
        var apiObj = {};
        apiObj.url = url;
        if(req.route){
            apiObj.path = req.route.path;
        }

        apiObj.referer = req.headers.referer;
        apiObj.method = req.method;
        apiObj.userAgent = req.headers['user-agent'];
        //apiObj.token = req.headers['auth-token'];
        if(req.headers['auth-token'] ){
            var tokenInfo = oAuthUtil.parseAccessToken(req.headers['auth-token']);
            if(tokenInfo != null){
                if(tokenInfo.extraData == 'bizwise'){
                    apiObj.bizId = tokenInfo.userId;
                }else{
                    apiObj.customerId = tokenInfo.userId;
                }
            }

        }
        apiObj.statusCode = res.statusCode;
        apiObj.time = req._time;
        apiObj.params = req.params;
        //console.log(apiObj);
        mdb.getDb(function(error,db){
            if(error){
                throw sysError.InternalError(error.message,sysMsg.SYS_ADD_API_RECORD_ERROR);
            }
            db.collection("api_records").insert(apiObj,function(error,record){
                if(error){
                    throw sysError.InternalError(error.message,sysMsg.SYS_ADD_API_RECORD_ERROR);
                }
                //console.log("End Time :"+new Date().getTime()+"---->")+record[0]._id.toString();
            });

        })
    }
    //next();
}

/**
 * temp function for save biz location info to mongodb
 * @type {{save: save}}
 */
function saveBizLocation(req ,res ,next){
    /*mdb.getDb(function(error,db){
        if(error){
            throw sysError.InternalError(error.message,sysMsg.SYS_ADD_API_RECORD_ERROR);
        }
        //db.collection('biz_location').ensureIndex('biz_location',{location:1},{unique:false, background:true, dropDups:false, w:1,name:'biz_location_index'},function(err, indexName){
        db.ensureIndex('biz_location',{loc:"2dsphere"},{name:'biz_loc_index'},function(err, indexName){
            if(err){
                throw sysError.InternalError(err.message,sysMsg.SYS_ADD_API_RECORD_ERROR);
            }else{
                console.log(indexName);
                res.send(200,true);
                next();
            }
        })

    });*/
    mdb.getDb(function(error,db){
        var params1 = {
            'loc' : { $near : [37.553616,-121.974472] }
        }
        var params2= {
            loc : {
                $near : {
                    $geometry : {
                        type : "Point" ,
                        coordinates : [-121.974472,37.553616]
                    }
                }
            }
        };

        if(error){
            throw sysError.InternalError(error.message,sysMsg.SYS_ADD_API_RECORD_ERROR);
        }
        db.collection('biz_location').find(params2).skip(460).limit(80).toArray(function(err, rows){
        //db.collection('biz_location').geoNear(37.553616,-121.974472,function(err, rows){
            if(err){
                throw sysError.InternalError(error.message,sysMsg.SYS_ADD_API_RECORD_ERROR);
            }else{
                console.log(rows);
                res.send(200,rows);
                next();
            }
        })

    });
    /*var bizList = [];
    Seq().seq(function(){
        var that = this;
        mdb.getDb(function(error,db){
            if(error){
                throw sysError.InternalError(error.message,sysMsg.SYS_ADD_API_RECORD_ERROR);
            }
            db.collection("biz_location").remove({},function(error,record){
                if(error){
                    throw sysError.InternalError(error.message,sysMsg.SYS_ADD_API_RECORD_ERROR);
                }
               that();
            });

        });
    }).seq(function(){
        var that = this;
        bizDao.search({},function(error,rows){
            if(error){
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            }else{
                bizList = rows;
                that();
            }
        });

    }).seq(function(){

            Seq(bizList).seqEach(function(biz,i){
                var that =  this;
                var bizLocObj = {};
                bizLocObj.biz_id = biz.biz_id;
                var location = {};
                location.type = "Point";
                if(biz.longitude == null || biz.latitude == null ){
                    that();
                }else{
                    location.coordinates = [biz.longitude,biz.latitude ];

                    bizLocObj.loc = location;
                    mdb.getDb(function(error,db){
                        if(error){
                            throw sysError.InternalError(error.message,sysMsg.SYS_ADD_API_RECORD_ERROR);
                        }
                        db.collection("biz_location").insert(bizLocObj,function(error,record){
                            if(error){
                                throw sysError.InternalError(error.message,sysMsg.SYS_ADD_API_RECORD_ERROR);
                            }
                            that();
                        });

                    })
                }


            }).seq(function(){
                    res.send(200,true);
                    next();
                });
        })*/
}

function saveTempRes(params){
    mdb.getDb(function(error,db){
        if(error){
            throw sysError.InternalError(error.message,sysMsg.SYS_ADD_API_RECORD_ERROR);
        }
        db.collection("temp_res").insert(params,function(error,record){
            if(error){
                throw sysError.InternalError(error.message,sysMsg.SYS_ADD_API_RECORD_ERROR);
            }
            //console.log("End Time :"+new Date().getTime()+"---->")+record[0]._id.toString();
        });

    })
}

function getTempRes(callback){
    mdb.getDb(function(error,db) {
        if (error) {
            throw sysError.InternalError(error.message, sysMsg.SYS_ADD_API_RECORD_ERROR);
        }
        db.collection('temp_res').find().toArray(function (err, rows) {
            callback(err, rows)
        })
    });
}
module.exports = {
    save : save ,
    saveBizLocation : saveBizLocation ,
    getTempRes : getTempRes ,
    saveTempRes : saveTempRes
}