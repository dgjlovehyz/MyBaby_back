"use strict";
const sysconf = global.require("./config/system-config"),
    Promise = require("bluebird"),
    str = global.require("./framework/utils/stringHelper"),
    _ = require("underscore"),
    SqlException = global.require('./framework/exception/sqlException'),
    async = require('async');

class BaseDao {
    /**
    * 获取商城配置信息
    */
    static getShopParams(connection, query, callback) {
        var params = [], where = [];
        let sql = () => `SELECT * FROM kmsp_shop_params WHERE ${where.join(' and ')}`;

        if (query.shopId) {
            where.push(' shop_id = ? ');
            params.push(query.shopId);
        }
        return new Promise((resolve, reject) => {
            connection.query(sql(), params, (err, result) => {
                return err ? reject(err) : resolve(result);
            });
        }).asCallback(callback);
    }

    /**
     * 多sql执行
     * @param {*} connection 
     * @param {*} sqlArr sql字符串数组 ['','']
     * @param {*} paramsArr 参数数组 [[],[]]
     * @param {*} callback 
     */
    static multiQuery(connection, sqlArr, paramsArr, callback) {
        if (sqlArr.length != paramsArr.length)
            return callback(new SqlException('sql语句与参数数量不匹配'));
        var result = [];
        async.forEachOf(sqlArr, (sql, i, next) => {
            connection.query(sql, paramsArr[i], (err, r) => {
                result[i] = r;
                next(err);
            });
        }, (err) => {
            callback(err, result);
        });
    };
}

module.exports = BaseDao;
