/**
 * @author Capgemini
 */
const Rx = require('rxjs');
const { isArray } = require('lodash');
const axios = require('../../../MapStore2/web/client/libs/ajax');

const uuid = require('uuid');
const {
    LOAD_FEATURE_INFO_SURVOL_MODE,
    LOAD_FEATURE_INFO_REFRESH_SURVOL,
    FEATURE_INFO_SURVOL,
    GET_VECTOR_INFO_SURVOL,
    featureInfoSurvol,
    purgeMapInfoResults,
    exceptionsFeatureInfo,
    loadFeatureInfoSurvolMode,
    errorFeatureInfo,
    noQueryableLayers,
    getVectorInfoSurvol,
    loadFeatureInfoRefreshForSurvol,
} = require('../../../MapStore2/web/client/actions/mapInfo');

const { LAYER_REFRESHED } = require('../../../MapStore2/web/client/actions/layers');

const { SURVOL_ON_MAP } = require('../../../MapStore2/web/client/actions/map');
const {
    stopGetFeatureInfoSelector,
    queryableLayersSelector,
    survolOptionsSelector,
    mapInfoResponsesVectorSelector,
} = require('../../../MapStore2/web/client/selectors/mapInfo');
const MapInfoUtils = require('../../../MapStore2/web/client/utils/MapInfoUtils');
const { getFeatureData } = require('../Lidar/actions');

/**
 * Sends a GetFeatureInfo request and dispatches the right action
 * in case of success, error or exceptions.
 *
 * @param basePath {string} base path to the service
 * @param requestParams {object} map of params for a getfeatureinfo request.
 */
const getFeatureInfo = (basePath, requestParams, lMetaData, options = {}) => {
    const param = { ...options, ...requestParams };
    /* Forcer le format en application/json pour faciliter le traitement après */
    param.info_format = 'application/json';
    const reqId = uuid.v1();
    const out$ = Rx.Observable.defer(() => axios.get(basePath, { params: param }))
        .map((response) =>
            response.data.exceptions
                ? exceptionsFeatureInfo(reqId, response.data.exceptions, requestParams, lMetaData)
                : loadFeatureInfoSurvolMode(reqId, response.data, requestParams, lMetaData)
        )
        .catch((e) =>
            Rx.Observable.of(
                errorFeatureInfo(
                    reqId,
                    e.data || e.statusText || e.status,
                    requestParams,
                    lMetaData
                )
            )
        );
    return out$;
};

/**
 * @author Capgemini
 * Triggers data load on LAYER_REFRESHED events
 * This event is fired when the layer is refreshed for survolPoint
 */
const getFeatureInfoOnLayerRefreshedForSurvol = (
    action$,
    { getState = () => {}, dispatch = () => {} }
) =>
    action$.ofType(LAYER_REFRESHED).switchMap(({ layerId }) => {
        const queryableLayers = queryableLayersSelector(getState());
        if (queryableLayers.length === 0) {
            Rx.Observable.empty();
        }
        // TODO: make it in the application state
        const state = getState();

        const popupSurvol = state.mapInfo && state.mapInfo.enabledSurvol;
        const out$ = Rx.Observable.from(queryableLayers).mergeMap((layer) => {
            const survolOptions = survolOptionsSelector(state);
            const { point } = survolOptions;
            // Verification de la couche
            // Verification si y'a au moins le mode SURVOL ou une popup ouverte
            // Verification l'existance d'un point
            if (layer.id !== layerId || !popupSurvol || !point) return Rx.Observable.empty();
            const { url, request, metadata } = MapInfoUtils.buildIdentifyRequest(
                layer,
                survolOptions
            );
            if (url) {
                /**
                 * Pour avoir les informations en json
                 */
                axios
                    .get(url, {
                        params: Object.assign({}, request, { info_format: 'application/json' }),
                    })
                    .then((response) => {
                        if (response.data.features) {
                            dispatch(loadFeatureInfoRefreshForSurvol(layer.title, response.data));
                        }
                    });
            }
            return Rx.Observable.empty();
        });
        return out$;
    });

/**
 * @author Capgemini
 */
const onMapSurvol = (action$, store) =>
    action$
        .ofType(SURVOL_ON_MAP)
        .filter(() => {
            const { enabledSurvol = false } = store.getState().mapInfo;
            return enabledSurvol || !stopGetFeatureInfoSelector(store.getState() || {});
        })
        .map(({ point, layer }) => featureInfoSurvol(point, layer));

/**
 * @author Capgemini
 * handle popup survol when we recieve data from LOAD_FEATURE_INFO_SURVOL_MODE
 */
