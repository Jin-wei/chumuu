/**
 * Created by exile-01 on 2/26/15.
 */


var Seq = require('seq');
var db = require('../lib/db.js');
var systemConfig = require('../lib/config/SystemConfig.js');
var map = require('express-sitemap');
var app = require('express')();
var query1 = 'SELECT b.biz_id, b.name, b.name_lang, b.biz_unique_name, b.updated_on FROM business b where active=1';
var query2 = 'SELECT b.biz_unique_name, p.biz_id, p.prod_id  FROM product p, business b where p.biz_id = b.biz_id and b.active=1 and p.active = 1';

var serverUrl = systemConfig.getServerUrl().slice(7).slice(0,-1);
console.log(serverUrl);

Seq().seq(function () {
    var that = this;
    app.get('/', function (req, res) {
        res.send('hello /');
    });
    that();
}).seq(function () {
        var that = this;
        //console.log('I am here1');
        db.dbQuery(query1, [], function (error, rows) {
            var length = rows.length;
            var BreakException = {};
            console.log(length);

            Seq(rows).seqEach(function (r, i) {
                var that = this;
                try {
                    if (r.biz_unique_name != null) {
                        app.get('/restaurant/' + r.biz_unique_name, function (req, res) {

                            res.send('hello /');
                        });
                    }
                    else {
                        app.get('/restaurant/' + r.biz_id, function (req, res) {

                            res.send('hello /');
                        });
                    }

                    length--;
                    if (length == 0) throw BreakException;
                }
                catch (e) {
                    if (e != BreakException) throw e;
                    else {
                        var y = new Date().getFullYear();
                        var m = new Date().getMonth() + 1;
                        var d = new Date().getDate();
                        var sitemap = map({
                            sitemap: '../public/web/customer/sitemap2.xml', // path for .XMLtoFile
                            url: serverUrl,
                            route: {
                                'ALL': {
                                    lastmod: y + '-' + m + '-' + d,
                                    changefreq: 'daily',
                                    priority: 0.6
                                }
                            }
                        });
                        sitemap.generate(app); // generate sitemap from express route, you can set generate inside sitemap({})

                        sitemap.XMLtoFile(); // write this map to file
                    }
                }
                that(null, i);
            }).seq(function () {
                    console.log('biz URL wrote successfully, push "Ctrl+C" to quit');
                    that();
                });
        });
    }).seq(function () {
        var that = this;
        //console.log('I am here2');
        db.dbQuery(query2, [], function (error, rows) {
            var length = rows.length;
            var BreakException = {};
            console.log(length);

            Seq(rows).seqEach(function (r, i) {
                var that = this;
                try {
                    if (r.biz_unique_name != null) {
                        app.get('/restaurant/' + r.biz_unique_name + '/menu_item/' + r.prod_id, function (req, res) {

                            res.send('hello /');
                        });
                    }
                    else {
                        app.get('/restaurant/' + r.biz_id + '/menu_item/' + r.prod_id, function (req, res) {

                            res.send('hello /');
                        });
                    }

                    length--;
                    if (length == 0) throw BreakException;
                }
                catch (e) {
                    if (e != BreakException) throw e;
                    else {
                        var y = new Date().getFullYear();
                        var m = new Date().getMonth() + 1;
                        var d = new Date().getDate();
                        var sitemap = map({
                            sitemap: '../public/web/customer/sitemap2.xml', // path for .XMLtoFile
                            url: serverUrl,
                            route: {
                                'ALL': {
                                    lastmod: y + '-' + m + '-' + d,
                                    changefreq: 'daily',
                                    priority: 0.6
                                }
                            }
                        });
                        sitemap.generate(app); // generate sitemap from express route, you can set generate inside sitemap({})

                        sitemap.XMLtoFile(); // write this map to file
                    }
                }
                that(null, i);
            }).seq(function () {
                    console.log('prod URL wrote successfully, push "Ctrl+C" to quit');
                    that();
                });
        });
    });