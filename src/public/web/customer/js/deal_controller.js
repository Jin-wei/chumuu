/**
 * Created by Ken on 2014-8-8.
 */
app.controller("dealController", ['$rootScope','$scope','$routeParams','$mp_ajax','$location','$q',
function($rootScope,$scope,$routeParams,$mp_ajax,$location,$q) {
    $rootScope.setTitle($rootScope.L.deal_of_the_day);
    var googleSEO = [];
    googleSEO.titleContent = 'Chumuu daily deals - Best deals of the day from your local restaurants';
    googleSEO.descriptionContent = 'Save money with the best deals online with Chumuu Deals. Deals are updated daily, so check back for the deepest discounts from your favorite restaurants';
    googleSEO.keywordsContend = 'Chumuu,restaurant deals, deal';
    $rootScope.setGoogleSEO(googleSEO);

    $mp_ajax.promiseGet('/cust/do/bizPromo').then(function(data){
        TranslateMenuItemImageUrl(data,'biz_img_url');
        _.forEach(data,function(_o){
            _o.bizKey = _o.biz_unique_name || _o.biz_id;
            _o.phoneArr = _o.phone_no ? _o.phone_no.split(/[,;]/) : [];
            _o.phoneNo = _o.phoneArr[0];
            if($rootScope.coords && $rootScope.coords.latitude) {
                var distance = GetDistance($rootScope.coords.latitude,$rootScope.coords.longitude, _o.latitude, _o.longitude);
                if(!_.isNaN(distance))
                    _o.distance = distance;
            }
        });

        $scope.bizPromos = data;
        console.log($scope.bizPromos);
    });

    $scope.prodPromos = [];
    $mp_ajax.promiseGet('/cust/do/prodPromo').then(function(data){
        TranslateMenuItemImageUrl(data,'prod_img_url');
        for(var i in data) {
            var promo = data[i];
            promo.bizKey = promo.biz_unique_name || promo.biz_id;
            promo.priceAfterDiscount = calcPriceAfterDiscount(promo,promo);
            //#141
            if(promo.discount_amount>0 || promo.discount_pct>0)
                $scope.prodPromos.push(promo);
        }
        console.log($scope.prodPromos);
    });

    //function
    function calcPriceAfterDiscount (item,promo) {
        var retVal = 0;
        if(promo.discount_pct>0) {
            retVal = MathUtil.max(item.price*(1-promo.discount_pct*0.01),0);
        }
        else if(promo.discount_amount>0) {
            retVal = MathUtil.max(item.price - promo.discount_amount,0);
        }
        else
            retVal = item.price;
        return retVal;
    };



    jQuery(document).ready(function(){
        OnViewLoad();
    });
}]);