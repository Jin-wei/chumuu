var fs = require('fs');
var mdb = require('./resourcedb');
var Seq = require('seq');

var ObjectID = require('mongodb').ObjectID,
    GridStore = require('mongodb').GridStore
var gm = require('gm').subClass({ imageMagick: true });
var Grid = require('mongodb').Grid;

var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('BatchJob.js');

function resetAllImage(id, callback) {
    var imgIds = [];
    Seq().seq(function(){
        var that = this;
        mdb.getDb(function (err, db) {

            if (err) {
                logger.error(' resetAllImage ' + err.message);
                // db.close();
                return callback(err, null);
            }
            GridStore.list(db, {id:true},function(err, items) {

                if(err){
                    logger.error(' resetAllImage ' + err.message);
                    return callback(err, null);
                }else{
                    imgIds = items;
                    that();
                }
            })

        });
    }).seq(function(){
            var that = this;
            mdb.getDb(function (err, db) {

                if (err) {
                    // db.close();
                    logger.error(' resetAllImage ' + err.message);
                    return callback(err, null);
                }
                Seq(imgIds).seqEach(function(imgId,i){
                    var that =  this;
                    var fsCollection = db.collection('fs.files');
                    fsCollection.findOne({_id: imgIds[i]}, function(err, item) {
                        item.metadata.filename = item.filename;
                        item.filename = item._id +".jpeg";
                        fsCollection.update({_id:item._id},{$set:{metadata:item.metadata,filename:item.filename}},function(error,result){
                            that(null,i);
                        });

                    })
                })
                that();
            });
        }).seq(function(){
            logger.info(' resetAllImage ' + 'success');
            return callback(null, {success:200});
            //db.close();
        });


}

module.exports = {
    resetAllImage: resetAllImage
}