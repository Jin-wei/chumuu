/**
 * Created by Josh on 8/18/15.
 */

var sysMsg = require('./util/SystemMsg.js');
var sysError = require('./util/SystemError.js');
var serverLogger = require('./util/ServerLogger.js');
var logger = serverLogger.createLogger('rrkd.js');

function getRrkdTestData(req, res, next) {
    logger.info(' getRrkdTestData ' + 'success');
}

// /--- Exports

module.exports = {
    getRrkdTestData : getRrkdTestData
};