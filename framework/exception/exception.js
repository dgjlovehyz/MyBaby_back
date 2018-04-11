'use strict'

class Exception extends Error {
    constructor(message, code, statusCode) {
        super(message);
        this.statusCode = statusCode || 500;
        if (code || code === 0)
            this.code = code
    }
}

module.exports = Exception;