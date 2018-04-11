"use strict";

const Exception = require("./exception");

/**
 *  数据库异常
 */

class sqlException extends Exception {
    constructor(message, code) {
        super(message, code, 400);
    }
}


module.exports = sqlException;