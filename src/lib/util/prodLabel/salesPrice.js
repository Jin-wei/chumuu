var serverLogger = require('../ServerLogger.js');
var logger = serverLogger.createLogger('salesPrice.js');


function searchProdLabel(prod,callback){
    var prodLabel = [];
    for(var i=0;i<prod.length;i++){
        if (prod[i].price>=0 && prod[i].price<10){
            prodLabel.push({
                prodId:prod[i].prod_id,
                labelId:3
            })
        }else if (prod[i].price>=10 && prod[i].price<=20){
            prodLabel.push({
                prodId:prod[i].prod_id,
                labelId:4
            })
        } else if (prod[i].price>20 && prod[i].price<=30){
            prodLabel.push({
                prodId:prod[i].prod_id,
                labelId:5
            })
        }else if (prod[i].price>30 && prod[i].price<=40){
            prodLabel.push({
                prodId:prod[i].prod_id,
                labelId:6
            })
        }else if (prod[i].price>40 && prod[i].price<=50){
            prodLabel.push({
                prodId:prod[i].prod_id,
                labelId:7
            })
        }else if (prod[i].price>50){
            prodLabel.push({
                prodId:prod[i].prod_id,
                labelId:8
            })
        }
    }
    return callback(null,prodLabel);
}

module.exports = {
    searchProdLabel : searchProdLabel
}