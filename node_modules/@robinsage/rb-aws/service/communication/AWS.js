/**
 * Created by dc on 6/26/14.
 */
const fs = require('fs');
const aws = require('aws-sdk');
const _ = require('lodash');
const Debug = require_robinbase('Debug').prefix("AWS");
const mime = require('mime');

var Config = null;

var s3;
var ses;
var route53;
var sns;

var Interface = function(){};

Interface.init = function(config)
{
    Config = config;
    aws.config.update({"accessKeyId":Config.RB_AWS_KEY, "secretAccessKey":Config.RB_AWS_SECRET, "region": "us-east-1"});
    s3 = new aws.S3();
    ses = new aws.SES();
    route53 = new aws.Route53();
    sns = new aws.SNS();
}

function getIPAddress(ifaces)
{
    return Object.keys(ifaces).forEach(function (ifname) {
        var alias = 0;

        ifaces[ifname].forEach(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
            }

            if (alias >= 1) {
                // this single interface has multiple ipv4 addresses
                Debug.log(ifname + ':' + alias, iface.address);
                return iface.address[0];
            } else {
                // this interface has only one ipv4 adress
                Debug.log(ifname, iface.address);
                return iface.address;
            }
            ++alias;
        });
    });
}

Interface.subscribeForBrowser = function subscribeForBrowser(callback)
{
    /* var os = require( 'os' );

     var networkInterfaces = os.networkInterfaces( );

     Debug.log( 'Netork Interfaces', JSON.stringify(networkInterfaces, null, '\t') );

     var ipAddress = getIPAddress(networkInterfaces);

     Debug.log('IP Address', ipAddress);

     var params = {
     Protocol:  Config.RB_PROTOCOL,
     TopicArn: 'arn:aws:sns:us-east-1:010760734278:colocate-endpoint-update',
     Endpoint: Config.RB_PROTOCOL+'://'+ipAddress
     }

     sns.subscribe(params, function(err, data) {
     if (err)
     {
     Debug.log(err, err.stack);
     }
     else
     {
     Debug.log('DATA Response', data);
     }           // successful response
     });*/


    callback(null, 1);
}


/*Interface.buildSubDomains = function buildSubDomains(subDomain, callback)
 {
 var hostedZone = 'Z12UW0U09KS2PA'; //colocate.io

 var params = {
 "HostedZoneId": '/hostedzone/'+hostedZone,
 "ChangeBatch": {
 "Changes": [
 {
 "Action": "CREATE",
 "ResourceRecordSet": {
 "Name": subDomain+"."+Config.parseProxyDomain,
 "Type": "CNAME",
 "TTL": 300,
 "ResourceRecords": [
 {
 "Value": "cloudparse-parse.us-east-1.elasticbeanstalk.com"
 }
 ]
 }
 }
 ]
 }
 };

 route53.changeResourceRecordSets(params, function(err,data) {
 Debug.log(err, data);

 callback(err, data);
 });

 }*/


function canSendEmailTo(emailAddress, callback)
{
    const parts = emailAddress.split('@');
    if (parts.length !== 2) {
        return callback(null, false);
    }

    // amazon recommends not sending emails to addresses with these prefixes
    if (parts[0] === 'postmaster' || parts[0] === 'abuse' || parts[0] === 'noc') {
        return callback(null, false);
    }

    const EmailAddress = require_robinbase('aws:model:EmailAddress');

    EmailAddress.crud.getOne({address: emailAddress}, (err, result) =>
    {
        if (err)
        {
            callback(err);
        }
        else if (!result)
        {
            // create it
            const email = new EmailAddress({address: emailAddress, status: 'Valid'});
            EmailAddress.crud.create(email, (err, result) =>
            {
                if (err)
                {
                    callback(err);
                }
                else
                {
                    Debug.log('created new email record for ', emailAddress);
                    callback(null, true);
                }
            });
        }
        else
        {
            Debug.log('can send to ', emailAddress, '?', result.status === 'Valid');
            callback(null, result.status === 'Valid');
        }
    });
}


