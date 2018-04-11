"use strict";

const sysconf = global.require("./config/system-config"),
    Promise = require("bluebird"),
    _ = require("underscore");

/**
 * 前台用户数据模块
 *
 */

class demoDao {
    static getList(connection, query, callback) {
        var pages = query.pagination,
            where = ["WHERE 1 = 1 AND isDelete = 0"],
            limit = "LIMIT ",
            sqlParams = [];

        const sql = () => `
            SELECT count(*) AS total FROM demo

            ${where.join(" ")};

            SELECT id, message, \`status\` FROM demo

            ${where.join(" ")}

            ${limit};`;

        //where
        if (query.status) {
            where.push(`AND \`status\` = ${query.status}`);
        }

        //limit
        limit += `${(pages.pageIndex - 1) * pages.pageSize}, ${pages.pageSize}`;

        return new Promise((resolve, reject) => {
            connection.query(
                sql(),
                [].concat(sqlParams, sqlParams),
                (err, result) => {
                    let data = {
                        total: result[0][0]["total"],
                        data: result[1]
                    };
                    return err ? reject(err) : resolve(data);
                }
            );
        }).asCallback(callback);
    }
}

module.exports = demoDao;
