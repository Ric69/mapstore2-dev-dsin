const { DISABLE_MAP_WINDOW, ENABLE_MAP_WINDOW } = require('@js/plugins/WindowModal/actions');

const initialState = {
    maps: [],
};

const findExistMap = (maps, mapId) => (maps || []).filter((map) => map.mapId === mapId);

const WindowMapReducer = (state = initialState, action) => {
    switch (action.type) {
        case DISABLE_MAP_WINDOW: {
            const exists = findExistMap(state.maps, action.mapId);
            if (exists.length <= 0) {
                return {
                    ...state,
                    maps: [...state.maps, { mapId: action.mapId, timestamp: action.timestamp }],
                };
            }
            return state;
        }
        case ENABLE_MAP_WINDOW: {
            const exists = findExistMap(state.maps, action.mapId);
            if (exists.length > 0) {
                return {
                    ...state,
                    maps: state.maps.filter((map) => map.mapId !== action.mapId),
                };
            }
            return state;
        }
        default:
            return state;
    }
};

module.exports = WindowMapReducer;
