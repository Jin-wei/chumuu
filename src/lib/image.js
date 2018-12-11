var imagedao = require('./resource/imagedao.js');
var fs = require('fs');
var sysMsg = require('./util/SystemMsg.js');
var sysError = require('./util/SystemError.js');
var serverLogger = require('./util/ServerLogger.js');
var logger = serverLogger.createLogger('Image.js');

//everyone
function serveImg(req, res, next) {
    var id = req.params.id;
    var size=req.params.size;

    imagedao.getMetaData(id, {size:size}, function (err, col) {
        if (err || !col) {
            logger.error(' serveImg ' + id +sysMsg.IMG_QUERY_NO_EXIST);
            //res.send(304);
            return next(sysError.ResourceNotFoundError("",sysMsg.IMG_QUERY_NO_EXIST));
        }

        var etag = req.headers['if-none-match'];
        if (etag && col.md5 && etag == col.md5) {
            //logger.warn(' serveImg ' + sysMsg.IMG_QUERY_NO_EXIST);
            res.send(304);
            return next();
        }
        imagedao.getImage(id, {size:size}, function (err, fstream) {
            if (err) {
                logger.error(' serveImg ' + err.message);
                return next( sysError.ResourceNotFoundError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG));

            }

            //   fstream.once('open', function (fd) {
            //console.log('================start write to res=============');
            //console.dir(col);
            //catch
            res.cache({maxAge: 31536000});
            //res.set("cache-control","no-cache");
            res.set('content-type', col.contentType);
            res.set('last-modified', col.uploadDate);
            res.set('etag', col.md5);
            res.set('content-length', col.length);
            res.writeHead(200);
            //console.log('============header=======');
            //console.log('Content-Length:'+col.length);
            //console.dir(res);
            fstream.pipe(res);
            fstream.once('end', function () {
                logger.info(' serveImg ' + 'success');
                //console.log('=============got end=============');
                next(false);
            });
            //       });
        });
    });
}

///--- Exports
module.exports = {
    serveImg: serveImg
};