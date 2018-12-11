/**
 * Created by Josh Yu on 3/4/15.
 */

var mysql = require('mysql');
var Seq = require('seq');
var db = require('../lib/db.js');

//Converter Class
var Converter=require("csvtojson").Converter;
var fs=require("fs");
//var csvFileName="/home/exile-01/git/bizwise/src/tool/target_menu_data.csv";
var csvFileName="/opt/trumenu/dist/tool/target_menu_data.csv";
var fileStream=fs.createReadStream(csvFileName);
//new converter instance
var csvConverter=new Converter({constructResult:true});

var target_biz_id = process.argv[2];
var new_prod = true;
var new_type = true;
var product_type_id = 0 ;
var product_id = 0;
var params = [];

var new_type_count = 0;
var new_prod_count = 0;
var update_prod_count = 0;

var new_type_obj = {};
var new_prod_obj = {};

//end_parsed will be emitted once parsing finished
csvConverter.on("end_parsed",function(jsonObj){
    if (target_biz_id) {
        Seq(jsonObj).seqEach(function (obj, i) {
            var that = this;
            Seq().seq(function () {
                var that = this;
                getProdName({bizId: target_biz_id ,name:obj.name}, function (error, rows) {

                    if(rows && rows.length>0){
                        new_prod = false;
                        product_id = rows[0].prod_id;
                    }else{
                        new_prod = true;
                    }
                    that();
                });
            }).seq(function () {
                var that = this;
                getProdTypeName({bizId: target_biz_id , name:obj.type_name},  function(error , rows){

                    if(rows && rows.length>0){
                        new_type = false;
                        product_type_id = rows[0].type_id;
                    }else{
                        new_type = true;
                    }
                    that();
                });
            }).seq(function () {
                var that = this;
                if (new_type){
                    new_type_count++;
                    new_type_obj.name = obj.type_name;
                    new_type_obj.name_lang = obj.type_name_lang;
                    new_type_obj.bizId = target_biz_id;

                    insertNewType(new_type_obj,function(error,result){
                        if (error){
                            console.log(' insertNewType ' + error.message);
                        } else {
                            product_type_id = result.insertId;
                            console.log(' insertNewType success ' + new_type_count);
                        }
                        that();
                    });
                }
                else
                    that();

            }).seq(function () {
                var that = this;


                new_prod_obj = obj;
                new_prod_obj.type_id = product_type_id;
                new_prod_obj.biz_id = target_biz_id;
                if (new_prod) {
                    new_prod_count++;
                    insertNewProd(new_prod_obj, function (error, result) {
                        if (error) {
                            console.log(' insertNewProd ' + error.message);
                        }
                        else {
                            console.log(' insertNewProd success ' + new_prod_count);
                        }
                        that();
                    });
                } else {
                    update_prod_count++;
                    new_prod_obj.prod_id = product_id;
                    updateProd(new_prod_obj,function(error,result){
                        if (error){
                            console.log(' updateNewProd ' + error.message);
                        }
                        else {
                            console.log(' updateProd success ' + update_prod_count);
                        }
                        that();
                    });
                }


            }).seq(function(){
                that(null, i);
            });
        }).seq(function(){
            console.log('----------------------------------');
            console.log(' insertNewType ' + new_type_count);
            console.log(' insertNewProd ' + new_prod_count);
            console.log(' updateProd ' + update_prod_count);
            console.log('----------------------------------');
            console.log('import finished, push "ctrl + c" to quit');
        });

    } else {
        console.log('Please input the bizId along with the command. eg: "node csv-import-mysql.js 102545" ');
    }
});

//read from file
fileStream.pipe(csvConverter);


function getProdName(params, callback){
    var query = 'select p.prod_id from product p where p.biz_id = ? and p.name=?';
    var paramArray=[],i=0;
    paramArray[i++]=params.bizId;
    paramArray[i++]=params.name;


    db.dbQuery(query,paramArray,function(error,rows){
        return callback(error,rows);
    })
}

function getProdTypeName(params, callback) {
    var query = 'select t.type_id from prod_type t where t.biz_id = ? and t.name = ? ';
    var paramArray=[],i=0;
    paramArray[i++]=params.bizId;
    paramArray[i++]=params.name;


    db.dbQuery(query,paramArray,function(error,rows){
        return callback(error,rows);
    })
}

function insertNewType(params, callback) {
    var query='insert into prod_type(name,name_lang,biz_id) values(?,?,?);';
    var paramArray=[],i=0;
    paramArray[i++]=params.name;
    paramArray[i++]=params.name_lang;
    paramArray[i++]=params.bizId;

    db.dbQuery(query,paramArray,function(error,rows){
        return callback(error,rows);
    })
}

function insertNewProd(params, callback){
    var query = 'insert into product(name, description, price, note, biz_id, type_id, name_lang, description_lang, options, active, calorie, spiciness, ingredient, togo) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?);';
    var paramArray=[],i=0;
    paramArray[i++]=params.name;
    paramArray[i++]=params.description;
    paramArray[i++]=params.price;
    paramArray[i++]=params.note;
    paramArray[i++]=params.biz_id;
    paramArray[i++]=params.type_id;
    paramArray[i++]=params.name_lang;
    paramArray[i++]=params.description_lang;
    paramArray[i++]=params.options;
    paramArray[i++]=params.active;
    paramArray[i++]=params.calorie;
    paramArray[i++]=params.spiciness;
    paramArray[i++]=params.ingredient;
    paramArray[i++]=params.togo;


    db.dbQuery(query,paramArray,function(error,rows){
        return callback(error,rows);
    })
}

function updateProd(params, callback){
    var query='update product set description=? , price=? , note=? ,type_id=? , name_lang=? , description_lang=? , options=? , active=?, calorie=?, spiciness=?, ingredient=?, togo=? where prod_id = ?';
    var paramArray=[],i=0;
    paramArray[i++]=params.description;
    paramArray[i++]=params.price;
    paramArray[i++]=params.note;
    paramArray[i++]=params.type_id;
    paramArray[i++]=params.name_lang;
    paramArray[i++]=params.description_lang;
    paramArray[i++]=params.options;
    paramArray[i++]=params.active;
    paramArray[i++]=params.calorie;
    paramArray[i++]=params.spiciness;
    paramArray[i++]=params.ingredient;
    paramArray[i++]=params.togo;
    paramArray[i++]=params.prod_id;

    db.dbQuery(query,paramArray,function(error,rows){
        return callback(error,rows);
    })
}