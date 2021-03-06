'use strict'
let wxPublicBiz = global.require("./services/biz/wx-public-biz");

class WXPublicCtrl {
    static getWxMsg(req, res, next) {
        let body = req.body;

        wxPublicBiz.getWxMsg(body, (err, result) => {
            if (err) {
                return next(err);
            }
            res.json(result);
        });
    }

    static wxAuth(req, res, next) {
        let query = req.query;
        wxPublicBiz.wxAuth(query, (err, result) => {
            if (err) {
                return next(err);
            }
            res.json(result);
        });
    }
}

module.exports = WXPublicCtrl;
