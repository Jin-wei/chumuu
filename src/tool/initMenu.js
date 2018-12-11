
var menuMain = require('../lib/util/bizMenu/menuMain.js');
var mysql = require('mysql');
var Seq = require('seq');
var db = require('../lib/db.js');
var serverLogger = require('../lib/util/ServerLogger.js');
var logger = serverLogger.createLogger('initMenu.js');
var sysError = require('../lib/util/SystemError.js');
(function insertMenu(){
    var bizUserArr = [];
    Seq().seq(function(){
        var that = this;
        var query = "SELECT * FROM business";
        db.dbQuery(query,[],function(error,rows){
            bizUserArr = rows;
            that()
        })
    }).seq(function(){
        menuMain.initMenu(bizUserArr,function(error){
            if(error){
                logger.error(' initMenu :' + error.message);
                throw sysError.InternalError(error.message, "error");
            }else{
                process.exit(0);
            }
        })
    })
})()
