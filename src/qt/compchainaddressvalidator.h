// Copyright (c) 2011-2014 The Bitcoin Core developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#ifndef COMPCHAIN_QT_COMPCHAINADDRESSVALIDATOR_H
#define COMPCHAIN_QT_COMPCHAINADDRESSVALIDATOR_H

#include <QValidator>

/** Base58 entry widget validator, checks for valid characters and
 * removes some whitespace.
 */
class CompchainAddressEntryValidator : public QValidator
{
    Q_OBJECT

public:
    explicit CompchainAddressEntryValidator(QObject *parent);

    State validate(QString &input, int &pos) const;
};

/** Compchain address widget validator, checks for a valid compchain address.
 */
class CompchainAddressCheckValidator : public QValidator
{
    Q_OBJECT

public:
    explicit CompchainAddressCheckValidator(QObject *parent);

    State validate(QString &input, int &pos) const;
};

#endif // COMPCHAIN_QT_COMPCHAINADDRESSVALIDATOR_H
