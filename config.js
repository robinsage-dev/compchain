/*
Don't edit this file unless you really know what you're doing.
Do your settings in the environment variables.
 */
var Config = module.exports;
var DefaultConfig = require_robinbase('/defaults.js');

var querystring = require('querystring');

Config.RB_DEV_STATE = 'LOCAL'; //devState

if (typeof process.env.RB_ADMIN_MODELS != 'undefined')
{
    Config.adminModels = DefaultConfig.parseModelString(process.env.RB_ADMIN_MODELS, Config.adminModels, __dirname);
}
if (typeof process.env.RB_ALL_MODELS != 'undefined')
{
    Config.allModels = DefaultConfig.parseModelString(process.env.RB_ALL_MODELS, Config.allModels, __dirname);
}

var defaults = new DefaultConfig();

Object.assign(Config, defaults);

DefaultConfig.compileEnvironment(Config);

Config.storages = require('./storages.js')(Config);

Config.startUp = require('./startUp.js');

Config.crash = require('./crash.js');

Config.sendEmail = require_robinbase("aws:service:communication:AWS").sendEmail;

try
{
    Config.policyData = require('./authorization.json');
}
catch(e)
{
    console.log('====  CANNOT PARSE POLICY FILE!!!!  ========');
    console.log(e);
    console.log('running with empty policy *');
    console.log('');

    Config.policyData = {roles:[],policies:[]};
}
