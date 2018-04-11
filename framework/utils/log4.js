'use strict'

const
    log4js = require('log4js'),
    path = require('path'),
    fs = require('fs'),
    sysconf = require('../../config/system-config')

log4js.configure({
    appenders: [
        {
            type: 'console'
        },
        {
            type: "dateFile",
            filename: `./${sysconf.system.logDir}/kcmsdapi.log`,
            pattern: '-yyyy-MM-dd.log',
            maxLogSize: 1024 * 1024 * 5,//日志文件最大容量(byte)
            alwaysIncludePattern: false,
            level: 'ALL'
        }],
    replaceConsole: false, //是否将console.log替换为log4js (替换后console.log的level为"INFO")
    levels: {
        "all": "ALL",
        "error": "ERROR",
        "debug": "DEBUG",
        "info": "INFO",
        "trace": "TRACE",
        "warn": "WARN",
        "fatal": "FATAL"
    }
});

module.exports = {
    logger: function (name) {
        var logger = log4js.getLogger(name);
        logger.setLevel('ALL');
        return logger;
    },
    getLogger: function (name) {
        return log4js.getLogger(name);
    }
}