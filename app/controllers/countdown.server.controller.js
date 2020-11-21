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
//Added new query for a pak n save product also query if it is not in the linked table
// Now need to figure out how the out put data of this controller function will be different for paknsave item, i.e have a list of countd
exports.getHistory = async function (req, res) {
    const code = req.query.code;
    const location = req.query.location;
    let history
    let countDownHistory
    let result = {}
    try {
            history = await countdown.getConnectedProductHistory(location, code)
            if (history.length == 0) {
                history = await countdown.getProductsHistory(code)
            }
    } catch (err) {
        res.status(500)
            .send(`ERROR getting convos ${err}`);
    }

    let item = {}
    let set = new Set()
    let countDownDateList = []
    let countDownPriceList = []
    let cdFinalRow
    for (let index = 0; index < history.length; index++) {
        const curItem = history[index]
        if (curItem['date'] != null) {
            set.add(new Date(history[index]['date']).toLocaleDateString('en-nz'))
        } else {
            set.add(new Date(history[index]['date2']).toLocaleDateString('en-nz'))
        }
        if (curItem["price"] != null) {
            if (item.hasOwnProperty(curItem["productId"])) {
                item[curItem["productId"]]['date'].push(set.size - 1)
                item[curItem["productId"]]['price'].push(parseFloat(history[index]['price']))
            } else {
                item[curItem["productId"]] = {}
                item[curItem["productId"]]['date'] = [set.size - 1]
                item[curItem["productId"]]['price'] = [parseFloat(curItem['price'])]
                item[curItem["productId"]]['productId'] = curItem['productId']
                item[curItem["productId"]]['name'] = curItem['pakName']
                item[curItem["productId"]]['quantityType'] = curItem['quantityType']
            }
        }
        if (curItem['salePrice'] != null && !countDownDateList.includes(set.size - 1)) {
            countDownDateList.push(set.size - 1)
            countDownPriceList.push(parseFloat(curItem['salePrice']))
            cdFinalRow = curItem
        }
    }
    result["countdown"] = [{}]
    result["countdown"][0]["date"] = countDownDateList
    result["countdown"][0]["price"] = countDownPriceList
    result["countdown"][0]["name"] = cdFinalRow['name']
    result["countdown"][0]["brand"] = cdFinalRow['brand']
    result["countdown"][0]["salePrice"] = parseFloat(cdFinalRow['salePrice'])
    result["countdown"][0]["origPrice"] = parseFloat(cdFinalRow['origPrice'])
    result["countdown"][0]["volSize"] = cdFinalRow['volSize']
    result["countdown"][0]["image"] = cdFinalRow["image"]
    result['paknsave'] = Object.values(item);

    res.status(200)
        .json({
                dates : Array.from(set),
                result
            }
        );
}


