const Rx = require('rxjs');
const { isEmpty } = require('lodash');

const { LOAD_MAP_INFO } = require('@mapstore/actions/config');
const GeoStoreApi = require('@mapstore/api/GeoStoreDAO');
const {
    changeWindowContent,
    changeWindowDate,
    enableWindow,
} = require('@js/plugins/WindowModal/actions');
const StringUtils = require('@js/utils/StringUtils');

const loadMapWindowContent = (action$, store) =>
    action$.ofType(LOAD_MAP_INFO).switchMap(({ mapId }) => {
        store.dispatch(changeWindowContent(''));
        GeoStoreApi.getResourceAttributes(mapId).then((attributes) => {
            if (!isEmpty(attributes)) {
                attributes.map((attribute) => {
                    switch (attribute.name) {
                        case 'contentWindow': {
                            if (!StringUtils.isEmptyContent(attribute.value)) {
                                store.dispatch(changeWindowContent(attribute.value));
                                store.dispatch(enableWindow());
                            }
                        }
                        case 'windowId': {
                            if (attribute.value > 0) {
                                GeoStoreApi.getData(attribute.value).then((data) => {
                                    if (!StringUtils.isEmptyContent(data)) {
                                        store.dispatch(changeWindowContent(data));
                                        store.dispatch(enableWindow());
                                    }
                                });
                            }
                        }
                        case 'contentWindowDate': {
                            if (attribute.value > 0) {
                                store.dispatch(changeWindowDate(attribute.value));
                            }
                        }
                        default:
                            return Rx.Observable.empty();
                    }
                });
            }
        });

        return Rx.Observable.empty();
    });

module.exports = {
    loadMapWindowContent,
};
