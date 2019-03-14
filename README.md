# Setting up a compchain node
These instructions are for linux, this was tested on Ubuntu 18.04LTS

## Download and Install Latest Release
Visit https://github.com/robinsage-dev/compchain/releases/ to download the latest binary release for your architecture.

```bash
$ wget https://github.com/robinsage-dev/compchain/releases/download/v1.0/compchain_v1.0.tar.gz
$ tar xvzf compchain_v1.0.tar.gz
$ cd compchain_rc9
$ sudo cp compchain* /usr/local/bin
```

## Install Dependencies
```bash
$ sudo apt-get install build-essential libtool autotools-dev automake pkg-config libssl-dev libevent-dev bsdmainutils python3 libboost-system-dev libboost-filesystem-dev libboost-chrono-dev libboost-test-dev libboost-thread-dev
$ sudo apt-get install software-properties-common
$ sudo add-apt-repository ppa:bitcoin/bitcoin
$ sudo apt-get update
$ sudo apt-get install libdb4.8-dev libdb4.8++-dev
```

See https://github.com/robinsage-dev/compchain/blob/master/doc/build-unix.md for more information

## Run application and connect to seed node
```bash
$ compchaind -daemon
$ compchain-cli addnode seed.compchain.io 'onetry'
```
