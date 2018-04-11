'use strict'

const
    NotFoundException = require('../../exception/notFoundException')

/**
 * 
 * 
 * @module 资源404错误处理
 */
module.exports = (req, res, next) => {
    next(new NotFoundException('Not Found'));
}