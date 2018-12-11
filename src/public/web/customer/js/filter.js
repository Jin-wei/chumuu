/**
 * Created by md on 14-7-9.
 */


/**
 * @Author : Ken
 * @Date : 2014-07-07
 * @filter_name : star
 * @attributes:
 *   rating     : the rating
 * @example
 * [example 1]
 *   {{3.4 | star}}
 * */
app.filter('star',function(){
    return function(rating){
        if(rating-parseInt(rating)<0.5)
            return parseInt(rating);
        else
            return parseInt(rating)+0.5;
    };
});

app.filter('int',function(){
    return function(value){
        return parseInt(value);
    };
});

app.filter('nullFilter',function(){
    return function(value,params){
        console.log(value,params);
    };
});
app.filter('isBind',function(){
    return function(type) {
        if(type==0){
            return "成功"
        }else if(type==1){
            return "失败"
        }
    };
});

app.filter('customCurrency', ["$filter", function ($filter) {
    return function(amount, currencySymbol){
        var currency = $filter('currency');

        if(amount < 0){
            return currency(amount, currencySymbol).replace("(", "").replace(")", "").replace(currencySymbol, currencySymbol+"-");
        }

        return currency(amount, currencySymbol);
    };
}]);