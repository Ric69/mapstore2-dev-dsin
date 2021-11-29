/**
 * @author CapGemini
 */
const ConfigUtils = require('@mapstore/utils/ConfigUtils');

/**
 * Add custom (overriding) translations with:
 *
 * ConfigUtils.setConfigProp('translationsPath', ['./MapStore2/web/client/translations', './translations']);
 */
ConfigUtils.setConfigProp('translationsPath', './MapStore2/web/client/translations');
ConfigUtils.setConfigProp('themePrefix', 'cnr');

/**
 * Use a custom plugins configuration file with:
 *
 * ConfigUtils.setLocalConfigurationFile('localConfig.json');
 */
ConfigUtils.setLocalConfigurationFile('./js/localConfig.json');

/**
 * Use a custom application configuration file with:
 *
 * const appConfig = require('./appConfig');
 *
 * Or override the application configuration file with (e.g. only one page with a mapviewer):
 *
 * const appConfig = assign({}, require('@mapstore/product/appConfig'), {
 *     pages: [{
 *         name: "mapviewer",
 *         path: "/",
 *         component: require('@mapstore/product/pages/MapViewer')
 *     }]
 * });
 */
const appConfig = require('./appConfig');

/**
 * Define a custom list of plugins with:
 *
 * const plugins = require('./plugins');
 */
const plugins = require('@js/plugins');

require('@mapstore/product/main')(appConfig, plugins);
