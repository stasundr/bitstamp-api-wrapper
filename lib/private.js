const Promise = require('bluebird');
const request = require('superagent');
const log = require('intel').getLogger('BitstampPrivateFunctions');
const _c = require('./consts');

const Private = {
    async balance(currencyPair = _c.SYMBOL_BTCUSD) {
        // https://www.bitstamp.net/api/v2/balance/{currency_pair}/

        const base = 'https://www.bitstamp.net/api/v2/balance';
        return new Promise((resolve, reject) => {
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

                    if (!res || !res.body) {
                        reject(new Error('invalid response from bitstamp v2/balance'));
                    }

                    resolve(res.body);
                });
        });
    },

    async userTransactions(currencyPair = _c.SYMBOL_BTCUSD, offset = 0, limit = 100) {
        // https://www.bitstamp.net/api/v2/user_transactions/{currency_pair}/

        const base = 'https://www.bitstamp.net/api/v2/user_transactions/';
        return new Promise((resolve, reject) => {
            request
                .post(`${base}/${currencyPair}`)
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .set('Accept', 'application/json')
                .send(this.signature.signBody({ offset, limit }))
                .end((err, res) => {
                    if (err) {
                        log.error(err);
                        log.info(res);

                        reject(err);
                    }

                    if (!res || !res.body) {
                        reject(new Error('invalid response from bitstamp v2/user_transactions'));
                    }

                    resolve(res.body);
                });
        });
    },
};

module.exports = Private;
