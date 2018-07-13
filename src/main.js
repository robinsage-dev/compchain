const apiRouter = require('./api/router.js');
const Block = require('./model/block');
const Transaction = require('./model/transaction');
const Validate = require('./validation/validation');

// Blockchain Syncronization
/////////////////////////////////////////////////

function createCoinbaseTx() {
    let coinbaseTx = new Transaction();
    coinbaseTx.senderPubKey = Buffer.from('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 'hex');
    coinbaseTx.receiverPubKey = Buffer.from('034724cab475bf1b118020464e81bf9dd18526c7180d85f115a93897b29be37d58', 'hex');
    coinbaseTx.sig = Buffer.from('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 'hex');
    coinbaseTx.inputs = [Buffer.from('f80b755a0b2a5ae930aa89f38c896ee6a8ce0a34c900aeac400104e6b06ef36e', 'hex')];
    coinbaseTx.amount = 10000; // Gen block initial reward
    coinbaseTx.calculateTransactionHash();
    coinbaseTx.blockHeight = 0;
    return coinbaseTx;
}

function loadGenBlock() {
    let block = new Block();
    block.prevBlockHash = Buffer.from('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 'hex');
    // Note: This just loads all transactions in transaction.json
    block.transactions.push(createCoinbaseTx());
    block.setMerkleRoot();
    block.difficultyTarget = Buffer.from('0000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 'hex');
    block.nonce = 54790;
    block.timestamp = 1531514331;
    block.calculateBlockHash();
    block.save();
}

// TODO: Make sure that the gen block is in the database
Block.find(function (err, blocks) {
    if (err) {
        console.error(err);
        return;
    }
    else if (blocks.length == 0) {
        console.log('No blocks found, creating genesis block');
        try {
            loadGenBlock();
        } catch (err) {
            console.error(err);
            return;
        }
        console.log('Genesis block successfully loaded!');
    } else if (!Validate.validateGenBlock(blocks[0])) {
        console.error('Invalid Gen block! Someone is doing something funny');
        return;
        // TODO: Just replace the gen block?
    } else {
        console.log('Genesis block loaded and validated...');
    }
});

// TODO: sync with other nodes

// TODO: validate blockchain in mongodb

apiRouter.initApiRouter();
