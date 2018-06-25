
function Handshake(uplinePubKey, downlinePubKey, uplineSig, downlineSig, handshakeData) {
    // TODO: add typeforce checks
    this.uplinePubKey = uplinePubKey;
    this.downlinePubKey = downlinePubKey;
    this.uplineSig = uplineSig;
    this.downlineSig = downlineSig;
    this.handshakeData = handshakeData; // This could be a side chain pubkey encrypted by the main chain pubkey
}

Handshake.prototype.validateHandshakeSig = function (handshake) {
    valid = true;
    // TODO: Check that signature matches public key of fromAddress
    return valid;
}

Handshake.prototype.validateHandshakeData = function (handshake) {
    valid = true;
    // TODO: Check that outputs >= inputs
    return valid;
}

module.exports = Handshake;
