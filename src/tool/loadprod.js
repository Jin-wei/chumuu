var jsdom = require('jsdom');
var proddao = require('./../lib/dao/ProdDao.js');
var prodtypedao = require('./../lib/dao/prodtypedao.js');
var imagedao = require('./../lib/resource/imagedao.js');
var request = require("request");
var fs = require('fs');
var Seq = require('seq');

function saveProduct(bizId, window) {
    var inx1, inx2, cat1, cat2, option, title1, title2, title, price, pic;
    //var spicyImg = '<img src="/images/spicy1.png" align="absmiddle" height="15">';
    var prods = [];
    window.$(".category").each(function () {
        var cat = window.$(this).children(".categoryname").html();
        console.log(cat);
        if (cat) {
            inx1 = cat.indexOf("(");
            if (inx1>0){
                cat1 = cat.substring(0, inx1).trim();
                cat2 = cat.substring(inx1 + 1, cat.length - 1).trim();
            }else{
                cat1=cat;
                cat2=null;
            }
            window.$(this).find(".dish").each(function () {
                title = window.$(this).find(".dishname").children("a").html();
                price = window.$(this).find(".dishprice").html();
                pic = window.$(this).find(".dishimg").find("img").attr("src");
                if (price !=null && (price.indexOf('$') == 0)) {
                    price = price.substring(1);
                }else{
                    price=null;
                }
                inx1 = title.indexOf("(");
                inx2 = title.indexOf(')');
                if (inx1 >= 0) {
                    if (inx2 >= 0) {
                        title1 = title.substring(0,inx1).trim();
                        title2 = title.substring(inx1 +1,inx2).trim();
                    } else {
                        title1 = title;
                        title2 = null;
                    }
                }
                //trim the rating
               /* if (title1.indexOf('<img') >= 0) {
                    title1 = title1.replace(/&nbsp;/g, "");
                    title1 = title1.replace(/&amp;/g, "&");
                }*/
                if (title2 && title2.indexOf('<br>') >= 0) {
                    title2 = title2.substring(0, title2.indexOf('<br>'));
                }
                if (title2 && title2.indexOf('<img') >= 0) {
                    title2 = title2.substring(0, title2.indexOf('<img'));
                }
                if (title2) {
                    title2 = title2.replace(/&nbsp;/g, "");
                    title2 = title2.replace(/&amp;/g, "&");
                }
                if (cat1) {
                    cat1 = cat1.replace(/&nbsp;/g, "");
                    cat1 = cat1.replace(/&amp;/g, "&");
                }

                if (cat2) {
                    cat2 = cat2.replace(/&nbsp;/g, "");
                    cat2 = cat2.replace(/&amp;/g, "&");
                }
                var prod = {};
                prod.bizId = bizId;
                prod.name = title1;
                prod.name_lang=title2;
                prod.description = title1;
                prod.description_lang = title2;
                prod.price = price;
                if (!price || price.trim().length<=0){
                    prod.price=null;
                }
                prod.type = cat1;
                prod.type_lang=cat2;
                prod.pic = pic;
                prod.options=option;
                prods.push(prod);
            });
        }
    });
    persistProds(prods);
}

function addType(prod, callback){
    console.log('here 1');
    prodtypedao.searchBizProdType({biz_id:prod.bizId,name:prod.type},function(error,rows){
        if (error){
            console.log('here 2');
            console.log(error);
            return;
        }else{
            if (rows !=null && rows.length>0){
                //found cat
                prod.type_id=rows[0].type_id;
                callback();
            }else{
                prodtypedao.addBizProdType({bizId: prod.bizId,name:prod.type, name_lang:prod.type_lang},function(error,id){
                    if (error){
                        console.log('save type failed!');
                        console.log(error);
                        return;
                    }
                    else{
                        console.log('save type succeed!');
                        prod.type_id=id;
                        callback();
                    }
                });
            }
        }
    })
}

function addProd(prod, callback){
    proddao.searchBizProdBase({name: prod.name, bizId: prod.bizId}, function (error, rows) {
        if (error) {
            console.log(error);
            return;
        }
        if (!rows || rows.length <= 0) {
            proddao.addBizProd(prod, function (err, rows) {
                if (err) {
                    console.log(err);
                    return;
                } else {
                    console.log(prod.name + " saved.");
                    // that();
                }
                prod.prod_id = rows.insertId;
                if (prod.pic && prod.pic.indexOf(".jpg") > 0) {
                    prod.pic = prod.pic.replace("medium", "large");
                    var path = __dirname + '/temp/' + prod.prod_id + '.jpg';
                    var r = request(prod.pic).pipe(fs.createWriteStream(path));
                    var image = {};
                    image.path = __dirname + '/temp/' + prod.prod_id + '.jpg';
                    image.name = prod.name + '.jpg';
                    image.type = 'image/jpeg';
                    r.on('close', function () {
                        saveProductImg(prod, image,callback);
                    });
                }else{
                    callback();
                }
            });

        } else {
            console.log("product found already!");
            callback();
        }
    });
}

function persistProds(prods) {
    console.log("number of products: ");
    console.log(prods.length);
   /*for (var i=0;i<prods.length;i++){
        console.dir(prods[i]);
    }*/
    Seq(prods).seqEach(function (prod) {
        var that=this;
       console.dir(prod);
       addType(prod,function(){
            addProd(prod,that);
        });
    });
}



function saveProductImg(prod, image,callback) {
    console.log('save image to mongo........');

    imagedao.save(null, image, {biz_id: prod.biz_id, prod_id: prod.prod_id}, function (err, imgURL) {
        if (err) {
            console.log(err);
            return;
        } else {
            prod.img_url = imgURL;
            console.dir(prod);
            proddao.updateProdImg(prod.prod_id, prod.img_url, function (err) {
                if (err) {
                    console.log(err);
                    return;
                }
                callback();
            });
        }
    });
}

function load(url, bizId) {
    jsdom.env(
        url,
        ["http://code.jquery.com/jquery.js"],
        function (errors, window) {
            if (errors) {
                throw errors;
            }
            saveProduct(bizId, window);
            window.close();

        }
    );
}

//load("http://zmenu.com/asian-pearl-fremont/", 102551);
//load("http://zmenu.com/south-legend-sichuan-restaurant-milpitas/", 1);
load("http://www.zmenu.com/golden-garlic-san-jose/",100004);
//load("http://zmenu.com/spicy-town-fremont/",102593);
//load("http://zmenu.com/yuki-japanese-restaurant-fremont/",102727);
//load("http://zmenu.com/quickly-oakland-2/",102625);
//load("http://zmenu.com/ikoi-japanese-restaurant-fairfield-3/","");
//load("http://zmenu.com/italian-american-social-club-of-san-francisco-san-francisco/","");


