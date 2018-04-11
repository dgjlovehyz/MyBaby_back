'use strict'

const
    sysconf = require('../../../config/system-config'),
    logger = require('../../utils/log4').logger('Error'),
    _ = require('underscore'),
    exception = global.require('./framework/exception/exception')

/**
 * 
 * 
 * 
 * @module 错误处理
 */
module.exports = (err, req, res, next) => {
    if (!!_.isString(err)) {
        err = new Error(err);
    }

    let
        statusCode = err.statusCode || 500,
        message = '未知错误',
        code = err.code

    if (err.code == void 0 || err.code == null)
        code = statusCode;

    if (err instanceof exception)
        message = err.message || message;

    // if (!!code || code === 0) {
    //     // 业务code存在
    //     message = err.message || message;
    // } else {
    //     code = statusCode;
    // };

    // 业务输出状态
    res.status(statusCode);

    logger.error(err);

    res.json(
        (
            sysconf.system.debug
            && err
            && {
                message: err.message,
                stack: err.stack || (new Error()).stack,
                code: code
            }
        ) || { message: message, code: code,param:err.param }
    );
}