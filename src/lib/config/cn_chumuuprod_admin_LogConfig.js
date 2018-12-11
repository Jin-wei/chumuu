var logLevel = 'DEBUG';
var loggerConfig = {
    appenders: [
        { type: 'console' },
        {
            "type": "file",
            "filename": "/var/log/chumuuadmin/application.log",
            "maxLogSize": 2048000,
            "backups": 10
        }
    ]
}
module.exports = {
    loggerConfig : loggerConfig,
    logLevel : logLevel
}
