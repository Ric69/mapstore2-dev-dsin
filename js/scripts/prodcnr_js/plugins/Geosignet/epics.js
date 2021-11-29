const Rx = require('rxjs');
const { isArray } = require('lodash');

const GeoStoreApi = require('../../../MapStore2/web/client/api/GeoStoreDAO');
const axios = require('../../../MapStore2/web/client/libs/ajax');
const CATEGORIE_GEOSIGNET = 'GEOSIGNET';
const CATEGORIE_GROUP = 'GROUP_GEOSIGNET';

// actions
const {
    ADD_GEOSIGNET,
    DEL_GEOSIGNET,
    SELECT_GEOSIGNET,
    listGeoSignets,
    listGroup,
    setIdGeoSignet,
    selectSignet,
    resetGeosignet,
} = require('./actions');
const {
    INIT_MAP,
    CHANGE_MAP_VIEW,
    changeMapView,
} = require('../../../MapStore2/web/client/actions/map');
const { LOGIN_SUCCESS, LOGOUT } = require('../../../MapStore2/web/client/actions/security');
const { MAP_CONFIG_LOADED } = require('../../../MapStore2/web/client/actions/config');

// selectors
const { mapIdSelector, mapSelector } = require('../../../MapStore2/web/client/selectors/map');

// chargement de la liste des géoSignets
const loadGeoSignet = (action$, store) =>
    action$.ofType(LOGIN_SUCCESS, MAP_CONFIG_LOADED).switchMap(() => {
        const state = store.getState();
        const mapId = mapIdSelector(state) || 'newFront';
        return Rx.Observable.fromPromise(
            axios
                .get(
                    'extjs/search/category/' +
                        CATEGORIE_GEOSIGNET +
                        '/***/mapId,displayName,groupId',
                    GeoStoreApi.addBaseUrl()
                )
                .then(function(response) {
                    return response.data;
                })
        )
            .switchMap((data) => {
                if (isArray(data.results)) {
                    return Rx.Observable.of(
                        listGeoSignets(
                            data.results.map((elem) => {
                                return {
                                    name: elem.displayName,
                                    owner: elem.owner,
                                    id: elem.id,
                                    mapId: parseInt(elem.mapId || mapId),
                                    groupId: parseInt(elem.groupId),
                                };
                            })
                        )
                    );
                } else {
                    return Rx.Observable.of(
                        listGeoSignets([
                            {
                                name: data.results.displayName,
                                owner: data.results.owner,
                                id: data.results.id,
                                mapId: data.results.mapId || mapId,
                                groupId: parseInt(elem.groupId),
                            },
                        ])
                    );
                }
            })
            .catch(() => Rx.Observable.empty());
    });

const removeGeoSignets = (action$) =>
    action$.ofType(LOGOUT).switchMap(() => {
        return Rx.Observable.of(resetGeosignet());
    });

const loadGroup = (action$, store) =>
    action$.ofType(LOGIN_SUCCESS, MAP_CONFIG_LOADED).switchMap(() => {
        const state = store.getState();
        const mapId = mapIdSelector(state) || 'newFront';
        return Rx.Observable.fromPromise(
            axios
                .get(
                    'extjs/search/category/' + CATEGORIE_GROUP + '/***/mapId,displayName',
                    GeoStoreApi.addBaseUrl()
                )
                .then(function(response) {
                    return response.data;
                })
        )
            .switchMap((data) => {
                if (isArray(data.results)) {
                    return Rx.Observable.of(
                        listGroup(
                            data.results.map((elem) => {
                                return {
                                    name: elem.displayName,
                                    id: elem.id,
                                    mapId: parseInt(elem.mapId || mapId),
                                };
                            })
                        )
                    );
                } else {
                    return Rx.Observable.of(
                        listGroup([
                            {
                                name: data.results.displayName,
                                id: data.results.id,
                                mapId: data.results.mapId || mapId,
                            },
                        ])
                    );
                }
            })
            .catch(() => Rx.Observable.empty());
    });

module.exports = {
    loadGeoSignet,
    loadGroup,
    removeGeoSignets,
};
