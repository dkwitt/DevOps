const keys = require('./keys');

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const redis = require('redis');
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort
});

const { Pool } = require('pg');
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
});

pgClient.on('error', () => console.log('No connection to PG DB'));

pgClient.query('CREATE TABLE IF NOT EXISTS results(number INT)').catch(err => console.log(err));

console.log(keys);

app.get('/', (req, resp) => {
  resp.send('Hello world!');
});

app.get("/:num1/:num2", (req, resp) => {
    const numberToGCD1 = req.params.num1;
    const numberToGCD2 = req.params.num2;
    const parsedCacheValue = numberToGCD1 + ',' + numberToGCD2;

    console.log("New request with numbers: " + numberToGCD1 + " and " + numberToGCD2);

    redisClient.get(parsedCacheValue, (err, cachedValue) => {
        if (!cachedValue) {
            const result = GCD(numberToGCD1, numberToGCD2);
            redisClient.set(parsedCacheValue, parseInt(result));
            resp.send('GCD of ' + numberToGCD1 + ' and ' + numberToGCD2 + ' is: ' + result);
        } else {
            resp.send('Cached GCD of ' + numberToGCD1 + ' and ' + numberToGCD2 + ' is: ' + cachedValue);
        }
    });
});

const GCD = (a, b) => {
    if (!b) {
        return a;
    }

    return GCD(b, a % b);
}

app.listen(8080, err => {
  console.log('Server listening on port 8080');
});
