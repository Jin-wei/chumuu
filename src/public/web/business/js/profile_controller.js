/**
 * Created by Ken on 2014-4-18.
 */

var profileController = app.controller("profileController", ['$rootScope','$scope','$mp_ajax','$location','$routeParams',function($rootScope,$scope,$mp_ajax ,$location,$routeParams) {
    $scope.testText = "testText_Profile";
    $scope.edit = {};
    $scope.edit.phone = true;
    $scope.edit.category = true;
    $scope.edit.service = true;
    $scope.edit.about = true;
    $scope.edit.hours = false;


    $('.pic-wall').ace_file_input({
        no_file:'No File ...',
        btn_choose:'Choose',
        btn_change:'Change',
        droppable:true,
        onchange:null,
        thumbnail:false, //| true | large
        whitelist:'gif|png|jpg|jpeg|bmp',
        blacklist:'exe|php'
        //onchange:''
        //
    });

    $scope.timeArray_24 =['00:00','00:15','00:30','00:45','01:00','01:15','01:30','01:45','02:00','02:15','02:30','02:45','03:00','03:15','03:30','03:45','04:00','04:15','04:30','04:45',
        '05:00','05:15','05:30','05:45','06:00','06:15','06:30','06:45','07:00','07:15','07:30','07:45','08:00','08:15','08:30','08:45','09:00','09:15','09:30','09:45','10:00','10:15','10:30','10:45','11:00','11:15','11:30',
        '11:45','12:00','12:15','12:30','12:45','13:00','13:15','13:30','13:45','14:00','14:15','14:30','14:45','15:00','15:15','15:30','15:45','16:00','16:15','16:30','16:45','17:00','17:15','17:30','17:45','18:00','18:15',
        '18:30','18:45','19:00','19:15','19:30','19:45','20:00','20:15','20:30','20:45','21:00','21:15','21:30','21:45','22:00','22:15','22:30','22:45','23:00','23:15','23:30','23:45'];

    $scope.timeArray_AMPM =['12:00 am','12:15 am','12:30 am','12:45 am','01:00 am','01:15 am','01:30 am','01:45 am','02:00 am','02:15 am','02:30 am','02:45 am','03:00 am','03:15 am','03:30 am','03:45 am','04:00 am','04:15 am','04:30 am','04:45 am',
        '05:00 am','05:15 am','05:30 am','05:45 am','06:00 am','06:15 am','06:30 am','06:45 am','07:00 am','07:15 am','07:30 am','07:45 am','08:00 am','08:15 am','08:30 am','08:45 am','09:00 am','09:15 am','09:30 am','09:45 am','10:00 am','10:15 am','10:30 am','10:45 am','11:00 am','11:15 am','11:30 am',
        '11:45 am','12:00 pm','12:15 pm','12:30 pm','12:45 pm','01:00 pm','01:15 pm','01:30 pm','01:45 pm','02:00 pm','02:15 pm','02:30 pm','02:45 pm','03:00 pm','03:15 pm','03:30 pm','03:45 pm','04:00 pm','04:15 pm','04:30 pm','04:45 pm','05:00 pm','05:15 pm','05:30 pm','05:45 pm','06:00 pm','06:15 pm',
        '06:30 pm','06:45 pm','07:00 pm','07:15 pm','07:30 pm','07:45 pm','08:00 pm','08:15 pm','08:30 pm','08:45 pm','09:00 pm','09:15 pm','09:30 pm','09:45 pm','10:00 pm','10:15 pm','10:30 pm','10:45 pm','11:00 pm','11:15 pm','11:30 pm','11:45 pm'];

    //initTime();

    var L = $rootScope.L;
    //toCurrentShowHours();
    $scope.dayArray = [L.monday, L.tuesday, L.wednesday, L.thursday, L.friday, L.saturday, L.sunday];
    $scope.bandArray = ['0','1','2','3','4','5','6','7','8','9','10','11','12',
        '13','14','15','16','17','18','19','20','21','22','23'];
    $scope.daySel = $scope.dayArray[0];
    $scope.startSel = $scope.timeArray_AMPM[0];
    $scope.endSel = $scope.timeArray_AMPM[$scope.timeArray_AMPM.length-1];
    $scope.editPhone = function(){
        var divDom = angular.element('#editPhoneDiv');
        if(divDom && divDom[0].className.indexOf('ui-icon-pencil')>0){
            divDom.removeClass('ui-icon-pencil');
            divDom.addClass('ui-icon-disk');
            divDom[0].innerText = $rootScope.L.save;
            $scope.edit.phone = false;
        }else{
            divDom.removeClass('ui-icon-disk');
            divDom.addClass('ui-icon-pencil');
            divDom[0].innerText = $rootScope.L.edit;
            $scope.edit.phone = true;
            updateBizBaseInfo();
        }
    }

    $scope.editCategory = function(){
        var divDom = angular.element('#editCategoryDiv');
        if(divDom && divDom[0].className.indexOf('ui-icon-pencil')>0){
            divDom.removeClass('ui-icon-pencil');
            divDom.addClass('ui-icon-disk');
            divDom[0].innerText = $rootScope.L.save;
            $scope.edit.category = false;
        }else{
            divDom.removeClass('ui-icon-disk');
            divDom.addClass('ui-icon-pencil');
            divDom[0].innerText = $rootScope.L.edit;
            $scope.edit.category = true;
            updateBizBaseInfo()
        }

    }

    $scope.editAbout = function(){
        var divDom = angular.element('#editAboutDiv');
        if(divDom && divDom[0].className.indexOf('ui-icon-pencil')>0){
            divDom.removeClass('ui-icon-pencil');
            divDom.addClass('ui-icon-disk');
            divDom[0].innerText = $rootScope.L.save;
            $scope.edit.about = false;
        }else{
            divDom.removeClass('ui-icon-disk');
            divDom.addClass('ui-icon-pencil');
            divDom[0].innerText = $rootScope.L.edit;
            $scope.edit.about = true;
            updateBizBaseInfo();
        }

    }

    $scope.editService = function(){
        var divDom = angular.element('#editServiceDiv');
        if(divDom && divDom[0].className.indexOf('ui-icon-pencil')>0){
            divDom.removeClass('ui-icon-pencil');
            divDom.addClass('ui-icon-disk');
            divDom[0].innerText = $rootScope.L.save;
            $scope.edit.service = false;
        }else{
            divDom.removeClass('ui-icon-disk');
            divDom.addClass('ui-icon-pencil');
            divDom[0].innerText = $rootScope.L.edit;
            $scope.edit.service = true;
            updateBizBaseInfo();
        }

    }

    $scope.bizInfo.hours_display = [];

    $scope.editHours = function(){
        //$location.path("/editHours");
        var divDom = angular.element('#editHoursDiv');
        if(divDom && divDom[0].className.indexOf('ui-icon-pencil')>0){
            divDom.removeClass('ui-icon-pencil');
            divDom.addClass('ui-icon-disk');
            divDom[0].innerText = $rootScope.L.save;
            $scope.edit.hours = true;
        }else{
            divDom.removeClass('ui-icon-disk');
            divDom.addClass('ui-icon-pencil');
            divDom[0].innerText = $rootScope.L.edit;
            $scope.edit.hours = false;
            toDefaultLanguage();

            //#275 sort
            function _sort(a,b) {
                //leave equals is OK
                console.log(a[0],b[0],moment(a[0],'hh:mm a') < moment(b[0],'hh:mm a') ? -1 : 1);
                return moment(a[0],'hh:mm a') < moment(b[0],'hh:mm a') ? -1 : 1;
            }
            _.forEach($scope.bizInfo.showHours,function(o){
                o.hoursArray.sort(_sort);
            });

            var tempShowHours = to24($scope.bizInfo.showHours);

            $scope.bizInfo.hours_display =  convertHoursToDisplay(convertHoursToJson(tempShowHours)).split(';');
            updateBizBaseInfo();
            toAmPm($scope.bizInfo.showHours);
            toCurrentLanguage($scope.bizInfo.showHours);
        }
    }

    $scope.removeHours = function(dayItem ){
        toCurrentShowHours();
        var nowHoursArray = $scope.bizInfo.showHours;
        for(var i=0; i<nowHoursArray.length; i++){
            if(nowHoursArray[i] == dayItem){
                nowHoursArray[i].hoursArray.splice(0,1);
                if(nowHoursArray[i].hoursArray == null || nowHoursArray[i].hoursArray.length == 0){
                    nowHoursArray[i].opened = false;
                }
            }
        }

    }

    $scope.addHours = function(daySel ,startSel ,endSel){
        //console.log(daySel +"--"+ startSel +"----"+endSel);
        toCurrentShowHours();
        /*for(var j=0; j< $scope.timeArray_AMPM.length; j++){
            if (startSel == $scope.timeArray_AMPM[j]) {startSel = $scope.timeArray_24[j];}
            if (endSel == $scope.timeArray_AMPM[j]) {endSel = $scope.timeArray_24[j];}
        }*/
        var nowHoursArray = $scope.bizInfo.showHours;
        for(var i=0; i<nowHoursArray.length; i++){
            if(nowHoursArray[i].day == daySel){
                var hourBand =[startSel , endSel] ;
                nowHoursArray[i].opened = true ;
                nowHoursArray[i].hoursArray.push(hourBand);
                break;
            }
        }
        convertHoursToJson(nowHoursArray);
    }

    function toAmPm (hoursJsonStr) {
        for(var i=0; i<hoursJsonStr.length; i++){
            for(var j=0; j<hoursJsonStr[i].hoursArray.length; j++){
                for (var k=0; k<$scope.timeArray_AMPM.length; k++) {
                    var hourBand = hoursJsonStr[i].hoursArray[j];
                    if (hourBand[0] == $scope.timeArray_24[k]) {
                        hourBand[0] = $scope.timeArray_AMPM[k];
                    }
                    if (hourBand[1] == $scope.timeArray_24[k]) {
                        hourBand[1] = $scope.timeArray_AMPM[k];
                    }
                }
            }
        }
        return hoursJsonStr;
    }

    function to24 (hoursJsonStr) {
        for(var i=0; i<hoursJsonStr.length; i++){
            for(var j=0; j<hoursJsonStr[i].hoursArray.length; j++){
                for (var k=0; k<$scope.timeArray_AMPM.length; k++) {
                    var hourBand = hoursJsonStr[i].hoursArray[j];
                    if (hourBand[0] == $scope.timeArray_AMPM[k]) {
                        hourBand[0] = $scope.timeArray_24[k];
                    }
                    if (hourBand[1] == $scope.timeArray_AMPM[k]) {
                        hourBand[1] = $scope.timeArray_24[k];
                    }
                }
            }
        }
        return hoursJsonStr;
    }

    function convertHoursToDisplay( hoursJsonStr){
        var weekDayArray = [ L.monday_short, L.tuesday_short, L.wednesday_short, L.thursday_short, L.friday_short, L.saturday_short, L.sunday_short];
        var fullWeekDayArray = [ 'monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
        if(hoursJsonStr == null || hoursJsonStr.trim() == "" || hoursJsonStr.trim() == "{}"){
            return "Without the correct time";
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
                        dayHours[m] = segStartHour+":"+startArray[1]+segStartFlag + " - " + segEndHour+":"+endArray[1]+segEndFlag;
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
                return "Without the correct time";
            }
            if(hoursObjArray.length==1 && hoursObjArray[0].day=="Mon-Sun"){
                hoursObjArray[0].day="Open Daily";
            }

            //console.log("\n\n\n");
            //console.log(hoursObjArray);
            for(var x= 0, y=hoursObjArray.length ; x<y ;x++){
                hoursObjArray[x] =  hoursObjArray[x].day +" " + hoursObjArray[x].hours;
            }
            return hoursObjArray.join(";");
        }catch(error){
            logger.warn(' convert hours ' + 'false');
            return "Without the correct time";
        }

    }
    function convertAmPmDisplay(hoursObject){
        if (hoursObject[0].slice(0,2)<10 && hoursObject[0].slice(0,2)>0) {
            var tempHour = hoursObject[0].slice(1,2);
            hoursObject[0] = tempHour + ':' + hoursObject[0].slice(3,5) + ' am';
        }

        if (hoursObject[0].slice(0,2)>9 && hoursObject[0].slice(0,2)<12) {
            tempHour = hoursObject[0].slice(0,2);
            hoursObject[0] = tempHour + ':' + hoursObject[0].slice(3,5) + ' am';
        }

        if (hoursObject[0].slice(0,2)>12 && hoursObject[0].slice(0,2)<24) {
            tempHour = hoursObject[0].slice(0,2);
            tempHour = tempHour - 12;
            hoursObject[0] = tempHour + ':' + hoursObject[0].slice(3,5) + ' pm';
        }

        if (hoursObject[1].slice(0,2)<10 && hoursObject[1].slice(0,2)>0) {
            tempHour = hoursObject[1].slice(1,2);
            hoursObject[1] = tempHour + ':' + hoursObject[1].slice(3,5) + ' am';
        }

        if (hoursObject[1].slice(0,2)>9 && hoursObject[1].slice(0,2)<12) {
            tempHour = hoursObject[1].slice(0,2);
            hoursObject[1] = tempHour + ':' + hoursObject[1].slice(3,5) + ' am';
        }

        if (hoursObject[1].slice(0,2)>12 && hoursObject[1].slice(0,2)<24) {
            tempHour = hoursObject[1].slice(0,2);
            tempHour = tempHour - 12;
            hoursObject[1] = tempHour + ':' + hoursObject[1].slice(3,5) + ' pm';
        }

        if (hoursObject[0].slice(0,2)==0) {
            hoursObject[0] = '12:' + hoursObject[0].slice(3,5) + ' am';
        }
        if (hoursObject[1].slice(0,2)==0) {
            hoursObject[1] = '12:' + hoursObject[1].slice(3,5) + ' am';
        }
    }

    function convertHoursDisplay(showHoursArray){
//        console.log(showHoursArray);
        var weekDayArray = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
        //var weekDayArray = [L.monday_short, L.tuesday_short, L.wednesday_short, L.thursday_short, L.friday_short, L.saturday_short, L.sunday_short];
        var hoursObjArray = [];
        for(var i =0 , j=showHoursArray.length; i<j ; i++){
            if(showHoursArray[i].opened){
                var hoursObj = {};
                var tempHour = [];
                hoursObj.day = weekDayArray[i];
                var hoursObjTemp = [];
                for(var m=0,n=showHoursArray[i].hoursArray.length ; m<n; m++){
                    var hoursObj = showHoursArray[i].hoursArray[m];
                    //convertAmPmDisplay(hoursObj);
//                    console.log(hoursObj);
                    hoursObjTemp.push(hoursObj.join(' - '));
                }
                hoursObj.hours = hoursObjTemp.join(',');
                var hoursObjArrLen = hoursObjArray.length;
                if(hoursObjArrLen>0 && hoursObjArray[hoursObjArrLen -1].hours == hoursObj.hours){
                    var dayName = hoursObjArray[hoursObjArrLen -1].day;
                    hoursObjArray[hoursObjArrLen -1].day = dayName.split('-')[0]+ "-" +weekDayArray[i];
                }else{
                    hoursObjArray.push(hoursObj);
                }
            }
        }
        if(hoursObjArray == null || hoursObjArray.length==0){
            if (L.key=='en_us') {
                hoursObjArray.push('Without the correct time');
                return hoursObjArray;
            }
            if (L.key=='zh_cn'){
                hoursObjArray.push('无法获取正确时间');
                return hoursObjArray;
            }
        }
        if(hoursObjArray.length==1 && hoursObjArray[0].day=="Mon-Sun" && L.key=='en_us'){
            hoursObjArray[0].day="Open Daily";
        }
        if(hoursObjArray.length==1 && hoursObjArray[0].day=="Mon-Sun" && L.key=='zh_cn'){
            hoursObjArray[0].day="每天营业";
        }
        for(var x= 0, y=hoursObjArray.length ; x<y ;x++){
            hoursObjArray[x] =  hoursObjArray[x].day +" " + hoursObjArray[x].hours;
        }
//        console.log(hoursObjArray);
        return hoursObjArray ;
    }


    //console.log("bizid = "+$rootScope.bizId);
    $mp_ajax.get('/biz/'+$rootScope.bizId,function(data){
        if(typeof data != 'object') {
            data = {};
        }
        TranslateBizImageUrl(data);
//        if(!data.img_url){
//            data.img_url = "/image/restaurant_icon.jpg";
//        }else{
//            data.img_url = "/image/"+data.img_url+"/m";
//        }
        if(data.services){
            data.services = data.services.split(',');
        }
        data.wifi = data.wifi==1?true:false;
        data.payment_cashonly = data.payment_cashonly==1?true:false;
        data.reservations = data.reservations==1?true:false;
        data.parking = data.parking==1?true:false;
        //data.hours = data.hours==1?true:false;
        data.seating_outdoor = data.seating_outdoor==1?true:false;
        data.room_private = data.room_private==1?true:false;
        data.showHours = toAmPm(convertJsonHours(data.hours));
        if(!data.showHours) {
            data.showHours = [];
        }
//        data.hours_display = convertHoursDisplay(data.showHours);
        if(data.hours_display != null){
            data.hours_display = convertHoursToDisplay(data.hours).split(';');
        }
        /*data.hours_display = JSON.parse(data.hours);
        convertAmPmDisplay(data.hours_display);*/
        $scope.bizInfo = data;
//        console.log($scope.bizInfo);
    });

    function updateBizBaseInfo(){
//        console.log($scope.bizInfo.showHours);
        var param ={
            "phoneNo": $scope.bizInfo.phone_no,
            "category": $scope.bizInfo.category,
            "cashOnly": $scope.bizInfo.payment_cashonly?1:0,
            "reservations": $scope.bizInfo.reservations?1:0,
            "wifi": $scope.bizInfo.wifi?1:0,
            "hours": convertHoursToJson(to24($scope.bizInfo.showHours)),
            "parking": $scope.bizInfo.parking?1:0,
            "seatOutDoor": $scope.bizInfo.seating_outdoor?1:0,
            "privateRoom": $scope.bizInfo.room_private?1:0,
            "desc": $scope.bizInfo.desc,
            "bizId": $rootScope.bizId
        };
        //console.log(param);

        $mp_ajax.put('/biz/',param,function(data){

        },function(data){
            alert(data.message);
        });
    }

    function convertHoursToJson(hours){
        var jsonObj = {};

        for(var i=0;i<hours.length;i++){
            if(hours[i].hoursArray != null && hours[i].hoursArray.length >0){
               jsonObj[hours[i].day] = hours[i].hoursArray;
            }
        }
        return JSON.stringify(jsonObj);

    }

    function convertJsonHours (hourString){
        var hourJson = {} ;
        if(hourString != null && hourString.length>0){
            hourJson =  eval("(" + hourString + ")");
        }

        /*if(hourJson == null){
            return defaultOpHours();
        }*/
        var result = [];

        result.push(convertDayHours(hourJson, 'monday'));
        result.push(convertDayHours(hourJson, 'tuesday'));
        result.push(convertDayHours(hourJson, 'wednesday'));
        result.push(convertDayHours(hourJson, 'thursday'));
        result.push(convertDayHours(hourJson, 'friday'));
        result.push(convertDayHours(hourJson, 'saturday'));
        result.push(convertDayHours(hourJson, 'sunday'));
        toCurrentLanguage(result);
        return result;
    }
    function convertDayHours(hourJson ,day){
        var res = {};
        res.day = day;
        if(hourJson[day] == null || hourJson[day].length<1 || hourJson[day][0].length<1){
            res.opened = false;
            res.hoursArray = [];

        }else{
            res.opened= true;
            res.hoursArray = hourJson[day];
        }
        return res;
    }

    function defaultOpHours(){
        var result = {};
        var dayState = {};
        dayState.opened = true;
        dayState.start = "10:00";
        dayState.end = "22:00";
        result.sunday = dayState;
        result.monday = dayState;
        result.tuesday = dayState;
        result.wednesday = dayState;
        result.thursday = dayState;
        result.friday = dayState;
        result.saturday = dayState;
        return result;
    }

    function toCurrentShowHours(){
        var L = $rootScope.L;
        for (var i = 0; i < $scope.bizInfo.showHours.length; i++) {
            if ($scope.bizInfo.showHours[i].day == '星期一' || $scope.bizInfo.showHours[i].day == 'monday') {
                $scope.bizInfo.showHours[i].day = L.monday;
                continue;
            }
            if ($scope.bizInfo.showHours[i].day == '星期二' || $scope.bizInfo.showHours[i].day == 'tuesday') {
                $scope.bizInfo.showHours[i].day = L.tuesday;
                continue;
            }
            if ($scope.bizInfo.showHours[i].day == '星期三' || $scope.bizInfo.showHours[i].day == 'wednesday') {
                $scope.bizInfo.showHours[i].day = L.wednesday;
                continue;
            }
            if ($scope.bizInfo.showHours[i].day == '星期四' || $scope.bizInfo.showHours[i].day == 'thursday') {
                $scope.bizInfo.showHours[i].day = L.thursday;
                continue;
            }
            if ($scope.bizInfo.showHours[i].day == '星期五' || $scope.bizInfo.showHours[i].day == 'friday') {
                $scope.bizInfo.showHours[i].day = L.friday;
                continue;
            }
            if ($scope.bizInfo.showHours[i].day == '星期六' || $scope.bizInfo.showHours[i].day == 'saturday') {
                $scope.bizInfo.showHours[i].day = L.saturday;
                continue;
            }
            if ($scope.bizInfo.showHours[i].day == '星期日' || $scope.bizInfo.showHours[i].day == 'sunday') {
                $scope.bizInfo.showHours[i].day = L.sunday;
                continue;
            }
        }
    }

    function toCurrentLanguage(content){
        if (L.key=='zh-cn') {
            for (var i = 0; i < content.length; i++) {
                if (content[i].day == 'monday') {
                    content[i].day = '星期一';
                    continue;
                }
                if (content[i].day == 'tuesday') {
                    content[i].day = '星期二';
                    continue;
                }
                if (content[i].day == 'wednesday') {
                    content[i].day = '星期三';
                    continue;
                }
                if (content[i].day == 'thursday') {
                    content[i].day = '星期四';
                    continue;
                }
                if (content[i].day == 'friday') {
                    content[i].day = '星期五';
                    continue;
                }
                if (content[i].day == 'saturday') {
                    content[i].day = '星期六';
                    continue;
                }
                if (content[i].day == 'sunday') {
                    content[i].day = '星期日';
                    continue;
                }
            }
        }
        if (L.key=='en-us') {
            for (var i = 0; i < content.length; i++) {
                if (content[i].day == '星期一') {
                    content[i].day = 'monday';
                    continue;
                }
                if (content[i].day == '星期二') {
                    content[i].day = 'tuesday';
                    continue;
                }
                if (content[i].day == '星期三') {
                    content[i].day = 'wednesday';
                    continue;
                }
                if (content[i].day == '星期四') {
                    content[i].day = 'thursday';
                    continue;
                }
                if (content[i].day == '星期五') {
                    content[i].day = 'friday';
                    continue;
                }
                if (content[i].day == '星期六') {
                    content[i].day = 'saturday';
                    continue;
                }
                if (content[i].day == '星期日') {
                    content[i].day = 'sunday';
                    continue;
                }
            }
        }
    }

    function toDefaultLanguage(){
        if (L.key=='zh-cn') {
            for (var i = 0; i < $scope.bizInfo.showHours.length; i++) {
                if ($scope.bizInfo.showHours[i].day == '星期一') {
                    $scope.bizInfo.showHours[i].day = 'monday';
                    continue;
                }
                if ($scope.bizInfo.showHours[i].day == '星期二') {
                    $scope.bizInfo.showHours[i].day = 'tuesday';
                    continue;
                }
                if ($scope.bizInfo.showHours[i].day == '星期三') {
                    $scope.bizInfo.showHours[i].day = 'wednesday';
                    continue;
                }
                if ($scope.bizInfo.showHours[i].day == '星期四') {
                    $scope.bizInfo.showHours[i].day = 'thursday';
                    continue;
                }
                if ($scope.bizInfo.showHours[i].day == '星期五') {
                    $scope.bizInfo.showHours[i].day = 'friday';
                    continue;
                }
                if ($scope.bizInfo.showHours[i].day == '星期六') {
                    $scope.bizInfo.showHours[i].day = 'saturday';
                    continue;
                }
                if ($scope.bizInfo.showHours[i].day == '星期日') {
                    $scope.bizInfo.showHours[i].day = 'sunday';
                    continue;
                }
            }
        }
    }

    $scope.MAX_IMG_COUNT = 400000; //remove limit
    $mp_ajax.promiseGet('/biz/'+$scope.bizId+'/bizImg').then(function(data){
        if(data.length>$scope.MAX_IMG_COUNT)
            $scope.bizImgs = data.slice(0,$scope.MAX_IMG_COUNT);
        else
            $scope.bizImgs = data;
        TranslateBizImageUrl($scope.bizImgs);
    });
    $scope.bizChosenImg = {};
    $scope.onPicChoose = function(bizImg) {
        $scope.bizChosenImg = bizImg;
    };
    $scope.onBizImgSubmit = function() {

        //#280
        var max_size = 10*1024*1024;
        var max_size_str = '10M';
        if($('#pic-wall')[0].files[0].size > max_size) {
            ErrorBox('Max Size Limit: '+max_size_str);
            return false;
        }
        //normal upload
        if($scope.bizImgs.length<$scope.MAX_IMG_COUNT) {
            $scope.isUploading = true;
            $mp_ajax.formPost($('#pic-form'),'/biz/'+$rootScope.bizId+'/bizImg',function(data){
                var newImg = {id:data.id,img_url:data.image};
                $scope.$apply(function(){
                    $scope.bizImgs.push(newImg);
                    $scope.isUploading = false;
                });
                //#220
                $('#pic-form .remove').trigger('click');
            },function(error){
                var L = $rootScope.L;
                if (L.key == 'zh-cn')
                    ErrorBox("上传失败");
                if (L.key == 'en-us')
                    ErrorBox("Upload failed");
                $scope.$apply(function() {
                    $scope.isUploading = false;
                });
            });
        }
        else {
            var L = $rootScope.L;
            if (L.key == 'zh-cn')
                WarningBox("您至多可上传4张照片");
            if (L.key == 'en-us')
                WarningBox("You can only upload 4 pictures");
        }
    };
    $scope.onBizImgDelete = function() {
        if($scope.bizChosenImg) {
            $mp_ajax.delete('/biz/'+$rootScope.bizId+'/bizImg/'+$scope.bizChosenImg.id,function(data){
                for(var i in $scope.bizImgs) {
                    if($scope.bizImgs[i].id==$scope.bizChosenImg.id)
                        $scope.bizImgs.splice(i,1);
                }
            },function(error){
                var L = $rootScope.L;
                if (L.key == 'zh-cn')
                    ErrorBox("刪除失敗");
                if (L.key == 'en-us')
                    ErrorBox("delete failed");
            });
        }
        else {
            var L = $rootScope.L;
            if (L.key == 'zh-cn')
                WarningBox("请先选择一张照片");
            if (L.key == 'en-us')
                WarningBox("Please choose a picture first");
        }
    };
    $scope.onSetMainPic = function() {
        if($scope.bizChosenImg) {
            $mp_ajax.put('/biz/'+$rootScope.bizId+'/bizImg/'+$scope.bizChosenImg.id,{flag:1},function(data){
                $scope.bizInfo.img_url = '../image/'+$scope.bizChosenImg.img_url+'/m';
                var L = $rootScope.L;
                if (L.key == 'zh-cn')
                    SuccessBox("操作成功");
                if (L.key == 'en-us')
                    SuccessBox("opration success");
            },function(error){
                var L = $rootScope.L;
                if (L.key == 'zh-cn')
                    ErrorBox("操作失敗");
                if (L.key == 'en-us')
                    ErrorBox("operation failed");
            });
        }
    };


    /*function initSlider(dom ,start , end){
        var startIndex = start === undefined ? 20: timeArray.indexOf(start);
        var endIndex = end === undefined ? 40: timeArray.indexOf(end);
        dom.slider({
            values:[startIndex,endIndex],
            range: true,
            min: 0,
            max: 48,
            step: 1,
            slide: function( event, ui ) {
                var startValue = timeArray[parseInt(ui.values[0])];
                var endValue = timeArray[parseInt(ui.values[1])];
                var targetId = event.target.id;
                if(targetId.indexOf('7')){
                    $scope.bizInfo.hours.sunday.start = startValue;
                    $scope.bizInfo.hours.sunday.end = endValue;
                }else if(targetId.indexOf('1')){
                    $scope.bizInfo.hours.monday.start = startValue;
                    $scope.bizInfo.hours.monday.end = endValue;
                }else if(targetId.indexOf('2')){
                    $scope.bizInfo.hours.tuesday.start = startValue;
                    $scope.bizInfo.hours.tuesday.end = endValue;
                }else if(targetId.indexOf('3')){
                    $scope.bizInfo.hours.wednesday.start = startValue;
                    $scope.bizInfo.hours.wednesday.end = endValue;
                }else if(targetId.indexOf('4')){
                    $scope.bizInfo.hours.thursday.start = startValue;
                    $scope.bizInfo.hours.thursday.end = endValue;
                }else if(targetId.indexOf('5')){
                    $scope.bizInfo.hours.friday.start = startValue;
                    $scope.bizInfo.hours.friday.end = endValue;
                }else if(targetId.indexOf('6')){
                    $scope.bizInfo.hours.saturday.start = startValue;
                    $scope.bizInfo.hours.saturday.end = endValue;
                }
                console.log($scope.bizInfo.hours);
                var uiValue = parseInt(ui.value);
                var val = timeArray[uiValue];
                if(! ui.handle.firstChild ) {
                    $(ui.handle).append("<div class='tooltip top in' style='left:-17px;top:-36px;'>" +
                        "<div class='tooltip-arrow'></div>" +
                        "<div class='tooltip-inner'></div></div>"
                    );
                }
                $(ui.handle.firstChild).show().children().eq(1).text(val);
                //$('#form-field-5').attr('class', 'col-xs-'+val).val('.col-xs-'+val);
            }
        });
    }*/

    uploadImage($scope,$mp_ajax,$rootScope);
    //move page-content a little bit down in case of tabs cover part of it
    OnViewLoad();
}] );

