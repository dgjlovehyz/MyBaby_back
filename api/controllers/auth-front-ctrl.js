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
        //console.log('前端session_sid验证');
        let session_sid = req.header("session_sid");
        let shop_id = req.header('shop_id');
        let api_host = req.header('api_shop_host');
        if (!session_sid)
            return next(new AuthError('访问未授权.'));

        AuthFrontCtrl.getSessionSidObj(session_sid, api_host, (err, sessionObj) => {
            if (err)
                return next(new AuthError(err.message));
            if (!sessionObj ||
                !sessionObj.userId)
                return next(new AuthError('访问未授权.'));
            let token = { userId: sessionObj.userId, kid: shop_id, authType: 'front', cdn: sessionObj.cdn, site_temp_path: sessionObj.site_temp_path, api_url: api_host, session_sid: session_sid }
            req.token = token;

            //console.log(sessionObj)
            return next();
        })
    }

    static getSessionSidObj(session_sid, api_host, callback) {
        var options = {
            url: api_host + '/service/weixin/user_base_info.html',
            json: true,
            method: 'GET',
            headers: {
                //'Content-Type':'application/x-www-form-urlencoded',
                'client_type': 'tgweapp',
                'session_sid': session_sid
            },
            forever: true, pool: { maxSockets: 1024 }
        }
        let obj = {},
            decryptError;
        async.waterfall([
            (cb) => {
                let id = UUID.v1()
                console.time(id + "auth")
                request(options, (err, response, data) => {
                    console.timeEnd(id + "auth")
                    if (err || response.statusCode != 200)
                        return cb(err || new AuthError("权限验证失败", 401))
                    try {
                        let info = response.body;
                        // let info = JSON.parse(body);
                        console.log("info:", info)
                        if (info.status != 0)
                            return cb(new AuthError("权限验证失败:" + info.msg, 401))
                        obj.userId = info.login_user_id;
                        obj.session_sid = info.session_sid;
                        obj.cdn = info.CDN_SITE_DOMAIN_URL
                        obj.site_temp_path = info.SITE_TEMP_PATH
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