'use strict'

const
    _ = require('underscore'),
    redisDB = global.require('./framework/utils/redis-client'),
    activeMqUtil = global.require('./services/util/active-mq-util'),
    envconf = global.require('./config/system-config-env'),
    lockException = global.require('./framework/exception/lockException'),
    redlock = new require('redlock');

let locker = new redlock([redisDB.getClient()], {
    // the expected clock drift; for more details
    // see http://redis.io/topics/distlock
    driftFactor: 0.01, // time in ms

    // the max number of times Redlock will attempt
    // to lock a resource before erroring
    retryCount: 0,

    // the time in ms between attempts
    retryDelay: 400, // time in ms

    // the max time in ms randomly added to retries
    // to improve performance under high contention
    // see https://www.awsarchitectureblog.com/2015/03/backoff.html
    retryJitter: 400 // time in ms
});

locker.on('clientError', function (err) {
    console.error('A redis error has occurred:', err);
});

class lockClient {
    /**
     * 加锁的方式执行业务
     * @param {string} lockOpts 传递锁的key值，也可以传递对象来自定义过期时间 { key: 'key', ttl: 1000 }
     * @param {object} fnOpts 业务对象{ args: [], fn: function }
     * @param {function} callback 回调函数
     */
    static lock(lockOpts, fnOpts, callback) {
        let key = 'redlock:', ttl = 10000;
        if (_.isString(lockOpts)) {
            key = key + lockOpts;
        } else {
            key = key + lockOpts.key;
            ttl = (!_.isNull(lockOpts.ttl)) ? lockOpts.ttl : ttl;
        }

        locker.lock(key, ttl, (err, lock) => {
            if (err) return callback('重复的操作');

            if (!_.isArray(fnOpts.args)) fnOpts.args = [fnOpts.args];
            fnOpts.fn.apply(null, fnOpts.args.concat([(err, result) => {
                lock.unlock((err) => {
                    //err && console.log(err)
                });
                callback(err, result);
            }]));
        });
    }
    /**
    * 加锁的方式执行业务
    * @param {string} lockOpts 传递锁的key值，也可以传递对象来自定义过期时间 { key: 'key', ttl: 1000 }
    * @param {object} fnOpts 业务对象{ args: [], fn: function }
    * @param {object} mqobj mq对象
    * @param {string} mqname mq名称
    * @param {object} message mq消息
    * @param {function} ack ack方法
    * @param {function} callback 回调函数
    */
    static lockRedis(lockOpts, fnOpts, mqobj, mqname, message, ack, callback) {
        let key = 'redlock:', ttl = 2;
        if (_.isString(lockOpts)) {
            key = key + lockOpts;
        } else {
            key = key + lockOpts.key;
            ttl = (!_.isNull(lockOpts.ttl)) ? lockOpts.ttl : ttl;
        }
        let client = redisDB.getClient();
        client.send_command('EVALSHA', [envconf.redis_kmsp_lock, 0, key, ttl], (err, result) => {
            if (err) {
                console.log(err);
                //将队列消费并重新放回队列
                ack(message);
                activeMqUtil.send(mqname, mqobj, 30000, () => { });
            }

            //验证是否包含锁 返回1时 redis 新生成锁
            if (result == 1) {
                fnOpts.fn.apply(null, fnOpts.args.concat([(err, result) => {
                    redisDB.del(client, "kmsp_lock:" + key, (err, result) => {
                        callback(err, result);
                    });
                }]));
            } else if (result == 0) {//返回0时 已包含锁   
                //将队列消费并重新放回队列
                ack(message);
                activeMqUtil.send(mqname, mqobj, 150, () => { });
            };
        })
    }

    /**
    * 加锁的方式执行业务
    * @param {string} lockOpts 传递锁的key值，也可以传递对象来自定义过期时间 { key: 'key', ttl: 1000 }
    * @param {object} fnOpts 业务对象{ args: [], fn: function }
    * @param {function} ack ack方法
    * @param {function} callback 回调函数
    */
    static lockRedis_fn(lockOpts, fnOpts, callback) {
        let key = 'redlock:', ttl = 2;
        if (_.isString(lockOpts)) {
            key = key + lockOpts;
        } else {
            key = key + lockOpts.key;
            ttl = (!_.isNull(lockOpts.ttl)) ? lockOpts.ttl : ttl;
        }
        let client = redisDB.getClient();
        client.send_command('EVALSHA', [envconf.redis_kmsp_lock, 0, key, ttl], (err, result) => {
            if (err) {
                setTimeout(function () {
                    lockClient.lockRedis_fn(lockOpts, fnOpts, callback);
                }, 30000);
            }
            //验证是否包含锁 返回1时 redis 新生成锁
            if (result == 1) {
                fnOpts.fn.apply(null, fnOpts.args.concat([(err, result) => {
                    redisDB.del(client, "kmsp_lock:" + key, (err, result) => {
                        callback(err, result);
                    });
                }]));
            } else if (result == 0) {//返回0时 已包含锁   
                setTimeout(function () {
                    lockClient.lockRedis_fn(lockOpts, fnOpts, callback);
                }, 150);
            };
        })
    }

    /**
* 加锁的方式执行业务
* @param {string} lockOpts 传递锁的key值，也可以传递对象来自定义过期时间 { key: 'key', ttl: 1000 }
* @param {object} fnOpts 业务对象{ args: [], fn: function }
* @param {object} mqobj mq对象
* @param {string} mqname mq名称
* @param {function} callback 回调函数
*/
    static _lockRedis(lockOpts, fnOpts, fnLock, callback) {
        let key = 'redlock:', ttl = 2;
        if (_.isString(lockOpts)) {
            key = key + lockOpts;
        } else {
            key = key + lockOpts.key;
            ttl = (!_.isNull(lockOpts.ttl)) ? lockOpts.ttl : ttl;
        }
        let client = redisDB.getClient();
        client.send_command('EVALSHA', [envconf.redis_kmsp_lock, 0, key, ttl], (err, result) => {
            console.log('获取锁结果：', result);
            if (err) {
                console.log(err);
                return callback(err, result);
            }
            //验证是否包含锁 返回1时 redis 新生成锁
            if (result == 1) {
                fnOpts.fn.apply(null, fnOpts.args.concat([(applyErr, applyResult) => {
                    if (applyErr)
                        console.log(applyErr)
                    redisDB.del(client, "kmsp_lock:" + key, (err, result) => {
                        if (!err) err = applyErr;
                        callback(err, applyResult);
                    });
                }]));
            } else if (result == 0) {//返回0时 已包含锁
                fnLock();
                callback(new lockException("数据被锁了，等待重新执行"))
            };
        })
    }

}

// lockClient.lock(
//     {
//         key: 'lock:key',
//         ttl: 1000
//     }, {
//         args: ['a', { b: 'b' }],
//         fn: (a, b, callback) => {
//             callback(null, { a: a, b: b });
//         }
//     }, (err, result) => {
//         err && console.log(err);
//         console.log(result);
//     }
// );

// lockClient.lock('lock:key', {
//     args: 'a',
//     fn: (a, callback) => {      //业务函数
//         callback(null, { a: a });
//     }
// }, (err, result) => {           //业务回调
//     err && console.log(err);
//     console.log(result);
// });

// lockClient.lock(
//     { key: 'lock:key', ttl: 1000 },
//     {
//         args: 'a',
//         fn: (a, callback) => {
//             callback(null, { a: a });
//         }
//     }, (err, result) => {
//         err && console.log(err);
//         console.log(result);
//     }
// );


module.exports = lockClient;