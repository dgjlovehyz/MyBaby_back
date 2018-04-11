'use strict'

let moment = require("moment");
let async = require("async");
let validator = require('validator');
let AuthError = global.require('./framework/exception/authException');
let BusinessException = global.require('./framework/exception/businessException');
let Aes128Cbc = global.require('./framework/utils/aes-128-cbc');
let sysconf = global.require('./config/system-config');
let string = global.require('./framework/utils/stringHelper.js');
let redis = global.require('./framework/utils/redis-client.js');
let request = require("request");
let UUID = require('uuid');
let _ = require('lodash');


/**
 * 
 * 
 * @class AuthFrontCtrl
 * 前端权限验证
 * 
 * 
 */
class AuthFrontCtrl {
    static auth(req, res, next) {

        //没有配置验证
        if (!req.routerInfo || !req.routerInfo.auth)
            return next();
        // redis 中获取access_token，如果不存在，从微信重新获取
        redis.getStringCache(redis.getClient(), "myBaby", "wxToken", (err, data) => {
            if (data) {
                req.access_token = data
                return next()
            }
            AuthFrontCtrl.getSessionSidObj(session_sid, api_host, (err, tokenObj) => {
                if (err)
                    return next(new AuthError(err.message));
                req.access_token = tokenObj.access_token;

                redis.setStringCache(redis.getClient(), "myBaby", "wxToken", tokenObj.access_token, tokenObj.expires_in)
                //console.log(sessionObj)
                return next();
            })
        })

    }

    static getSessionSidObj(session_sid, api_host, callback) {
        var options = {
            url: "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx3312ee6adf47851c&secret=379c35a65990a495ad44cd4bca8b83cd",
            json: true,
            method: 'GET'
        }
        let obj = {},
            decryptError;
        async.waterfall([
            (cb) => {
                request(options, (err, response, data) => {
                    if (err || response.statusCode != 200)
                        return cb(err || new AuthError("权限验证失败", 401))
                    try {
                        let info = response.body;
                        // let info = JSON.parse(body);
                        console.log("info:", info)
                        if (info.errcode)
                            return cb(new AuthError("权限验证失败:" + info.errmsg, 401))
                        obj.access_token = info.access_token
                        obj.expires_in = info.expires_in
                    } catch (e) {
                        decryptError = e;
                    }
                    return cb(decryptError, null)
                })
            }
        ], (err, result) => {
            if (err) return callback(err)
            // req.session_sid = { userId: obj.userId, msg: obj.msg }
            callback(decryptError, obj);
        });
    }
}


module.exports = AuthFrontCtrl;