var searchBiz=require('../lib/Search.js');
var Seq = require('seq');
//commond line tool to build product index
(function main() {
    searchBiz.doBuildBizIndex( function (error) {
        if (error) {
            console.log("index biz failed:" + error.message);
        } else {
            console.log("index biz succeed");
        }
        process.exit(0);
    });
})();