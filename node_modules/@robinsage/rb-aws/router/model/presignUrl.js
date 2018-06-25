const express = require('express');
const https = require('https');

module.exports = function(Model, route, out, buildProcess)
{
    const EmailAddress = require_robinbase('aws:model:EmailAddress');

    const router = express.Router();

    router.get(`/${route}/aws/presigned-url`, (req, res) =>
    {
        const authorization = res.locals.authorization;

        const extension = req.query.extension;

        if (!authorization || (authorization.isAccessDenied('create') && authorization.isAccessDenied('update')))
        {
            if (res.locals.authorization && res.locals.authorization.isAccessDenied('create'))
            {
                return res.showError('You do not have permission to perform this action', 401);
            }
        }

        if (!extension)
        {
            return res.showError('An extension must be provided');
        }

        const Config = require_robinbase('Config');
        const AWS = require_robinbase('aws:service:communication:AWS');
        const uploader = Config.uploaders.default;

        const key = uploader.path + '/' + randomId() + '.' + extension;

        AWS.getPresignedUrl(key, (err, data) =>
        {
            Debug.log('GET PRESIGNED URL:', err, data);
            if (err)
            {
                return res.showError(err.message || err);
            }

            return res.respond(data);
        });
    });

    return router;
}


function randomId() {
    var allowed = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

    var string = "";

    for (var i = 0; i < 24; i++) {
        string += allowed[Math.floor(Math.random() * allowed.length)];
    }

    return string;
}
