const GET_FEATURE_LIDAR = 'GET_FEATURE_LIDAR';

const getFeatureData = (feature) => ({
    type: GET_FEATURE_LIDAR,
    feature,
});

module.exports = {
    GET_FEATURE_LIDAR,
    getFeatureData,
};
