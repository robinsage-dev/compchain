const StartUp = function StartUp(Config, App)
{
    startApi(Config, App);
    startWebsite(Config, App);
    startAdmin(Config, App);
}

function startApi(Config, App)
{
    if (Config.RB_API == 1) //API
    {
        const ApiApp = require_robinbase('/service/api/apiApp.js');
        const baseRouter = App.buildAdminRouter();
        const customRouters = [
            // add custom routers here
        ];
        const routers = customRouters.concat([baseRouter]);
        const apiApp =  new ApiApp();
        apiApp.init(routers);
    }
}

function startWebsite(Config, App)
{
    if (Config.RB_WEBSITE == 1) //WEBSITE
    {
        const WebsiteApp = require_robinbase('/service/website/websiteApp.js');
        const websiteApp =  new WebsiteApp();
        websiteApp.init(null, Config.RB_WEB_PORT, null, [require('./routes/websiteRoutes.js')]);
    }
}

function startAdmin(Config, App)
{
    if (Config.RB_ADMIN == 1) //ADMIN
    {
        const WebsiteApp = require_robinbase('/service/website/websiteApp.js');
        const adminApp =  new WebsiteApp();
        const baseRouter = App.buildAdminRouter();
        const customRouters = [
            // add custom routers here
        ];
        const routers = customRouters.concat([baseRouter]);
        adminApp.init(null, Config.RB_ADMIN_PORT, null, routers);
    }
}

module.exports = StartUp;
