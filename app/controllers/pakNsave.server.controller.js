const pakNsave = require('../models/pakNsave.server.model');
const countdown = require('../models/countdown.server.model');

exports.getProducts = async function(req, res) {
    let queryWithOffset = "";
    const date = req.query.dateOfSpecials;
    const quantity = req.query.quantity;
    const search = req.query.search;
    const order = req.query.order;
    const offset = req.query.offset;
    const limit = req.query.limit;
    const sort = req.query.sort;
    // let query = "FROM `" + name + "` WHERE";
    let query
    if (date != null) {
        query = "FROM psProducts JOIN psPrices ON psProducts.productId = psPrices.productId AND date = '" + date + "'"
    }else {
        query = "FROM psProducts"
    }
    if (search != null && search.length != 0){
        query += " Where MATCH(name, quantityType) AGAINST(\"" + search +  "\" IN NATURAL LANGUAGE MODE)"
        if (quantity != null && quantity != "") {
            query += " AND quantityType = '" + quantity + "'"
        }
    } else {
        if (quantity != null && quantity != "") {
            query += " WHERE quantityType = '" + quantity + "'"
        }
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
        console.log(query)
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

exports.getSingleProduct = async function(req, res) {
    const cat1 = req.query.cat1;
    const cat2 = req.query.cat2;
    let offset = req.query.offset;
    if (offset == null) {
        offset = 0
    }
    const query = "from psProducts where psProducts.productId NOT IN (SELECT pakNsaveID " +
        "from linkedSupermarkets WHERE linkedSupermarkets.pakNsaveID = productId) " +
        "AND category1 = '" + cat1 + "' AND category2 = '" + cat2 + "'"

    try {
        const result = await pakNsave.getSingleUnJoinedProduct(query, offset);
        res.status(200)
            .send(result);
    } catch (err) {
        res.status(500)
            .send(`ERROR getting convos ${err}`);
    }
}

exports.linkProducts = async function(req, res) {
    const pakNSave = req.query.pakNSave;
    const countdown = req.query.countDown;
    const query = "INSERT INTO `linkedSupermarkets` (`id`, `countdownID`, `pakNsaveID`) VALUES (NULL, '" + countdown +
        "', '" + pakNSave + "')"
    try {
        await pakNsave.getAll(query);
        res.status(200)
            .send(
                "OK"
            );
    } catch (err) {
        res.status(500)
            .send(`ERROR getting convos ${err}`);
    }
}

exports.getHistory = async function (req, res) {
    const code = req.query.code;
    const location = req.query.location;
    let history
    let countDownHistory
    let result = {}
    try {
        history = await pakNsave.getConnectedProductHistory(location, code)
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
    result["countdown"] = {}
    result["countdown"]["date"] = countDownDateList
    result["countdown"]["price"] = countDownPriceList
    result["countdown"]["name"] = cdFinalRow['name']
    result["countdown"]["brand"] = cdFinalRow['brand']
    result["countdown"]["salePrice"] = parseFloat(cdFinalRow['salePrice'])
    result["countdown"]["origPrice"] = parseFloat(cdFinalRow['origPrice'])
    result["countdown"]["volSize"] = cdFinalRow['volSize']

    result['paknsave'] = Object.values(item);

    res.status(200)
        .json({
            dates : Array.from(set),
            result
            }
        );
}

