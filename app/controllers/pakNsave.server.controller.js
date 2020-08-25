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
    try {
        countDownHistory = await countdown.getProductsHistory(code)
    } catch (err) {
        res.status(500)
            .send(`ERROR getting convos ${err}`);
    }
    let countDownDateList = []
    let countDownPriceList = []
    let countDownDate
    for (let index = 0; index < countDownHistory.length; index++) {
        countDownDate = new Date(countDownHistory[index]['date'])
        countDownDateList.push(countDownDate.toLocaleDateString('en-nz'))
        countDownPriceList.push(parseFloat(countDownHistory[index]['salePrice']))
    }
    result["countdown"] = {}
    result["countdown"]["date"] = countDownDateList
    result["countdown"]["price"] = countDownPriceList
    result["countdown"]["name"] = countDownHistory[0]['name']
    result["countdown"]["brand"] = countDownHistory[0]['brand']
    result["countdown"]["salePrice"] = countDownHistory[0]['salePrice']
    result["countdown"]["origPrice"] = countDownHistory[0]['origPrice']
    result["countdown"]["volSize"] = countDownHistory[0]['volSize']
    console.log(result)

    let dateList = []
    let priceList = []
    let date
    var item = {}
    for (let index = 0; index < history.length; index++) {
        date = new Date(history[index]['date'])
        dateList.push(date.toLocaleDateString('en-nz'))
        priceList.push(parseFloat(history[index]['price']))
        if(item.hasOwnProperty(history[index]["productId"])) {
            item[history[index]["productId"]]['date'].push(date.toLocaleDateString('en-nz'))
            item[history[index]["productId"]]['price'].push(history[index]['price'])
        } else {
            item[history[index]["productId"]] = {}
            item[history[index]["productId"]]['date'] = [date.toLocaleDateString('en-nz')]
            item[history[index]["productId"]]['price'] = [history[index]['price']]
            item[history[index]["productId"]]['productId'] = history[index]['productId']
            item[history[index]["productId"]]['name'] = history[index]['name']
            item[history[index]["productId"]]['quantityType'] = history[index]['quantityType']
        }
    }
    const dictValues = Object.values(item);
    result['paknsave'] = dictValues
    res.status(200)
        .send(
            result
       );
}

