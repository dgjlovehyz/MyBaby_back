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
let Promise = require("bluebird");
let _ = require('lodash');
//本地化
moment.locale('zh-cn');
/**
* 
* 
* @class AuthBackCtrl
*   后端登录权限验证
* 
* 
*/
class AuthBackCtrl {

    static auth(req, res, next) {

        //没有配置验证
        if (!req.routerInfo || !req.routerInfo.auth)
            return next();
        //console.log('后端Token验证');
        let token = req.header("Token");
        if (!token)
            return next(new AuthError('访问未授权.'));

        AuthBackCtrl.getTokenObj(token, (err, tokenObj) => {
            if (err)
                return next(new AuthError('访问未授权.'));

            // res更新过期时间用
            req.token = tokenObj;
            req.token.authType = 'back';
            // 逻辑代码用
            req.user = tokenObj;
            let session_sid_admin = req.header("session_sid_admin");
            let apiHost = req.header("logindomain");
            AuthBackCtrl.loginValidate(session_sid_admin, tokenObj.kid, apiHost, (err, result) => {
                if (err)
                    next(err)
                if (!tokenObj ||
                    !tokenObj.expireDate ||
                    !tokenObj.kid ||
                    validator.trim(tokenObj.mgr_account) === '' ||
                    new Date(tokenObj.expireDate) < new Date())
                    return next(new AuthError('访问未授权.'));
                else
                    return next();
            })
        })
    }

    static getTokenObj(token, callback) {
        let tokenObj = {},
            decryptError;

        //validator.trim(token.loginName);
        if (!token)
            return callback(new AuthError('访问未授权.'), null)

        try {
            let tobj = JSON.parse(Aes128Cbc.decrypt(sysconf.auth.aes128cbc_key, sysconf.auth.aes128cbc_iv, token));
            //转换token数据
            for (let t in tobj) {
                if (tobj.hasOwnProperty(t)) {
                    tokenObj[string.startToLowerCase(t)] = tobj[t];
                }
            }
        } catch (e) {
            decryptError = e;
        }

        return callback(decryptError, tokenObj)
    }

    static tokenGenerator(req, res) {

        let token = req.token;
        if (token) {
            let addToBody = token.addToBody
            if (addToBody && req.token.token)
                res.setHeader('Token', req.token.token);
            else
                res.setHeader('Token', AuthBackCtrl.tokenEncrypt(token));
        }
    }

    static tokenEncrypt(token) {
        token = _.defaults({
            expireDate: moment().add(sysconf.system.token_expire_time || 60, 'minutes').toDate().toLocaleString()
        }, token);
        return Aes128Cbc.encrypt(sysconf.auth.aes128cbc_key, sysconf.auth.aes128cbc_iv, JSON.stringify(token));
    }

    static getAuthInfo(req, res, next) {
        let kid = req.token.kid
        redis.getStringCache(redis.getClient(), "auth", kid, (err, result) => {
            if (err) return next(err)
            let obj = JSON.parse(result)
            //delete obj.session_sid_admin
            res.json({ data: obj })
        })
    }

    static kshopTokenValidate(req, res, next) {

        let obj = {}
        async.waterfall([
            (cb) => {
                request(req.query.url, (err, response, body) => {
                    if (err || response.statusCode != 200)
                        return cb(err || new AuthError("权限验证失败", 401))

                    try {
                        let info = JSON.parse(body);
                        if (info.status != 0)
                            return cb(new AuthError("权限验证失败:" + info.msg, 401))

                        obj.api_url = info.api_url
                        obj.kid = info.kid
                        obj.home_url = info.home_url
                        obj.login_url = info.login_url
                        obj.session_sid_admin = info.session_sid_admin
                        obj.session_sid_admin = info.session_sid_admin
                        obj.cdn = info.CDN_SITE_DOMAIN_URL
                        obj.site_temp_path = info.SITE_TEMP_PATH
                        if (info.session_datas) {
                            obj.SHOP_TGWEAPP_INSTALL = info.session_datas.SHOP_TGWEAPP_INSTALL
                            obj.SHOP_KJWEAPP_INSTALL = info.session_datas.SHOP_KJWEAPP_INSTALL
                            if (info.session_datas.login_user) {
                                obj.mgr_account = info.session_datas.login_user.mgr_account
                                obj.mgr_nickname = info.session_datas.login_user.mgr_nickname
                            }
                        }
                        return cb(null, null)
                    }
                    catch (e) {
                        cb(e)
                    }
                })
            },
            (result, cb) => {
                redis.setStringCache(redis.getClient(), "auth", obj.kid, JSON.stringify(obj), null, cb);
            }
        ], (err, result) => {
            if (err) return next(err)
            req.token = { kid: obj.kid, mgr_account: obj.mgr_account, cdn: obj.cdn, site_temp_path: obj.site_temp_path, api_url: obj.api_url }
            req.token.token = AuthBackCtrl.tokenEncrypt(req.token)
            req.token.addToBody = true
            obj.token = req.token.token
            //delete obj.session_sid_admin
            res.json({ data: obj })
        });
    }

    static loginValidate(session_sid_admin, kid, apiHost, callback) {
        if (!apiHost)
            return Promise.reject(new AuthError("登录信息丢失，请重新登录!", 401))
        var option = {
            url: apiHost + "/api_admin/user/logining.html?session_sid_admin=" + session_sid_admin,
            method: "GET",
        }
        console.log(option.url)
        return new Promise((apiResolve, apiReject) => {
            request.get(option, (err, response, body) => {
                if (response.statusCode != 200)
                    return apiReject(new BusinessException("登录信息异常", 400))
                var body = JSON.parse(body)
                if (body.status == 1)
                    return apiReject(new AuthError("登录超时，请重新登录", 401))
                return apiResolve()
            })
        }).asCallback(callback)
    }
}

module.exports = AuthBackCtrl;