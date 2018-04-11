require('../global/require');
var stomp = require('./stomp-util'),
    _ = require('underscore'),
    path = require('path'),
    envconf = global.require('./config/system-config-env'),
    mq = envconf.mq;

var config = {
    url: mq.url,
    port: mq.port,
    login: mq.user,
    passcode: mq.password,
    outgoing: mq.outgoing,
    incoming: mq.incoming,
    delay: mq.delay
}

stomp.listen(config, function (client) {

    var debug = mq.debug;

    // 获取队列配置
    var list = mq.list;

    if (!list || list.length <= 0) {
        console.log(' queue list is empty... ');
        return;
    }

    // 开启分离(进程等于本文件名)
    if (!!mq.processEnable) {
        list = _.filter(list, (i) => {
            return i.process == path.basename(__filename, '.js');
        });
    }

    // 遍历文件夹
    _.each(list, function (i) {
        var queue = global.require(path.join('./', i.path));
        stomp.use(client, queue, debug);
    });

    console.log('subscribe finished!!! ');
});