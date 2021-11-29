const Rx = require('rxjs');

const {
    updateWidgets,
    setMapWidgets,
    ADD_WIDGET,
    REMOVE_WIDGET,
    RESET_MAP_WIDGETS,
    SET_MAP_WIDGETS,
} = require('./actions');
const WidgetUtils = require('@js/utils/WidgetUtils');
const { MAP_CONFIG_LOADED } = require('@mapstore/actions/config');
const { userSelector } = require('@mapstore/selectors/security');

/**
 * @author Capgemini
 * Fetch Data to get the activated widgets when the map is loaded
 */
const fetchDataFromResourceEpicWhenMapInfoLoaded = (action$) =>
    action$.ofType(MAP_CONFIG_LOADED).switchMap((action) => {
        let mapWidgets = (action.config && action.config.widgetsConfig) || [];
        return Rx.Observable.of(setMapWidgets(mapWidgets));
    });

const updateMapWhenActionInWidgetConsole = (action$, store) =>
    action$.ofType(ADD_WIDGET, REMOVE_WIDGET, RESET_MAP_WIDGETS, SET_MAP_WIDGETS).switchMap(() => {
        let state = store.getState();
        const id = state.widgetsPage.id;
        if (id > 0) {
            WidgetUtils.findUserWidgets(userSelector(state)).then((listWidgets) => {
                store.dispatch(updateWidgets(listWidgets));
            });

            return Rx.Observable.empty();
        }
        let optionalUserPlugins =
            (state.widgetsPage && state.widgetsPage.currentUserWidgetList) || [];
        let optionalMapPlugins = (state.widgets && state.widgets.currentMapWidgets) || [];
        let optionalPlugins = optionalUserPlugins.filter((w) => optionalMapPlugins.includes(w));
        return Rx.Observable.of(updateWidgets(optionalPlugins));
    });

module.exports = {
    fetchDataFromResourceEpicWhenMapInfoLoaded,
    updateMapWhenActionInWidgetConsole,
};
