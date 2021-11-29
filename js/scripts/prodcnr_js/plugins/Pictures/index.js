/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const assign = require('object-assign');
const PropTypes = require('prop-types');
const { createSelector } = require('reselect');
const { Glyphicon, Panel } = require('react-bootstrap');
const ContainerDimensions = require('react-container-dimensions').default;
const Dock = require('react-dock').default;

const Message = require('@mapstore/components/I18N/Message');
const { on, toggleControl } = require('@mapstore/actions/controls');
const { connect } = require('@mapstore/utils/PluginsUtils');

const {
    newPicture,
    cancelEditPicture,
    savePicture,
    toggleAdd,
    highlight,
    cleanHighlight,
    closePictures,
    cancelClosePictures,
    initPictureGeometry,
} = require('./actions');

const { picturesInfoSelector, picturesListSelector } = require('./selectors');
const { mapLayoutValuesSelector } = require('@mapstore/selectors/maplayout');

const PicturesEditor = connect(
    picturesInfoSelector,
    {
        onConfirmClose: () => toggleControl('pictures', null),
        onCancel: cancelEditPicture,
        onSave: savePicture,
        onAddGeometry: toggleAdd,
        onInitGeometry: initPictureGeometry,
    }
)(require('./components/PicturesEditor.jsx'));

const panelSelector = createSelector(
    [picturesListSelector],
    (list) => ({
        ...list,
        editor: PicturesEditor,
    })
);

const Pictures = connect(
    panelSelector,
    {
        onCancelClose: cancelClosePictures,
        onConfirmClose: () => toggleControl('pictures', null),
        onAdd: newPicture,
        onHighlight: highlight,
        onCleanHighlight: cleanHighlight,
    }
)(require('./components/Pictures'));

class PicturesPanel extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        active: PropTypes.bool,
        wrap: PropTypes.bool,
        wrapWithPanel: PropTypes.bool,
        panelStyle: PropTypes.object,
        panelClassName: PropTypes.string,
        toggleControl: PropTypes.func,
        closeGlyph: PropTypes.string,
        buttonStyle: PropTypes.object,
        style: PropTypes.object,
        dockProps: PropTypes.object,
        // side panel properties
        width: PropTypes.number,
    };

    static defaultProps = {
        id: 'mapstore-pictures-panel',
        active: false,
        wrap: false,
        modal: true,
        wrapWithPanel: false,
        panelStyle: {
            zIndex: 100,
            overflow: 'hidden',
            height: '100%',
        },
        panelClassName: 'pictures-panel',
        toggleControl: () => {},
        closeGlyph: '1-close',
        // side panel properties
        width: 660,
        dockProps: {
            dimMode: 'none',
            size: 0.3,
            fluid: true,
            position: 'right',
            zIndex: 1030,
        },
        dockStyle: {},
    };

    componentDidUpdate() {
        const PanelElement = document.getElementById(this.props.id);
        if (PanelElement) {
            PanelElement.parentElement.setAttribute('id', 'parent-' + this.props.id);
        }
    }

    render() {
        const panel = <Pictures {...this.props} />;
        const panelHeader = (
            <span>
                <Glyphicon glyph="camera" />{' '}
                <span className="pictures-panel-title">
                    <Message msgId="pictures.title" />
                </span>
                <button
                    key="close"
                    onClick={this.props.toggleControl}
                    className="pictures-close close">
                    {this.props.closeGlyph ? (
                        <Glyphicon glyph={this.props.closeGlyph} />
                    ) : (
                        <span>×</span>
                    )}
                </button>
            </span>
        );

        return this.props.active ? (
            <ContainerDimensions>
                {({ width }) => (
                    <Dock
                        dockStyle={this.props.dockStyle}
                        {...this.props.dockProps}
                        isVisible={this.props.active}
                        size={this.props.width / width > 1 ? 1 : this.props.width / width}>
                        <Panel
                            id={this.props.id}
                            header={panelHeader}
                            style={this.props.panelStyle}
                            className={this.props.panelClassName}>
                            {panel}
                        </Panel>
                    </Dock>
                )}
            </ContainerDimensions>
        ) : null;
    }
}

const conditionalToggle = on.bind(
    null,
    toggleControl('pictures', null),
    (state) =>
        !(
            state.controls &&
            state.controls.pictures &&
            state.controls.pictures.enabled &&
            state.pictures &&
            state.pictures.editing
        ),
    closePictures
);

/**
 * Pictures Plugin. Implements pictures handling on maps.
 * Adds:
 *  - a new vector layer, with id 'pictures', to show user created pictures on the map
 *  - a new menu in the BurgerMenu to handle current pictures
 *  - a custom template for Identify applied to pictures geometries that also allows editing {@link #components.mapControls.pictures.PicturesEditor}
 *  - styling of the picture
 * Pictures are geometries (currently only markers are supported) with a set of properties. By default a title and
 * a description are managed, but you can configure a different set of fields, and other stuff in localConfig.json.
 * Look at {@link #components.mapControls.pictures.PicturesConfig} for more documentation on configuration options
 *
 * @class Pictures
 * @memberof plugins
 * @static
 */

const picturesSelector = createSelector(
    [
        (state) =>
            (state.controls && state.controls.pictures && state.controls.pictures.enabled) ||
            (state.pictures && state.pictures.closing) ||
            false,
        (state) => mapLayoutValuesSelector(state, { height: true }),
    ],
    (active, dockStyle) => ({
        active,
        dockStyle,
    })
);

const PicturesPlugin = connect(
    picturesSelector,
    {
        toggleControl: conditionalToggle,
    }
)(PicturesPanel);

module.exports = {
    PicturesPlugin: assign(PicturesPlugin, {
        disablePluginIf: "{state('mapType') === 'cesium'}",
        BurgerMenu: {
            name: 'pictures',
            position: 6,
            tooltip: 'pictures.tooltip',
            text: <Message msgId="pictures.title" />,
            icon: <Glyphicon glyph="camera" />,
            action: conditionalToggle,
            priority: 1,
            doNotHide: true,
        },
    }),
    reducers: {
        pictures: require('./reducer'),
    },
    epics: require('./epics'),
};
