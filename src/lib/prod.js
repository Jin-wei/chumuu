var prodDao = require('./dao/ProdDao');
var prodTypeDao = require('./dao/prodtypedao');
var imagedao = require('./resource/imagedao.js');
var prodCommentDao = require('./dao/ProdCommentDao.js');
var prodCustRelDao = require('./dao/ProductCustomerRelDao.js');
var promoDao = require('./dao/PromoDao.js');
var Seq = require('seq');
var oAuthUtil = require('./util/OAuthUtil.js');
var sysMsg = require('./util/SystemMsg.js');
var sysError = require('./util/SystemError.js');
var bizStatDao = require('./dao/bizStatDao.js');
var serverLogger = require('./util/ServerLogger.js');
var logger = serverLogger.createLogger('Prod.js');
var path = require('path');
var fs = require('fs');
var mdb = require('../lib/resource/resourcedb.js');
var sysConfig = require('./config/SystemConfig.js');
var ESUtil=require('mp-es-util').ESUtil;
var esUtil=new ESUtil(sysConfig.getSearchOption(),logger);
var moment = require('moment');
var MD5 = require("md5");
var http = require("http");
var request=require('request');

var labelMain=require('./util/prodLabel/labelMain.js');
function listBizProd(req, res, next) {
    var biz_id=req.params.bizId;
    var type=req.params.type;
    prodDao.searchBizProd({biz_id:biz_id,type:type}, function (error, rows) {
        if (error) {
            logger.error(' listBizProd ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else {
            logger.info(' listBizProd ' + ' success ');
            if (rows && rows.length > 0) {
                res.send(200, rows);
                next();
            } else {
                res.send(200,null);
                next();
            }
        }
    });

}


function getBizProd(req, res, next) {
    var biz_id=req.params.bizId;
    var prod_id=req.params.id;
    var returnData = {};
    Seq().seq(function(){
        var that = this;
        prodDao.getBizProd(biz_id,prod_id, function (error, rows) {
            if (error) {
                logger.error(' getBizProd ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else {
                logger.info(' getBizProd ' + ' success ');
                if (rows && rows.length > 0) {
                    // res.send(200, rows[0]);
                    // next();
                    returnData=rows[0];
                    that()
                } else {
                    // res.send(200,null);
                    // next();
                    returnData = null;
                    next();
                }
            }
        });
    }).seq(function(){
        var that = this;
        if(returnData){
            returnData.extend=[];
            prodDao.searchBizProdBaseExtend({prodId:prod_id,extendType:0}, function (err, rows) {
                if (err) {
                    logger.error(' getBizProdExtendOne ' + err.message);
                    throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    returnData.extend = rows;
                    that()
                }
            });
        }
    }).seq(function(){
        if(returnData){
            Seq(returnData.extend).seqEach(function(item,i){
                var that = this;
                item.itemArr=[];
                prodDao.searchBizProdBaseExtend({prodId:prod_id,extendType:1,parentId:item.id}, function (err, rows) {
                    if (err) {
                        logger.error(' getBizProdExtendTwo ' + err.message);
                        throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                    } else {
                        item.itemArr = rows;
                        that(null, i);
                    }
                });
            }).seq(function(){
                res.send(200,returnData);
            })
        }else{
            res.send(200,returnData);
        }

    })

}

function addBizProd(req, res, next) {
    var params=req.params;
    var extend = params.extend!=''?JSON.parse(params.extend):[];
    var productImgUrl;
    var prodLabel=[];
    Seq().seq(function(){

        var that = this;
        prodDao.addBizProd(req.params, function (error, rows) {
            if (error) {
                logger.error(' addBizProd ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else {
                productId = rows.insertId;
                that();
            }
        });
    }).seq(function() {//口味做法
        var that = this;
        Seq(extend).seqEach(function (item, i) {
            var that = this;
            var eParams = {
                prodId:productId,
                extendId:item.id,
                extendPrice:item.extend_price
            };
            prodDao.addBizProdExtend(eParams, function (err, rows) {
                if (err) {
                    logger.error(' addBizExtend ' + err.message);
                    throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    that(null, i);
                }
            });
        }).seq(function(){
            that();
        })
    }).seq(function(){//增加标签
        var that = this;
        prodDao.getBizProd(req.params.bizId,productId,function(err,rows){
            if (err) {
                logger.error(' addBizExtend ' + err.message);
                throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else {
                labelMain.labelMain(rows,function(err){
                    that();
                })
            }
        });
    }).seq(function(){
            var that = this;
            var imgList=[];
            if (req.files.image) {
                imagedao.save(null, req.files.image, {
                    biz_id: req.params.bizId,
                    prod_id: productId
                }, function (error, path) {
                    if (error) {
                        logger.error(' addBizProd ' + error.message);
                        throw sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                    }
                    productImgUrl = path;
                    that();
                });
            }else if(params.img_url){
                mdb.getDb(function (err, db) {
                    if (err) {
                        throw err;
                    }
                    db.createCollection('fs.files', function (err, collection) {
                        if (err) {
                            throw err;
                        }
                        // get meta data
                        var cursor=collection.find({"_id":params.img_url}).each( function (err, result) {
                            if (err){
                                throw err;
                            }
                            if(!result){
                                return false
                            }
                            resizeImg(result,{biz_id:req.params.bizId, prod_id:productId},function(error,path){
                                if (error) {
                                    logger.error(' addBizProd ' + error.message);
                                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                                }
                                productImgUrl = path;
                                that();
                            });
                        });
                    });
                });
            }
            else{
                logger.error(' addBizProd ' + ' fail ');
                res.send(200,{prodId: productId});
                next();
            }
        }).seq(function(){
            prodDao.updateProdImg(productId,productImgUrl,function(error,data){
                if(error){
                    logger.error(' addBizProd ' + error.message);
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                }
                logger.info(' addBizProd ' + 'success');
                res.send(200,{prodId: productId,productImgUrl:productImgUrl});
                next();
            });
        });

}

function resizeImg(metadata,bizProdParam,callback){
    var id=metadata._id;
    var name=metadata.filename;
    var type=metadata.contentType;
    var meta = {
        biz_id:bizProdParam.biz_id,
        prod_id:bizProdParam.prod_id,
        filename:metadata.metadata.filename
    };

    var image={};
    image.path = path.join(__dirname, '../tool/temp/' + id);
    image.name=name;
    image.type=type;

    imagedao.getImage(id,{size:'f'},function(err, stream){
        console.log(image.path);
        if (err){
            console.dir(err);
            return callback(err);
        }

        var fd=fs.createWriteStream(image.path,{flags:"w"}).on('error',function(err){
            if (err){
                console.dir(err);
                return callback(err);
            }
        });

        stream.on('error',function(err){
            if (err){
                console.dir(err);
                return callback();
            }
        });
        stream.on('end',function(err){
            if (err){
                console.dir(err);
                return callback();
            }

            fd.close(function(err){
                if (err){
                    console.dir(err);
                    return callback(err);
                }
                imagedao.save(null,image,meta,function(err,path){
                    if(err){
                        console.dir(err);
                        return callback(err);
                    }
                    return callback(err,path);
                });

            });
        });
        stream.pipe(fd);
    })
}

function updateBizProd(req, res, next) {
    var params=req.params;
    // var extend = params.extend!=''?JSON.parse(params.extend):[];
    var prodLabel = [];
    Seq().seq(function(){
        var that = this;
        prodDao.updateBizProd(params.bizId, params.id, params, function (error, rows) {
            if (error) {
                logger.error(' updateBizProd ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else {
                that();
            }
        });
    }).seq(function(){
        var that = this;
        Seq(params.label).seqEach(function (item, i) {
            var that = this;
            if(!item.labelId){
                item.labelKind=1;
                prodDao.addALlLabel(item,function(err,rows){
                    item.labelId=rows.insertId;
                    that(null, i);
                })
            }else{
                that(null, i);
            }
        }).seq(function(){
            that();
        });
    }).seq(function(){
        var that = this;
        prodDao.deleteBizProdBaseLabel(params.id,function(error,rows){
            if (error) {
                logger.error(' updateBizProd ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            }else{
                that()
            }
        })
    }).seq(function(){
        var that = this;
        Seq(params.label).seqEach(function (item, i) {
            var that = this;
            item.prodId=params.id;
            prodDao.addBizProdLabel(item, function (err, rows) {
                if (err) {
                    logger.error(' updateBizProdLabel ' + err.message);
                    throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    that(null, i);
                }
            });
        }).seq(function(){
            that();
        })
    }).seq(function(){
        var that = this;
        prodDao.deleteBizProdBaseExtend(params.id,function(error,rows){
            if (error) {
                logger.error(' updateBizProd ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            }else{
                that()
            }
        })

    }).seq(function(){
        Seq(params.extend).seqEach(function (item, i) {
            var that = this;
            var eParams = {
                prodId:params.id,
                extendId:item.id,
                extendPrice:item.extend_price
            }
            prodDao.addBizProdExtend(eParams, function (err, rows) {
                if (err) {
                    logger.error(' addBizExtend ' + err.message);
                    throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    that(null, i);
                }
            });
        }).seq(function(){
            logger.info(' updateBizProd ' + ' sucess ');
            res.send(200,  {succeed:true});
            next();
        })

    })
}

function deleteBizProd(req, res, next) {
    var params=req.params;

    var biz_id=req.params.bizId;
    var prod_id=req.params.id;
    prodDao.getBizProdBase(biz_id, prod_id, function (error, rows) {
        if (error) {
            logger.error(' deleteBizProd ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else {
            if (rows && rows.length > 0) {
                var prod=rows[0];
                Seq().seq(function(){
                    var that = this;
                    prodDao.deleteBizProdBaseExtend(prod_id,function(error,rows){
                        if (error) {
                            logger.error(' deleteBizProd ' + error.message);
                            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                        }else{
                            that()
                        }
                    });
                }).seq(function(){
                    var that = this;
                    prodDao.deleteBizProdBaseLabel(prod_id,function(error,rows){
                        if (error) {
                            logger.error(' deleteBizProd ' + error.message);
                            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                        }else{
                            that()
                        }
                    });
                }).seq(function(){
                    var that = this;
                    prodDao.deleteBizProd(prod,function(error,rows){
                        if (error) {
                            logger.error(' deleteBizProd ' + error.message);
                            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                        }
                        if (prod.img_url){
                            imagedao.deleteImg(prod.img_url,function (err,value){
                                if (err) {
                                    throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                                }else {
                                    logger.info(' deleteBizProd ' + ' success ');
                                    res.send(200,  {succeed:true});
                                    next();
                                }
                            });
                        }else {
                            logger.error(' deleteBizProd ' + ' success ');
                            res.send(200,  {succeed:true});
                            next();
                        }
                    });
                })
            }else{
                logger.error(' deleteBizProd ' + sysMsg.PROD_QUERY_NO_EXIST);
                next(sysError.InvalidArgumentError("",sysMsg.PROD_QUERY_NO_EXIST));
            }
        }
    });
}
function listBizProdCat(req, res, next) {

    prodDao.listBizProdCat(req.params, function (error, rows) {
        if (error) {
            logger.error(' listBizProdCat ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else {
            logger.info(' listBizProdCat ' + ' success ');
            if (rows && rows.length > 0) {
                res.send(200, rows);
                next();
            } else {
                res.send(200, null);
                next();
            }
        }
    });
}

function uploadImg(req,res,next){
    var params=req.params;

    var biz_id=req.params.bizId;
    var prod_id=req.params.prodId;
    prodDao.getBizProdBase(biz_id, prod_id, function (error, rows) {
        if (error) {
            logger.error(' uploadImg ' + error.message);
            return next( sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG));
        } else {
            if (rows && rows.length > 0) {
                var prod=rows[0];
                if (prod.img_url){
                    imagedao.deleteImg(prod.img_url,function(err){
                        //do nothing
                    });
                }
                imagedao.save(null,req.files.image, {biz_id:biz_id, prod_id:prod_id, user_id:null,file_id:prod.img_url},function(error, path) {
                    if (error) {
                        logger.error(' uploadImg ' + error.message);
                        return next(sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG));
                    }
                    if(path){
                        //save the path back to prod
                        prod.img_url=path;
                        prodDao.updateBizProd(prod.biz_id, prod.prod_id,prod,function(error, result){
                            if (error){
                                logger.error(' uploadImg ' + error.message);
                                return next(sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG));
                            }else{
                                logger.info(' uploadImg ' + ' success ');
                                res.send(200, path);
                                next();
                                return;
                            }
                        })
                    }
                    logger.info(' uploadImg ' + ' success ');
                    res.send(200, path);
                    next();
                });
            } else {
                logger.error(' uploadImg ' + sysMsg.PROD_QUERY_NO_EXIST);
                next(sysError.InvalidArgumentError("",sysMsg.PROD_QUERY_NO_EXIST));
            }
        }
    });

}

function getTopDishes(req, res, next) {
    var topDishes = [];
    var commentRatingArray = [];
    Seq().seq(function(){
        var that = this;
        prodDao.getTopDishes(req.params,function(error,rows){
            if (error) {
                logger.error(' getTopDishes ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else {
                topDishes = rows;
                that();
            }
        });
    }).seq(function(){

            Seq(topDishes).seqEach(function(prod,i){
                var that =  this;
                //get the product promotion info
                promoDao.listBizProdPromo({prodId: topDishes[i].prod_id,bizId:topDishes[i].biz_id}, function (err, rows) {
                    if (err) {
                        logger.error(' getTopDishes ' + err.message);
                        throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                    } else {
                        topDishes[i].promotionList = rows;
                        that(null,i);
                    }
                });

            }).seqEach(function(prod,i){
                    var that =  this;
                    //get the product comment and rating info
                    prodCommentDao.queryProductRating({productId: topDishes[i].prod_id}, function (err, rows) {
                        if (err) {
                            logger.error(' getTopDishes ' + err.message);
                            throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                        } else {
                            topDishes[i].commentRating = rows[0];
                            that(null,i);
                        }
                    });

                }).seqEach(function(prod,i){
                    var that =  this;
                    //get the product favoriate info
                    prodDao.getProductFavoriteCount({productId: topDishes[i].prod_id}, function (err, rows) {
                        if (err) {
                            logger.error(' getTopDishes ' + err.message);
                            throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                        } else {
                            topDishes[i].favorite = rows.favorite_count;
                            that(null,i);
                        }
                    });

                }).seq(function(){
                    logger.error(' getTopDishes ' + ' success ');
                    res.send(200,topDishes);
                    next();
                });
        });


}

//date format yyyy-mm-dd
function dateFormat(){
    var d = new Date();
    var utc8 = d.getTime();
    var newTime = new Date(utc8);
    var Year = newTime.getFullYear();
    var Month = newTime.getMonth()+1;
    var myDate = newTime.getDate();

    if(myDate<10){
        myDate="0"+myDate;
    }
    if(Month<10){
        Month="0"+Month;
    }
    var time = Year+"-"+Month+"-"+myDate;

    return time;
};

function getBizProdType(req, res , next){
    req.params.biz_id = req.params.bizId;
    prodTypeDao.searchBizProdType(req.params,function(error , rows){
        if (error) {
            logger.error(' getBizProdType ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else {
            logger.info(' getBizProdType ' + ' success ');
            if (rows && rows.length > 0) {
                var temy=rows;
                var pro_type=[];
                for(var i in temy){

                    var nowDate=dateFormat();

                    if(temy[i].start_time!==null){
                        var s=moment(temy[i].start_time, "YYYY-MM-DD HH:mm:ss Z");
                        temy[i].start_time=s.utc();
                    }
                    if(temy[i].end_time!==null){
                        var e=moment(temy[i].end_time, "YYYY-MM-DD HH:mm:ss Z");
                        temy[i].end_time=e.utc();
                    }

                    pro_type.push(temy[i]);
                }
                res.send(200, pro_type);
                next();
            } else {
                res.send(200,null);
                next();
            }
        }
    });
}
function addBizProdType(req, res , next){
    var params=req.params;


    Seq().seq(function() {
        var that = this;
        prodTypeDao.searchBizProdType(req.params,function(error,rows){
            if(error){
                logger.error(' addBizProdType ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            }
            if(rows && rows.length>0){
                logger.error(' addBizProdType ' + sysMsg.PROD_CREATE_TYPE_DUPLICATE);
                next( sysError.InvalidArgumentError("",sysMsg.PROD_CREATE_TYPE_DUPLICATE));
            }
            that();
        })
    }).seq(function(){
            prodTypeDao.addBizProdType(req.params,function(error,rows){
                if (error) {
                    logger.error(' addBizProdType ' + error.message);
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else{
                    logger.info(' addBizProdType ' + ' success ');
                    res.send(200, {prodTypeId :rows.insertId});
                    next();
                }
            })
        });

}

function updateBizProdType(req, res , next){
    var params=req.params;


    prodTypeDao.updateBizProdType(req.params, function(error , result){
        if(error){
            logger.error(' updateBizProdType ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        if(result.affectedRows<=0){
            logger.error(' updateBizProdType ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }else{
            logger.info(' updateBizProdType ' + ' success ');
            res.send(200,{success:true});
            next();
        }
    });
}

function delBizProdType(req, res , next){
    var params=req.params;


    prodTypeDao.delBizProdType(req.params, function(error , result){
        if(error){
            logger.error(' delBizProdType ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        if(result.affectedRows<=0){
            logger.error(' delBizProdType ' + 'failure');
            throw sysError.InternalError("",sysMsg.SYS_INTERNAL_ERROR_MSG);
        }else{
            logger.error(' delBizProdType ' + ' success');
            res.send(200,{success:true});
            next();
        }
    });

}

function updateProductActive(req, res , next){
    var params=req.params;

    prodDao.updateProductActive(req.params,function(error , result){
        if(error){
            logger.error(' updateProductActive ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        if(result.affectedRows<=0){
            logger.warn(' updateProductActive ' + 'failure');
            throw sysError.InternalError("",sysMsg.SYS_INTERNAL_ERROR_MSG);
        }else{
            logger.info(' updateProductActive ' + ' success ');
            res.send(200,{success:true});
            next();
        }
    });
}

function getProductCount(req, res , next){
    var params=req.params;

    prodDao.getProductCount(req.params,function(error,rows){
        if(error){
            logger.error(' getProductCount ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        logger.info(' getProductCount ' + ' success ');
        res.send(200,rows[0]);
        next();
    });

}

function getProductTypeCount(req, res , next){
    var params=req.params;

    prodDao.getProductTypeCount(req.params,function(error,rows){
        if(error){
            logger.error(' getProductTypeCount ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        logger.info(' getProductTypeCount ' + ' success ');
        res.send(200,rows[0]);
        next();
    });

}

function searchBizProdBase(req, res , next){
    var returnData=[];
    Seq().seq(function(){
        var that = this;
        prodDao.searchBizProdBase(req.params,function(error,rows){
            if(error){
                logger.error(' searchBizProdBase ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            }
            returnData=rows;
            that();
        });
    }).seq(function(){
        var that = this;
        Seq(returnData).seqEach(function (item, i) {
            var that = this;
            item.label=[];
            item.prod_label='';
            item.prod_label_lan='';
            prodDao.searchBizProdBaseLabel({prodId:item.prod_id}, function (err, rows) {
                if (err) {
                    logger.error(' searchBizProdBaseLabel ' + err.message);
                    throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    for(var k=0;k<rows.length;k++){
                        item.prod_label +=rows[k].label_name +'/';
                        item.prod_label_lan +=rows[k].label_name_lan +'/';
                    }
                    item.label = rows;
                    that(null, i);
                }
            });
        }).seq(function(){
            that()
        })
    }).seq(function(){
        var that = this;
        Seq(returnData).seqEach(function (item, i) {
            var that = this;
            item.extend=[];
            prodDao.searchBizProdBaseExtend({prodId:item.prod_id,extendType:0}, function (err, rows) {
                if (err) {
                    logger.error(' getBizProdExtendOne ' + err.message);
                    throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    item.extend = rows;
                    that(null, i);
                }
            });
        }).seq(function(){
            that()
        })

    }).seq(function(){
        Seq(returnData).seqEach(function (item, i) {
            var that = this;
            var prod = item;
            Seq(item.extend).seqEach(function(item,j){
                var that = this;
                item.itemArr=[];
                prodDao.searchBizProdBaseExtend({prodId:prod.prod_id,extendType:1,parentId:item.id}, function (err, rows) {
                    if (err) {
                        logger.error(' getBizProdExtendTwo ' + err.message);
                        throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                    } else {
                        item.itemArr = rows;
                        that(null, i);
                    }
                });
            }).seq(function(){
                that(null, i);
            });
        }).seq(function(){
            res.send(200,returnData);
        })
    })
}

function addProductComment(req, res , next){

    prodCommentDao.addProductComment(req.params,function(error,rows){
        if(error){
            logger.error(' addProductComment ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }

        logger.info(' addProductComment ' + ' success ');
        res.send(200,{id: rows.insertId});
        next();
    });
}

function queryCommentByProd(req, res , next){
    prodCommentDao.queryCommentByProd(req.params,function(error,rows){
        if(error){
            logger.error(' queryCommentByProd ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        logger.info(' queryCommentByProd ' + ' success');
        if(rows != null && rows.length>0){

            res.send(200,rows);
        }else{
            res.send(200,null);
        }
        next();
    });
}

function queryProductRating(req, res , next){
    prodCommentDao.queryProductRating(req.params,function(error,rows){
        if(error){
            logger.error(' queryProductRating ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        logger.info(' queryProductRating ' + ' success ');
        if(rows != null && rows.length>0){

            res.send(200,rows[0]);
        }else{
            res.send(200,null);
        }
        next();
    });
}


function queryCommentByCust(req, res , next){

    prodCommentDao.queryCommentByCust(req.params,function(error,rows){
        if(error){
            logger.error(' queryCommentByCust ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        logger.error(' queryCommentByCust ' + ' success ');
        res.send(200,rows);
        next();
    });
}

function updateProductComment(req, res , next){

    prodCommentDao.updateProductComment(req.params,function(error,rows){
        if(error){
            logger.error(' updateProductComment ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }

        if(rows.affectedRows<=0){
            logger.warn(' updateProductComment ' + ' failure');
            throw sysError.InternalError("",sysMsg.SYS_INTERNAL_ERROR_MSG);
        }else{
            logger.info(' updateProductComment ' + ' success');
            res.send(200,{success:true});
            next();
        }
    });
}

function updateCommentState(req, res , next){
    var tokenInfo = oAuthUtil.checkAccessToken(req);
    if(tokenInfo == null || req.params.custId != tokenInfo.id){
        logger.error(' updateCommentState ' + sysMsg.SYS_AUTH_TOKEN_ERROR);
        return next(sysError.NotAuthorizedError());
    }
    prodCommentDao.updateCommentState(req.params,function(error,rows){
        if(error){
            logger.error(' updateCommentState ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        if(rows.affectedRows<=0){
            logger.warn(' updateCommentState ' + ' failure');
            throw sysError.InternalError("",sysMsg.SYS_INTERNAL_ERROR_MSG);
        }else{
            logger.info(' updateCommentState ' + ' success ');
            res.send(200,{success:true});
            next();
        }
    });
}


function deleteProductComment(req, res , next){

    prodCommentDao.deleteProductComment(req.params,function(error,rows){
        if(error){
            logger.error(' deleteProductComment ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        if(rows.affectedRows<=0){
            logger.warn(' deleteProductComment ' + ' failure ');
            throw sysError.InternalError('',sysMsg.SYS_INTERNAL_ERROR_MSG);
        }else{
            logger.info(' deleteProductComment ' + ' success ');
            res.send(200,{success:true});
            next();
        }
    });
}


function getProductWithComment(req, res , next){
    var returnData = [];
    Seq().seq(function(){
        var that = this;
        prodDao.getProductWithComment(req.params,function(error,rows){
            if(error){
                logger.error(' getProductWithComment ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            }
            returnData=rows;
            that();
        });
    }).seq(function(){
        var that = this;
        Seq(returnData).seqEach(function (item, i) {
            var that = this;
            item.extend=[];
            prodDao.searchBizProdBaseExtend({prodId:item.prod_id,extendType:0}, function (err, rows) {
                if (err) {
                    logger.error(' getBizProdExtendOne ' + err.message);
                    throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    item.extend = rows;
                    that(null, i);
                }
            });
        }).seq(function(){
            that()
        })

    }).seq(function(){
        Seq(returnData).seqEach(function (item, i) {
            var that = this;
            var prod = item;
            Seq(item.extend).seqEach(function(item,j){
                var that = this;
                item.itemArr=[];
                prodDao.searchBizProdBaseExtend({prodId:prod.prod_id,extendType:1,parentId:item.id}, function (err, rows) {
                    if (err) {
                        logger.error(' getBizProdExtendTwo ' + err.message);
                        throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                    } else {
                        item.itemArr = rows;
                        that(null, i);
                    }
                });
            }).seq(function(){
                that(null, i);
            });
        }).seq(function(){
            res.send(200,returnData);
        })
    })

}

function getProductFavoriteCount(req, res , next){
    prodDao.getProductFavoriteCount(req.params,function(error,rows){
        if(error){
            logger.error(' getProductFavoriteCount ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        logger.info(' getProductFavoriteCount ' + ' success ');
        res.send(200,rows);
        next();
    });
}

function updateProdTypeOrder(req,res,next){
    var params=req.params;

    prodTypeDao.updateTypeOrderById(req.params,function(error,rows){
        if(error){
            logger.error(' updateProdTypeOrder ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        logger.info(' updateProdTypeOrder ' + 'success');
        res.send(200,rows.affectedRows>0?true:false);
        next();
    })
}

function updateProductSpecial(req,res,next){
    var params=req.params;
    /*var tokenInfo = oAuthUtil.checkAccessToken(req);
    if(tokenInfo == null || params.bizId != tokenInfo.id){
        logger.error(' updateProductSpecial ' + sysMsg.SYS_AUTH_TOKEN_ERROR);
        next(sysError.NotAuthorizedError());
        return;
    }*/
    prodDao.updateProductSpecial(req.params,function(error,rows){
        if(error){
            logger.error(' updateProductSpecial ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        logger.info(' updateProductSpecial ' + ' success ');
        res.send(200,rows.affectedRows>0?true:false);
        next();
    })
}

function getSpecialProduct(req,res,next){
    prodDao.getSpecialProduct(req.params,function(error,rows){
        if(error){
            logger.error(' getSpecialProduct ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        }
        logger.info(' getSpecialProduct ' + ' success ');
        res.send(200,rows);
        next();
    })
}

function addProd2Order(req,res,next){
    //TODO customer add product to order
    res.send(200,{success:true});
    next();
}

function getDayProdOrderStat (req,res,next){
    var params=req.params;

    bizStatDao.getDayProdOrderStat(req.params,function(error,rows){
        if(error){
            logger.error(' getDayProdOrderStat ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            logger.info(' getDayProdOrderStat ' + ' success ');
            res.send(200,rows);
            next();
        }
    });
}

function getWeekProdOrderStat (req,res,next){
    var params=req.params;

    bizStatDao.getWeekProdOrderStat(req.params,function(error,rows){
        if(error){
            logger.error(' getWeekProdOrderStat ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            logger.info(' getWeekProdOrderStat ' + ' success ');
            res.send(200,rows);
            next();
        }
    });
}

function getMonthProdOrderStat (req,res,next){
    var params=req.params;

    bizStatDao.getMonthProdOrderStat(req.params,function(error,rows){
        if(error){
            logger.error(' getMonthProdOrderStat ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            logger.info(' getMonthProdOrderStat ' +  ' success ');
            res.send(200,rows);
            next();
        }
    });
}

function getBizTopOrderProd (req,res,next){
    var params=req.params;

    bizStatDao.getBizTopOrderProd(req.params,function(error,rows){
        if(error){
            logger.error(' getBizTopOrderProd ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            logger.info(' getBizTopOrderProd ' + ' success ');
            res.send(200,rows);
            next();
        }
    });
}

function queryBizAllProdRel(req,res,next){
    var params=req.params;


    prodCustRelDao.queryBizAllProdRel(req.params,function(error,rows){
        if(error){
            logger.error(' queryBizAllProdRel ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            logger.info(' queryBizAllProdRel ' + ' success ');
            res.send(200,rows);
            next();
        }
    });

}


function queryBizProdComment(req,res,next){
    var params=req.params;

    prodCommentDao.queryBizProdComment(req.params,function(error,rows){
        if(error){
            logger.error(' queryBizProdComment ' + error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            logger.info(' queryBizProdComment ' + ' success ');
            res.send(200,rows);
            next();
        }
    });

}

function clearProdImg(req,res,next){
    var params=req.params;

    var biz_id=req.params.bizId;
    var prod_id=req.params.prodId;
    prodDao.getBizProdBase(biz_id, prod_id, function (error, rows) {
        if (error) {
            logger.error(' clearProdImg ' + error.message);
            return next( sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG));
        } else {
            if (rows && rows.length > 0) {
                var prod=rows[0];
                if (prod.img_url){
                    imagedao.deleteImg(prod.img_url,function(err){

                        prodDao.updateProdImg(prod_id ,null ,function(error,result){
                            if(error){
                                logger.error(' clearProdImg ' + error.message);
                                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                            }else{
                                if(result.affectedRows>0){
                                    logger.info(' clearProdImg ' + 'success');
                                    res.send(200,{success:true});
                                    next();
                                }else{
                                    logger.warn(' clearProdImg ' + ' failure ');
                                    res.send(200,{success:false});
                                    next();
                                }
                            }
                        })
                    });
                }else{
                    logger.info(' clearProdImg ' + ' success ');
                    res.send(200,{success:true});
                    next();
                }

            } else {
                logger.error(' clearProdImg ' + sysMsg.PROD_QUERY_NO_EXIST);
                next(sysError.InvalidArgumentError("",sysMsg.PROD_QUERY_NO_EXIST));
            }
        }
    });
}

function getParentProd(req,res,next){
    var params = req.params;
    prodDao.getWechatProd(params,function(err,rows){
        if(err){
            throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            logger.info(' updateBizMobileSound ' +'success');
            res.send(200,rows);
            next();
        }
    })
}
function getProdLabel(req,res,next){
    var params = req.params;
    prodDao.getProdLabel(params,function(err,rows){
        if(err){
            throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            logger.info(' getProdLabel ' +'success');
            res.send(200,rows);
            next();
        }
    })
}
function getProductWithCommentLabel(req,res,next){
    var params = req.params;
    prodDao.getProductWithCommentLabel(params,function(err,rows){
        if(err){
            throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            logger.info(' getProductWithCommentLabel ' +'success');
            res.send(200,rows);
            next();
        }
    })
}

function getAllLabel(req,res,next){
    var params = req.params;
    prodDao.getAllLabel(params,function(err,rows){
        if(err){
            throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            logger.info(' getAllLabel ' +'success');
            res.send(200,rows);
            next();
        }
    })
}

function getBizMenu(req,res,next) {
    try{
        var params=req.params;
        prodDao.getBizMenu(params,function (err,rows) {
            if(err){
                logger.error(' getBizMenu ' + err.message);
                throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            }else{
                logger.info('getBizMenu' + 'success');
                res.send(200,{succeed:true,result:rows});
                next();
            }
        })
    }catch(err){
        logger.error(' getBizMenu ' + err.message);
        throw sysError.InternalError(err.message,err);
    }
}
function addBizMenu(req, res, next) {
    try {
        var params = req.params;
        prodDao.addBizMenu(params, function (err, rows) {
            if (err) {
                logger.error(' addBizMenu ' + err.message);
                next(sysError.InvalidArgumentError("",err.message));
            } else {
                var temy = params;
                temy.menu_id = rows.insertId;
                res.send(200,{succeed:true,result:temy});
                next();
            }
        })
    } catch (err) {
        logger.error(' addBizMenu ' + err.message);
        throw sysError.InternalError(err.message, err);
    }
}

function updateBizMenu(req,res,next){
    try{
        var params=req.params;
        prodDao.updateBizMenu(params,function (err,rows) {
            if(err){
                logger.error(' updateBizMenu ' + err.message);
                throw  sysError.InternalError(err.message, err);
            } else {
                res.send(200,{succeed:true,result:params});
                next();
            }
        })

    }catch(err){
        logger.error(' updateBizMenu ' + err.message);
        throw sysError.InternalError(err.message, err);
    }
}

function deleteBizMenu(req,res,next) {
    try{
        var that=this;
        var params=req.params;
        prodDao.deleteBizMenu(params,function(err,rows){
            if(err){
                logger.error(' deleteBizMenu ' + err.message);
                next(sysError.InvalidArgumentError("",err.message));
            }else {
                res.send(200,{succeed:true});
                next();
            }
        })
    }catch(err){
        logger.error(' deleteBizMenu ' + err.message);
        throw sysError.InternalError(err.message, err);
    }
}



function baiduTranslate(req,res,next){
   try{
       var params=req.params;
       var appid = '20180702000181990';
       var key = 'xAZ8xIp33PIoOvbwhnG8';
       var salt = (new Date).getTime();
       var query = params.name;
       var from = 'auto';//zh
       var to = '';//en
       var str1 = appid + query + salt +key;
       var sign = MD5(str1);
       var url = 'http://api.fanyi.baidu.com/api/trans/vip/translate';
       if(params.lang==='zh-cn'){
           to='en';
       }else if(params.lang==='en-us'){
           to='zh';
       }
       var paramsTo={
           q: params.name,
           appid: appid,
           salt: salt,
           from: from,
           to: to,
           sign: sign
       };
       var paramsStr = prodDao.objToStr(paramsTo);
       //调百度翻译接口
       request.get(url+paramsStr,function(error,response,body){
            if(response.statusCode==200){
                var data = JSON.parse(body);
                if(data.error_code){
                    logger.info("baiduTranslate fail：" + data);
                    res.send(500,{succeed:false,result:data});
                    next();
                }else{
                    logger.info("baiduTranslate succeed：" + data)
                    res.send(200,{succeed:true,result:{dst:data.trans_result[0].dst}});
                }
            }
       })
   }catch(error){
       logger.info('baiduTranslate catch error:'+error);
       throw sysError.InternalError(error.message, error);
   }

}

///--- Exports
module.exports = {
    listBizProd: listBizProd,
    getBizProd: getBizProd,
    addBizProd: addBizProd,
    updateBizProd: updateBizProd,
    deleteBizProd : deleteBizProd,
    getTopDishes : getTopDishes,
    listBizProdCat: listBizProdCat,
    uploadImg: uploadImg,
    getBizProdType :getBizProdType,
    addBizProdType : addBizProdType,
    updateBizProdType : updateBizProdType,
    delBizProdType : delBizProdType,
    updateProductActive :updateProductActive,
    getProductCount : getProductCount ,
    getProductTypeCount : getProductTypeCount,
    searchBizProdBase : searchBizProdBase,
    addProductComment : addProductComment ,
    queryCommentByProd : queryCommentByProd,
    queryCommentByCust : queryCommentByCust,
    queryProductRating : queryProductRating,
    updateCommentState : updateCommentState,
    updateProductComment : updateProductComment,
    deleteProductComment : deleteProductComment,
    getProductWithComment : getProductWithComment,
    getProductFavoriteCount : getProductFavoriteCount,
    updateProdTypeOrder : updateProdTypeOrder,
    getSpecialProduct : getSpecialProduct,
    updateProductSpecial : updateProductSpecial,
    addProd2Order : addProd2Order,
    getDayProdOrderStat : getDayProdOrderStat,
    getWeekProdOrderStat : getWeekProdOrderStat,
    getMonthProdOrderStat : getMonthProdOrderStat,
    getBizTopOrderProd : getBizTopOrderProd,
    queryBizProdComment :  queryBizProdComment ,
    queryBizAllProdRel : queryBizAllProdRel ,
    clearProdImg : clearProdImg,
    getParentProd: getParentProd,
    getProdLabel:getProdLabel,
    getProductWithCommentLabel:getProductWithCommentLabel,
    getAllLabel:getAllLabel,
    getBizMenu:getBizMenu,
    addBizMenu:addBizMenu,
    updateBizMenu:updateBizMenu,
    deleteBizMenu:deleteBizMenu,
    baiduTranslate:baiduTranslate
};

