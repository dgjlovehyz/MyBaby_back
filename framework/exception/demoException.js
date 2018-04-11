"use strict";

const Exception = require("./exception");

/**
 * Class 400业务异常.
 */

class DemoException extends Exception {
    constructor(message, code) {
        super(message, code, 400);
    }
}

module.exports = DemoException;
