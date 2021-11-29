const GeoStoreApi = require('../../../MapStore2/web/client/api/GeoStoreDAO');
const axios = require('../../../MapStore2/web/client/libs/ajax');
const CATEGORIE_NOTIFY = 'NOTIFY';
const CREATE_NEW = 'EMAIL_NOTIFICATIONS:NEW';
const INIT_NOTIFICATIONS_LIST = 'EMAIL_NOTIFICATIONS:INIT_LIST';
const USER_LIST = 'EMAIL_NOTIFICATIONS:AVAILABLE_USERS';
const SELECTED_USERS = 'EMAIL_NOTIFICATIONS:SELECTED_USERS';
const SELECTED_LAYER = 'EMAIL_NOTIFICATIONS:SELECTED_LAYER';
const ATTRIBUTES_LIST = 'EMAIL_NOTIFICATIONS:ATTRIBUTES_LIST';
const SELECTED_TITLE = 'EMAIL_NOTIFICATIONS:CHANGE_TITLE';
const SELECTED_CONTENT = 'EMAIL_NOTIFICATIONS:SELECTED_CONTENT';
const SELECTED_RULES = 'EMAIL_NOTIFICATIONS:SELECTED_RULES';
const CANCEL_EDITION = 'EMAIL_NOTIFICATIONS:CANCEL_EDITION';
const CLOSE = 'EMAIL_NOTIFICATIONS:CLOSE';
const CANCEL_CLOSE = 'EMAIL_NOTIFICATIONS:CANCEL_CLOSE';
const SAVE_NOTIFICATION = 'EMAIL_NOTIFICATIONS:SAVE';
const MODIF_NOTIFICATION = 'EMAIL_NOTIFICATIONS:MODIF';
const DELETE_NOTIFICATION = 'EMAIL_NOTIFICATIONS:DELETE';
const SELECTED_ATTRIBUTES = 'EMAIL_NOTIFICATIONS:SELECTED_ATTRIBUTES';
const SELECTED_FREQUENCY = 'EMAIL_NOTIFICATIONS:SELECTED_FREQUENCY';
const TOGGLE_SUPPORT = 'EMAIL_NOTIFICATIONS:TOGGLE_SUPPORT';
const DISABLE_SUPPORT = 'EMAIL_NOTIFICATIONS:DISABLE_SUPPORT';
const SET_GEOMETRY = 'EMAIL_NOTIFICATIONS:SET_GEOMETRY';
const {
    CHANGE_DRAWING_STATUS,
    drawSupportReset,
} = require('../../../MapStore2/web/client/actions/draw');
const { zoomToExtent } = require('../../../MapStore2/web/client/actions/map');
const { toggleControl } = require('../../../MapStore2/web/client/actions/controls');
const GeoProcess = require('../GeoProcessing/utils/GeoProcess');

function initNotificationsList(list) {
    return {
        type: INIT_NOTIFICATIONS_LIST,
        list,
    };
}

function newNotification() {
    return {
        type: CREATE_NEW,
    };
}

function setUserList(users) {
    return {
        type: USER_LIST,
        users,
    };
}

function updateSelectedUsers(users) {
    return {
        type: SELECTED_USERS,
        users,
    };
}

function selectFrequency(frequence) {
    return {
        type: SELECTED_FREQUENCY,
        frequence,
    };
}

function updateListAttributes(attributes) {
    return {
        type: ATTRIBUTES_LIST,
        attributes,
    };
}

function updateSelectedLayer(layer) {
    return {
        type: SELECTED_LAYER,
        layer,
    };
}

function onTitleChange(title) {
    return {
        type: SELECTED_TITLE,
        title,
    };
}

function onContentChange(content) {
    return {
        type: SELECTED_CONTENT,
        content,
    };
}

function cancelEdition() {
    return {
        type: CANCEL_EDITION,
    };
}

