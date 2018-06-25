module.exports = {
    path: __dirname,
    name: "AWS Integration",
    namespace: "aws",
    env: {
        RB_AWS_KEY: '',
        RB_AWS_SECRET: '',
        RB_S3_BUCKET: 'robinsage',
        RB_S3_UPLOAD_PATH: 'uploads',
        RB_AWS_REGION: 'us-east-1'
    },
    compileEnv: function(config)
    {
        var aws = require_robinbase('aws:service:communication:AWS');
        aws.init(config);

        var AWSS3Uploader = require_robinbase('aws:service:upload:AWSS3Uploader');
        AWSS3Uploader.init(config);
    }
}