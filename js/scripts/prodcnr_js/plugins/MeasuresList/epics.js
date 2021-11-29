const Rx = require('rxjs');

// actions
const { addGeometry } = require('./actions');
const { addLayer } = require('../../../MapStore2/web/client/actions/layers');
const { CHANGED_GEOMETRY } = require('../../../MapStore2/web/client/actions/measurement');
const StringUtils = require('../../utils/StringUtils');
const { TOGGLE_CONTROL, resetControls } = require('../../../MapStore2/web/client/actions/controls');

const DrawUtils = require('../../utils/DrawUtils').default;

const addGeometryEpic = (action$, store) =>
    action$.ofType(CHANGED_GEOMETRY).switchMap((action) => {
        const state = store.getState();
        const measurement = store.getState().measurement;
        let feature = action.feature;

        feature.geometry.type =
            measurement.geomType === 'Bearing' ? 'LineString' : measurement.geomType;
        feature.id = StringUtils.uniqid();
        /**
         * Ajout des données attributaires
         */
        feature.properties = {
            LENGTH: measurement.len,
            AREA: measurement.area,
            BEARING: measurement.bearing,
            LENGTH_UNIT: measurement.uom.length.label,
            AREA_UNIT: measurement.uom.area.label,
        };
        return Rx.Observable.of(
            addGeometry(feature),
            addLayer({
                id: feature.id,
                geoJson: feature,
                type: 'wfs',
                title: 'Forme ' + DrawUtils.generateId(DrawUtils.groupMeasure, state),
                group: DrawUtils.groupMeasure,
                visibility: true,
                opacity: 1,
            })
        );
    });

const startstopMeasure = (action$, store) =>
    action$
        .ofType(TOGGLE_CONTROL)
        .filter((action) => action.control === 'measure')
        .switchMap(() => {
            const state = store.getState();
            if (
                (state.controls && state.controls.measure && state.controls.measure.enabled) ||
                false
            ) {
                return Rx.Observable.from([resetControls(['measure'])]);
            } else {
                return Rx.Observable.empty();
            }
        });

module.exports = {
    addGeometryEpic,
    startstopMeasure,
};
