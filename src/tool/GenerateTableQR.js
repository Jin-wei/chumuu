var tableQRDao = require('../lib/dao/TableQrcodeDao.js');
var getopt = require('posix-getopt');

var NAME="node GenerateTableQR";


function usage(msg) {
    if (msg)
        console.error(msg);

    var str = 'usage: ' +
        NAME +
        '[-s batchSize]';
    console.error(str);
    process.exit(msg ? 1 : 0);
}

function parseOptions() {
    var option;
    var opts = {}
    var parser = new getopt.BasicParser('s:', process.argv);

    while ((option = parser.getopt())!== undefined) {
        switch (option.option) {
            case 's':
                opts.batchSize = option.optarg;
                break;

            default:
                usage('invalid option: ' + option.option);
                break;
        }
    }
    if (opts.batchSize==undefined){
        usage('invalid  options');
    }

    return (opts);
}

(function main() {
   tableQRDao.generateInBatch({batchSize:parseOptions().batchSize},function(err){
       if (err){
           console.error(err.message);
       }
       process.exit(err ? 1 : 0);

   })
})();