# Transactions

## Data structure
Transactions are stored as mongodb objects, but converted to buffers for crypto operations.  The structure is as follows:

| Field          |  Description                                                 |  Size (Bytes)  | 
|----------------|--------------------------------------------------------------|----------------| 
| senderPubKey   |  ECSDA Compressed public key of the original coin owner      |  33            | 
| receiverPubKey |  ECSDA Compressed public key of the coin recipient           |  33            | 
| sig            |  ECSDA digital signature of the hash of the transaction data |  64            | 
| inputs         |  SHA256 hash of each transaction used as inputs              |  32 (ea)       | 
| amount         |  32 bit unsigned integer amount of coins to send             |  4             | 
|                |                                                              |                |
|                |  Minimum Total Size                                          |  166           |

### Transaction construction example
Alice wants to send Bob 10 coins using a previous input of 10 coins, for simplicity. The transaction is created and stored as follows:

1. Create transaction  

| Field       |  senderPubKey                                                       |  receiverPubKey                                                     |  input1                                                           |  amount   | 
|-------------|---------------------------------------------------------------------|---------------------------------------------------------------------|-------------------------------------------------------------------|-----------| 
| Bytes (hex) |  `02071791bdeda4bcc43e3b0ed9c7be4a404c91b637d86d4f65a6b1720d6f13682e` |  `02a5a6f3744db671d0a19970c49f31387a8c811e7da8a971d08b7927206d815100` |  `f80b755a0b2a5ae930aa89f38c896ee6a8ce0a34c900aeac400104e6b06ef36e` |  `01000000` | 
2. Create transaction buffer  
`02071791bdeda4bcc43e3b0ed9c7be4a404c91b637d86d4f65a6b1720d6f13682e02a5a6f3744db671d0a19970c49f31387a8c811e7da8a971d08b7927206d815100f80b755a0b2a5ae930aa89f38c896ee6a8ce0a34c900aeac400104e6b06ef36e01000000`
3. Hash transaction (SHA256)  
`df535fd729927274a46143337976e262b47c9eaee7b201f8c5a0c46fde136eff`
4. Sign the hash using the private key corresponding to the senderPubKey (secp256k1 Eliptic Curve)  
Using private key: `748cb1da3400050ff0bb348e327a4ffde5060dc8cdfb798ee3450be996e4108d`  
Signature: `f989e31f78f07a5efb246daa7ac4ba1b3534f5c17b50324ec15804428e469f72566a33ee1771b8c1574be350e9a8f0a11747ef94351cfd35bf1e3286406644c8`