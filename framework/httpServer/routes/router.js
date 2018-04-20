"use strict";

const express = require("express"),
    onHeaders = require("on-headers"),
    onFinished = require("on-finished"),
    async = require("async"),
    conf_sys = global.require("./config/system-config"),
    redisDB = global.require("./framework/utils/redis-client"),
    authException = global.require("./framework/exception/authException"),
    BusinessException = require("../../../framework/exception/businessException"),
    ERROR_CODE = global.require("./services/constant/error-code"),
    authCtrl = global.require("./api/controllers/auth-ctrl"),
    xml2json = require('xml2json'),
    xml2js = require('xml2js'),
    authBackCtrl = global.require("./api/controllers/auth-back-ctrl");

/**
 *
 *
 * @module API路由
 *
 */
module.exports = class {
    constructor() {
        this.router = express.Router();
    }

    get(path, option) {
        this.pipe("get", path, option);
    }

    post(path, option) {
        this.pipe("post", path, option);
    }

    put(path, option) {
        this.pipe("put", path, option);
    }

    delete(path, option) {
        this.pipe("delete", path, option);
    }

    /**
     *
     *
     * @param {any} httpMethod
     * @param {any} path 资源路径
     * @param {any} option 路由选项
     * option.name 控制器名称
     * option.auth 是否验证登陆，实参不传默认为验证
     *
     */
    pipe(httpMethod, path, option) {
        let funs = [
            this.listener,
            (req, res, next) => {
                var xml = '';
                if (httpMethod == 'post' && path == '/wx/msg') {
                    req.setEncoding('utf8');
                    req.on('data', function (chunk) {
                        xml += chunk;
                    });
                    req.on('end', function () {
                        xml2js.parseString(xml, { explicitArray: false }, function (err, result) {
                            var data = result.xml;
                            req.body = data
                            next()
                        })
                    });
                } else {
                    next()
                }
            }
            ,
            (req, res, next) => {
                option.path = path;
                // (option.auth === void 0 || option.auth === null) &&
                //     (option.auth = true);
                // request附加option
                req.routerInfo = option;
                console.log("auth:" + httpMethod + " " + path)
                // 权限验证 暂时不需要
                authCtrl.auth(req, res, next);
            },
            // 格式验证
            (req, res, next) => {
                console.log("validater:" + httpMethod + " " + path)
                if (!!option.validater) {
                    next(option.validater(req));
                } else {
                    next();
                }
            },
            // 统一处理分页和json数据
            (req, res, next) => {
                console.log("page:" + httpMethod + " " + path)
                var index = 1,
                    size = 50,
                    qs = ((req.query.pageIndex != void 0 && req.query.pageIndex != null) ? req.query : req.body) || {
                        pageIndex: index,
                        pageSize: size
                    };
                req.pagination = {
                    pageIndex: parseInt(qs.pageIndex || index),
                    pageSize: parseInt(qs.pageSize || size)
                };

                var _json = res.json.bind(res);
                res.json = function json(obj) {
                    if (path == "/wx/msg") {
                        if ( httpMethod == 'post') {
                            console.log("json:" + httpMethod + " " + path + JSON.stringify(obj))
                            return  _json(obj)
                        }
                        console.log("json:" + httpMethod + " " + path + JSON.stringify(obj))
                        res.writeHead(200, {'Content-Type': 'text/plain'})
                        return res.end(obj)
                        // return res.send(obj)
                    }
                    var val = obj,
                        status;
                    // allow status / body
                    if (arguments.length === 2) {
                        // res.json(body, status) backwards compat
                        if (typeof arguments[1] === "number") {
                            status = arguments[1];
                        } else {
                            status = arguments[0];
                            val = arguments[1];
                        }
                    }

                    if (
                        typeof val.status !== "number" &&
                        typeof val.code !== "number"
                    ) {
                        var ret = {
                            status: 0,
                            data: val.data || ""
                        };

                        if (!!val.hasOwnProperty("total")) {
                            var total = parseInt(val.total) || 0,
                                count = 0,
                                paging = (ret.pagination = req.pagination);
                            ret.pagination.total = val.total;
                            count = parseInt(total / paging.pageSize);
                            ret.pagination.pageCount =
                                total % paging.pageSize > 0 ? count + 1 : count;
                        }
                        val = ret;
                    }
                    console.log("json:" + httpMethod + " " + path)
                    if (!!status) {
                        return _json(val, status);
                    }

                    _json(val);
                };

                console.log("api:" + httpMethod + " " + path)
                return next();
            }
        ];
        let procs = Array.isArray(option.processor)
            ? option.processor
            : [option.processor];

        funs = funs.concat(procs);
        this.router[httpMethod](path, funs);
    }

    listener(req, res, next) {
        // Execute a listener when a response is about to write headers.
        onHeaders(res, () => {
            authBackCtrl.tokenGenerator(req, res);
        });

        // Execute a callback when a HTTP request closes, finishes, or errors.
        onFinished(res, () => {
            //console.log('onFinished');
        });

        next();
    }
};
