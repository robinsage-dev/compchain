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
    coinbaseTx.amount = 10000;
    coinbaseTx.timestamp = Math.floor(Date.now()/1000);
    coinbaseTx.calculateTransactionHash();
    return coinbaseTx;
}

let getBlockTemplate = (coinbasePubKey) => {
    // Connect to Mongo db
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        // TODO: should this be awaited by everything proceeding?
    });
    // Get transactions from database (getting all for now)
    let promise = Transaction.find()
        .then((transactions) => {
            console.debug(`txs length: ${transactions.length}`);
            if (transactions.length == 0) {
                throw {
                    code: 1,
                    description: 'No transactions to mine!'
                };
            } 
            // Get previous block hash (setting statically for now)
            let prevBlockHash = Buffer.from(
                'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
                'hex'
            );
            // Get previous difficulty target (setting statically for now)
            // let difficultyTarget = Buffer.from(
            //     '00000fffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
            //     'hex'
            // );
            let difficultyTarget = Buffer.from(
                '0000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
                'hex'
            );
            // Create a block
            let block = new Block();
            block.prevBlockHash = prevBlockHash;
            block.difficultyTarget = difficultyTarget;
            block.nonce = 0;
            let coinbaseTx = createCoinbaseTx(coinbasePubKey);
            transactions.push(coinbaseTx);
            block.transactions = transactions;
            // console.debug(`txs: ${block.transactions.map(tx => tx.toString())}`);
            // TODO: Make sure there is an even number of tx
            if (block.transactions.length % 2 != 0) {
                block.transactions.pop(); // Drop the last one to get an even number
            }
            try {
                block.calculateMerkleRoot();
            } catch (err) {
                throw {
                    description: 'calculateMerkleRoot error',
                    error: err
                };
            }
            block.calculateBlockHash();
            // Return the block
            return block;

        })
        .catch( err => {
            console.error(err);
            throw err;
        });
    return promise;
};

// NOTE: This does not post to the api, but writes to the database directly
let mineBlock = (pubKey) => {
    getBlockTemplate(pubKey)
        .then( (block) => {
            // Hash the block until it's valid (less than diff target)
            while (block.hash.compare(block.difficultyTarget) == 1) {
                block.nonce += 1;
                block.calculateBlockHash();
            }
            console.log(`Valid block found: Block Hash: ${block.hash.toString('hex')}\nNonce: ${block.nonce}`);
            return block;
        })
        .then( (block) => block.save())
        .then( (block, err) => {
            console.debug('block saved');
            if (err) {
                console.error(err);
                throw err;
            }
            db.close();
            console.log('Block saved to mongo: ' + block);
            process.exit();
        })
        .catch( (err) => {
            console.error('Error mining block: ' + err);
            process.exit();
        });
};

program.version('0.0.1');

program
    .command('mine')
    .description('Mine the next block')
    .option('-t --pubKey <pubKey>', 'PubKey to send to')
    .action(mineBlock);

program.parse(process.argv);
