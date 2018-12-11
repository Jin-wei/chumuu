var Seq = require('seq');
var serverLogger = require('./util/ServerLogger.js');
var logger = serverLogger.createLogger('printerddj.js');
var printerDao = require('./dao/printerDao.js');
var printhelper = require("./util/printerddj/printhelper.js");
var iconv = require("iconv-lite");
var moment = require('moment');

function chkstrlen(str) {
    var strlen = 0;
    for(var i = 0;i < str.length; i++)
    {
        if(str.charCodeAt(i) > 255) //如果是汉字，则字符串长度加2
            strlen += 2;
        else
            strlen++;
    }
    return   strlen;
}

function printeOrder(params,callback){
    var printerInfo = [];
    Seq().seq(function() {//获取打印机信息
        var that = this;
        printerDao.queryBizPrinter(params,function(error,rows){
            if (error){
                logger.error(' queryBizPrinter ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
                return ;
            }
            printerInfo = rows;
            that();
        })
    }).seq(function(){
        var b = new Buffer(iconv.encode(params.content,'GBK'));
        content= b.toString("base64");
        var jsonContent="[{\"Alignment\":0,\"BaseText\":\"" + content + "\",\"Bold\":0,\"FontSize\":0,\"PrintType\":0}]";
        for(var i=0;i<printerInfo.length;i++){
            if(printerInfo[i].operator_id && printerInfo[i].print_num>0){
                data = {
                    Uuid:printerInfo[i].device_name,
                    PrintContent:jsonContent,
                    OpenUserId:printerInfo[i].operator_id
                };

                for(var k=0;k<printerInfo[i].print_num;k++){
                    printhelper.printContent(data,function(result){
                        return callback(result);
                    });
                }
            }
        }
    });
}

function formatOrderAll(params,orderInfo,orderItem,callback){
    var allMoney = 0;
    var allTax =orderInfo.total_tax;
    var content = '           ' + params.bizName +'\n' + ' ' + '\n' +
        '桌号:' + params.table + '  订单号:' + params.seq + '   ' + '\n' +
        '打印时间:' + moment(new Date()).format("YYYY-MM-DD hh:mm") + '\n' + ' '+ '\n';
    for(var i=0;i<orderItem.length;i++){

        var prod_name  = orderItem[i].prod_name;
        var unitofmeasure = orderItem[i].unitofmeasure?orderItem[i].unitofmeasure:'份';
        var quantity  = orderItem[i].quantity;
        var totalPrice  = orderItem[i].total_price;
        var remark = orderItem[i].remark?orderItem[i].remark:'';
        var prod_extend = orderItem[i].prod_extend?orderItem[i].prod_extend:'';

        var dishRemark = remark + ' ' + prod_extend;
        allMoney+=totalPrice;

        var prodLen = chkstrlen(prod_name);
        var quantityLen = chkstrlen(quantity);
        var totalPriceLen = chkstrlen(totalPrice);
        if(prodLen<18){
            for(var j=0;j<18-prodLen;j++){
                prod_name+=' '
            }
        }

        if(quantityLen<2){
            for(var j=0;j<2-quantityLen;j++){
                quantity+=' '
            }
        }
        if(totalPriceLen<2){
            for(var j=0;j<2-totalPriceLen;j++){
                totalPrice+=' '
            }
        }

        if(dishRemark !=' '){
            content+=prod_name + quantity + unitofmeasure + ' ￥' + totalPrice + '\n' + '注:' + dishRemark + '\n' + ' ' + '\n';
        }else {
            content+=prod_name + quantity + unitofmeasure + ' ￥' + totalPrice + '\n' + ' ' + '\n'
        }
    }

    content+='********************************' + '\n';
    content+='税额:                   ￥' + allTax+'\n';
    content+='小计:                   ￥' + (allMoney+allTax);

    return callback(content)
}
function formatOrderUrge(orderInfo,orderItem,callback){
    var content = '           ' +'(催菜单)\n' + ' ' + '\n' +
        '桌号:' + orderInfo.table + '  订单号:' + orderInfo.seq + '   ' + '\n' +
        '打印时间:' + moment(new Date()).format("YYYY-MM-DD hh:mm") + '\n' + ' '+ '\n';
    for(var i=0;i<orderItem.length;i++){

        var prod_name  = orderItem[i].prod_name;
        var unitofmeasure = orderItem[i].unitofmeasure?orderItem[i].unitofmeasure:'份';
        var quantity  = orderItem[i].quantity;
        var remark = orderItem[i].remark?orderItem[i].remark:'';
        var prod_extend = orderItem[i].prod_extend?orderItem[i].prod_extend:'';
        var dishRemark = remark + ' ' + prod_extend;

        var prodLen = chkstrlen(prod_name);
        var quantityLen = chkstrlen(quantity);

        if(prodLen<22){
            for(var j=0;j<22-prodLen;j++){
                prod_name+=' '
            }
        }

        if(quantityLen<2){
            for(var j=0;j<2-quantityLen;j++){
                quantity+=' '
            }
        }

        if(dishRemark !=' '){
            content+=prod_name + quantity + unitofmeasure + '\n' + '注:' + dishRemark + '\n' + ' ' + '\n';
        }else {
            content+=prod_name + quantity + unitofmeasure + '\n' + ' ' + '\n'
        }
    }


    return callback(content)
}
function formatOrderSendKitchen(orderInfo,orderItem,callback){
    var content = '           ' +'(出菜单)\n' + ' ' + '\n' +
        '桌号:' + orderInfo.table + '  订单号:' + orderInfo.seq + '   ' + '\n' +
        '打印时间:' + moment(new Date()).format("YYYY-MM-DD hh:mm") + '\n' + ' '+ '\n';
    for(var i=0;i<orderItem.length;i++){

        var prod_name  = orderItem[i].prod_name;
        var unitofmeasure = orderItem[i].unitofmeasure?orderItem[i].unitofmeasure:'份';
        var quantity  = orderItem[i].quantity;
        var remark = orderItem[i].remark?orderItem[i].remark:'';
        var prod_extend = orderItem[i].prod_extend?orderItem[i].prod_extend:'';
        var dishRemark = remark + ' ' + prod_extend;

        var prodLen = chkstrlen(prod_name);
        var quantityLen = chkstrlen(quantity);

        if(prodLen<22){
            for(var j=0;j<22-prodLen;j++){
                prod_name+=' '
            }
        }

        if(quantityLen<2){
            for(var j=0;j<2-quantityLen;j++){
                quantity+=' '
            }
        }

        if(dishRemark !=' '){
            content+=prod_name + quantity + unitofmeasure + '\n' + '注:' + dishRemark + '\n' + ' ' + '\n';
        }else {
            content+=prod_name + quantity + unitofmeasure + '\n' + ' ' + '\n'
        }
    }


    return callback(content)
}
module.exports={
    printeOrder:printeOrder,
    formatOrderAll:formatOrderAll,
    formatOrderUrge:formatOrderUrge,
    formatOrderSendKitchen:formatOrderSendKitchen
}