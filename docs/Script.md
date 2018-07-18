# Scripts

## Format
Scripts use op codes defined in util/script.js. Scripts execute left to right, and some require parameters.

| Word             |  OP_CODE  |                                              |                     |  Parameters         |
|------------------|----------------------------------------------------------|---------------------|
| OP_CLAIM         |  x        | an arbitrary amount of data is claimed by the person signing it    | Bytes of data, Data |

# Scripts

## Claim scripts
Single signature - user wants to claim a unique piece of data that cannot have duplicate entries on the blockchain
Dual sig - Company acknowledges credit for an action to a distributor
Triple sig - New distributor signs under a sponsor and company recognizes this as a valid identity.

### Examples

## Transaction scripts
### 1 to 1
Pays to a single address signed by 1 key. Script format: `


### Examples