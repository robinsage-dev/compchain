const ecurve = require('ecurve');
const randomBytes = require('randombytes');
const BigInteger = require('bigi');
let ecdsa = require('./ecdsa');
const secp256k1 = ecdsa.__curve;

function ECPair(d, Q, options) {
    // if (options) {
    //     typeforce({
    //         compressed: types.maybe(types.Boolean),
    //         network: types.maybe(types.Network)
    //     }, options)
    // }

    options = options || {};

    if (d) {
        if (d.signum() <= 0) throw new Error('Private key must be greater than 0');
        if (d.compareTo(secp256k1.n) >= 0) throw new Error('Private key must be less than the curve order');
        if (Q) throw new TypeError('Unexpected publicKey parameter');

        this.d = d;
    } else {
        // typeforce(types.ECPoint, Q)

        this.__Q = Q;
    }

    this.compressed = options.compressed === undefined ? true : options.compressed;
    // this.network = options.network || NETWORKS.bitcoin
}

Object.defineProperty(ECPair.prototype, 'Q', {
    get: function () {
        if (!this.__Q && this.d) {
            this.__Q = secp256k1.G.multiply(this.d);
        }

        return this.__Q;
    }
});

ECPair.makeRandom = function (options) {
    options = options || {};

    let randNumGen = options.rng || randomBytes;

    let d;
    do {
        let buffer = randNumGen(32);
        // typeforce(types.Buffer256bit, buffer)
        d = BigInteger.fromBuffer(buffer);
    } while (d.signum() <= 0 || d.compareTo(secp256k1.n) >= 0);

    return new ECPair(d, null, options);
};

ECPair.fromBuffer = function (buff, options) {
    options = options || {};

    let d = BigInteger.fromBuffer(buff);
    if (!(d.signum() <= 0 || d.compareTo(secp256k1.n) >= 0)) {
        return new ECPair(d, null, options);
    } 
    throw new Error('The buffer does not meet standards, try again');
    return;
    
};

ECPair.prototype.getPublicKeyBuffer = function () {
    return this.Q.getEncoded(this.compressed);
};

module.exports = ECPair;
