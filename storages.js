module.exports = function(Config)
{
    const RedisStorage = require_robinbase("redis:storage:RedisStorage");
    const redisStorage = new RedisStorage({host: Config.RB_REDIS_SERVER, port: Config.RB_REDIS_PORT, prefix: Config.RB_REDIS_PREFIX});
    const MongoStorage = require_robinbase("mongo:storage:MongoStorage");
    const mongoStorage = new MongoStorage({connectionString: Config.RB_MONGO_CONNECTION});
    return {
        'redis': redisStorage,
        'default': mongoStorage,
        'mongo': mongoStorage,
    }
}