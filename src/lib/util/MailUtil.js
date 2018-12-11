/**
 * Created by ling xue on 14-4-10.
 * The file include the functions of send mail
 */

var nodemailer = require("nodemailer");
var mailTemplateUtil = require('./MailTemplateUtil.js');
var serverLogger = require('./ServerLogger.js');
var logger = serverLogger.createLogger('MailUtil.js');
var sysConfig = require('../config/SystemConfig.js');



var activeMailTitle = "Welcome to use TruMenu";
var resetPasswordTitle = "Reset your TruMenu password" ;

var activeBizMailTitle = "Welcome to use BizWise";
var resetBizPasswordTitle =sysConfig.emailTemplates.resetBizPasswordEmailTitle;

var submitOrderMailTitle = " Thank you for your order at tru-menu .";
var cancelOrderMailTitle = "Your order in tru-menu ,has been cancelled .";
var confirmOrderMailTitle = "Your order from Tru Menu has been confirmed by restaurant";

var changeLoginMailTitle = "Revision to Your Tru-Menu.com Account";

/*var fromEmail = "trumenu@gmail.com" ;
var transport = nodemailer.createTransport("SMTP", {
    host: "smtp.gmail.com",
    //host:"smtp.live.com",
    //secureConnection: true,
    port: 587,
    auth: {
        user: fromEmail,
        pass: "Mission94539"
    }
});*/

var fromEmail = sysConfig.systemMailConfig.fromEmail ;
var transport = nodemailer.createTransport(sysConfig.systemMailConfig.smtp, sysConfig.systemMailConfig.options);

function sendActiveEmail(activeCode,actEmailInfo,customerId){
    mailTemplateUtil.createActiveUserTemplate(activeCode,actEmailInfo.first_name,customerId,function(error,data){
        transport.sendMail({
            from : fromEmail,
            to : actEmailInfo.email,
            subject: activeMailTitle,
            generateTextFromHTML : false,
            html : data
        }, function(error, response){
            //console.log("trying to send to email........");
            if(error){
                logger.error(' sendActiveEmail :'+ error.message);
                transport.close();
            }else{
                transport.close();
            }
            //callback(error,response);

        });
    });

}

function sendResetPasswordMail(newPassword,email ){
    mailTemplateUtil.createResetPasswordTemplate(newPassword,function(error,data){
        transport.sendMail({
            from : fromEmail,
            to : email,
            subject: resetPasswordTitle,
            generateTextFromHTML : false,
            html : data
        }, function(error, response){
            if(error){
                logger.error(' sendResetPasswordMail :'+ error.message);
                transport.close();
            }else{
                transport.close();
            }

        });
    });
}

function sendBizActiveEmail(activeCode,email,userId){
    mailTemplateUtil.createActiveBizTemplate(activeCode,email,userId,function(error,data){
        transport.sendMail({
            from : fromEmail,
            to : email,
            subject: activeBizMailTitle,
            generateTextFromHTML : false,
            html : data
        }, function(error, response){
            if(error){
                logger.error(' sendBizActiveEmail :'+ error.message);
                transport.close();
            }else{
                transport.close();
            }
            //callback(error,response);

        });
    });

}

function sendBizPasswordEmail(newPassword,email ){
    mailTemplateUtil.createResetBizPasswordTemplate(newPassword,function(error,data){
        if (error){
            logger.error(' sendBizPasswordEmail :'+ error.message);
        }
        transport.sendMail({
            from : fromEmail,
            to : email,
            subject: resetBizPasswordTitle,
            generateTextFromHTML : false,
            html : data
        }, function(error, response){
            if(error){
                logger.error(' sendBizPasswordEmail :'+ error.message);
                transport.close();
            }else{
                transport.close();
            }

        });
    });
}
function sendMail(toMail ,mailTitle ,mailContent,callback){
    transport.sendMail({
        //secureConnection: true,
        from : fromEmail,
        to : toMail,
        subject: mailTitle,
        generateTextFromHTML : true,
        html : mailContent
    }, function(error, response){
        if(error){
            logger.error(' sendMail :'+ error.message);
            transport.close();
        }else{
            transport.close();
        }
        callback(error,response);

    });
}

function sendConfirmOrderMail(params){
    if (params.custInfo.email==null){
        return;
    }
    mailTemplateUtil.createConfirmOrderMailTpl(params,function(error,data){
        var mailParams ={
            from : fromEmail,
            to : params.custInfo.email,
            subject: confirmOrderMailTitle,
            generateTextFromHTML : false,
            html : data
        }
        if(sysConfig.mailForward && sysConfig.mailForward){
            mailParams.bcc = sysConfig.mailForward;
        }
        transport.sendMail(mailParams, function(error, response){
            if(error){
                logger.error(' sendConfirmOrderMail :'+ error.message);
                transport.close();
            }else{
                logger.info(' sendConfirmOrderMail :'+ 'success');
                transport.close();
            }

        });
    });
}

function sendSubmitOrderMail(params){
    mailTemplateUtil.createSubmitOrderMailTpl(params,function(error,data){
        var mailParams = {
            from : fromEmail,
            to : params.custInfo.email,
            subject: submitOrderMailTitle,
            generateTextFromHTML : false,
            html : data
        };
        if(sysConfig.mailForward && sysConfig.mailForward.length>0){
            mailParams.bcc = sysConfig.mailForward;
        }
        transport.sendMail(mailParams, function(error, response){
            if(error){
                logger.error(' sendSubmitOrderMail :'+ error.message);
                transport.close();
            }else{
                logger.info(' sendSubmitOrderMail :'+ 'success');
                transport.close();
            }

        });
    })
}

function sendCancelledOrderMail(params){
    mailTemplateUtil.createCancelOrderMailTpl(params,function(error,data){
        var mailParams = {
            from : fromEmail,
            to : params.custInfo.email,
            subject: cancelOrderMailTitle,
            generateTextFromHTML : false,
            html : data
        } ;

        if(sysConfig.mailForward && sysConfig.mailForward.length>0){
            mailParams.bcc = sysConfig.mailForward;
        }
        transport.sendMail(mailParams, function(error, response){
            if(error){
                logger.error(' sendCancelledOrderMail :'+ error.message);
                transport.close();
            }else{
                logger.info(' sendCancelledOrderMail :'+ 'success');
                transport.close();
            }

        });
    });

}

function sendChangeAccountEmail(params){
    mailTemplateUtil.createChangeAccountMailTpl(params,function(error,data){
        var mailParams = {
            from : fromEmail,
            to : params.newEmail,
            subject: changeLoginMailTitle,
            generateTextFromHTML : false,
            html : data
        } ;

        transport.sendMail(mailParams, function(error, response){
            if(error){
                logger.error(' sendChangeAccountEmail :'+ error.message);
                transport.close();
            }else{
                logger.info(' sendChangeAccountEmail :'+ 'success');
                transport.close();
            }

        });
    });
}

module.exports = {
    sendMail : sendMail,
    sendActiveEmail :sendActiveEmail,
    sendResetPasswordMail : sendResetPasswordMail,
    sendBizActiveEmail : sendBizActiveEmail,
    sendBizPasswordEmail : sendBizPasswordEmail,
    sendSubmitOrderMail : sendSubmitOrderMail ,
    sendConfirmOrderMail : sendConfirmOrderMail,
    sendCancelledOrderMail : sendCancelledOrderMail,
    sendChangeAccountEmail : sendChangeAccountEmail
}