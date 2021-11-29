/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const {connect} = require('../utils/PluginsUtils');
const assign = require('object-assign');
const Message = require('../components/I18N/Message');
const PropTypes = require('prop-types');

const {Glyphicon} = require('react-bootstrap');
const {on, toggleControl} = require('../actions/controls');
const {createSelector} = require('reselect');

const {cancelRemoveSeisme, confirmRemoveSeisme, editSeisme, newSeisme, removeSeisme, cancelEditSeisme,
    saveSeisme, toggleAdd, validationError, removeSeismeGeometry, toggleStyle, setStyle, restoreStyle,
    highlight, cleanHighlight, showSeisme, cancelShowSeisme, filterSeismes, closeSeismes,
    cancelCloseSeismes, confirmCloseSeismes, startDrawing, setUnsavedChanges, toggleUnsavedChangesModal,
    changedProperties, setUnsavedStyle, toggleUnsavedStyleModal, addText, download, loadSeismes,
    changeSelected, resetCoordEditor, changeRadius, changeText, toggleUnsavedGeometryModal, addNewFeature, setInvalidSelected,
    highlightPoint, confirmDeleteFeature, toggleDeleteFtModal, changeFormat, openEditor, updateSymbols, changePointType,
    setErrorSymbol
} = require('../actions/seisme');

const { zoomToExtent } = require('../actions/map');

const { seismesInfoSelector, seismesListSelector } = require('../selectors/seismes');
const { mapLayoutValuesSelector } = require('../selectors/maplayout');
const commonEditorActions = {
    onUpdateSymbols: updateSymbols,
    onSetErrorSymbol: setErrorSymbol,
    onEdit: editSeisme,
    onCancelEdit: cancelEditSeisme,
    onChangePointType: changePointType,
    onChangeFormat: changeFormat,
    onConfirmDeleteFeature: confirmDeleteFeature,
    onCleanHighlight: cleanHighlight,
    onHighlightPoint: highlightPoint,
    onHighlight: highlight,
    onError: validationError,
    onSave: saveSeisme,
    onRemove: removeSeisme,
    onAddGeometry: toggleAdd,
    onAddText: addText,
    onSetUnsavedChanges: setUnsavedChanges,
    onSetUnsavedStyle: setUnsavedStyle,
    onChangeProperties: changedProperties,
    onToggleDeleteFtModal: toggleDeleteFtModal,
    onToggleUnsavedChangesModal: toggleUnsavedChangesModal,
    onToggleUnsavedGeometryModal: toggleUnsavedGeometryModal,
    onToggleUnsavedStyleModal: toggleUnsavedStyleModal,
    onAddNewFeature: addNewFeature,
    onResetCoordEditor: resetCoordEditor,
    onStyleGeometry: toggleStyle,
    onCancelStyle: restoreStyle,
    onChangeSelected: changeSelected,
    onSaveStyle: toggleStyle,
    onSetStyle: setStyle,
    onStartDrawing: startDrawing,
    onDeleteGeometry: removeSeismeGeometry,
    onZoom: zoomToExtent,
    onChangeRadius: changeRadius,
    onSetInvalidSelected: setInvalidSelected,
    onChangeText: changeText,
    onCancelRemove: cancelRemoveSeisme,
    onCancelClose: cancelCloseSeismes,
    onConfirmClose: confirmCloseSeismes,
    onConfirmRemove: confirmRemoveSeisme,
    onDownload: download
};
const SeismesEditor = connect(seismesInfoSelector,
    {
        onCancel: cancelShowSeisme,
        ...commonEditorActions
    })(require('../components/mapcontrols/seismes/seismesEditor'));

const SeismesInfoViewer = connect(SeismesInfoSelector,
    {
        ...commonEditorActions,
        onEdit: openEditor
    })(require('../components/mapcontrols/seismes/seismesEditor'));

const panelSelector = createSelector([seismesListSelector], (list) => ({
    ...list,
    editor: SeismesEditor
}));

