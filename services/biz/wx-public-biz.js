"use strict";

const _ = require("underscore"),
    // uuidV4 = require("uuid/v4"),
    dao = global.require("./framework/utils/dao"),
    redisDB = global.require("./framework/utils/redis-client"),
    businessException = global.require("./framework/exception/businessException"),
    sysconf = global.require("./config/system-config-env"),
    crypto = require('crypto'),
    Promise = require("bluebird");

class demoBiz {
    /**
     *
     * @param {*} params
     * @param {*} callback
     */
    static getWxMsg(params, callback) {
        console.log(params)
        // switch(params.MsgType) {
        //     case 'text' : 
        //       msg.Content = data.Content[0];
        //       msg.MsgId = data.MsgId[0];
      
        //       emitter.emit("text", msg);
        //       break;
      
        //     case 'image' : 
        //       msg.PicUrl = data.PicUrl[0];
        //       msg.MsgId = data.MsgId[0];
        //       msg.MediaId = data.MediaId[0];
      
        //       emitter.emit("image", msg);
        //       break;
      
        //     case 'voice' :
        //       msg.MediaId = data.MediaId[0];
        //       msg.Format = data.Format[0];
        //       msg.MsgId = data.MsgId[0];
      
        //       emitter.emit("voice", msg);
        //       break;
      
        //     case 'video' :
        //       msg.MediaId = data.MediaId[0];
        //       msg.ThumbMediaId = data.ThumbMediaId[0];
        //       msg.MsgId = data.MsgId[0];
      
        //       emitter.emit("video", msg);
        //       break;
              
        //     case 'location' : 
        //       msg.Location_X = data.Location_X[0];
        //       msg.Location_Y = data.Location_Y[0];
        //       msg.Scale = data.Scale[0];
        //       msg.Label = data.Label[0];
        //       msg.MsgId = data.MsgId[0];
         
        //       emitter.emit("location", msg);
        //       break;
      
        //     case 'link' : 
        //       msg.Title = data.Title[0];
        //       msg.Description = data.Description[0];
        //       msg.Url = data.Url[0];
        //       msg.MsgId = data.MsgId[0];
      
        //       emitter.emit("link", msg);
        //       break;
      
        //     case 'event' : 
        //       msg.Event = data.Event[0];
        //       msg.EventKey = data.EventKey[0];
      
        //       emitter.emit("event", msg);
        //       break;
        //   }
        callback(null, true)
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

module.exports = demoBiz;
