const Transaction = require('../model/transaction');

function validateGenBlock(block) {
    /*
    Genesis Block: {
        "hash": "0000eca7102e81f8984f3634d2423b4b4291ff72721984d2190285547d45eb44",
        "prevBlockHash": "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        "merkleRoot": "e68b7ae358421586ddf407a4b3f6c3fae45b68732e1e4efaef17d92621db3279",
        "difficultyTarget": "0000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        "nonce": 54790,
        "timestamp": 1531514331,
        "transactions": [
            {
            "hash": "e68b7ae358421586ddf407a4b3f6c3fae45b68732e1e4efaef17d92621db3279",
            "senderPubKey": "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "receiverPubKey": "034724cab475bf1b118020464e81bf9dd18526c7180d85f115a93897b29be37d58",
            "sig": "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "inputs": [
                "f80b755a0b2a5ae930aa89f38c896ee6a8ce0a34c900aeac400104e6b06ef36e"
            ],
            "amount": 10000,
            "blockHeight": 0
            }
        ]
    }
    */
    console.log('Checking genesis block');
    if (block.hash.toString('hex') !== '0000eca7102e81f8984f3634d2423b4b4291ff72721984d2190285547d45eb44') {
        console.error('Genesis Block Validation: Invalid hash');
        return false;
    }
    if (block.prevBlockHash.toString('hex') !== 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff') {
        console.error('Genesis Block Validation: Invalid prevBlockHash');
        return false;
    }
    if (block.merkleRoot.toString('hex') !== 'e68b7ae358421586ddf407a4b3f6c3fae45b68732e1e4efaef17d92621db3279') {
        console.error('Genesis Block Validation: Invalid merkleRoot');
        return false;
    }
    if (block.difficultyTarget.toString('hex') !== '0000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff') {
        console.error('Genesis Block Validation: Invalid difficultyTarget');
        return false;
    }
    if (block.nonce != 54790) {
        console.error('Genesis Block Validation: Invalid nonce');
        return false;
    }
    if (block.timestamp != 1531514331) {
        console.error('Genesis Block Validation: Invalid timestamp');
        return false;
    }

    // Validate coinbase transaction
    if (block.transactions.length != 1) {
        console.error('Genesis Block Coinbase Validation: Invalid number of transactions: ' + block.transactions.length);
        return false;
    }
    if (block.transactions[0].hash.toString('hex') !== 'e68b7ae358421586ddf407a4b3f6c3fae45b68732e1e4efaef17d92621db3279') {
        console.error('Genesis Block Coinbase Validation: Invalid hash');
        return false;
    }
    if (block.transactions[0].senderPubKey.toString('hex') !== 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff') {
        console.error('Genesis Block Coinbase Validation: Invalid senderPubKey');
        return false;
    }
    if (block.transactions[0].receiverPubKey.toString('hex') !== '034724cab475bf1b118020464e81bf9dd18526c7180d85f115a93897b29be37d58') {
        console.error('Genesis Block Coinbase Validation: Invalid receiverPubKey');
        return false;
    }
    if (block.transactions[0].sig.toString('hex') !== 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff') {
        console.error('Genesis Block Coinbase Validation: Invalid sig');
        return false;
    }
    if (block.transactions[0].inputs.length != 1) {
        console.error('Genesis Block Coinbase Validation: Invalid number of inputs: ' + block.transactions[0].inputs.length);
        return false;
    }
    if (block.transactions[0].inputs[0].toString('hex') !== 'f80b755a0b2a5ae930aa89f38c896ee6a8ce0a34c900aeac400104e6b06ef36e') {
        console.error('Genesis Block Coinbase Validation: Invalid input hash');
        return false;
    }
    if (block.transactions[0].amount != 10000) {
        console.error('Genesis Block Coinbase Validation: Invalid amount');
        return false;
    }

    console.log('genesis block validation passed');
    return true;
}

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
    validateTransactions: validateTransactions,
    validateGenBlock: validateGenBlock
};
