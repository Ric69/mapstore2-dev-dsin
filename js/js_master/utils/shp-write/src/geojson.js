module.exports.point = justType('Point', 'POINT');
module.exports.multipoint = justType('MultiPoint', 'MULTIPOINT');
module.exports.line = justType('LineString', 'POLYLINE');
module.exports.multiline = justType('MultiLineString', 'MULTIPOLYLINE');
module.exports.polygon = justType('Polygon', 'POLYGON');
module.exports.multipolygon = justType('MultiPolygon', 'MULTIPOLYGON');

function justType(type, TYPE) {
    return function(gj) {
        const ofType = gj.features.filter(isType(type));
        return {
            geometries:
                TYPE === 'POLYGON' || TYPE === 'POLYLINE'
                    ? [ofType.map((t) => justCoords(t, TYPE))]
                    : ofType.map((t) => justCoords(t, TYPE)),
            properties: ofType.map(justProps),
            type: TYPE,
        };
    };
}

function justCoords(t, TYPE) {
    if (TYPE === 'MULTIPOLYGON' || TYPE === 'MULTIPOLYLINE' || TYPE === 'MULTIPOINT') {
        return t.geometry.coordinates;
    }

    if (
        t.geometry.coordinates[0] !== undefined &&
        t.geometry.coordinates[0][0] !== undefined &&
        t.geometry.coordinates[0][0][0] !== undefined
    ) {
        return t.geometry.coordinates[0];
    } else {
        return t.geometry.coordinates;
    }
}

function justProps(t) {
    return t.properties;
}

function isType(t) {
    return function(f) {
        return f.geometry.type === t;
    };
}
