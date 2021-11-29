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

const { toggleStreetViewState } = require('./actions');
const { toggleControl } = require('../../../MapStore2/web/client/actions/controls');
const { changeMousePointer } = require('../../../MapStore2/web/client/actions/map');
const Message = require('../../../MapStore2/web/client/plugins/locale/Message');

const mapStateToProps = (state) => ({});

// // La liste des fonctions renvoyant certaines actions
const mapDispatchToProps = {
    onClick: () => {
        toggleControl.bind(null, 'streetView', null);
        toggleStreetViewState();
        changeMousePointer();
    },
};

class Empty extends React.Component {
    render() {
        return null;
    }
}

const StreetViewPlugin = connect(
    mapStateToProps,
    mapDispatchToProps
)(Empty);

require('../../../assets/img/cursor2.png');
require('./style.css');

module.exports = {
    StreetViewPlugin: assign(StreetViewPlugin, {
        disablePluginIf: "{state('mapType') === 'cesium'}",
        Toolbar: {
            name: 'streetView',
            position: 6,
            tooltip: 'streetView.tooltip',
            icon: <span className="icon-man" />,
            help: <Message msgId="helptexts.streetView" />,
            action: toggleControl.bind(null, 'streetView', null),
            selector: (state) => ({
                bsStyle:
                    state.controls.streetView && state.controls.streetView.enabled
                        ? 'success'
                        : 'primary',
                active: (state.controls.streetView && state.controls.streetView.enabled) || false,
            }),
        },
    }),
    epics: require('./epics'),
};
