const expect = require('chai').use(require('chai-bytes')).expect;
const Block = require('../src/model/block.js');
const Transaction = require('../src/model/transaction.js');
const EcPair = require('../src/util/ecpair.js');
const cryptoFixture = require('./fixtures/cryptography.json');
const blockFixture = require('./fixtures/block.json');
const transactionFixture = require('./fixtures/transaction.json');

// Methods
// =============================================================================

// TODO: refactor to a helpers.js file
let loadTransactionFixture = (idx) => {    
    let transaction = new Transaction();
    transaction.senderPubKey = Buffer.from(cryptoFixture.valid[transactionFixture[idx].senderPubKeyIdx].publicKey, 'hex');
    transaction.receiverPubKey = Buffer.from(cryptoFixture.valid[transactionFixture[idx].receiverPubKeyIdx].publicKey, 'hex');
    transaction.sig = Buffer.from(transactionFixture[idx].sig, 'hex');
    transaction.amount = transactionFixture[idx].amount;
    for (let tx of transactionFixture[idx].inputs) {
        transaction.inputs.push(Buffer.from(tx, 'hex'));
    }
    return transaction;
};

let loadBlockFixture = (idx) => {    
    let block = new Block();
    block.prevBlockHash = Buffer.from(blockFixture[idx].prevBlockHash, 'hex');
    // Note: This just loads all transactions in transaction.json
    transactionFixture.forEach((tx, i) => {
        if (i < blockFixture[idx].numTx) {
            block.transactions.push(loadTransactionFixture(i));
        }
    });
    block.merkleRoot = Buffer.from(blockFixture[idx].merkleRoot, 'hex');
    block.difficultyTarget = Buffer.from(blockFixture[idx].difficultyTarget, 'hex');
    block.nonce = blockFixture[idx].nonce;
    return block;
};

// Tests
// =============================================================================

// TODO: Add failure mode tests
describe('blockTests: calculateMerkleRoot() Odd Rejected', () => {
    it('throw an error about odd number of txs', () => {
        // 1. ARRANGE
        let block = loadBlockFixture(0);

        // 2. ACT

        // 3. ASSERT
        expect(block.calculateMerkleRoot).to.throw(TypeError);
    });
});

describe('blockTests: calculateMerkleRoot()', () => {
    it('return the expected buffer', () => {
        // 1. ARRANGE
        let block = loadBlockFixture(1);

        // 2. ACT
        block.calculateMerkleRoot();

        // 3. ASSERT
        expect(block.merkleRoot).to.be.equalBytes(blockFixture[1].merkleRoot);
    });
});

describe('blockTests: __byteLength()', () => {
    it('returned the expected number of bytes', () => {
        // 1. ARRANGE
        let block = loadBlockFixture(1);

        // 2. ACT
        let length = block.__byteLength();

        // 3. ASSERT
        expect(length).to.be.equal(100 + loadTransactionFixture(0).__byteLength() + loadTransactionFixture(1).__byteLength() + 64 * 2);
    });
});

describe('blockTests: __toBuffer()', () => {
    it('returned the expected buffer', () => {
        // 1. ARRANGE
        let block = loadBlockFixture(1);

        // 2. ACT
        let buffer = block.__toBuffer();

        // 3. ASSERT
        // expect(buffer === Buffer.from(blockFixture[1].buffer, 'hex'));
        expect(buffer).to.be.equalBytes(Buffer.from(blockFixture[1].buffer, 'hex'));
    });
});

describe('blockTests: getBlockHash()', () => {
    it('it returned the expected hash', () => {
        // 1. ARRANGE
        let block = loadBlockFixture(1);

        // 2. ACT
        block.calculateBlockHash();

        // 3. ASSERT
        expect(block.hash).to.equalBytes(blockFixture[1].hash);
    });
});

describe('blockTests: validatePrevBlockHash()', () => {
    it('returned true', () => {
        // 1. ARRANGE
        let block = loadBlockFixture(1);

        // 2. ACT
        let valid = block.validatePrevBlockHash();

        // 3. ASSERT
        expect(valid).to.be.equal(true);
    });
});

describe('blockTests: validateMerkleRoot()', () => {
    it('returned true', () => {
        // 1. ARRANGE
        let block = loadBlockFixture(1);

        // 2. ACT
        let valid = block.validateMerkleRoot();

        // 3. ASSERT
        expect(valid).to.be.equal(true);
    });
});

describe('blockTests: validateDiffTarget()', () => {
    it('returned true', () => {
        // 1. ARRANGE
        let block = loadBlockFixture(1);

        // 2. ACT
        let valid = block.validateDiffTarget();

        // 3. ASSERT
        expect(valid).to.be.equal(true);
    });
});

describe('blockTests: validateTransactions()', () => {
    it('returned true', () => {
        // 1. ARRANGE
        let block = loadBlockFixture(1);

        // 2. ACT
        let valid = block.validateTransactions();

        // 3. ASSERT
        expect(valid).to.be.equal(true);
    });
});
