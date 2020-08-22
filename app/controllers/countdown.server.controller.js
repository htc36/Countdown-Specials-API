const countdown = require('../models/countdown.server.model');
const pakNsave = require('../models/pakNsave.server.model');

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
    let query
    if (name != null) {
        query = "FROM cdProducts JOIN cdPrices ON cdProducts.code = cdPrices.code AND date = '" + name + "'"
    }else {
        query = "FROM cdProducts"
    }
    if (type != 'All' &&  type != null){
        query += " AND type = '" + type + "'";
    }
    if (search != null && search.length != 0){
        query += " Where MATCH(name, brand, volSize) AGAINST(\"" + search +  "\" IN NATURAL LANGUAGE MODE)"
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
    const date = req.query.date;
    let query
    query = "SELECT DISTINCT(type) from cdProducts"
    if(date != null) {
        query += " Where code IN (SELECT DISTINCT(cdProducts.code) from cdProducts JOIN " +
            "cdPrices ON cdProducts.code = cdPrices.code and cdPrices.date > '" + date + "')"
    }
    try {
        const types = await countdown.getTypes(query);
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
            priceList.push(parseFloat(history[index]['salePrice']))
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
exports.getSingleProduct = async function(req, res) {
    const cat1 = req.query.cat1;
    let date = req.query.date;
    let count = req.query.isCount

    let queryStart = "SELECT i.name, i.brand, i.volsize, i.type, i.code, i.image, p.salePrice"
    let countQuery = "SELECT COUNT(*)"

    let result
    try {
        if (count == null) {
            result = await countdown.getProductsThatAreNotLinked(queryStart, date, cat1);
        }else {
            result = await countdown.getProductsThatAreNotLinked(countQuery, date, cat1);
        }
        res.status(200)
            .send(result);
    } catch (err) {
        res.status(500)
            .send(`ERROR getting convos ${err}`);
    }
}


