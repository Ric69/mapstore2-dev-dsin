const TOGGLE_STREET_VIEW_STATE = 'TOGGLE_STREET_VIEW_STATE';

function toggleStreetViewState() {
    return {
        type: TOGGLE_STREET_VIEW_STATE,
    };
}

module.exports = { TOGGLE_STREET_VIEW_STATE, toggleStreetViewState };
