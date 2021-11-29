export const INIT_PLUGIN = 'SEISME:INIT_PLUGIN';
export const EDIT_SEISME = 'SEISME:EDIT';
export const OPEN_EDITOR = 'SEISME:OPEN_EDITOR';
export const SHOW_SEISME = 'SEISME:SHOW';
export const NEW_SEISME = 'SEISME:NEW';
export const REMOVE_SEISME = 'SEISME:REMOVE';
export const REMOVE_SEISME_GEOMETRY = 'SEISME:REMOVE_GEOMETRY';
export const CONFIRM_REMOVE_SEISME = 'SEISME:CONFIRM_REMOVE';
export const CANCEL_REMOVE_SEISME = 'SEISME:CANCEL_REMOVE';
export const CANCEL_EDIT_SEISME = 'SEISME:CANCEL_EDIT';
export const CANCEL_SHOW_SEISME = 'SEISME:CANCEL_SHOW';
export const SAVE_SEISME = 'SEISME:SAVE';
export const TOGGLE_ADD = 'SEISME:TOGGLE_ADD';
export const TOGGLE_STYLE = 'SEISME:TOGGLE_STYLE';
export const SET_STYLE = 'SEISME:SET_STYLE';
export const RESTORE_STYLE = 'SEISME:RESTORE_STYLE';
export const UPDATE_SEISME_GEOMETRY = 'SEISME:UPDATE_GEOMETRY';
export const SET_INVALID_SELECTED = 'SEISME:SET_INVALID_SELECTED';
export const VALIDATION_ERROR = 'SEISME:VALIDATION_ERROR';
export const HIGHLIGHT = 'SEISME:HIGHLIGHT';
export const CLEAN_HIGHLIGHT = 'SEISME:CLEAN_HIGHLIGHT';
export const FILTER_SEISME = 'SEISME:FILTER';
export const CLOSE_SEISME = 'SEISME:CLOSE';
export const CONFIRM_CLOSE_SEISME = 'SEISME:CONFIRM_CLOSE';
export const CANCEL_CLOSE_SEISME = 'SEISME:CANCEL_CLOSE';
export const START_DRAWING = 'SEISME:START_DRAWING';
export const UNSAVED_CHANGES = 'SEISME:UNSAVED_CHANGES';
export const TOGGLE_SEISME_VISIBILITY = 'SEISME:VISIBILITY';
export const TOGGLE_CHANGES_MODAL = 'SEISME:TOGGLE_CHANGES_MODAL';
export const TOGGLE_GEOMETRY_MODAL = 'SEISME:TOGGLE_GEOMETRY_MODAL';
export const CHANGED_PROPERTIES = 'SEISME:CHANGED_PROPERTIES';
export const UNSAVED_STYLE = 'SEISME:UNSAVED_STYLE';
export const TOGGLE_STYLE_MODAL = 'SEISME:TOGGLE_STYLE_MODAL';
export const ADD_TEXT = 'SEISME:ADD_TEXT';
export const DOWNLOAD = 'SEISME:DOWNLOAD';
export const LOAD_SEISME = 'SEISME:LOAD_SEISME';
export const CHANGED_SELECTED = 'SEISME:CHANGED_SELECTED';
export const RESET_COORD_EDITOR = 'SEISME:RESET_COORD_EDITOR';
export const CHANGE_RADIUS = 'SEISME:CHANGE_RADIUS';
export const CHANGE_TEXT = 'SEISME:CHANGE_TEXT';
export const ADD_NEW_FEATURE = 'SEISME:ADD_NEW_FEATURE';
export const SET_EDITING_FEATURE = 'SEISME:SET_EDITING_FEATURE';
export const HIGHLIGHT_POINT = 'SEISME:HIGHLIGHT_POINT';
export const TOGGLE_DELETE_FT_MODAL = 'SEISME:TOGGLE_DELETE_FT_MODAL';
export const CONFIRM_DELETE_FEATURE = 'SEISME:CONFIRM_DELETE_FEATURE';
export const CHANGE_FORMAT = 'SEISME:CHANGE_FORMAT';
export const UPDATE_SYMBOLS = 'SEISME:UPDATE_SYMBOLS';
export const ERROR_SYMBOLS = 'SEISME:ERROR_SYMBOLS';
export const SET_DEFAULT_STYLE = 'SEISME:SET_DEFAULT_STYLE';
export const LOAD_DEFAULT_STYLES = 'SEISME:LOAD_DEFAULT_STYLES';
export const LOADING = 'SEISME:LOADING';
export const CHANGE_GEOMETRY_TITLE = 'SEISME:CHANGE_GEOMETRY_TITLE';
export const FILTER_MARKER = 'SEISME:FILTER_MARKER';
export const HIDE_MEASURE_WARNING = 'SEISME:HIDE_MEASURE_WARNING';
export const TOGGLE_SHOW_AGAIN = 'SEISME:TOGGLE_SHOW_AGAIN';
export const GEOMETRY_HIGHLIGHT = 'SEISME:GEOMETRY_HIGHLIGHT';
export const UNSELECT_FEATURE = 'SEISME:UNSELECT_FEATURE';

