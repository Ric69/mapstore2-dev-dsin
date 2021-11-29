/**
 * @author CapGemini
 * Helper pour le plugin GeoProcessing
 */
const axios = require('axios');
const urlUtil = require('url');
const assign = require('object-assign');
const { isArray, isEmpty } = require('lodash');

const WFS = require('../../../../MapStore2/web/client/api/WFS');
const ConfigUtils = require('../../../../MapStore2/web/client/utils/ConfigUtils');
const CoordinatesUtils = require('../../../../MapStore2/web/client/utils/CoordinatesUtils');
const GeoProcessingUtils = require('../../../utils/GeoProcessingUtils');
const TurfUtils = require('../../../utils/TurfUtils');
const API = {
    WFS: require('../../../../MapStore2/web/client/api/WFS'),
};

const getSourceWFS = (params) => {
    return axios.get(WFS.getUrl(ConfigUtils.getConfigProp('georchestraUrl'), params));
};

/**
 * Permet de charge les features d'un dessin ou d'une couche WFS
 * @param layerName
 * @param layers
 * @param tool
 * @param tools
 * @returns {boolean}
 */
const getGeoJson = (layerName, layers, tool, tools) => {
    const withLayer = (layers || []).filter((layer) => {
        if (layer.id === layerName || layer.name === layerName) {
            return layer;
        }
    })[0];

    if (withLayer === null || withLayer === undefined) {
        return false;
    }

    // Besoin des géometries et non de la collection pour ces types de geotraitement
    const needGeometry = [tools.buffer.value, tools.diff.value, tools.cut.value].includes(tool);
    // Le traitement d'union n'arrive pas à traiter un Polygon avec un MutliPolygon
    const needMultiGeometry = [tools.union.value].includes(tool);
    // Sur les couches de types dessin (wfs et vector)
    if (
        (withLayer.geoJson && !isEmpty(withLayer.geoJson)) ||
        (withLayer.features && !isEmpty(withLayer.features))
    ) {
        return new Promise((resolve, reject) => {
            const projectionVar =
                withLayer.features && !isEmpty(withLayer.features)
                    ? withLayer.projection || (withLayer.bbox && withLayer.bbox.crs) || 'EPSG:4326'
                    : 'EPSG:3857';
            let result = {};
            let features = [];
            if (
                (withLayer.features && !isEmpty(withLayer.features)) ||
                (withLayer.geoJson &&
                    withLayer.geoJson.features &&
                    withLayer.geoJson.features.length > 1)
            ) {
                // On doit fermer les polygones pour un meilleur traitement via le WPS
                const closeFeatures = (withLayer.features || withLayer.geoJson.features).map(
                    (feature) => {
                        return GeoProcess.closePolygon(feature);
                    }
                );
                if (withLayer.features && !isEmpty(withLayer.features)) {
                    withLayer.features = closeFeatures;
                } else {
                    withLayer.geoJson.features = closeFeatures;
                }

                return resolve(
                    axios({
                        url: GeoProcess.getWPSUrl(),
                        method: 'post',
                        data: GeoProcessingUtils.getXML({
                            identifier: 'gs:CollectGeometries',
                            source: GeoProcessingUtils.getComplexData({
                                identifier: 'features',
                                data: {
                                    crs: {
                                        properties: {
                                            name: projectionVar,
                                        },
                                        type: 'name',
                                    },
                                    type: 'FeatureCollection',
                                    features: (
                                        withLayer.features || withLayer.geoJson.features
                                    ).map((feature) => {
                                        if (feature.type !== 'Feature') {
                                            return {
                                                type: 'Feature',
                                                geometry: feature,
                                            };
                                        }

                                        return feature;
                                    }),
                                },
                            }),
                            adds: GeoProcessingUtils.getResponseForm(),
                        }),
                        headers: {
                            'Content-Type': 'application/xml',
                        },
                    })
                        .then((response) => {
                            if (needGeometry) {
                                return assign({}, response.data, {
                                    crs: {
                                        properties: {
                                            name: projectionVar,
                                        },
                                        type: 'name',
                                    },
                                });
                            } else {
                                return {
                                    crs: {
                                        properties: {
                                            name: projectionVar,
                                        },
                                        type: 'name',
                                    },
                                    type: 'FeatureCollection',
                                    features: [
                                        {
                                            type: 'Feature',
                                            geometry: response.data,
                                        },
                                    ],
                                };
                            }
                        })
                        .catch((e) => {
                            alert('Une erreur est survenue');
                        })
                );
            } else {
                if (needGeometry) {
                    if (withLayer.geoJson.features && !isEmpty(withLayer.geoJson.features)) {
                        if (withLayer.geoJson.features[0]) {
                            if (withLayer.geoJson.features[0].geometry) {
                                features = withLayer.geoJson.features[0].geometry;
                            } else {
                                features = withLayer.geoJson.features[0];
                            }
                        } else if (withLayer.geoJson.features.geometry) {
                            features = withLayer.geoJson.features.geometry;
                        } else {
                            features = withLayer.geoJson.features;
                        }
                    } else {
                        features = withLayer.geoJson;
                    }
                } else {
                    features =
                        withLayer.geoJson.type === 'FeatureCollection'
                            ? withLayer.geoJson.features
                            : [withLayer.geoJson];
                }
            }

            if (needMultiGeometry) {
                features = GeoProcess.simpleToMultiGeometry(features);
            }

            if (needGeometry) {
                result = features;
            } else {
                result = {
                    crs: {
                        properties: {
                            name: projectionVar,
                        },
                        type: 'name',
                    },
                    type: 'FeatureCollection',
                    features: features.map((feature) => {
                        if (feature.type !== 'Feature') {
                            return {
                                type: 'Feature',
                                geometry: feature,
                            };
                        }

                        return feature;
                    }),
                };
            }

            return resolve(result);
        });
    }

    const prefixedLayerName = layerName.includes(':') ? layerName : 'cnr:' + layerName;
    if (needGeometry) {
        /**
         * Dans le but de transformer un système de FeatureCollection en 1 seule géométrie.
         * Certains traitement n'acceptent pas les Collections
         */
        return axios({
            url: GeoProcess.getWPSUrl(),
            method: 'post',
            data: GeoProcessingUtils.getXML({
                identifier: 'gs:CollectGeometries',
                source: GeoProcessingUtils.getInput({
                    identifier: 'features',
                    typeName: prefixedLayerName,
                }),
                adds: GeoProcessingUtils.getResponseForm(),
            }),
            headers: {
                'Content-Type': 'application/xml',
            },
        })
            .then((response) => {
                return assign({}, response.data, {
                    crs: {
                        properties: {
                            name: 'EPSG:2154',
                        },
                        type: 'name',
                    },
                });
            })
            .catch((e) => {
                alert('Une erreur est survenue');
            });
    } else {
        return API.WFS.getFeatureSimple(ConfigUtils.getConfigProp('georchestraUrl'), {
            typeName: prefixedLayerName,
        }).then((data) => {
            return data;
        });
    }
};

