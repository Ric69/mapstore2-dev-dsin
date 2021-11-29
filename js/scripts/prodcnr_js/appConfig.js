const config = require('./localConfig.json');

module.exports = {
    pages: [
        {
            name: 'home',
            path: '/',
            pageConfig: { match: { params: { mapId: config.homePageId } } },
            component: require('@mapstore/product/pages/MapViewer'),
        },
        {
            name: 'mapviewer',
            path: '/map/:mapId',
            component: require('@mapstore/product/pages/MapViewer'),
        },
        {
            name: 'maps',
            path: '/maps',
            component: require('@js/pages/Maps'),
        },
        {
            name: 'widgets',
            path: '/widgets',
            component: require('@js/pages/WidgetViewer'),
        },
    ],
    pluginsDef: require('@js/plugins.js'),
    initialState: {
        defaultState: {},
        mobile: {},
    },
    storeOpts: {
        persist: {
            whitelist: ['security', 'windowMaps'],
        },
    },
};
