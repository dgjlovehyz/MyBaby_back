"use strict";

const _ = require("underscore"),
    // uuidV4 = require("uuid/v4"),
    dao = global.require("./framework/utils/dao"),
    businessException = global.require("./framework/exception/businessException"),
    sysconf = global.require("./config/system-config-env"),
    crypto = require('crypto'),
    async = require('async'),
    moment = require('moment'),
    UUID = require('uuid'),
    redis = global.require('./framework/utils/redis-client'),
    userBiz = global.require("./services/biz/user-biz"),
    childrenBiz = global.require("./services/biz/children-biz"),
    userDao = global.require("./services/data/user-dao"),
    wxPublicDao = global.require("./services/data/wx-public-dao");

class wxPublicBiz {
    /**
     *
     * @param {*} params
     * @param {*} callback
     */
    static getWxMsg(params, callback) {
        console.log(params)
        switch (params.MsgType) {
            case 'text':
                //收到普通消息
                wxPublicBiz.normalMsg(params, (err, result) => {
                    callback(err, result)
                })
                break;

            case 'image':
                //图片消息
                break;

            case 'voice':
                //暂时不处理
                break;

            case 'video':
                //暂时不处理
                break;

            case 'location':
                //定位，暂时不处理
                break;

            case 'link':
                //暂时不处理
                break;

            case 'event':
                if (params.Event == 'subscribe') {
                    //新人关注
                    userBiz.addNewUser(params, (err, result) => {
                        callback(err, result)
                    })
                } else if (params.Event == 'unsubscribe') {
                    //取消关注
                    userBiz.updateUser(params, (err, result) => {
                        callback(err, result)
                    })
                }
                break;
            default:
                callback("非法操作")
        }
        // callback(null, true)
    }

    /**
     * 处理普通消息
     * 
     * @param {*} params 
     * @param {*} callback 
     */
    static normalMsg(params, callback) {
        async.waterfall([
            (cb) => {
                //获取redis中数据
                redis.getStringCache(redis.getClient(), "user", params.FromUserName, (err, result) => {
                    //获取到的数据返回
                    cb(err, JSON.parse(result))
                })
            },
            (result, cb) => {
                if (!result) {
                    result = {
                        frist: params.Content,
                        second: "",
                        three: "",
                        four: "",
                        five: "",
                        six: "",
                        user_id: ""
                    }
                    dao.manageConnection(params, (connection, params, next) => {
                        userDao.getUser(connection, params, (err, result) => {
                            result.user_id = result[0].user_id
                            next()
                        })   
                    })
                    
                } else {
                    if (!result.second) {
                        result.second = params.Content
                    } else if (!result.three) {
                        result.three = params.Content
                    } else if (!result.four) {
                        result.four = params.Content
                    } else if (!result.five) {
                        result.five = params.Content
                    }
                }
                params.redisData = result

                if (result) {
                    switch (+result.frist) {
                        case 100:
                            //查询绑定的宝贝
                            return wxPublicBiz.searchBindBaby(params, cb)
                            break;
                        case 101:
                            //新建宝贝档案
                            return wxPublicBiz.addNewBaby(params, cb)
                            break;
                        case 102:
                            //绑定新的宝贝
                            break;
                        case 103:
                            //
                            break;
                        default:
                            cb(null, "请输入正确操作")
                            break;

                    }
                }


            }], (err, result) => {
                //处理微信公众号返回消息
                redis.setStringCache(redis.getClient(), "user", params.FromUserName, JSON.stringify(params.redisData), 10000, (err, result) => { console.log(err, result) })
                callback(err, result)
            })
    }

