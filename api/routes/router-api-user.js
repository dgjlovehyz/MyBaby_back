'use strict'

const router = global.require("./framework/httpServer").router(),
    userCtrl = require("../controllers/user-ctrl");

/**
* @api {post} /user/save 保存和更新用户信息
* @apiDescription 保存和更新用户信息(高阳)
* @apiName user save
* @apiGroup user
* @apiParam {String} [vip_nickname] 昵称
* @apiParam {String} [vip_name] 真实姓名
* @apiParam {String} [vip_face] 头像
* @apiParam {String} [vip_account] 商城账号
* @apiParam {String} [vip_mobile] 手机号码
* @apiParam {String} [vip_mail] 电子邮箱
* @apiParam {String} [vip_openid] 微信公众帐号openid/新浪微博openid/QQ openid/微信小程序openid
* @apiParam {String} [vip_bind_type] 账号绑定类型 -1解绑 0未绑定 1账号 2手机 3邮箱 默认0
* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 200 OK
*     {
*         "status": 0,
*         "data": true
*     }
* @apiVersion 1.0.0
*/
router.post("/user/save", {
    name: "微信消息接收",
    auth: "front",
    processor: userCtrl.save
});

router.get("/shop/gethost", {
    name: "微信验证",
    auth: "front",
    processor: userCtrl.gethost
});

/**
* @api {post} /user/binduser 绑定用户1
* @apiDescription 绑定用户(黄毅)1
* @apiName user binduser
* @apiGroup user
* @apiParam {String} [oldId] 旧Id
* @apiParam {String} [newId] 新id
* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 200 OK
*     {
*         "status": 0,
*         "data": true
*     }
* @apiVersion 1.0.0
*/
router.post("/user/binduser", {
    auth: "front",
    processor: userCtrl.updateAfterBindUserInfo
});

module.exports = router.router;
