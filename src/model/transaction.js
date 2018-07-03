const bcrypto = require('../util/crypto.js');
const ecdsa = require('../util/ecdsa.js');
const ECSignature = require('../util/ecsignature');

// Transaction
// =============================================================================

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Mongodb Object Model
// =============================================================================

let TransactionSchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    hash: {
        type: Buffer,
        required: true
    },
    senderPubKey: {
        type: Object,
        required: true
    },
    receiverPubKey: {
        type: Object,
        required: true
    },
    sig: {
        type: Object,
        required: true
    },
    inputs: {
        type: [Buffer], // Hash of input tx
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
});

// Transaction Class
// =============================================================================
class TransactionClass {

    // Virtual object Properties
    // =============================================================================

    // Methods
    // =============================================================================

    validateTransactionSig() {
        let valid = true;
        valid = ecdsa.verify(this.hash, this.sig, this.senderPubKey);
        return valid;
    }

    validateTransactionData() {
        let valid = true;
        // TODO: Check that outputs >= inputs
        return valid;
    }

    signTransaction(privateKey) {
        let success = true;
        try {
            this.sig = ecdsa.sign(this.hash, privateKey);
        } catch (err) {
            if (err) {
                throw new Error('signTransaction ecdsa.sign Error: ' + err);
                return;
            }
        }
        return success;
    }

    __byteLength() {
        return (
            (4) +                     // senderPubKey
            (4) +                     // receiverPubKey
            (4) +                     // sig
            (this.inputs.length) +
            this.inputs.reduce(function (sum, input) { return sum + 16 + 32; }, 0) +
            (4)                       // amount
        );
    }

    __toBuffer(buffer, initialOffset) {
        if (!buffer) buffer = Buffer.allocUnsafe(this.__byteLength(this));

        let offset = initialOffset || 0;
        function writeSlice(slice) {
            offset += slice.copy(buffer, offset);
        }
        function writeUInt8(i) {
            offset = buffer.writeUInt8(i, offset);
        }
        function writeUInt32(i) {
            offset = buffer.writeUInt32LE(i, offset);
        }
        function writeInt32(i) {
            offset = buffer.writeInt32LE(i, offset);
        }
        function writeUInt64(i) {
            offset = bufferutils.writeUInt64LE(buffer, i, offset);
        }
        function writeVarInt(i) {
            varuint.encode(i, buffer, offset);
            offset += varuint.encode.bytes;
        }
        function writeVarSlice(slice) { writeVarInt(slice.length); writeSlice(slice); }
        function writeVector(vector) { writeVarInt(vector.length); vector.forEach(writeVarSlice); }

        writeInt32(this.senderPubKey);
        writeInt32(this.receiverPubKey);
        writeInt32(this.sig);

        this.inputs.forEach(function (txIn) {
            writeSlice(txIn.hash);
            writeInt32(this.senderPubKey);
            writeInt32(this.receiverPubKey);
            writeInt32(this.sig);
            writeInt32(this.amount);
        });

        writeInt32(this.amount);

        // avoid slicing unless necessary
        if (initialOffset !== undefined)
            return buffer.slice(initialOffset, offset);
        return buffer;
    }

    validateTransactionHash() {
        return true;
    }
    
    calculateTransactionHash() {
        this.hash = bcrypto.hash256(this.__toBuffer(undefined, undefined));
    }
}

TransactionSchema.pre('validate', (next) => {
    if (!this.validateTransactionSig())
        this.invalidate('sig', new Error('Invalid transaction signature'));
    this.validateTransactionData();
    next();
});

TransactionSchema.pre('save', (next) => {
    this.calculateTransactionHash();
    next();
});
  
TransactionSchema.loadClass(TransactionClass);

// Module Exports
// =============================================================================

module.exports = mongoose.model('Transaction', TransactionSchema);