function closeNotify() {
    return {
        type: CLOSE,
    };
}
function onCancelClose() {
    return {
        type: CANCEL_CLOSE,
    };
}

function saveNotification(id, name, description) {
    return {
        type: SAVE_NOTIFICATION,
        id,
        name,
        description,
    };
}

function onSaveNotification(id, name, description) {
    return (dispatch) => {
        dispatch(saveNotification(id, name, description));
        dispatch(drawSupportReset('notify'));
    };
}

function modifyNotification(id, title, content, users, layer, geometry) {
    return {
        type: MODIF_NOTIFICATION,
        id,
        title,
        content,
        users,
        layer,
        geometry,
    };
}

function onConfirmClose() {
    return (dispatch) => {
        dispatch(drawSupportReset('notify'));
        dispatch(cancelEdition());
        dispatch(toggleControl('notify'));
    };
}

function onDeleteNotification(id) {
    return {
        type: DELETE_NOTIFICATION,
        id,
    };
}

function updateSelectedRules(filterRules) {
    return {
        type: SELECTED_RULES,
        filterRules,
    };
}

function updateSelectedAttributes(selectedAttributes) {
    return {
        type: SELECTED_ATTRIBUTES,
        selectedAttributes,
    };
}

function onAddGeometry(drawing, feature, crs) {
    return {
        type: CHANGE_DRAWING_STATUS,
        status: 'drawOrEdit',
        method: 'Polygon',
        owner: 'notify',
        features: !!feature ? [feature] : [],
        options: {
            featureProjection: crs,
            stopAfterDrawing: !!feature.newFeature,
            editEnabled: drawing && !feature.newFeature,
            drawEnabled: drawing && !!feature.newFeature,
        },
        style: {},
    };
}

function cancelEdit() {
    return (dispatch) => {
        dispatch(drawSupportReset('notify'));
        dispatch(cancelEdition());
    };
}

function selectLayer(layerName) {
    return (dispatch) => {
        dispatch(updateSelectedLayer(layerName));
        GeoProcess.getSourceWFS({
            request: 'describeFeatureType',
            version: '1.3.0',
            typeName: layerName,
        })
            .then(
                (response) => {
                    if (
                        typeof response.data === 'object' &&
                        Array.isArray(response.data.featureTypes) &&
                        typeof response.data.featureTypes[0] === 'object' &&
                        Array.isArray(response.data.featureTypes[0].properties)
                    ) {
                        return response.data.featureTypes[0].properties.map((property) => {
                            return {
                                name: property.name,
                                type: property.localType,
                                isGeometry: property.type.startsWith('gml:'),
                            };
                        });
                    } else {
                        return [];
                    }
                },
                () => []
            )
            .then((attributes) => dispatch(updateListAttributes(attributes)));
    };
}

function initNotifications() {
    return (dispatch) => {
        axios
            .get(
                'extjs/search/category/' + CATEGORIE_NOTIFY + '/***/name,description',
                GeoStoreApi.addBaseUrl()
            )
            .then(
                (response) => response.data,
                (error) => {
                    return { totalCount: 0, results: [] };
                }
            )
            .then((data) => {
                if (data.totalCount === 0) {
                    dispatch(initNotificationsList([]));
                } else if (data.totalCount === 1) {
                    dispatch(initNotificationsList([data.results]));
                } else {
                    dispatch(initNotificationsList(data.results));
                }
            });
    };
}

