/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const { connect } = require('react-redux');
const { Glyphicon } = require('react-bootstrap');
const assign = require('object-assign');

const Message = require('../../../MapStore2/web/client/components/I18N/Message');
const { toggleControl } = require('../../../MapStore2/web/client/actions/controls');

const { GrDocumentCsv } = require('react-icons/gr');

const mapStateToProps = (state) => ({
    visible:
        (state.controls && state.controls.csv2Shapefile && state.controls.csv2Shapefile.enabled) ||
        false,
});

// // La liste des fonctions renvoyant certaines actions
const mapDispatchToProps = {
    onClose: toggleControl.bind(null, 'csv2Shapefile', null),
};

/**
 * Plugin de projection : Permet de convertir un fichier CSV(X,Y,Z) dans une projection à une autre
 * @class
 * @name Projections
 * @memberof plugins
 */
const Csv2Shapefile = connect(
    mapStateToProps,
    mapDispatchToProps
)(require('./components/Csv2Shapefile'));

module.exports = {
    Csv2ShapefilePlugin: assign(Csv2Shapefile, {
        disablePluginIf: "{state('mapType') === 'cesium'}",
        BurgerMenu: {
            name: 'csv2shapefile',
            position: 2,
            panel: false,
            help: <Message msgId="csv2shapefile.title" />,
            tooltip: 'csv2shapefile.tooltip',
            text: <Message msgId="csv2shapefile.title" />,
            icon: (
                <GrDocumentCsv
                    className="svg-color"
                    style={{ width: '18px', marginRight: '14px' }}
                />
            ),
            action: toggleControl.bind(null, 'csv2Shapefile', null),
            priority: 2,
            doNotHide: true,
        },
        OmniBar: {
            name: 'csv2shapefile',
            position: 45,
            tooltip: 'csv2shapefile.tooltip',
            tool: connect(
                (state) => ({
                    active:
                        state.controls &&
                        state.controls.csv2Shapefile &&
                        state.controls.csv2Shapefile.enabled,
                    icon: <Glyphicon glyph="download" />,
                    tooltip: 'csv2shapefile.tooltip',
                    bsStyle:
                        state.controls &&
                        state.controls.csv2Shapefile &&
                        state.controls.csv2Shapefile.enabled
                            ? 'success'
                            : 'primary',
                }),
                {
                    action: toggleControl.bind(null, 'csv2Shapefile', null),
                }
            )(require('@js/plugins/BarButton')),
            priority: 1,
            doNotHide: true,
        },
    }),
    epics: require('./epics'),
};
