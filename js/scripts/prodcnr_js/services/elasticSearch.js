const axios = require('axios');
const ConfigUtils = require('../../MapStore2/web/client/utils/ConfigUtils');

const searchFullTextChange = (text, geometry = undefined, from = 0, size = 10000) => {
    let query = {
        from,
        size,
        query: {
            bool: {
                must: {
                    multi_match: {
                        query: text,
                        fuzziness: 'AUTO',
                    },
                },
            },
        },
    };

    if (geometry) {
        if (
            geometry.coordinates[0][0] !==
            geometry.coordinates[0][geometry.coordinates[0].length - 1]
        ) {
            geometry.coordinates[0].push(geometry.coordinates[0][0]);
        }

        query = {
            ...query,
            query: {
                ...query.query,
                bool: {
                    ...query.query.bool,
                    filter: {
                        geo_shape: {
                            location: {
                                shape: {
                                    type: geometry.type,
                                    coordinates: geometry.coordinates,
                                },
                                relation: 'within',
                            },
                        },
                    },
                },
            },
        };
    }

    return axios.post(ConfigUtils.getConfigProp('elasticSearch'), query, {});
};

module.exports = { searchFullTextChange };
