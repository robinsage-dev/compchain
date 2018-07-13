#!/usr/bin/env node
const program = require('commander'); // https://www.npmjs.com/package/commander
const Transaction = require('../model/transaction');
const Block = require('../model/block');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/oasis');
const db = mongoose.connection;

function createCoinbaseTx(coinbasePubKey) {
    let coinbaseTx = new Transaction();
    coinbaseTx.senderPubKey = Buffer.from('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 'hex');
    coinbaseTx.receiverPubKey = Buffer.from(coinbasePubKey, 'hex');
    coinbaseTx.sig = Buffer.from('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 'hex');
    coinbaseTx.inputs = [Buffer.from('f80b755a0b2a5ae930aa89f38c896ee6a8ce0a34c900aeac400104e6b06ef36e', 'hex')];
    coinbaseTx.amount = 10000; // Gen block initial reward
    coinbaseTx.timestamp = Math.floor(Date.now()/1000);
    coinbaseTx.calculateTransactionHash();
    return coinbaseTx;
}

// TODO: This should be an api call
async function getBlockTemplate(coinbasePubKey) {
    // Connect to Mongo db
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        // TODO: should this be awaited by everything proceeding?
    });

    let blocks = await Block.find();
    let lastBlock = blocks[blocks.length - 1];
    let transactions = await Transaction.find();
    // Create a template block
    let block = new Block();
    block.prevBlockHash = lastBlock.hash;
    block.difficultyTarget = lastBlock.difficultyTarget;
    block.nonce = 0;
    let coinbaseTx = createCoinbaseTx(coinbasePubKey);
    coinbaseTx.blockHeight = blocks.length;
    coinbaseTx.calculateTransactionHash();
    transactions.push(coinbaseTx);
    block.transactions = transactions;
    block.timestamp = Math.floor(Date.now()/1000);
    
    try {
        block.setMerkleRoot();
    } catch (err) {
        throw {
            description: 'calculateMerkleRoot error',
            error: err
        };
    }
    block.calculateBlockHash();
    // Return the block
    return block;
}

// NOTE: This does not post to the api, but writes to the database directly
async function mineBlock(pubKey) {
    let block = await getBlockTemplate(pubKey);
    // Hash the block until it's valid (less than diff target)
    while (block.hash.compare(block.difficultyTarget) == 1) {
        block.nonce += 1;
        block.calculateBlockHash();
    }
    console.log(`Valid block found: Block Hash: ${block.hash.toString('hex')}\nNonce: ${block.nonce}`);
    // TODO: This should be sent to the submitBlock api endpoint
    try {
        await block.save();
    } catch (err) {
        console.error(err);
        throw err;
    }

    db.close();
    console.log('Block saved to mongo: ' + block);
    process.exit();
}

program.version('0.0.1');

program
    .command('mine')
    .description('Mine the next block')
    .option('-t --pubKey <pubKey>', 'PubKey to send to')
    .action(mineBlock);

program.parse(process.argv);
