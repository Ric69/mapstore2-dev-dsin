const Rx = require('rxjs');
const { LOCAL_CONFIG_LOADED } = require('../../MapStore2/web/client/actions/localConfig');
const { loginSuccess } = require('../../MapStore2/web/client/actions/security');
const GeoStoreDAO = require('../../MapStore2/web/client/api/GeoStoreDAO');

const autoLogin = (action$, store) =>
    action$.ofType(LOCAL_CONFIG_LOADED).switchMap(() => {
        GeoStoreDAO.login()
            .then((response) => {
                store.dispatch(loginSuccess(response, null, null, GeoStoreDAO.authProviderName));
            })
            .catch(() => {});

        return Rx.Observable.empty();
    });

module.exports = {
    epics: {
        autoLogin,
    },
};
