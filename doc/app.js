'use strict'

require('../global/require')

const
    express = require('express'),
    exec = require('child_process').exec,
    sysconf = require('../config/system-config')

exec(' apidoc -i ../api/routes/ -o ./files ', (err, stdout, stderr) => {
    if (!!err) {
        console.error(err);
        console.error('api 文档生成失败！');
    }
    else {
        console.log('api 文档生成成功！');
        require('../framework/httpServer')({
            port: sysconf.system.port.doc,
            routes: [express.static('./files')]
        })
    }
});


