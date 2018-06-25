const Debug = require_robinbase('/helpers/Debug.js').prefix('model:Block');
const Schema = require_robinbase('/helpers/Schema.js');

/**
 * Model Block
 */
const Block = function Block(data)
{
    const self = this;

    Block.schema.initializeInstance(self, data);
};

Block.collection = 'blocks';
Block.saveTrash = true;
Block.storageName = 'mongo';


//////////////////////////////////////////////////////
///                   SCHEMA                       ///
//////////////////////////////////////////////////////

Block.schema = new Schema('_id', {
    _id: Schema.objectid,
    // add additional properties here
    createdTime: Schema.datetime,
    modifiedTime: Schema.datetime,
});


//////////////////////////////////////////////////////
///                  INDEXES                       ///
//////////////////////////////////////////////////////

Block.indexes = [
    {
        fields: {'$**': 'text'},
        options: {
            name:'blocksSearchIndex',
            weights: {
                // adjust weights here
            },
        },
    },
];


//////////////////////////////////////////////////////
///                   JOINS                        ///
//////////////////////////////////////////////////////

Block.joins = {
    // add join definitions here
};


//////////////////////////////////////////////////////
///                    VIEW                        ///
//////////////////////////////////////////////////////

Block.view = {
    name: 'Blocks',
    route: 'blocks',
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

Block.prototype.beforeCreate = defaultHook;
Block.prototype.afterCreate = defaultHook;
Block.prototype.beforeUpdate = defaultHook;
Block.prototype.afterUpdate = defaultHook;
Block.prototype.beforeSave = defaultHook;
Block.prototype.afterSave = defaultHook;
Block.prototype.beforeDelete = defaultHook;
Block.prototype.afterDelete = defaultHook;


module.exports = Block;
