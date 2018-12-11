/**
 * Created by ling xue on 14-11-26.
 */
/**
 * The module is a service for web printer ;
 * It works need js file StarWebPrintBuilder.js and StarWebPrintTrader.js
 */

function sendMessage(url,request,onSuccess,onFailure) {

    var trader = new StarWebPrintTrader({url:url,checkedblock:true});
    /*if (trader.isOffLine({traderStatus:2})) {
        alert('CoverOpen');
    }*/

    trader.onReceive = function (response) {

        var msg = "";

        if (trader.isCoverOpen({traderStatus:response.traderStatus})) {msg += '\tCoverOpen\n';}
        if (trader.isOffLine({traderStatus:response.traderStatus})) {msg += '\tOffLine\n';}
        if (trader.isCompulsionSwitchClose({traderStatus:response.traderStatus})) {msg += '\tCompulsionSwitchClose\n';}
        if (trader.isEtbCommandExecute({traderStatus:response.traderStatus})) {msg += '\tEtbCommandExecute\n';}
        if (trader.isHighTemperatureStop({traderStatus:response.traderStatus})) {msg += '\tHighTemperatureStop\n';}
        if (trader.isNonRecoverableError({traderStatus:response.traderStatus})) {msg += '\tNonRecoverableError\n';}
        if (trader.isAutoCutterError({traderStatus:response.traderStatus})) {msg += '\tAutoCutterError\n';}
        if (trader.isBlackMarkError({traderStatus:response.traderStatus})) {msg += '\tBlackMarkError\n';}
        if (trader.isPaperEnd({traderStatus:response.traderStatus})) {msg += '\tPaperEnd\n';}
        if (trader.isPaperNearEnd({traderStatus:response.traderStatus})) {msg += '\tPaperNearEnd\n';}

        //msg += '\tEtbCounter = ' + trader.extractionEtbCounter({traderStatus:response.traderStatus}).toString() + ' ]\n';

//        if(msg && msg.length>0){
//            WarningBox(msg);
//            if(_.isFunction(onFailure))
//                onFailure(msg);
//        }
        if(_.isFunction(onSuccess))
            onSuccess();
    };

    trader.onError = function (response) {
        var msg = 'Print Error,check your printer please !\n\n';

        //msg += '\tStatus:' + response.status + '\n';

        //msg += '\tResponseText:' + response.responseText;

        WarningBox(msg);
        if(_.isFunction(onFailure))
            onFailure(response);
    };

    trader.sendMessage({request:request});
}

