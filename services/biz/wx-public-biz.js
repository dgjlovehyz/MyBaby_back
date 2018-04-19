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
        async.waterfall([
            (cb) => {
                switch (params.MsgType) {
                    case 'text':
                        //收到普通消息
                        wxPublicBiz.normalMsg(params, (err, result) => {
                            cb(err, result)
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
                            console.log('关注事件')
                            userBiz.addNewUser(params, (err, result) => {
                                cb(err, result)
                            })
                        } else if (params.Event == 'unsubscribe') {
                            //取消关注
                            userBiz.updateUser(params, (err, result) => {
                                cb(err, result)
                            })
                        }
                        break;
                    default:
                        cb("非法操作")
                }

            }], (err, result) => {
                //处理微信公众号返回消息
                let Content = ''
                let returnEntity = {}
                if (err instanceof Error)
                    Content = '操作异常，请重新输入或输入103清空操作\n输入以下数字查询对应功能：\n100：查询绑定的宝贝\n101：新建宝贝档案\n102：绑定新的宝贝'
                if (err) {
                    Content = err

                } else {
                    if (typeof result == 'string') {
                        Content = result
                    } else {
                        returnEntity.MsgType = result.MsgType
                        Content = result.Content
                    }
                }
                returnEntity.Content = Content
                returnEntity.ToUserName = params.ToUserName
                returnEntity.FromUserName = params.FromUserName
                

                callback(err, wxPublicBiz.wxReturnXml(returnEntity))
            })

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
                        userDao.getUser(connection, params, (err, userInfo) => {
                            result.user_id = userInfo.user_id
                            next()
                            cb(null, result)
                        })
                    })

                } else {
                    if (+params.Content == 103) {
                        //清除操作
                        result.frist = params.Content
                    } else if (!result.frist) {
                        result.frist = params.Content
                    } else if (!result.second) {
                        result.second = params.Content
                    } else if (!result.three) {
                        result.three = params.Content
                    } else if (!result.four) {
                        result.four = params.Content
                    } else if (!result.five) {
                        result.five = params.Content
                    } else if (!result.six) {
                        result.six = params.Content
                    }
                    cb(null, result)
                }
            }, (result, cb) => {
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
                            //清除操作
                            return wxPublicBiz.clearRedis(params, cb)
                            break;
                        default:
                            let returnText = "请输入正确操作\n输入以下数字查询对应功能：\n100：查询绑定的宝贝\n101：新建宝贝档案\n102：绑定新的宝贝"
                            cb(null, { MsgType: 'text', Content: returnText })
                            break;

                    }
                }
            }], (err, result) => {

                //用户操作存入redis
                redis.setStringCache(redis.getClient(), "user", params.FromUserName, JSON.stringify(params.redisData), 10000, (err, result) => { console.log(err, result) })

                callback(err, result)
            })
    }

    /**
     * 组织返回值
     * @param {*} params 
     * @param {*} callback 
     */
    static wxReturnXml(params) {
        //自动检测 MsgType
        var MsgType = "";
        if (!params.MsgType) {
            if (params.hasOwnProperty("Content")) MsgType = "text";
            if (params.hasOwnProperty("MusicUrl")) MsgType = "music";
            if (params.hasOwnProperty("Articles")) MsgType = "news";
        } else {
            MsgType = params.MsgType;
        }

        var msg = "" +
            "<xml>" +
            "<ToUserName><![CDATA[" + params.ToUserName + "]]></ToUserName>" +
            "<FromUserName><![CDATA[" + params.FromUserName + "]]></FromUserName>" +
            "<CreateTime>" + Date.now() / 1000 + "</CreateTime>" +
            "<MsgType><![CDATA[" + MsgType + "]]></MsgType>";

        switch (MsgType) {
            case 'text':
                msg += "" +
                    "<Content><![CDATA[" + (params.Content || '') + "]]></Content>" +
                    "</xml>";
                return msg;

            case 'image':
                msg += "" +
                    "<Image>" +
                    "<MediaId><![CDATA[" + params.MediaId + "]]></MediaId>" +
                    "</Image>" +
                    "</xml>";

            case 'voice':
                msg += "" +
                    "<Voice>" +
                    "<MediaId><![CDATA[" + params.MediaId + "]]></MediaId>" +
                    "<Title><![CDATA[" + params.Title + "]]></Title>" +
                    "<Description><![CDATA[" + params.Description + "]]></Description>" +
                    "</Voice>" +
                    "</xml>";

            case 'video':
                msg += "" +
                    "<Video>" +
                    "<MediaId><![CDATA[" + params.MediaId + "]]></MediaId>" +
                    "</Video>" +
                    "</xml>";

            case 'music':
                msg += "" +
                    "<Music>" +
                    "<Title><![CDATA[" + (params.Title || '') + "]]></Title>" +
                    "<Description><![CDATA[" + (params.Description || '') + "]]></Description>" +
                    "<MusicUrl><![CDATA[" + (params.MusicUrl || '') + "]]></MusicUrl>" +
                    "<HQMusicUrl><![CDATA[" + (params.HQMusicUrl || data.MusicUrl || '') + "]]></HQMusicUrl>" +
                    "<ThumbMediaId><![CDATA[" + (params.ThumbMediaId || '') + "]]></ThumbMediaId>" +
                    "</Music>" +
                    "</xml>";
                return msg;

            case 'news':
                var ArticlesStr = "";
                var ArticleCount = params.Articles.length;
                for (var i in params.Articles) {
                    ArticlesStr += "" +
                        "<item>" +
                        "<Title><![CDATA[" + (params.Articles[i].Title || '') + "]]></Title>" +
                        "<Description><![CDATA[" + (params.Articles[i].Description || '') + "]]></Description>" +
                        "<PicUrl><![CDATA[" + (params.Articles[i].PicUrl || '') + "]]></PicUrl>" +
                        "<Url><![CDATA[" + (params.Articles[i].Url || '') + "]]></Url>" +
                        "</item>";
                }

                msg += "<ArticleCount>" + ArticleCount + "</ArticleCount><Articles>" + ArticlesStr + "</Articles></xml>";
                return msg;
        }
    }

    static searchBindBaby(params, callback) {
        if (params.redisData.five) {

        } else if (params.redisData.four) {

        } else if (params.redisData.three) {
            switch (+params.redisData.three) {
                case 110:
                    var child = params.redisData.children[params.redisData.index]
                    var returnText = '宝贝-' + child.name + ' 的编号：' + child.uuid + '\n（请保存好宝贝编号，勿泄露给不认识的人）\n查询功能：\n110：查询宝贝编号（绑定宝贝用，请勿泄露）\n111：查询宝贝最近7张照片'
                    params.redisData.three = ''
                    return callback(null, { MsgType: 'text', Content: returnText })
                    break;
                case 111:
                    break;
                default:
                    callback(null, "操作错误，请重新输入！")
                    break;
            }

        } else if (params.redisData.second) {
            var returnText
            for (var i = 0; i < params.redisData.children.length; i++) {
                if (params.redisData.children[i].id == params.redisData.second) {
                    let child = params.redisData.children[i]
                    returnText = child.child_relation + "：" + child.name + "\n"
                    returnText += "性别：" + (child.sex == 1 ? "女" : "男") + "\n"
                    var time = moment(child.birth_time).format('YYYY-MM-DD HH:mm:ss');
                    returnText += "出生日期：" + time + '\n'
                    returnText += '查询功能：\n110：查询宝贝编号（绑定宝贝用，请勿泄露）\n111：查询宝贝最近7张照片\n112：添加照片'
                    params.redisData.index = i
                    return callback(null, { MsgType: 'text', Content: returnText })
                }
            }
            returnText = "输入错误，请重新输入！"
            params.redisData.second = ''
            return callback(null, { MsgType: 'text', Content: returnText })
        } else if (params.redisData.frist) {
            //查询绑定的宝贝
            childrenBiz.queryBindChild(params, (err, result) => {
                if (err)
                    return callback(err)
                console.log(result)
                if (result.length <= 0)
                    return callback("没有绑定宝贝\n输入：101 新建您的宝贝、\n或者输入：102 绑定您的宝贝")
                var returnText = '您绑定的宝贝有：\n';
                params.redisData.children = []
                var childInfo
                for (var i = 0; i < result.length; i++) {
                    returnText += (i + 1) + ":"
                    returnText += result[i].child_relation
                    returnText += "：" + result[i].name
                    returnText += "\n"
                    childInfo = result[i]
                    childInfo.id = i + 1
                    params.redisData.children.push(childInfo)
                }
                returnText += "输入编号：1或2..查询对应宝贝的信息"

                return callback(null, { MsgType: 'text', Content: returnText })
            })
        }
    }

    /**
     * 清除操作
     * @param {*} params 
     * @param {*} callback 
     */
    static clearRedis(params, callback) {
        params.redisData = { user_id: params.redisData.user_id }
        var returnText = "输入以下数字查询对应功能：\n100：查询绑定的宝贝\n101：新建宝贝档案\n102：绑定新的宝贝"
        callback(null, { MsgType: 'text', Content: returnText })
    }

    /**
     * 新建宝贝
     * @param {*} params 
     * @param {*} callback 
     */
    static addNewBaby(params, callback) {
        if (params.redisData.six) {
            var uuid = UUID.v1()
            childrenBiz.createBaby({
                uuid: uuid,
                name: params.redisData.second,
                sex: params.redisData.three,
                birth_time: params.redisData.four,
                user_relation: params.redisData.five,
                child_relation: params.redisData.six,
                user_id: params.redisData.user_id
            }, (err, result) => {
                params.redisData = { user_id: params.redisData.user_id }
                var returnText = "宝贝数据新建成功!\n输入以下数字查询对应功能：\n100：查询绑定的宝贝\n101：新建宝贝档案\n102：绑定新的宝贝"
                callback(null, { MsgType: 'text', Content: returnText })
            })

        } else if (params.redisData.five) {
            var returnText = '新建宝贝档案：\n请输入你是宝贝的\n（举个栗子：微信公众号发送”爸爸（妈妈/爷爷/奶奶）“\n输入103清空操作'
            callback(null, { MsgType: 'text', Content: returnText })
        } else if (params.redisData.four) {
            //收到宝贝出生日期

            var reg = /[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}/;
            var res = reg.test(params.Content);
            if (!res) {
                //清除本次操作
                params.redisData.four = ''
                return callback("日期格式错误，请重新输入\n请发送宝贝出生日期\n（日期格式：2019-01-01 14:20 举个栗子：微信公众号发送“2019/01/01 14:20”）\n输入103清空操作")
            }
            var returnText = '新建宝贝档案：\n请输入宝贝和你的关系\n（举个栗子：微信公众号发送”女儿（儿子/侄儿）“\n输入103清空操作'
            callback(null, { MsgType: 'text', Content: returnText })
            //宝贝档案收集齐全，开始新建宝贝档案，并且关联绑定

        } else if (params.redisData.three) {
            //收到宝贝性别
            if (params.Content > 2 || params.Content < 1) {
                params.redisData.three = ''
                return callback('输入错误，请重新输入\n请发送宝贝性别\n（1：女  2：男  举个栗子：微信公众号发送“1"\n输入103清空操作')
            }
            var returnText = '新建宝贝档案：\n请输入宝贝出生日期\n（日期格式：2019/01/01 14:20 举个栗子：微信公众号发送“2019/01/01 14:20”）\n输入103清空操作'
            callback(null, { MsgType: 'text', Content: returnText })
        } else if (params.redisData.second) {
            //收到宝贝的名称
            var returnText = '新建宝贝档案：\n请输入宝贝性别\n（1：女  2：男  举个栗子：微信公众号发送“1”）\n输入103清空操作'
            callback(null, { MsgType: 'text', Content: returnText })
        } else if (params.redisData.frist) {
            //收到新建宝贝档案的请求
            var returnText = '新建宝贝档案：\n请输入宝贝名称\n（举个栗子：微信公众号发送“二狗蛋”）\n输入103清空操作'
            callback(null, { MsgType: 'text', Content: returnText })
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
