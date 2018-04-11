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
let _ = require('lodash');
let authBackCtrl = require('./auth-back-ctrl');
let authFrontCtrl = require('./auth-front-ctrl');
let authConstant = global.require("./services/constant/auth-type");

//本地化
moment.locale('zh-cn');
/**
 * 
 * 
 * @class AuthCtrl
 * 权限验证
 * 
 * 
 */
class AuthCtrl {

    static auth(req, res, next) {

        //没有配置验证
        if (!req.routerInfo || !req.routerInfo.auth)
            return next();
        if (req.routerInfo.auth === true)
            authBackCtrl.auth(req, res, next)
        if (req.routerInfo.auth == authConstant.get('STATUS_NON'))
            return next();
        if (req.routerInfo.auth == authConstant.get('STATUS_BACK'))
            authBackCtrl.auth(req, res, next)
        if (req.routerInfo.auth == authConstant.get('STATUS_FRONT')) {
            authFrontCtrl.auth(req, res, next)
        }
        if (req.routerInfo.auth == authConstant.get('STATUS_WX')) {
            
        }
        if (req.routerInfo.auth == authConstant.get('STATUS_BOTH')) {
            let token = req.header("Token");
            let session_sid = req.header("session_sid");
            if (token) {
                //前后端都可以使用，优先判断是否存在Token
                authBackCtrl.auth(req, res, next)
            } else if (session_sid) {
                authFrontCtrl.auth(req, res, next)
            } else {
                return next(new AuthError('访问未授权.'));
            }
        }

    }
}

module.exports = AuthCtrl;