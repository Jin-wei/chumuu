/**
 * Created by Josh Yu on 3/4/15.
 */

var mysql = require('mysql');
var Seq = require('seq');
var db = require('../lib/db.js');
var serverLogger = require('../lib/util/ServerLogger.js');
var logger = serverLogger.createLogger('reconsitution-extend.js');
// 107283
// 107306

// function updateInfo (param,callback){
//     var paramArray=[],i=0;
//     var query = 'update product_extend set extend_id=?,extend_price=? where id=?';
//     paramArray[i++]=param.extend_id;
//     paramArray[i++]=param.extend_price;
//     paramArray[i]=param.id;
//
//     db.dbQuery(query,paramArray,function(error,rows){
//         return callback(error,rows);
//     })
// }
// function getInfo(params,callback){
//     var query = 'select pd.id,be.biz_id,pd.prod_id,pd.extend_id,be.extend_type,be.extend_name,be.extend_price ' +
//         'from product_extend pd,biz_extend be ' +
//         'where be.state=1 and pd.extend_id=be.id and be.biz_id=107306 ' +
//         'order by pd.prod_id,be.extend_type,be.extend_name ';
//     db.dbQuery(query,[],function(error,rows){
//         return callback(error,rows);
//     })
// }
// function runSql(sqlStr,callback){
//     var query = sqlStr;
//     db.dbQuery(query,[],function(error,rows){
//         return callback(error,rows);
//     })
// }
// (function reconstitutionExtend(req,res,next){
//     var info = [];
//     Seq().seq(function(){
//         var that = this;
//         getInfo({},function(error,rows){
//             info = rows;
//             that();
//         })
//     }).seq(function(){
//         var that = this;
//         Seq(info).seqEach(function (item, i) {
//             var that = this;
//             var params = {};
//             if(item.extend_name=='份数' && item.extend_type==0){
//                 params={
//                     extend_id:10,
//                     extend_price:item.extend_price,
//                     id:item.id
//                 }
//             }
//             if(item.extend_name=='一份' && item.extend_type==1){
//                 params={
//                     extend_id:11,
//                     extend_price:item.extend_price,
//                     id:item.id
//                 }
//             }
//             if(item.extend_name=='半份' && item.extend_type==1){
//                 params={
//                     extend_id:12,
//                     extend_price:item.extend_price,
//                     id:item.id
//                 }
//             }
//             updateInfo(params, function (err, rows) {
//                 if (err) {
//                     logger.error(' updateInfo ' + err.message);
//                     throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
//                 } else {
//                     that(null, i);
//                 }
//             });
//         }).seq(function(){
//             that()
//         })
//     }).seq(function(){
//         var that = this;
//         var sqlArr=[
//             'delete from biz_extend where id not in (10,11,12) and biz_id=107306',
//             'delete from biz_extend where biz_id=17',
//             'delete from product_extend where extend_id in (1,2,66)',
//             'delete from product_extend where id in (select id from biz_extend where state=0)',
//             'delete from biz_extend where state=0',
//             'update product_extend set extend_price=4 where extend_id=7',
//             'update product_extend set extend_id=6 where id=131',
//             'update product_extend set extend_id=7,extend_price=6 where id=132',
//             'update product_extend set extend_id=9 where id=133',
//             'update product_extend set extend_id=6 where id=134',
//             'update product_extend set extend_id=7,extend_price=6 where id=135',
//             'update product_extend set extend_id=9 where id=136',
//             'update product_extend set extend_id=6 where id=107',
//             'update product_extend set extend_id=7,extend_price=10 where id=108',
//             'update product_extend set extend_id=9 where id=109',
//             'update product_extend set extend_id=6 where id=98',
//             'update product_extend set extend_id=7,extend_price=7 where id=99',
//             'update product_extend set extend_id=9 where id=100',
//             'update product_extend set extend_id=6 where id=101',
//             'update product_extend set extend_id=7,extend_price=8 where id=102',
//             'update product_extend set extend_id=9 where id=103',
//             'delete from biz_extend where biz_id=107283 and id between 13 and 28'
//         ]
//         Seq(sqlArr).seqEach(function (item, i) {
//             var that = this;
//             runSql(item, function (err, rows) {
//                 if (err) {
//                     logger.error(' runSql ' + err.message);
//                     throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
//                 } else {
//                     that(null, i);
//                 }
//             });
//         }).seq(function(){
//             that()
//         })
//     }).seq(function(){
//         logger.info(' reconstitutionExtend ' + 'success');
//         process.exit(0);
//     })
// })();
//
//

(function insertLabel(req,res,next){

    var query = "insert into all_label (label_name) values  " +
        "('减肥'), ('美容'), ('润肺抗燥'), ('补血'), ('清热祛火'), ('滋补'), ('养生'), ('儿童'), ('婴幼儿'), ('老人'), ('孕产妇'), ('宝宝')," +
        "('家常菜'), ('快手菜'), ('下饭菜'), ('下酒菜'), ('小清新'), ('创意菜')," +
        "('超爽'), ('麻辣'), ('过瘾'), ('酸爽'),('醇香'),('口感劲道'),('肥而不腻'),(''),(''),(''),(''),(''),(''),"
    db.dbQuery(query,[],function(error,rows){
        process.exit(0);
    })
})();