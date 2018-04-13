'use strict'

const
    NotFoundException = require('../../exception/notFoundException')

/**
 * 
 * 
 * @module 资源404错误处理
 */
module.exports = (req, res, next) => {
    console.log('ip-' + req.ip)
    next(new NotFoundException('Not Found'));
}