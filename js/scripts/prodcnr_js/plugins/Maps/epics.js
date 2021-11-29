const Rx = require('rxjs');

const { MAP_SAVED } = require('@mapstore/actions/config');
const { afterSaveMap } = require('@js/events/save');

const checkSubscribesOnMap = (action$, store) =>
    action$
        .ofType(MAP_SAVED)
        .delay(1000)
        .switchMap(() => {
            const state = store.getState();
            const map = state.map.present;
            afterSaveMap({ map, user: state.security.user });

            return Rx.Observable.empty();
        });

module.exports = {
    checkSubscribesOnMap,
};
