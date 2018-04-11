"use strict";

/**
 * 权限验证方式
 */

module.exports = require("immutable").fromJS({
    /**
     * 状态 - 后端验证
     */
    STATUS_BACK: 'back',

    /**
     * 状态 - 前端验证
     */
    STATUS_FRONT: 'front',

    /**
     * 状态 - 前后端都可以，根据前端session_sid,后端Token判断，都存在已Token优先
     */
    STATUS_BOTH: 'both',

    /**
     * 需要微信验证
     */
    STATUS_WX: 'wx',

    /**
     * 状态 - 不做验证
     */
    STATUS_NON: 'non'

});
