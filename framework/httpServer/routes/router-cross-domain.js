'use strict'

const _ = require('underscore');

/**
 * 
 * 
 * @module 跨域设置
 */
module.exports = (req, res, next) => {
    let access_control_request_headers = req.headers['access-control-request-headers'] || [];
    if (_.isArray(access_control_request_headers)) access_control_request_headers = access_control_request_headers.join(',');

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", access_control_request_headers);
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("Access-Control-Expose-Headers", "Token");

    next();
}