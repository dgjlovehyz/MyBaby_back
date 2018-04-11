"use strict";

const Exception = require("./exception");

/**
 * Class 400业务异常.
 */

class pageException extends Exception {
    constructor(message) {
        super(message, 100, 400);
    }
}


module.exports = pageException;