'use strict'

const mysql = require('mysql');

module.exports = {
    env: 'dev',

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
        host: '192.168.1.125',
        user: 'root',
        password: '123456',
        database: 'kmsp_dev',
        multipleStatements: 'true',
        connectionLimit: 50,
        charset: 'utf8mb4'
    }),

    // 业务缓存服务
    redis: {
        host: '192.168.1.228',
        port: 6379,
        password: '',
        socket_keepalive: true,
        db: 1
    },
    // kcms业务缓存服务
    redis_kcms: {
        host: '192.168.1.125',
        port: 6100,
        password: '123456',
        socket_keepalive: true,
        db: 10
    },

    // kmsp 优惠券业务缓存服务
    redis_coupon: {
        host: '192.168.1.125',
        port: 6100,
        password: '123456',
        socket_keepalive: true,
        db: 11
    },

    // redis kem_id_generator.lua脚本sha1码，用于生产业务编号
    kem_id_generator_sha1: 'f1c8c21a5ecfad60665f291492a99cba9a5bfb99',
    // redis kmsp_lock.lua脚本码
    redis_kmsp_lock: '1bd0cf997de7f947d63f285101ff4346fe6575cc',

    // redis kmsp_integral.lua脚本码
    redis_kmsp_integral: '5dfd4615ab9ab4fd0c651dc2f3fe741a9f34490e',

    // 商城
    goods: {
        api: {
            goodsInfo: '/service/goods_base/view.html',
            orderDetail: '/service/order/details.html',
            orderStatistics: '/service/user_vip/stat_order.html',
            historyList: '/service/user_vip/history_goods_list.html',
            collectList: '/service/User_collect_goods/list.html',
        },
        host: '211502772.markapp.com',
        headers: {
            'client_type': 'tgweapp',
            'client_version': '2.5'
        }
    },

    // 商城接口key
    shop: {
        key: 'ewfsdklgh04lgfio956lhyu967laji57'
    },

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
            { path: 'mq/queue/kshop-config', process: 'app' },
            { path: 'mq/queue/kshop-goods', process: 'app' },
            { path: 'mq/queue/kshop-order', process: 'app' },
            { path: 'mq/queue/kshop-payrespond', process: 'app-pay' },
            { path: 'mq/queue/b2t-wx-msg', process: 'app' },
            { path: 'mq/queue/b2t-group', process: 'app' }
        ]
    },
    // elasticsearch设置
    elasticsearch: {
        connection: {
            hosts: [
                "http://192.168.1.221:9200/"
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
    }
}