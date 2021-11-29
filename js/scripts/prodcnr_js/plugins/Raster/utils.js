const axios = require('../../../MapStore2/web/client/libs/ajax');
const { isEmpty } = require('lodash');
const moment = require('moment');

const CoordinatesUtils = require('../../../MapStore2/web/client/utils/CoordinatesUtils');
const { getConfigProp } = require('../../../MapStore2/web/client/utils/ConfigUtils');
const LayersUtils = require('../../../MapStore2/web/client/utils/LayersUtils');
const API = {
    WFS: require('../../../MapStore2/web/client/api/WFS'),
};

const Utils = {
    /**
     * Création des index des couches
     */
    createIndexes: (features, layerName) => {
        const index = [];

        if (!isEmpty(features)) {
            index[layerName] = [];
            features.map((feature) => {
                if (
                    feature.properties &&
                    feature.properties.NOM &&
                    !index.includes(feature.properties.NOM)
                ) {
                    index.push({
                        id: feature.id,
                        label: feature.properties.NOM,
                        value: feature.properties.NOM,
                    });
                }
            });
        }

        return index;
    },
    /**
     * Cherche les features WFS
     * @param params
     * @returns Promise
     */
    findFeatures: (params) => {
        const config = getConfigProp('rasterOptions');
        const layerName = params.layerName;
        const url = API.WFS.getUrl(getConfigProp('georchestraUrl'), params.request);

        let i = 0;
        return new Promise((resolve, reject) => {
            return axios
                .get(url)
                .then((response) => {
                    return response.data;
                })
                .then((data) => {
                    if (data.features === undefined || data.features.length <= 0) {
                        return reject();
                    }

                    const featuresLength = data.features.length;
                    data.features.map((feature) => {
                        i++;
                        if (feature.geometry) {
                            if (
                                feature.properties &&
                                feature.properties.INFODATE &&
                                config.dateFormat
                            ) {
                                feature.properties.INFODATE = moment(
                                    feature.properties.INFODATE
                                ).format(config.dateFormat);
                            }

                            const reProjectFeature = CoordinatesUtils.reprojectGeoJson(
                                {
                                    type: 'FeatureCollection',
                                    fileName: feature.id,
                                    features: [feature],
                                },
                                'EPSG:2154',
                                'EPSG:4326'
                            );
                            const layerFeature = LayersUtils.geoJSONToLayer(
                                reProjectFeature,
                                feature.id,
                                config.group
                            );

                            params.addLayer(layerFeature);
                            params.addTile({ ...feature, layer: layerName });
                        }
                    });

                    if (i === featuresLength) {
                        return resolve();
                    }
                })
                .catch((err) => {
                    return reject();
                });
        });
    },
};

module.exports = Utils;
