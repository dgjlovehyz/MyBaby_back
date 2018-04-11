'use strict'

require('../global/require')

const

    _ = require('underscore'),

    path = require('path'),

    fs = require('fs'),

    cwd = process.cwd(),

    apiDir = path.join(cwd, 'routes'),

    files = fs.readdirSync(apiDir),

    sysconf = require('../config/system-config'),

    routes = []

_.each(files, file => {
    if (/.*router-api.*\.js$/ig.test(file))
        routes.push(require(path.join(apiDir, file)))
})

require('../framework/httpServer')({
    port: sysconf.system.port.api,
    routes: routes
})
