(function () {
    var Stomp, _, client, listen, use, queue, config, callback, async, moment;

    Stomp = require('./stomp/stomp-node');
    _ = require('underscore');
    async = require('async');
    moment = require('moment');

    /*
        config = {
            url: 'localhost',
            port: 61613,
            login: 'admin',
            passcode: 'admin',
            outgoing: 20000,
            incoming: 0,
            delay: 5000 // 断线重连时间, 如果有则说明无线重连
        }
    */

    // 监听
    listen = function (config, callback) {
        // 创建stomp 客户端
        var client = Stomp.overTCP(config.url, config.port);
        // 心跳配置 
        client.heartbeat.outgoing = config.outgoing;
        client.heartbeat.incoming = config.incoming;

        // 链接
        client.connect({
            login: config.login,
            passcode: config.passcode
        }, function () {
            console.log('link successful！');
            typeof callback === "function" ? callback(client) : void 0;
        }, function (err) {
            // 断线重连
            if (config.delay) {
                console.log('link failure! reconnect after ' + config.delay + 'ms');
                setTimeout(function () {
                    listen(config, callback);
                }, config.delay);
            } else {
                console.log('link failure! server closed');
            }
        });
    }

    // queue()  sub list and next)
    queue = function () {
        var obj = {}, arr = [];

        // sub
        obj.subscribe = function () {
            var name, callback, prefetchSize, args = arguments;
            if (args.length == 2) {
                name = args[0];
                prefetchSize = 1;
                callback = args[1];
            } else {
                name = args[0];
                prefetchSize = args[1];
                callback = args[2];
            }
            arr.push({
                name: name,
                prefetchSize: prefetchSize,
                callback: callback
            });
        }

        // for use()
        obj.list = function () {
            return arr;
        };

        return obj;
    }

    // 自定义队列
    var Queue = function (size) {
        var list = [];

        //向队列中添加数据
        this.push = function (data) {
            if (data == null) {
                return false;
            }
            //如果传递了size参数就设置了队列的大小
            if (size != null && !isNaN(size)) {
                if (list.length == size) {
                    // this.pop();
                }
            }
            list.unshift(data);
            return true;
        }

        //从队列中取出数据
        this.pop = function () {
            return list.pop();
        }

        //返回队列的大小
        this.size = function () {
            return list.length;
        }

        //返回队列的内容
        this.quere = function () {
            return list;
        }
    }

    // use(Queue)
    use = function (client, queue, debug) {

        var ack = function (frame, headers) {
            var subscription = frame.headers.subscription;
            var messageID = frame.headers["message-id"];
            if (headers == null) {
                headers = {};
            }
            return client.ack(messageID, subscription, headers);
        }

        if (!client || !queue) {
            console.log(' use() args error');
            return;
        }
        if (queue.list().length > 0) {
            _.each(queue.list(), function (queue) {
                console.log('use() client.subscribe queue.name =', queue.name);
                client.subscribe(queue.name, function (message) {
                    if (debug)
                        console.log(moment().format('YYYY-MM-DD HH:mm:ss'), 'debug:queue name =', queue.name, ' body =', message.body);
                    queue.callback(message, ack);
                }, { ack: 'client', 'activemq.prefetchSize': queue.prefetchSize });
            });
        } else {
            console.log(' queue list is empty!!! ');
        }
    }

    exports.queue = queue;
    exports.use = use;
    exports.listen = listen;

}).call(this);

/*
UTIL-API:

STOMPJS-API:
    1.配置心跳
        // 心跳配置 
        client.heartbeat.outgoing = 20000;
        client.heartbeat.incoming = 0;

    2.链接
        client.connect(login, passcode, connectCallback);

    3.订阅
        // 订阅
            var subscription = client.subscribe("/queue/test",
                function(message) {
                // do something with the message
                ...
                // and acknowledge it
                message.ack();  // 告知已收到
                },
                {ack: 'client'}
            );
        // 取定

    4.发送
        client.send("/queue/test", {priority: 9}, "Hello, STOMP");

    5.事务
        // 接收事务
            var tx = client.begin();
            message.ack({ transaction: tx.id, receipt: 'my-receipt' });
            tx.commit();
        // 发送事务
            // start the transaction
            var tx = client.begin();
            // send the message in a transaction
            client.send("/queue/test", {transaction: tx.id}, "message in a transaction");
            // commit the transaction to effectively send the message
            tx.commit();
            // 
            tx.abort();
*/