var fs = require('fs');
var mdb = require('./resourcedb');
var Seq = require('seq');

var ObjectID = require('mongodb').ObjectID,
    GridStore = require('mongodb').GridStore
var gm = require('gm').subClass({ imageMagick: true });

var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('ImageDao.js');

var f_width=640,f_height=640,m_width=240,m_height=240,s_width=80,s_height=80,quality=80;


function getFileId(id, options) {
    var fileId = id;
    if (options.size==m_width){
        fileId=fileId+"_m";
    }else if(options.size==s_width){
        fileId=fileId+"_s";
    }
    else if ('s' == options.size) {
        fileId = fileId +'_s';
    }
    else if ('m' == options.size) {
        fileId = fileId +'_m';
    }
    return fileId;
}

function getMetaData(id, options, callback) {
    var fileId = getFileId(id, options);
    mdb.getDb(function (err, db) {
        if (err) {
            logger.error(' getMetaData ' + err.message);
            // db.close();
            return callback(err, null);
        }
        db.createCollection('fs.files', function (err, collection) {
            if (err) {
                logger.error(' getMetaData ' + err.message);
                return callback(err, null);
            }
            // get meta data
            collection.findOne({_id: fileId}, function (err, result) {
                return callback(err, result);
            });
        });
    });
}


function getImage(id, options, callback) {
    var fileId = getFileId(id, options);
    mdb.getDb(function (err, db) {
        if (err) {
            logger.error(' getImage ' + err.message);
            // db.close();
            return callback(err, null);
        }

        var gridStore = new GridStore(db, fileId, '', "r");
        gridStore.open(function (err, gridStore) {

            if (err) {
                logger.error(' getImage ' + err.message);
                return callback(err, null);
            }
            // Grab the read stream
            var stream = gridStore.stream(true).on('error',function(err){
                logger.warn(' getImage ' + err.message);
                return callback(err, null);
            });
            logger.debug(' getImage ' + id +' success');
            // db.close();
            return callback(null, stream);
            // var stream = gridStore.stream(true);
            //
            // stream.on("error", function() {
            //     logger.warn(' getImage ' + err.message);
            //     return callback(err, null);
            // });
            //
            // stream.on("end", function() {
            //     return callback(null, stream);
            // });
            // stream.on("close", function() {
            //     // db.close();
            // });

        });
    });
}

function _saveAll(id, metadata,image,outFile, db,callback){
        var gridStore = new GridStore(db, id, id+".jpeg", 'w', {content_type: image.type, metadata: metadata});
        gridStore.open(function (err, gridStore) {
            // Write the file to gridFS
            gridStore.writeFile(outFile, function (err, doc) {
                if (err) {
                    logger.error(' _saveAll ' + err.message);
                    return callback(err,id);
                } else {
                    fs.unlink(outFile, function (err) {
                        return callback(null, id);
                    });
                }
            });
        })
}

function saveFull(id, metadata, image, db, callback) {
    //change the file id for medium
    var fileId = getFullFileId(id);
    var outFile = getFullFilePath(image.path);
    //no cropping maintain original aspect ratio
    //> only shrink larger
    gm(image.path).resize(f_width,f_height,">").write(outFile, function (err){
        if (err) {
            logger.error(' saveFull ' + err.message);
            return callback(err,null);
        }
        return _saveAll(fileId,metadata,image,outFile,db,callback);
    });
}

function _format(image,callback){
    var out=image.path+"_jpeg";

    gm(image.path).format(function(err, type){
            if (err){
                logger.error(' _format ' + err.message);
                return callback(err);
            }
            if ('JPEG'!= type){
                //set format
                gm(image.path).setFormat("jpeg").write(out,function(err){
                        if (err){
                            logger.error(' _format ' + err.message);
                            return callback(err);
                        }
                        else {
                            var oldImage=image.path;
                            image.type="image/jpeg";
                            //special handle for multiple page gif file
                            if (fs.existsSync(out)){
                                image.path=out;
                            }else{
                                image.path=out+"-0";
                            }

                            fs.unlink(oldImage,function(err){
                                if (err) {
                                    logger.error(' _format ' + err.message);
                                }
                                return callback(err);
                            })

                        }
                    }
                );
            }else{
                logger.info(' _format ' + 'success');
                return callback();
            }
        }
    );
}

