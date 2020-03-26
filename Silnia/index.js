const express = require('express');
const redis = require('redis');

const app = express();
const process = require('process');

const client = redis.createClient({
    host: 'redis-server',
    port: 6379
});

client.set('counter', 0);

app.get('/', (req, resp) => {

    //  process.exit(0);

    client.get('counter', (err, counter) => {
        resp.send('Counter: ' + counter);
        client.set('counter', parseInt(counter) + 1);
    });
});

app.get('/silnia/:factorial', (req, resp) => {
    const factorialValue = req.params.factorial;
    if (factorialValue > 9) {
        process.exit(1);
    };

    client.get(factorialValue, (err, result) => {
        if (!result) {
            const countFactorialResult = countFactorial(factorialValue);
            client.set(factorialValue, parseInt(countFactorialResult));
            resp.send('Wynik silni z ' + factorialValue + ' wynosi: ' + countFactorialResult);
        }
        else {
            resp.send('Wynik silni z ' + factorialValue + ' wynosi: ' + result);
        };
    });
});

const countFactorial = (num) => {
    if (num === 0) {
        return 1;
    } else {
        return num * countFactorial(num - 1);
    }
}

app.listen(8080, () => {
    console.log('Server listening on port: 8080');
});