function onModification(id) {
    return (dispatch) => {
        GeoStoreApi.getData(id).then((data) => {
            dispatch(
                modifyNotification(
                    id,
                    data.title,
                    data.content,
                    data.users,
                    data.layer,
                    data.geometry
                )
            );
            GeoProcess.getSourceWFS({
                request: 'describeFeatureType',
                version: '1.3.0',
                typeName: data.layer,
            })
                .then(
                    (response) => {
                        if (
                            typeof response.data === 'object' &&
                            Array.isArray(response.data.featureTypes) &&
                            typeof response.data.featureTypes[0] === 'object' &&
                            Array.isArray(response.data.featureTypes[0].properties)
                        ) {
                            return response.data.featureTypes[0].properties.map((property) => {
                                return {
                                    name: property.name,
                                    type: property.localType,
                                    isGeometry: property.type.startsWith('gml:'),
                                };
                            });
                        } else {
                            return [];
                        }
                    },
                    (err) => []
                )
                .then((attributes) => {
                    dispatch(updateListAttributes(attributes));
                    dispatch(updateSelectedAttributes(data.attributes));
                    dispatch(updateSelectedRules(data.filters));
                });
            let feature = {
                type: 'Feature',
                id,
                geometry: data.geometry,
                properties: {
                    id,
                },
            };
            dispatch(
                zoomToExtent(getExtent(data.geometry.coordinates[0]), data.crs || 'EPSG:2154')
            );
        });
        axios
            .get('/users', GeoStoreApi.addBaseUrl())
            .then(
                (response) => response.data.UserList,
                (error) => {
                    User: [];
                }
            )
            .then((data) => dispatch(setUserList(data.User.filter((u) => u.name !== 'guest'))));
    };
}

function getExtent(tab) {
    let minx = tab[0][0];
    let miny = tab[0][1];
    let maxx = tab[0][0];
    let maxy = tab[0][1];
    tab.forEach((point) => {
        minx = minx < point[0] ? minx : point[0];
        miny = miny < point[1] ? miny : point[1];
        maxx = maxx > point[0] ? maxx : point[0];
        maxy = maxy > point[1] ? maxy : point[1];
    });
    return {
        minx,
        miny: miny - (maxy - miny) / 3,
        maxx: maxx + (maxx - minx) / 2,
        maxy: maxy + (maxy - miny) / 3,
    };
}

function createNewNotification() {
    return (dispatch) => {
        dispatch(newNotification());
        axios
            .get('/users', GeoStoreApi.addBaseUrl())
            .then(
                (response) => response.data.UserList,
                (error) => {
                    User: [];
                }
            )
            .then((data) => dispatch(setUserList(data.User.filter((u) => u.name !== 'guest'))));
    };
}

/**
 * Active/Désactive le "Support" sur la carte
 * @returns object
 */
const enabledSupport = () => ({
    type: TOGGLE_SUPPORT,
});

/**
 * Désactivation du "Support"
 * @returns {{type: string}}
 */
const disableSupport = () => ({
    type: DISABLE_SUPPORT,
});

const setGeometry = (geometry) => ({
    type: SET_GEOMETRY,
    geometry,
});

module.exports = {
    CLOSE,
    INIT_NOTIFICATIONS_LIST,
    CREATE_NEW,
    USER_LIST,
    SELECTED_USERS,
    SELECTED_LAYER,
    ATTRIBUTES_LIST,
    SELECTED_TITLE,
    SELECTED_CONTENT,
    CANCEL_EDITION,
    CANCEL_CLOSE,
    SAVE_NOTIFICATION,
    MODIF_NOTIFICATION,
    DELETE_NOTIFICATION,
    SELECTED_RULES,
    TOGGLE_SUPPORT,
    SET_GEOMETRY,
    DISABLE_SUPPORT,
    disableSupport,
    setGeometry,
    enabledSupport,
    initNotifications,
    createNewNotification,
    updateSelectedUsers,
    updateListAttributes,
    selectLayer,
    onTitleChange,
    onContentChange,
    onAddGeometry,
    cancelEdit,
    closeNotify,
    onCancelClose,
    onConfirmClose,
    onSaveNotification,
    onModification,
    onDeleteNotification,
    updateSelectedRules,
    updateSelectedAttributes,
    selectFrequency,
    CATEGORIE_NOTIFY,
    SELECTED_ATTRIBUTES,
    SELECTED_FREQUENCY,
};
