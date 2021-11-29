// const Rx = require('rxjs');
import Rx from 'rxjs';
// import * as Rx from 'rxjs/Rx';
// import { Observable } from '@rxjs/Observable';
// import 'rxjs/Rx';
// const { LOCAL_CONFIG_LOADED } = require('../../MapStore2/web/client/actions/localConfig');
// const { loginSuccess } = require('../../MapStore2/web/client/actions/security');
// const GeoStoreDAO = require('../../MapStore2/web/client/api/GeoStoreDAO');
import { LOCAL_CONFIG_LOADED } from '@mapstore/actions/localConfig';
import { loginSuccess } from '@mapstore/actions/security';
import GeoStoreDAO from '@mapstore/api/GeoStoreDAO';
const autoLogin = (action$, store) =>
    action$.ofType(LOCAL_CONFIG_LOADED).switchMap(() => {
        GeoStoreDAO.login()
            .then((response) => {
                store.dispatch(loginSuccess(response, null, null, GeoStoreDAO.authProviderName));
            })
            .catch(() => {});

        return Rx.Observable.empty();
    });

// module.exports = {
//     epics: {
//         autoLogin,
//     },
// };

export default {
   epics: {
        autoLogin,
    },
};