function printerForWaitorOld(setting){
    setting = setting || {};
    var url = setting.url;
    var obj = setting.waiterData;
    var onSuccess = setting.onSuccess;
    var onFailure = setting.onFailure;
    var params ={};
    params.paperWidth = 'inch3DotImpact' ;
    url = 'http://'+ url +'/StarWebPRNT/SendMessage';
    var builder = new StarWebPrintBuilder();
    var request = '';
    request += builder.createInitializationElement();

    obj.bizName = obj.bizInfo.name;
    obj.bizAddress = obj.bizInfo.address + (obj.bizInfo.city||'') +"," + (obj.bizInfo.state||'') + " " +(obj.bizInfo.zipcode||'') ;
    obj.bizPhone = obj.bizInfo.phone_no;
    var d= new Date();
    obj.orderDate = d.toLocaleDateString();
    obj.orderTime = d.toLocaleTimeString();
    var taxRate = obj.bizInfo.tax_rate;



    switch (params.paperWidth) {
        case 'inch3DotImpact' :
            request += builder.createTextElement({characterspace:0, codepage:'utf8' ,font:'font_b'});
            request += builder.createAlignmentElement({position:'center'});
            request += builder.createTextElement({width:2,height:2,font:'font_b', data:obj.bizName+'\n'});
            if(obj.bizInfo.name_lang){
                request += builder.createTextElement({width:2,height:2,font:'font_b', data:obj.bizInfo.name_lang+'\n'});
            }
            request += builder.createTextElement({width:1,height:1,font:'font_a', data:obj.bizAddress+'\n'});
            request += builder.createTextElement({width:1,height:1,font:'font_a', data:obj.bizPhone+'\n'});


            if(obj.orderInfo.order_type != 1){
                obj.orderType = 'To Go';
                request += builder.createTextElement({width:2,height:2,font:'font_a',invert:true, data:obj.orderType+'\n'});
                request += builder.createAlignmentElement({position:'left'});
                request += builder.createTextElement({width:1,height:1,font:'font_a',invert:false, data:"PickUp Time : "+ new Date(obj.orderInfo.order_start).toLocaleTimeString()+' '});
                request += builder.createTextElement({width:1,height:1,font:'font_a', data:"Phone:"+ obj.orderInfo.phone+'\n\n'});
            }

            request += builder.createAlignmentElement({position:'left'});
            request += builder.createTextElement({width:2,height:2,font:'font_b',invert:false, data:"#"+obj.orderInfo.seq+'\n'});

            //request += builder.createTextElement({underline:true,width:1,height:1,font:'font_a',data:"\n"});
            request += builder.createTextElement({underline:false,data:""});
            var totalPricePrinter = 0 ;
            for(var i= 0 ;i<obj.itemArray.length;i++){
                request += builder.createAlignmentElement({position:'left'});
                var qtyNameStr =  stringRightTrim(obj.itemArray[i].quantity,3) + obj.itemArray[i].prodName;
                var itemPrice = obj.itemArray[i].price*obj.itemArray[i].quantity;
                totalPricePrinter = totalPricePrinter + itemPrice;
                var priceStr = stringLeftTrim("$"+itemPrice.toFixed(2),9);
                if(obj.itemArray[i].quantity>1){
                    priceStr = stringLeftTrim("$"+obj.itemArray[i].price.toFixed(2),8) + priceStr;
                }
                request += builder.createTextElement({width:1,height:1,font:'font_a', data:stringCenterTrim(qtyNameStr,priceStr,42)+"\n"});

                if(obj.itemArray[i].prodNameLang){
                    request += builder.createTextElement({width:2,height:2,font:'font_a', data:"  "+obj.itemArray[i].prodNameLang + "\n"});
                }

            }
            var subTotalStr = 'SubTotal';
            for(var i=0;i<33-totalPricePrinter.toFixed(2).length;i++){
                subTotalStr = subTotalStr + " ";
            }
            subTotalStr = subTotalStr+ "$" + totalPricePrinter.toFixed(2);
            var orderTaxPrinter = taxRate*totalPricePrinter/100;
            var taxStr = 'Tax('+taxRate.toFixed(2)+"%)";
            for(var i=0;i<31-orderTaxPrinter.toFixed(2).length;i++){
                taxStr = taxStr + " ";
            }
            taxStr = taxStr+ "$" + orderTaxPrinter.toFixed(2);

            var totalStr = 'Total';
            for(var i=0;i<15-(totalPricePrinter+orderTaxPrinter).toFixed(2).length;i++){
                totalStr = totalStr + " ";
            }
            totalStr = totalStr+ "$" + (totalPricePrinter+orderTaxPrinter).toFixed(2);
            request += builder.createTextElement({width:1,height:1,font:'font_a', data:'\n'+subTotalStr+'\n'});
            request += builder.createTextElement({underline:true,width:1,height:1,font:'font_a', data:taxStr+'\n'});
            request += builder.createTextElement({underline:false});
            request += builder.createTextElement({width:2,height:2,font:'font_a', data:totalStr+'\n\n'});
            request += builder.createTextElement({width:1,height:1,font:'font_a', data:obj.orderDate+"   "+obj.orderTime+'\n'});
            request += builder.createAlignmentElement({position:'center'});
            request += builder.createTextElement({width:1,height:1,font:'font_b', data:'!!! THANK YOU !!!'+'\n\n'});


            break;

    }

    request += builder.createCutPaperElement({feed:true});

    sendMessage(url,request,onSuccess,onFailure);

}

