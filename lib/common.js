const crypto = require('crypto');
const querystring = require('querystring');
const log = require('intel').getLogger('BitstampCommon');

class Signature {
    constructor(key, secret, clientId) {
        this.key = key;
        this.secret = secret;
        this.clientId = clientId;

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

    compactObject(object = {}) {
        const cleanCopy = Object.keys(object).reduce((result, key) => {
            if (typeof object[key] !== 'undefined' && object[key] !== null) {
                result[key] = object[key];
            }

            return result;
        }, {});

        return cleanCopy;
    }

    signBody(body = {}) {
        if (typeof body !== 'object') {
            log.error(new Error('body must be a key/value object.'));
            log.info(body);
        }

        const { signature, nonce } = this.createSignature();
        const fullBody = Object.assign({}, body, {
            key: this.key,
            signature,
            nonce,
        });
        const signedBody = querystring.stringify(this.compactObject(fullBody));

        return signedBody;
    }
}

module.exports = {
    Signature,
};
