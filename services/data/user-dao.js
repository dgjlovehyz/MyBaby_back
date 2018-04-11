"use strict";
const Promise = require("bluebird"),
    baseDao = global.require('./services/data/base-dao'),
    _ = require("underscore");


class UserDao {

    // 根据baseId和shopId查询用户信息
    static getById(connection, query, callback) {
        let sql = () => `
            SELECT
                *
            FROM
                user_vip
            where vip_base_id = ? and vip_shop_id = ?
        `;
        return new Promise((resolve, reject) => {
            connection.query(sql(), [query.baseId, query.shopId], (err, result) => {
                return err ? reject(err) : resolve(result);
            });
        }).asCallback(callback);
    }

    // 添加用户信息
    static insert(connection, info, callback) {
        let sql = () => `
            INSERT user_vip SET ?, vip_created = UNIX_TIMESTAMP()
        `;
        return new Promise((resolve, reject) => {
            connection.query(sql(), [info], (err, result) => {
                if (err)
                    return reject(err);
                return resolve(result.affectedRows > 0 ? true : false)
            });
        }).asCallback(callback);
    }

    // 修改用户信息
    static update(connection, params, callback) {
        let sql = () => `
            UPDATE user_vip SET ?, vip_updated = UNIX_TIMESTAMP() WHERE vip_base_id = ? and vip_shop_id = ?
        `;
        return new Promise((resolve, reject) => {
            connection.query(sql(), [params.info, params.baseId, params.shopId], (err, result) => {
                if (err)
                    return reject(err);
                return resolve(result.affectedRows > 0 ? true : false)
            });
        }).asCallback(callback);
    }

    static gethost(connection, params, callback) {
        let sql = `select * from kmsp_shop_params where shop_id = ?;`,
            sqlParams = [];
        sqlParams.push(params.shopId);

        return new Promise((resolve, reject) => {
            connection.query(sql, sqlParams, (err, result) => {
                if (err)
                    return reject(err)
                return resolve(result[0])
            })
        }).asCallback(callback)
    }

    /**
     * 修改绑定后会员记录
     * @param {*} connection 
     * @param {*} query 
     * @param {*} callback 
     */
    static updateAfterBindUserInfo(connection, query, callback) {
        let sqlParams = [];
        const updateOrderInfoSql = () => `
            update order_info set order_vip_id = ? where order_vip_id = ?;`
            , updatememberInfoSql = () => `
            update market_b2t_member set vip_base_id = ? where vip_base_id = ?;`
            , insertLogSql = () => `
            INSERT INTO user_vip_bind_logs (bind_new_id,bind_old_id) VALUES (?, ?);`;
        sqlParams.push(query.newId);
        sqlParams.push(query.oldId);

        return new Promise((resolve, reject) => {
            baseDao.multiQuery(
                connection,
                [updateOrderInfoSql(), updatememberInfoSql(), insertLogSql()],
                [sqlParams, sqlParams, sqlParams],
                (err, result) => {
                    return err ? reject(err) : resolve(result);
                }
            );
        }).asCallback(callback);
    }


}

module.exports = UserDao;
