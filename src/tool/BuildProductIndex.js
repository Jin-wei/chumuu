var searchProduct=require('../lib/Search.js');
var Seq = require('seq');
//commond line tool to build product index
(function main() {
    searchProduct.doBuildProductIndex( function (error) {
        if (error) {
            console.log("index product failed:" + error.message);
        } else {
            console.log("index product succeed");
        }
        process.exit(0);
    });
})();