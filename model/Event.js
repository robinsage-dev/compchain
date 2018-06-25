const Debug = require_robinbase('/helpers/Debug.js').prefix('model:Event');
const Schema = require_robinbase('/helpers/Schema.js');
const Transaction = require('../services/util/transactions.js');
const Handshake = require('../services/util/handshake.js');

/**
 * Model Event
 */
const Event = function Event(data)
{
    const self = this;

    Event.schema.initializeInstance(self, data);
};

Event.collection = 'events';
Event.saveTrash = true;
Event.storageName = 'mongo';


//////////////////////////////////////////////////////
///                   SCHEMA                       ///
//////////////////////////////////////////////////////

Event.schema = new Schema('_id', {
    _id: Schema.objectid,
    timestamp: Schema.timestamp,
    eventObject: Schema.object,           // Can be one of Transaction or Handshake
    txid: Schema.string,
    blockHash: Schema.string.nullable().default(null),
    createdTime: Schema.datetime,
    modifiedTime: Schema.datetime,
});

//////////////////////////////////////////////////////
///                  INDEXES                       ///
//////////////////////////////////////////////////////

Event.indexes = [
    {
        fields: {'$**': 'text'},
        options: {
            name:'eventsSearchIndex',
            weights: {
                // adjust weights here
            },
        },
    },
];


//////////////////////////////////////////////////////
///                   JOINS                        ///
//////////////////////////////////////////////////////

Event.joins = {
    // add join definitions here
};


//////////////////////////////////////////////////////
///                    VIEW                        ///
//////////////////////////////////////////////////////

Event.view = {
    name: 'Events',
    route: 'events',
    icon: '',
    search: true,
    _attributes: function(instance, context, authorization) {
        return {
            // add view attributes here
        };
    },
};




//////////////////////////////////////////////////////
///                   HOOKS                        ///
//////////////////////////////////////////////////////

const defaultHook = function(callback)
{
    const self = this;
    callback(null, self);
};

Event.prototype.beforeCreate = defaultHook;
Event.prototype.afterCreate = defaultHook;
Event.prototype.beforeUpdate = defaultHook;
Event.prototype.afterUpdate = defaultHook;
Event.prototype.beforeSave = defaultHook;
Event.prototype.afterSave = defaultHook;
Event.prototype.beforeDelete = defaultHook;
Event.prototype.afterDelete = defaultHook;


module.exports = Event;
