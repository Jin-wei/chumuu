/**
 * Created by ibm on 14-8-8.
 */

var assert = require("assert");
var encrypt = require("../lib/util/Encrypt.js");


exports.test = function (client) {

    describe('service: util test', function () {

        var text = '{"bizId":103072,"bizKey":"asian_pearl","bizName":"Fremont Asian Pearl","bizNameLang":"亚洲珍珠","ver":1,"prods":[{"n":"Mission Public one","nl":null,"pc":9909.99,"qty":"1","desc":"fdafds? &=faaatt"},{"n":"3333111","nl":"fd","pc":100,"qty":"2","desc":"aa333ffffafd"},{"n":"test menu","nl":"menu lang","pc":12.33,"qty":1},{"n":"Salt & Pepper Smelt Fish","nl":"椒鹽白飯魚","pc":3.99,"qty":1},{"n":"Salt & Pepper Tofu","nl":"椒鹽豆腐","pc":3.99,"qty":1},{"n":"Roast Duck","nl":"脆皮燒鴨","pc":6.8,"qty":1},{"n":"Chicken Feet in Abalone Sauce","nl":"鮑汁鳳爪","pc":6.8,"qty":1}],"sub_total":"10143.90","taxRate":8.5,"tax_total":"862.23","total_price":"11006.13"}';
        var encodeText = "";
        var decode = 'eyJiaXpJZCI6MTAzMDcyLCJiaXpLZXkiOiJhc2lhbl9wZWFybCIsImJpek5hbWUiOiJGcmVtb250IEFzaWFuIFBlYXJsIiwiYml6TmFtZUxhbmciOiLkuprmtLLnj43nj6AiLCJ2ZXIiOjEsInByb2RzIjpbeyJuIjoiTWlzc2lvbiBQdWJsaWMgb25lIiwibmwiOm51bGwsInBjIjo5OTA5Ljk5LCJxdHkiOiIxIiwiZGVzYyI6ImZkYWZkcz8gJj1mYWFhdHQifSx7Im4iOiIzMzMzMTExIiwibmwiOiJmZCIsInBjIjoxMDAsInF0eSI6IjIiLCJkZXNjIjoiYWEzMzNmZmZmYWZkIn0seyJuIjoidGVzdCBtZW51IiwibmwiOiJtZW51IGxhbmciLCJwYyI6MTIuMzMsInF0eSI6MX0seyJuIjoiU2FsdCAmIFBlcHBlciBTbWVsdCBGaXNoIiwibmwiOiLmpJLpub3nmb3po6=prZoiLCJwYyI6My45OSwicXR5IjoxfSx7Im4iOiJTYWx0ICYgUGVwcGVyIFRvZnUiLCJubCI6Iuakkum5veixhuiFkCIsInBjIjozLjk5LCJxdHkiOjF9LHsibiI6IlJvYXN0IER1Y2siLCJubCI6IuiEhuearueHkum0qCIsInBjIjo2LjgsInF0eSI6MX0seyJuIjoiQ2hpY2tlbiBGZWV0IGluIEFiYWxvbmUgU2F1Y2UiLCJubCI6Iumukeaxgemzs+eIqiIsInBjIjo2LjgsInF0eSI6MX1dLCJzdWJfdG90YWwiOiIxMDE0My45MCIsInRheFJhdGUiOjguNSwidGF4X3RvdGFsIjoiODYyLjIzIiwidG90YWxfcHJpY2UiOiIxMTAwNi4xMyJ9';
        it('should create a encode text', function (done) {
            encodeText = encrypt.base64Encode(text);
            assert(encodeText.length>0,"encode text should be get");
            done();
        });

        it('should get a list of product', function (done) {
            var decodeText = encrypt.base64Decode(decode);
            assert(decodeText == text , "decode text should be success");
            done();
        });
    });

};