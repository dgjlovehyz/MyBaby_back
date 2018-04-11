'use strict'

const
    Exception = require('./exception')

/**
 * Class 401登陆或权限异常.
 */

class AuthException extends Exception {
    constructor(message, code) {
        super(message, code, 401);
    }
}

module.exports = AuthException;