function printerInvoice(setting){
    setting = setting || {};
    var url = setting.url;
    var obj = setting.invoiceData;
    var onSuccess = setting.onSuccess;
    var onFailure = setting.onFailure;

    var params ={};
    params.paperWidth = 'inch3DotImpact' ;
    url = 'http://'+ url +'/StarWebPRNT/SendMessage';

    var builder = new StarWebPrintBuilder();
    var request = '';
    request += builder.createInitializationElement();

    obj.bizName = obj.bizInfo.name;
    obj.bizAddress = obj.bizInfo.address + (obj.bizInfo.city||'') +"," + (obj.bizInfo.state||'') + " " +(obj.bizInfo.zipcode||'');
    obj.bizUrl = "http://tru-menu.com/#/restaurant/"+obj.bizInfo.biz_id;
    obj.bizPhone = obj.bizInfo.phone_no;

    var d= new Date();
    obj.orderDate = d.toLocaleDateString();
    obj.orderTime = d.toLocaleTimeString();

    obj.orderId = obj.orderInfo[0].id;

    obj.originPrice =  obj.orderInfo[0].actual_price;
    obj.tax = obj.orderInfo[0].total_tax;
    obj.totalPrice = obj.orderInfo[0].total_price;

    switch (params.paperWidth) {
        case 'inch3DotImpact' :
            request += builder.createTextElement({characterspace:0, codepage:'utf8' ,font:'font_b'});
            request += builder.createAlignmentElement({position:'center'});
            request += builder.createTextElement({width:2,height:2,font:'font_b', data:obj.bizName+'\n'});
            if(obj.bizInfo.name_lang){
                request += builder.createTextElement({width:2,height:2,font:'font_b', data:obj.bizInfo.name_lang+'\n'});
            }
            request += builder.createTextElement({width:1,height:1,font:'font_a', data:obj.bizAddress+'\n'});
            request += builder.createTextElement({width:1,height:1,font:'font_a', data:obj.bizPhone+'\n\n'});

            request += builder.createAlignmentElement({position:'left'});

            request += builder.createTextElement({width:1,height:1,font:'font_a', data:"Order ID : "});
            request += builder.createTextElement({width:2,height:2,font:'font_b', data:"#"+obj.orderInfo[0].seq+'\n'});
            if(obj.orderInfo[0].order_type == 1){
                obj.orderType = "Dine In";
                request += builder.createTextElement({width:1,height:1,font:'font_a', data:"Order Type : "+obj.orderType+'  '});
                request += builder.createTextElement({width:1,height:1,font:'font_a', data:"  "+obj.orderInfo[0].people_num+'P\n\n'});
            }else{
                obj.orderType = 'To Go';
                request += builder.createTextElement({width:1,height:1,font:'font_a', data:"Order Type : "+obj.orderType+'\n'});
                request += builder.createTextElement({width:1,height:1,font:'font_a', data:"PickUp Time : "+ new Date(obj.orderInfo[0].order_start).toLocaleTimeString()+' '});
                request += builder.createTextElement({width:1,height:1,font:'font_a', data:"Phone:"+ obj.orderInfo[0].phone+'\n\n'});
            }



            request += builder.createTextElement({underline:true,data:"Qty       Name               U/P     Price\n"});
            request += builder.createTextElement({underline:false,data:""});
            for(var i= 0 ;i<obj.orderInfo.length;i++){
                request += builder.createAlignmentElement({position:'left'});
                var qtyNameStr =  stringRightTrim(obj.orderInfo[i].quantity,3) + obj.orderInfo[i].name;
                var priceStr = stringLeftTrim("$"+obj.orderInfo[i].item_origin_price.toFixed(2),9);
                if(obj.orderInfo[i].quantity>1){
                    priceStr = stringLeftTrim("$"+obj.orderInfo[i].price.toFixed(2),8) + priceStr;
                }
                request += builder.createTextElement({width:1,height:1,font:'font_a', data:stringCenterTrim(qtyNameStr,priceStr,42)+"\n"});

                /*request += builder.createTextElement({width:1,height:1,font:'font_a', data:stringRightTrim(obj.orderInfo[i].quantity,3)});
                request += builder.createTextElement({width:1,height:1,font:'font_a', data:stringLeftTrim("$"+obj.orderInfo[i].price.toFixed(2),8)});
                request += builder.createTextElement({width:1,height:1,font:'font_a', data:stringLeftTrim("$"+obj.orderInfo[i].item_origin_price.toFixed(2),10) + "  "});
                request += builder.createTextElement({width:1,height:1,font:'font_a', data:obj.orderInfo[i].name+ "\n"});*/
                if(obj.orderInfo[i].name_lang){
                    request += builder.createTextElement({width:1,height:1,font:'font_a', data:"   "+obj.orderInfo[i].name_lang + "\n"});
                }

                /*var priceString =  obj.orderInfo[i].price.toFixed(2)+"*"+obj.orderInfo[i].quantity;
                var charLength = obj.orderInfo[i].name.length +priceString.length + 1;
                var spaceStr = "";
                for(var j=0 ; j<42-charLength; j++){
                    spaceStr = spaceStr +" ";
                }
                var itemStr = obj.orderInfo[i].name + spaceStr +'$' + priceString;

                request += builder.createTextElement({width:1,height:1,font:'font_a', data:itemStr+'\n'});*/

            }
            var subTotalStr = 'SubTotal';
            for(var i=0;i<33-obj.orderInfo[0].actual_price.toFixed(2).length;i++){
                subTotalStr = subTotalStr + " ";
            }
            subTotalStr = subTotalStr+ "$" + obj.orderInfo[0].actual_price.toFixed(2);
            var taxStr = 'Tax('+obj.bizInfo.tax_rate.toFixed(2)+"%)";
            for(var i=0;i<31-obj.tax.toFixed(2).length;i++){
                taxStr = taxStr + " ";
            }
            taxStr = taxStr+ "$" + obj.orderInfo[0].total_tax.toFixed(2);
            var discountStr = 'Discount';
            for(var i=0;i<33-obj.orderInfo[0].total_discount.toFixed(2).length;i++){
                discountStr = discountStr + " ";
            }
            discountStr = discountStr+ "$" + obj.orderInfo[0].total_discount.toFixed(2);
            var totalStr = 'Total';
            for(var i=0;i<15-obj.orderInfo[0].total_price.toFixed(2).length;i++){
                totalStr = totalStr + " ";
            }
            totalStr = totalStr+ "$" + obj.orderInfo[0].total_price.toFixed(2);
            request += builder.createTextElement({width:1,height:1,font:'font_a', data:'\n'+subTotalStr+'\n'});
            request += builder.createTextElement({width:1,height:1,font:'font_a', data:discountStr+'\n'});
            request += builder.createTextElement({underline:true,width:1,height:1,font:'font_a', data:taxStr+'\n'});
            request += builder.createTextElement({underline:false});
            var tip1 = obj.orderInfo[0].total_price * 0.15;
            var tip2 = obj.orderInfo[0].total_price * 0.18;
            var tip3 = obj.orderInfo[0].total_price * 0.2;
            var total1 = (obj.orderInfo[0].total_price +tip1).toFixed(2);
            var total2 = (obj.orderInfo[0].total_price +tip2).toFixed(2);
            var total3 = (obj.orderInfo[0].total_price +tip3).toFixed(2);

            request += builder.createTextElement({width:2,height:2,font:'font_a', data:totalStr+'\n\n'});
            request += builder.createTextElement({width:1,height:1,font:'font_a', data:"Tip guide"+'\n'});
            request += builder.createTextElement({width:1,height:1,font:'font_a', data:"15%: +  "+tip1.toFixed(2)+" =  "+total1+'\n'});
            request += builder.createTextElement({width:1,height:1,font:'font_a', data:"18%: +  "+tip2.toFixed(2)+" =  "+total2+'\n'});
            request += builder.createTextElement({width:1,height:1,font:'font_a', data:"20%: +  "+tip3.toFixed(2)+" =  "+total3+'\n\n'});
            request += builder.createTextElement({width:1,height:1,font:'font_a', data:obj.orderDate+"   "+obj.orderTime+'\n'});
            request += builder.createTextElement({width:1,height:1,font:'font_a', data:'\n'});
            request += builder.createAlignmentElement({position:'center'});
            request += builder.createTextElement({width:2,height:2,font:'font_b', data:'THANK YOU FOR YOUR BUSINESS!'+'\n\n'});
            request += builder.createTextElement({width:1,height:1,font:'font_a', data:'QUESTIONS OR CONCERNS PLEASE SCAN'+'\n\n'});
            request += builder.createQrCodeElement({model:'model2', level:'level_q', cell:4, data:obj.bizUrl});


           break;

    }

    request += builder.createCutPaperElement({feed:true});

    sendMessage(url,request,onSuccess,onFailure);
}


