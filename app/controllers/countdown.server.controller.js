const countdown = require('../models/countdown.server.model');

exports.getProducts = async function(req, res) {
    let queryWithOffset = "";
    const type = req.query.type;
    const name = req.query.dateOfSpecials;
    const search = req.query.search;
    const order = req.query.order;
    const offset = req.query.offset;
    const limit = req.query.limit;
    const sort = req.query.sort;
    // let query = "FROM `" + name + "` WHERE";
    let query = "FROM distinctProducts JOIN priceOnDate ON distinctProducts.barcode = priceOnDate.barcode AND date = '" + name + "'"
    if (type != 'All' &&  type != null){
        query += " AND type = '" + type + "'";
    }
    if (search != null && search.length != 0){
        query += " AND name LIKE '%" + search + "%'";
    }
    if (sort != null) {
        query += " ORDER BY " +sort;
        query += order ? ' desc' : "";
    }
    if (limit == null || parseInt(limit) > 100) {
        query += " LIMIT 100";
    } else {
        query += " LIMIT " + limit;
    }
    if (offset != null) {
        queryWithOffset = query + " OFFSET " + offset;
    }
    try {
        let result
        if (queryWithOffset != ""){
            result = await countdown.getAll(queryWithOffset);
        }else {
            result = await countdown.getAll(query);
        }
        const total = await countdown.getCount(query);
        res.status(200)
            .json({
                total: total,
                rows : result
            });

    } catch (err) {
        res.status(500)
            .send(`ERROR getting data ${err}`);
    }
}
exports.getDates = async function(req, res) {
    try {
        const dates = await countdown.getDateData();
        res.status(200)
            .send({
                dates
            });

    } catch (err) {
        res.status(500)
            .send(`ERROR getting data ${err}`);
    }
}
exports.getTypes = async function(req, res) {
    try {
        const types = await countdown.getTypes();
        res.status(200)
            .send({
                types
            });

    } catch (err) {
        res.status(500)
            .send(`ERROR getting data ${err}`);
    }
}
exports.getPreviousPrices = async function(req, res) {
    try {
        const barcode = req.query.barcode;
        if (barcode == null) {
            res.status(400)
                .send("Need a valid barcode");
            return;
        }
        const history = await countdown.getProductsHistory(barcode)
        let dateList = []
        let priceList = []
        let date
        for (let index = 0; index < history.length; index++) {
            date = new Date(history[index]['date'])
            dateList.push(date.toLocaleDateString('en-nz'))
            priceList.push(history[index]['salePrice'])
        }
        res.status(200)
            .json({
                dates: dateList,
                prices: priceList
            });

    } catch (err) {
        res.status(500)
            .send(`ERROR getting data ${err}`);
    }
}

