const Rx = require('rxjs');
const { isArray } = require('lodash');
// actions
const {
    CHANGE_DRAWING_STATUS,
    changeDrawingStatus,
    END_DRAWING,
} = require('../../../MapStore2/web/client/actions/draw');
const { changeMapView } = require('../../../MapStore2/web/client/actions/map');
const CoordinatesUtils = require('../../../MapStore2/web/client/utils/CoordinatesUtils');
const {
    activeDrawingSearch,
    changeGeometrySearch,
    desactiveDrawingSearch,
    SHOW_ELEMENT_SEARCH,
} = require('./actions');
const { addLayer } = require('../../../MapStore2/web/client/actions/layers');

const { generateId, groupReqSpat } = require('../../utils/DrawUtils').default;
const { groupsSelector } = require('../../../MapStore2/web/client/plugins/../selectors/layers');

const saveDrawFullTextSearch = (action$, store) =>
    action$.ofType(END_DRAWING).switchMap((action) => {
        const state = store.getState();
        if (state.searchFullText.active) {
            return Rx.Observable.of(
                changeDrawingStatus('stop', 'Polygon', 'queryform', [], { plugin: 'search' }),
                changeGeometrySearch(action.geometry),
                desactiveDrawingSearch()
            );
        }
        return Rx.Observable.empty();
    });

const activeFullText = (action$) =>
    action$.ofType(CHANGE_DRAWING_STATUS).switchMap((action) => {
        if (action.status === 'start' && action.options.plugin === 'search') {
            return Rx.Observable.of(activeDrawingSearch());
        }
        return Rx.Observable.empty();
    });

const showFullTextElement = (action$, store) =>
    action$.ofType(SHOW_ELEMENT_SEARCH).switchMap((action) => {
        const state = store.getState();
        if (state.searchFullText.results.show) {
            const feature = {
                type: 'FeatureCollection',
                features: [
                    {
                        geometry:
                            state.searchFullText.results.data.hits.hits[action.id]._source.geometry,
                        type: 'Feature',
                        id: state.searchFullText.results.data.hits.hits[action.id]._source.uuid,
                    },
                ],
            };

            const id = feature.features[0].id;
            const groups = groupsSelector(state);
            const groupsRechercheFullText = groups.filter((elt) => elt.id === groupReqSpat);
            const nodes =
                isArray(groupsRechercheFullText) && groupsRechercheFullText.length > 0
                    ? groupsRechercheFullText[0].nodes
                    : [];
            // Si la couche n'existe pas déjà, on l'ajoute...

            if (!isArray(nodes) || nodes.map((elt) => elt.id).indexOf(id) === -1) {
                const featureReprojected = CoordinatesUtils.reprojectGeoJson(
                    feature,
                    'EPSG:3857',
                    'EPSG:4326'
                );

                return Rx.Observable.of(
                    addLayer({
                        id: id,
                        geoJson: feature,
                        type: 'wfs',
                        title: 'Req. spatiale ' + generateId(groupReqSpat, state),
                        group: groupReqSpat,
                        visibility: true,
                        opacity: 1,
                        projection: 'EPSG:4326',
                    }),
                    changeMapView(
                        {
                            x: parseFloat(
                                featureReprojected.features[0].geometry.type === 'Point'
                                    ? featureReprojected.features[0].geometry.coordinates[0]
                                    : featureReprojected.features[0].geometry.coordinates[0][0]
                            ),
                            y: parseFloat(
                                featureReprojected.features[0].geometry.type === 'Point'
                                    ? featureReprojected.features[0].geometry.coordinates[1]
                                    : featureReprojected.features[0].geometry.coordinates[0][1]
                            ),
                        },
                        featureReprojected.features[0].geometry.type === 'Point' ? 7 : 15,
                        featureReprojected.features[0].geometry.bbox,
                        state.map.present.zoom,
                        null,
                        state.map.present.projection
                    )
                );
            }
        }
        return Rx.Observable.empty();
    });

module.exports = {
    activeFullText,
    saveDrawFullTextSearch,
    showFullTextElement,
};
