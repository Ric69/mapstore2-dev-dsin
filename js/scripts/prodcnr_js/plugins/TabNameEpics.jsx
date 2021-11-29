const Rx = require('rxjs');
const { push } = require('connected-react-router');
const { MAP_CONFIG_LOAD_ERROR, MAP_INFO_LOADED } = require('@mapstore/actions/config');
const { setControlProperty } = require('@mapstore/actions/controls');
const { MAPS_LIST_LOADED } = require('@mapstore/actions/maps');
const { LOGOUT } = require('@mapstore/actions/security');
const { pathnameSelector } = require('@mapstore/selectors/router');
const ConfigUtils = require('@mapstore/utils/ConfigUtils');

const NameFromMap = (action$) =>
    action$
        .ofType(MAP_INFO_LOADED)
        .filter((action) => action.info.id !== 1)
        .switchMap((action) => {
            window.parent.document.title = ConfigUtils.getConfigProp('applicationName') + ' - ' + action.info.name;
            return Rx.Observable.empty();
        });

const DefaultName = (action$) =>
    action$.ofType(MAPS_LIST_LOADED).switchMap(() => {
        window.parent.document.title = ConfigUtils.getConfigProp('applicationName');
        return Rx.Observable.empty();
    });

/**
 * Lors de la déconnexion, redirection vers la page d'accueil
 * @param action$
 * @param store
 * @returns {Observable<unknown>}
 */
const RedirectOnLogout = (action$, store) =>
    action$.ofType(LOGOUT).switchMap((action) => {
        if (action.redirectUrl === null && pathnameSelector(store.getState()) !== '/') {
            return Rx.Observable.of(push('/'));
        }
        return Rx.Observable.empty();
    });

/**
 * Affichage de la modal de connexion lorsque le chargement de la carte retourne une 403
 * @param action$
 * @param store
 * @returns {Observable<unknown>}
 */
const ShowLoginOnError = (action$, store) =>
    action$.ofType(MAP_CONFIG_LOAD_ERROR).switchMap((action) => {
        if (action.error && action.error.status === 403) {
            store.dispatch(setControlProperty('LoginForm', 'enabled', true));
        }
        return Rx.Observable.empty();
    });

module.exports = {
    epics: {
        NameFromMap,
        DefaultName,
        RedirectOnLogout,
        ShowLoginOnError,
    },
};
