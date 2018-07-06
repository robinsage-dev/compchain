// Main
// =============================================================================

// TODO: refactor into routes.js module

// call the packages we need
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Block = require('./model/block');
const Transaction = require('./model/transaction');

mongoose.connect('mongodb://localhost/compchain');
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.debug('Connected to mongo successfully');
});

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const port = process.env.PORT || 8080; // set our port

// ROUTES FOR OUR API
// =============================================================================
let router = express.Router(); // get an instance of the express Router

// middleware to use for all requests
router.use(function (req, res, next) {
    next(); // make sure we go to the next routes and don't stop here
});

// Root accessible at GET http://localhost:8080/api)
router.get('/', function (req, res) {
    res.json({message: 'Compchain API'});
});

// Blocks
// ----------------------------------------------------
router
    .route('/blocks')
// create a block (accessed at POST http://localhost:8080/api/block)
    .post(function (req, res) {
        let block = new Block(); // create a new instance of the block model
        block.hash = req.body.name;
        block.prevBlockHash = req.body.prevBlockHash;
        block.merkleRoot = req.body.merkleRoot;
        block.difficultyTarget = req.body.difficultyTarget;
        block.nonce = req.body.nonce;
        block.transactions = req.body.transactions;

        // save the block and check for errors
        block.save(function (err) {
            if (err) res.send(err);

            res.json({message: 'Block saved: ' + block.hash});
        });
    })

// get all the blocks (accessed at GET http://localhost:8080/api/blocks)
    .get(function (req, res) {
        Block.find(function (err, blocks) {
            if (err) res.send(err);

            res.json(blocks);
        });
    });

// TODO: get a single block
router.route('/blocks/:block_hash');
// get the block with that hash (accessed at GET http://localhost:8080/api/blocks/:block_hash)
// .get(function(req, res) {
//     Block.find(req.params.block_hash, function(err, block) {
//         if (err)
//             res.send(err);
//         res.json(block);
//     });
// });

// Transactions
// ----------------------------------------------------
router
    .route('/tx')
// create a transaction (accessed at POST http://localhost:8080/api/tx)
    .post(function (req, res) {
        let tx = new Transaction(); // create a new instance of the transaction model
        tx.senderPubKey = req.body.senderPubKey;
        tx.receiverPubKey = req.body.receiverPubKey;
        tx.sig = req.body.sig;
        tx.inputs = req.body.inputs;
        tx.amount = req.body.amount;

        // save the block and check for errors
        block.save(function (err) {
            if (err) res.send(err);

            res.json({message: 'Block saved: ' + block.hash});
        });
    })

// get all the blocks (accessed at GET http://localhost:8080/api/blocks)
    .get(function (req, res) {
        Block.find(function (err, blocks) {
            if (err) res.send(err);

            res.json(blocks);
        });
    });

// TODO: get a single block
router.route('/blocks/:block_hash');
// get the block with that hash (accessed at GET http://localhost:8080/api/blocks/:block_hash)
// .get(function(req, res) {
//     Block.find(req.params.block_hash, function(err, block) {
//         if (err)
//             res.send(err);
//         res.json(block);
//     });
// });

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Compchain listening on port: ' + port);
