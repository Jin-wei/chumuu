/**
 * Created by nie on 22/2/18
 */

var mysql = require('mysql');
var Seq = require('seq');
var db = require('../../db.js');
var serverLogger = require('../ServerLogger.js');
var logger = serverLogger.createLogger('menulMain.js');
var prodDao = require('../../dao/ProdDao');
var MenuList = require('./MENUConfig')
var path = require('path');
var sysError = require('../SystemError.js');

function updateProdTypeMenuId(params,callback) {
    var query='update prod_type set menu_id=? where biz_id = ?';
    var paramStr=[],i=0;
    paramStr[i++]=params.menuId;
    paramStr[i++]=params.bizId;

    db.dbQuery(query, paramStr,function (error,rows) {
        logger.debug(' updateProdTypeMenuId complete');
        return callback(null);
    })
}


function initMenu(biz,callback){
    var defaultMenu='';
    Seq(MenuList.MENULISTS).seqEach(function (list,i) {
        var thatOne = this;
        var params=list;

        Seq(biz).seqEach(function (bizIndex,j) {
            params.bizId=bizIndex.biz_id;
            var thatTwo = this;
            //查是否有默认菜单
            Seq().seq(function () {
                var that =this;
                prodDao.getBizMenu(params,function (error,results) {
                    if(error){
                        logger.debug('initMenu-getBizMenu:'+error);
                        throw sysError.InternalError('initMenu-getBizMenu:'+error.message);
                    }else {
                        if(results.length==0){
                            that();
                        }else{
                            thatTwo(null,j)
                        }
                    }
                })
            }).seq(function () {
                //增加菜单
                var that= this;
                prodDao.addBizMenu(params,function (err,rows) {
                    if(err){
                        logger.debug('initMenu-addBizMenu:'+err);
                        throw sysError.InternalError('initMenu-addBizMenu:'+err.message);
                    }else{
                        params.menuId=rows.insertId;
                        //设置pro_type menu_id
                        that();
                    }

                })
            }).seq(function () {
                //更新小类 menu_id
                var that=this;
                if(list.default){
                    updateProdTypeMenuId(params,function (error,result) {
                        if(error){
                            logger.debug('initMenu-updateProdTypeMenuId:'+error);
                            throw sysError.InternalError('initMenu-updateProdTypeMenuId:'+error.message);
                        }else{
                            thatTwo(null,j)
                        }
                    });
                }else {
                    thatTwo(null,j)
                }
            })
        }).seq(function () {
            thatOne(null,i)
        })

    }).seq(function () {
        return callback(null);
    })

}

module.exports = {
    initMenu : initMenu
}