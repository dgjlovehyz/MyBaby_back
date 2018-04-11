'use strict'

const
    $redis = require('redis'),
    //logger = require('../core/log4js_config').logger('redis'),
    async = require('async'),
    exec = require('child_process').exec,
    _ = require('underscore'),
    cache = require('memory-cache'),
    redisConfig = require('../../config/system-config').redis,
    redisKCMSConfig = require('../../config/system-config').redis_kcms,
    redisCouponConfig = require('../../config/system-config').redis_coupon

class redisClient {

    static getClient() {
        return redisClient.createClient(redisConfig)
    }

    static getKCMSClient() {
        return redisClient.createClient(redisKCMSConfig)
    }
    
    static getCouponClient() {
        return redisClient.createClient(redisCouponConfig)
    }

    static createClient(options) {
        let
            key = JSON.stringify(options),
            client = cache.get(key)

        if (client)
            return client

        client = $redis.createClient(options)
        cache.put(key, client)

        client.on("ready", () => {
            //logger.info(`redis ready.`);
            //console.log(`redis ready.`);
        })

        client.on("error", function (err) {
            //logger.error(`redis Error: ${err}`);
            //console.log(`redis Error: ${err}`);
        })

        client.on("end", function (err) {
            //logger.warn(`redis end: ${err}`);
            //console.log(`redis end: ${err}`);
        })

        return client
    }

    /**
     * 更新string类型redis缓存
     * nsp:命名空间，防止key冲突
     * expire:过期时间(秒),<=0，null等值等同永不过期
     */
    static setStringCache(redis, nsp, key, value, expire, callback) {
        if (expire && expire != '' && expire < 1)
            expire = 1;

        let keyName = (nsp ? nsp + ':' : '') + key;
        async.waterfall([
            cb => {
                redis.set(keyName, value, cb);
            },
            (result, cb) => {
                if (expire) {
                    redis.send_command('expire', [keyName, expire], cb);
                } else
                    cb(null, null);
            },
        ], (err, result) => callback(err, result));
    }

    /**
     * 获取string类型redis缓存
     * nsp:命名空间，防止key冲突
     */
    static getStringCache(redis, nsp, key, callback) {
        let keyName = (nsp ? nsp + ':' : '') + key;

        redis.get(keyName, callback);
    }

    /**
    * 更新list类型redis缓存
    * nsp:命名空间，防止key冲突
    * expire:过期时间(秒),<=0，null等值等同永不过期
    */
    static setListCache(redis, nsp, key, value, expire, callback) {
        if (expire && expire != '' && expire < 1)
            expire = 1;

        let keyName = (nsp ? nsp + ':' : '') + key;
        async.waterfall([
            cb => {
                redis.send_command('RPUSH', [keyName, value], cb);
                // redis.set(keyName, value, cb);
            },
            (result, cb) => {
                if (expire) {
                    redis.send_command('expire', [keyName, expire], cb);
                } else
                    cb(null, null);
            },
        ], (err, result) => callback(err, result));
    }

    /**
    * 获取list类型redis缓存
    * nsp:命名空间，防止key冲突
    */
    static getListCache(redis, nsp, key, callback) {
        let keyName = (nsp ? nsp + ':' : '') + key;
        redis.send_command('RPOP', [keyName], callback);
        // redis.get(keyName, callback);
    }

    /**
     * 更新过期时间
     */
    static updateExpire(redis, nsp, key, expire, callback) {
        if (expire && expire != '' && expire < 1)
            expire = 1;

        let keyName = (nsp ? nsp + ':' : '') + key;

        redis.send_command('expire', [keyName, expire], callback);
    }

    /**
     * 获取Hash类型redis缓存
     * nsp:命名空间，防止key冲突
     */
    static getHashCache(redis, nsp, key, callback) {
        let keyName = (nsp ? nsp + ':' : '') + key;

        redis.hgetall(keyName, callback);
    }

    static del(redis, keys, callback) {
        !_.isArray(keys) && (keys = [keys]);
        redis.send_command('del', keys, (err, result) => {
            //err && logger.error(err);
            err && console.log(err);
            callback && callback(err, result);
        });
    }

    static keyExist(redis, key, callback) {

        redis.send_command('keys', [key], (err, result) => {
            return callback(null, err ? false : (result && result.length > 0 ? true : false))
        });

    }

    static rpush(redis, key, val, callback) {
        redis.send_command('RPUSH', [key, val], (err, result) => {
            return callback(err, result)
        });
    }

    static lpop(redis, key, callback) {
        redis.send_command('LPOP', [key], (err, result) => {
            return callback(err, result)
        });
    }
}

module.exports = redisClient;