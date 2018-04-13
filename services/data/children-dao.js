"use strict";

const sysconf = global.require("./config/system-config"),
    Promise = require("bluebird"),
    _ = require("underscore");

/**
 * 前台用户数据模块
 *
 */

class childrenDao {
    static queryBindChild(connection, query, callback) {
        var pages = query.pagination,
            where = ["WHERE 1 = 1 AND um.is_delete = 0"],
            sqlParams = [];

        const sql = () => `
        SELECT
        um.open_id ,
        um.user_id ,
        ucr.user_relation ,
        ucr.child_relation ,
        cm.\`name\` ,
        cm.sex ,
        cm.birth_time
    FROM
        child_main cm
    LEFT JOIN user_child_relation ucr ON cm.child_id = ucr.child_id
    LEFT JOIN user_main um ON ucr.user_id = um.user_id
            ${where.join(" ")}`;

        //where
        if (query.FromUserName) {
            where.push(`AND um.open_id = '${query.FromUserName}'`);
        }

        return new Promise((resolve, reject) => {
            connection.query(
                sql(),
                sqlParams,
                (err, result) => {
                    return err ? reject(err) : resolve(result);
                }
            );
        }).asCallback(callback);
    }

    /**
     * 新建宝贝
     * @param {*} connection 
     * @param {*} params 
     * @param {*} callback 
     */
    static insertChild(connection, params, callback) {
        var sql = `INSERT INTO child_main(
            uuid ,
            \`name\` ,
            sex ,
            birth_time 
        )
        VALUES
        (?,?,?,?)`,
        sqlParams = [params.uuid, params.name, params.sex, params.birth_time]

        return new Promise((resolve, reject) => {
            connection.query(sql, sqlParams, (err, result) => {
                return err ? reject(err) : resolve(result.id)
            })
        })
    }
}

module.exports = childrenDao;