function printerForWaitor(setting){
    setting = setting || {};

    var url = setting.url;
    var obj = setting.waiterData.itemArray;
    var printerType = setting.waiterData.orderInfo;
    var printNameList = setting.waiterData.nameList || ['prodName','prodNameLang']; //['prodName'], ['prodNameLang'], ['prodName','prodNameLang'], ['prodNameLang','prodName']
    var onSuccess = setting.onSuccess;
    var onFailure = setting.onFailure;

    url = 'http://'+ url +'/StarWebPRNT/SendMessage';
    var builder = new StarWebPrintBuilder();
    //console.log(obj);
    var request = '';
    /**
     * Temp for test
     * @type {*}
     */
    var params ={};
    params.paperWidth = 'inch3DotImpact' ;

    request += builder.createInitializationElement();

    switch (params.paperWidth) {
        case 'inch3DotImpact' :
            request += builder.createTextElement({characterspace:0, codepage:'utf8' ,font:'font_a'});

            request += builder.createTextElement({width:2,height:2,font:'font_b', data:"#"+printerType.seq+'\n'});
            if(printerType.table_name){
                request += builder.createTextElement({width:2,height:2,font:'font_a', data:"Table:"+printerType.table_name+'\n\n'});
            }
            if(printerType.order_type !=1 ){
                request += builder.createAlignmentElement({position:'center'});
                request += builder.createTextElement({width:2,height:2,font:'font_a',invert:true, data:"<<TO GO>>"+'\n'});


                request += builder.createAlignmentElement({position:'left'});
                request += builder.createTextElement({width:2,height:2,font:'font_b', invert:false,data:"PickUp Time:"+new Date(printerType.order_start).toLocaleTimeString()+'\n'});
                request += builder.createTextElement({width:1,height:1,font:'font_a', invert:false,data:"Phone:"+printerType.phone+'\n\n'});
            }
            for(var i= 0; i<obj.length;i++){
                for(var j in printNameList) {
                    var name = obj[i][printNameList[j]];
                    if(name) {
                        if(j>0) name = "("+name+")";
                        if(j==printNameList.length-1) name += "\n";
                        request += builder.createTextElement({width:2,height:2,font:'font_b', data:name});
                    }
                }

                request += builder.createTextElement({width:1,height:1,font:'font_a', data:"Quantity : "+obj[i].quantity+'\n'});
                if(obj[i].remark){
                    request += builder.createTextElement({width:1,height:1,font:'font_a', data:"Remark : "+obj[i].remark+'\n\n'});
                }

            }



            break;

    }

    request += builder.createCutPaperElement({feed:true});

    sendMessage(url,request,onSuccess,onFailure);
}

