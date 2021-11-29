const Rx = require('rxjs');

const { TOGGLE_CONTROL, resetControls } = require('../../../MapStore2/web/client/actions/controls');

const startStopCSV2ShapeFile = (action$, store) =>
    action$
        .ofType(TOGGLE_CONTROL)
        .filter((action) => action.control === 'csv2Shapefile')
        .switchMap(() => {
            const state = store.getState();

            if (
                state.controls &&
                state.controls.csv2Shapefile &&
                state.controls.csv2Shapefile.enabled
            ) {
                return Rx.Observable.from([resetControls(['csv2Shapefile'])]);
            } else {
                return Rx.Observable.empty();
            }
        });

/**
 * Gestion du plugin d'import de ShapeFile ici
 * Car impossible de créer un fichier epics pour le plugin ShapeFile
 * @param action$
 * @param store
 * @returns {Observable<unknown>}
 */
const startStopShapeFile = (action$, store) =>
    action$
        .ofType(TOGGLE_CONTROL)
        .filter((action) => action.control === 'shapefile')
        .switchMap(() => {
            const state = store.getState();

            if (state.controls && state.controls.shapefile && state.controls.shapefile.enabled) {
                return Rx.Observable.from([resetControls(['shapefile'])]);
            } else {
                return Rx.Observable.empty();
            }
        });

module.exports = {
    startStopShapeFile,
    startStopCSV2ShapeFile,
};
