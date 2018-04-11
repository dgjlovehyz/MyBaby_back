'use strict'
let wxPublicBiz = global.require("./services/biz/wx-public-biz");

class WXPublicCtrl {
    static getWxMsg(req, res, next) {
        let query = req.query;

        query.pagination = req.pagination;

        wxPublicBiz.getWxMsg(query, (err, result) => {
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
