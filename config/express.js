const express = require('express'),
    bodyParser = require('body-parser');

module.exports = function() {
    const app = express();

    app.use(bodyParser.json());
    app.use(function(req,res,next){
        res.header("Access-Control-Allow-Origin","*");
        res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept");
        res.header("Access-Control-Allow-Methods","GET, POST, PUT, DELETE");
        next();
    });

    require('../app/routes/pakNsave.server.routes.js')(app);
    require('../app/routes/countdown.server.routes.js')(app);

    return app;
}