function _strip(image,callback){
    var out=image.path+"_striped";
    gm(image.path).strip().write(out,function(err){
            if (err){
                logger.error(' _strip ' + err.message);
                return callback(err);
            }else{
                var oldImage=image.path;
                image.path=out;
                fs.unlink(oldImage,function(err){
                    if (err) {
                        logger.error(' _strip ' + err.message);
                    }
                    return callback(err);
                })

            }
        }
    );
}

function _compress(image,callback){
    var originalSize;
    var newSize;
    var originalFile=image.path;
    var outFile=image.path+"_temp";
    Seq().seq(function(){
        var that=this;
        fs.stat(image.path,function(err, value){
                originalSize=value['size'];

                that(err);
        }
    );}).seq(function(){
        var that=this;
        gm(image.path).compress("jpeg").quality(quality).write(outFile, function (err) {
                if (err){
                    logger.error(' _compress ' + err.message);
                    that(err);
                }else {
                    fs.stat(outFile, function (err, value) {
                        newSize = value['size'];

                        that(err);
                    })
                }
        })}).seq(function(){
        var that=this;

            if (newSize<originalSize){
                //take the new one
                image.path=outFile;
                fs.unlink(originalFile,function(err){
                        that(err);
                });
            }else{
                //keep the original one
                fs.unlink(outFile,function(err){

                        that(err);
                });
            }
        }).seq(function(){
            logger.info(' _compress ' + 'success');
            return callback();
    }).catch(function (err){
            if (err) {
                logger.error(' _compress ' + err.message);
            }
            return callback(err);
    })
}

//call before save any image
function preImage(image,callback){
    Seq().seq(function(){

        _format(image,this);
    }).seq(function(){

        _strip(image,this);
    }).seq(function(){

        _compress(image,this);
    }).seq(function(){
        callback();
    }).catch(function (err){
        callback(err);
    })
}

function getFullFileId(id){
    return id;
}

function getMediumFileId(id){
    return id+'_m';
}

function getSmallFileId(id){
    return id+'_s';
}

function getFullFilePath(path){
    return path+ '_f';
}

function getMediumFilePath(path){
    return path+'_m';
}

function getSmallFilePath(path){
    return path+'_s';
}

function saveMedium(id, metadata, image, db, callback) {
    //change the file id for medium
    var fileId = getMediumFileId(id);
    var outFile = getMediumFilePath(image.path);
    //crop it
    gm(image.path).resize(m_width,m_height,"^").gravity("Center").crop(m_width,m_height).write(outFile, function (err){
        if (err) {
            logger.error(' saveMedium ' + err.message);
            return callback(err,null);
        }
        return _saveAll(fileId,metadata,image,outFile,db,callback);
    });
}

function saveSmall(id, metadata, image, db, callback) {
    //change the file id for medium
    var fileId = getSmallFileId(id);
    var outFile = getSmallFilePath(image.path);
    gm(image.path).resize(s_width,s_height,"^").gravity("Center").crop(s_width,s_height).write(outFile, function (err){
        if (err) {
            logger.error(' saveMedium ' + err.message);
            return callback(err,null);
        }
        return _saveAll(fileId,metadata,image,outFile,db,callback);
    });
}

/*function _squareIt(image,callback){
    gm(image.path).size(function(err, size){
        if(err){
            callback(err);
        }
        var s=size.width;
        if (size.height<size.width){
            s=size.height;
        }
        gm(image.path).gravity("Center").crop(s,s).write(image.path, function (err){
            if (err) {
                callback(err);
            }else{
                callback(null);
            }
        });
    });
}*/

