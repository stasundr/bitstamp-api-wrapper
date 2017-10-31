const _ = require('lodash');
const Promise = require('bluebird');
const request = require('superagent');
const log = require('intel').getLogger('BitstampTicker');

module.exports = {
    async getCurrentPrice(symbol) {
        // https://www.bitstamp.net/api/v2/ticker/{currency_pair}/
        // currency_pair: btcusd, btceur, eurusd, xrpusd, xrpeur, xrpbtc, ltcusd, ltceur, ltcbtc, ethusd, etheur, ethbtc

        const base = 'https://www.bitstamp.net/api/v2/ticker';
        return new Promise((resolve, reject) => {
            request.get(`${base}/${symbol}`).end((err, res) => {
                if (err) {
                    log.error(err);
                    log.info(res);

                    reject(err);
                }

                if (!res || !res.body) {
                    reject(new Error('invalid response from bitstamp v2/ticker'));
                }

                if (!_.isFinite(res.body.last)) {
                    reject(new Error('invalid price from bitstamp v2/ticker'));
                }

                const price = parseFloat(res.body.last);

                resolve(price);
            });
        });
    },
};