profileController.onload = function() {
    //alert('profile loaded')g
};

function uploadImage($scope,$mp_ajax,$rootScope){
    $.fn.editable.defaults.mode = 'inline';
    $.fn.editableform.loading = "<div class='editableform-loading'><i class='light-blue icon-2x icon-spinner icon-spin'></i></div>";
    $.fn.editableform.buttons = '<button type="submit"  class="btn btn-info editable-submit"><i class="icon-ok icon-white"></i></button>'+
        '<button type="button" class="btn editable-cancel"><i class="icon-remove"></i></button>';
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
                btn_choose: 'Change Restaurant Picture',
                droppable: true,
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
                $mp_ajax.formPost($('.form-inline'),'/biz/'+$rootScope.bizId+'/image',function(success){
                    $scope.bizInfo.img_url = "../image/"+success.path+"/m";;
                    angular.element("#avatar").attr("src",'../image/'+success+'/m');
                    deferred.resolve({'status':'OK'});

                    if(last_gritter) $.gritter.remove(last_gritter);
                    last_gritter = $.gritter.add({
                        title: 'Profile Picture Updated!',
                        text: '',
                        class_name: 'gritter-info gritter-center'
                    });
                    return deferred.promise();
                },function(error){
                    if(last_gritter) $.gritter.remove(last_gritter);
                    last_gritter = $.gritter.add({
                        title: 'Profile Picture Updated Failed !',
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

