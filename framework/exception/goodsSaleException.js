"use strict";

const Exception = require("./exception");

/**
 * Class 801业务异常.
 */

class GoodsSaleException extends Exception {
    constructor(message, code,param) {
        var a = super(message, code, 811);
        a.param = param;
    }
}

module.exports = GoodsSaleException;
