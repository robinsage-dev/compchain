//DO NOT EDIT.  Unless you know what you're doing.
require('dotenv').config({silent: true});
var robinbasePath = process.env.ROBINBASE_PATH || '@robinsage/robinbase';
require(robinbasePath)(__dirname);