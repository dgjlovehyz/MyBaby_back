'use strict'

let async = require("async");
let sysconf = require('../../config/system-config');
let db = sysconf.db;
let Promise = require('bluebird');
let _ = require('lodash');
let argumentsParse = (inputArgs) => {
    var args = new Array(inputArgs.length),
        len = args.length,
        params = [],
        idx = 0;
    for (; idx < len; idx++) {
        args[idx] = inputArgs[idx];
    }
    // 如果未传递任何参数，则抛出参数错误
    if (len <= 0) {
        return new Error('arguments error.');
    }
    let lastArg_1 = args[len - 1], // 倒数第一个参数
        lastArg_2 = args[len - 2], // 倒数第二个参数
        firstIsFun = _.isFunction(lastArg_1),
        secondIsFun = _.isFunction(lastArg_2);
    let fn = null, callback = null;
    // 如果最后两个参数都不是函数，则抛出参数错误
    if (!firstIsFun && !secondIsFun) {
        return new Error('arguments error.');
    }
    if (len === 1) {
        // 如果参数只有一个且类型为函数，则fn等于此函数
        fn = lastArg_1;
    } else if (len >= 2) {
        // 如果倒数第二个参数为函数，则为fn等于此函数
        if (!!secondIsFun) {
            fn = lastArg_2;

            // 如果最后一个参数也是函数，则callback等于此函数
            if (!!firstIsFun) {
                callback = lastArg_1;
            }
            // 其他为参数值
            params = args.slice(0, len - 2);
        } else {
            // 如果倒数第二参数不是函数，最后一个参数是函数，则为fn等于最后一个参数，callback为null
            fn = lastArg_1;
            // 其他为参数值
            params = args.slice(0, len - 1);
        }
    }
    return {
        params: params,
        fn: fn,
        callback: callback
    };
}

function manageTransactionConnection(obj, fn, callback) {
    let args = argumentsParse(arguments),
        params = args.params;
    fn = args.fn;
    callback = args.callback;
    return new Promise((resolve, reject) => {
        db.getConnection((err, connection) => {
            if (err) return reject(err);
            var closeAutoCommit=(err,result)=>{
                    connection.query('SET autocommit=1;',(commitErr,ret)=>{
                        if(!!commitErr){
                            console.log(commitErr);
                        }
                        connection.release();
                        if(!!err){
                            return reject(err);
                        }
                        resolve(result);
                    });
                };

            connection.query('SET autocommit=0;', (err, ret) => {
                if (!!err) {
                   return closeAutoCommit(err);
                }
                connection.beginTransaction((err) => {
                    if (err) {
                        return closeAutoCommit(err);
                    }
                    let argArray = [connection].concat(params);
                    argArray.push((err, result) => {
                        if (err) {
                            return connection.rollback(() => {
                                return closeAutoCommit(err);
                            });
                        }
                        connection.commit((err) => {
                            if (err) {
                                return connection.rollback(() => {
                                    return closeAutoCommit(err);
                                });
                            }

                            return closeAutoCommit(null,result);
                        });
                    });
                    fn.apply(this, argArray);
                });

            });
        });
    }).asCallback(callback);

}

function manageConnection(obj, fn, callback) {
    let args = argumentsParse(arguments),
        params = args.params;
    fn = args.fn;
    callback = args.callback;
    return new Promise((resolve, reject) => {
        db.getConnection((err, connection) => {
            if (err) return reject(err);
            let argArray = [connection].concat(params);
            argArray.push((err, result) => {
                connection.release();
                return !!err ? reject(err) : resolve(result);
            });
            fn.apply(this, argArray);
        });
    }).asCallback(callback);

}

