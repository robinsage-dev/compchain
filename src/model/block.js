const mongoose = require('mongoose');
const Transaction = require('./transaction');
const bcrypto = require('../util/crypto.js');
const varuint = require('varuint-bitcoin');
const merkle = require('merkle');

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
    timestamp: Number,
    transactions: {
        type: [Transaction.schema],
        required: true
    }
});

// Transaction Class
// =============================================================================
class BlockClass {
    // TODO: add constructor

    __byteLength() {
        return (
            32 + // prevBlockHash
            32 + // merkleRoot
            32 + // difficultyTarget
            4 + // nonce
            4 // timestamp
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
        function writeVarSlice(slice) {
            writeVarInt(slice.length);
            writeSlice(slice);
        }
        function writeVector(vector) {
            writeVarInt(vector.length);
            vector.forEach(writeVarSlice);
        }

        writeSlice(this.prevBlockHash);
        writeSlice(this.merkleRoot);

        writeSlice(this.difficultyTarget);
        writeInt32(this.nonce);
        writeInt32(this.timestamp);

        // avoid slicing unless necessary
        if (initialOffset !== undefined)
            return buffer.slice(initialOffset, offset);
        return buffer;
    }

    calculateMerkleRoot() {
        // if (this.transactions.length === 0) {
        //     throw {
        //         code: 1,
        //         description: 'Cannot compute merkle root for zero transactions'
        //     };
        // }
        // if (this.transactions.length % 2 != 0) {
        //     throw {
        //         code: 2,
        //         description:
        //             'Cannot have odd number of transactions for merkle root'
        //     };
        // }
        let transactionHashes = this.transactions.map(tx => {
            tx.calculateTransactionHash();
            return tx.hash;
        });

        // NOTE: This implementation does not have the same problems as Bitcoin's
        this.merkleRoot = merkle('sha256').sync(transactionHashes); // Should probably use hash256
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
            // TODO: Make a specific check for the coinbase transaction. Must have the proper format and be equal to consensus value for output value.
            // TODO: create a transaction instance, and validation will happen upon creation
        }
        return true;
    }

    validateTimestamp() {
        return true;
    }

    toString() {
        let printableBlock = {
            hash: this.hash.toString('hex'),
            prevBlockHash: this.prevBlockHash.toString('hex'),
            merkleRoot: this.merkleRoot.toString('hex'),
            difficultyTarget: this.difficultyTarget.toString('hex'),
            nonce: this.nonce,
            transactions: this.transactions.map(tx => tx.toPrintableObject())
        };
        return JSON.stringify(printableBlock, null, 2);
    }
}

BlockSchema.loadClass(BlockClass);

// Do validation checks as API hooks
BlockSchema.pre('validate', function (next) {
    if (!this.validateBlockHash())
        this.invalidate('hash', new Error('Invalid block hash'));
    if (!this.validatePrevBlockHash())
        this.invalidate('prevBlockHash', new Error('Invalid previous block hash'));
    if (!this.validateMerkleRoot())
        this.invalidate('merkleRoot', new Error('Invalid block merkle root'));
    if (!this.validateDiffTarget())
        this.invalidate('diffTarget', new Error('Invalid block difficulty target'));
    if (!this.validateTransactions())
        this.invalidate('transactions', new Error('Invalid block transactions'));
    if (!this.validateTimestamp())
        this.invalidate('timestamp', new Error('Invalid timestamp'));
    next();
});

// BlockSchema.pre('save', (next) => {
//     next();
// });

BlockSchema.post('save', function () {
    // delete the txs from the mempool (mongo collection) if there were included in the block
    // FIXME: This aint working. Need to figure out how to iterate over the transactions
    for (let tx in this.transactions) {
        if (this.transactions.hasOwnProperty(tx)) {
            // http://mongoosejs.com/docs/api.html#findbyidanddelete_findByIdAndDelete
            let query = {hash: tx.hash};
            Transaction.findOneAndDelete(query, (err, transaction) => {
                if (err) {
                    throw err;
                }
                console.log(
                    `Transaction deleted from mempool since it was mined: ${
                        transaction.hash
                    }`
                );
            });
        }
    }
});

module.exports = mongoose.model('Block', BlockSchema);
