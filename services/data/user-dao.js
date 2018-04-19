"use strict";
const Promise = require("bluebird"),
    baseDao = global.require('./services/data/base-dao'),
    _ = require("underscore");


class UserDao {


    /**
      * 查询用户
      * 
      * @param {*} connection 
      * @param {*} query 
      * @param {*} callback 
      */
    static getUser(connection, query, callback) {
        var pages = query.pagination,
            where = ["WHERE 1 = 1"],
            limit = "LIMIT ",
            sqlParams = [];

        const sql = () => `

            SELECT * FROM user_main

            ${where.join(" ")}`;

        //where
        if (query.FromUserName) {
            where.push(`AND \`open_id\` = '${query.FromUserName}'`);
        }
        if (query.isDelete) {
            where.push(`AND \`is_delete\` = '${query.isDelete}'`);
        }
        return new Promise((resolve, reject) => {
            connection.query(
                sql(),
                sqlParams,
                (err, result) => {
                    return err ? reject(err) : resolve(result[0]);
                }
            );
        }).asCallback(callback);
    }

    /**
     * 保存用户信息
     * 
     * @param {*} connection 
     * @param {*} params 
     * @param {*} callback 
     */
    static insertUser(connection, params, callback) {
        var sql = `INSERT INTO user_main(open_id , status , is_delete)
        VALUES
            (? , ? , ?); `,
            sqlParams = [params.FromUserName, 0, 0]

        return new Promise((resolve, reject) => {
            connection.query(sql, sqlParams, (err, result) => {
                return err ? reject(err) : resolve(result.insertId)
            })
        }).asCallback(callback)

    }

    /**
     *  更新用户是否删除
     * @param {*} connection 
     * @param {*} params 
     * @param {*} callback 
     */
    static updateUser(connection, params, callback) {
        var sql = `update user_main set is_delete = ? where open_id = ?`,
            sqlParams = [params.isDelete, params.FromUserName]

        return new Promise((resolve, reject) => {
            connection.query(sql, sqlParams, (err, result) => {
                return err ? reject(err) : resolve(result.affectedRows > 0 ? true : false)
            })
        }).asCallback(callback)
    }

    /**
     * 绑定宝贝
     * @param {*} connection 
     * @param {*} params 
     * @param {*} callback 
     */
    static bindUser(connection, params, callback) {
        var sql = `INSERT INTO user_child_relation(
            user_id ,
            child_id ,
            user_relation ,
            child_relation
        )
        VALUES
            (?,?,?,?);`,
            sqlParams = [params.user_id, params.child_id, params.user_relation, params.child_relation]

        return new Promise((resolve, reject) => {
            connection.query(sql, sqlParams, (err, result) => {
                return err ? reject(err) : resolve(result.affectedRows > 0 ? true : false)
            })
        }).asCallback(callback)
    }

}

module.exports = UserDao;
