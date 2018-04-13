"use strict";

const _ = require("underscore"),
    // uuidV4 = require("uuid/v4"),
    dao = global.require("./framework/utils/dao"),
    redisDB = global.require("./framework/utils/redis-client"),
    businessException = global.require("./framework/exception/businessException"),
    sysconf = global.require("./config/system-config-env"),
    childrenDao = global.require("./services/data/children-dao"),
    userDao = global.require("./services/data/user-dao"),
    locker = global.require("./framework/utils/locker");

class childrenBiz {
    /**
     * 查询绑定的宝贝
     * @param {*} params 
     * @param {*} callback 
     */
    static queryBindChild(params, callback) {
        return dao.manageConnection(params, (connection, params, next) => {
            childrenDao.queryBindChild(connection, params)
                .then(result => {
                    if (!result)
                        return Promise.reject("获取绑定的宝贝失败")
                    return Promise.resolve(result)
                })
                .then(result => { next(null, result) })
                .catch(next)
        }).asCallback(callback)
    }

    /**
     * 新建宝贝信息并且绑定
     * @param {*} params 
     * @param {*} callback 
     */
    static createBaby(params, callback) {
        return dao.manageTransactionConnection(params, (connection, params, next) => {
            childrenDao.insertChild(connection, params)
                .then(id => {
                    if (!id)
                        return Promise.reject("新增宝贝失败")
                    return userDao.bindUser(connection, { user_id: params.user_id, child_id: id, user_relation: params.user_relation, child_relation: params.child_relation })
                })
                .then(data => { next(null, data) })
                .catch(next)
        }).asCallback(callback)
    }

}

module.exports = childrenBiz;
