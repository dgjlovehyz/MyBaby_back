'use strict'

let
    userBiz = global.require("./services/biz/user-biz"),
    async = require('async');

/**
* 用户信息
*/
class UserCtrl {

    /**
     * 新增和同步用户信息
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    static save(req, res, next) {
        let params = req.body;
        params.userId = req.token.userId;
        params.shopId = req.token.kid;
        userBiz.save(params, (err, result) => {
            if (err) {
                return next(err);
            }
            res.json({ data: result });
        });
    }

    static gethost(req, res, next) {
        let params = {};
        params.shopId = req.token.kid;
        userBiz.gethost(params, (err, result) => {
            if (err) {
                return next(err);
            }
            res.json({ data: result });
        });
    }

    static updateAfterBindUserInfo(req, res, next) {
        let params = req.body;
        params.shopId = req.token.kid;
        userBiz.updateAfterBindUserInfo(params, (err, result) => {
            if (err) {
                return next(err);
            }
            res.json({ data: "success" });
        });
    }

}

module.exports = UserCtrl;
