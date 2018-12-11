var searchProduct=require('../lib/Search.js');
var Seq = require('seq');
//commond line tool to build product index
(function main() {
    searchProduct.doBuildAllLabelIndex( function (error) {
        if (error) {
            console.log("index all label failed:" + error.message);
        } else {
            console.log("index all label succeed");
        }
        process.exit(0);
    });
})();