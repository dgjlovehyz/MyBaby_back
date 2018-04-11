"use strict";

const Exception = require("./exception");

/**
 * Class 800业务异常.
 */

class AdvertiException extends Exception {
    constructor(message, code,param) {
        var a = super(message, code, 400);
        a.param = param;
    }
}

module.exports = AdvertiException;