function save(id, image, options, callback) {
    if (!image) {
        logger.warn(' save ' + 'Image is not found');
        return callback(new Error("Image is not found") , null);
    }

    mdb.getDb(function (err, db) {
        if (err) {
            logger.warn(' save ' + err.message);
            callback(err, null);
            return;
        }
        // file ID, if it has file id override the old one
        var fileId;
        if (id) {
            fileId = id;

        } else {
            fileId = new ObjectID().toHexString();
        }

        var metadata = {};
        metadata.filename = image.name;
        if (options) {
            if (options.biz_id) {
                metadata.biz_id = options.biz_id;
            }
            if (options.prod_id) {
                metadata.prod_id = options.prod_id;
            }
            if (options.promo_id) {
                metadata.promo_id = options.promo_id;
            }
            if (options.coupon_id) {
                metadata.coupon_id = options.coupon_id;
            }
            if (options.user_id) {
                metadata.user_id = options.user_id;
            }
            if (options.cust_id) {
                metadata.cust_id = options.cust_id;
            }
        }

        Seq().seq(function(){

             preImage(image,this);
           })
            .seq(function () {

                 saveFull(fileId, metadata, image, db, this)

            })
            .seq(function () {
                saveMedium(fileId, metadata, image, db, this)
            })
            .seq(function () {
                saveSmall(fileId, metadata, image, db, this)
            })
            .seq(function () {
                db.close();
                fs.unlink(image.path, function (err) {
                   return callback(err, fileId);
                });
            })
            .catch(function (err) {
                fs.unlink(image.path, function (error) {
                   return callback(err, fileId);
                });
            });
    });
}
function deleteFull(fileID,db,callback){
    _delete(getFullFileId(fileID),db,callback);
}

function deleteMedium(fileID,db,callback){
    _delete(getMediumFileId(fileID),db, callback);
}

function deleteSmall(fileID,db,callback){
    _delete(getSmallFileId(fileID),db,callback);
}

function  _delete(id, db, callback){
    var gridStore = new GridStore(db, id, '', "r");
    gridStore.open(function (err, gridStore) {
        if (gridStore){
            gridStore.unlink(callback);
    }else{
        return callback(null, false);
    }
    });
}

function deleteImg(id, callback) {
    mdb.getDb(function (err, db) {
        if (err) {
            logger.error(' deleteImg ' + err.message);
            callback(err, null);
            return;
        }
        Seq().par(function () {
            deleteFull(id,db, this)
        })
            .par(function () {
                deleteMedium(id,db, this)
            })
            .par(function () {
                deleteSmall(id, db, this)
            })
            .seq(function () {
               logger.info(' deleteImg ' + 'success');
               return callback(null);
            })
            .catch(function (err) {
                if (err) {
                    logger.error(' deleteImg ' + err.message);
                }
                return callback(err);
            });
    });
}

function saveImage(image, options, callback) {
        if (!image) {
            logger.warn(' saveImage ' + 'Image is not found');
            return callback(new Error("Image is not found") , null);
        }

        mdb.getDb(function (err, db) {
            if (err) {
                logger.warn(' saveImage ' + err.message);
                callback(err, null);
                return;
            }
            // file ID, if it has file id override the old one
            var fileId = new ObjectID().toHexString();

            var metadata = {};
            metadata.filename = image.name;
            if (options) {
                if (options.bizId) {
                    metadata.bizId = options.bizId;
                }
                if (options.userId) {
                    metadata.userId = options.userId;
                }
                if (options.custId) {
                    metadata.custId = options.custId;
                }
            }

            Seq().seq(function(){

                preImage(image,this);
            }).seq(function () {
                    saveMedium(fileId, metadata, image, db, function(err,result){
                        if(err){
                            if (err) {
                                logger.error(' saveImage ' + err.message);
                                return callback(err, null);
                            }
                        }else{
                            callback(null,fileId)
                        }
                    });

                })
        });
}
module.exports = {
    save: save,
    saveImage : saveImage ,
    getMetaData: getMetaData,
    getImage: getImage,
    deleteImg: deleteImg
}