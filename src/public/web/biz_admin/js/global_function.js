/**
 * Created by Josh on 2/15/16.
 */

//move page-content a little bit down in case of tabs cover part of it
function SetPositionOfPageContent() {
    if('block' == $("#menu-toggler").css("display")) {
        $("#ngViewDiv").css("paddingTop","50px");
    }
    else {
        $("#ngViewDiv").css("paddingTop","0px");
    }
}

function OnViewLoad() {
    SetPositionOfPageContent();

    $('[data-rel=tooltip]').tooltip({container:'body'});
    $('[data-rel=popover]').popover({container:'body'});
    $('.date-picker').datepicker({autoclose:true}).next().on(ace.click_event, function(){
        $(this).prev().focus();
    });
    //limitation of input
    $('.input-mask-number').keypress(function(event){
        var key = event.keyCode;
        if(key>=48 && key<=57) //0-9
            return true;
        return false;
    });
    $('.input-mask-price').keypress(function(event){
        var key = event.keyCode;
        if(key>=48 && key<=57) //0-9
            return true;
        if(key==46) { //[.] for float
            var val = $(this).val();
            if(val.length>0 && val.indexOf('.')==-1)
                return true;
        }
        return false;
    });
    //set related tab to active when refresh page with routing information
    var routePath = window.location.hash;
    if(routePath.length>0) {
        $(".nav-list .active").removeClass('active');
        $(".nav-list>li>a").each(function(){
            var link = $(this).attr("href");
            if(link.indexOf('#/')==0)
                link = link.substring(2);
            if(routePath.indexOf(link)>=0) {
                $(this).parent().addClass('active');
            }
        });
    }
}
