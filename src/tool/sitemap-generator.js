/**
 * Created by Josh on 4/4/15.
 * Updated: 7/1/15
 */

var db = require('../lib/db.js');
var systemConfig = require('../lib/config/SystemConfig.js');
var fs = require('fs');

var query1 = 'SELECT b.biz_id, b.name, b.name_lang, b.biz_unique_name, b.updated_on FROM business b where active=1';
var query2 = 'SELECT b.biz_unique_name, p.biz_id, p.prod_id  FROM product p, business b where p.biz_id = b.biz_id and b.active=1 and p.active = 1';
var serverUrl = systemConfig.getServerUrl();
var y = new Date().getFullYear();
var m = ('0'+ (new Date().getMonth() + 1)).slice(-2);
var d = ('0'+ new Date().getDate()).slice(-2);
var cont = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

//initialize("../public/web/customer/sitemap.xml");

generate_xml_sitemap(cont, function () {
    console.log('biz total URL:');
    generate_xml_sitemap_url(query1, true, function () {
        console.log('prod total URL:');
        generate_xml_sitemap_url(query2, false, function () {
            fs.appendFile("../public/web/customer/sitemap.xml", '</urlset>', function(err) {
                if(err) {
                    return console.log(err);
                }
                else
                    process.exit();
            });
        });
    });
});

/*function initialize(file) {
    if (typeof file === 'string') {
        stream = fs.createWriteStream(
            file, {flags: 'a+', encoding: 'utf8'}
        );
        return;
    }
    stream = file;
}*/

function generate_xml_sitemap (content, callback) {
    fs.writeFile("../public/web/customer/sitemap.xml", content, function(err) {
        if(err) {
            return console.log(err);
        }
    });
    var xml = '<url>';
    xml += '<loc>'+ serverUrl + '</loc>';
    xml += '<lastmod>' + y + '-' + m + '-' + d + '</lastmod>';
    xml += '<changefreq>weekly</changefreq>';
    xml += '<priority>1.0</priority>';
    xml += '</url>';
    fs.appendFile("../public/web/customer/sitemap.xml", xml, function(err) {
        if(err) {
            return console.log(err);
        }
    });
    if (callback) {callback();}
}

function generate_xml_sitemap_url(query, isBizUrl, callback) {

    db.dbQuery(query, [], function (error, rows) {
        var length = rows.length;
        var root_path = serverUrl;

        console.log(length);
        // XML sitemap generation starts here
        var priority = 0.8;
        var freq = 'weekly';
        var xml = '';

        for (var i in rows) {
            xml += '<url>';
            if (isBizUrl) {
                if (rows[i].biz_unique_name != null) {
                    xml += '<loc>'+ root_path + '/restaurant/' + rows[i].biz_unique_name + '</loc>';
                }
                else {
                    xml += '<loc>'+ root_path + '/restaurant/' + rows[i].biz_id + '</loc>';
                }
            }
            else {
                if (rows[i].biz_unique_name != null) {
                    xml += '<loc>'+ root_path + '/restaurant/' +  rows[i].biz_unique_name + '/menu-item/' + rows[i].prod_id + '</loc>';
                }
                else {
                    xml += '<loc>'+ root_path + '/restaurant/' + rows[i].biz_id + '/menu-item/' + rows[i].prod_id + '</loc>';
                }
            }
            xml += '<lastmod>' + y + '-' + m + '-' + d + '</lastmod>';
            xml += '<changefreq>'+ freq +'</changefreq>';
            xml += '<priority>'+ priority +'</priority>';
            xml += '</url>';

            length--;
        }
        if (length == 0) {
            fs.appendFile("../public/web/customer/sitemap.xml", xml, function(err) {
                if(err) {
                    return console.log(err);
                }
            });
        }

        if (callback && length==0) {callback();}
    });
}