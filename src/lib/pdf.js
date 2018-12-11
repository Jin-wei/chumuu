//var imagedao = require('./resource/imagedao.js');
//var fs = require('fs');
var sysMsg = require('./util/SystemMsg.js');
var sysError = require('./util/SystemError.js');
var prodTypeDao = require('./dao/prodtypedao.js');
var prodDao = require('./dao/ProdDao.js');
var bizDao = require('./dao/bizdao.js');
var wkhtmltopdf = require('wkhtmltopdf');
var handlebars = require("handlebars");
var fs = require('fs');
var encrypt = require('./util/Encrypt.js')
//var qr=require('qr-image');
var serverLogger = require('./util/ServerLogger.js');
var logger = serverLogger.createLogger('Pdf.js');
var extend=require('extend');


//everyone
//Test function; return html, not PDF, easy to debug
function getBizMenuPdfNew(req, res, next) {
    var id = req.params.bizId;
    var host=req.header('Host');
    var proto=req.isSecure()?'https://':'http://';

    var ver = req.params.ver;
    if(!ver)
        ver = '';

    //console.log(req.header('Port'));
    bizDao.search({biz_id:id}, function (err, bizRows){
        if (err){
            logger.error(' getBizMenuPdfNew ' + err.message);
            return next(err);
        }
        var biz=bizRows[0];
        prodTypeDao.searchBizProdType({biz_id:id},function (err, types){
            if (err){
                logger.error(' getBizMenuPdfNew ' + err.message);
                return next(err);
            }
            prodDao.searchBizProdBase({bizId:id},function(err,prods){
                var data=_getData(biz,types,prods);
                data.urlRoot=proto+host;
                data.query = req.query;
                //console.log('=============================url');
                //console.dir(data.urlRoot);
                _writePdf2('menupdf'+ver+'.html',data,req,res,next);
            });
        });
    });
}
//everyone
function getBizMenuPdf(req, res, next) {
    var id = req.params.bizId;
    var host=req.header('Host');
    var proto=req.isSecure()?'https://':'http://';
    var pageSize = req.params.size;

    if (pageSize ==null){
        pageSize='Letter';
    }

    //console.log(req.header('Port'));
    bizDao.search({biz_id:id}, function (err, bizRows){
       if (err){
           logger.error(' getBizMenuPdf ' + err.message);
           return next(err);
       }
       var biz=bizRows[0];
        prodTypeDao.searchBizProdType({biz_id:id},function (err, types){
            if (err){
                logger.error(' getBizMenuPdf ' + err.message);
                return next(err);
            }
            //#288 only active prod
            prodDao.searchBizProdBase({bizId:id,active:1},function(err,prods){
                var data=_getData(biz,types,prods);
                data.urlRoot=proto+host;
                data.query = req.query;
                //console.log('=============================url');
                //console.dir(data.urlRoot);
                _writePdf('menupdf.html',{pageSize:pageSize},data,req,res,next);
            });
        });
    });
}

function getMyTablePdf(req, res, next) {
    var host=req.header('Host');
    var proto=req.isSecure()?'https://':'http://';
    var myTableStr = req.params['myTable'];
//    console.log(myTableStr);
    if(myTableStr) {
        myTableStr = decodeURIComponent(myTableStr);
//        console.log(myTableStr);
        myTableStr = encrypt.base64Decode(myTableStr);
//        console.log(myTableStr);
        //for JSON.parse
        myTableStr = myTableStr.replace(/[\u0000-\u001f\u007f\u0080-\u009f]/g,'');
    }
    var myTable = JSON.parse(myTableStr);
    if(!myTable) {
        myTable = {};
    }

    var data = {};
    data.urlRoot = proto+host;
    data.myTable = myTable;
   // console.dir("============");
   // console.dir(myTable);


    _writePdf('my_table_pdf.html', {orientation:'Portrait',
        marginLeft:10,
        marginRight:10},data,req,res,next);
};

