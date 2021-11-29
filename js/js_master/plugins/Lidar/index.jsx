const React = require('react');
const { connect } = require('react-redux');

/**
 * Liste des variable du state à include
 * @type {Object}
 */
const mapStateToProps = (state) => ({
    lidar: state.lidar,
});

const LidarPlugin = connect(mapStateToProps)(require('./components/Lidar'));

module.exports = {
    LidarDownloadPlugin: LidarPlugin,
    reducers: { lidar: require('./reducer') },
};
