var Factual = require('factual-api');
var bizdao=require('./../lib/dao/bizdao.js');

var MY_KEY='NZSCo61NfwxhXW9rx9BKmbqu4rhbYDoEqYS2iBY4';
var MY_SECRET='mjmFKzrs3xlyI30oA6lpGgqysTEYtsT4pgx8kMkK';

var factual = new Factual(MY_KEY, MY_SECRET);

/*factual.get('t/places',{filters:{"$and":[{"country":{"$eq":"US"}},{"region":{"$eq":"CA"}},{"locality":{"$eq":"FREMONT"}}]}}, function (error, res) {
 //console.log("show "+ res.included_rows +"/"+ res.total_row_count +" rows:", res.data);
 console.dir(res);
 });*/
/*factual.get('t/restaurants-us',{geo:{"$within":{"$rect":[[34.06110,-118.42283],[34.05771,-118.41399]]}},offset:40,limit:20,"include_count":"true"}, function (error, res) {
 //console.log("show "+ res.included_rows +"/"+ res.total_row_count,res.data);
 console.dir(res);
 });*/

var total=0;
var totalRead=0;
var url="/t/restaurants-us?filters=";
var filter='{"$and":[{"country":{"$eq":"US"}},{"region":{"$eq":"CA"}},{"locality":{"$eq":"Fremont"}},{"cuisine":{"$includes":"Chinese"}}]}';

var offset=0;
var rowc=0;
var obj={};
var inserted=0;

function getResByFilter(off){

    factual.get(url+filter,{"include_count":"true",offset:off}, function (error, res) {
        if (res){
        total=res.total_row_count;
        rowc=res.included_rows;
        totalRead+=rowc;
        offset=totalRead;
        //load record into database
        addBiz(res.data,function(err,size){
            if (err){
                throw err;
            }
            inserted+=size;
            if (offset<total){
                getResByFilter(offset);
            }
        });
        }
        console.log('inserted biz count: ' +inserted);
    });
}

function showBizAtts(data){
    var i=0;

    for (i=0;i<data.length;i++){
        for (var pname in data[i]){
            if (! obj[pname]){
                obj[pname]=(data[i])[pname];
            }
        }
    }
}

 function addBiz(data, callback){
     var i;
     var count=0;
     for (i=0;i<data.length;i++){
         /*console.dir(data[i]);*/
         data[i].active=true;
         if (data[i].neighborhood){
             data[i].neighborhood=data[i].neighborhood.join();

         }
         if (data[i].hours){
            data[i].hours = null;
         }
         if (data[i].hours_display){
            console.log(data[i].hours_display);
            data[i].hours_display=data[i].hours_display.toString();
         }
         if (data[i].cuisine){
             data[i].category=data[i].cuisine.join();

         }

         if (data[i].founded){
             data[i].opened_date=new Date(data[i].founded,0,1);

         }

         if (data[i].locality){
            data[i].city=data[i].locality;
         }
         data[i].state=data[i].region;
         data[i].zipcode=data[i].postcode;
         data[i].phone_no=data[i].tel;
         if(data[i].owner){
            data[i].owner_name=data[i].owner;
         }
         data[i].note=data[i].factual_id;
         if (data[i].price){
            data[i].price_level=data[i].price;
         }

         var service=[];
         var si=0
         if (data[i].meal_breakfast){
             service[si++]='breakfast';
         }
         if (data[i].meal_lunch){
             service[si++]='lunch';
         }
         if (data[i].meal_dinner){
             service[si++]='dinner';
         }
         if (data[i].meal_takeout){
             service[si++]='takeout';
         }
         if (data[i].meal_cater){
             service[si++]='cater';
         }
         if (data[i].meal_delivery){
             service[si++]='delivery';
         }
         if (si>0){
             data[i].services=service.join();
         }

             var option=[];
             var oi=0;

             if (data[i].options_lowfat){
                 option[oi++]='lowfat';
             }
             if (data[i].options_glutenfree){
                 option[oi++]='glutenfree';
             }
             if (data[i].options_healthy){
                 option[oi++]='healthy';
             }
             if (data[i].options_vegan){
                 option[oi++]='vegan';
             }
             if (data[i].options_vegetarian){
                 option[oi++]='vegetarian';
             }
             if (data[i].options_organic){
                 option[oi++]='organic';
             }
             if (oi>0){
                 data[i].options=option.join();
             }


         bizdao.createBiz(data[i],function (err,id){
           if (err){
               throw err;
           }else{
               count+=1;
               if (count==data.length){
                   callback(null, count);
               }
           }
         });
     }
 }
getResByFilter(offset);

//load asian pearl
/*
factual.get('/t/places', {q:"South China Legend", filters:filter}, function(error, res) {
    if (res && res.data){
        addBiz(res.data,function(err,count){
            console.log("Add biz count:"+count);
            console.dir(res.data);
        });
    }
});

//process.exit(0);


/*factual.get('/t/restaurants-us/schema', function (error, res) {
 console.log(res);
 });*/
