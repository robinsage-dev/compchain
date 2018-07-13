const expect = require('chai').use(require('chai-bytes')).expect;
const Transaction = require('../src/model/transaction.js');
const EcPair = require('../src/util/ecpair.js');
const cryptoFixture = require('./fixtures/cryptography.json');
const transactionFixture = require('./fixtures/transaction.json');

// Methods
// =============================================================================

// TODO: refactor to a helpers.js file
let loadTransactionFixture = (idx) => {    
    let transaction = new Transaction();
    transaction.senderPubKey = Buffer.from(cryptoFixture.valid[transactionFixture[idx].senderPubKeyIdx].publicKey, 'hex');
    transaction.receiverPubKey = Buffer.from(cryptoFixture.valid[transactionFixture[idx].receiverPubKeyIdx].publicKey, 'hex');
    transaction.amount = transactionFixture[idx].amount;
    transaction.blockHeight = transactionFixture[idx].blockHeight;
    for (let tx of transactionFixture[idx].inputs) {
        transaction.inputs.push(Buffer.from(tx, 'hex'));
    }
    return transaction;
};

let loadECPairFixture = (idx) => {    
    let testPairD = Buffer.from(cryptoFixture.valid[idx].privateKey, 'hex');
    return EcPair.fromBuffer(testPairD);
};

// Tests
// =============================================================================

// TODO: Add failure mode tests
describe('transactionTests: __byteLength()', () => {
    it('returned expected length in bytes', () => {
        // 1. ARRANGE
        let transaction = loadTransactionFixture(0);

        // 2. ACT
        let length = transaction.__byteLength();

        // 3. ASSERT
        expect(length).to.be.equal(transactionFixture[0].byteLength);
    });
});

describe('transactionTests: __toBuffer()', () => {
    it('returned the expected buffer', () => {
        // 1. ARRANGE
        let transaction = loadTransactionFixture(0);

        // 2. ACT
        let buffer = transaction.__toBuffer();

        // 3. ASSERT
        expect(buffer).to.equalBytes(transactionFixture[0].buffer);
    });
});

describe('transactionTests: getTransactionHash()', () => {
    it('returned the expected hash', () => {
        // 1. ARRANGE
        let transaction = loadTransactionFixture(0);

        // 2. ACT
        transaction.calculateTransactionHash();

        // 3. ASSERT
        expect(transaction.hash).to.equalBytes(
            transactionFixture[0].hash
        );
    });
});

describe('transactionTests: signTransaction()', () => {
    it('returned the expected signature', () => {
        // 1. ARRANGE
        let transaction = loadTransactionFixture(0);
        let testPair = loadECPairFixture(transactionFixture[0].senderPubKeyIdx);
        transaction.senderPubKey = testPair.getPublicKeyBuffer();

        // 2. ACT
        transaction.signTransaction(testPair.d);
        let isValid = transaction.validateTransactionSig();

        // 3. ASSERT
        expect(transaction.sig).to.equalBytes(transactionFixture[0].sig);
    });
});

describe('transactionTests: validateTransactionSig()', () => {
    it('returned true', () => {
        // 1. ARRANGE
        let transaction = loadTransactionFixture(0);
        let testPair = loadECPairFixture(transactionFixture[0].senderPubKeyIdx);
        transaction.senderPubKey = testPair.getPublicKeyBuffer();

        // 2. ACT
        transaction.sig = new Buffer(transactionFixture[0].sig, 'hex');
        let isValid = transaction.validateTransactionSig();

        // 3. ASSERT
        expect(isValid).to.be.equal(true);
    });
});

// TODO: Implement these
// describe('transactionTests: validateInputs()', () => {
//     it('returned true', () => {
//         // 1. ARRANGE
//         let transaction = loadTransactionFixture(0);

//         // 2. ACT
//         transaction.validateInputs();

//         // 3. ASSERT
//     });
// });

// describe('transactionTests: validateAmount()', () => {
//     it('returned true', () => {
//         // 1. ARRANGE
//         let transaction = loadTransactionFixture(0);

//         // 2. ACT
//         transaction.validateAmount();

//         // 3. ASSERT
//     });
// });

// describe('transactionTests: validateTimestamp()', () => {
//     it('returned true', () => {
//         // 1. ARRANGE
//         let transaction = loadTransactionFixture(0);

//         // 2. ACT
//         transaction.validateTimestamp();

//         // 3. ASSERT
//     });
// });


/* TODO: Missing tests
1. Test missing tx properties in validation
*/
