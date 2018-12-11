/**
 * Created by Ken on 2014-4-18.
 */

app.controller("menuTypeController", ['$rootScope','$scope','$routeParams','$mp_ajax','$location','$mp_json','$cookieStore','$q',function($rootScope,$scope,$routeParams,$mp_ajax,$location,$mp_json,$cookieStore,$q) {
    var L = $rootScope.L;

    $scope.menuTypes = [];
    $scope.menuTypeInputs = [];

    $mp_ajax.get('/biz/'+$rootScope.bizId+'/prodType',function(data){
        $scope.menuTypes = data;
        //menuTypeInputs is for menu type updating
        //set it as copy of menuTypes, this way will not change text when we change value of input then click cancel,
        $scope.menuTypeInputs = [];
        angular.copy(data,$scope.menuTypeInputs);
    });

    $scope.onMenuTypeSave = function(menuType,menuTypeInput) {
        console.log(menuTypeInput);
        if(menuType.name!=menuTypeInput.name || menuType.name_lang!=menuTypeInput.name_lang) {
            $mp_ajax.put('/biz/' + $rootScope.bizId + '/prodType/' + menuTypeInput.type_id, menuTypeInput,function (data) {
                menuType.name = menuTypeInput.name;
                menuType.name_lang = menuTypeInput.name_lang;
                menuType.isEdit = false;
            },function (data) {
                console.error(data);
            });
        }else {
            menuType.isEdit = false;
        };
    };
    $scope.onMenuTypeAdd = function(menuTypeNew) {
        if(menuTypeNew.name!='') {
            menuTypeNew.display_order = 0;
            $mp_ajax.post('/biz/' + $rootScope.bizId + '/prodType', menuTypeNew,function(data){
                //for menuTypes
                var newMenuTypeObj = {};
                angular.copy(menuTypeNew,newMenuTypeObj);
                newMenuTypeObj.type_id = data.prodTypeId;
                newMenuTypeObj.isNew = true;
                $scope.menuTypes.unshift(newMenuTypeObj);
                //for menuTypeInputs
                var newMenuTypeInputObj = {};
                angular.copy(newMenuTypeObj,newMenuTypeInputObj);
                $scope.menuTypeInputs.unshift(newMenuTypeInputObj);
            });
        }
        else {
            ;
        }
    };
    $scope.onMenuTypeDelete = function(menuType,index) {
        $( "#dialog-confirm" ).removeClass('hide').dialog({
            resizable: false,
            modal: true,
            buttons: [
                {
                    html: "<i class='icon-trash bigger-110'></i>&nbsp; "+ L.delete,
                    "class" : "btn btn-danger btn-xs",
                    click: function() {
                        var confirmDlg = $( this );
                        $mp_ajax.delete('/biz/' + $rootScope.bizId + '/prodType/' + menuType.type_id,function (data) {
                            console.log(data);
                            $scope.menuTypes.splice(index,1);
                            $scope.menuTypeInputs.splice(index,1);
                            confirmDlg.dialog( "close" );
                        },function (data) {
                            console.error(data);
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
    $scope.onChangingSequence = function() {
        $('.dd').nestable({maxDepth:1});
//    $('.dd').on('change',function(event){
//        if(event.type && event.type=='change')
//            console.log(event);
//    });

        $('.dd-handle a').on('mousedown', function(e){
            e.stopPropagation();
        });
        $scope.isChangingSequence = true;
    };
    $scope.onMenuTypeUpdateDisplayOrder = function() {
        var liArray = $(".dd .dd-list li");
        var promiseArray = [];
        for(var i=0;i<liArray.length;++i) {
            var menuType = $scope.menuTypes[$(liArray[i]).attr('data-id')];
            if(menuType.display_order!=i+1) {
                menuType.display_order = i+1;
                (function(menuType){
                    promiseArray.push($mp_ajax.promisePut('/biz/' + $rootScope.bizId + '/prodType/' + menuType.type_id, menuType));
                }(menuType));
            }
        }
        if(promiseArray.length>0) {
            $q.all(promiseArray).then(function(){
                $scope.isChangingSequence = false;
                window.location.reload();
            },function(){
                ErrorBox(L.msg_update_fail);
            });
        }
        else {
            $scope.isChangingSequence = false;
        }
    };
    $scope.onCancel = function() {
        var liArray = $(".dd .dd-list li");
        for(var i=0;i<liArray.length;++i) {
            var menuType = $scope.menuTypes[$(liArray[i]).attr('data-id')];
            if(menuType.display_order!=i+1) {
                menuType.display_order = i+1;
                window.location.reload();
            }
        }
        $scope.isChangingSequence = false;
    };



    //move page-content a little bit down in case of tabs cover part of it
    OnViewLoad();
}] );

