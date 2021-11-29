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

const ProjectionsCSVComponent = require('./components/ProjectionsCSV');
const ProjectionsEpics = require('./epics');

const { toggleControl } = require('@mapstore/actions/controls');
const Message = require('@mapstore/plugins/locale/Message');

const mapStateToProps = (state) => ({
    active:
        (state.controls && state.controls.projection && state.controls.projection.enabled) || false,
});

// // La liste des fonctions renvoyant certaines actions
const mapDispatchToProps = {
    onClose: toggleControl.bind(null, 'projection', null),
};

/**
 * Plugin de projection : Permet de convertir un fichier CSV(X,Y,Z) dans une projection à une autre
 * @class
 * @name Index
 * @memberof plugins
 */
const Index = connect(
    mapStateToProps,
    mapDispatchToProps
)(ProjectionsCSVComponent);

module.exports = {
    ProjectionsPlugin: assign(Index, {
        disablePluginIf: "{state('mapType') === 'cesium'}",
        BurgerMenu: {
            name: 'projection',
            position: 5,
            panel: false,
            tooltip: 'projection.tooltip',
            text: <Message msgId="projection.tooltip" />,
            icon: <Glyphicon glyph="random" />,
            action: toggleControl.bind(null, 'projection', null),
            priority: 2,
            doNotHide: true,
        },
        OmniBar: {
            name: 'projection',
            position: 4,
            tooltip: 'projection.tooltip',
            tool: connect(
                (state) => ({
                    active:
                        state.controls &&
                        state.controls.projection &&
                        state.controls.projection.enabled,
                    icon: <Glyphicon glyph="random" />,
                    tooltip: 'projection.tooltip',
                    bsStyle:
                        state.controls &&
                        state.controls.projection &&
                        state.controls.projection.enabled
                            ? 'success'
                            : 'primary',
                }),
                {
                    action: toggleControl.bind(null, 'projection', null),
                }
            )(require('@js/plugins/BarButton')),
            priority: 1,
            doNotHide: true,
        },
    }),
    epics: {
        ...ProjectionsEpics,
    },
    /**
     * Gestion des projections non globales
     */
    Lambert93: require('./EPSG/Lambert93'),
    LambertZoneNord: require('./EPSG/LambertZoneNord'),
    LambertZoneCentre: require('./EPSG/LambertZoneCentre'),
    LambertZoneCentreEtendue: require('./EPSG/LambertZoneCentreEtendue'),
    LambertZoneSud: require('./EPSG/LambertZoneSud'),
};
