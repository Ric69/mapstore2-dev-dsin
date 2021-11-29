const Proj4js = require('proj4').default;

/**
 * Projection Lambert 93 (France)
 * @see https://epsg.io/2154
 */
Proj4js.defs(
    'EPSG:2154',
    '+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
);

// Gestion des alias
Proj4js.defs('urn:x-ogc:def:crs:EPSG:2154', Proj4js.defs('EPSG:2154'));
Proj4js.defs('urn:x-ogc:def:crs:EPSG::2154', Proj4js.defs('EPSG:2154'));
Proj4js.defs('urn:ogc:def:crs:EPSG:2154', Proj4js.defs('EPSG:2154'));
Proj4js.defs('urn:ogc:def:crs:EPSG::2154', Proj4js.defs('EPSG:2154'));
