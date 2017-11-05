const Promise = require('bluebird');
const request = require('superagent');
const log = require('intel').getLogger('BitstampPrivate');
const _c = require('./consts');
const Signature = require('./signature');

// 600 requests max per 10 minutes
const MAX_CALL_WINDOW = 60 * 1000; // 10 minutes
const MAX_CALLS_PER_WINDOW = 60;

const Private = {
    async balance(currencyPair = _c.SYMBOL_BTCUSD) {
        // https://www.bitstamp.net/api/v2/balance/{currency_pair}/

        const base = 'https://www.bitstamp.net/api/v2/balance';
        return new Promise((resolve, reject) => {
            this.totalCallsMade++;
            this.callsInLastMinute++;

            if (this.callsInLastMinute >= MAX_CALLS_PER_WINDOW) {
                reject(new Error(`Must not exceed ${MAX_CALLS_PER_WINDOW} calls per ${MAX_CALL_WINDOW} ms.`));
            }

            request
                .post(`${base}/${currencyPair}`)
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .set('Accept', 'application/json')
                .send(this.signature.signBody())
                .end((err, res) => {
                    if (err) {
                        log.error(err);
                        log.info(res);

                        reject(err);
                    }

                    this.lastCall = Date.now();

                    if (!res || !res.body) {
                        reject(new Error('invalid response from bitstamp v2/balance'));
                    }

                    resolve(res.body);
                });
        });
    },
};

module.exports = Private;
