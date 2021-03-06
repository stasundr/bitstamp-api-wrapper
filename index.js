const log = require('intel').getLogger('Bitstamp')
const Signature = require('./lib/signature')
const Ticker = require('./lib/ticker')
const Transactions = require('./lib/transactions')
const Private = require('./lib/private')

// 600 requests max per 10 minutes
const MAX_CALL_WINDOW = 60 * 1000 // 10 minutes
const MAX_CALLS_PER_WINDOW = 60

class Bitstamp {
  constructor(key, secret, clientId) {
    this.callsInLastMinute = 0
    this.signature = new Signature(key, secret, clientId)

    this._intv = setInterval(() => {
      this.callsInLastMinute = 0
    }, MAX_CALL_WINDOW)
  }

  _registerCall() {
    this.callsInLastMinute++

    if (this.callsInLastMinute >= MAX_CALLS_PER_WINDOW) {
      log.error(new Error(`Must not exceed ${MAX_CALLS_PER_WINDOW} calls per ${MAX_CALL_WINDOW} ms.`))
    }
  }

  close() {
    if (this._intv) {
      clearInterval(this._intv)
    }
  }

  // PUBLIC DATA FUNCTIONS
  async ticker(currencyPair) {
    this._registerCall()
    return await Ticker.ticker(currencyPair)
  }

  async getCurrentPrice(currencyPair) {
    this._registerCall()
    return await Ticker.getCurrentPrice(currencyPair)
  }

  async transactions(currencyPair, time) {
    this._registerCall()
    return await Transactions.list(currencyPair, time)
  }

  // PRIVATE FUNCTIONS
  async balance(currencyPair) {
    this._registerCall()
    return await Private.balance.bind(this)(currencyPair)
  }

  async userTransactions(currencyPair, offset, limit) {
    this._registerCall()
    return await Private.userTransactions.bind(this)(currencyPair, offset, limit)
  }
}

module.exports = Bitstamp