const handleSurvolPOPUP = (action$) =>
    action$.ofType(LOAD_FEATURE_INFO_SURVOL_MODE).switchMap(({ data, layerMetadata }) => {
        let popUPSurvol = document.getElementById('mypopupSurvol');
        let popUPSurvolCnt = popUPSurvol.getElementsByClassName('ol-popup-cnt')[0];
        let { features } = data;
        if (isArray(features) && features.length > 0) {
            let { id, properties } = features.shift(); // Récupérer les propriétés du premier élément comme demandé
            id = 'popup_survol_attr_' + id;
            let name =
                (properties && properties.NOM) ||
                (properties && properties.nom) ||
                (properties && properties[Object.keys(properties)[0]]) ||
                'Unknown';
            popUPSurvolCnt.innerHTML += `<div class="item"><h4>${
                layerMetadata.title
            }</h4><strong id=${id}>${name}</strong></div>`;
        }
        if (!!popUPSurvolCnt.innerHTML) popUPSurvol.style.display = 'block';
        return Rx.Observable.empty();
    });

/**
 * @author Capgemini
 * refresh popup survol when we recieve data from LOAD_FEATURE_INFO_REFRESH_SURVOL
 */
const refreshSurvolPOPUP = (action$, store) =>
    action$.ofType(LOAD_FEATURE_INFO_REFRESH_SURVOL).switchMap(({ data }) => {
        const state = store.getState();
        if (state.mapInfo && !state.mapInfo.enabledSurvol) return Rx.Observable.empty();
        let { features } = data;
        if (isArray(features) && features.length > 0) {
            // Récupérer les propriétés du premier élément comme demandé
            let { id, properties } = features.shift();
            let name =
                (properties && properties.NOM) ||
                (properties && properties.nom) ||
                (properties && properties[Object.keys(properties)[0]]) ||
                'Unknown';
            const property = document.getElementById('popup_survol_attr_' + id);
            if (!!property) property.innerHTML = name;
        }
        return Rx.Observable.empty();
    });

/**
 * @author Capgemini
 * handle popup survol when we recieve data from LOAD_FEATURE_INFO_SURVOL_MODE
 */
const handleSurvolPOPUPVector = (action$, store) =>
    action$.ofType(GET_VECTOR_INFO_SURVOL).switchMap(({ metadata }) => {
        let popUPSurvol = document.getElementById('mypopupSurvol');
        let popUPSurvolCnt = popUPSurvol.getElementsByClassName('ol-popup-cnt')[0];
        const responsesVector = mapInfoResponsesVectorSelector(store.getState());
        responsesVector.map((elt) => {
            let { features } = elt.response;
            if (isArray(features) && features.length > 0) {
                let { properties } = features.shift(); // Récupérer les propriétés du premier élément comme demandé
                let name =
                    (properties && properties.NOM) ||
                    (properties && properties.nom) ||
                    (properties && properties[Object.keys(properties)[0]]) ||
                    'Unknown';
                popUPSurvolCnt.innerHTML += `<div class="item"><h4>${
                    metadata.title
                }</h4><strong>${name}</strong></div>`;
            }
        });

        if (!!popUPSurvolCnt.innerHTML) popUPSurvol.style.display = 'block';
        return Rx.Observable.empty();
    });

/**
 * @author Capgemini
 * Triggers data load on FEATURE_INFO_SURVOL events
 * This event is fired when we survol on MAP
 */
const getFeatureInfoOnFeatureInfoSurvoled = (action$, store) =>
    action$.ofType(FEATURE_INFO_SURVOL).switchMap(() => {
        const queryableLayers = queryableLayersSelector(store.getState());
        if (queryableLayers.length === 0) {
            return Rx.Observable.of(purgeMapInfoResults(), noQueryableLayers());
        }
        // TODO: make it in the application state
        const excludeParams = ['SLD_BODY'];
        const includeOptions = ['buffer', 'cql_filter', 'filter', 'propertyName'];
        const out$ = Rx.Observable.from(queryableLayers).mergeMap((layer) => {
            const { url, request, metadata } = MapInfoUtils.buildIdentifyRequest(
                layer,
                survolOptionsSelector(store.getState())
            );
            if (url) {
                /**
                 * Pour avoir les informations en json
                 */
                axios
                    .get(url, {
                        params: Object.assign({}, request, { info_format: 'application/json' }),
                    })
                    .then((response) => {
                        if (response.data.features) {
                            let data = {};
                            const key = request.query_layers;
                            data[key] = response.data.features[0];
                            store.dispatch(getFeatureData(data));
                        }
                    });
                return getFeatureInfo(
                    url,
                    request,
                    metadata,
                    MapInfoUtils.filterRequestParams(layer, includeOptions, excludeParams)
                );
            }
            // Capgemini TODO: Améliorer la popup Survol pour les ShapeFile
            return Rx.Observable.of(getVectorInfoSurvol(layer, request, metadata));
        });
        return out$;
    });

/**
 * Epics for Survol and map info
 * @name epics.identify
 * @type {Object}
 */
module.exports = {
    getFeatureInfoOnFeatureInfoSurvoled,
    getFeatureInfoOnLayerRefreshedForSurvol,
    handleSurvolPOPUP,
    handleSurvolPOPUPVector,
    onMapSurvol,
    refreshSurvolPOPUP,
};