    static searchBindBaby(params, callback) {
        if (params.redisData.five) {

        } else if (params.redisData.four) {

        } else if (params.redisData.three) {

        } else if (params.redisData.second) {

        } else if (params.redisData.frist) {
            //查询绑定的宝贝
            childrenBiz.queryBindChild(params, (err, result) => {
                if (err)
                    return callback(err)
                console.log(result)
                if (result.length <= 0)
                    return callback("没有绑定宝贝\n输入：101 新建您的宝贝、\n或者输入：102 绑定您的宝贝")
                var returnText = '您绑定的宝贝有：\n';
                for (var i = 0; i < result.length; i++) {
                    returnText += result[i].child_relation
                    returnText += "：" + result[i].name
                    returnText += "\n"
                }
                callback(null, returnText)
            })
        }
    }


    static addNewBaby(params, callback) {
        if (params.redisData.six) {
            var uuid = UUID.v1()
            childrenBiz.createBaby({uuid:uuid, 
                name:params.redisData.second, 
                sex:params.redisData.three,
                birth_time: params.redisData.four,
                user_relation:params.redisData.five,
                child_relation:params.redisData.six
            }, (err, result) => {

                callback(null, "宝贝数据新建成功")
            })

        } else if (params.redisData.five) {
            var returnText = '新建宝贝档案：\n请输入你是宝贝的\n（举个栗子：微信公众号发送”爸爸（妈妈/爷爷/奶奶）“'
            callback(null, "宝贝数据新建成功")
        } else if (params.redisData.four) {
            //收到宝贝出生日期

            var reg = /[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}/;
            var res = reg.test(params.Content);
            if (!res) {
                //清除本次操作
                params.redisData.four = ''
                return callback("日期格式错误，请重新输入\n请发送宝贝出生日期\n（日期格式：2019/01/01 14:20 举个栗子：微信公众号发送“2019/01/01 14:20”）\n")
            }
            var returnText = '新建宝贝档案：\n请输入宝贝和你的关系\n（举个栗子：微信公众号发送”女儿（儿子/侄儿）“'
            callback(null, returnText)
            //宝贝档案收集齐全，开始新建宝贝档案，并且关联绑定

        } else if (params.redisData.three) {
            //收到宝贝性别
            if (params.Content > 2 || params.Content < 1) {
                params.redisData.three = ''
                return callback('输入错误，请重新输入\n请发送宝贝性别\n（1：女  2：男  举个栗子：微信公众号发送“1"\n')
            }
            var returnText = '新建宝贝档案：\n请输入宝贝出生日期\n（日期格式：2019/01/01 14:20 举个栗子：微信公众号发送“2019/01/01 14:20”）\n'
            callback(null, returnText)
        } else if (params.redisData.second) {
            //收到宝贝的名称
            var returnText = '新建宝贝档案：\n请输入宝贝性别\n（1：女  2：男  举个栗子：微信公众号发送“1”）\n'
            callback(null, returnText)
        } else if (params.redisData.frist) {
            //收到新建宝贝档案的请求
            var returnText = '新建宝贝档案：\n请输入宝贝名称\n（举个栗子：微信公众号发送“二狗蛋”）\n'
            callback(null, returnText)
        }
    }


    /**
     *
     * @param {*} params
     * @param {*} callback
     */
    static wxAuth(params, callback) {
        if (!params.signature)
            return callback(new businessException("签名错误"))
        if (!params.timestamp)
            return callback(new businessException("时间戳错误"))
        if (!params.nonce)
            return callback(new businessException("随机数错误"))

        let dict = { token: sysconf.wxToken, timestamp: params.timestamp, nonce: params.nonce };
        var sha1Str = '';
        for (let key of Object.values(dict).sort()) {
            console.log('key：' + key)
            sha1Str = sha1Str + key
        }
        var sha1 = crypto.createHash("sha1");
        sha1.update(sha1Str)
        console.log("sha1Str:" + sha1Str)
        console.log("timestamp:" + params.timestamp)
        console.log("nonce:" + params.nonce)
        var _signature = sha1.digest('hex')
        console.log("signature:" + params.signature)
        console.log("_signature:" + _signature)
        console.log("echostr:" + params.echostr)
        if (_signature == params.signature)
            return callback(null, params.echostr)
        callback("签名验证失败")
    }
}

module.exports = wxPublicBiz;
