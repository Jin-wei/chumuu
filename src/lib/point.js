var pointdao = require('./dao/pointdao.js');
var sysMsg = require('./util/SystemMsg.js');
var sysError = require('./util/SystemError.js');
var serverLogger = require('./util/ServerLogger.js');
var logger = serverLogger.createLogger('Point.js');

// everyone
function listPoint(req, res, next) {
	pointdao.search({}, function(error, rows) {
	if (error) {
        logger.error(' listPoint ' + error.message);
        throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
	} else {
        logger.info(' listPoint ' + 'success');
		res.send(200, rows);
		next();
	}}
	);
}

// everyone
function getPoint(req, res, next) {
	pointdao.findById(req.params.id, function(error, rows) {
				if (error) {
                    logger.error(' getPoint ' + error.message);
                    throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
				} else {
                    logger.info(' getPoint ' + 'success');
					if (rows && rows.length > 0) {
						res.send(200, rows[0]);
						next();
					} else {
						res.send(200,null);
						next();
					}
				}
			});
}

// /--- Exports

module.exports = {
	listPoint : listPoint,
	getPoint : getPoint
};