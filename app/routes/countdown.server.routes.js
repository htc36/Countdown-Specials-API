const countdown = require('../controllers/countdown.server.controller');


module.exports = function(app) {
    app.route('/api/countdown/getProducts')
        .get(countdown.getProducts)
    app.route('/api/getDates')
        .get(countdown.getDates)
    app.route('/api/getTypes')
        .get(countdown.getTypes)
    app.route('/api/getHistory')
        .get(countdown.getPreviousPrices)
    app.route('/api/countdown/getSingleProduct')
        .get(countdown.getSingleProduct)
    app.route('/api/countdown/getHistory')
        .get(countdown.getHistory)
};