//Test function; return html, not PDF, easy to debug
function _writePdf2(template,data,req,res,next){
    var source;
    fs.readFile(__dirname+'/util/pdfTemplate/'+template, {encoding:'utf8'}, function (err, tpldata) {
        if (err) {
            logger.error(' _writePdf2 ' + err.message);
            throw err;
        }
        //console.log(tpldata);
        source=tpldata;
        // var qrcode_file=__dirname+'/../uploads/'+data.biz.biz_id+'.png';
        // console.log(qrcode_file);
        // var qr_png = qr.image('http://www.tru-menu.com', { type: 'png' });
        // qr_png.pipe(fs.createWriteStream(qrcode_file));
        // data.qrcode=qrcode_file;

        var template = handlebars.compile(source);
        var result = template(data);

        //console.log(result);

        res.set("cache-control","no-cache");
//        res.set('content-type', 'application/pdf');
        res.set('content-type', 'text/html');
        //res.set("content-length",result.length);
        res.writeHead(200);
        res.write(result);
        res.end();
        //next(false);

        //console.log('========================my footer')
        //console.log(data.urlRoot+'/web/view/pdffooter.html');
//       var st=wkhtmltopdf(result,{orientation:'Landscape',pageSize:'A4',marginBottom:20,footerHtml:data.urlRoot+'/business/view/pdffooter.html'});

//        st.pipe(res);
//        st.once('end', function () {
//            fs.unlink(qrcode_file);
//            next(false);
//        });
    });
}
function _writePdf(template,page,data,req,res,next){
    var source;
    var defaultPage= {
        orientation:'Landscape',
        pageSize:'Letter',
        marginBottom:15,
        marginLeft:0,
        marginRight:0,
        marginTop:10,
        footerHtml:data.urlRoot+'/business/view/pdffooter.html'
    };
    var pageSetting=defaultPage;
    extend(true,pageSetting,page);

    var PAGE_CONFIG = {
        A4:{
            page: {
                row_width:'1280px',
                row_height:'770px',
                small_font:'11pt',
                big_font:'13pt'
            }
        },
        Letter:{
            page: {
                row_width:'1130px',
                row_height:'750px',
                small_font:'11pt',
                big_font:'13pt'
            }
        },
        Tabloid:{
            page: {
                row_width:'1580px',
                row_height:'920px',
                small_font:'12pt',
                big_font:'15pt'
            }
        }
    };
    var PAGE_DEFAULT = {
        item_padding: '0px',
        item_margin: '0px'
    };

    if(PAGE_CONFIG[pageSetting.pageSize])
        extend(true,data,PAGE_CONFIG[pageSetting.pageSize]);
    else
        extend(true,data,PAGE_CONFIG['Letter']);

    extend(true,data.page,PAGE_DEFAULT);
    extend(true,data.page,data.query);
    fs.readFile(__dirname+'/util/pdfTemplate/'+template, {encoding:'utf8'}, function (err, tpldata) {
            if (err) {
                logger.error(' _writePdf ' + err.message);
                throw err;
            }
            //console.log(tpldata);
            source=tpldata;
       // var qrcode_file=__dirname+'/../uploads/'+data.biz.biz_id+'.png';
       // console.log(qrcode_file);
       // var qr_png = qr.image('http://www.tru-menu.com', { type: 'png' });
       // qr_png.pipe(fs.createWriteStream(qrcode_file));
       // data.qrcode=qrcode_file;

        var template = handlebars.compile(source);
        var result = template(data);

        //console.log(result);

        res.set("cache-control","no-cache");
        res.set('content-type', 'application/pdf');
//        res.set('content-type', 'text/html');
        //res.set("content-length",result.length);
        res.writeHead(200);
//        res.write(result);
//        res.end();
        //next(false);

        //console.log('========================my footer')
        //console.log(data.urlRoot+'/web/view/pdffooter.html');
       var st=wkhtmltopdf(result,{orientation:pageSetting.orientation,pageSize:pageSetting.pageSize,marginBottom:pageSetting.marginBottom,marginLeft:pageSetting.marginLeft,marginRight:pageSetting.marginRight,marginTop:pageSetting.marginTop,footerHtml:pageSetting.footerHtml});

        st.pipe(res);
//        st.once('end', function () {
////            fs.unlink(qrcode_file);
//            //next(false);
//            return ;
//        });
    });
}

