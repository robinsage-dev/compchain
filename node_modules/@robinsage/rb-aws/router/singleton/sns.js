const express = require('express');
const https = require('https');

module.exports = function(out, buildProcess)
{
    const EmailAddress = require_robinbase('aws:model:EmailAddress');

    const router = express.Router();
    router.post('/aws/webhook/emails', (req, res, next) =>
    {
        const topic = req.headers['x-amz-sns-message-type'];
        if (!topic)
        {
            return res.status(400).end('');
        }

        switch(topic)
        {
            case 'SubscriptionConfirmation':
            {
                const subscribeUrl = req.body.SubscribeURL;
                if (subscribeUrl)
                {
                    https.get(subscribeUrl, function(res)
                    {
                        console.log("Got subscription response: ", res.statusCode);
                    }).on('error', function(e)
                    {
                        console.warn("Got error while confirming subscription: ", e.message);
                    });

                }
                else
                {
                    Debug.log('No subscribe url in subscription request');
                    return res.status(400).end('');
                }
                break;
            }
            case 'Notification':
            {
                const message = req.body.Message;
                if (!message)
                {
                    console.log("Subscription notification has no message: ", req.body);
                    return res.status(400).end('');
                }
                const type = message.notificationType;
                if (!type)
                {
                    console.log("Subscription notification has no notification type: ", message);
                    return res.status(400).end('');
                }

                switch(type)
                {
                    case 'Bounce':
                    {
                        if (message.bounce && message.bounce.bounceType == 'Permanent')
                        {
                            if (Array.isArray(message.bounce.bouncedRecipients))
                            {
                                const emailAddresses = message.bounce.bouncedRecipients.map((recipient) => recipient.emailAddress);
                                EmailAddress.crud.get({address: {$in: emailAddresses}}, (err, addressRecords) =>
                                {
                                    if (err)
                                    {
                                        Debug.warn('Error fetching address records for bounce notification', err);
                                        return;
                                    }

                                    addressRecords.forEach((record) =>
                                    {
                                        record.status = 'Bounce';

                                        EmailAddress.crud.update({_id: record._id}, {status: 'Bounce'}, (err, result) =>
                                        {
                                            if (err)
                                            {
                                                Debug.warn('Error savide address record for bounce notification', err);
                                                return;
                                            }

                                            Debug.log('Successfully marked address ', record.address, ' as bounced');
                                        })
                                    });

                                });
                            }
                        }
                        break;
                    }
                    case 'Complaint':
                    {

                        if (message.complaint && Array.isArray(message.complaint.complainedRecipients))
                        {
                            const emailAddresses = message.complaint.complainedRecipients.map((recipient) => recipient.emailAddress);
                            EmailAddress.crud.get({address: {$in: emailAddresses}}, (err, addressRecords) =>
                            {
                                if (err)
                                {
                                    Debug.warn('Error fetching address records for complaint notification', err);
                                    return;
                                }

                                addressRecords.forEach((record) =>
                                {
                                    record.status = 'Complaint';

                                    EmailAddress.crud.update({_id: record._id}, {status: 'Complaint'}, (err, result) =>
                                    {
                                        if (err)
                                        {
                                            Debug.warn('Error savide address record for complaint notification', err);
                                            return;
                                        }


                                        Debug.log('Successfully marked address ', record.address, ' as complaint');
                                    })
                                });

                            });

                        }
                        break;
                    }
                    case 'Delivery':
                    {
                        // nothing I guess
                        break;
                    }
                }
                break;

            }
        }

        res.status(200).end('');
    });

    return router;
}
