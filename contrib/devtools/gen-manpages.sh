#!/usr/bin/env bash

export LC_ALL=C
TOPDIR=${TOPDIR:-$(git rev-parse --show-toplevel)}
BUILDDIR=${BUILDDIR:-$TOPDIR}

BINDIR=${BINDIR:-$BUILDDIR/src}
MANDIR=${MANDIR:-$TOPDIR/doc/man}

COMPCHAIND=${COMPCHAIND:-$BINDIR/compchaind}
COMPCHAINCLI=${COMPCHAINCLI:-$BINDIR/compchain-cli}
COMPCHAINTX=${COMPCHAINTX:-$BINDIR/compchain-tx}
COMPCHAINQT=${COMPCHAINQT:-$BINDIR/qt/compchain-qt}

[ ! -x $COMPCHAIND ] && echo "$COMPCHAIND not found or not executable." && exit 1

# The autodetected version git tag can screw up manpage output a little bit
BTCVER=($($COMPCHAINCLI --version | head -n1 | awk -F'[ -]' '{ print $6, $7 }'))

# Create a footer file with copyright content.
# This gets autodetected fine for compchaind if --version-string is not set,
# but has different outcomes for compchain-qt and compchain-cli.
echo "[COPYRIGHT]" > footer.h2m
$COMPCHAIND --version | sed -n '1!p' >> footer.h2m

for cmd in $COMPCHAIND $COMPCHAINCLI $COMPCHAINTX $COMPCHAINQT; do
  cmdname="${cmd##*/}"
  help2man -N --version-string=${BTCVER[0]} --include=footer.h2m -o ${MANDIR}/${cmdname}.1 ${cmd}
  sed -i "s/\\\-${BTCVER[1]}//g" ${MANDIR}/${cmdname}.1
done

rm -f footer.h2m
