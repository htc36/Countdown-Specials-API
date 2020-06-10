const db = require('./config/db'),
    express = require('./config/express');
const app = express();

// Connect to MySQL on start
async function main() {
    try {
        await db.connect();
        app.listen(process.env.PORT_OUT, function () {
            console.log('Listening on port: ' + process.env.PORT_OUT);
        });
    } catch (err) {
        console.log(err);
        console.log('Unable to connect to MySQL.');
        process.exit(1);
    }
}

main().catch(err => console.log(err));