/**
 * @author CapGemini
 */

import { WFS, GeoJSON as olGeoJson } from 'ol/format';

import API from '../../../../MapStore2/web/client/api/WFS';
import ConfigUtils from '../../../../MapStore2/web/client/utils/ConfigUtils';
import Layers from '../../../../MapStore2/web/client/utils/openlayers/Layers';
import Projections from '../../Projections/Utils/Projections';
import SecurityUtils from '../../../../MapStore2/web/client/utils/SecurityUtils';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import { getStyle } from '../../../../MapStore2/web/client/components/map/openlayers/VectorStyle';

const addUserFilterToParams = (params, filter) => {
    const { CQL_FILTER: cqlFilterFromParams, ...parametres } = params || {};
    let CQL_FILTER;
    if (
        filter &&
        cqlFilterFromParams &&
        filter !== cqlFilterFromParams &&
        cqlFilterFromParams !== 'INCLUDE'
    ) {
        CQL_FILTER = `(${filter}) AND (${cqlFilterFromParams})`;
    } else {
        CQL_FILTER = filter || cqlFilterFromParams;
    }
    return CQL_FILTER ? { CQL_FILTER, ...parametres } : params;
};

Layers.registerType('wfs', {
    create: (options, map) => {
        let GeoJSON = {};
        let url = '';
        if (options.url) {
            url = options.url;
        } else if (options.geoJson) {
            try {
                GeoJSON = new olGeoJson().readFeatures(options.geoJson, {
                    featureProjection:
                        (options.geoJson &&
                            options.geoJson.crs &&
                            options.geoJson.crs.properties &&
                            options.geoJson.crs.properties.name) ||
                        options.projection ||
                        options.srs ||
                        'EPSG:3857',
                });
            } catch (e) {
                console.error(
                    `GeoJSON non valide pour le layer WFS suivant : ${options.title ||
                        options.name}`
                );
            }
        }

        const style = getStyle(options);
        let params = {
            typename: options.name,
            srsname: Projections.default,
            outputFormat: 'text/xml; subtype=gml/3.1.1',
        };
        if (options.crs || options.srs) {
            params.srsname = options.crs ? options.crs : options.srs;
        }

        SecurityUtils.addAuthenticationParameter(url, params, options.securityToken);
        if (options.userFilter) {
            params = addUserFilterToParams(
                params,
                "INTERSECTS(SHAPE, querySingle('" +
                    options.userFilter.layer +
                    "', '" +
                    options.userFilter.geometry_name +
                    "','" +
                    options.userFilter.condition +
                    "'))"
            );
        }
        if (options.url) {
            let SourceVector = new VectorSource({
                format: new WFS(),
                url: function(extent) {
                    if (!params.CQL_FILTER) {
                        params.bbox = extent.join(',') + ',' + params.srsname;
                    }
                    return ConfigUtils.getProxiedUrl(API.getUrl(url, params));
                },
                strategy: bboxStrategy,
            });

            let Layer = new VectorLayer({
                source: SourceVector,
                visible: options.visibility !== false,
                zIndex: options.zIndex,
                style,
            });

            Layer.set('map', map);

            return Layer;
        } else if (options.geoJson) {
            let SourceVector = new VectorSource({
                format: new olGeoJson(),
                strategy: bboxStrategy,
            });
            SourceVector.addFeatures(GeoJSON);

            let Layer = new VectorLayer({
                source: SourceVector,
                visible: options.visibility !== false,
                zIndex: options.zIndex,
                style,
            });

            Layer.set('map', map);

            return Layer;
        }

        return null;
    },
    update: (layer, newOptions, oldOptions, map) => {
        const options = newOptions;
        let GeoJSON = {};
        let url = '';
        if (options.url) {
            url = options.url;
        } else if (options.geoJson) {
            GeoJSON = new olGeoJson().readFeatures(options.geoJson, {
                featureProjection: options.projection ? options.projection : 'EPSG:3857',
            });
        }

        const style = getStyle(options);
        let params = {
            typename: options.name,
            srsname: Projections.default,
            outputFormat: 'text/xml; subtype=gml/3.1.1',
        };
        if (options.crs || options.srs) {
            params.srsname = options.crs ? options.crs : options.srs;
        }

        SecurityUtils.addAuthenticationParameter(url, params, options.securityToken);
        if (options.userFilter) {
            params = addUserFilterToParams(
                params,
                "INTERSECTS(SHAPE, querySingle('" +
                    options.userFilter.layer +
                    "', '" +
                    options.userFilter.geometry_name +
                    "','" +
                    options.userFilter.condition +
                    "'))"
            );
        }
        if (options.url) {
            let SourceVector = new VectorSource({
                format: new WFS(),
                url: function(extent) {
                    if (!params.CQL_FILTER) {
                        params.bbox = extent.join(',') + ',' + params.srsname;
                    }

                    return ConfigUtils.getProxiedUrl(API.getUrl(url, params));
                },
                strategy: bboxStrategy,
            });

            let Layer = new VectorLayer({
                source: SourceVector,
                visible: options.visibility !== false,
                zIndex: options.zIndex,
                opacity: options.opacity,
                style,
            });

            Layer.set('map', map);

            return Layer;
        } else if (options.geoJson) {
            let SourceVector = new VectorSource({
                format: new olGeoJson(),
                strategy: bboxStrategy,
            });
            SourceVector.addFeatures(GeoJSON);

            let Layer = new VectorLayer({
                source: SourceVector,
                visible: options.visibility !== false,
                zIndex: options.zIndex,
                opacity: options.opacity,
                style,
            });

            Layer.set('map', map);

            return Layer;
        }
        return null;
    },
});