function printerItemToKitchen(setting){
    setting = setting || {};

    var url = setting.url;
    var obj = setting.itemArray;
    var printerType = setting.orderInfo;
    var printNameList = setting.nameList || ['prodName','prodNameLang']; //['prodName'], ['prodNameLang'], ['prodName','prodNameLang'], ['prodNameLang','prodName']
    var onSuccess = setting.onSuccess;
    var onFailure = setting.onFailure;

    url = 'http://'+ url +'/StarWebPRNT/SendMessage';
    var builder = new StarWebPrintBuilder();
    //console.log(obj);
    var request = '';
    /**
     * Temp for test
     * @type {*}
     */
    var params ={};
    params.paperWidth = 'inch3DotImpact' ;
    //Object.copy(obj,params,['prodName','prodNameLang','remark','quantity','tableName','orderId'])
//    params.prodName = obj.prodName ;
//    params.prodNameLang = obj.prodNameLang;
//    params.remark = obj.remark;
//    params.quantity = obj.quantity;
//    params.tableId = obj.tableId;
//    params.tableName = obj.tableName;
//    params.orderId = obj.orderId;

    request += builder.createInitializationElement();

    switch (params.paperWidth) {
        case 'inch3DotImpact' :
            request += builder.createTextElement({characterspace:0, codepage:'utf8' ,font:'font_a'});

            request += builder.createTextElement({width:2,height:2,font:'font_b', data:"#"+printerType.seq+'\n'});
            if(printerType.table_name){
                request += builder.createTextElement({width:2,height:2,font:'font_a', data:"Table:"+printerType.table_name+'\n\n'});
            }
            if(printerType.order_type !=1 ){
                request += builder.createAlignmentElement({position:'center'});
                request += builder.createTextElement({width:2,height:2,font:'font_a',invert:true, data:"<<外卖>>"+'\n'});
                request += builder.createAlignmentElement({position:'left'});
                request += builder.createTextElement({width:2,height:2,font:'font_b', invert:false,data:"PickUp Time:"+new Date(printerType.order_start).toLocaleTimeString()+'\n\n'});
            }
            for(var i= 0; i<obj.length;i++){
                for(var j in printNameList) {
                    var name = obj[i][printNameList[j]];
                    if(name) {
                        if(j>0) name = "("+name+")";
                        if(j==printNameList.length-1) name += "\n";
                        request += builder.createTextElement({width:2,height:2,font:'font_b', data:name});
                    }
                }

                request += builder.createTextElement({width:1,height:1,font:'font_a', data:"Quantity : "+obj[i].quantity+'\n'});
                if(obj[i].remark){
                    request += builder.createTextElement({width:1,height:1,font:'font_a', data:"Remark : "+obj[i].remark+'\n\n'});
                }

            }



            break;

    }

    request += builder.createCutPaperElement({feed:true});

    sendMessage(url,request,onSuccess,onFailure);
}


