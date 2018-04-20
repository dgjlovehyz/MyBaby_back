'use strict'

const mysql = require('mysql');

module.exports = {
    env: 'beta',

    system: {

        // 端口
        port: {
            api: 80,
            doc: 3011
        },

        // 是否开启调试模式
        debug: true,

        //是否忽略签名有效期验证
        token_expire_time: 2 * 60 * 60
    },
    // 验证配置
    auth: {
        // AES-128-cbc key
        aes128cbc_key: 'ilanhai~4`-*(#65',

        // AES-128-cbc iv
        aes128cbc_iv: 'ilanhai~4`-*(#65',
    },

    // 业务数据库
    db: mysql.createPool({
        host: '172.16.127.187',
        user: 'root',
        password: 'My*sql123',
        database: 'mybaby',
        multipleStatements: '',
        connectionLimit: 50,
        charset: 'utf8mb4'
    }),

    // 业务缓存服务
    redis: {
        host: '172.16.127.187',
        port: 6379,
        password: 'dgj123456',
        socket_keepalive: true,
        db: 0
    },


    // redis kem_id_generator.lua脚本sha1码，用于生产业务编号
    kem_id_generator_sha1: '97fa0c53d6686437a2db3ae0465e7f0b2c46f185',

    // redis kmsp_integral.lua脚本码
    redis_kmsp_integral: '5dfd4615ab9ab4fd0c651dc2f3fe741a9f34490e',

    // redis kmsp_lock.lua脚本码
    redis_kmsp_lock: '1bd0cf997de7f947d63f285101ff4346fe6575cc',

    // wxToken
    wxToken:'3F1CD7724400A6F9DE2BFE92441981B9',




    // active-mq
    mq: {
        api: 'http://192.168.1.221:8161/api/message/',
        url: '192.168.1.221',
        port: 61613,
        user: 'admin',
        password: 'admin',
        outgoing: 20000, // 心跳配置
        incoming: 0,
        delay: 2000, // 断线重连时间, 如果有则无线重连
        debug: true, // 是否开启调试, 打印每次接收的消息
        processEnable: true, // 分离
        list: [ // 队列文件名
            // { path: 'mq/queue/kshop-config', process: 'app' },
            // { path: 'mq/queue/kshop-goods', process: 'app' },
            // { path: 'mq/queue/kshop-order', process: 'app' },
            { path: 'mq/queue/kshop-payrespond', process: 'app-pay' }
            // { path: 'mq/queue/b2t-wx-msg', process: 'app' },
            // { path: 'mq/queue/b2t-group', process: 'app' }
        ]
    },
    // elasticsearch设置
    elasticsearch: {
        connection: {
            hosts: [
                "http://182.61.45.171:9200/"
            ],
            log: [{
                type: 'stdio',
                levels: ['error', 'warning']
            }],
            apiVersion: "5.3"
        },
        db: {
            index: "kmsp",
            type: "daq"
        },
        b2tGoods: {
            index: "kmsp",
            type: "b2t_goods"
        },
        goods_category: {
            index: "kmsp",
            type: "goods_category"
        }
    },
}