const Promise = require('bluebird');
const request = require('superagent');
const log = require('intel').getLogger('Bitstamp');
const Signature = require('./lib/signature');
const Ticker = require('./lib/ticker');
const Transactions = require('./lib/transactions');

// 600 requests max per 10 minutes
const MAX_CALL_WINDOW = 60 * 1000; // 10 minutes
const MAX_CALLS_PER_WINDOW = 60;

class Bitstamp {
    constructor() {
        this.totalCallsMade = 0;
        this.callsInLastMinute = 0;
        this.lastCall = null;
        this.signature = new Signature();

        this._intv = setInterval(() => {
            this.callsInLastMinute = 0;
        }, MAX_CALL_WINDOW);
    }

    // PUBLIC DATA FUNCTIONS
    async ticker(currencyPair) {
        return await Ticker.ticker(currencyPair);
    }

    async getCurrentPrice(currencyPair) {
        return await Ticker.getCurrentPrice(currencyPair);
    }

    // PRIVATE FUNCTIONS
}

module.exports = Bitstamp;
