/**
 * @author Capgemini
 */

const { head, find, isArray } = require('lodash');

const {
    defaultOptionsStyles,
} = require('../../../MapStore2/web/client/components/map/openlayers/LegacyVectorStyle');

const defaultStyle = {
    color: defaultOptionsStyles.stroke.color,
    fillColor: defaultOptionsStyles.fill.color,
    fillOpacity: defaultOptionsStyles.fill.opacity,
    opacity: 1,
    radius: defaultOptionsStyles.circle.radius,
    weight: defaultOptionsStyles.stroke.width,
};

const layersSelector = ({ layers, config } = {}) =>
    layers && isArray(layers) ? layers : (layers && layers.flat) || (config && config.layers) || [];

const getLayerFromId = (state, id) => head(layersSelector(state).filter((l) => l.id === id));

const selectedNodesSelector = (state) => (state.layers && state.layers.selected) || [];

const getSelectedLayerId = (state) => {
    const selected = selectedNodesSelector(state);
    return selected && selected[0];
};

const getSelectedLayerStyle = (state) => {
    const selectedLayer = getLayerFromId(state, getSelectedLayerId(state));
    return (selectedLayer && selectedLayer.style) || defaultStyle || state.style || {};
};

module.exports = {
    getSelectedLayerId,
    getSelectedLayerStyle,
};
