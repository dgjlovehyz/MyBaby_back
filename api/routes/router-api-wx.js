'use strict'

const router = global.require("./framework/httpServer").router(),
    wxPublicCtrl = require("../controllers/wx-public-ctrl");

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
router.post("/wx/msg", {
    auth: "wx",
    processor: wxPublicCtrl.getWxMsg
});

router.get("/wx/msg", {
    processor: wxPublicCtrl.wxAuth
});

module.exports = router.router;