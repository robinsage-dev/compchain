#!/bin/bash

sudo apt-get install -y libboost-all-dev libevent-dev
sudo cp src/{bitcoind,bitcoin-cli,bitcoin-tx} /usr/local/bin
mkdir -p /usr/share/man/man1
sudo cp doc/man/* /usr/share/man/man1
