# bitstamp-api-wrapper

Необходимо сообщить вашему node-процессу переменные окружения, перечисленные в `.env.example`.

```
const Bitstamp = require('bitstamp-api-wrapper');

const bitstamp = new Bitstamp();

...
const ticker = await bitstamp.ticker();
const currentPrice = await bitstamp.getCurrentPrice();
const myBalance = await bitstamp.balance();
...

bitstamp.close();
```