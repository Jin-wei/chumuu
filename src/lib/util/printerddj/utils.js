var http = require("http");
var crypto1 = require("crypto");
var url = require("url");

var appid = "ccb8b9e79805";
var appsecret = "4a6a80b305e2f5b6e047";
var baseUrl = "www.open.mstching.com"; 
var utils = {	
	sendPost:function(action,data,callback){
		data = JSON.stringify(data);
		console.log(data);
		var urls = baseUrl+action+getParams();
		var opt ={
			method:"post",
			hostname:baseUrl,
			path:action+getParams(),
			headers:{
				"Content-Type": 'application/json; charset=UTF-8',  
				"Content-Length": data.length
			}
		}
		var req = http.request(opt,function(res){		
			var responseString = '';
			res.setEncoding('utf8');
			res.on('data',function(result){
				responseString += result;
			});
			res.on('err',function(e){
				console.log('----err-----',e);	
			});
			res.on('end',function(){
				callback(JSON.parse(responseString));
			});
		});
		req.write(data);
		req.end();	
	}
}
//获取参数
function getParams(){
	var nonce = Math.random()*899999999 + 100000000;
	nonce = parseInt(nonce, 10);
	var timestamp = Date.parse(new Date())/1000;
	var arrTmp = new Array(appsecret,nonce,timestamp);
	arrTmp.sort();
	arrStr = arrTmp.join("");
	var sha1 = crypto1.createHash("sha1");
	sha1.update(arrStr);
	var signStr = sha1.digest("hex");
	return "?appid="+appid+"&nonce="+nonce+"&timestamp="+timestamp+"&signature="+signStr;
}
module.exports=utils;