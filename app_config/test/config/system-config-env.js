'use strict'

const mysql = require('mysql');

module.exports = {
    env: 'test',

    system: {

        // 端口
        port: {
            api: 3010,
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
        host: '192.168.1.13',
        user: 'root',
        password: '123456',
        database: 'kem_test',
        multipleStatements: 'true',
        connectionLimit: 50
    }),

    // 业务缓存服务
    redis: {
        host: '192.168.1.13',
        port: 6379,
        password: '',
        socket_keepalive: true,
        db: 0,
        charset:'utf8mb4'
    },
    // redis kem_id_generator.lua脚本sha1码，用于生产业务编号
    kem_id_generator_sha1: '9cae911156d46e371ccf571feb7e3ab47a2a842d',
    
    // 商城
    goods: {
        api: {
            goodsInfo: '/service/goods_base/view.html',
            orderDetail: '/service/order/details.html',
            orderStatistics: '/service/user_vip/stat_order.html'
        },
        headers: {
            'client_type': 'tgweapp',
            'client_version': '2.5'
        }
    }
}