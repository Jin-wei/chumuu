/**
 * Created by ling xue on 14-6-20.
 */

var querystring = require('querystring');
var OAuth = require('oauth').OAuth;
var sysConfig = require('../config/SystemConfig.js');
var oauthConfig = sysConfig.getYelpOauthOptions();

var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('YelpOAuth.js');

var Client = function(oauth_config) {
    this.oauthToken = oauth_config.token;
    this.oauthTokenSecret = oauth_config.token_secret;

    this.oauth = new OAuth(
        null,
        null,
        oauth_config.consumer_key,
        oauth_config.consumer_secret,
        oauth_config.version || "1.0",
        null,
        'HMAC-SHA1'
    );

    return this;
};

var base_url = oauthConfig.base_url;

Client.prototype.get = function(resource, params, callback) {
    return this.oauth.get(
        base_url + resource + '?' + querystring.stringify(params),
        this.oauthToken,
        this.oauthTokenSecret,
        function(error, data, response) {
            if(!error) data = JSON.parse(data);
            callback(error, data, response);
        }
    );
}


Client.prototype.search = function(params, callback) {
    return this.get('search', params, callback);
}


Client.prototype.business = function(id, callback) {
    return this.get('business/' + id, null, callback);
}

var yelp = new Client(oauthConfig);

function getYelpBizInfo(params ,callback){
    yelp.business(params.yelpId, function(error, data) {
        if(error){
            logger.error(' getYelpBizInfo '+ error.message);
        }else{
            logger.info('getYelpBizInfo ' + params.yelpId);
        }
        callback(error,data);
    });

}
// @see http://www.yelp.com/developers/documentation/v2/authentication
module.exports = {
    getYelpBizInfo : getYelpBizInfo
};
