const Rx = require('rxjs');

const { TOGGLE_CONTROL, resetControls } = require('../../../MapStore2/web/client/actions/controls');

const startStopGeoProcessing = (action$, store) =>
    action$
        .ofType(TOGGLE_CONTROL)
        .filter((action) => action.control === 'geoprocessing')
        .switchMap(() => {
            const state = store.getState();

            if (
                state.controls &&
                state.controls.geoprocessing &&
                state.controls.geoprocessing.enabled
            ) {
                return Rx.Observable.from([resetControls(['geoprocessing'])]);
            } else {
                return Rx.Observable.empty();
            }
        });

module.exports = {
    startStopGeoProcessing,
};
