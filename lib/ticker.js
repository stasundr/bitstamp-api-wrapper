const _ = require('lodash');
const Promise = require('bluebird');
const request = require('superagent');
const log = require('intel').getLogger('BitstampTicker');
const _c = require('./consts');

module.exports = {
    async getCurrentPrice(currencyPair = _c.SYMBOL_BTCUSD) {
        // https://www.bitstamp.net/api/v2/ticker/{currency_pair}/

        const base = 'https://www.bitstamp.net/api/v2/ticker';
        return new Promise((resolve, reject) => {
            request.get(`${base}/${currencyPair}`).end((err, res) => {
                if (err) {
                    log.error(err);
                    log.info(res);

                    reject(err);
                }

                if (!res || !res.body) {
                    reject(new Error('invalid response from bitstamp v2/ticker'));
                }

                const price = parseFloat(res.body.last);
                if (!_.isFinite(price)) {
                    reject(new Error('invalid price from bitstamp v2/ticker'));
                }

                resolve(price);
            });
        });
    },
};
