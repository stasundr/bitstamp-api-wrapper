const Promise = require('bluebird');
const request = require('superagent');
const log = require('intel').getLogger('BitstampTransactions');
const _c = require('./consts');

module.exports = {
    async list(currencyPair = _c.SYMBOL_BTCUSD, time) {
        // https://www.bitstamp.net/api/v2/transactions/{currency_pair}/

        const base = 'https://www.bitstamp.net/api/v2/transactions';

        let url = `${base}/${currencyPair}`;
        if (time) {
            url = `${url}?time=${time}`;
        }

        return new Promise((resolve, reject) => {
            request.get(url).end((err, res) => {
                if (err) {
                    log.error(err);
                    log.info(res);

                    reject(err);
                }

                if (!res || !res.body) {
                    reject(new Error('invalid response from bitstamp v2/transactions'));
                }

                const transactions = res.body;

                resolve(transactions);
            });
        });
    },
};
