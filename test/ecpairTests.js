const expect = require('chai')
    .use(require('chai-bytes'))
    .expect;

const EcPair = require('../service/util/ecpair.js');
const fixture = require('./fixtures/cryptography.json');

describe('makeRandom()', function () {
    it('should not ever match', function () {

        // 1. ARRANGE
        let testPair = EcPair.makeRandom();

        // 2. ACT
        let randomPair = EcPair.makeRandom();

        // 3. ASSERT
        expect(randomPair).to.not.deep.equal(testPair);

    });
});

describe('fromBuffer()', function () {
    it('should match', function () {
        // 1. ARRANGE
        let testPairD = Buffer.from(fixture.valid.privateKey, 'hex');
        let testPairQ = Buffer.from(fixture.valid.publicKey, 'hex');

        // 2. ACT
        let randomPair = EcPair.fromBuffer(testPairD);

        // 3. ASSERT
        expect(testPairD).to.equalBytes(randomPair.d.toBuffer());
        expect(testPairQ).to.equalBytes(randomPair.Q.getEncoded());
    });
});