function printerToKitchen(setting){
    setting = setting || {};
    var objArray = setting.itemArray;
    var onFailure = setting.onFailure;
    if(objArray == null || objArray.length <1){
        if(_.isFunction(onFailure)) {
            onFailure('error');
        }
        return;
    }else{

        var i = 0,j=objArray.length;
        /*if(i<j){
            var sh = setInterval(function(){
                printerItemToKitchen(url,objArray[i]);
                i++;
                if(i>=j){
                    clearInterval(sh);
                }
            },2000)
        }*/
        //printerItemToKitchen(url,printerType,objArray,onSuccess,onFailure);
        printerItemToKitchen(setting);
        /*for(; i<j ;i++){
            printerItemToKitchen(url,objArray[i]);
        }*/
    }
}

var g_printer = {
    TYPE: {KITCHEN:1,FRONT:0},
    kitchen : {ip:null},
    front : {ip:null},
    printers : null
};
stringLeftTrim = function(str,length){
    var strLength = (str+"").length;
    var spaceStr = "";
    for(var i = strLength; i<length;i++){
        spaceStr += " ";
    }
    return spaceStr+str;
}
stringRightTrim = function(str,length){
    var strLength = (str+"").length;
    var spaceStr = "";
    for(var i = strLength; i<length;i++){
        spaceStr += " ";
    }
    return str+spaceStr;
}

stringCenterTrim = function(str1,str2,length){

    var spaceStr = "";
    for(var i=0; i< length-(str1.length+str2.length)%42; i++){
        spaceStr += " ";
    }
    var allString = str1 +spaceStr+str2;
    var allLength = allString.length;
    var allArray = [];
    var i = 0;
    while(allLength>length){
        allArray.push(allString.substring(i,i+length));
        allLength = allLength - length;
        i = i+ length;
    }
    allArray.push(allString.substring(i,i+allLength));
    if(allArray.length>1){
        return allArray.join('\n');
    }else{
        return allString;
    }

}
g_printer.init = function(printers) {
    this.printers = printers;
    _.forEach(printers,function(_p){
        var n_init_count = 0;
        if(g_printer.kitchen.ip==null) {
            if(_p.type==g_printer.TYPE.KITCHEN) {
                g_printer.kitchen.ip = _p.ip;
            }
        }
        else
            n_init_count++;

        if(g_printer.front.ip==null) {
            if(_p.type==g_printer.TYPE.FRONT) {
                g_printer.front.ip = _p.ip;
            }
        }
        else
            n_init_count++;

        //all done
        if(n_init_count==2) {
            return false;
        }
    });
};

g_printer.kitchen.print = function(setting) {
    setting = setting || {};
    var onFailure = setting.onFailure;
    if(this.ip && this.ip.length>0) {
        //printerToKitchen(this.ip,printerType,objArray,onSuccess,onFailure);
        setting.url = this.ip;
        printerToKitchen(setting);
    }
    else {
        if(_.isFunction(onFailure)) {
            onFailure('No related printer');
        }
        WarningBox('No related printer');
    }
};

g_printer.kitchen.destroy = function() {
    this.ip = null;
};

g_printer.front.destroy = function() {
    this.ip = null;
};

g_printer.front.printInvoice = function(setting) {
    setting = setting || {};
    var onFailure = setting.onFailure;
    if(this.ip && this.ip.length>0) {
        setting.url = this.ip;
        printerInvoice(setting);
    }
    else {
        if(_.isFunction(onFailure)) {
            onFailure('No related printer');
        }
        WarningBox('No related printer');
    }
};

g_printer.front.printForWaiter = function(setting) {
    setting = setting || {};
    var onFailure = setting.onFailure;
    if(this.ip && this.ip.length>0) {
        setting.url = this.ip;
        printerForWaitor(setting);
    }
    else {
        if(_.isFunction(onFailure)) {
            onFailure('No related printer');
        }
        WarningBox('No related printer');
    }
};
