const shpwrite = require('./shp-write');
const prj = require('./shp-write/src/prj');
const TurfUtils = require('./TurfUtils');

/**
 * @author CapGemini
 * Utilities pour les exports
 */
const ExportUtils = {
    /**
     * Export en ShapeFile
     * avec téléchargement du zip
     */
    toShape: (features, folder = 'shapes', projection = Object.keys(prj)[0]) => {
        let options = {
            folder: folder,
            types: {
                point: 'points',
                multipoint: 'multipoints',
                polygon: 'polygons',
                multipolygon: 'multipolygons',
                line: 'line',
                lineString: 'lines',
                MultiLineString: 'mutlilines',
            },
            projection: projection,
        };
        features = TurfUtils.MultiPartToSinglePart(features);

        shpwrite.download(
            {
                type: 'FeatureCollection',
                features: features,
            },
            options
        );
    },
};

module.exports = ExportUtils;
