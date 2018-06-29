const expect = require('chai').expect;
const Handshake = require('../service/util/handshake.js');

// TODO: Add Unit tests
// describe('getHandhakeHash()', function () {
//     it('should return a hash', function () {

//         // 1. ARRANGE
//         // FIXME: use a tested test fixture (typ)
//         let senderPubKey = Buffer.alloc(32);
//         let receiverPubKey = Buffer.alloc(32);
//         let sig = Buffer.alloc(32);
//         let amount = 1;
//         let transaction = new Transaction(senderPubKey, receiverPubKey, sig, amount);

//         // 2. ACT
//         let hash = transaction.getTransactionHash();

//         // 3. ASSERT
//         expect(hash).to.equalBytes("253f208b6954a8b3950809655b387fd61c2ac53b5298816ecd216fa85ad7753f");

//     });
// });

// describe('validateHandshakeSig()', function () {
//     it('should return true', function () {

//         // 1. ARRANGE
//         let handshake = new Handshake("uplinePubKey", "downlinePubKey", "uplineSig", "downlineSig", "handshakeData");

//         // 2. ACT
//         let valid = handshake.validateHandshakeSig(handshake);

//         // 3. ASSERT
//         expect(valid).to.be.equal(true);

//     });
// });

// describe('validateHandshakeData()', function () {
//     it('should return true', function () {

//         // 1. ARRANGE
//         let handshake = new Handshake("uplinePubKey", "downlinePubKey", "uplineSig", "downlineSig", "handshakeData");

//         // 2. ACT
//         let valid = handshake.validateHandshakeData(handshake);

//         // 3. ASSERT
//         expect(valid).to.be.equal(true);

//     });
// });