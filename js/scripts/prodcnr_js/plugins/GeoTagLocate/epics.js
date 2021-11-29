const Rx = require('rxjs');
const { isEmpty } = require('lodash');
const { userDepartmentSelector } = require('./selectors');
const ConfigUtils = require('../../../MapStore2/web/client/utils/ConfigUtils');
const { securityTokenSelector } = require('../../../MapStore2/web/client/selectors/security');
const APIWFS = require('../../../MapStore2/web/client/api/WFS');
const PrintUtils = require('../../../MapStore2/web/client/utils/PrintUtils');
const { setDefaultGeometry } = require('../SearchBar/actions');
const { LOGIN_SUCCESS } = require('../../../MapStore2/web/client/actions/security');
const { MAP_CONFIG_LOADED } = require('../../../MapStore2/web/client/actions/config');
const { TOGGLE_FILTER, setFilterInfos } = require('./actions');
const { zoomToExtent } = require('../../../MapStore2/web/client/actions/map');
const { getSourceProjection, sanitizeProjection } = require('../GeoProcessing/utils/GeoProcess');
const bbox = require('@turf/bbox');

const loadUserShapeOnLoading = (action$, store) =>
    action$.ofType(LOGIN_SUCCESS, MAP_CONFIG_LOADED).switchMap(() => {
        let userFilter = ConfigUtils.getConfigProp('userFilter');
        let departments = userDepartmentSelector(store.getState());
        let georchestraUrl = ConfigUtils.getConfigProp('georchestraUrl');
        let securityToken = securityTokenSelector(store.getState()) || undefined;
        if (!!georchestraUrl && !!userFilter.layer && !isEmpty(departments)) {
            return Rx.Observable.fromPromise(
                APIWFS.getFeatureSimple(PrintUtils.normalizeUrl(georchestraUrl), {
                    typeName: userFilter.layer,
                    authParam: securityToken,
                }).then(
                    (resp) => {
                        if (resp.features) {
                            const features = resp.features.filter((elt) => {
                                if (elt.properties && elt.properties[userFilter.attribute]) {
                                    if (
                                        departments.includes(elt.properties[userFilter.attribute])
                                    ) {
                                        return true;
                                    }
                                }

                                return false;
                            });

                            if (features.length <= 0) {
                                return undefined;
                            }

                            return {
                                crs: sanitizeProjection(getSourceProjection(resp)),
                                ...features.pop(),
                            };
                        }

                        return undefined;
                    },
                    (err) => {
                        return undefined;
                    }
                )
            ).switchMap((feature) => {
                if (feature === undefined) {
                    return Rx.Observable.empty();
                }

                let payload = {
                    geometry: feature.geometry,
                    geometry_name: feature.geometry_name,
                    id: feature.id,
                    [userFilter.attribute]:
                        feature.properties && feature.properties[userFilter.attribute],
                    bbox: feature.properties && feature.properties.bbox,
                    crs: feature.crs,
                };
                return Rx.Observable.from([
                    setFilterInfos(payload),
                    setDefaultGeometry(feature.geometry),
                ]);
            });
        } else {
            return Rx.Observable.of(setDefaultGeometry(undefined));
        }
    });
const zoomToDepartmentOnToggle = (action$, store) =>
    action$.ofType(TOGGLE_FILTER).switchMap(() => {
        let userFilter = store.getState().userFilter;
        if (!!(userFilter && userFilter.enabled && (userFilter.bbox || userFilter.geometry))) {
            return Rx.Observable.of(
                zoomToExtent(
                    userFilter.bbox || bbox(userFilter.geometry),
                    userFilter.crs || 'EPSG:4326'
                )
            );
        } else {
            return Rx.Observable.empty();
        }
    });

module.exports = {
    loadUserShapeOnLoading,
    zoomToDepartmentOnToggle,
};
