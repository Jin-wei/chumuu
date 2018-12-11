// Copyright (c) 2012 Mark Cavage. All rights reserved.

var fs = require('fs');
var path = require('path');
var util = require('util');

var assert = require('assert-plus');
var bunyan = require('bunyan');
var restify = require('restify');
var biz=require('./biz');
var cust=require('./cust');
var prod=require('./prod');
var promo=require('./promo');
var coupon=require('./coupon');
var point=require('./point');
var image=require('./image');
var pdf=require('./pdf');
var yelpApi=require('./YelpApi');
var sysConfig = require('./config/SystemConfig.js');
var serverLogger = require('./util/ServerLogger.js');
var apiUtil = require('./util/ApiUtil.js');
var search = require('./Search.js');
var batchJob = require('./resource/batchJob.js');
var order = require('./order');
var table = require('./table');
var prerender=require('./prerender-node').set("prerenderServiceUrl",sysConfig.prerenderServiceUrl);
var payment = require('./payment')
var roleBase = require('./RoleBase');
var admin = require('./admin');
var rrkd = require('./rrkd');
var iosPush = require('./IOSPush');
var sms = require('./Sms.js');
var wechat = require('./resource/Wechat.js');
var oAuthUtil = require('./util/OAuthUtil.js');
var sysError = require('./util/SystemError.js');
var sysMsg = require('./util/SystemMsg.js');
var serverLogger = require('./util/ServerLogger.js');
var logger = serverLogger.createLogger('Server.js');
var WechatDao = require('./dao/WechatDao.js');
var WeiXinApi = require('./WeiXinApi.js');

// var updateALlProdLabel = require('../tool/updateAllProdLabel');

///--- Errors


///--- Formatters



///--- Handlers

/**
 * Only checks for HTTP Basic Authenticaion
 *
 * Some handler before is expected to set the accepted user/pass combo
 * on req as:
 *
 * req.allow = { user: '', pass: '' };
 *
 * Or this will be skipped.
 */
function authenticate(req, res, next) {
    if (!req.allow) {
        req.log.debug('skipping authentication');
        next();
        return;
    }

    var authz = req.authorization.basic;
    if (!authz) {
        res.setHeader('WWW-Authenticate', 'Basic realm="todoapp"');
        next(new restify.UnauthorizedError('authentication required'));
        return;
    }

    if (authz.username !== req.allow.user || authz.password !== req.allow.pass) {
        next(new restify.ForbiddenError('invalid credentials'));
        return;
    }

    next();
}

///--- API

/**
 * Returns a server with all routes defined on it
 */
