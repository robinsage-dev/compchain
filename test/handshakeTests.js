const expect = require('chai').expect;
const Handshake = require('../services/util/handshake.js');

describe('validateHandshakeSig()', function () {
    it('should return true', function () {

        // 1. ARRANGE
        let handshake = new Handshake("uplinePubKey", "downlinePubKey", "uplineSig", "downlineSig", "handshakeData");

        // 2. ACT
        let valid = handshake.validateHandshakeSig(handshake);

        // 3. ASSERT
        expect(valid).to.be.equal(true);

    });
});

describe('validateHandshakeData()', function () {
    it('should return true', function () {

        // 1. ARRANGE
        let handshake = new Handshake("uplinePubKey", "downlinePubKey", "uplineSig", "downlineSig", "handshakeData");

        // 2. ACT
        let valid = handshake.validateHandshakeData(handshake);

        // 3. ASSERT
        expect(valid).to.be.equal(true);

    });
});