export const initPlugin = () => ({
    type: INIT_PLUGIN
});

export const updateSymbols = (symbols = []) => ({
    type: UPDATE_SYMBOLS,
    symbols
});
export const setErrorSymbol = (symbolErrors) => ({
    type: ERROR_SYMBOLS,
    symbolErrors
});

export const loadseisme = (features, override = false) => {
    return {
        type: LOAD_SEISME,
        features,
        override
    };
};
export const confirmDeleteFeature = () => {
    return {
        type: CONFIRM_DELETE_FEATURE
    };
};
export const openEditor = (id) => {
    return {
        type: OPEN_EDITOR,
        id
    };
};
export const changeFormat = (format) => {
    return {
        type: CHANGE_FORMAT,
        format
    };
};
export const toggleDeleteFtModal = () => {
    return {
        type: TOGGLE_DELETE_FT_MODAL
    };
};

export const highlightPoint = (point) => {
    return {
        type: HIGHLIGHT_POINT,
        point
    };
};

export const download = (seisme) => {
    return {
        type: DOWNLOAD,
        seisme
    };
};

import { head } from 'lodash';

export const editseisme = (id) => {
    return (dispatch, getState) => {
        const feature = head(head(getState().layers.flat.filter(l => l.id === 'seisme')).features.filter(f => f.properties.id === id));
        if (feature.type === "FeatureCollection") {
            dispatch({
                type: EDIT_SEISME,
                feature,
                featureType: feature.type
            });
        } else {
            dispatch({
                type: EDIT_SEISME,
                feature,
                featureType: feature.geometry.type
            });
        }
    };
};
export const newseisme = () => {
    return {
        type: NEW_SEISME
    };
};
export const changeSelected = (coordinates, radius, text, crs) => {
    return {
        type: CHANGED_SELECTED,
        coordinates,
        radius,
        text,
        crs
    };
};
export const setInvalidSelected = (errorFrom, coordinates) => {
    return {
        type: SET_INVALID_SELECTED,
        errorFrom,
        coordinates
    };
};
export const addText = () => {
    return {
        type: ADD_TEXT
    };
};

export const toggleVisibilitySEISME = (id, visibility) => {
    return {
        type: TOGGLE_SEISME_VISIBILITY,
        id,
        visibility
    };
};