const GeoProcess = {
    mode: 'Geoserver',
    projection: '',
    getSourceWFS,
    getGeoJson,

    getWPSUrl: () => {
        const url = ConfigUtils.getConfigProp('georchestraUrl');
        const parsed = urlUtil.parse(url, true);
        return urlUtil.format(
            assign({}, parsed, {
                query: assign(
                    {
                        service: 'WPS',
                        version: '1.1.0',
                        request: 'Execute',
                    },
                    parsed.query
                ),
            })
        );
    },

    /**
     * Parcourir la ou les features pour les transformer en Mutli[...]
     * @param features
     */
    simpleToMultiGeometry: (features) => {
        if (isArray(features)) {
            return features.map((feature) => {
                return GeoProcess.changeToMulti(feature);
            });
        } else {
            return GeoProcess.changeToMulti(features);
        }
    },

    /**
     * On modifie le type de geometry par un type Multi
     * On en profite pour fermer le Polygon si besoin
     * @param feature
     * @returns {{geometry: {type: *}}|*|{type: *}}
     */
    changeToMulti: (feature) => {
        const acceptGeometries = []; // ['LineString', 'Polygon'];

        let type = feature.type;
        let geometry = feature;
        if (feature.geometry) {
            type = feature.geometry.type;
            geometry = GeoProcess.closePolygon(feature.geometry);
        } else {
            geometry = GeoProcess.closePolygon(feature);
        }

        if (acceptGeometries.includes(type)) {
            type = 'Multi' + type;
        }
        geometry = { ...geometry, type };

        if (feature.geometry) {
            return {
                ...feature,
                geometry: {
                    ...feature.geometry,
                    type: geometry.type,
                    coordinates: geometry.coordinates,
                },
            };
        } else {
            return { ...feature, type: geometry.type, coordinates: geometry.coordinates };
        }
    },

    /**
     * On parcours le GeoJson pour vérifier si les polygon sont fermés
     * Sinon on essaye d'ajouter les coordonnées du 1er point en tant que dernier point
     *
     * @param geoJson
     */
    closePolygon: (geoJson) => {
        return CoordinatesUtils.traverseGeoJson(geoJson, (gj) => {
            if (gj.coordinates && gj.type === 'Polygon') {
                return gj.coordinates.map((coordinates) => {
                    if (coordinates.length > 1) {
                        const firstValue = coordinates[0];
                        const lastValue = coordinates.slice(-1)[0];

                        if (firstValue !== lastValue) {
                            coordinates[coordinates.length] = firstValue;
                        }
                    }

                    return coordinates;
                });
            } else if (gj.type === 'Feature') {
                return gj.geometry;
            }
        });
    },

    /**
     *
     * @param geoJson
     * @returns {*|string}
     */
    getSourceProjection: (geoJson) => {
        return (
            (geoJson.crs && geoJson.crs.properties && geoJson.crs.properties.name) || 'EPSG:3857'
        );
    },

    /**
     * On retourne un code de projection simple
     * @param projection
     * @returns {string}
     */
    sanitizeProjection: (projection) => {
        return 'EPSG:' + projection.slice(-4);
    },

    /**
     * @param data
     * @param projection
     */
    prepareData: ({ data, projection }) => {
        if (data.features) {
            data.features = TurfUtils.SinglePartToMultiPart(data.features);
        }
        if (data.crs && data.crs.properties && data.crs.properties.name) {
            data.crs.properties.name = projection;
        } else {
            data.crs = { properties: { name: projection } };
        }

        return data;
    },

    /**
     * Création de la Promise en prenant en compte l'outil de Géotraitement
     * @param distance
     * @param layers
     * @param tool
     * @param source
     * @param dest
     * @param tools
     * @param unit
     */
    process: ({ dest, distance = 0, layers, source, tool, tools, unit = 'm' }) => {
        const WPSUrl = GeoProcess.getWPSUrl();
        let request = '';

        return Promise.all([
            getGeoJson(source, layers, tool, tools),
            getGeoJson(dest, layers, tool, tools),
        ]).then((responses) => {
            const ToProjection = 'EPSG:3857';
            // On récupère la projection des features si la donnée est renseigné
            const sourceLayerProjection = GeoProcess.getSourceProjection(responses[0]);

            /**
             * On reprojete les features dans la projection {ToProjection}
             * Auparavant, on ferme les polygones
             */
            let sourceLayer = CoordinatesUtils.reprojectGeoJson(
                GeoProcess.closePolygon(responses[0]),
                GeoProcess.sanitizeProjection(sourceLayerProjection),
                ToProjection
            );
            sourceLayer = GeoProcess.prepareData({ data: sourceLayer, projection: ToProjection });

            let destLayer = { features: [] };
            if (responses[1] !== false) {
                const destLayerProjection = GeoProcess.getSourceProjection(responses[1]);
                destLayer = CoordinatesUtils.reprojectGeoJson(
                    GeoProcess.closePolygon(responses[1]),
                    GeoProcess.sanitizeProjection(destLayerProjection),
                    ToProjection
                );
                destLayer = GeoProcess.prepareData({ data: destLayer, projection: ToProjection });
            }

            if (tool === tools.buffer.value) {
                let distanceSanitize = distance.replace(',', '.');

                if (tool.indexOf('turfjs:') >= 0) {
                    const buffered = TurfUtils.buffer(sourceLayer, {
                        distance: distanceSanitize,
                        unit,
                    });

                    return new Promise((resolve, reject) => {
                        return resolve({ data: buffered });
                    });
                } else {
                    /**
                     * Par rapport à la projection
                     * Il semble qu'une unité correspond environ à XX (EPSG:4326)
                     * Il semble qu'une unité correspond environ à 0.69m (EPSG:3857) 1km => 690m
                     */
                    let distanceWithUnit =
                        unit === 'km' ? distanceSanitize * 1449 : distanceSanitize * 1.449;

                    request = GeoProcessingUtils.getXML({
                        identifier: tool,
                        source: GeoProcessingUtils.getComplexData({
                            identifier: 'geom',
                            data:
                                sourceLayer.type === 'FeatureCollection'
                                    ? sourceLayer.features
                                    : sourceLayer,
                        }),
                        adds:
                            GeoProcessingUtils.getLiteralData({
                                identifier: 'distance',
                                data: distanceWithUnit,
                            }) +
                            GeoProcessingUtils.getLiteralData({
                                identifier: 'quadrantSegments',
                                data: ConfigUtils.getConfigProp('geoProcessQuadrantSegments'),
                            }),
                    });
                }
            } else if (tool === tools.cut.value) {
                request = GeoProcessingUtils.getXML({
                    identifier: tool,
                    source: GeoProcessingUtils.getComplexData({
                        identifier: 'polygon',
                        data: sourceLayer,
                    }),
                    dest: GeoProcessingUtils.getComplexData({
                        identifier: 'line',
                        data: destLayer.geometry ? destLayer.geometry : destLayer,
                    }),
                });
            } else if (tool === tools.intersect.value) {
                request = GeoProcessingUtils.getXML({
                    identifier: tool,
                    source: GeoProcessingUtils.getComplexData({
                        identifier: 'first feature collection',
                        data: sourceLayer,
                    }),
                    dest: GeoProcessingUtils.getComplexData({
                        identifier: 'second feature collection',
                        data: destLayer,
                    }),
                });
            } else if (tool === tools.diff.value) {
                request = GeoProcessingUtils.getXML({
                    identifier: tool,
                    source: GeoProcessingUtils.getComplexData({
                        identifier: 'a',
                        data: sourceLayer,
                    }),
                    dest: GeoProcessingUtils.getComplexData({
                        identifier: 'b',
                        data: destLayer,
                    }),
                });
            } else if (tool === tools.union.value) {
                request = GeoProcessingUtils.getXML({
                    identifier: tool,
                    source: GeoProcessingUtils.getComplexData({
                        identifier: 'first',
                        data: sourceLayer,
                    }),
                    dest: GeoProcessingUtils.getComplexData({
                        identifier: 'second',
                        data: destLayer,
                    }),
                });
            }

            return axios({
                url: WPSUrl,
                method: 'post',
                data: request,
                headers: {
                    'Content-Type': 'application/xml',
                },
            });
        });
    },

    /**
     * Défini le mode de traitement utilisé
     * ex: Turf ou Geoserver
     * @param mode
     */
    setMode: (mode) => {
        GeoProcess.mode = mode;
    },

    /**
     * On récupère le mode
     * @returns {string}
     */
    getMode: () => {
        return GeoProcess.mode;
    },

    /**
     * On défini la projection utilisé
     * @param projection
     */
    setProjection: (projection) => {
        GeoProcess.projection = projection;
    },

    /**
     * On récupère la projection
     * @returns {string}
     */
    getProjection: () => {
        return GeoProcess.projection;
    },
};

module.exports = GeoProcess;
