let DemoException = global.require("./framework/exception/demoException"),
    demoBiz = global.require("./services/biz/demo-biz");

class DemoCtrl {
    static getDemoList(req, res, next) {
        let query = req.query;

        query.pagination = req.pagination;

        demoBiz.getDemoList(query, (err, result) => {
            if (err) {
                return next(err);
            }
            res.json(result);
        });
    }
}

module.exports = DemoCtrl;
