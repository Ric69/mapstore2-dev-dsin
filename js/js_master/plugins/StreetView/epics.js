const Rx = require('rxjs');

const { TOGGLE_CONTROL, toggleControl } = require('../../../MapStore2/web/client/actions/controls');
const { changeMousePointer } = require('../../../MapStore2/web/client/actions/map');
const { CLICK_ON_MAP } = require('../../../MapStore2/web/client/actions/map');

const onMapClickStreetView = (action$, store) =>
    action$
        .ofType(CLICK_ON_MAP)
        .filter(
            () =>
                store.getState().controls.streetView && store.getState().controls.streetView.enabled
        )
        .switchMap((action) => {
            const url =
                'http://www.google.com/maps?layer=c&cbll=' +
                action.point.latlng.lat +
                ',' +
                action.point.latlng.lng;
            const win = window.open(url, '_blank');
            win.focus();
            return Rx.Observable.of(toggleControl('streetView', null));
        });

const changeCursorStreetView = (action$, store) =>
    action$.ofType(TOGGLE_CONTROL).switchMap((action) => {
        const enabled =
            (store.getState().controls.streetView &&
                store.getState().controls.streetView.enabled) ||
            false;

        if (action.control === 'streetView' && enabled) {
            return Rx.Observable.of(
                changeMousePointer("url('./assets/img/cursor2.png') 6 6, crosshair")
            );
        } else {
            return Rx.Observable.of(changeMousePointer('default'));
        }
    });

module.exports = {
    onMapClickStreetView,
    changeCursorStreetView,
};
