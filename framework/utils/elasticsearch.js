const
    elasticsearch = require('elasticsearch'),
    sysconf = global.require('./config/system-config')

const client = new elasticsearch.Client(sysconf.elasticsearch.connection);

module.exports = client