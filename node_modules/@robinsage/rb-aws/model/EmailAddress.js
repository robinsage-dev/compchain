const Debug = require_robinbase('/helpers/Debug.js').prefix("model:EmailAddress");
const Schema = require_robinbase('/helpers/Schema.js');

/**
 * Model EmailAddress
 */
const EmailAddress = function EmailAddress(data)
{
    const self = this;

    EmailAddress.schema.initializeInstance(self, data);
}

EmailAddress.collection = 'emailAddresses';
EmailAddress.saveTrash = true;
EmailAddress.storageName = 'default';


//////////////////////////////////////////////////////
///                   SCHEMA                       ///
//////////////////////////////////////////////////////

const statuses = ['Valid', 'Bounce', 'Complaint'];

EmailAddress.schema = new Schema('_id', {
    _id: Schema.objectid,
    address: Schema.string,
    status: Schema.options(statuses),
    createdTime: Schema.datetime,
    modifiedTime: Schema.datetime,
});


//////////////////////////////////////////////////////
///                  INDEXES                       ///
//////////////////////////////////////////////////////

EmailAddress.indexes = [
    {
        fields: {'$**': 'text'},
        options: {
            name:'emailAddressesSearchIndex',
            weights: {
                // adjust weights here
                address: 10,
                status: 2,
            }
        }
    },
    {
        fields: {address: 1},
        options: {
            name: 'emailAddressIndex',
            unique: true,
        }
    }
]


//////////////////////////////////////////////////////
///                   JOINS                        ///
//////////////////////////////////////////////////////

EmailAddress.joins = {
    // add join definitions here
}


//////////////////////////////////////////////////////
///                    VIEW                        ///
//////////////////////////////////////////////////////

EmailAddress.view =
{
    name: 'Email Addresses',
    route: 'emailaddresses',
    icon: '\uf0e0',
    search: true,
    internalOnly: false,
    _attributes: function(instance, context, authorization) {
        return {
            address: {type: 'text', immutable: true, label: 'Email Address'},
            status: {type: 'text', label: 'Status', values: statuses},
        }
    }
}




//////////////////////////////////////////////////////
///                   HOOKS                        ///
//////////////////////////////////////////////////////

const defaultHook = function(callback)
{
    const self = this;
    callback(null, self);
}

EmailAddress.prototype.beforeCreate = defaultHook;
EmailAddress.prototype.afterCreate = defaultHook;
EmailAddress.prototype.beforeUpdate = defaultHook;
EmailAddress.prototype.afterUpdate = defaultHook;
EmailAddress.prototype.beforeDelete = defaultHook;
EmailAddress.prototype.afterDelete = defaultHook;


module.exports = EmailAddress;
