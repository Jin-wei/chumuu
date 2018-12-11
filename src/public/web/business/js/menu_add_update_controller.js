/**
 * Created by Ken on 2014-4-18.
 */

app.controller("menuAddAndUpdateController", ['$rootScope','$scope','$routeParams','$mp_ajax','$location','$mp_json','$window',function($rootScope,$scope,$routeParams,$mp_ajax,$location,$mp_json,$window) {

    var L = $rootScope.L;
    $scope.bizId = $rootScope.bizId;
    $scope.typeId = $routeParams.typeId;
    $scope.menuItemId = $routeParams.menuItemId;

//    $scope.formURL = "";
    //set spinner
    $('#menu_add_spiciness').ace_spinner({
        value:0, min:0, max:5, step:1, on_sides: true,
        icon_up:'icon-plus smaller-75',
        icon_down:'icon-minus smaller-75',
        btn_up_class:'btn-danger' ,
        btn_down_class:'btn-success'
    });

    //change style from ace framework to ourselves
    $('#menu_add_spiciness').parent().parent().css("width","");

    //set image picker
    $('#menu_add_image').ace_file_input({
        style:'well',
        btn_choose:'Drop menu item image here or click to choose',
        btn_change:null,
        no_icon:'icon-cloud-upload',
        droppable:true,
        thumbnail:'fit'
    });

    $scope.menuItem = {};
    if(!angular.isUndefined($scope.typeId) && angular.isUndefined($scope.menuItemId)) {  //For create new menu item
        $scope.isAddPage = true;
//        $scope.title = L.create + ' ' + L.menu_item;
//        $scope.submitBtnTitle = L.submit;
        $scope.menuItem.togo = true; //set default value
        $scope.menuItem.active = true; //set default value
        $scope.menuItem.price = 0;
        $scope.menuItem.calorie = 0;
        console.log("This is menu_add page, typeId = " + $scope.typeId);
        //load menu types
        $mp_ajax.get('/biz/'+$scope.bizId+'/prodType',function(data) {
            //set default selected
            $scope.menuItem.type_id = $scope.typeId;
            $scope.menuTypes = data;
        });

        $scope.onMenuItemSubmit = function(menuItem) {
            //api expects integer on 'togo' and 'active' columns
            angular.element("#menu_add_togo").val($scope.menuItem.togo==true ? 1:0);
            angular.element("#menu_add_active").val($scope.menuItem.active==true ? 1:0);
            /**
             * param1 =  form's id
             * param2 =  url
             * param3 =  success function
             * */
             $mp_ajax.formPost('#menuItemForm','/biz/'+$scope.bizId+'/prod',
                function(data){
                    if(data.prodId>0) {
                        $location.path("/menu");
                        $scope.$apply(); //otherwise , menu page can't be loaded
                    }
                },function(data){
                    console.error("create menu item error, msg = "+data.responseJSON.message);
                }
            );
        };
    }
    else if(angular.isUndefined($scope.typeId) && !angular.isUndefined($scope.menuItemId)) {  //For Update menu item
        $scope.isUpdatePage = true;
//        $scope.title = L.update + ' ' + L.menu_item;
//        $scope.submitBtnTitle = L.save;
        console.log("This is menu_update page, menuItemId = " + $scope.menuItemId);
        //load menu item information
        $mp_ajax.get('/biz/'+$scope.bizId+'/prod/'+$scope.menuItemId,function(data){
            $scope.menuItem = data;
//            console.debug('menu item',data);
            angular.element("#menu_add_spiciness").val(data.spiciness);
            //checkbox dom needs boolean, but api provides integer(0/1), so need to translate it
            $mp_json.translateInteger2Boolean($scope.menuItem,['togo','active']);
        });
        //load menu types
        $mp_ajax.get('/biz/'+$scope.bizId+'/prodType',function(data){
            $scope.menuTypes = data;
        });
        //load promotion
        $mp_ajax.get('/biz/'+$scope.bizId+'/prod/'+$scope.menuItemId+'/promo',function(data){
            var promo = data[0];
            try{
                promo.start_date = DateUtil.format(promo.start_date,'MM/dd/yyyy');
                promo.end_date = DateUtil.format(promo.end_date,'MM/dd/yyyy');
            } catch(e) {}
            $scope.promotion = promo;
        });

        $scope.onMenuItemSubmit = function(isFormValid,menuItem) {
            if(!isFormValid) {
                return false;
            }
            var tmpObj = {};
            angular.copy(menuItem,tmpObj);
            tmpObj.name = menuItem.productName;
            tmpObj.spiciness = parseInt(angular.element("#menu_add_spiciness").val());
            $mp_json.translateBoolean2Integer(tmpObj);
            $mp_ajax.put('/biz/'+$scope.bizId+'/prod/'+$scope.menuItemId, tmpObj,function(data){
                if(data.succeed==true) {
                    $location.path("/menu");
                }
            },function(data){
                console.error(data);
            });
        }
    }

    $scope.onBack = function() {
        $location.path("/menu");
    };

    $scope.uploadMenuItemPicture = function() {
        $mp_ajax.formPost($('.form-inline'),'../biz/' + $scope.bizId + '/prod/' + $scope.menuItemId + '/image',function(success){
            $scope.menuItem.img_url = success;
        },function(error){

        });
    };

    $scope.deleteMenuItemPicture = function() {
        $mp_ajax.put('/biz/'+$scope.bizId+'/prod/'+$scope.menuItemId+'/clearImage',{}, function(data){
            if($scope.menuItem.img_url != null){
                if($scope.menuItem.img_url == null);
            }
            if($scope.menuItem.img_url == null){
                WarningBox("Product picture is already empty");
            }
            if(data.success == true){
                $scope.menuItem.img_url = null;
            }
        });
    };

    $scope.deleteMenuItem = function(item) {

        $( "#dialog-confirm" ).removeClass('hide').dialog({
            resizable: false,
            modal: true,
//            title: "",
//            title_html: true,
            buttons: [
                {
                    html: "<i class='icon-trash bigger-110'></i>&nbsp; "+ L.delete,
                    "class" : "btn btn-danger btn-xs",
                    click: function() {
                        var confirmDlg = $( this );
                        $mp_ajax.delete('/biz/'+item.biz_id+'/prod/'+item.prod_id,function(data){
                            //if server return succeed, remove it in angular's scope
                            if(data.succeed==true) {
                                confirmDlg.dialog( "close" );
                                $location.path("/menu");
                            }
                        });
                    }
                }
                ,
                {
                    html: "<i class='icon-remove bigger-110'></i>&nbsp; "+ L.cancel,
                    "class" : "btn btn-xs",
                    click: function() {
                        $( this ).dialog( "close" );
                    }
                }
            ]
        });

    };
    if($scope.isUpdatePage)
        uploadMenuItemImage($scope,$mp_ajax,L);
    //move page-content a little bit down in case of tabs cover part of it
    OnViewLoad();
}] );

