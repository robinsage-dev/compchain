const expect = require('chai')
  .use(require('chai-bytes'))
  .expect;

const Transaction = require('../service/util/transaction.js');
const EcPair = require('../service/util/ecpair.js');
const fixture = require('./fixtures/cryptography.json');

describe('getTransactionHash()', function () {
  it('should return a hash', function () {

    // 1. ARRANGE
    // FIXME: use a tested test fixture (typ)
    let senderPubKey = Buffer.alloc(32);
    let receiverPubKey = Buffer.alloc(32);
    let sig = Buffer.alloc(32);
    let amount = 1;
    let transaction = new Transaction(senderPubKey, receiverPubKey, sig, amount);

    // 2. ACT
    let hash = transaction.getTransactionHash();

    // 3. ASSERT
    expect(hash).to.equalBytes("253f208b6954a8b3950809655b387fd61c2ac53b5298816ecd216fa85ad7753f");

  });
});

describe('__byteLength()', function () {  
  it('should return a buffer', function () {

    // 1. ARRANGE
    let senderPubKey = Buffer.alloc(32);
    let receiverPubKey = Buffer.alloc(32);
    let sig = Buffer.alloc(32);
    let amount = 1;
    let transaction = new Transaction(senderPubKey, receiverPubKey, sig, amount);

    // 2. ACT
    let length = transaction.__byteLength();

    // 3. ASSERT
    expect(length).to.be.equal(16);
  });
});

describe('__toBuffer()', function () {
  it('should return a buffer', function () {

    // 1. ARRANGE
    let senderPubKey = Buffer.alloc(32);
    let receiverPubKey = Buffer.alloc(32);
    let sig = Buffer.alloc(32);
    let amount = 1;
    let transaction = new Transaction(senderPubKey, receiverPubKey, sig, amount);

    // 2. ACT
    let buffer = transaction.__toBuffer();

    // 3. ASSERT
    expect(buffer).to.equalBytes("00000000000000000000000001000000");

  });
});

describe('signTransaction()', function () {
  it('should return true', function () {

    // 1. ARRANGE
    let testPairD = Buffer.from(fixture.valid.privateKey, 'hex');
    let testPair = EcPair.fromBuffer(testPairD);
    let senderPubKey = testPair.Q;
    let receiverPubKey = Buffer.alloc(32);
    let sig = Buffer.alloc(32);
    let amount = 1;
    let transaction = new Transaction(senderPubKey, receiverPubKey, sig, amount);

    // 2. ACT
    let signResult = transaction.signTransaction(testPair.d);

    // 3. ASSERT
    // FIXME: Yes I know this is bad, but I need another way to generate a test fixture
    expect(transaction.validateTransactionSig()).to.equal(true);

  });
});

describe('validateTransactionSig()', function () {
  it('should return true', function () {

    // 1. ARRANGE
    let testPairD = Buffer.from(fixture.valid.privateKey, 'hex');
    let testPair = EcPair.fromBuffer(testPairD);
    let senderPubKey = testPair.Q;
    let receiverPubKey = Buffer.alloc(32);
    let sig = Buffer.alloc(32);
    let amount = 1;
    let transaction = new Transaction(senderPubKey, receiverPubKey, sig, amount);
    // FIXME: Yes I know this is bad, but I need another way to generate a test fixture
    let signResult = transaction.signTransaction(testPair.d);

    // 2. ACT
    let valid = transaction.validateTransactionSig();

    // 3. ASSERT
    expect(valid).to.be.equal(true);

  });
});

describe('validateTransactionData()', function () {
  it('should return true', function () {

    // 1. ARRANGE
    let senderPubKey = Buffer.allocUnsafe(32);
    let receiverPubKey = Buffer.allocUnsafe(32);
    let sig = Buffer.allocUnsafe(32);
    let amount = 1;
    let transaction = new Transaction(senderPubKey, receiverPubKey, sig, amount);

    // 2. ACT
    let valid = transaction.validateTransactionData();

    // 3. ASSERT
    expect(valid).to.be.equal(true);

  });
});
