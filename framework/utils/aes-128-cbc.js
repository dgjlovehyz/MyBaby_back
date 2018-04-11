'use strict'

const crypto = require('crypto');

/**
 * 
 * 
 * @module aes-128-cbc加密类
 * 和c# API算法保持一致，编码统一为UTF8
 */
module.exports = class {

    /**
     * 加密方法
     * @param key 加密key
     * @param iv       向量
     * @param data     需要加密的数据
     * @returns string
     */
    static encrypt(key, iv, data) {
        let cipher = crypto.createCipheriv('aes-128-cbc', key, iv),
            crypted = cipher.update(data, 'utf8', 'binary');

        return new Buffer(crypted + cipher.final('binary'), 'binary').toString('base64');
    };

    /**
     * 解密方法
     * @param key      解密的key
     * @param iv       向量
     * @param crypted  密文
     * @returns string
     */
    static decrypt(key, iv, crypted) {
        crypted = new Buffer(crypted, 'base64').toString('binary');
        let decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);

        return decipher.update(crypted, 'binary', 'utf8') + decipher.final('utf8');
    };

}