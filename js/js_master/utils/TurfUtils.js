const TurfBuffer = require('turf-buffer');

const TurfUtils = {
    MultiPartToSinglePart: (features) => {
        let newParts = [];

        features.map((feature) => {
            if (
                feature.geometry &&
                feature.geometry.coordinates &&
                feature.geometry.type.toUpperCase() === 'MULTIPOINT'
            ) {
                feature.geometry.coordinates.map((coordinates) => {
                    newParts.push({
                        ...feature,
                        geometry: {
                            ...feature.geometry,
                            type: 'Point',
                            coordinates,
                        },
                    });
                });
            } else {
                newParts.push(feature);
            }
        });

        return newParts;
    },

    SinglePartToMultiPart: (features) => {
        let newParts = [];

        features.map((feature) => {
            if (
                feature.geometry &&
                feature.geometry.coordinates &&
                feature.geometry.type.toUpperCase() === 'POINT'
            ) {
                newParts.push({
                    ...feature,
                    geometry: {
                        ...feature.geometry,
                        type: 'MultiPoint',
                    },
                });
            } else {
                newParts.push(feature);
            }
        });

        return newParts;
    },

    normalize: (geoJson) => {
        const normalizeGeoJson = { ...geoJson };

        if (geoJson.type === 'FeatureCollection') {
            normalizeGeoJson.features = geoJson.features.map((feature) => {
                if (typeof feature.geometry === 'undefined' || !feature.geometry) {
                    return {
                        type: 'Feature',
                        geometry: feature,
                    };
                } else {
                    return feature;
                }
            });
        }

        return normalizeGeoJson;
    },

    buffer: (features, { distance, unit }) => {
        const distanceWithUnit = unit === 'km' ? distance : distance / 1000;

        return TurfBuffer(features, distanceWithUnit, 'kilometers');
    },
};

module.exports = TurfUtils;
