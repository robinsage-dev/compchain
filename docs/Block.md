# Blocks

## Data structure
Blocks are stored as mongodb objects, but converted to buffers for crypto operations..  The structure is as follows:

| Field            |  Description                                             |  Size (Bytes)       | 
|------------------|----------------------------------------------------------|---------------------| 
| prevBlockHash    |  SHA256 Hash of previous block                           |  32                 | 
| merkleRoot       |  SHA256 of the transaction tree merkle root              |  32                 | 
| difficultyTarget |  256 bit value which sets maximum valid block hash value |  32                 | 
| nonce            |  32 bit integer that can be incremented during mining    |  4                  | 
| transactions     |  raw transaction buffers from mempool                    |  134 (+32 ea input) | 
|                  |                                                          |                     | 
|                  |  Minimum Total Size                                      |  266                | 

### Block construction example
Alice wants to send Bob 10 coins using a previous input of 10 coins, for simplicity. The transaction is created and stored as follows:

1. Retrieve Transaction(s) from Mempool  
> TODO: Add more transactions for a more meaningful example of a merkle tree  

| Field | senderPubKey | receiverPubKey | input1 | amount | sig | hash |
|---|---|---|---|---|---|---|
| Bytes (hex) | `02071791bdeda4bcc43e3b0ed9c7be4a404c91b637d86d4f65a6b1720d6f13682e` | `02a5a6f3744db671d0a19970c49f31387a8c811e7da8a971d08b7927206d815100` | `f80b755a0b2a5ae930aa89f38c896ee6a8ce0a34c900aeac400104e6b06ef36e` | `01000000` | `f989e31f78f07a5efb246daa7ac4ba1b3534f5c17b50324ec15804428e469f72566a33ee1771b8c1574be350e9a8f0a11747ef94351cfd35bf1e3286406644c8` | `df535fd729927274a46143337976e262b47c9eaee7b201f8c5a0c46fde136eff`

2. Calculate the merkle root
    > TODO: insert merkle_root.png

    1. Get the first two transactions in the block (if there is only 1, then it is duplicated), and concatenate their hashes together, with the hash of the first transaction in the block first.
    `df535fd729927274a46143337976e262b47c9eaee7b201f8c5a0c46fde136effdf535fd729927274a46143337976e262b47c9eaee7b201f8c5a0c46fde136eff`

    2. Continue this for all transactions in the block, maintaining the order in which they are placed in the block

    3. Hash the concatenated hashes for each pair.
    
    4. Repeat from step 1 for all of the hashes. This is the next level in the tree.

    5. Continue until you arrive to one hash (root hash). This is the merkle root.
    `cc03cfae993fdcc25a0957d8f0c9215018212f562393eda4c25a89456c3c9a01`
    