Interface.sendEmail = function sendEmail(_to, from, subject, text, html, attempts)
{
    Debug.log('SES EMAIL SEND', 'to '+_to);
    var to = [];
    if (_to == null)
    {
        Debug.log('To address is required!');
        return;
    }
    if (_.isString(_to))
    {
        to = [_to];
    }
    if (_.isArray(_to))
    {
        to = _to;
    }
    if (to.length == 0)
    {
        Debug.log('To address is required!');
        return;
    }

    if(!from || !_.isString(from))
    {
        Debug.log('From address is required!');
        return;
    }

    if(!subject || !_.isString(subject))
    {
        Debug.log('Subject is required!');
        return;
    }

    if(!html || !_.isString(html))
    {
        Debug.log('HTML is required!');
        return;
    }

    if(!text || !_.isString(text))
    {
        Debug.log('Text is required!');
        return;
    }

    var params = {};

    const doSendEmailTo = [];
    const sendEmailToIter = (ind) =>
    {
        if (ind >= to.length)
        {
            return sendEmail();
        }

        canSendEmailTo(to[ind], (err, doSend) =>
        {
            if (err)
            {
                Debug.warn('Error determining if email can be sent to:', to[ind], err);
            }
            else if (!doSend)
            {
                Debug.log('Cannot send email to ', to[ind]);
            }
            else
            {
                doSendEmailTo.push(to[ind]);
            }

            sendEmailToIter(ind+1);
        });
    }

    sendEmailToIter(0);

    function sendEmail(attempts)
    {
        if (doSendEmailTo.length == 0)
        {
            Debug.log('No valid emails were given!', doSendEmailTo);
            return;
        }

        if(!attempts)
        {
            attempts = 0;
        }

        ses.getSendQuota(params, function(err, data)
        {
            if (err)
            {
                Debug.log(err, err.stack);
                return;
            } // an error occurred

            //we have gone over our limit so wait for 5 min and try again.
            if(data.Max24HourSend > data.SentLast24Hours)
            {
                //go ahead and sent it if we are allowed
                var sendParams = {
                    Destination: { // required
                        ToAddresses: doSendEmailTo,
                    },
                    Message: { // required
                        Body: { // required
                            Html: {
                                Data: html // required
                            },
                            Text: {
                                Data: text // required
                            }
                        },
                        Subject: { // required
                            Data: subject // required
                        }
                    },
                    Source: from // required
                };
                ses.sendEmail(sendParams, function(err, data)
                {
                    if (err)
                    {
                        Debug.log('Error sending email', err, err.stack);
                    } // an error occurred
                    else
                    {
                        Debug.log('Successfully Sent Email', data);
                    }           // successful response
                });
            }
            else
            {
                //make sure we don't loop forever
                if(attempts < 10)
                {
                    Debug.log('try again in 5 min')
                    setTimeout(function(){
                        //call our cached function.
                        sendEmail(attempts+1);
                    }, 1000*60*5)
                }
                else
                {
                    Debug.log('unable to send message after 10 attempts');
                }
            }
        });
    }



};

Interface.putObject = function putObject(filePath, key, type, dir, fileKey, callback)
{
    const utils = require_robinbase('base:service:processor:Utils');

    if (arguments.length === 4)
    {
        callback = dir;
        dir = '';
        fileKey = utils.genStr(24);
    }
    else if (arguments.length === 5)
    {
        callback = fileKey;
        fileKey = utils.genStr(24);
    }

    // var ext = filePath.split('.');
    var ext = mime.extension(type);
    if (ext === 'jpeg')
    {
        ext = 'jpg';
    }
    var fileName = fileKey + '.' + ext;
    if (dir && dir !== '/')
    {
        fileName = dir + '/' + fileName;
    }

    var data = {
        'Bucket': Config.RB_S3_BUCKET,
        'Key': 'website/images/uploads/'+ fileName,
        'Body': fs.createReadStream(filePath),
        'ContentType': type,
        'CacheControl': 'max-age=31536000',
        'ACL':'public-read'
    };

    s3.putObject(data, function(err, res)
    {
        //remove file from this server
        fs.unlink(filePath, function(err)
        {
            if(err)
            {
                callback(err);
                return;
            }

            callback(null, {key:key, name: 'website/images/uploads/'+fileName});
        })

    });
}

Interface.putObjects = function putObjects(files, callback)
{
    const utils = require_robinbase('base:service:processor:Utils');

    if(_.isUndefined(callback) || !_.isFunction(callback))
    {
        callback = function callback(){};
    }

    if(_.isUndefined(files) || _.isEmpty(files) || !_.isObject(files))
    {
        callback('Files are required');
        return;
    }
    var fileKey = utils.genStr(24);


    function put(index)
    {
        var file = files[index];
        if(!file)
        {
            callback(null, files, fileKey);
            return;
        }

        var dir = '';
        if (Array.isArray(file))
        {
            dir = file[0];
            file = file[1];
        }


        Interface.putObject(file.path, file.fieldName, file.type || file.mimetype, dir, fileKey, function(err, result)
        {
            if(err)
            {
                Debug.log(err)
            }

            file.fullPath = result.name;


            //go to next file.
            put(index+1);
        });

    }

    put(0)
}

Interface.sendTextMessage = function(phoneNumber, content, callback)
{
    const outData = {
        Message: content || '',
        PhoneNumber: `+1${phoneNumber}`,
        // MessageAttributes: {
        //     DataType: 'String',
        //     StringValue: content || '',
        // },
    }

    sns.publish(outData, (err, result) =>
    {
        Debug.log('Send text message result: ', err, result);
        callback(err, result);
    });
}

Interface.getPresignedUrl = function(key, callback)
{
    const params = {
        Bucket: Config.RB_S3_BUCKET,
        Fields: {
            key,
        },
    };

    s3.createPresignedPost(params, callback);
}

//export my functions
module.exports = Interface;
