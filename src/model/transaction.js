const bcrypto = require('../util/crypto.js');
const ecdsa = require('../util/ecdsa.js');
const ECSignature = require('../util/ecsignature');
const ecurve = require('ecurve');
const secp256k1 = ecurve.getCurveByName('secp256k1');

// Transaction - See docs/Transaction.md
// =============================================================================

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Mongodb Object Model
// =============================================================================

let TransactionSchema = new Schema({
    hash: {                 // 32 bytes (256 bit hash)
        type: Buffer,
        required: true,
        index: true,
        unique: true
    },
    senderPubKey: {         // Compressed form: 32 bytes + 1 for sign = 33 bytes
        type: Buffer,
        required: true
    },
    receiverPubKey: {       // Compressed form: 32 bytes + 1 for sign = 33 bytes
        type: Buffer,
        required: true
    },
    sig: {                  // 64 Bytes (point on eliptic curve 32B x, 32B y)
        type: Buffer,
        required: false     // Special case for coinbase tx
    },
    inputs: {               // 32 bytes (256 bit hash)
        type: [Buffer],     // Hash of input tx
        required: true
    },
    amount: {               // 4 bytes (32 bit unsigned int)
        type: Number,
        required: true
    },
    blockHeight: {          // 4 bytes (32 bit unsigned int)
        type: Number,
        required: true
    }
});

// Transaction Class
// =============================================================================
class TransactionClass {

    get senderPubKeyPoint() {
        return ecurve.Point.decodeFrom(secp256k1, this.senderPubKey);
    }

    get receiverPubKeyPoint() {
        return ecurve.Point.decodeFrom(secp256k1, this.receiverPubKey);
    }

    // Methods
    // =============================================================================

    // FIXME: This doesn't seem to be working: Node thing?
    // constructor(senderPubKey, receiverPubKey, sig, inputs, amount, timestamp) {
    //     this.senderPubKey = senderPubKey;
    //     this.receiverPubKey = receiverPubKey;
    //     this.sig = sig;
    //     this.inputs = inputs;
    //     this.amount = amount;
    //     this.timestamp = timestamp; // TODO: default Date.now() is more than 32 bits!
    //     this.calculateTransactionHash();
    // }

    __byteLength() {
        return (
            (33) +                     // senderPubKey 33B
            (33) +                     // receiverPubKey 33B
            this.inputs.reduce(function (sum, input) { return sum + 32; }, 0) +
            (4)  +                     // amount
            (4)                        // block height
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

        writeSlice(this.senderPubKey);
        writeSlice(this.receiverPubKey);

        this.inputs.forEach(function (txIn) {
            writeSlice(txIn);
        });

        writeInt32(this.amount);
        writeInt32(this.blockHeight);

        // avoid slicing unless necessary
        if (initialOffset !== undefined)
            return buffer.slice(initialOffset, offset);
        return buffer;
    }

    calculateTransactionHash() {
        // TODO: Maybe we should double hash this? https://crypto.stackexchange.com/questions/2465/in-which-situations-is-a-length-extension-attack-a-problem
        let buffer;
        try {
            buffer = this.__toBuffer(undefined, undefined);
        } catch (err) {
            console.error(err);
            throw {
                description: '__toBuffer Error',
                error: err
            };
        }
        this.hash = bcrypto.sha256(buffer);
    }

    signTransaction(privateKey) {
        let success = true;
        if (!this.hash) {
            try {
                this.calculateTransactionHash();
            } catch (err) {
                throw {
                    description: 'calculateTransactionHash Error: ',
                    error: err
                };
                return;
            }
        }
        try {
            this.sig = ecdsa.sign(this.hash, privateKey).toRSBuffer(undefined, 0);
        } catch (err) {
            if (err) {
                throw new Error('signTransaction ecdsa.sign Error: ' + err);
                return;
            }
        }
        return success;
    }

    // TODO: refactor validation functions to validation module
    validateTransactionSig() {
        let valid = true;
        // Special case for coinbase transactions (they don't have a sig)
        if (this.senderPubKey.toString('hex') === 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff') return valid;
        if (!this.hash) {
            this.calculateTransactionHash();
        }
        valid = ecdsa.verify(this.hash, ECSignature.fromRSBuffer(this.sig), this.senderPubKeyPoint);
        return valid;
    }
    
    validateInputs() {
        let valid = true;
        // TODO: Search blocks for these inputs, and verify that they are unspent
        return valid;
    }

    validateAmount() {
        let valid = true;
        // TODO: Check that outputs >= inputs
        return valid;
    }

    validateTimestamp() {
        let valid = true;
        // TODO: Check consensus rules for how far in the past and into the future this can be
        return valid;
    }

    toString() {
        let printableTx = {
            hash: this.hash.toString('hex'),
            senderPubKey: this.senderPubKey.toString('hex'),
            receiverPubKey: this.receiverPubKey.toString('hex'),
            sig: this.sig.toString('hex'),
            inputs: this.inputs.map(input => input.toString('hex')),
            amount: this.amount
        };
        return JSON.stringify(printableTx, null, 2);
    }

    toPrintableObject() {
        let printableTx = {
            hash: this.hash.toString('hex'),
            senderPubKey: this.senderPubKey.toString('hex'),
            receiverPubKey: this.receiverPubKey.toString('hex'),
            sig: this.sig.toString('hex'),
            inputs: this.inputs.map(input => input.toString('hex')),
            amount: this.amount
        };
        return printableTx;
    }
}

TransactionSchema.pre('validate', function (next) {
    if (!this.validateTransactionSig())
        this.invalidate('sig', new Error('Invalid transaction signature'));
    if (!this.validateInputs())
        this.invalidate('inputs', new Error('Invalid transaction inputs'));
    if (!this.validateAmount())
        this.invalidate('amount', new Error('Invalid transaction amount'));
    next();
});

TransactionSchema.pre('save', function (next) {
    // this.calculateTransactionHash(); // Note: Might not be necessary here if calculated during validation
    next();
});
  
TransactionSchema.loadClass(TransactionClass);

// Module Exports
// =============================================================================

module.exports = mongoose.model('Transaction', TransactionSchema);
