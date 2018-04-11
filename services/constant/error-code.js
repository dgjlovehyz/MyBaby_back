'use strict'

/**
 * 错误状态
 * 
 * 特定错误码: 1 => 10000
 * 权限错误码: 10000 => 10999
 * 用户错误码: 11000 => 11999
 */

module.exports = require('immutable').fromJS({
    /**
     * 未登录
     */
    NOT_LOGIN: 2,

    /**
     * 账号被禁用
     */
    USER_DISABLE: 5,

    /**
     * 权限不足
     */
    NOT_AUTHORIZATION: 10000,

    
    /**
     * 该用户不存在
     */
    NOT_USER_EXIST: 11000,
    /**
     * 该用户已关联到该领域
     */
    EXIST_USER_RELATION_DOMAIN: 11001
})
