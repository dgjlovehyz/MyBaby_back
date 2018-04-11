"use strict";

const _ = require("underscore"),
    // uuidV4 = require("uuid/v4"),
    dao = global.require("./framework/utils/dao"),
    redisDB = global.require("./framework/utils/redis-client"),
    businessException = global.require("./framework/exception/businessException"),
    sysconf = global.require("./config/system-config-env"),
    crypto = require('crypto'),
    Promise = require("bluebird");

class demoBiz {
    /**
     *
     * @param {*} params
     * @param {*} callback
     */
    static getWxMsg(params, callback) {
        return new Promise((resolve, reject) => {
            dao.manageConnection(params, demoDAO.getList, (err, result) => {
                return err ? reject(err) : resolve(result);
            });
        }).asCallback(callback);
    }

    /**
     *
     * @param {*} params
     * @param {*} callback
     */
    static wxAuth(params, callback) {
        if (!params.signature)
            return callback(new businessException("签名错误"))
        if (!params.timestamp)
            return callback(new businessException("时间戳错误"))
        if (!params.nonce)
            return callback(new businessException("随机数错误"))

        let dict = { token: sysconf.wxToken, timestamp: params.timestamp, nonce: params.nonce };
        var sha1Str = '';
        for (let key of Object.keys(dict).sort()) {
            console.log('key：' + key)
            console.log('value：' + dict[key])
            sha1Str = sha1Str + dict[key]
        }
        var sha1 = crypto.createHash("sha1");
        sha1.update(sha1Str)
        console.log("sha1Str:" + sha1Str)
        console.log("timestamp:" + params.timestamp)
        console.log("nonce" + params.nonce)
        var _signature = sha1.digest('hex')
        console.log("signature:" + params.signature)
        console.log("_signature:" + _signature)
        if (_signature == params.signature)
            return callback(null, params.echostr)
        callback("签名验证失败")
    }
}

module.exports = demoBiz;
