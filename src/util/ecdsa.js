const Buffer = require('safe-buffer').Buffer;
const createHmac = require('create-hmac');
// const typeforce = require('typeforce')
// const types = require('./types')

const BigInteger = require('bigi');
const ECSignature = require('./ecsignature');

const ZERO = Buffer.alloc(1, 0);
const ONE = Buffer.alloc(1, 1);

const ecurve = require('ecurve');
const secp256k1 = ecurve.getCurveByName('secp256k1');

// https://tools.ietf.org/html/rfc6979#section-3.2
function deterministicGenerateK(hash, x, checkSig) {
    // typeforce(types.tuple(
    //   types.Hash256bit,
    //   types.Buffer256bit,
    //   types.Function
    // ), arguments)

    // Step A, ignored as hash already provided
    // Step B
    // Step C
    let k = Buffer.alloc(32, 0);
    let v = Buffer.alloc(32, 1);

    // Step D
    k = createHmac('sha256', k)
        .update(v)
        .update(ZERO)
        .update(x)
        .update(hash)
        .digest();

    // Step E
    v = createHmac('sha256', k).update(v).digest();

    // Step F
    k = createHmac('sha256', k)
        .update(v)
        .update(ONE)
        .update(x)
        .update(hash)
        .digest();

    // Step G
    v = createHmac('sha256', k).update(v).digest();

    // Step H1/H2a, ignored as tlen === qlen (256 bit)
    // Step H2b
    v = createHmac('sha256', k).update(v).digest();

    let T = BigInteger.fromBuffer(v);

    // Step H3, repeat until T is within the interval [1, n - 1] and is suitable for ECDSA
    while (T.signum() <= 0 || T.compareTo(secp256k1.n) >= 0 || !checkSig(T)) {
        k = createHmac('sha256', k)
            .update(v)
            .update(ZERO)
            .digest();

        v = createHmac('sha256', k).update(v).digest();

        // Step H1/H2a, again, ignored as tlen === qlen (256 bit)
        // Step H2b again
        v = createHmac('sha256', k).update(v).digest();
        T = BigInteger.fromBuffer(v);
    }

    return T;
}

let N_OVER_TWO = secp256k1.n.shiftRight(1);

function sign(hash, d) {
//   typeforce(types.tuple(types.Hash256bit, types.BigInt), arguments)

    let x = d.toBuffer(32);
    let e = BigInteger.fromBuffer(hash);
    let n = secp256k1.n;
    let G = secp256k1.G;

    let r, s;
    deterministicGenerateK(hash, x, function (k) {
        let Q = G.multiply(k);

        if (secp256k1.isInfinity(Q)) return false;

        r = Q.affineX.mod(n);
        if (r.signum() === 0) return false;

        s = k.modInverse(n).multiply(e.add(d.multiply(r))).mod(n);
        if (s.signum() === 0) return false;

        return true;
    });

    // enforce low S values, see bip62: 'low s values in signatures'
    if (s.compareTo(N_OVER_TWO) > 0) {
        s = n.subtract(s);
    }

    return new ECSignature(r, s);
}

function verify(hash, signature, Q) {
//   typeforce(types.tuple(
//     types.Hash256bit,
//     types.ECSignature,
//     types.ECPoint
//   ), arguments)

    let n = secp256k1.n;
    let G = secp256k1.G;

    let r = signature.r;
    let s = signature.s;

    // 1.4.1 Enforce r and s are both integers in the interval [1, n − 1]
    if (r.signum() <= 0 || r.compareTo(n) >= 0) return false;
    if (s.signum() <= 0 || s.compareTo(n) >= 0) return false;

    // 1.4.2 H = Hash(M), already done by the user
    // 1.4.3 e = H
    let e = BigInteger.fromBuffer(hash);

    // Compute s^-1
    let sInv = s.modInverse(n);

    // 1.4.4 Compute u1 = es^−1 mod n
    //               u2 = rs^−1 mod n
    let u1 = e.multiply(sInv).mod(n);
    let u2 = r.multiply(sInv).mod(n);

    // 1.4.5 Compute R = (xR, yR)
    //               R = u1G + u2Q
    let R = G.multiplyTwo(u1, Q, u2);

    // 1.4.5 (cont.) Enforce R is not at infinity
    if (secp256k1.isInfinity(R)) return false;

    // 1.4.6 Convert the field element R.x to an integer
    let xR = R.affineX;

    // 1.4.7 Set v = xR mod n
    let v = xR.mod(n);

    // 1.4.8 If v = r, output "valid", and if v != r, output "invalid"
    return v.equals(r);
}

module.exports = {
    deterministicGenerateK: deterministicGenerateK,
    sign: sign,
    verify: verify,

    // TODO: remove
    __curve: secp256k1
};
