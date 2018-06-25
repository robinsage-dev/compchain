const bcrypto = require('./crypto.js');
const ecdsa = require('./ecdsa.js');
// const varuint = require('varuint-bitcoin');

function Transaction(senderPubKey, receiverPubKey, sig, amount) {
    // typeforce(
    //     types.tuple(
    //         types.Buffer,
    //         types.Buffer,
    //         types.Buffer,
    //         types.Satoshi
    //     ),
    //     arguments
    // )
    this.senderPubKey = senderPubKey;
    this.receiverPubKey = receiverPubKey;
    this.sig = sig;
    this.inputs = [];
    this.amount = amount;
}

Transaction.prototype.addInput = function (hash) {
    // typeforce(types.tuple(
    //     types.Hash256bit,
    // ), arguments)

    // Add the input and return the input's index
    return (
        this.inputs.push({
            hash: hash
        })
    )
}

Transaction.prototype.validateTransactionSig = function () {
    let valid = true;
    valid = ecdsa.verify(this.getTransactionHash(), this.sig, this.senderPubKey);
    return valid;
}

Transaction.prototype.validateTransactionData = function () {
    let valid = true;
    // TODO: Check that outputs >= inputs
    return valid;
}

Transaction.prototype.signTransaction = function (privateKey) {
    let success = true;
    try {
        this.sig = ecdsa.sign(this.getTransactionHash(), privateKey);
    } catch(err) {
        if (err) {
            throw new Error('signTransaction Error: ' + err);
            return;
        }
    }
    return success;
}

Transaction.prototype.__byteLength = function () {
    return (
        (4) +                     // senderPubKey
        (4) +                     // receiverPubKey
        (4) +                     // sig
        (this.inputs.length) +
        this.inputs.reduce(function (sum, input) { return sum + 16 + 32 }, 0) +
        (4)                       // amount
    )
}

Transaction.prototype.__toBuffer = function (buffer, initialOffset) {
    if (!buffer) buffer = Buffer.allocUnsafe(this.__byteLength());

    var offset = initialOffset || 0;
    function writeSlice(slice) { offset += slice.copy(buffer, offset); }
    function writeUInt8(i) { offset = buffer.writeUInt8(i, offset); }
    function writeUInt32(i) { offset = buffer.writeUInt32LE(i, offset); }
    function writeInt32(i) { offset = buffer.writeInt32LE(i, offset); }
    function writeUInt64(i) { offset = bufferutils.writeUInt64LE(buffer, i, offset); }
    // function writeVarInt(i) {
    //     varuint.encode(i, buffer, offset);
    //     offset += varuint.encode.bytes;
    // }
    // function writeVarSlice(slice) { writeVarInt(slice.length); writeSlice(slice); }
    // function writeVector(vector) { writeVarInt(vector.length); vector.forEach(writeVarSlice); }

    writeInt32(this.senderPubKey);
    writeInt32(this.receiverPubKey);
    writeInt32(this.sig);

    this.inputs.forEach(function (txIn) {
        writeSlice(txIn.hash);
        writeInt32(this.senderPubKey);
        writeInt32(this.receiverPubKey);
        writeInt32(this.sig);
        writeInt32(this.amount);
    })

    writeInt32(this.amount);

    // avoid slicing unless necessary
    if (initialOffset !== undefined) return buffer.slice(initialOffset, offset);
    return buffer;
}

Transaction.prototype.getTransactionHash = function () {
    return bcrypto.hash256(this.__toBuffer(undefined, undefined));
}

module.exports = Transaction;
