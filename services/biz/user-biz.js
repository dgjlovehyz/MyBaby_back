'use strict'

const _ = require("underscore"),
    dao = global.require("./framework/utils/dao"),
    baseDao = global.require("./services/data/base-dao"),
    userDao = global.require("./services/data/user-dao"),
    Promise = require("bluebird"),
    async = require('async'),
    businessException = global.require('./framework/exception/businessException');


class UserBiz {

    /**
     * 添加用户
     * @param {*} params 
     * @param {*} callback 
     */
    static save(params, callback) {

        // 用户信息
        var info = {};
        if (params.vip_nickname) info.vip_nickname = params.vip_nickname;
        if (params.vip_name) info.vip_name = params.vip_name;
        if (params.vip_face) info.vip_face = params.vip_face;
        if (params.vip_account) info.vip_account = params.vip_account;
        if (params.vip_mail) info.vip_mail = params.vip_mail;
        if (params.vip_mobile) info.vip_mobile = params.vip_mobile;
        if (params.vip_openid) info.vip_openid = params.vip_openid;
        if (params.vip_bind_type) info.vip_bind_type = params.vip_bind_type;

        return dao.manageConnection(null, (connection, __, next) => {
            async.waterfall([
                // 查询用户信息是否存在
                (cb) => {
                    var query = {
                        baseId: params.userId,
                        shopId: params.shopId
                    }
                    userDao.getById(connection, query, cb);
                },
                // 根据查询结果判断新增 or 修改
                (result, cb) => {
                    if (result.length > 0) {
                        var data = {
                            info: info,
                            baseId: params.userId,
                            shopId: params.shopId
                        }
                        userDao.update(connection, data, cb);
                    } else {
                        info.vip_base_id = params.userId;
                        info.vip_shop_id = params.shopId;
                        userDao.insert(connection, info, cb);
                    }
                }
            ], next);
        }).asCallback(callback);
    }

    static gethost(params, callback) {
        if (!params.shopId)
            return callback(new businessException("店铺id为空", -1))
        return dao.manageConnection(null, (connection, __, next) => {
            userDao.gethost(connection, params, (err, result) => {
                next(err, result);
            });
        }).asCallback(callback);
    }

    static updateAfterBindUserInfo(params, callback) {
        if (!params.oldId || !params.newId)
            return callback(new businessException("请求参数错误", -1))
        return dao.manageConnection(null, (connection, __, next) => {
            userDao.updateAfterBindUserInfo(connection, params, (err, result) => {
                next(err, result);
            });
        }).asCallback(callback);
    }
}

module.exports = UserBiz;