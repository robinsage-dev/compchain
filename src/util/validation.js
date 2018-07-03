const Transaction = require('../model/transaction');

validateBlockHash = function (block) {
    // TODO: hash the block and verify
    return true;
};

validatePrevBlockHash = function (block) {
    // TODO: Search database for block with matching hash
    return true;
};

validateMerkleRoot = function (block) {
    // TODO: create the merkle root from the transactions and make sure it matches
    return true;
};

validateDiffTarget = function (block) {
    // TODO: make sure the block hash is less than the diff target
    // TODO: make sure the diff target is valid
    return true;
};

validateTransactions = function (block) {
    // TODO: validate transaction format
    // TODO: validate transaction inputs
    // TODO: validate transaction outputs
    // TODO: validate transaction signatures
    for (let transaction of block.transactions) {
        let sigValid = transaction.validateTransactionSig();
        if (!sigValid) {
            console.error(new Error('Transaction signature invalid: ' + JSON.stringify(transaction, null, 2)));
            return false;
        }
    }
    return true;
};

module.exports = {
    validateBlockHash: validateBlockHash,
    validateDiffTarget: validateDiffTarget,
    validateMerkleRoot: validateMerkleRoot,
    validatePrevBlockHash: validatePrevBlockHash,
    validateTransactions: validateTransactions
};