function _getData(biz,types,prods){
    //console.log('====================prods');
    //console.dir(prods);
    var i= 0,j= 0;
    var orderCodeArr = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for (i=0;i<types.length;i++){
        var typesProds=[];
        types[i].prods=typesProds;
        var orderChar = orderCodeArr[i%26];
        for (j=0;j<prods.length;j++){
            if (prods[j].type_id==types[i].type_id){
                //Ken add pdf* , will be used in template
                prods[j].pdfOrderCode = orderChar+(typesProds.length+1);
                if(j%2==0)
                    prods[j].pdfOdd = true;
                typesProds.push(prods[j]);
                if ((! types[i].img_url) && prods[j].img_url){
                    types[i].img_url=prods[j].img_url;
                }
            }
        }
    }
    if (biz.hours && biz.hours.length>0){
        biz.hours_display = convertHoursToDisplay(biz.hours);
        if(biz.hours_display.length==0)
            biz.hours_display = null;
    }else{
        biz.hours_display = null;
    }
    //#243
    var phones = biz.phone_no ? biz.phone_no.split(/[,;]/) : [];
    biz.phones = [];
    for(var i=0;i<phones.length;++i) {
        var _o = phones[i];
        _o = _o.trim();
        if(_o.length>0)
            biz.phones.push(_o);
    }
    //console.log('====================biz');
    //console.dir(biz);
    //console.dir(types);
    return {biz:biz,type:types,home_site:'www.tru-menu.com'};
}

function convertHoursToDisplay( hoursJsonStr){
    var weekDayArray = [ 'Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    var fullWeekDayArray = [ 'monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
    if(hoursJsonStr == null || hoursJsonStr.trim() == "" || hoursJsonStr.trim() == "{}"){
        return [];
    }
    try{
        var hoursJson =  eval("(" + hoursJsonStr + ")");
        var hoursObjArray = [];

        for(var i =0 , j=fullWeekDayArray.length; i<j ; i++){

            var dayHours = hoursJson[fullWeekDayArray[i]];
            if(dayHours != null && dayHours.length>0 && dayHours[0].length>0){
                var hoursObj = {};
                hoursObj.day = weekDayArray[i];
                for(var m= 0,n=dayHours.length ; m<n; m++){
                    var startArray = dayHours[m][0].split(":");
                    var endArray = dayHours[m][1].split(":");
                    var segStartHour = Number(startArray[0]);
                    var segStartFlag = "am";
                    var segEndFlag = "am";
                    var segEndHour = Number(endArray[0]);
                    if(segStartHour==0){
                        segStartHour = 12;
                        segStartFlag = "am"
                    }else if(segStartHour >12){
                        segStartHour = segStartHour -12;
                        segStartFlag = "pm";
                    }
                    if(segEndHour==0){
                        segEndHour = 12;
                        segEndFlag = "am"
                    }else if(segEndHour >12){
                        segEndHour = segEndHour -12;
                        segEndFlag = "pm";
                    }
                    dayHours[m] = segStartHour+":"+startArray[1]+segStartFlag + "-" + segEndHour+":"+endArray[1]+segEndFlag;
                    //dayHours[m] = dayHours[m].join('-');
                }
                hoursObj.hours = dayHours.join(', ');
                var hoursObjArrLen = hoursObjArray.length;
                if(hoursObjArrLen>0 && hoursObjArray[hoursObjArrLen -1].hours == hoursObj.hours){
                    var dayName = hoursObjArray[hoursObjArrLen -1].day;
                    hoursObjArray[hoursObjArrLen -1].day = dayName.split('-')[0]+"-" +weekDayArray[i];
                }else{
                    hoursObjArray.push(hoursObj);
                }

            }


        }
        if(hoursObjArray == null || hoursObjArray.length ==0){
            return [];
        }
        if(hoursObjArray.length==1 && hoursObjArray[0].day=="Mon-Sun"){
            hoursObjArray[0].day="Open Daily";
        }

        //console.log("\n\n\n");
        //console.log(hoursObjArray);
        for(var x= 0, y=hoursObjArray.length ; x<y ;x++){
            hoursObjArray[x] =  hoursObjArray[x].day +" " + hoursObjArray[x].hours;
        }
        return hoursObjArray;
    }catch(error){
        //logger.warn(' convert hours ' + 'false');
        return [];
    }

}

///--- Exports
module.exports = {
    getBizMenuPdf: getBizMenuPdf,
    getBizMenuPdfNew: getBizMenuPdfNew,
    getMyTablePdf: getMyTablePdf
};