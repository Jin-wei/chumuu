var fs = require('fs');
var path = require('path');
var util = require('util');
var bunyan = require('bunyan');
var getopt = require('posix-getopt');
var restify = require('restify');

var trumenu = require('./lib/server.js');
var bizwise = require('./lib/server.js');


///--- Globals

var NAME = 'truemenu';

// In true UNIX fashion, debug messages go to stderr, and audit records go
// to stdout, so you can split them as you like in the shell
var LOG = bunyan.createLogger({
    name: NAME,
    streams: [
        {
            level: (process.env.LOG_LEVEL || 'info'),
            stream: process.stderr
        },
        {
            // This ensures that if we get a WARN or above all debug records
            // related to that request are spewed to stderr - makes it nice
            // filter out debug messages in prod, but still dump on user
            // errors so you can debug problems
            level: 'debug',
            type: 'raw',
            stream: new restify.bunyan.RequestCaptureStream({
                level: bunyan.WARN,
                maxRecords: 100,
                maxRequestIds: 1000,
                stream: process.stderr
            })
        }
    ],
    serializers: restify.bunyan.serializers
});


///--- Helpers

/**
 * Standard POSIX getopt-style options parser.
 *
 * Some options, like directory/user/port are pretty cut and dry, but note
 * the 'verbose' or '-v' option afflicts the log level, repeatedly. So you
 * can run something like:
 *
 * node main.js -p 80 -vv 2>&1 | bunyan
 *
 * And the log level will be set to TRACE.
 */
function parseOptions() {
    var option;
    var opts = {}
    var parser = new getopt.BasicParser('hvd:p:u:z:a:', process.argv);

    while ((option = parser.getopt()) !== undefined) {
        switch (option.option) {
            case 'd':
                opts.directory = path.normalize(option.optarg);
                break;

            case 'h':
                usage();
                break;

            case 'p':
                opts.port = parseInt(option.optarg, 10);
                break;

            case 'u':
                opts.user = option.optarg;
                break;

            case 'v':
                // Allows us to set -vvv -> this little hackery
                // just ensures that we're never < TRACE
                LOG.level(Math.max(bunyan.TRACE, (LOG.level() - 10)));
                if (LOG.level() <= bunyan.DEBUG)
                    LOG = LOG.child({src: true});
                break;

            case 'z':
                opts.password = option.optarg;
                break;
            case 'a':
                opts.app = option.optarg;
                break;

            default:
                usage('invalid option: ' + option.option);
                break;
        }
    }

    return (opts);
}


function usage(msg) {
    if (msg)
        console.error(msg);

    var str = 'usage: ' +
        NAME +
        ' [-v] [-d dir] [-p port] [-u user] [-z password]';
    console.error(str);
    process.exit(msg ? 1 : 0);
}


///--- Mainline

(function main() {
    var options = parseOptions();

    LOG.debug(options, 'command line arguments parsed');
    var server = trumenu.createServer({
        log: LOG
    });

    // At last, let's rock and roll
    server.listen((options.port || 8080), function onListening() {
        if('biz'===options.app){
            server.get('/',restify.serveStatic({
                directory: './public/web',
                default: "business.html",
                maxAge: 0
            }));
        }else if('admin'===options.app){
            server.get('/',restify.serveStatic({
                directory: './public/web',
                default: "biz_admin.html",
                maxAge: 0
            }));
        }
        else{
            server.get('/',restify.serveStatic({
                directory: './public/web',
                default: "customer.html",
                maxAge: 0
            }));
        }
        LOG.info('listening at %s', server.url);
    });
})();