// Block
// =============================================================================

const mongoose = require('mongoose');
const validation = require('../util/validation');

const Schema = mongoose.Schema;

let BlockSchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    hash: {
        type: String,
        validate: validation.validateBlockHash,
        required: true
    },
    prevBlockHash: {
        type: String,
        validate: validation.validatePrevBlockHash,
        required: true
    },
    merkleRoot: {
        type: String,
        validate: validation.validateMerkleRoot,
        required: true
    },
    difficultyTarget: {
        type: Number,
        validate: validation.validateDiffTarget,
        required: true
    },
    nonce: Number,
    transactions: {
        type: [Schema.Types.ObjectId],
        validate: validation.validateTransactions,
        required: true
    }
})

module.exports = mongoose.model('Block', BlockSchema);