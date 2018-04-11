'use strict'

const
    Exception = require('./exception')

/**
 * Class 404服务器找不到资源异常.
 */

class NotFoundException extends Exception {
    constructor(message) {
        super(message, 404, 404);
    }
}

module.exports = NotFoundException;