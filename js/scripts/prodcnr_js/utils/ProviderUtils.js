/**
 * @author CapGemini
 * Utilities pour les providers
 */
const axios = require('axios');
const SLDReader = require('./sldReader/sldReader');

const ConfigUtils = require('../../MapStore2/web/client/utils/ConfigUtils');
const StringUtils = require('./StringUtils');

const geometryMapping = {
    polygon: ['Polygon', 'MultiPolygon', 'Circle'],
    point: ['Point', 'MultiPoint', 'marker', 'Marker'],
    line: ['LineString', 'MultiLineString'],
};
const symbolizerMapping = {
    polygon: {
        name: 'polygonsymbolizer',
    },
    point: {
        name: 'pointsymbolizer',
    },
    line: {
        name: 'linesymbolizer',
    },
};

const getConfig = () => {
    return {
        main: ConfigUtils.getConfigProp('mainNdd'),
        rest: ConfigUtils.getConfigProp('georchestraUrlRest'),
    };
};

const lineStyleJson = (symbolizer) => {
    let style = {};
    if (symbolizer.stroke) {
        style = symbolizer.stroke.styling;
    }

    return {
        stroke: {
            color:
                style.strokeOpacity && style.stroke && style.stroke.slice(0, 1) === '#'
                    ? StringUtils.hexToRGB(style.stroke, style.strokeOpacity)
                    : style.stroke || '#3399CC',
            width: style.strokeWidth || 1.25,
            lineCap: style.strokeLinecap && style.strokeLinecap,
            lineDash: style.strokeDasharray && style.strokeDasharray.split(' '),
            lineDashOffset: style.strokeDashoffset && style.strokeDashoffset,
            lineJoin: style.strokeLinejoin && style.strokeLinejoin,
        },
    };
};

const pointStyleJson = (symbolizer) => {
    let style = symbolizer.graphic;

    if (style.mark) {
        let ref = style.mark;
        let fill = ref.fill;
        let stroke = ref.stroke;
        let fillColor = (fill && fill.styling && fill.styling.fill) || 'blue';
        fill = {
            color: fillColor,
        };
        if (stroke && !(Number(stroke.styling.strokeWidth) === 0)) {
            let ref$1 = stroke.styling;
            let cssStroke = ref$1.stroke;
            let cssStrokeWidth = ref$1.strokeWidth;
            stroke = {
                color: cssStroke || 'black',
                width: cssStrokeWidth || 2,
            };
        } else {
            stroke = undefined;
        }
        let radius = Number(style.size) || 10;
        switch (style.mark.wellknownname) {
            case 'circle':
                return {
                    type: 'Point',
                    call: 'Circle',
                    image: {
                        fill: fill,
                        radius: radius,
                        stroke: stroke,
                    },
                };
            case 'triangle':
                return {
                    type: 'Point',
                    call: 'RegularShape',
                    image: {
                        fill: fill,
                        points: 3,
                        radius: radius,
                        stroke: stroke,
                    },
                };
            case 'star':
                return {
                    type: 'Point',
                    call: 'RegularShape',
                    image: {
                        fill: fill,
                        points: 5,
                        radius1: radius,
                        radius2: radius / 2.5,
                        stroke: stroke,
                    },
                };
            case 'cross':
                return {
                    type: 'Point',
                    call: 'RegularShape',
                    image: {
                        fill: fill,
                        points: 4,
                        radius1: radius,
                        radius2: 0,
                        stroke: {
                            color: fillColor,
                            width: radius / 2,
                        },
                    },
                };
            case 'x':
                return {
                    type: 'Point',
                    call: 'RegularShape',
                    image: {
                        angle: Math.PI / 4,
                        fill: fill,
                        points: 4,
                        radius1: radius,
                        radius2: 0,
                        stroke: {
                            color: fillColor,
                            width: radius / 2,
                        },
                    },
                };
            default:
                // Default is `square`
                return {
                    type: 'Point',
                    call: 'RegularShape',
                    image: {
                        angle: Math.PI / 4,
                        fill: fill,
                        points: 4,
                        radius: radius,
                        stroke: stroke,
                    },
                };
        }
    }

    return {
        type: 'Point',
        call: 'Circle',
        image: {
            radius: 4,
            fill: {
                color: 'blue',
            },
        },
    };
};

const polygonStyleJson = (symbolizer) => {
    let stroke = symbolizer.stroke && symbolizer.stroke.styling;
    let fill = symbolizer.fill && symbolizer.fill.styling;

    return {
        fill: {
            color:
                fill.fillOpacity && fill.fill && fill.fill.slice(0, 1) === '#'
                    ? StringUtils.hexToRGB(fill.fill, fill.fillOpacity)
                    : fill.fill,
        },
        stroke: {
            color:
                stroke.strokeOpacity && stroke.stroke && stroke.stroke.slice(0, 1) === '#'
                    ? StringUtils.hexToRGB(stroke.stroke, stroke.strokeOpacity)
                    : stroke.stroke || '#3399CC',
            width: stroke.strokeWidth || 1.25,
            lineCap: stroke.strokeLinecap && stroke.strokeLinecap,
            lineDash: stroke.strokeDasharray && stroke.strokeDasharray.split(' '),
            lineDashOffset: stroke.strokeDashoffset && stroke.strokeDashoffset,
            lineJoin: stroke.strokeLinejoin && stroke.strokeLinejoin,
        },
    };
};

const ProviderUtils = {
    applySLD: (sld, geometry) => {
        let style = {};
        const sldObject = SLDReader.Reader(sld);
        const sldLayer = SLDReader.getLayer(sldObject);
        const rules = sldLayer.styles[0].featuretypestyles[0].rules;

        let geometryType = '';
        Object.keys(geometryMapping).map((objectKey) => {
            const values = geometryMapping[objectKey];

            if (values.indexOf(geometry) > -1) {
                geometryType = objectKey;
            }
        });

        const symbolizer = rules.find(
            (rule) => rule.name.toUpperCase() === geometryType.toUpperCase()
        );

        const data = symbolizer[symbolizerMapping[geometryType].name];
        switch (geometryType) {
            case 'polygon':
                style = polygonStyleJson(data);
                break;
            case 'point':
                style = pointStyleJson(data);
                break;
            case 'line':
                style = lineStyleJson(data);
                break;
        }

        return style;
    },

    /**
     * On applique le style pour le flux
     * S'il provient du mainNdd, on recherche le style par défaut pour l'appliquer
     * Sinon, on applique un style par défaut géré par l'application
     * @param layerOptions
     * @returns {*}
     */
    getStyle: (layerOptions) => {
        const config = getConfig();
        const name = layerOptions.name.split(':')[1];

        return new Promise((resolve, reject) => {
            return axios
                .get(config.rest + '/layers/' + name)
                .then((response) => {
                    if (
                        response.status === 200 &&
                        (response.data.layer &&
                            response.data.layer.defaultStyle &&
                            response.data.layer.defaultStyle.name)
                    ) {
                        const defaultStyle = response.data.layer.defaultStyle.name + '.sld';
                        const sldUrl = config.rest + '/styles/' + defaultStyle;

                        return axios
                            .get(sldUrl, {
                                headers: {
                                    'Content-Type': 'application/xml',
                                },
                            })
                            .then((response) => {
                                return resolve(
                                    ProviderUtils.applySLD(response.data, layerOptions.geometry)
                                );
                            })
                            .catch(() => {
                                return reject();
                            });
                    } else {
                        return reject();
                    }
                })
                .catch(() => {
                    return reject();
                });
        });
    },
};

module.exports = ProviderUtils;
