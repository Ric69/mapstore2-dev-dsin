/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { checkForMissingPlugins } from '@mapstore/utils/DebugUtils';
import main from '@mapstore/product/main';
// const ConfigUtils = require('@mapstore/utils/ConfigUtils').default;

import appConfig from './appConfig';
import pluginsDef from './plugins';
import ConfigUtils from '@mapstore/utils/ConfigUtils';
/**
 * Add custom (overriding) translations with:
 *
 * ConfigUtils.setConfigProp('translationsPath', ['./MapStore2/web/client/translations', './translations']);
 */
ConfigUtils.setConfigProp('translationsPath', './MapStore2/web/client/translations');
ConfigUtils.setConfigProp('themePrefix', 'mapstore2');
ConfigUtils.setConfigProp('contextPluginsConfiguration', './js/pluginsConfig.json');


/**
 * Use a custom plugins configuration file with:
 *
 * ConfigUtils.setLocalConfigurationFile('localConfig.json');
 */
// ConfigUtils.setLocalConfigurationFile('MapStore2/web/client/localConfig.json');
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
// const appConfig = require('@mapstore/product/appConfig').default;

/**
 * Define a custom list of plugins with:
 *
 * const plugins = require('./plugins');
 */
// const plugins = require('@mapstore/product/plugins').default;

// checkForMissingPlugins(plugins.plugins);

// main(appConfig, plugins);

checkForMissingPlugins(pluginsDef.plugins);

main(appConfig, pluginsDef);