export const changedProperties = (field, value) => {
    return {
        type: CHANGED_PROPERTIES,
        field,
        value
    };
};
export const removeseisme = (id) => {
    return {
        type: REMOVE_SEISME,
        id
    };
};
export const removeseismeGeometry = (id) => {
    return {
        type: REMOVE_SEISME_GEOMETRY,
        id
    };
};
export const confirmRemoveseisme = (id, attribute) => {
    return {
        type: CONFIRM_REMOVE_SEISME,
        id,
        attribute
    };
};
export const cancelRemoveseisme = () => {
    return {
        type: CANCEL_REMOVE_SEISME
    };
};
export const cancelEditseisme = (properties) => {
    return {
        type: CANCEL_EDIT_SEISME,
        properties
    };
};
export const saveseisme = (id, fields, geometry, style, newFeature, properties) => {
    return {
        type: SAVE_SEISME,
        id,
        fields,
        geometry,
        style,
        newFeature,
        properties
    };
};
export const toggleAdd = (featureType) => {
    return {
        type: TOGGLE_ADD,
        featureType
    };
};
export const toggleStyle = (styling) => {
    return {
        type: TOGGLE_STYLE,
        styling
    };
};
export const restoreStyle = () => {
    return {
        type: RESTORE_STYLE
    };
};
export const setStyle = (style) => {
    return {
        type: SET_STYLE,
        style
    };
};
export const updateseismeGeometry = (geometry, textChanged, circleChanged) => {
    return {
        type: UPDATE_SEISME_GEOMETRY,
        geometry,
        textChanged,
        circleChanged
    };
};
export const validationError = (errors) => {
    return {
        type: VALIDATION_ERROR,
        errors
    };
};
export const highlight = (id) => {
    return {
        type: HIGHLIGHT,
        id
    };
};
export const cleanHighlight = () => {
    return {
        type: CLEAN_HIGHLIGHT
    };
};
export const showseisme = (id) => {
    return {
        type: SHOW_SEISME,
        id
    };
};
export const cancelShowseisme = () => {
    return {
        type: CANCEL_SHOW_SEISME
    };
};
export const filterseisme = (filter) => {
    return {
        type: FILTER_SEISME,
        filter
    };
};
export const closeseisme = () => {
    return {
        type: CLOSE_SEISME
    };
};
export const confirmCloseseisme = (properties) => {
    return {
        type: CONFIRM_CLOSE_SEISME,
        properties
    };
};
export const setUnsavedChanges = (unsavedChanges) => {
    return {
        type: UNSAVED_CHANGES,
        unsavedChanges
    };
};
export const setUnsavedStyle = (unsavedStyle) => {
    return {
        type: UNSAVED_STYLE,
        unsavedStyle
    };
};
export const addNewFeature = () => {
    return {
        type: ADD_NEW_FEATURE
    };
};
export const setEditingFeature = (feature) => {
    return {
        type: SET_EDITING_FEATURE,
        feature
    };
};
export const cancelCloseseisme = () => {
    return {
        type: CANCEL_CLOSE_SEISME
    };
};
export const startDrawing = (options = {}) => {
    return {
        type: START_DRAWING,
        options
    };
};
export const toggleUnsavedChangesModal = () => {
    return {
        type: TOGGLE_CHANGES_MODAL
    };
};
export const toggleUnsavedGeometryModal = () => {
    return {
        type: TOGGLE_GEOMETRY_MODAL
    };
};
export const toggleUnsavedStyleModal = () => {
    return {
        type: TOGGLE_STYLE_MODAL
    };
};
export const resetCoordEditor = () => {
    return {
        type: RESET_COORD_EDITOR
    };
};
export const unSelectFeature = () => {
    return {
        type: UNSELECT_FEATURE
    };
};
export const changeRadius = (radius, components, crs) => {
    return {
        type: CHANGE_RADIUS,
        radius,
        components,
        crs
    };
};

export const changeText = (text, components) => {
    return {
        type: CHANGE_TEXT,
        text,
        components
    };
};

export const setDefaultStyle = (path, style) => ({
    type: SET_DEFAULT_STYLE,
    path,
    style
});

export const loadDefaultStyles = (shape, size, fillColor, strokeColor, symbolsPath) => ({
    type: LOAD_DEFAULT_STYLES,
    shape,
    size,
    fillColor,
    strokeColor,
    symbolsPath
});

export const changeGeometryTitle = (title) => ({
    type: CHANGE_GEOMETRY_TITLE,
    title
});

export const loading = (value, name = "loading") => ({
    type: LOADING,
    name,
    value
});

export const filterMarker = (filter) => ({
    type: FILTER_MARKER,
    filter
});


export const geometryHighlight = (id, state) => ({
    type: GEOMETRY_HIGHLIGHT,
    id,
    state
});

export const hideMeasureWarning = () => ({
    type: HIDE_MEASURE_WARNING
});

export const toggleShowAgain = () => ({
    type: TOGGLE_SHOW_AGAIN
});
