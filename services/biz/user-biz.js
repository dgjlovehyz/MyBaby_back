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
     * 新用户关注
     * @param {*} params 
     * @param {*} callback 
     */
    static addNewUser(params, callback) {
        if (!params.FromUserName)
            callback("用户openId为空")

        return dao.manageTransactionConnection(params, (connection, params, next) => {
            userDao.getUser(connection, params)
                .then(userMain => {
                    if (userMain) {
                        //用户已存在
                        //更新用户的状态
                        return userDao.updateUser(connection, { FromUserName: params.FromUserName, isDelete: 0 })
                    } else {
                        //用户不存在，新增用户
                        return userDao.insertUser(connection, params)
                    }
                })
                .then(data => {
                    if (!data)
                        return Promise.reject("用户信息更新失败")
                    return Promise.resolve("欢迎关注MyBaby,我们是私人公众号，如果您关注错误，请退订谢谢！\n输入以下数字查询对应功能：\n100：查询绑定的宝贝\n101：新建宝贝档案\n102：绑定新的宝贝")
                })
                .then(result => { next(null, result) })
                .catch(next)
        }).asCallback(callback)
    }

    /**
     * 取消关注后更新用户信息
     * @param {*} params 
     * @param {*} callback 
     */
    static updateUser(params, callback) {
        if (!params.FromUserName)
            callback("用户openId为空")
        return dao.manageTransactionConnection(params, (connection, params, next) => {
            userDao.updateUser(connection, { FromUserName: params.FromUserName, isDelete: 1 })
                .then(data => {
                    if (!data)
                        return Promise.reject("用户信息更新失败")
                    return Promise.resolve("欢迎关注MyBaby,我们是私人公众号，如果您关注错误，请退订谢谢！\n输入以下数字查询对应功能：\n100：查询绑定的宝贝\n101：新建宝贝档案\n102：绑定新的宝贝")
                })
                .then(result => { next(null, result) })
                .catch(next)
        }).asCallback(callback)
    }
}

module.exports = UserBiz;