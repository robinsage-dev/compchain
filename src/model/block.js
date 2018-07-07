const mongoose = require('mongoose');
const Transaction = require('./transaction');
const bcrypto = require('../util/crypto.js');
const varuint = require('varuint-bitcoin');
const fastRoot = require('merkle-lib/fastRoot');

// Block - See docs/Block.md
// =============================================================================

const Schema = mongoose.Schema;

// Mongodb Object Model
// =============================================================================

let BlockSchema = new Schema({
    hash: {
        type: Buffer,
        required: true,
        index: true,
        unique: true
    },
    prevBlockHash: {
        type: Buffer,
        required: true
    },
    merkleRoot: {
        type: Buffer,
        required: true
    },
    difficultyTarget: {
        type: Buffer,
        required: true
    },
    nonce: Number,
    transactions: {
        type: [Transaction.schema],
        required: true
    }
});

// Transaction Class
// =============================================================================
class BlockClass {
    
    __byteLength() {
        return (
            (32) +                     // prevBlockHash
            (32) +                     // merkleRoot
            (32) +                     // difficultyTarget
            (4)  +                     // nonce
            this.transactions.reduce(function (sum, transaction) { return sum + transaction.__byteLength() + 64; }, 0)  // 64 is the sig
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

        writeSlice(this.prevBlockHash);
        writeSlice(this.merkleRoot);

        writeSlice(this.difficultyTarget);
        writeInt32(this.nonce);

        this.transactions.forEach(function (tx) {
            writeSlice(tx.__toBuffer());
            writeSlice(tx.sig);
        });

        // avoid slicing unless necessary
        if (initialOffset !== undefined)
            return buffer.slice(initialOffset, offset);
        return buffer;
    }
    
    calculateMerkleRoot() {
        if (this.transactions.length === 0) throw TypeError('Cannot compute merkle root for zero transactions');
        if (this.transactions.length % 2 != 0) throw TypeError('Cannot have odd number of transactions for merkle root');
        let transactionHashes = this.transactions.map(tx => { 
            tx.calculateTransactionHash();
            return tx.hash;
        });
        // NOTE: This has vulnerabilities (2nd pre-image attack and duplicate on odd numbered leaves)
        this.merkleRoot = fastRoot(transactionHashes, bcrypto.sha256); // Should probably use hash256
    }

    calculateBlockHash() {
        this.hash = bcrypto.sha256(this.__toBuffer(undefined, undefined)); // TODO: Should probably use hash256
    }

    validateBlockHash() {
        // TODO: hash the block and verify
        return true;
    }
    
    validatePrevBlockHash() {
        // TODO: Search database for block with matching hash
        return true;
    }
    
    validateMerkleRoot() {
        // TODO: create the merkle root from the transactions and make sure it matches
        return true;
    }
    
    validateDiffTarget() {
        // TODO: make sure the block hash is less than the diff target
        // TODO: make sure the diff target is valid
        return true;
    }

    validateMerkleRoot() {
        return true;
    }
    
    validateTransactions() {
        for (let transaction of this.transactions) {
            // TODO: create a transaction instance, and validation will happen upon creation
        }
        return true;
    }

    toString() {
        let printableBlock = {
            hash: this.hash.toString('hex'),
            prevBlockHash: this.prevBlockHash.toString('hex'),
            merkleRoot: this.merkleRoot.toString('hex'),
            difficultyTarget: this.difficultyTarget.toString('hex'),
            nonce: this.nonce,
            transactions: this.transactions.map(tx => tx.toObject())
        };
        return JSON.stringify(printableBlock, null, 2);
    }
}

BlockSchema.loadClass(BlockClass);

BlockSchema.pre('validate', next => {
    // if (!this.validateBlockHash())
    //     this.invalidate('hash', new Error('Invalid block hash'));
    // if (!this.validateInputs())
    //     this.invalidate('prevBlockHash', new Error('Invalid previous block hash'));
    // if (!this.validateMerkleRoot())
    //     this.invalidate('merkleRoot', new Error('Invalid block merkle root'));
    // if (!this.validateDiffTarget())
    //     this.invalidate('diffTarget', new Error('Invalid block difficulty target'));
    // if (!this.validateTransactions())
    //     this.invalidate('transactions', new Error('Invalid block transactions'));
    next();
});

BlockSchema.pre('save', (next) => {
    next();
});

module.exports = mongoose.model('Block', BlockSchema);
