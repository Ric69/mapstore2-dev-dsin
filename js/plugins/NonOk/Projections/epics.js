const Rx = require('rxjs');

const { TOGGLE_CONTROL, resetControls } = require('../../../MapStore2/web/client/actions/controls');

const startStopProjection = (action$, store) =>
    action$
        .ofType(TOGGLE_CONTROL)
        .filter((action) => action.control === 'projection')
        .switchMap(() => {
            const state = store.getState();
            if (state.controls && state.controls.projection && state.controls.projection.enabled) {
                return Rx.Observable.from([resetControls(['projection'])]);
            } else {
                return Rx.Observable.empty();
            }
        });

module.exports = {
    startStopProjection,
};
