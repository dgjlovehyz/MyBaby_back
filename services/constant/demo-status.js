"use strict";

/**
 * 示例常量
 */

module.exports = require("immutable").fromJS({
    /**
     * 状态 - 正常
     */
    STATUS_NORMAL: 0,

    /**
     * 状态 - 已读
     */
    STATUS_READ: 1,

    /**
     * 状态 - 已标记
     */
    STATUS_MARK: 2
});
