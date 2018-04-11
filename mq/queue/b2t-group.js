
var queue = global.require('mq/stomp-util').queue(),
    mqOrderBiz = global.require('./services/biz/mq/mq-order-biz'),
    _ = require('underscore');

/**
* 消费微信通知mq
*/
queue.subscribe('/queue/KMSP_Order_group_Join', function (message, ack) {
    var params = JSON.parse(message.body);
    mqOrderBiz.handleB2TGroupByOrderId(params, function (err, result) {
        if (err) {
            console.log(err);
        }
        params.a = undefined;
        ack(message);

    });
});



module.exports = queue;