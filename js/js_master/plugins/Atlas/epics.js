const Rx = require('rxjs');

const { TOGGLE_CONTROL, resetControls } = require('../../../MapStore2/web/client/actions/controls');

const startStopAtlas = (action$, store) =>
    action$
        .ofType(TOGGLE_CONTROL)
        .filter((action) => action.control === 'atlas')
        .switchMap(() => {
            const state = store.getState();

            if (state.controls && state.controls.atlas && state.controls.atlas.enabled) {
                return Rx.Observable.from([resetControls(['atlas'])]);
            } else {
                return Rx.Observable.empty();
            }
        });

module.exports = {
    startStopAtlas,
};
