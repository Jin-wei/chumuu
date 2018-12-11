var gm = require('gm').subClass({ imageMagick: true });
var fs = require('fs');

function resize(image, outFile, height, width,callback){
    gm(image.path).strip().resize(width,height,"^").gravity("Center").crop(width,height).write(outFile, function (err){
        if (err) {
            throw err;
        }else{
            callback();
        }
    });
}

function compress(image,outFile){
    gm(image.path).strip().compress("jpeg").quality(75).write(outFile,function (err){
        if (err) {
            throw err;
        }else{
            //
        }
    });
}

function strip(image,outFile) {
    gm(image.path).strip().write(outFile, function (err) {
        if (err) {
            throw err;
        } else {
            //
        }
    });
}


function convert1(image,outFile){
    gm(image.path).format(function(err, value){
            if (err){
                throw err;
            }
            else {
                console.log("original type:" + value);
            }
        }
    );

    gm(image.path).setFormat("jpeg").write(outFile,function(err){
            if (err){
                throw err;
            }
            else {
                console.log(outFile);
                gm(outFile).format(function(err, value){
                        if (err){
                            throw err;
                        }
                        else {
                            console.log("new type:" + value);
                        }
                    }
                );
            }
        }
    );

    gm(image.path).identify(function(err, value){
            if (err){
                throw err;
            }
            else {
                console.log("original identity:" + value.toString());
            }
        }
    );
}

function convert(image,outFile){
    console.log(image.path);

    fs.stat(image.path,function(err, value){
            if (err){
                throw err;
            }
            else {
                console.log("original size:" + value['size']);
            }
        }
    );

   gm(image.path).strip().compress("jpeg").quality(90).write(outFile, function (err) {
        if (err) {
            throw err;
        } else {
            gm(outFile).filesize(function(err,value){
                   console.log("stripped size:"+ value);
            })
            //
            var mfile={};
            mfile.path=outFile;
            resize(mfile, outFile+"m", 240, 240,function(){
                gm(outFile+'m').filesize(function(err,value){
                    console.log("medium size:"+ value);
                })
               /* gm(outFile+'m').strip().compress("jpeg").quality(90).write(outFile+'mc', function (err){
                    if (err) {
                        throw err;
                    } else {
                        gm(outFile + 'mc').filesize(function (err, value) {
                            console.log("further compress medium size:" + value);
                        })
                    }
                })*/
            });
        }
    });
}

var image={};
//image.path=__dirname + '/temp/Funny.gif';

image.path=__dirname + '/temp/logo_4.jpg';
//image.path=__dirname + '/temp/m.png';
//image.path=__dirname + '/temp/yslow.txt';
//
var l_outFile=__dirname + '/temp/logo-favicon.ico';
//var m_outFile=__dirname + '/temp/result_m.jpg';
//var s_outFile=__dirname + '/temp/result_s.jpg';

//resize(image,l_outFile,240,240);

//convert(image,l_outFile);
//strip(image,l_outFile);
//compress(image,l_outFile);
//resize(image,l_outFile,240,240);
//resize(image,s_outFile,80,80);
resize(image,l_outFile,16,16,function(){});