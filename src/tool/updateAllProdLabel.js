
var labelMain = require('../lib/util/prodLabel/labelMain.js');
var mysql = require('mysql');
var Seq = require('seq');
var db = require('../lib/db.js');
var serverLogger = require('../lib/util/ServerLogger.js');
var logger = serverLogger.createLogger('updateAllProdLabel.js');
var sysError = require('../lib/util/SystemError.js');
(function insertLabel(){
    var prodArr = [];
    Seq().seq(function(){
        var that = this;
        var query = " SELECT product.prod_id, product.biz_id, product.name as productName, product.description, " +
            " ifNull(prod_type.display_order ,9999) typeOrder," +
            " product.calorie,product.spiciness,product.ingredient,product.name_lang,product.description_lang,product.ingredient_lang, " +
            " product.options,product.type_id, product.price, product.img_url,product.note,product.active,product.togo, product.display_order, " +
            " product.created_on,product.updated_on ,product.unitofmeasure, prod_type.name type, prod_type.name_lang type_lang, " +
            " promotion.promotion_id,promotion.name as promotionName,promotion.discount_pct,promotion.start_date,promotion.end_date,promotion.week_sched " +
            " FROM product left join promotion on product.prod_id = promotion.prod_id left join prod_type on product.type_id=prod_type.type_id "
        db.dbQuery(query,[],function(error,rows){
            prodArr = rows;
            that()
        })
    }).seq(function(){
        labelMain.labelMain(prodArr,function(error){
            if(error){
                logger.error(' searchProduct :' + error.message);
                throw sysError.InternalError(error.message, "error");
            }else{
                process.exit(0);
            }
        })
    })
})();
