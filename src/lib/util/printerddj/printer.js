//引入编码模块
var iconv = require("iconv-lite");
//引入 printhelper 模块
var printhelper = require("./printhelper.js");
//设备编号
var uuid = "87c7e6cc06206311";


//用户绑定
function userBind(req, res, next) {
    var data ={
        Uuid:uuid,
        UserId:"001" //0改成您系统的用户编号（自己定义）最好是数字
    };
    printhelper.userBind(data,function(result){
        console.log(result);
        next();
	});
}

// //获取设备状态
function getDeviceState(req,res,next){
    data = {Uuid:uuid};
    printhelper.getDeviceState(data,function(result){
        console.log(result);
        next();
    });
}
// //提交打印
function printContent(req,res,next){
    var content = "          厨目打印测试\n";
    content+='鱼香肉丝                    1份\n';
    content+='番茄炒蛋                    1份\n';
    content+='宫爆鸡丁                    1份\n';
    content+='小计                        30元';

    var b = new Buffer(iconv.encode(content,'GBK'));
    content= b.toString("base64");
    var jsonContent="[{\"Alignment\":0,\"BaseText\":\"" + content + "\",\"Bold\":0,\"FontSize\":0,\"PrintType\":0}]";
    data = {
        Uuid:uuid,
        PrintContent:jsonContent,
        OpenUserId:"160862" //改成用户设备绑定返回的OpenUserId即可
    }

    printhelper.printContent(data,function(result){
        console.log("=="+result);
    });
}

module.exports = {
    userBind : userBind,
    getDeviceState : getDeviceState,
    printContent : printContent
};