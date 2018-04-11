const router = global.require("./framework/httpServer").router(),
    demoValidater = require("../validates/demo-validater"),
    demoCtrl = require("../controllers/demo-ctrl");

/**
 * @api {get} /demo/list 示例信息列表
 * @apiDescription 获取示例信息列表
 * @apiName demo list
 * @apiGroup demo
 * @apiParam {number=0,1,2} [status] 信息的状态
 * @apiParam (page) {number} [pageIndex=1] 页数
 * @apiParam (page) {number} [pageSize=50] 单页信息条数
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *         "status": 0,
 *         "data": [
 *             {
 *                 "id": 1,
 *                 "message": "Hello World",
 *                 "status": 0
 *             }
 *         ],
 *         "pagination": {
 *             "pageIndex": 1,
 *             "pageSize": 50,
 *             "total": 3,
 *             "pageCount": 1
 *         }
 *     }
 * @apiVersion 1.0.0
 */
router.get("/demo/list", {
    name: "示例列表接口",
    auth: true,
    validater: demoValidater.listQuery,
    processor: demoCtrl.getDemoList
});

module.exports = router.router;
