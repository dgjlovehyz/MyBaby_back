'use strict'

/**
 * Module dependencies.
 */

const
    http = require('http'),
    express = require('express'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser')

const
    normalizePort = val => {
        var port = parseInt(val, 10);

        if (isNaN(port)) {
            // named pipe
            return val;
        }

        if (port >= 0) {
            // port number
            return port;
        }

        return false;
    },

    /**
     * 创建 Express 实例
     *
     * @param {Number} port
     * @public
     */

    createExpressApp = option => {
        const
            app = express()

        app.set('port', option.port)
        app.use(logger('dev'))
        app.use(bodyParser.json())
        app.use(bodyParser.urlencoded({ extended: false }))
        app.use(cookieParser())

        // 跨域
        app.all('*', require('./routes/router-cross-domain'));

        // 自定义路由
        if (option.routes && option.routes.length > 0)
            option.routes.forEach(router => app.use(router))

        // catch 404 and forward to error handler
        app.use(require('./routes/router-not-found'));

        // error handler
        app.use(require('./routes/router-error'));

        return app
    },

    /**
     * 创建 HTTP Server(RESTful API)
     *
     * @param {Number} port
     * @public
     */

    createServer = option => {
        const
            port = normalizePort(option.port),
            app = createExpressApp(option),
            server = http.createServer(app)

        require('./httpEvent')(server, port)
        server.listen(port)
        console.log("server start")
    }

/**
 * Expose createServer 方法.
 */

exports = module.exports = createServer

/**
 * Expose router 类.
 */

exports.router = () => {
    let
        Router = require('./routes/router')
    return new Router()
}