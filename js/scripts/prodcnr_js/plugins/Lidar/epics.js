const Rx = require('rxjs');
const axios = require('axios');
const { loadConfig } = require('./actions');
const { LOCAL_CONFIG_LOADED } = require('../../../MapStore2/web/client/actions/localConfig');

const loadLidarLayers = (action$, store) =>
    action$.ofType(LOCAL_CONFIG_LOADED).switchMap(() => {
        return Rx.Observable.fromPromise(
            axios.get('./js/lidar.json').then((response) => {
                const config = response.status === 200 ? response.data : { layers: [] };

                return store.dispatch(loadConfig(config));
            })
        );
    });

module.exports = {
    loadLidarLayers,
};
