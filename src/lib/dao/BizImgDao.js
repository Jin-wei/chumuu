/**
 * Created by Ling Xue on 14-8-13.
 */
var Seq = require('seq');
var db=require('./../db.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('BizImageDao.js');

function getBizImage(params,callback){
    var query = "select  * FROM biz_img " +
        " where biz_id = ? ";
    var paramArr = [], i = 0;
    paramArr[i++]=params.bizId;
    if(params.imgId){
        query = query + " and id = ? ";
        paramArr[i++]=params.imgId;
    }
    query = query +"order by flag desc";
    if(params.size){
        query = query + " limit 0,?  ";
        paramArr[i]=parseInt(params.size);
    }


    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getBizImage ')
        return callback(error,rows);
    });
}

function addBizImg(params,callback){
    var query = "insert into biz_img(`biz_id`,`img_url`,`flag`,`des`) values (?,?,?,?)";
    var paramArr = [], i = 0;
    paramArr[i++]=params.bizId;
    paramArr[i++]=params.imgUrl;
    paramArr[i++]=params.flag || 0;
    paramArr[i]=params.des;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addBizImg ')
        return callback(error,rows);
    })
}

function deleteBizImg(params,callback){
    var query = "delete from biz_img where biz_img.id = ? ";
    var paramArr = [], i = 0;
    paramArr[i]=params.imgId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' deleteBizImg ')
        return callback(error,rows);
    })
}

function updateBizImgFlag(params,callback){
    var query = "update biz_img set flag = 1 where biz_id = ? and id = ? "
    var paramArr = [], i = 0;
    paramArr[i++]=params.bizId;
    paramArr[i]=params.imgId;
    Seq().seq(function() {
        var that = this;

        db.dbQuery(query,paramArr,function(error,rows){
            logger.debug(' updateBizImgFlag ')
            that();
        })
    }).seq(function(){
            var subQuery= "update biz_img set flag = 0 where biz_id = ? and id <> ? "

            db.dbQuery(subQuery,paramArr,function(error,rows){
                logger.debug(' updateBizImgFlag ')
                return callback(error, rows);
            })
        });

}

function updateBizImg(params,callback){
    var query = " update biz_img set img_url = ? where biz_id = ? and id = ? ";
    var paramArr = [], i = 0;
    paramArr[i++]=params.imgUrl;
    paramArr[i++]=params.bizId;
    paramArr[i]=params.imgId;
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateBizImg ')
        return callback(error,rows);
    })
}

module.exports = {
    getBizImage: getBizImage,
    addBizImg: addBizImg,
    deleteBizImg : deleteBizImg,
    updateBizImgFlag : updateBizImgFlag,
    updateBizImg : updateBizImg
}