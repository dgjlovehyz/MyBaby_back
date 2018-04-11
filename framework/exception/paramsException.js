"use strict";

const Exception = require("./exception");

/**
 *  参数异常
 */

class paramsException extends Exception {
    constructor(message, code) {
        super(message, code, 400);
    }
}


module.exports = paramsException;