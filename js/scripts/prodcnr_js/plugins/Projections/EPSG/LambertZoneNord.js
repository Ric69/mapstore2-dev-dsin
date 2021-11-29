const Proj4js = require('proj4').default;

/**
 * Projection Lambert Zone Nord (France)
 * @see https://epsg.io/27571
 */
Proj4js.defs(
    'EPSG:27571',
    '+proj=lcc +lat_1=49.50000000000001 +lat_0=49.50000000000001 +lon_0=0 +k_0=0.999877341 +x_0=600000 +y_0=1200000 +a=6378249.2 +b=6356515 +towgs84=-168,-60,320,0,0,0,0 +pm=paris +units=m +no_defs'
);

// Gestion des alias
Proj4js.defs('urn:x-ogc:def:crs:EPSG:27571', Proj4js.defs('EPSG:27571'));
Proj4js.defs('urn:x-ogc:def:crs:EPSG::27571', Proj4js.defs('EPSG:27571'));
Proj4js.defs('urn:ogc:def:crs:EPSG:27571', Proj4js.defs('EPSG:27571'));
Proj4js.defs('urn:ogc:def:crs:EPSG::27571', Proj4js.defs('EPSG:27571'));
