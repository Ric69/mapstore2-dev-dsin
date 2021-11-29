const ADD_GEOSIGNET = 'GEOSIGNET:ADD_GEOSIGNET';
const ADD_GROUP = 'GEOSIGNET:ADD_GROUP';
const UPDATE_GEOSIGNET = 'GEOSIGNET:UPDATE_GEOSIGNET';
const SET_ID_GEOSIGNET = 'GEOSIGNET:SET_ID_GEOSIGNET';
const DEL_GEOSIGNET = 'GEOSIGNET:DEL_GEOSIGNET';
const DEL_GROUP = 'GEOSIGNET:DEL_GROUP';
const LIST_GEOSIGNET = 'GEOSIGNET:LIST_GEOSIGNET';
const LIST_GROUP = 'GEOSIGNET:LIST_GROUP';
const FILTER_GEOSIGNET = 'GEOSIGNET:FILTER_GEOSIGNET';
const SELECT_GEOSIGNET = 'GEOSIGNET:SELECT_GEOSIGNET';
const CATEGORIE_GEOSIGNET = 'GEOSIGNET';
const CATEGORIE_GROUP = 'GROUP_GEOSIGNET';
const RESET_GEOSIGNET = 'GEOSIGNET:RESET_GEOSIGNET';

const { changeMapView } = require('../../../MapStore2/web/client/actions/map');

const GeoStoreApi = require('../../../MapStore2/web/client/api/GeoStoreDAO');
const StringUtils = require('../../utils/StringUtils');
const ConfigUtils = require('@mapstore/utils/ConfigUtils');

function addSignet(payload) {
    return {
        type: ADD_GEOSIGNET,
        payload,
    };
}

function addGeoSignet(name, group, map, user) {
    // @Todo réduire la variable map
    return (dispatch) => {
        if (!!user) {
            const metadata = {
                name: map.mapId + '-' + name + '-' + StringUtils.randomString(5),
                attributes: {
                    owner: user,
                    mapId: parseInt(map.mapId),
                    displayName: name,
                    groupId: parseInt(group),
                },
            };
            GeoStoreApi.createResource(metadata, map, CATEGORIE_GEOSIGNET)
                .then((response) => response.data, () => null)
                .then((id) => {
                    const permissions = {
                        SecurityRuleList: {
                            SecurityRule: [
                                {
                                    canRead: true,
                                    canWrite: false,
                                    group: {
                                        groupName: 'everyone',
                                        id: ConfigUtils.getConfigProp('groupEveryoneId'),
                                    },
                                },
                            ],
                        },
                    };
                    GeoStoreApi.updateResourcePermissions(id, permissions);
                    dispatch(addSignet({ name, id, map, owner: user, groupId: parseInt(group) }));
                });
        } else {
            dispatch(addSignet({ name, id: null, map, owner: null, groupId: parseInt(group) }));
        }
    };
}

function addGroupReducer(payload) {
    return {
        type: ADD_GROUP,
        payload,
    };
}

function addGroup(name, map) {
    return (dispatch) => {
        if (!!name) {
            const metadata = {
                name: map.mapId + '-' + name + '-' + StringUtils.randomString(5),
                attributes: { mapId: parseInt(map.mapId), displayName: name },
            };
            GeoStoreApi.createResource(metadata, {}, CATEGORIE_GROUP)
                .then(
                    (data) => {
                        return data.data;
                    },
                    (error) => null
                )
                .then((id) => {
                    const permissions = {
                        SecurityRuleList: {
                            SecurityRule: [
                                {
                                    canRead: true,
                                    canWrite: false,
                                    group: {
                                        groupName: 'everyone',
                                        id: ConfigUtils.getConfigProp('groupEveryoneId'),
                                    },
                                },
                            ],
                        },
                    };
                    GeoStoreApi.updateResourcePermissions(id, permissions);
                    dispatch(addGroupReducer({ name, id, mapId: parseInt(map.mapId) }));
                });
        } else {
            dispatch(addGroupReducer({ name, id: null, mapId: null }));
        }
    };
}

function updateGeoSignet(name, id, map) {
    return {
        type: UPDATE_GEOSIGNET,
        name,
        id,
        map,
    };
}

function setIdGeoSignet(name, id) {
    return {
        type: SET_ID_GEOSIGNET,
        name,
        id,
        map,
    };
}

function deleteSignet(name, id) {
    return {
        type: DEL_GEOSIGNET,
        name,
        id,
    };
}

function deleteGeoSignet(name, id) {
    return (dispatch) => {
        if (!!id) {
            GeoStoreApi.deleteResource(id).then((data) => data, (error) => error);
        }
        dispatch(deleteSignet(name, id));
        dispatch(selectSignet({}));
    };
}

function deleteGroupReducer(id) {
    return {
        type: DEL_GROUP,
        id,
    };
}

function deleteGroup(id, signetsId) {
    return (dispatch) => {
        if (!!id) {
            GeoStoreApi.deleteResource(id).then((data) => data, (error) => error);
        }
        if (!!signetsId) {
            signetsId.map((s) =>
                GeoStoreApi.deleteResource(s).then((data) => data, (error) => error)
            );
        }
        dispatch(deleteGroupReducer(id));
    };
}

function listGeoSignets(list) {
    return {
        type: LIST_GEOSIGNET,
        list,
    };
}

function listGroup(list) {
    return {
        type: LIST_GROUP,
        list,
    };
}

function filterSignets(text) {
    return {
        type: FILTER_GEOSIGNET,
        text,
    };
}

function selectGeoSignet(signet) {
    return {
        type: SELECT_GEOSIGNET,
        signet,
    };
}

function selectSignet(signet) {
    return (dispatch) => {
        dispatch(selectGeoSignet(signet));
        if (!!signet.map) {
            dispatch(
                changeMapView(
                    signet.map.center,
                    signet.map.zoom,
                    signet.map.bbox,
                    signet.map.size,
                    null,
                    signet.map.projection,
                    signet.map.viewerOptions
                )
            );
        }
    };
}

function resetGeosignet() {
    return {
        type: RESET_GEOSIGNET,
    };
}

module.exports = {
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
    addGeoSignet,
    addGroup,
    updateGeoSignet,
    deleteGeoSignet,
    deleteGroup,
    deleteGroupReducer,
    listGeoSignets,
    listGroup,
    setIdGeoSignet,
    filterSignets,
    selectSignet,
    resetGeosignet,
};
