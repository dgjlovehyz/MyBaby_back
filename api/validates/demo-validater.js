"use strict";
const DemoException = require("../../framework/exception/demoException");

class demoValidater {
    static listQuery(req, next) {
        let query = req.query,
            status = query.status,
            err;

        if (status != null) {
            err = !(/^\d+$/.test(status) && +status >= 0 && +status <= 2);
        }

        return err ? new DemoException("参数 status 非法") : null;
    }
}

module.exports = demoValidater;
