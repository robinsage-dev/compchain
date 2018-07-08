#!/usr/bin/env node
const program = require('commander'); // https://www.npmjs.com/package/commander
const Transaction = require('../model/transaction');
const EcPair = require('../util/ecpair.js');
const ecurve = require('ecurve');
const secp256k1 = ecurve.getCurveByName('secp256k1');
const mongoose = require('mongoose');

// NOTE: This does not post to the api, but writes to the database directly
let sendCoins = (privKey, pubKey, amount) => {
    mongoose.connect('mongodb://localhost/oasis');
    let db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        console.debug('Connected to mongo successfully');
    });
    let transaction = new Transaction();
    let senderPair = EcPair.fromBuffer(new Buffer(privKey, 'hex'));
    transaction.timestamp = Math.floor(Date.now()/1000);
    transaction.senderPubKey = senderPair.getPublicKeyBuffer();
    transaction.receiverPubKey = new Buffer(pubKey, 'hex');
    transaction.amount = amount;
    // TODO: Find spendable inputs
    transaction.inputs = [Buffer.from('f80b755a0b2a5ae930aa89f38c896ee6a8ce0a34c900aeac400104e6b06ef36e', 'hex')]; // just dummy hashes for now
    try {
        transaction.signTransaction(senderPair.d);
    } catch (err) {
        console.error(err);
        throw {
            description: 'signTransaction failure',
            error: err
        };
    }
    transaction.save( function (err, tx) {
        if (err) {
            console.error('Error saving to mongo: ' + err);
            // console.debug('Entry: ' + transaction);
            process.exit();
        }
        console.log('Transaction saved to mongo: ' + tx);
        process.exit();
    });
};

let generatePrivKey = () => {
    let ecPair = EcPair.makeRandom();
    console.log(`PrivKey: ${ecPair.d.toHex()}`);
    console.log(`PubKey: ${ecPair.getPublicKeyBuffer().toString('hex')}`);
};

program
    .version('0.0.1');

program
    .command('gen')
    .description('Generate random private key')
    // .option('-s --seed <n>', 'Seed phrase')
    .action(generatePrivKey);

program
    .command('send <privKey> <pubKey> <amount>')
    .description('Send coins')
    .option('-f --privKey <privKey>', 'Private key to send from')
    .option('-t --pubKey <pubKey>', 'PubKey to send to')
    .option('-a --amount <amount>', 'Amount to send')
    .action(sendCoins);

program.parse(process.argv);
