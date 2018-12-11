var fs = require('fs');
var mdb = require('./../lib/resource/resourcedb.js');
var imgdao = require('./../lib/resource/imagedao.js');

var Seq = require('seq');

var c=0;
var imgList=[];
function batchResize() {
    mdb.getDb(function (err, db) {
        if (err) {
            //db.close();
            throw err;
        }
        db.createCollection('fs.files', function (err, collection) {
            if (err) {
                // db.close();
                throw err;
            }
            // get meta data
            var cursor=collection.find().each( function (err, result) {
                //comment out all close, it will close all connections in the pool
                //db.close();
                if (err){
                    throw err;
                }
                if(result !=null){
                    imgList.push(result);
                }
                //if (imgList.length>=10){
                if (result==null){
                    console.log("total image:"+imgList.length);
                    Seq(imgList).seqEach(function (img) {
                        resize(img,this);
                    });
                }
            });

        });
    });
}

function printMeta(meta){
    console.dir(meta);
}

function resizeImg(metadata,callback){
    var id=metadata._id;
    var name=metadata.filename;
    var type=metadata.contentType;
    var meta=metadata.metadata;

    var image={};
    image.path=__dirname+'/temp/'+id;
    image.name=name;
    image.type=type;

    imgdao.getImage(id,{size:'f'},function(err, stream){
        console.log(image.path);
        if (err){
            console.dir(err);
            return callback();
        }

        var fd=fs.createWriteStream(image.path,{flags:"w"}).on('error',function(err){
            if (err){
                console.dir(err);
                return callback();
            }
        });
            stream.pipe(fd).on('error',function(err){
                if (err){
                    console.dir(err);
                    return callback();
                }
            });
            stream.on('error',function (err){
                if (err){
                    console.dir(err);
                    return callback();
                }
            });
            stream.once('end', function (err){
                if (err){
                    console.dir(err);
                    return callback();
                }
                fd.close(function(err){
                    if (err){
                        console.dir(err);
                        return callback();
                    }
                    imgdao.save(id,image,meta,function(err){
                        if(err){
                            console.dir(err);
                            return callback();
                        }
                        c++;
                        console.log("resize count: "+c);
                        return callback();
                });

                });
            });
    })
}

function resize(metadata,callback){
    if (metadata){
        var id=metadata._id;
        if (id && id.toString().indexOf('_m')<0 && id.toString().indexOf('_s')<0){
            //printMeta(metadata);
            resizeImg(metadata,callback);
        }else{
            callback();
        }
    }else{
        callback();
    }
}


batchResize();

