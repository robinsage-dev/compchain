#!/usr/bin/env node
const program = require('commander'); // https://www.npmjs.com/package/commander
const Transaction = require('../model/transaction');
const Block = require('../model/block');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/compchain');
const db = mongoose.connection;

let getBlockTemplate = () => {
    // Connect to Mongo db
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        console.debug('Connected to mongo successfully');
    });
    // Get transactions from database (getting all for now)
    let promise = Transaction.find()
        .then(transactions => {
            for (let transaction of transactions) {
                console.debug(`Transaction: ${transaction.toString()}`);
            }
            return transactions;
        })
        .then((transactions) => {

            // Get previous block hash (setting statically for now)
            let prevBlockHash = Buffer.from(
                'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
                'hex'
            );
            // Get previous difficulty target (setting statically for now)
            let difficultyTarget = Buffer.from(
                '0fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
                'hex'
            );
            // Create a block
            let block = new Block();
            block.prevBlockHash = prevBlockHash;
            block.difficultyTarget = difficultyTarget;
            block.nonce = 0;
            block.transactions = transactions;
            block.calculateMerkleRoot();
            block.calculateBlockHash();
            console.debug(`Block: ${block.toString()}`);
            // Return the block
            return block;
        })
        .catch( err => {
            console.error(err);
            return;
        });
    return promise;
};

// NOTE: This does not post to the api, but writes to the database directly
let mineBlock = () => {
    let blockPromise = getBlockTemplate()
        .then( (block) => {
            // Hash the block until it's valid (less than diff target)
            while (block.hash.compare(block.difficultyTarget) == 1) {
                block.nonce += 1;
                block.calculateBlockHash();
            }
            console.log(`Valid block found: Block Hash: ${block.hash.toString('hex')}\nNonce: ${block.nonce}`);
            return block.save();
        })
        .then( (block, err) => {
            if (err) {
                throw err;
            }
            db.close();
            console.log('Block saved to mongo: ' + block);
            process.exit();
        })
        .catch( (err) => {
            console.error('Error saving to mongo: ' + err);
            process.exit();
        });
};

program.version('0.0.1');

program
    .command('mine')
    .description('Mine the next block')
    .action(mineBlock);

program.parse(process.argv);
