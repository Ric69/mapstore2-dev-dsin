const Rx = require('rxjs');

const {
    LOGIN_SUCCESS,
    SESSION_VALID,
    LOGOUT,
} = require('../../../MapStore2/web/client/actions/security');
const WidgetUtils = require('../../utils/WidgetUtils');
const { userSelector } = require('../../../MapStore2/web/client/selectors/security');
const { setWidgetsCurrentUser, SET_CURRENT_USER_WIDGETS } = require('./actions');
const { updateWidgets } = require('../Widgets/actions');

// Chargement de la liste des widgets
const setlistWidgetsForCurrentUser = (action$, store) =>
    action$.ofType(LOGIN_SUCCESS, SESSION_VALID).switchMap(() => {
        const state = store.getState();

        if (state.localConfig && state.localConfig.plugins) {
            WidgetUtils.setWidgets([
                ...state.localConfig.plugins.desktop,
                ...state.localConfig.plugins.maps,
                ...state.localConfig.plugins.mobile,
            ]);
        }

        const user = userSelector(state);
        WidgetUtils.findUserWidgets(user).then((listWidgets) => {
            store.dispatch(setWidgetsCurrentUser(listWidgets));
        });
        return Rx.Observable.empty();
    });

const setlistWidgetsForUnloggedUser = (action$, store) =>
    action$.ofType(LOGOUT).switchMap(() => {
        const state = store.getState();

        if (state.localConfig && state.localConfig.plugins) {
            WidgetUtils.setWidgets([
                ...state.localConfig.plugins.desktop,
                ...state.localConfig.plugins.maps,
                ...state.localConfig.plugins.mobile,
            ]);
        }
        return Rx.Observable.of(setWidgetsCurrentUser([]));
    });

const updateMapWhenUpdateUserWidgets = (action$, store) =>
    action$.ofType(SET_CURRENT_USER_WIDGETS).switchMap(() => {
        let state = store.getState();
        let optionalUserPlugins =
            (state.widgetsPage && state.widgetsPage.currentUserWidgetList) || [];
        let optionalMapPlugins = (state.widgets && state.widgets.currentMapWidgets) || [];
        let optionalPlugins = optionalUserPlugins.filter((w) => optionalMapPlugins.includes(w));
        return Rx.Observable.of(updateWidgets(optionalPlugins));
    });

module.exports = {
    setlistWidgetsForCurrentUser,
    setlistWidgetsForUnloggedUser,
    updateMapWhenUpdateUserWidgets,
};