function createServer(options) {
    assert.object(options, 'options');
    assert.object(options.log, 'options.log');


    // Create a server with our logger and custom formatter
    // Note that 'version' means all routes will default to
    // 1.0.0
    var server = restify.createServer({
        /*formatters: {
            'application/todo; q=0.9': formatTodo
        },*/
        log: options.log,
        name: 'mp',
        version: '1.0.0'
    });


    // Ensure we don't drop data on uploads
    //server.pre(restify.pre.pause());

    // Clean up sloppy paths like //todo//////1//
    server.pre(restify.pre.sanitizePath());

    // Handles annoying user agents (curl)
    server.pre(restify.pre.userAgentConnection());




    
    // Set a per request bunyan logger (with requestid filled in)
    //server.use(restify.requestLogger());

    // Allow 5 requests/second by IP, and burst to 10
    server.use(restify.throttle({
        burst: 100,
        rate: 50,
        ip: true
    }));


    // Use the common stuff you probably want
    //hard code the upload folder for now
    server.use(restify.bodyParser({uploadDir:__dirname+'/../uploads/'}));
    server.use(restify.acceptParser(server.acceptable));
    server.use(restify.dateParser());
    server.use(restify.authorizationParser());
    server.use(restify.queryParser());
    server.use(restify.gzipResponse());



   

    // Now our own handlers for authentication/authorization
    // Here we only use basic auth, but really you should look
    // at https://github.com/joyent/node-http-signature
    server.use(function setup(req, res, next) {
        if (options.user && options.password) {
            req.allow = {
                user: options.user,
                password: options.password
            };
        }     
    next();
    });
    //server.use(authenticate);

    //server.use(apiUtil.save);

    //server api doc
    server.get(/\/apidoc\/?.*/, restify.serveStatic({
  		directory: './public'
	}));

    // static files: /, /index.html, /images...
    //var STATIS_FILE_RE = /\/?\.css|\/?\.js|\/?\.png|\/?\.jpg|\/?\.gif|\/?\.jpeg|\/?\.less|\/?\.eot|\/?\.svg|\/?\.ttf|\/?\.otf|\/?\.woff|\/?\.pdf|\/?\.ico|\/?\.json|\/?\.wav|\/?\.mp3/;
    var STATICS_FILE_RE = /\.(css|js|jpe?g|png|gif|less|eot|svg|bmp|tiff|ttf|otf|woff|ico|aac|wav|ogg|txt|mp3?)$/i;
    var STATICS_HTML = /\.(pdf|json|xml|html)$/i;
    server.get(STATICS_FILE_RE, restify.serveStatic({ directory: './public/web', maxAge: sysConfig.maxAge }));
    server.get(STATICS_HTML, restify.serveStatic({ directory: './public/web', maxAge: 0 }));

    server.get('/api/sendCallOut/:bizId/code/:code/type/:callOutId',order.sendCallOut);
    server.get('/api/getAudio',order.getAudio);
    server.get('/api/getAccessToken',order.getAccessToken);
    //everyone
    server.get('/api/biz',biz.listBiz);
    server.get('/api/json/:id',biz.getBiz);
    //everyone
    server.get('/api/biz/:bizId', biz.getBiz);
    //biz
    server.get('/api/biz/:bizId/cust',biz.listBizCust);
    //biz
    server.get('/api/biz/:bizId/cust/:custId/act',biz.listBizCustAct);
    //biz
    server.post({path:'/api/biz/:bizId/image',contentType:'multipart/form-data'},roleBase.checkBizManagerToken,biz.uploadImage);
    //biz
    server.post({path:'/api/biz/:userId/avatar',contentType:'multipart/form-data'},roleBase.checkBizWaiterToken,biz.updateBizUserAvatar);
    //biz
    server.post({path:'/api/bizUser',contentType: 'application/json'}, biz.bizUserSignUp);
    //biz
    server.post({path:'/api/bizUser/do/login',contentType: 'application/json'}, biz.bizLogin);
    server.post({path:'/api/bizUser/do/mLogin',contentType: 'application/json'}, biz.bizUserMobileLogin);
    server.post({path:'/api/biz/:bizId/mLoginOut',contentType: 'application/json'}, roleBase.checkBizWaiterToken ,biz.bizUserMobileLogOut);
    server.put({path:'/api/biz/:bizId/mobileSound/:sound',contentType: 'application/json'} ,roleBase.checkBizWaiterToken , biz.updateBizMobileSound);
    //biz token
    server.put({path:'/api/bizUser',contentType: 'application/json'},roleBase.checkBizWaiterToken , biz.updateBizUserInfo);
    //biz
    server.get('/api/bizUser/:userId/active',biz.activeBizUser);
    //biz
    server.post({path:'/api/bizUser/send/activeMail',contentType:'application/json'},biz.sendActiveEmail);
    //biz
    server.post({path:'/api/bizUser/send/passwordMail',contentType:'application/json'},biz.sendResetPasswordEmail);
    //biz
    server.post({path:'/api/bizUser/:userId/changePassword',contentType:'application/json'},roleBase.checkBizWaiterToken , biz.changeBizPassword);
    //biz
    server.post({path:'/api/bizApp',contentType:'application/json'},roleBase.checkBizOwnerToken , biz.addAppForBiz);
    //biz
    server.put({path:'/api/bizApp/:appId',contentType:'application/json'},roleBase.checkBizOwnerToken , biz.updateAppForBiz);
    //biz
    server.get('/api/bizApp',roleBase.checkBizManagerToken , biz.getBizApplication);
    //biz
    server.get('/api/biz/:yelpId/yelpInfo',yelpApi.getYelpBizInfo);
    //biz
    server.get('/api/bizUser/:bizId',roleBase.checkBizOwnerToken , biz.getBizUserInfo);
    server.get('/api/bizUserInfo/:bizId',roleBase.checkBizWaiterToken, biz.getBizUserInfoById);

    //biz
    server.get('/api/biz/:bizId/coupon',coupon.listBizCoupon);
    //biz
    server.get('/api/biz/:bizId/coupon/:id',coupon.getBizCoupon);
    //biz
    server.get('/api/biz/:bizId/promo/:promoId/coupon',coupon.listBizPromoCoupon);
    //biz
    server.post('/api/biz/:bizId/coupon/:couponId/redeem',coupon.redeemBizCoupon);
    //biz
    server.post({path:'/api/biz',contentType:'multipart/form-data'},biz.createBusiness);
    //biz
    server.put({path:'/api/biz',contentType:'application/json'},roleBase.checkBizOwnerToken,biz.updateBizBaseInfo);
    //biz
    server.get('/api/biz/:bizId/productCount',roleBase.checkBizManagerToken,prod.getProductCount);
    //biz
    server.get('/api/biz/:bizId/productTypeCount',roleBase.checkBizManagerToken,prod.getProductTypeCount);
    //biz
    server.get('/api/biz/:bizId/customerCount',roleBase.checkBizManagerToken , biz.getCustomerCount);
    //biz
    server.put('/api/biz/:bizId/type/:typeId/order/:displayOrder',roleBase.checkBizManagerToken,prod.updateProdTypeOrder);
    //biz temp
    //TODO it is important api
    server.put({path:'/api/bizHard',contentType: 'application/json'},biz.updateBizHardInfo);
    //biz  token
    server.put('/api/biz/:bizId/prod/:prodId/clearImage',roleBase.checkBizManagerToken,prod.clearProdImg);
    //biz  token
    server.put({path:'/api/biz/:bizId/cust/:custId/custComment',contentType: 'application/json'},roleBase.checkBizManagerToken , biz.setBizCustRelComment);
    //biz  token
    server.get('/api/biz/:bizId/cust/:custId/bizCustRel',roleBase.checkBizOwnerToken , biz.getBizRelCust);
    
    //cust not security
    //server.get('/api/cust/:id',cust.getCust);
    //cust
    server.get('/api/customerInfo',cust.getCustomerInfo);
    //cust
    server.get('/api/cust/:custId/biz',roleBase.checkCustomerToken ,cust.listCustBiz);
    //everyone US
    server.post({path:'/api/cust/us',contentType: 'application/json'}, cust.addUsCust);
    //everyone CN
    server.post({path:'/api/cust/cn',contentType: 'application/json'}, cust.addCnCust);
    //cust
    server.put({path:'/api/cust/:custId',contentType: 'application/json'}, roleBase.checkCustomerToken ,cust.updateCust);
 
     //cust
    server.post({path:'cust/:custId/biz/:bizId/promo/:promoId/coupon',contentType:'multipart/form-data'},roleBase.checkCustomerToken ,coupon.addCoupon);
     //cust
    server.get('/api/cust/from/:custId/coupon',roleBase.checkCustomerToken ,coupon.listFromCustCoupon);
    //cust
    server.get('/api/cust/from/:custId/coupon/:couponId',roleBase.checkCustomerToken ,coupon.getFromCustCoupon);
     //cust
    server.get('/api/cust/to/:custId/coupon',roleBase.checkCustomerToken,coupon.listToCustCoupon);
    //cust
    server.get('/api/cust/to/:custId/coupon/:couponId',roleBase.checkCustomerToken,coupon.getToCustCoupon);
    //cust
    server.get('/api/cust/:custId/couponCount',coupon.getCouponCount);
    //cust
    server.post('/api/cust/:custId/biz/:bizId/checkin',roleBase.checkCustomerToken,cust.checkIn);
    //cust
    server.post({path:'/api/cust/:custId/changepassword',contentType:'application/json'},roleBase.checkCustomerToken ,cust.changePassword);
    //cust
    server.post({path:'/api/cust/do/login',contentType:'application/json'},cust.doLogin);
    //cust
    server.get('/api/cust/:custId/active',cust.activeUser);
    //cust
    server.post({path:'/api/cust/send/activeMail',contentType:'application/json'},cust.sendActiveEmail);
    //cust
    server.post({path:'/api/cust/send/passwordMail',contentType:'application/json'},cust.sendPasswordEmail);
    //cust
    server.post({path:'/api/cust/:phone/password',contentType:'application/json'},cust.resetCustPswd);
    //cust
    server.post({path:'/api/cust/:custId/biz/:bizId/favorite',contentType:'application/json'},roleBase.checkCustomerToken,cust.updateFavoriteBiz);
    //cust
    server.get('/api/cust/:custId/biz/:bizId/favorite',roleBase.checkCustomerToken,cust.getFavoriteBiz);
    //cust
    server.get('/api/cust/:custId/favoriteBiz' ,roleBase.checkCustomerToken,cust.getFavoriteBiz);
    //cust
    server.get('/api/cust/:custId/favoriteProd' ,roleBase.checkCustomerToken,cust.getFavoriteProduct);
    //cust
    server.get('/api/cust/:custId/prod/:productId/favorite' ,roleBase.checkCustomerToken,cust.getFavoriteProduct);
    //cust
    server.post('/api/cust/:custId/prod/:productId/favorite',roleBase.checkCustomerToken,cust.addProdCustRel);
    //cust
    server.del('/api/cust/:custId/prod/:productId/favorite',roleBase.checkCustomerToken,cust.deleteProdCustRel);
    //cust
    server.post({path:'/api/prod/:custId/prod/:productId/comment',contentType:'application/json'},roleBase.checkCustomerToken,prod.addProductComment);
    //cust
    server.get('/api/prod/:custId/custComment' ,roleBase.checkCustomerToken,prod.queryCommentByCust);
    //cust
    server.get('/api/prod/:productId/prodComment' ,prod.queryCommentByProd);
    //cust
    server.get('/api/prod/:productId/ratComment' ,prod.queryProductRating);
    //cust
    server.put({path:'/api/prod/:custId/comment/:id/',contentType:'application/json'},roleBase.checkCustomerToken,prod.updateProductComment);
    //cust
    server.del('/api/prod/:custId/comment/:id/' ,roleBase.checkCustomerToken,prod.deleteProductComment);
    //cust
    server.post({path:'/api/biz/:custId/biz/:bizId/comment',contentType:'application/json'},roleBase.checkCustomerToken , biz.addBizComment);
    //cust
    server.get('/api/biz/:custId/custBizComment' ,roleBase.checkCustomerToken ,biz.queryCommentByCust);
    //cust
    server.get('/api/biz/:bizId/bizComment' ,biz.queryCommentByBiz);
    //cust
    server.get('/api/biz/:bizId/ratBizComment' ,biz.queryBizRating);
    //cust
    server.put({path:'/api/biz/:custId/bizComment/:id/',contentType:'application/json'},roleBase.checkCustomerToken , biz.updateBizComment);
    //cust
    server.del('/api/biz/:custId/bizComment/:id/' , roleBase.checkCustomerToken , biz.deleteBizComment);
    //cust
    server.get('/api/biz/do/bizWithComment' ,biz.searchBizWithComment);
    //cust
    server.get('/api/prod/:bizId/prodWithComment' ,prod.getProductWithComment);
    server.get('/api/prod/:bizId/productWithCommentLabel' ,prod.getProductWithCommentLabel);
    //cust
    server.get('/api/prod/:productId/favoriteCount' ,prod.getProductFavoriteCount);
    //cust
    server.get('/api/biz/:bizId/favoriteCount' ,biz.getFavoriteBizCount);
    //cust
    server.get('/api/cust/do/searchProd' ,search.searchProduct);
    //cust
    server.get('/api/cust/do/searchProdTip' ,search.searchPrefixProduct);
    //cust
    server.get('/api/cust/do/searchBizTip' ,search.searchPrefixBiz);
    //cust
    server.get('/api/cust/do/searchProdLike' ,search.searchLikeProd);
    //cust
    server.get('/api/cust/do/searchBizLike' ,search.searchLikeBiz);
    //cust
    server.get('/api/cust/do/searchBiz' ,search.searchBusiness);
    server.get('/api/cust/do/searchWechatBiz' ,search.searchWechatBusiness);
    //cust
    server.get('/api/cust/do/createBizIndex',roleBase.checkAdminToken,search.createBusinessIndex);
    //server.get('/api/cust/do/createWechatBizIndex',search.createWechatBizIndex);
    //cust
    server.get('/api/cust/do/createProdIndex',roleBase.checkAdminToken,search.createProductIndex);
    //everyone
    server.get('/api/biz/:uniqueName/uniqueName',biz.convertUniqueToBizId);
    //cust
    server.get('/api/biz/:bizId/specialProduct',prod.getSpecialProduct);
    //cust
    server.post('/api/biz/:bizId/prod/:productId/order',prod.addProd2Order);
    //cust
    server.get('/api/cust/do/feedback',cust.qureyFeedback);
    //cust
    server.post({path:'/api/cust/do/feedback',contentType:'application/json'},cust.addFeedback);
    //biz
    server.put({path:'/api/biz/:bizId/specialProduct/:productId',contentType:'application/json'},roleBase.checkBizManagerToken,prod.updateProductSpecial);
    //cust
    server.post('/api/cust/:custId/biz/:bizId/bizCustRel',roleBase.checkCustomerToken,cust.createBizRelByCust);
    //cust
    //server.post('/api/cust/:custId/loginEmail/:newEmail',cust.sendUpdateEmailUrl);
    //cust
    server.put({path:'/api/cust/:custId/loginEmail',contentType:'application/json'},roleBase.checkCustomerToken,cust.updateLoginEmail);
    //biz
    server.post({path:'/api/cust/:custId/avatar',contentType:'multipart/form-data'},roleBase.checkCustomerToken,cust.updateCustAvatar);

    //cust
    server.get('/api/cust/do/bizPromo',promo.getAllBizPromo4Cust);
    //cust
    server.get('/api/cust/do/prodPromo',promo.getAllProdPromo4Cust);

    //everyone
    server.get('/api/biz/:bizId/prod',prod.listBizProd);
    server.get('/api/allLabel',prod.getAllLabel);
    //everyone
    server.get('/api/biz/:bizId/prodBase',prod.searchBizProdBase);
    server.get('/api/biz/:bizId/prodBase/:menuId',prod.searchBizProdBase);
    //everyone
    server.get('/api/biz/:bizId/prod/:id',prod.getBizProd);
    //biz
    server.post({path:'/api/biz/:bizId/prod',contentType: 'multipart/form-data'}, roleBase.checkBizManagerToken,prod.addBizProd);
    //biz
    server.put({path:'/api/biz/:bizId/prod/:id',contentType: 'application/json'}, roleBase.checkBizManagerToken,prod.updateBizProd);
    //biz
    server.del('/api/biz/:bizId/prod/:id', roleBase.checkBizManagerToken,prod.deleteBizProd);
    //everyone
    server.get('/api/biz/get/topDish',prod.getTopDishes);
    //biz
    server.put({path:'/api/biz/:bizId/prodActive/:prodId',contentType: 'application/json'} ,roleBase.checkBizManagerToken, prod.updateProductActive);
    //biz
    server.get('/api/biz/:bizId/totalCustCount' , roleBase.checkBizManagerToken , biz.getBizTotalCustCount);
    //biz
    server.get('/api/biz/:bizId/totalClickCount' , roleBase.checkBizManagerToken , biz.getBizTotalClickCount);
    //biz
    server.get('/api/biz/:bizId/lastCustCount' , roleBase.checkBizManagerToken , biz.getBizLastCheckIn);
    //biz
    server.get('/api/biz/:bizId/lastClickCount' , roleBase.checkBizManagerToken , biz.getBizLastClickCount);
    //biz token
    // server.get('/api/biz/:bizId/topClickProd/:size' , roleBase.checkBizOwnerToken , biz.getBizTopClickProd);
    server.get('/api/biz/:bizId/topClickProd/:size' , roleBase.checkBizOwnerToken , biz.getBizTopClickProdES);
    server.get('/api/biz/:bizId/topClickProdType/:size' , roleBase.checkBizOwnerToken , biz.getBizTopClickProdTypeES);
    //biz token
    server.get('/api/biz/:bizId/topOrderProd/:size' , roleBase.checkBizOwnerToken ,prod.getBizTopOrderProd);
    //biz token
    server.get('/api/biz/:bizId/topPointCust/:size' , roleBase.checkBizManagerToken , biz.getBizTopPointCust);
    //biz token
    // server.get('/api/biz/:bizId/dayClick/:size' , roleBase.checkBizOwnerToken , biz.getLastDayBizClick);
    server.get('/api/biz/:bizId/dayClick' , roleBase.checkBizOwnerToken , biz.getLastDayBizClickES);
    //biz token
    // server.get('/api/biz/:bizId/weekClick/:size' ,roleBase.checkBizManagerToken , biz.getLastWeekBizClick);
    server.get('/api/biz/:bizId/weekClick' ,roleBase.checkBizManagerToken , biz.getLastWeekBizClickES);
    //biz token
    // server.get('/api/biz/:bizId/monthClick/:size' , roleBase.checkBizManagerToken , biz.getLastMonthBizClick);
    server.get('/api/biz/:bizId/monthClick' , roleBase.checkBizManagerToken , biz.getLastMonthBizClickES);

    server.get('/api/biz/:bizId/getBizConsume' , roleBase.checkBizManagerToken , biz.getBizConsumeES);
    //biz token
    server.get('/api/biz/:bizId/dayOrder/:size' , roleBase.checkBizManagerToken ,prod.getDayProdOrderStat);
    //biz token
    server.get('/api/biz/:bizId/weekOrder/:size' , roleBase.checkBizManagerToken ,prod.getWeekProdOrderStat);
    //biz token
    server.get('/api/biz/:bizId/monthOrder/:size' , roleBase.checkBizManagerToken ,prod.getMonthProdOrderStat);
    //biz token
    server.get('/api/biz/:bizId/allProdRel' ,roleBase.checkBizManagerToken ,prod.queryBizAllProdRel);
    //biz token
    server.get('/api/biz/:bizId/allProdComment' , prod.queryBizProdComment);
    //biz token
    server.get('/api/biz/:bizId/allFavorCust' , roleBase.checkBizManagerToken , biz.queryBizFavorCust);
    //biz
    server.get('/api/biz/:bizId/taxRate',biz.getTaxRateByBiz);

    //everyone
    server.get('/api/biz/:bizId/promo',promo.listBizPromo);
    //everyone
    server.get('/api/biz/:bizId/prod/:prodId/promo',promo.listBizProdPromo);
    //everyone
    server.get('/api/biz/:bizId/promo/:id',promo.getBizPromo);
    //biz
    server.post({path:'/api/biz/:bizId/promo',contentType: 'application/json'}, roleBase.checkBizManagerToken ,promo.addBizPromo);
    //biz
    server.put({path:'/api/biz/:bizId/promo/:id',contentType: 'application/json'}, roleBase.checkBizManagerToken ,promo.updateBizPromo);
    //biz
    server.del('/api/biz/:bizId/promo/:id',  roleBase.checkBizManagerToken ,promo.deleteBizPromo);
    //every
    server.get('/api/biz/:bizId/prodType', prod.getBizProdType);
    server.get('/api/biz/:bizId/prodType/:menuId', prod.getBizProdType);
    server.get('/api/biz/:bizId/prodLabel', prod.getProdLabel);
    //biz
    server.get('/api/biz/:bizId/prodType/:id', prod.getBizProdType);
    //biz
    server.post({path:'/api/biz/:bizId/prodType',contentType: 'application/json'},  roleBase.checkBizManagerToken ,prod.addBizProdType);
    //biz
    server.put({path:'/api/biz/:bizId/prodType/:typeId',contentType: 'application/json'}, roleBase.checkBizManagerToken , prod.updateBizProdType);
    //biz
    server.del('/api/biz/:bizId/prodType/:typeId',  roleBase.checkBizManagerToken ,prod.delBizProdType);
    //biz
    server.get('/api/biz/:bizId/promoNow', promo.getBizPromoNow);
    //biz
    server.get('/api/biz/:bizId/bizImg', biz.getBizImage);
    //biz token
    server.post('/api/biz/:bizId/bizImg', roleBase.checkBizManagerToken , biz.addBizImg);
    //biz token
    server.put('/api/biz/:bizId/bizImg/:imgId', roleBase.checkBizManagerToken , biz.updateBizImgFlag);
    //biz token
    server.del('/api/biz/:bizId/bizImg/:imgId', roleBase.checkBizManagerToken , biz.deleteBizImg);
    //biz token
    server.put('/api/biz/:bizId/bizImg/:imgId/update', roleBase.checkBizManagerToken , biz.updateBizImg);
    //biz menu
    server.get('/api/biz/:bizId/getBizMenu' , roleBase.checkBizManagerToken , prod.getBizMenu);
    server.post('/api/biz/:bizId/addBizMenu' , roleBase.checkBizManagerToken , prod.addBizMenu);
    server.put('/api/biz/:bizId/updateBizMenu/:menuId' , roleBase.checkBizManagerToken , prod.updateBizMenu);
    server.del('/api/biz/:bizId/deleteBizMenu/:menuId' , roleBase.checkBizManagerToken , prod.deleteBizMenu);

    //everyone
    server.get('/api/point',point.listPoint);
    //everyone
    server.get('/api/point/:id',point.getPoint);

    //upload image to mongo db
    server.post({path:'/api/biz/:bizId/prod/:prodId/image',contentType:'multipart/form-data'}, roleBase.checkBizManagerToken ,prod.uploadImg);

    //serve image
    server.get({path:'/api/image/:id/:size'},image.serveImg);
    //serve batch job for reset image
    server.get({path:'/api/resetImg'},batchJob.resetAllImage);

    //serve menu in pdf
    //server.get('/api/biz/:bizId/pdf',pdf.getBizMenuPdf);
    server.get('/api/biz/:bizId/menupdf',pdf.getBizMenuPdf);
    server.get('/api/biz/:bizId/menupdf/:size',pdf.getBizMenuPdf);
    server.get('/api/biz/:bizId/menupdf_new',pdf.getBizMenuPdfNew);
    server.get('/api/biz/:bizId/menupdf_new/:ver',pdf.getBizMenuPdfNew);
    server.get('/api/export_my_table_as_pdf',pdf.getMyTablePdf);

    /**
     * server order module ,all need token autherization
     */

    server.post({path:'/api/biz/:bizId/printeOrderAll/:orderId',contentType: 'application/json'}, roleBase.checkBizWaiterToken ,order.printeOrderAll);
    server.post({path:'/api/biz/:bizId/printeOrderUrge',contentType: 'application/json'}, roleBase.checkBizWaiterToken ,order.printeOrderUrge);
    server.post({path:'/api/biz/:bizId/printeOrderSendKitchen',contentType: 'application/json'}, roleBase.checkBizWaiterToken ,order.printeOrderSendKitchen);

    // server.post({path:'/api/cust/:custId/order',contentType: 'application/json'},roleBase.checkCustomerToken,order.createOrder);
    server.post({path:'/api/cust/:custId/order',contentType: 'application/json'},roleBase.checkCustomerToken,order.createOrderNew);
    server.post({path:'/api/biz/:bizId/order',contentType: 'application/json'}, roleBase.checkBizWaiterToken ,order.createOrderNoPrice);
    server.post({path:'/api/biz/:bizId/orderPrice',contentType: 'application/json'},order.getOrderPrice);
    server.get('/api/cust/:custId/order', roleBase.checkCustomerToken ,order.getCustOrders);
    server.get('/api/biz/:bizId/order',roleBase.checkBizWaiterToken,order.getBizOrders);
    server.get('/api/biz/:bizId/orderHistory',roleBase.checkBizWaiterToken,order.getBizOrdersHistory);
    server.get('/api/biz/:bizId/order/:orderId',roleBase.checkBizWaiterToken,order.getOrderItemById);
    server.get('/api/cust/:custId/order/:orderId',roleBase.checkCustomerToken,order.getOrderItemById);
    server.put('/api/cust/:custId/order/:orderId/status/:status',roleBase.checkCustomerToken ,order.updateOrderStatus);
    server.put({path:'/api/biz/:bizId/order/:orderId/status/:status',contentType: 'application/json'},roleBase.checkBizWaiterToken ,order.updateOrderStatus);
    server.put('/api/cust/:custId/order/:orderId/item/:itemId/status/:status',roleBase.checkCustomerToken ,order.updateItemStatus);
    server.put('/api/biz/:bizId/order/:orderId/item/:itemId/status/:status',roleBase.checkBizWaiterToken ,order.updateItemStatus);
    //server.put('/api/biz/:bizId/order/:orderId/item/:itemId/cancel',order.cancelItemInOrder);
    //server.put('/api/cust/:custId/order/:orderId/item/:itemId/cancel',order.cancelItemInOrder);
    server.post({path:'/api/biz/:bizId/order/:orderId/addItem',contentType: 'application/json'},roleBase.checkBizWaiterToken ,order.addItemNoPrice);
    server.post({path:'/api/cust/:custId/order/:orderId/addItem',contentType: 'application/json'},roleBase.checkCustomerToken ,order.addItemToOrder);
    server.del({path:'/api/cust/:custId/order/:orderId/item',contentType: 'application/json'},roleBase.checkCustomerToken ,order.deleteOrderItem);
    server.del({path:'/api/biz/:bizId/order/:orderId/item',contentType: 'application/json'},roleBase.checkBizWaiterToken ,order.deleteItemNoPrice);
    server.put({path:'/api/cust/:custId/order/:orderId/resetSize',contentType: 'application/json'},roleBase.checkCustomerToken,order.resetOrderItemSize);
    server.put({path:'/api/biz/:bizId/order/:orderId/resetSize',contentType: 'application/json'},roleBase.checkBizWaiterToken,order.resetOrderItemSize);
    server.put('/api/biz/:bizId/order/:orderId/table/:tableId',roleBase.checkBizWaiterToken,order.updateOrderTable);
    server.get('/api/biz/:bizId/order/:orderId/table/:tableId',roleBase.checkBizWaiterToken,order.getBizTableOrders);
    server.put('/api/biz/:bizId/order/:orderId/orderPrice',roleBase.checkBizWaiterToken,order.reUpdateOrderPrice);
    server.put('/api/biz/:bizId/orderStatus/:orderStatus',roleBase.checkBizWaiterToken,biz.setBizOrderStatus);
    server.get('/api/biz/:bizId/orderCustomer',roleBase.checkBizWaiterToken,order.getBizOrderCustomer);
    server.get('/api/biz/:bizId/order/:orderId/invoice',roleBase.checkBizWaiterToken,order.getOrderForInvoice);
    server.post('/api/biz/:bizId/dayOrderStat',roleBase.checkBizManagerToken,order.finishBizOrder);
    server.get('/api/biz/:bizId/dayOrderStat',roleBase.checkBizManagerToken,order.getBizDayOrderStat);
    server.del({path:'/api/cust/:custId/order/:orderId',contentType: 'application/json'},roleBase.checkCustomerToken , order.deleteOrder );
    server.get('/api/biz/:bizId/order/:orderId/item',roleBase.checkBizWaiterToken,order.getOrderInfoWithItem);
    server.get('/api/cust/:custId/order/:orderId/item',roleBase.checkCustomerToken,order.getOrderInfoWithItem);
    server.put('/api/cust/:custId/order/:orderId/active',roleBase.checkCustomerToken,order.setOrderActive);
    server.get('/api/biz/:bizId/dailyOrder',roleBase.checkBizWaiterToken,order.bizDailyOrder);
    server.get('/api/biz/:bizId/dayOrderPaymentStat',order.getBizOrderStat);
    server.get('/api/biz/:bizId/searchBizOrder',order.searchBizOrder);

    server.put('/api/biz/:bizId/parent/:parentId',roleBase.checkBizManagerToken,biz.setBizParent);
    server.get('/api/biz/:bizId/parentProd',prod.getParentProd);
    server.post({path:'/api/cust/:custId/contact',contentType: 'application/json'},roleBase.checkCustomerToken,cust.addCustContact);
    server.put('/api/cust/:custId/contact/:contactId',roleBase.checkCustomerToken,cust.updateCustContact);
    server.get('/api/cust/:custId/contact',roleBase.checkCustomerToken,cust.getCustContact);
    server.del('/api/cust/:custId/contact/:contactId',roleBase.checkCustomerToken,cust.delCustContact);
    server.get('/api/bizCity',biz.getBizDistinctCity)
    server.post('/api/wechat',wechat.wechatMain);
    server.get('/api/wechat',wechat.wechatMain);
    server.get('/api/wechat/menu',wechat.createWechatMenu);
    server.get('/api/wechat/sendMsg',wechat.sendTestMsg);
    server.get('/api/wechat/ticket',wechat.getApiTicket);
    server.get('/api/wechat/user',wechat.getUserInfoByCode);
    server.get('/api/wechat/user/:openId',wechat.getUserInfoByCode);
    server.get('/api/wechat/user/:openId/bizwiseToken',cust.getTokenByWechat);
    server.post({path:'/api/wechat/payment',contentType: 'application/json'},wechat.wechatPayment);
    server.get('/api/wechat/paymentCallback',wechat.wechatPaymentCallback);
    server.post('/api/wechat/paymentCallback',wechat.wechatPaymentCallback);
    server.get('/api/wechat/paymentError',wechat.wechatPaymentCallback);
    server.post('/api/wechat/paymentError',wechat.wechatPaymentCallback);

    server.put('/api/wechat/paymentCallback',wechat.wechatPaymentCallback);
    server.get('/api/wechat/:giftCode/receive',wechat.receiveGift);

    server.post({path:'/api/payment/bizInvoice',contentType: 'application/json'},payment.addBizInvoice);
    server.put({path:'/api/payment/bizInvoice/:invoiceId',contentType: 'application/json'},payment.updateBizInvoiceStatus);
    server.get('/api/payment/bizInvoice',payment.queryBizInvoice);


    // callout
    server.get('/api/callout', biz.queryAllCallOut);
    server.get('/api/biz/:bizId/callout', biz.queryBizCallOut);
    server.post({path:'/api/biz/:bizId/callout',contentType: 'application/json'}, biz.addBizCallOut);
    server.del('/api/biz/:bizId/callout/:callOutId',biz.deleteBizCallOut);
    /**
     * server business table management module ,all need token autherization
     */
    server.post({path:'/api/biz/:bizId/table',contentType: 'application/json'},roleBase.checkBizManagerToken,table.addBizTable);
    server.put({path:'/api/biz/:bizId/table/:tableId',contentType: 'application/json'},roleBase.checkBizManagerToken,table.updateBizTableInfo);
    server.put('/api/biz/:bizId/table/:tableId/status/:status',roleBase.checkBizManagerToken,table.updateBizTableStatus);
    server.del('/api/biz/:bizId/table/:tableId',roleBase.checkBizManagerToken,table.deleteBizTable);
    server.get('/api/biz/:bizId/table',table.queryBizTable);
    server.get('/api//biz/:bizId/availableTableQrCodes',roleBase.checkBizManagerToken,table.queryAvailableTableQrCode);

    /**
     * server business EXTEND management module ,all need token autherization
     */
    server.post({path:'/api/biz/:bizId/extend',contentType: 'application/json'}, roleBase.checkBizManagerToken , biz.addBizExtend);
    server.put({path:'/api/biz/:bizId/extend/:extendId',contentType: 'application/json'},roleBase.checkBizManagerToken ,biz.updateBizExtend);
    server.del('/api/biz/:bizId/extend/:extendId',roleBase.checkBizManagerToken , biz.delBizExtend);
    server.get('/api/biz/:bizId/extend', roleBase.checkBizWaiterToken , biz.getBizExtend);


    /**
     * server business PRINTER management module ,all need token autherization
     */
    server.post({path:'/api/biz/:bizId/printer',contentType: 'application/json'}, roleBase.checkBizManagerToken , biz.addBizPrinter);
    server.put({path:'/api/biz/:bizId/printer/:printerId',contentType: 'application/json'},roleBase.checkBizManagerToken ,biz.updateBizPrinter);
    server.del('/api/biz/:bizId/printer/:printerId',roleBase.checkBizManagerToken , biz.delBizPrinter);
    server.get('/api/biz/:bizId/printer', roleBase.checkBizWaiterToken , biz.getBizPrinter);

    server.post({path:'/api/biz/:bizId/printer',contentType: 'application/json'},biz.addBizPrinter);
    server.put({path:'/api/biz/:bizId/printer/:printerId',contentType: 'application/json'},biz.updateBizPrinter);
    server.del('/api/biz/:bizId/printer/:printerId',biz.delBizPrinter);
    server.get('/api/biz/:bizId/printer',biz.getBizPrinter);
    server.post({path:'/api/biz/:bizId/printerTest',contentType: 'application/json'},biz.testBizPrinter);
    /**
     *  server payment module , all need token autherization
     */
    server.post({path:'/api/cust/:custId/order/:orderId/payment',contentType:'application/x-www-form-urlencoded'},roleBase.checkCTokenForBT ,payment.doPayment);
    server.post({path:'/api/cust/:custId/order/:orderId/paypal',contentType:'application/json'},roleBase.checkCustomerToken,payment.doPaypal);
    server.get('/api/cust/:custId/paymentToken',payment.getPaymentClientToken);
    server.get('/api/cust/:custId/payment',roleBase.checkCustomerToken,payment.queryCustomerPayment);
    server.get('/api/biz/:bizId/payment',payment.queryBizPayment);
    server.get('/api/refund/:transactionId',payment.doRefund);
    server.get('/api/biz/:bizId/transaction/:transactionId',payment.queryTransaction);
    server.get('/api/cust/:custId/transaction/:transactionId',payment.queryTransaction);
    server.get('/api/biz/:bizId/paymentStat',payment.getBizPaymentStat);
    server.post({path:'/api/cust/:custId/order/:orderId/alipay',contentType:'application/json'},roleBase.checkCustomerToken,payment.doAlipay);
    server.post({path:'/api/alipay/notify',contentType:'application/x-www-form-urlencoded'},payment.receiveAlipayNotify);
    server.get('/api/alipay/return',function(req,res,next){
        var orderId = req.params.out_trade_no
        res.redirect('/checkout-order-success?orderId='+orderId,next);
    })
    /**
    测试接口
    server.get('/api/saveOrder',payment.saveOrder);
    server.get('/api/notify',payment.getNotify);
    server.get('/api/writeLog',payment.writeLog);
    server.get('/api/testnotify',payment.testnotify);
    server.get('/api/testnotifyParameter',payment.testnotifyParameter);
    server.post({path:'/api/cust/alipay/:custId',contentType:'application/json'},roleBase.checkCustomerToken,payment.doAlipay);
     */

    /**
     * server business Role Base Control Module ,all need token autherization
     */
    server.post({path:'/api/biz/:bizId/bizUser/:userId/manager',contentType: 'application/json'}, roleBase.checkBizOwnerToken , roleBase.addBizManager);
    server.post({path:'/api/biz/:bizId/bizUser/:userId/waiter',contentType: 'application/json'}, roleBase.checkBizManagerToken , roleBase.addBizWaiter);
    server.put({path:'/api/biz/:bizId/bizUser/:userId/manager',contentType: 'application/json'}, roleBase.checkBizOwnerToken , roleBase.updateBizManager);
    server.put({path:'/api/biz/:bizId/bizUser/:userId/waiter',contentType: 'application/json'}, roleBase.checkBizManagerToken , roleBase.updateBizWaiter);
    server.del('/api/biz/:bizId/bizUser/:userId/manager', roleBase.checkBizOwnerToken , roleBase.removeBizUserRole);
    server.del('/api/biz/:bizId/bizUser/:userId/waiter', roleBase.checkBizWaiterToken , roleBase.removeBizUserRole);
    server.get('/api/biz/:bizId/bizUser', roleBase.checkBizManagerToken , roleBase.getBizEmployee);
    server.get('/api/biz/:bizId/bizUser/:user', roleBase.checkBizManagerToken , roleBase.searchBizUser);

    /**
     * server APN
     */
    server.get('/api/biz/:bizId/apn', iosPush.pushAPNTest);

    /**
     * Admin Module
     */
    server.get('/api/admin/:adminId' ,roleBase.checkAdminToken,admin.getAdminUserInfo);
    server.post({path:'/api/admin/do/login',contentType: 'application/json'},admin.adminUserLogin);
    server.put({path:'/api/admin/:adminId/password',contentType: 'application/json'} ,roleBase.checkAdminToken,admin.changeAdminPassword);
    server.put({path:'/api/admin/:adminId',contentType: 'application/json'} ,roleBase.checkAdminToken,admin.updateAdminInfo);

    /**
     * Sms Module
     */
    server.post({path:'/api/sms/:phone/sign' ,contentType: 'application/json'},sms.sendSignInSms);
    server.post({path:'/api/sms/:phone/password' ,contentType: 'application/json'},sms.sendPasswordSms);

    /**
     * Admin Biz & Customer Module
     */
    server.post({path:'/api/admin/:adminId/biz',contentType:'multipart/form-data'},roleBase.checkAdminToken,biz.createBusiness);
    server.get('/api/admin/:adminId/biz/:bizId' ,roleBase.checkAdminToken,biz.getBiz);
    server.get('/api/admin/:adminId/biz' ,roleBase.checkAdminToken,biz.listBiz);
    server.get('/api/admin/:adminId/biz/:bizId/order' ,roleBase.checkAdminToken,order.getBizOrders);
    // server.put({path:'/api/admin/:adminId/biz/:bizId/hardInfo',contentType: 'application/json'},roleBase.checkAdminToken,biz.updateBizHardInfo);
    server.put({path:'/api/admin/:adminId/biz/:bizId/hardInfo',contentType: 'application/json'},biz.updateBizHardInfo);
    server.put({path:'/api/admin/biz/:bizId/active/:active',contentType: 'application/json'}, roleBase.checkAdminToken,biz.updateBizActive);

    server.get('/api/admin/:adminId/bizUserRel' ,roleBase.checkAdminToken,biz.getBizUserRel);
    server.put({path:'/api/admin/:adminId/biz/:bizId/bizUser/:userId/bizUserRel',contentType: 'application/json'} ,roleBase.checkAdminToken,biz.updateBizUserRel);
    server.post({path:'/api/admin/:adminId/biz/:bizId/bizUserRel',contentType: 'application/json'} ,roleBase.checkAdminToken,biz.addBizUserRel);
    server.put({path:'/api/admin/:adminId/biz/:bizId/bizUser/:userId/bizUser',contentType: 'application/json'} ,roleBase.checkAdminToken,biz.updateBizUserInfo);
    server.post({path:'/api/admin/:adminId/biz/:bizId/bizUser',contentType: 'application/json'} ,roleBase.checkAdminToken,biz.addBizUser);
    server.del('/api/admin/:adminId/biz/:bizId/bizUser/:userId/bizUserRel' ,roleBase.checkAdminToken,biz.deleteBizUserRel);
    server.get('/api/admin/:adminId/orders' ,roleBase.checkAdminToken,order.queryAllOrder);
    server.get('/api/admin/:adminId/usedQrCodes' ,roleBase.checkAdminToken,table.queryUsedTableQrCode);
    server.get('/api/admin/:adminId/availableQrCodes' ,roleBase.checkAdminToken,table.queryAvailableTableQrCode);
    server.post({path:'/api/admin/:adminId/biz/:bizId/sendBizUserResetPasswordMail',contentType:'application/json'},roleBase.checkAdminToken,biz.adminSendResetPasswordEmailForBizUser);

    //liling
    server.post({path:'/api/admin/:adminId/biz/:bizId/importFile',contentType:'multipart/form-data'}, admin.importFile); //add roleBase.checkAdminToken back in the end
        //test
    //server.get('/api/importBizLocation',apiUtil.saveBizLocation);
    //test
    //server.get('/api/bizGeoIndex',search.createBusinessGeoIndex);
    //test
    //server.get('/api/bizGeoSearch',search.searchBizWithGeo);

    //test
    server.post({path:'/api/rrkd',contentType: 'application/json'}, rrkd.getRrkdTestData);


    //weixin
    server.get('/api/getWeiXinAccessToken/code/:code/refreshToken/:refreshToken',WeiXinApi.getWeiXinAccessToken);
    server.post('/api/getWeiXinUser',WeiXinApi.getWeiXinUser);
    server.post('/api/addOperatorUser',WeiXinApi.addOperatorUser);
    server.post('/api/addOperatorHistory',WeiXinApi.addOperatorHistory);
    server.get('/api/getWxSDKAccessToken',WeiXinApi.getWxSDKAccessToken);
    server.get('/api/getWxSDKTicket/accessToken/:accessToken',WeiXinApi.getWxSDKTicket);

    server.post('/api/wxPayResource',WeiXinApi.wxPayResource);
    server.get('/api/getWXPayParams',WeiXinApi.getWXPayParams);


    //消费汇总表
    server.get('/api/biz/:bizId/consumeGroup'  , biz.getCousumeGroup);

    //biz 结账方式设置
    server.post({path:'/api/biz/:bizId/checkoutInfo',contentType: 'application/json'}, roleBase.checkBizManagerToken , biz.addBizCheckoutInfo);
    server.put({path:'/api/biz/:bizId/checkoutInfo/:id',contentType: 'application/json'},roleBase.checkBizManagerToken ,biz.updateCheckoutInfoById);
    server.del('/api/biz/:bizId/checkoutInfo/:checkoutId/:id',roleBase.checkBizManagerToken , biz.deleteBizCheckoutInfo);
    server.get('/api/biz/:bizId/checkoutInfo', roleBase.checkBizManagerToken , biz.queryBizCheckoutInfo);

    server.post({path:'/api/biz/:bizId/orderMoney',contentType: 'application/json'}, roleBase.checkBizManagerToken ,order.addOrderMoney);
    server.get('/api/biz/:bizId/orderMoneyAleardy', roleBase.checkBizManagerToken , order.getOrderMoneyAleardy);
    server.get('/api/biz/:bizId/getOrderMoney'  , order.getOrderMoney);

    //多人点单
    server.post({path:'/api/biz/:bizId/qr/:qr/addOrderItemTemp',contentType: 'application/json'}, order.addOrderItemTemp);
    server.del('/api/biz/:bizId/qr/:qr/deleteOrderItemTemp',order.deleteOrderItemTemp);
    server.get('/api/biz/:bizId/qr/:qr/openId/:openId/getOrderItemTemp',order.getOrderItemTemp);
    server.get('/api/biz/:bizId/qr/:qr/getOrderParamsNew',order.getOrderParamsNew);
    server.get('/api/biz/:bizId/qr/:qr/getOrderItemTempProdsAll',order.getOrderItemTempProdsAll);

    //百度翻译
    server.post('/api/baiduTranslate'  , prod.baiduTranslate);
    server.get('/api/getConnectState',cust.getConnectState);
    server.get('/api/order/:orderId/getOrderInfoById'  , order.getOrderInfoById);
    server.get('/api/biz/:bizId/getOrderMaxUpdateOn'  , order.getOrderMaxUpdateOn);
    // Register a default '/' handler

    /*server.get('/api/', function root(req, res, next) {
        var routes = [
            'GET     /',
            'GET     /biz',
            'GET     /biz/:id',
            'GET     /biz/:id/cust',
            'GET     /biz/:id/cust/:id/act',
            'GET     /biz/:bizId/prod',
            'GET     /biz/:bizId/prod/cat',
            'GET     /biz/:bizId/prod/:id',
            'POST    /biz/:bizId/prod',
            'POST    /biz/:bizId/image',
            'PUT     /biz/:bizId/prod/:id',
            'DELETE  /biz/:bizId/prod/:id',
            'GET     /biz/:bizId/promo',
            'GET     /biz/:bizId/promo/:id',
            'GET     /biz/:bizId/prod/:prodId/promo',
            'POST    /biz/:id/promo',
            'PUT     /biz/:id/promo/:id',
            'DELETE  /biz/:id/promo/:id',
            'GET     /biz/:bizId/coupon',
            'GET     /biz/:bizId/promo/:promoId/coupon',
            'GET     /biz/:bizId/coupon/:couponId',
            'POST    /biz/:bizId/coupon/:couponeId/redeem',
            'GET     /cust/:id',
            'GET     /customerInfo',
            'POST    /cust',
            'PUT     /cust/:id',
            'GET     /cust/:id/biz',
            'POST    /cust/:custId/biz/:bizId/promo/:promoId/coupon    (contentType:multipart/form-data)',
            'GET	 /cust/from/:custId/coupon',
            'GET     /cust/from/:custId/coupon/:couponId',  
            'GET	 /cust/to/:custId/coupon',
            'GET     /cust/to/:custId/coupon/:couponId',  
            'POST    /cust/:custId/biz/:bizId/checkin', 
            'POST    /cust/:custId/changepassword',
            'POST    /cust/to/doLogin',
            'GET     /point',
            'GET     /point/:id',
            'GET     /biz/:id/user',
            'GET     /biz/:id/user/:id',
            'POST    /biz/:id/user',
            'PUT     /biz/:id/user/:id',
            'DELETE  /biz/:id/user/:id',
            'GET     /image/:id/:size'
        ];
        res.send(200, routes);
        next();
    });*/

    // Setup an audit logger
    if (!options.noAudit) {
        /*server.on('after', restify.auditLogger({
            body: false,
            log: bunyan.createLogger({
                level: 'info',
                name: 'TrueMenu-App',
                stream: process.stdout
            })
        }));*/
        /*server.on('after',serverLogger(
            {
                body: false,
                log: bunyan.createLogger({
                    level: 'info',
                    name: 'TrueMenu-App',
                    stream: process.stdout
                })
            }
        ));*/
    }
    server.on('NotFound', function (req, res, next) {
         //hack way to put the request protocol in prerender
        // req.isSecure() always return to false even in https
         prerender.protocol=sysConfig.getServerProtocol();
         prerender(req,res,function() {
             res.setHeader('Content-Type', 'text/html');
             res.writeHead(200);
             //console.dir(req);
             var url = req.getUrl();
             var queryString = '';
             if (url.pathname) {
                 queryString += "path=" + url.pathname;
             }
             if (url.query) {
                 queryString += "&query=" + encodeURIComponent(url.query);
             }
             //console.log("combined url---------------");
             //console.dir(url);
             //console.log(queryString);
             res.end("<html><script>window.location.href='/?" + queryString + "'</script></html>");
             next();
         });



      /*  prerender(req, res, function () {
            var host = req.header('Host');
            var proto = req.isSecure() ? 'https://' : 'http://';
            var url = req.getUrl();
            var queryString = '';
            if (url.pathname) {
                queryString += "path=" + url.pathname;
            }
            if (url.query) {
                queryString += "&" + url.query;
            }
            var page = '/';
//        var BIZ_PAGE = '/business.html';
//        if(path.indexOf(BIZ_PAGE)==0) {
//            path = path.substring(BIZ_PAGE.length);
//            page = BIZ_PAGE;
//        }
//        else {
//            page = '/';
//        }
            //path = (path[0] === '/') ? path.substring(1) : path;

            res.setHeader('Content-Type', 'text/html');
            res.setHeader('Location', proto + host + page + '?'+ queryString);

            console.log('here======='+queryString);

            res.writeHead(301);
//        res.end("<html><script>window.location.href='/?path="+req.getPath().substring(1)+"';</script></html>");
            res.end();
            next();

        })*/
    })
    server.on('after', apiUtil.save);

    return (server);

}



///--- Exports

module.exports = {
    createServer: createServer
};