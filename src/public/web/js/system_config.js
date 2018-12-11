/**
 * Created by md on 14-9-28.
 */

//sys_config = {
//    name: 'en-us system config',
//    map: {
//        gaode: false,
//        google: true
//    },
//    isCN: false,
//    isEN: true,
//    language: 'en-us', //zh-tw, en-us
//    end:null
//};

sys_config = {
    /*
    ---- no meaning, just like version
    */
    name: 'zh-cn system config',
    /*
    ---- specify which map we use, both for static map image and search page
        [Warning: must invoke the same script file, otherwise MapAPI call would be failed]
    */
    map: {
        gaode: false,
        google: true
    },
    /*
    ---- print menu pdf
    */
    pageSize: {
        regular: 'Letter',
        large: 'Tabloid'
    },
    /*
     ---- image server, default to be null
     */
    image_server: "https://stg.tru-menu.com",
    /*
     ---- specify the map's script, it will be included in page
        [Warning: this should be consistent with 'sys_config.map',  if we set 'map.google=true', then the 'map_js' must be google's script.]
     */
    //gaode
    //map_js : '%3Cscript src="https://webapi.amap.com/maps?v=1.3&key=224229e6022eb83252408bd73ca0be39" type="text/javascript"%3E%3C/script%3E',
    //google
    map_js: '%3Cscript onload="OnResourceLoaded(\'google_map\');" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBqdVT3XtZCXy1UYeHjRcNKheBWW4a-Iio&sensor=true" type="text/javascript"%3E%3C/script%3E',
    /*
    ---- specify the static map's url base, it will be included in page, used by restaurant home page
    */
    //gaode
    //static_map_base : 'https://restapi.amap.com/v3/staticmap',
    //google
    static_map_base : 'https://maps.google.com/maps/api/staticmap',
    /*
    ---- if no providing, we will detect what language the browser use, otherwise specify it.
        [a kept param, has no more meaning]
     */
    isCN: true,
    isEN: false,
    /*
    ---- if no providing, TruMenu will show language as the same of browser.
        if give a specific value, TruMenu will show language as config and can't switch to other language.
        [on AliCloud, just for Chinese, so we can set language='zh-ch']
    */
    //language: 'zh-cn', //zh-tw, en-us
    /*
     ---- if no providing value, $ will be the default value.
     */
    currency: '¥',
    /*---- if no providing value, 0.621371192237 will be the default value(from km to mile).
     */
    distanceFactor: '1',
    /*
     /*---- if no providing value, mile will be the default value.
     */
    distanceName: 'km',
    /*
     */
    /*
    ---- statistics:     no meaning just a label
         statistics_js:  specify what statistics tool we use
    */
//    statistics: 'baidu',
//    statistics_js: '%3Cscript src=" http://hm.baidu.com/h.js%3Ff7487450fd3540a56f81632d07032afd" type="text/javascript"%3E%3C/script%3E',
    statistics: 'google',
    statistics_js: "%3Cscript%3E"+
                    "(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){"+
                        "(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),"+
                        "m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)"+
                    "})(window,document,'script','//www.google-analytics.com/analytics.js','ga');"+
                    "ga('create', 'UA-55645307-1', 'auto');"+
                    "ga('send', 'pageview');"+
                    "%3C/script%3E",
    auto_login_url:"stg.chumuu.com/top-dish?login=1&",

    weixinConfig: {
        app_id:'',
        appsecret:'',
        authIsOpen:true,
        jsdIsOpen:false
    },

    end:null
};

