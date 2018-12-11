var search=require('../lib/Search.js');
var Seq = require('seq');
//commond line tool to build product index
(function main() {
    search.doBuildTableIndex( function (error) {
        if (error) {
            console.log("index table failed:" + error.message);
        } else {
            console.log("index table succeed");
        }
        process.exit(0);
    });
})();