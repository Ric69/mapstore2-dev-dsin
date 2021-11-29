/**
 * @author CapGemini
 * @type {{default: string}}
 */

const list = {
    'EPSG:4326': 'WGS84 (Décimal)',
    'EPSG:900913': 'Google Maps Global Mercator',
    'EPSG:2154': 'RGF93/Lambert 93',
    'EPSG:27571': 'Lambert Zone Nord',
    'EPSG:27562': 'Lambert Zone Centre',
    'EPSG:27572': 'Lambert Zone 2 étendue',
    'EPSG:27573': 'Lambert Zone Sud',
};

const getEPSG = (nom) => {
    return Object.keys(list).find((key) => list[key] === nom);
};

const getName = (code) => {
    return list[code];
};

module.exports = {
    default: 'EPSG:3857',
    getEPSG,
    getName,
    list,
};
