const path = require('path');

const themeEntries = require('./MapStore2/build/themes.js').themeEntries;
const extractThemesPlugin = require('./MapStore2/build/themes.js').extractThemesPlugin;

module.exports = require('./MapStore2/build/buildConfig')(
    {
        mapstore: path.join(__dirname, 'js', 'app'),
        'mapstore-embedded': path.join(__dirname, 'MapStore2', 'web', 'client', 'product', 'embedded'),
        'mapstore-api': path.join(__dirname, 'MapStore2', 'web', 'client', 'product', 'api')
    },
    themeEntries,
    {
        base: __dirname,
        dist: path.join(__dirname, 'dist'),
        framework: path.join(__dirname, 'MapStore2', 'web', 'client'),
        code: [path.join(__dirname, 'js'), path.join(__dirname, 'MapStore2', 'web', 'client')]
    },
    extractThemesPlugin,
    false,
    'dist/',
    '.mapstore',
    [],
    {
        '@mapstore/patcher': path.resolve(__dirname, 'node_modules', '@mapstore', 'patcher'),
        '@mapstore': path.resolve(__dirname, 'MapStore2', 'web', 'client'),
        '@js': path.resolve(__dirname, 'js')
    },
    {
        '/rest/geostore': {
            target: 'https://mapsqualif.mapstore.tm.fr/mapstoreadmin',
            secure: false,
            headers: {
                host: '10.10.10.104'
            }
        },
        '/pdf': {
            target: 'https://georchestraqualif.mapstore.tm.fr/geoserver',
            secure: false,
            headers: {
                host: '10.10.10.129'
            }
        },
        '/mapstore/pdf': {
            target: 'https://georchestraqualif.mapstore.tm.fr/geoserver',
            secure: false,
            headers: {
                host: '10.10.10.129'
            }
        },
        '/proxy': {
            target: 'https://mapsqualif.mapstore.tm.fr/mapstoreadmin',
            secure: false,
            headers: {
                host: '10.10.10.104'
            }
        },
        '/docs': {
            target: 'http://localhost:8081',
            pathRewrite: { '/docs': '/mapstore/docs' }
        }
    }
);
