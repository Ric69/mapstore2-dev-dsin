/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const { connect } = require('react-redux');
const assign = require('object-assign');
const { Glyphicon } = require('react-bootstrap');

const Message = require('@mapstore/plugins/locale/Message');
const { onError, setLoading, setLayers, onSelectLayer, onLayerAdded, onLayerSkipped, updateBBox, onSuccess } = require('@mapstore/actions/mapimport');
const { zoomToExtent } = require('@mapstore/actions/map');
const { addLayer } = require('@mapstore/actions/layers');
const { toggleControl } = require('@mapstore/actions/controls');
const { mapTypeSelector } = require('@mapstore/selectors/maptype');
const { FiPlusCircle } = require('react-icons/fi');

module.exports = {
    MapImportPlugin: assign(
        {
            loadPlugin: (resolve) => {
                require.ensure(['../../MapStore2/web/client/plugins/import/Import'], () => {
                    const Import = require('../../MapStore2/web/client/plugins/import/Import');

                    const ImportPlugin = connect(
                        (state) => ({
                            enabled: state.controls && state.controls.mapimport && state.controls.mapimport.enabled,
                            layers: (state.mapimport && state.mapimport.layers) || null,
                            selected: (state.mapimport && state.mapimport.selected) || null,
                            bbox: (state.mapimport && state.mapimport.bbox) || null,
                            success: (state.mapimport && state.mapimport.success) || null,
                            errors: (state.mapimport && state.mapimport.errors) || null,
                            shapeStyle: state.style || {},
                            mapType: mapTypeSelector(state),
                        }),
                        {
                            setLayers,
                            onLayerAdded,
                            onLayerSkipped,
                            onSelectLayer,
                            onError,
                            onSuccess,
                            addLayer,
                            onZoomSelected: zoomToExtent,
                            updateBBox,
                            setLoading,
                            onClose: toggleControl.bind(null, 'mapimport', null),
                        }
                    )(Import);

                    resolve(ImportPlugin);
                });
            },
            enabler: (state) => (state.mapimport && state.mapimport.enabled) || (state.toolbar && state.toolbar.active === 'import'),
        },
        {
            disablePluginIf: "{state('mapType') === 'cesium'}",
            BurgerMenu: {
                name: 'import',
                position: 4,
                text: <Message msgId="mapImport.title" />,
                icon: <Glyphicon glyph="upload" />,
                action: toggleControl.bind(null, 'mapimport', null),
                priority: 2,
                doNotHide: true,
            },
            OmniBar: {
                name: 'mapImport.title',
                position: 6,
                tooltip: 'mapImport.tooltip',
                tool: connect(
                    (state) => ({
                        active: state.controls && state.controls.mapimport && state.controls.mapimport.enabled,
                        icon: <FiPlusCircle color="#fff" style={{ 'font-size': '2em' }} />,
                        tooltip: 'mapImport.tooltip',
                        bsStyle: state.controls && state.controls.mapimport && state.controls.mapimport.enabled ? 'success' : 'primary',
                    }),
                    {
                        action: toggleControl.bind(null, 'mapimport', null),
                    }
                )(require('./BarButton')),
                priority: 3,
                doNotHide: true,
            },
            Toolbar: {
                name: 'import',
                position: 9,
                panel: true,
                title: 'mapImport.title',
                tooltip: 'mapImport.tooltip',
                wrap: false,
                icon: <Glyphicon glyph="upload" />,
                exclusive: true,
                priority: 1,
            },
        }
    ),
    reducers: {
        mapimport: require('@mapstore/reducers/mapimport'),
        style: require('@mapstore/reducers/style'),
    },
};
