"use strict";

require("../../global/require");

const schedule = require("node-schedule"),
    async = require("async"),
    logger = require("../../framework/utils/log4").logger("demo-job"),
    sysconf = require("../../config/system-config");

let complete = true;

//				  秒	   分   时  日  月   星期
const demoRule = "*/5	*	*	*	*	*";

var j = schedule.scheduleJob(demoRule, () => {
    //console.log("demo job - hello world", new Date());
});
