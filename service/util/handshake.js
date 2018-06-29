
const bcrypto = require('./crypto.js');
const ecdsa = require('./ecdsa.js');
const varuint = require('varuint-bitcoin');

function Handshake(pubKey1, pubKey2, sig1, sig2, handshakeData) {
    // TODO: add typeforce checks
    this.pubKey1 = pubKey1;
    this.pubKey2 = pubKey2;
    this.sig1 = sig1;
    this.sig2 = sig2;
    this.handshakeData = handshakeData; // This could be a side chain pubkey encrypted by the main chain pubkey or it could be additional data/contract agreed to by both parties
}

Handshake.prototype.addHandshakeData = function (handshakeDataStr) {
    // TODO: Force string type

    var bytes = []; // char codes
    // Parse string to bytes
    for (var i = 0; i < handshakeDataStr.length; ++i) {
        var code = handshakeDataStr.charCodeAt(i);
        bytes = bytes.concat([code & 0xff, code / 256 >>> 0]);
    }

    // Add the input and return the input's index
    return (
        this.handshakeData = bytes
    )
}

Handshake.prototype.validateHandshakeSig = function (handshake) {
    valid1, valid2 = true;
    valid1 = ecdsa.verify(this.getHandshakeHash(), this.sig1, this.pubKey1);
    valid2 = ecdsa.verify(this.getHandshakeHash(), this.sig2, this.pubKey2);
    return valid1 && valid2;
}

Handshake.prototype.validateHandshakeData = function (handshake) {
    valid = true;
    // TODO: Check that outputs >= inputs
    return valid;
}

// TODO: implement multisig
// Handshake.prototype.signHandshake = function (privateKey) {
//     let success = true;
//     try {
//         this.sig1 = ecdsa.sign(this.getHandshakeHash(), privateKey);
//         this.sig2 = ecdsa.sign(this.getHandshakeHash(), privateKey);
//     } catch(err) {
//         if (err) {
//             throw new Error('signHandshake Error: ' + err);
//             return;
//         }
//     }
//     return success;
// }

Handshake.prototype.__toBuffer = function (buffer, initialOffset) {
    if (!buffer) buffer = Buffer.allocUnsafe(this.__byteLength());

    var offset = initialOffset || 0;
    function writeSlice(slice) { offset += slice.copy(buffer, offset); }
    function writeUInt8(i) { offset = buffer.writeUInt8(i, offset); }
    function writeUInt32(i) { offset = buffer.writeUInt32LE(i, offset); }
    function writeInt32(i) { offset = buffer.writeInt32LE(i, offset); }
    function writeUInt64(i) { offset = bufferutils.writeUInt64LE(buffer, i, offset); }
    function writeVarInt(i) {
        varuint.encode(i, buffer, offset);
        offset += varuint.encode.bytes;
    }
    function writeVarSlice(slice) { writeVarInt(slice.length); writeSlice(slice); }
    function writeVector(vector) { writeVarInt(vector.length); vector.forEach(writeVarSlice); }

    writeInt32(this.pubKey1);
    writeInt32(this.pubKey2);
    writeInt32(this.sig1);
    writeInt32(this.sig2);
    writeVector(this.handshakeData);

    // avoid slicing unless necessary
    if (initialOffset !== undefined) return buffer.slice(initialOffset, offset);
    return buffer;
}

Handshake.prototype.getHandshakeHash = function () {
    return bcrypto.hash256(this.__toBuffer(undefined, undefined));
}

module.exports = Handshake;