const Seismes = connect(panelSelector, {
    onCancelRemove: cancelRemoveSeisme,
    onCancelStyle: restoreStyle,
    onCancelEdit: cancelEditSeisme,
    onToggleUnsavedChangesModal: toggleUnsavedChangesModal,
    onToggleUnsavedStyleModal: toggleUnsavedStyleModal,
    onToggleUnsavedGeometryModal: toggleUnsavedGeometryModal,
    onConfirmRemove: confirmRemoveSeisme,
    onCancelClose: cancelCloseSeismes,
    onConfirmClose: confirmCloseSeismes,
    onAdd: newSeisme,
    onHighlight: highlight,
    onCleanHighlight: cleanHighlight,
    onDetail: showSeisme,
    onFilter: filterSeismes,
    onDownload: download,
    onLoadSeismes: loadSeismes
})(require('../components/mapcontrols/seismes/seismes'));

const ContainerDimensions = require('react-container-dimensions').default;
const Dock = require('react-dock').default;

class SeismesPanel extends React.Component {
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
        width: PropTypes.number
    };


    static defaultProps = {
        id: "mapstore-seismes-panel",
        active: false,
        wrap: false,
        modal: true,
        wrapWithPanel: false,
        panelStyle: {
            zIndex: 100,
            overflow: "hidden",
            height: "100%"
        },
        panelClassName: "seismes-panel",
        toggleControl: () => {},
        closeGlyph: "1-close",

        // side panel properties
        width: 660,
        dockProps: {
            dimMode: "none",
            size: 0.30,
            fluid: true,
            position: "right",
            zIndex: 1030
        },
        dockStyle: {}
    };

    render() {
        return this.props.active ? (
            <ContainerDimensions>
                { ({ width }) =>
                    <span className="ms-seismes-panel react-dock-no-resize ms-absolute-dock ms-side-panel">
                        <Dock
                            dockStyle={this.props.dockStyle} {...this.props.dockProps}
                            isVisible={this.props.active}
                            size={this.props.width / width > 1 ? 1 : this.props.width / width} >
                            <Seismes {...this.props} width={this.props.width}/>
                        </Dock>
                    </span>
                }
            </ContainerDimensions>
        ) : null;
    }
}

const conditionalToggle = on.bind(null, toggleControl('seismes', null), (state) =>
    !(state.controls && state.controls.seismes && state.controls.seismes.enabled && state.seismes && state.seismes.editing)
, closeSeismes);

/**
  * Annotations Plugin. Implements annotations handling on maps.
  * Adds:
  *  - a new vector layer, with id 'annotations', to show user created annotations on the map
  *  - a new menu in the BurgerMenu to handle current annotations
  *  - a custom template for Identify applied to annotations geometries that also allows editing {@link #components.mapControls.annotations.AnnotationsEditor}
  *  - styling of the annotation
  * Annotations are geometries (currently only markers are supported) with a set of properties. By default a title and
  * a description are managed, but you can configure a different set of fields, and other stuff in localConfig.json.
  * Look at {@link #components.mapControls.annotations.AnnotationsConfig} for more documentation on configuration options
  * @prop {object[]} lineDashOptions [{value: [line1 gap1 line2 gap2 line3...]}, {...}] defines how dahsed lines are displayed.
  * Use values without unit identifier.
  * If an odd number of values is inserted then they are added again to reach an even number of values
  * for more information see [this page](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray)
  * @prop {string} symbolsPath the relative path to the symbols folder where symbols.json and SVGs are located (starting from the index.html folder, i.e. the root)
  * @prop {string} defaultShape the default symbol used when switching to the symbol styler from marker styler
  * @class Annotations
  * @memberof plugins
  * @static
  */

const seismesSelector = createSelector([
    state => (state.controls && state.controls.seismes && state.controls.seismes.enabled) || (state.seismes && state.seismes.closing) || false,
    state => mapLayoutValuesSelector(state, {height: true})
], (active, dockStyle) => ({
    active,
    dockStyle
}));

const SeismesPlugin = connect(seismesSelector, {
    toggleControl: conditionalToggle
})(SeismesPanel);

module.exports = {
    SeismesPlugin: assign(SeismesPlugin, {
        disablePluginIf: "{state('mapType') === 'cesium' || state('mapType') === 'leaflet' }"
    }, {
        BurgerMenu: {
            name: 'seismes',
            position: 40,
            text: <Message msgId="seismesbutton"/>,
            icon: <Glyphicon glyph="comment"/>,
            action: conditionalToggle,
            priority: 2,
            doNotHide: true
        }
    }),
    reducers: {
        seismes: require('../reducers/seismes')
    },
    epics: require('../epics/seismes')(SeismesInfoViewer)
};
