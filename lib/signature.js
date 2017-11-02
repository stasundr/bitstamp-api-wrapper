const crypto = require('crypto');
const querystring = require('querystring');
const env = require('dotenv-safe');
const log = require('intel').getLogger('BitstampSignature');

env.config();

class Signature {
    constructor() {
        this.key = process.env.BITSTAMP_API_KEY;
        this.secret = process.env.BITSTAMP_SECRET;
        this.clientId = process.env.BITSTAMP_CLIENT_ID;

        this.nonceIncr = null;
        this.last = null;
    }

    generateNonce() {
        const now = Date.now();

        // Prevent the same nonce during multiple requests in the same ms
        if (now !== this.last) {
            this.nonceIncr = -1;
        }

        this.last = now;
        this.nonceIncr++;

        const paddedIncr = `00000${this.nonceIncr}`.slice(-5);
        const nonce = `${now}${paddedIncr}`;

        return nonce;
    }

    createSignature() {
        // https://www.bitstamp.net/api/
        // Signature is a HMAC-SHA256 encoded message containing nonce, customer ID and API key.
        // The HMAC-SHA256 code must be generated using a secret key that was generated with your API key.
        // This code must be converted to it's hexadecimal representation (64 uppercase characters).

        const nonce = this.generateNonce();
        const message = `${nonce}${this.clientId}${this.key}`;
        const signer = crypto.createHmac('sha256', new Buffer(this.secret, 'utf8'));
        const signature = signer
            .update(message)
            .digest('hex')
            .toUpperCase();

        return { signature, nonce };
    }

    signBody(body = {}) {
        if (typeof body !== 'object') {
            log.error(new Error('body must be a key/value object.'));
            log.info(body);
        }

        const { signature, nonce } = this.createSignature();

        const signedBody = Object.assign({}, body, {
            key: this.key,
            signature,
            nonce,
        });

        const cleanSignedBody = Object.keys(signedBody).reduce((result, key) => {
            if (typeof signedBody[key] !== 'undefined' && signedBody[key] !== null) {
                result[key] = signedBody[key];
            }

            return result;
        }, {});

        return querystring.stringify(cleanSignedBody);
    }
}

module.exports = Signature;
