"use strict";

const _ = require("underscore"),
    // uuidV4 = require("uuid/v4"),
    dao = global.require("./framework/utils/dao"),
    redisDB = global.require("./framework/utils/redis-client"),
    DemoException = global.require("./framework/exception/demoException"),
    demoConstant = global.require("./services/constant/demo-status"),
    demoDAO = global.require("./services/data/demo-dao"),
    sys_conf = global.require("./config/system-config"),
    locker = global.require("./framework/utils/locker"),
    Promise = require("bluebird");

class demoBiz {
    /**
     *
     * @param {*} params
     * @param {*} callback
     */
    static getDemoList(params, callback) {
        return new Promise((resolve, reject) => {
            dao.manageConnection(params, demoDAO.getList, (err, result) => {
                return err ? reject(err) : resolve(result);
            });
        }).asCallback(callback);
    }
}

module.exports = demoBiz;
