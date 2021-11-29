const SET_MAP_WIDGETS = 'WIDGETS:SET_MAP_WIDGETS';
const ADD_WIDGET = 'WIDGETS:ADD_WIDGET';
const REMOVE_WIDGET = 'WIDGETS:REMOVE_WIDGET';
const RESET_MAP_WIDGETS = 'WIDGETS:RESET_MAP_WIDGETS';
const UPDATE_WIDGETS = 'WIDGETS:UPDATE_WIDGETS';

/**
 * @param widgets
 * @returns {{type: string, widgets: *}}
 */
const setMapWidgets = (widgets) => {
    return {
        type: SET_MAP_WIDGETS,
        widgets,
    };
};

/**
 * Ajout d'un widget
 * @param widget
 * @returns {{widget: *, type: string}}
 */
function addWidget(widget) {
    return {
        type: ADD_WIDGET,
        widget,
    };
}

/**
 * Suppression d'un widget
 * @param widget
 * @returns {{widget: *, type: string}}
 */
function removeWidget(widget) {
    return {
        type: REMOVE_WIDGET,
        widget,
    };
}

/**
 * Activation de l'ensemble des widgets
 * @returns {{type: string}}
 */
const resetWidgets = () => {
    return {
        type: RESET_MAP_WIDGETS,
    };
};

/**
 * @author Capgemini
 * updates widgets data
 * @return {action}
 */
function updateWidgets(widgets) {
    return {
        type: UPDATE_WIDGETS,
        widgets,
    };
}

module.exports = {
    ADD_WIDGET,
    REMOVE_WIDGET,
    RESET_MAP_WIDGETS,
    UPDATE_WIDGETS,
    SET_MAP_WIDGETS,
    setMapWidgets,
    addWidget,
    removeWidget,
    resetWidgets,
    updateWidgets,
};
