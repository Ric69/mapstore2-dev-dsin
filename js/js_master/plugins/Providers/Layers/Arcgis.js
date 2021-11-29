/**
 * @author CapGemini
 *
 * Gestion des couches Arcgis
 */
import ol from 'ol';
import Tile from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import Layers from '@mapstore/utils/openlayers/Layers';
import CesiumLayers from '@mapstore/utils/cesium/Layers';
import Cesium from '@mapstore/libs/cesium';

Layers.registerType('arcgis', {
    create: (options) => {
        return new Tile({
            opacity: options.opacity !== undefined ? options.opacity : 1,
            visible: options.visibility !== undefined ? options.visibility : true,
            zIndex: options.zIndex,
            // preload: options.preload !== undefined ? options.preload : 8,
            source: new XYZ({
                url: options.url,
            }),
        });
    },
});

CesiumLayers.registerType('arcgis', (options) => {
    return new Cesium.UrlTemplateImageryProvider({
        url: options.url,
        enablePickFeatures: false,
    });
});
