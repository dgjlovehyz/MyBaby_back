
var request = require('request'),
    envconf = global.require('./config/system-config-env'),
    async = require('async'),
    BusinessException = global.require('./framework/exception/businessException');

// 从配置文件获取mq信息
var mq = envconf.mq,
    mq_api_message_url = mq.api,
    mq_authorization = 'Basic ' + new Buffer(mq.user + ':' + mq.password).toString('base64');

/**
 * 发送消息队列基本方法
 */
class ActiveMqBase {
    static sendQueue(name, data, delayed, callback) {
        let delayed_time = '500';
        if (delayed) {
            delayed_time = delayed
        }
        request.post({
            url: mq_api_message_url + name,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': mq_authorization
            },
            form: {
                type: 'queue',
                AMQ_SCHEDULED_DELAY: delayed_time,
                body: JSON.stringify(data)
            }
        }, function (err, resp, body) {
            if (err || resp.statusCode != 200) {
                console.log('mq消息发送失败:', JSON.stringify(err));
                logs._addB2tLogs(name, 'mq消息发送失败', JSON.stringify(err), 3, 'active-mq-util');
            } else {
                console.log('mq消息发送成功, name:', name, ", data:", JSON.stringify(data));
            }
            if (typeof callback === 'function') {
                callback(err, body);
            }
        });
    }
}

/**
 * 具体每个功能定制
 */
class ActiveMqUtil {

    /**
     * 创建团购商品消息
     */
    static sendDome(info, callback) {

        ActiveMqBase.sendQueue('mq_name', info, 100, callback);
    }
}

module.exports = ActiveMqUtil;