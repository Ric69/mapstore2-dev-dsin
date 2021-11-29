const {
    ADD_GEOSIGNET,
    ADD_GROUP,
    UPDATE_GEOSIGNET,
    DEL_GEOSIGNET,
    DEL_GROUP,
    LIST_GEOSIGNET,
    LIST_GROUP,
    SET_ID_GEOSIGNET,
    FILTER_GEOSIGNET,
    SELECT_GEOSIGNET,
    RESET_GEOSIGNET,
} = require('./actions');
const { INIT_MAP, CHANGE_MAP_VIEW } = require('../../../MapStore2/web/client/actions/map');
const assign = require('object-assign');

// La méthode appelée lors d'une action
function geoSignetReducer(state = {}, action) {
    switch (action.type) {
        case ADD_GEOSIGNET: {
            const payload = action.payload;
            let signet = {
                name: payload.name,
                owner: payload.owner,
                id: payload.id,
                map: payload.map,
                mapId: parseInt(payload.map.mapId),
                groupId: parseInt(payload.groupId),
            };
            let list = (state.list || []).slice().concat(signet);
            return assign({}, state, { list, selected: signet });
        }
        case ADD_GROUP: {
            return {
                ...state,
                group: [
                    ...(state.group || []),
                    {
                        name: action.payload.name,
                        id: action.payload.id,
                        mapId: parseInt(action.payload.mapId),
                    },
                ],
            };
        }
        case UPDATE_GEOSIGNET: {
            let oldSignet = state.list.find((elem) => elem.id === action.id);
            if (oldSignet === undefined) return state;
            let list = (state.list || []).filter((s) => s !== oldSignet);
            let newSignet = {
                name: action.name || oldSignet.name || '',
                id: oldSignet.id,
                map: action.map || oldSignet.map || null,
                mapId: parseInt(oldSignet.mapId),
                owner: oldSignet.owner,
                groupId: parseInt(oldSignet.groupId),
            };
            return assign({}, state, { list: list.concat(newSignet) });
        }
        case RESET_GEOSIGNET: {
            return { ...state, list: [], selected: {} };
        }
        case DEL_GEOSIGNET: {
            if (action.id != null) {
                return assign({}, state, {
                    list: (state.list || []).filter((signet) => signet.id !== action.id),
                });
            } else {
                return assign({}, state, {
                    list: (state.list || []).filter(
                        (signet) => signet.id !== null || signet.name !== action.name
                    ),
                });
            }
        }
        case DEL_GROUP: {
            if (action.id !== null) {
                return assign({}, state, {
                    group: (state.group || []).filter((g) => g.id !== action.id),
                });
            }
        }
        case LIST_GEOSIGNET: {
            let list = (action.list || [])
                .filter((s) => !isNaN(parseInt(s.mapId || 0)))
                .map((s) => {
                    return {
                        name: s.name || '',
                        owner: s.owner || '',
                        id: s.id || null,
                        map: s.map || null,
                        mapId: parseInt(s.mapId || 0),
                        groupId: parseInt(s.groupId) || null,
                    };
                });
            return assign({}, state, { list: list || [] });
        }
        case LIST_GROUP: {
            let list = (action.list || [])
                .filter((g) => !isNaN(parseInt(g.mapId || 0)))
                .map((g) => {
                    return {
                        name: g.name || '',
                        id: g.id || '',
                        mapId: parseInt(g.mapId || 0),
                    };
                });
            return assign({}, state, { group: list || [] });
        }
        case FILTER_GEOSIGNET: {
            return assign({}, state, { filter: action.text || '' });
        }
        case SELECT_GEOSIGNET: {
            return assign({}, state, { selected: action.signet || {} });
        }
        case CHANGE_MAP_VIEW: {
            let selectedMap = (state.selected && state.selected.map) || null;
            if (
                selectedMap !== null &&
                (action.center.x.toFixed(3) !== selectedMap.center.x.toFixed(3) ||
                    action.center.y.toFixed(3) !== selectedMap.center.y.toFixed(3) ||
                    action.center.crs !== selectedMap.center.crs ||
                    action.zoom !== selectedMap.zoom)
            ) {
                return assign({}, state, { selected: {} });
            } else {
                return state;
            }
        }
        default:
            return state;
    }
}

module.exports = geoSignetReducer;
