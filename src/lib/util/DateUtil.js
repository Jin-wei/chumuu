/**
 * Created by Josh on 2/24/16.
 */


var moment = require('moment');
function getDayRangeLong(){
    var currentDate = new Date();
    var currentDateStr = moment(currentDate).format("YYYY-MM-DD");
    var currentDayLong = new Date(currentDateStr).getTime();
    var dayLong  = 24*60*60*1000;
    var yesterdayDayLong = currentDayLong -dayLong;
    var dayRangeObj = {};
    dayRangeObj.start = yesterdayDayLong;
    dayRangeObj.end = currentDayLong ;
    return dayRangeObj;

}

function getLastDayLong(){
    var currentDate = new Date();
    var currentDateStr = moment(currentDate).format("YYYY-MM-DD");
    var currentDayLong = new Date(currentDateStr).getTime();
    var dayLong  = 23*60*60*1000;
    var yesterdayDayLong = currentDayLong -dayLong;
    return yesterdayDayLong;
}


function getWeekByDate(){
    var d1 = new Date();
    var d2 = new Date();
    d2.setMonth(0);
    d2.setDate(1);
    var rq = d1-d2;
    var s1 = Math.ceil(rq/(24*60*60*1000));
    var s2 = Math.ceil(s1/7);
    return s2;
}

function getLastWeekObj(){
    var d = new Date();
    var weekDay = d.getDay();
    var lastSunday = new Date(d - weekDay*24*60*60*1000);
    var lastMonday = new Date((d- (weekDay+6)*24*60*60*1000));
    var lastSundayDate = lastSunday.getFullYear()+"-"+(lastSunday.getMonth()+1) +"-"+ lastSunday.getDate();
    var lastMondayDate = lastMonday.getFullYear()+"-"+(lastMonday.getMonth()+1) +"-"+ lastMonday.getDate();
    var resObj = {
        endDate : lastSundayDate ,
        startDate : lastMondayDate ,
        week : getWeekByDate(),
        year : d.getFullYear()
    }
    return resObj;
}
module.exports = {
    getDayRangeLong : getDayRangeLong,
    getLastDayLong : getLastDayLong,
    getWeekByDate : getWeekByDate ,
    getLastWeekObj : getLastWeekObj
}