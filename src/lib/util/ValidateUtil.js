/**
 * Created by Ling xue on 14-4-16.
 * The file supply the api of validate parameter
 */

function isEmail(email){
    var arr= email.match(/[0-9a-z_][_.0-9a-z-]{0,31}@([0-9a-z][0-9a-z-]{0,30}\.){1,4}[a-z]{2,4}/);
    if(arr){
        return true;
    }else{
        return false;
    }
}


module.exports = {
    isEmail : isEmail
};
