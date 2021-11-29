const Rx = require('rxjs');
// actions
const { DISABLE_ZORTHO, changeGeometryZOrtho, enableZOrtho } = require('./actions');
const {
    END_DRAWING,
    changeDrawingStatus,
    drawSupportReset,
} = require('../../../MapStore2/web/client/actions/draw');
const { TOGGLE_CONTROL, resetControls } = require('../../../MapStore2/web/client/actions/controls');

const startStopZOrthoEpic = (action$, store) =>
    action$
        .ofType(TOGGLE_CONTROL)
        .filter((action) => action.control === 'zOrtho')
        .switchMap(() => {
            const state = store.getState();
            if (state.controls && state.controls.zOrtho && state.controls.zOrtho.enabled) {
                return Rx.Observable.from([
                    resetControls(['zOrtho']),
                    changeDrawingStatus('start', 'Point', 'zOrtho', [], { plugin: 'zortho' }),
                ]);
            } else {
                return Rx.Observable.from([drawSupportReset('zOrtho')]);
            }
        });

const showZOrthoEpic = (action$, store) =>
    action$
        .ofType(END_DRAWING)
        .filter(
            () =>
                (store.getState().controls &&
                    store.getState().controls.zOrtho &&
                    store.getState().controls.zOrtho.enabled) ||
                false
        )
        .switchMap((action) =>
            Rx.Observable.from([changeGeometryZOrtho(action.geometry), enableZOrtho()])
        );

const disableZOrthoEpic = (action$) =>
    action$.ofType(DISABLE_ZORTHO).switchMap(() => Rx.Observable.of(drawSupportReset('zOrtho')));

module.exports = {
    startStopZOrthoEpic,
    showZOrthoEpic,
    disableZOrthoEpic,
};