function uploadMenuItemImage($scope,$mp_ajax,L){
    $.fn.editable.defaults.mode = 'inline';
    /*$.fn.editableform.loading = "<div class='editableform-loading'><i class='light-blue icon-2x icon-spinner icon-spin'></i></div>";
    $.fn.editableform.buttons = '<button type="submit"  class="btn btn-info editable-submit"><i class="icon-ok icon-white"></i></button>'+
        '<button type="button" class="btn editable-cancel"><i class="icon-remove"></i></button>';*/
    try {//ie8 throws some harmless exception, so let's catch it

        //it seems that editable plugin calls appendChild, and as Image doesn't have it, it causes errors on IE at unpredicted points
        //so let's have a fake appendChild for it!
        if( /msie\s*(8|7|6)/.test(navigator.userAgent.toLowerCase()) ) Image.prototype.appendChild = function(el){}

        var last_gritter
        $('#avatar').editable({
            type: 'image',
            name: 'image',
            value: null,
            image: {
                //specify ace file input plugin's options here
                btn_choose: L.select_picture,
                droppable: true,
                thumbnail:'fit',
                name: 'image',//put the field name here as well, will be used inside the custom plugin
                max_size: 4000000,//~4Mb
                on_error : function(code) {//on_error function will be called when the selected file has a problem
                    if(last_gritter) $.gritter.remove(last_gritter);
                    if(code == 1) {//file format error
                        last_gritter = $.gritter.add({
                            title: 'File is not an image!',
                            text: 'Please choose a jpg|gif|png image!',
                            class_name: 'gritter-error gritter-center'
                        });
                    } else if(code == 2) {//file size rror
                        last_gritter = $.gritter.add({
                            title: 'File too big!',
                            text: 'Image size should not exceed 4Mb !',
                            class_name: 'gritter-error gritter-center'
                        });
                    }
                    else {//other error
                    }
                },
                on_success : function() {
                    $.gritter.removeAll();
                }
            },
            url: function(params) {
                var deferred = new $.Deferred

                //if value is empty, means no valid files were selected
                //but it may still be submitted by the plugin, because "" (empty string) is different from previous non-empty value whatever it was
                //so we return just here to prevent problems
                var value = $('#avatar').next().find('input[type=hidden]:eq(0)').val();
                if(!value || value.length == 0) {
                    deferred.resolve();
                    return deferred.promise();
                }
                //normal upload
                $mp_ajax.formPost($('.form-inline'),'../biz/' + $scope.bizId + '/prod/' + $scope.menuItemId + '/image',function(success){
                    $scope.menuItem.img_url = success;
                    angular.element("#avatar").attr("src",'../image/'+success+'/l');
                    deferred.resolve({'status':'OK'});

                    if(last_gritter) $.gritter.remove(last_gritter);
                    last_gritter = $.gritter.add({
                        title: 'Picture Updated!',
                        text: '',
                        class_name: 'gritter-info gritter-center'
                    });
                    return deferred.promise();
                },function(error){
                    if(last_gritter) $.gritter.remove(last_gritter);
                    last_gritter = $.gritter.add({
                        title: 'Picture Updated Failed !',
                        text: error.message,
                        class_name: 'gritter-info gritter-center'
                    });
                    return deferred.promise();
                });
                return deferred.promise();
            },

            success: function(response, newValue) {
            }
        })
    }catch(e) {}
}
