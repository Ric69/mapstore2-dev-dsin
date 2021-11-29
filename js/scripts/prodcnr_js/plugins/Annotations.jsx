/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const { connect } = require('../../MapStore2/web/client/utils/PluginsUtils');
const assign = require('object-assign');
const Message = require('../../MapStore2/web/client/components/I18N/Message');
const PropTypes = require('prop-types');

const { Glyphicon, Panel } = require('react-bootstrap');
const { on, toggleControl } = require('../../MapStore2/web/client/actions/controls');

const { createSelector } = require('reselect');

const {
    cancelRemoveAnnotation,
    confirmRemoveAnnotation,
    editAnnotation,
    newAnnotation,
    removeAnnotation,
    cancelEditAnnotation,
    saveAnnotation,
    toggleAdd,
    validationError,
    removeAnnotationGeometry,
    toggleStyle,
    setStyle,
    restoreStyle,
    highlight,
    cleanHighlight,
    showAnnotation,
    cancelShowAnnotation,
    filterAnnotations,
    closeAnnotations,
    cancelCloseAnnotations,
    confirmCloseAnnotations,
    startDrawing,
    setUnsavedChanges,
    toggleUnsavedChangesModal,
    changedProperties,
    setUnsavedStyle,
    toggleUnsavedStyleModal,
    addText,
    download,
    loadAnnotations,
    changeSelected,
    resetCoordEditor,
    changeRadius,
    changeText,
    toggleUnsavedGeometryModal,
    addNewFeature,
    setInvalidSelected,
    highlightPoint,
    confirmDeleteFeature,
    toggleDeleteFtModal,
    changeFormat,
    openEditor,
    updateSymbols,
    changePointType,
    setErrorSymbol,
} = require('../../MapStore2/web/client/actions/annotations');

const { zoomToExtent } = require('../../MapStore2/web/client/actions/map');

const { annotationsInfoSelector, annotationsListSelector } = require('../../MapStore2/web/client/selectors/annotations');
const { mapLayoutValuesSelector } = require('../../MapStore2/web/client/selectors/maplayout');
const commonEditorActions = {
    onUpdateSymbols: updateSymbols,
    onSetErrorSymbol: setErrorSymbol,
    onEdit: editAnnotation,
    onCancelEdit: cancelEditAnnotation,
    onChangePointType: changePointType,
    onChangeFormat: changeFormat,
    onConfirmDeleteFeature: confirmDeleteFeature,
    onCleanHighlight: cleanHighlight,
    onHighlightPoint: highlightPoint,
    onHighlight: highlight,
    onError: validationError,
    onSave: saveAnnotation,
    onRemove: removeAnnotation,
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
    onDeleteGeometry: removeAnnotationGeometry,
    onZoom: zoomToExtent,
    onChangeRadius: changeRadius,
    onSetInvalidSelected: setInvalidSelected,
    onChangeText: changeText,
    onCancelRemove: cancelRemoveAnnotation,
    onCancelClose: cancelCloseAnnotations,
    onConfirmClose: confirmCloseAnnotations,
    onConfirmRemove: confirmRemoveAnnotation,
    onDownload: download,
};
const AnnotationsEditor = connect(
    annotationsInfoSelector,
    {
        onCancel: cancelShowAnnotation,
        ...commonEditorActions,
    }
)(require('../../MapStore2/web/client/components/mapcontrols/annotations/AnnotationsEditor'));

const AnnotationsInfoViewer = connect(
    annotationsInfoSelector,
    {
        ...commonEditorActions,
        onEdit: openEditor,
    }
)(require('../../MapStore2/web/client/components/mapcontrols/annotations/AnnotationsEditor'));

const panelSelector = createSelector(
    [annotationsListSelector],
    (list) => ({
        ...list,
        editor: AnnotationsEditor,
    })
);

