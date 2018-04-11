'use strict'

const
    mysql = require('mysql'),
    _ = require('underscore'),
    conf_env = require('./system-config-env'),
    conf_sys = {

        system: {

            // 日志目录
            logDir: 'logs',

            // 文档目录
            docDir: 'doc',

            // Session 过期时间（秒）
            sessionExpire: 3600
        },
    }

let _extend = function (destination, source) {
    for (let key in source) {
        //覆盖元素是对象(不包含数组), 并且目标元素也是对象(不包含数组)
        if (_.isObject(source[key]) && !_.isArray(source[key]) &&
            _.isObject(destination[key]) && !_.isArray(destination[key])) {
            _extend(destination[key], source[key]);
        } else {
            destination[key] = source[key];
        }
    }
}
//组合global_config_env对象
_extend(conf_sys, conf_env);

module.exports = conf_sys