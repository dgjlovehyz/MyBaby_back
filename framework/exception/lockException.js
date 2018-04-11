"use strict";

const Exception = require("./exception");

/**
 * Class redis lock exception
 */

class LockException extends Exception {
    constructor(message, code) {
        super(message, code, 400);
    }
}

module.exports = LockException;
