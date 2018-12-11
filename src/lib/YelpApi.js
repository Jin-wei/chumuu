/**
 * Created by Ling xue on 14-6-23.
 */

var yelpOauth = require('./resource/YelpOAuth.js');
var sysError = require('./util/SystemError.js');
var sysMsg = require('./util/SystemMsg.js');
var serverLogger = require('./util/ServerLogger.js');
var logger = serverLogger.createLogger('YelpApi.js');


function getYelpBizInfo(req, res, next){
    var params=req.params;
    yelpOauth.getYelpBizInfo(params,function(error,data){
        if(error){
            logger.error(' getYelpBizInfo :'+ error.message);
            throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            /*if(data && data.image_url){
                //data.image_url = data.image_url.replace('http://','https://');
                data.rarting_img_url = data.image_url.replace('http://','https://');
                data.rarting_img_url_large = data.rarting_img_url_large.replace('http://','https://');
                data.rarting_img_url_small = data.rarting_img_url_small.replace('http://','https://');
            }*/
            res.send(200, data);
            next();
        }
    });
}

module.exports = {
    getYelpBizInfo : getYelpBizInfo
}