const Annotations = connect(
    panelSelector,
    {
        onCancelRemove: cancelRemoveAnnotation,
        onCancelStyle: restoreStyle,
        onCancelEdit: cancelEditAnnotation,
        onToggleUnsavedChangesModal: toggleUnsavedChangesModal,
        onToggleUnsavedStyleModal: toggleUnsavedStyleModal,
        onToggleUnsavedGeometryModal: toggleUnsavedGeometryModal,
        onConfirmRemove: confirmRemoveAnnotation,
        onCancelClose: cancelCloseAnnotations,
        onConfirmClose: confirmCloseAnnotations,
        onAdd: newAnnotation,
        onHighlight: highlight,
        onCleanHighlight: cleanHighlight,
        onDetail: showAnnotation,
        onFilter: filterAnnotations,
        onDownload: download,
        onLoadAnnotations: loadAnnotations,
    }
)(require('../../MapStore2/web/client/components/mapcontrols/annotations/Annotations'));

const ContainerDimensions = require('react-container-dimensions').default;
const Dock = require('react-dock').default;

class AnnotationsPanel extends React.Component {
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
        id: 'mapstore-annotations-panel',
        active: false,
        wrap: false,
        modal: true,
        wrapWithPanel: false,
        panelStyle: {
            zIndex: 100,
            overflow: 'hidden',
            height: '100%',
        },
        panelClassName: 'annotations-panel',
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

    render() {
        return this.props.active ? (
            <ContainerDimensions>
                {({ width }) => (
                    <span className="ms-annotations-panel react-dock-no-resize ms-absolute-dock ms-side-panel">
                        <Dock
                            dockStyle={this.props.dockStyle}
                            {...this.props.dockProps}
                            isVisible={this.props.active}
                            size={this.props.width / width > 1 ? 1 : this.props.width / width}>
                            <Annotations {...this.props} width={this.props.width} />
                        </Dock>
                    </span>
                )}
            </ContainerDimensions>
        ) : null;
    }
}

const conditionalToggle = on.bind(
    null,
    toggleControl('annotations', null),
    (state) =>
        !(state.controls && state.controls.annotations && state.controls.annotations.enabled && state.annotations && state.annotations.editing),
    closeAnnotations
);

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

const annotationsSelector = createSelector(
    [
        (state) =>
            (state.controls && state.controls.annotations && state.controls.annotations.enabled) ||
            (state.annotations && state.annotations.closing) ||
            false,
        (state) => mapLayoutValuesSelector(state, { height: true }),
    ],
    (active, dockStyle) => ({
        active,
        dockStyle,
    })
);

const AnnotationsPlugin = connect(
    annotationsSelector,
    {
        toggleControl: conditionalToggle,
    }
)(AnnotationsPanel);

module.exports = {
    AnnotationsPlugin: assign(AnnotationsPlugin, {
        disablePluginIf: "{state('mapType') === 'cesium'  || state('mapType') === 'leaflet'}",
        Toolbar: {
            name: 'annotations',
            position: 11,
            tooltip: 'annotationsbutton',
            icon: <Glyphicon glyph="comment" />,
            help: <Message msgId="annotationsbutton" />,
            action: conditionalToggle,
            selector: (state) => ({
                bsStyle: state.controls && state.controls.annotations && state.controls.annotations.enabled ? 'success' : 'primary',
                active: !!(state.controls && state.controls.annotations && state.controls.annotations.enabled),
            }),
            alwaysVisible: true,
            doNotHide: true,
            priority: 3,
        },
        BurgerMenu: {
            name: 'annotations',
            position: 40,
            text: <Message msgId="annotationsbutton" />,
            icon: <Glyphicon glyph="comment" />,
            action: conditionalToggle,
            priority: 2,
            doNotHide: true,
        },
    }),
    reducers: {
        annotations: require('../../MapStore2/web/client/reducers/annotations'),
    },
    epics: require('../../MapStore2/web/client/epics/annotations')(AnnotationsInfoViewer),
};
