var _path = require('path');
var fs = require('fs');
var ImageTransformer = require('image-transform');
var aws = require('aws-sdk');
var mime = require('mime');
var async = require('async');
var Config = null;

const PathFinder = require_robinbase('base:service:util:PathFinder');

var Debug = require_robinbase('Debug').prefix('AWSS3Uploader');

function AWSS3Uploader(options)
{
    var tmpdir = options.tmpdir || './tmp';
    this.transformer = new ImageTransformer({
        path: tmpdir
    });
    aws.config.update(options);
    this.s3 = new aws.S3();
    this.bucket = options.bucket;
    this.path = options.path;

    if (!this.bucket)
    {
        throw new Error('AWSS3Uploader requires a bucket');
    }
}

function randomId() {
    var allowed = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

    var string = "";

    for (var i = 0; i < 24; i++) {
        string += allowed[Math.floor(Math.random() * allowed.length)];
    }

    return string;
}

AWSS3Uploader.init = function(config)
{
    Config = config;
    var uploader = new AWSS3Uploader({
        "accessKeyId": Config.RB_AWS_KEY,
        "secretAccessKey": Config.RB_AWS_SECRET,
        "region": Config.RB_AWS_REGION,
        "bucket": Config.RB_S3_BUCKET,
        "path": Config.RB_S3_UPLOAD_PATH
    });

    // is there a better way to do this??
    Config.uploaders = Object.assign(Config.uploaders || {}, {"aws": uploader});
    if (!Config.uploaders.default)
    {
        Config.uploaders.default = uploader;
    }
}

AWSS3Uploader.prototype.upload = function(fileObj, options, key, callback)
{
    var self = this;

    var ext = mime.extension(fileObj.mimetype);
    if (ext === 'jpeg')
    {
        ext = 'jpg';
    }
    if (ext === 'bin')
    {
        var parts = fileObj.originalname.split('.');
        ext = parts.slice(1)[parts.length - 2] || 'bin';
    }

    var fileKey = randomId();

    var fileName = fileKey + '.' + ext;

    var retVal = {};

    var finish = function(err) {
        setTimeout(function()
        {
            fs.unlink(fileObj.path);
        }, 2000);
        if (options.hostProperty)
        {
            PathFinder.lookupSet(retVal, options.hostProperty, self.getBaseUrl());
            // retVal[options.hostProperty] = self.getBaseUrl();
        }
        if (options.mimeProperty)
        {
            PathFinder.lookupSet(retVal, options.mimeProperty, fileObj.mimetype);
            // retVal[options.mimeProperty] = fileObj.mimetype;
        }
        if(options.originalNameProperty)
        {
            PathFinder.lookupSet(retVal, options.originalNameProperty, fileObj.originalname);
            // retVal[options.originalNameProperty] = fileObj.originalname;
        }
        if (err)
        {
            Debug.warn('finished with error: ',err);
        }
        if (callback) {callback(err, retVal);}

    }

    // TODO: document this options
    var basePath = self.path;
    var extendedPath = '';
    if (options.path)
    {
        basePath += "/" + options.path;
        extendedPath = options.path + '/';
    }


    if (options.transforms)
    {
        async.mapValues(options.transforms, function(transform, name, callback){
            if (!transform)
            {
                return callback(null);
            }
            var path = basePath + '/' + name + '/' + fileName;
            var filePath = _path.resolve(process.cwd(), fileObj.path);
            if (Array.isArray(transform))
            {
                transform = {action: transform};
            }
            if (!Array.isArray(transform.action) || transform.action.length === 0)
            {
                // set to original
                if (transform.property)
                {
                    PathFinder.lookupSet(retVal, transform.property, extendedPath + fileName);
                    // retVal[transform.property] = extendedPath + fileName;
                }

                Debug.warn('Missing transform action for: ' + key + ' transform name: ' + name);
                return callback(null);
            }
            self.transformer.transform(filePath, transform.action, function(err, info, image)
            {
                if (err)
                {
                    return callback(err, null);
                }

                if (transform.property)
                {
                    PathFinder.lookupSet(retVal, transform.property, extendedPath + name + '/' + fileName);
                    // retVal[transform.property] = extendedPath + name + '/' + fileName;
                }
                PathFinder.lookupSet(retVal, name, "https://s3.amazonaws.com/" + self.bucket + '/' + path);
                // retVal[name] = "https://s3.amazonaws.com/" + self.bucket + '/' + path;
                self.putFile(path, fileObj.mimetype, image, options, callback);
            })
        }, function(err)
        {
            if (err)
            {
                return finish(err);
            }

            // save the original
            var path = basePath + '/' + fileName;
            // var stream = fs.createReadStream(fileObj.path);

            // There appears to be a bug in the aws-sdk s3 library
            // which makes it so that the first stream that you attempt
            // to send will never finish.  Thus, we are reading the contents
            // of the file into a buffer and sending that.
            // OY!
            fs.readFile(fileObj.path, (err, stream) => {
                let out = extendedPath + fileName;
                if (options.useFullPath) {
                    out = this.getBaseUrl() + out;
                }
                if (options.useFullObject) {
                    out = Object.assign({}, fileObj, {location: this.getBaseUrl() + extendedPath + fileName})
                }
                PathFinder.lookupSet(retVal, key, out);
                // retVal[key] = extendedPath + fileName;
                self.putFile(path, fileObj.mimetype, stream, options, finish);
            })

        });
    }
    else
    {
        var path = basePath + '/' + fileName;
        // var stream = fs.createReadStream(fileObj.path);
        fs.readFile(fileObj.path, (err, stream) => {
            let out = extendedPath + fileName;
            if (options.useFullPath) {
                out = this.getBaseUrl() + out;
            }
            if (options.useFullObject) {
                out = Object.assign({}, fileObj, {location: this.getBaseUrl() + extendedPath + fileName, key})
            }
            PathFinder.lookupSet(retVal, key, out);
            // retVal[key] = extendedPath + fileName;
            self.putFile(path, fileObj.mimetype, stream, options, finish);
        })

    }



    // this.transformer.transform(fileObj.path, this.transforms, function(err, info, image)
    // {
    //     console.log('ERR: ', err);
    //     console.log('INFO: ', info);
    //     console.log('IMAGE: ', image);
    // });
    //
    // callback(null, fileName);
    // return fileName;
}


AWSS3Uploader.prototype.putFile = function(path, type, stream, options, callback, retries = 0) {
    var self = this;

    if (typeof options === 'function' && !callback) {
        callback = options;
        options = {};
    }

    const {
        metadata = {},
        acl = 'public-read',
        cacheControl = 'max-age=31536000',
    } = options;

    var data = {
        'Bucket': self.bucket,
        'Key': path,
        'Body': stream,
        'ContentType': type,
        'CacheControl': cacheControl,
        'ACL': acl,
        'Metadata': metadata,
    }

    console.log('UPLOADING: ', data);

    self.s3.putObject(data, (err, result) => {
        if (err && err.code === 'RequestTimeout' && retries < 2) {
            return this.putFile(path, type, stream, options, callback, retries + 1);
        }
        Debug.log('PUT OBJECT RESULT:', err, result);
        callback(err, result);
    });
}

AWSS3Uploader.prototype.getBaseUrl = function() {
    const self = this;
    return 'https://s3.amazonaws.com/' + self.bucket + '/' + self.path + '/';
}

module.exports = AWSS3Uploader;