class dao {
    /**
     * 
     * 创建一个支持事务的dbConnection。回调函数fn的最后一个参数是操作db的事务控制，必须调用执行。
     * 如：new dao().manageTransactionConnection(params, (connection, params, next) => {  // next 回调方法必须执行
     *       industryDao.isExists(connection, params)
     *           .then((ret) => {
     *              // 具体的业务逻辑处理。业务支持成功后必须执行next回调函数
     *              return next(null, '修改成功！')})
     *           .catch(next);
     *   });
     * @param {any} obj db查询的参数
     * @param {Function} fn 创建db连接后立即执行的回调函数。此函数第一个参数是dbConnection；最后一个参数是执行db操作后的回调函数，必须要执行此函数。中间的参数同obj参数
     * @param {Function} callback db查询结束后的回调函数 
     */
    manageTransactionConnection(obj, fn, callback) {
        return dao.manageTransactionConnection(obj, fn, callback);
    }
    /**
     * 
     * 创建一个dbConnection。回调函数fn的最后一个参数是操作db的事务控制，必须调用执行。
     * 如：new dao().manageConnection(params, (connection, params, next) => {  // next 回调方法必须执行
     *       industryDao.isExists(connection, params)
     *           .then((ret) => {
     *              // 具体的业务逻辑处理。业务支持成功后必须执行next回调函数
     *              return next(null, '修改成功！')})
     *           .catch(next);
     *   });
     * @param {any} obj db查询的参数
     * @param {Function} fn 创建db连接后立即执行的回调函数。此函数第一个参数是dbConnection；最后一个参数是执行db操作后的回调函数，必须要执行此函数。中间的参数同obj参数
     * @param {Function} callback db查询结束后的回调函数 
     */
    manageConnection(obj, fn, callback) {
        return dao.manageConnection(obj, fn, callback);
    }
    /**
     * 
     * 创建一个支持事务的dbConnection。回调函数fn的最后一个参数是操作db的事务控制，必须调用执行。
     * 如： dao.manageTransactionConnection(params, (connection, params, next) => {  // next 回调方法必须执行
     *       industryDao.isExists(connection, params)
     *           .then((ret) => {
     *              // 具体的业务逻辑处理。业务支持成功后必须执行next回调函数
     *              return next(null, '修改成功！')})
     *           .catch(next);
     *   });
     * @param {any} obj db查询的参数
     * @param {Function} fn 创建db连接后立即执行的回调函数。此函数第一个参数是dbConnection；最后一个参数是执行db操作后的回调函数，必须要执行此函数。中间的参数同obj参数
     * @param {Function} callback db查询结束后的回调函数 
     */
    static manageTransactionConnection(obj, fn, callback) {
        return manageTransactionConnection(obj, fn, callback);
    }

    /**
     * 
     * 创建一个dbConnection。回调函数fn的最后一个参数是操作db的事务控制，必须调用执行。
     * 如：dao.manageConnection(params, (connection, params, next) => {  // next 回调方法必须执行
     *       industryDao.isExists(connection, params)
     *           .then((ret) => {
     *              // 具体的业务逻辑处理。业务支持成功后必须执行next回调函数
     *              return next(null, '修改成功！')})
     *           .catch(next);
     *   });
     * @param {any} obj db查询的参数
     * @param {Function} fn 创建db连接后立即执行的回调函数。此函数第一个参数是dbConnection；最后一个参数是执行db操作后的回调函数，必须要执行此函数。中间的参数同obj参数
     * @param {Function} callback db查询结束后的回调函数 
     */
    static manageConnection(obj, fn, callback) {
        return manageConnection(obj, fn, callback);
    }

    static getOne(connection, condition, fn, callback) {
        let criteria = {
            pageInfo: { pageSize: 1, pageIndex: 1 },
            condition: condition
        };
        fn(connection, criteria, (err, result) => {
            let obj = null;
            if (result && result.data && result.data.length > 0)
                obj = result.data[0];

            return callback(null, obj);
        });
    }

    static batch(connection, list, fn, callback) {
        async.waterfall([
            cb => {
                async.each(list,
                    (obj, _cb) => {
                        fn(connection, obj, _cb);
                    },
                    (err, results) => {
                        if (err) return cb(err);
                        cb(null, results);
                    });
            }],
            (err, result) => {
                callback(err, list)
            })
    }

}

module.exports = dao;