const convo = require('../controllers/pakNsave.server.controller');


module.exports = function(app) {
    app.route('/getProduct')
        .get(convo.getSingleProduct)
    app.route('/linkProducts')
        .post(convo.linkProducts)
    app.route('/api/pakNsave/getProducts')
        .get(convo.getProducts)
    app.route('/api/pakNsave/getSingleLinkedProductHistory')
        .get(convo.getHistory)
};
