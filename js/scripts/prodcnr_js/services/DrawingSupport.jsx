/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Circle, Fill, Stroke, Style } from 'ol/style';
import { Circle as CircleGeometry, LineString, MultiLineString, MultiPoint, MultiPolygon, Point } from 'ol/geom';
import { circular, fromCircle } from 'ol/geom/Polygon';
import { isArray, isNil } from 'lodash';

import { Feature } from 'ol';
import PropTypes from 'prop-types';
import React from 'react';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { reproject } from '../../MapStore2/web/client/utils/CoordinatesUtils';

class DrawingSupport extends React.Component {
    static propTypes = {
        map: PropTypes.object,
        drawing: PropTypes.object,
        resetDispayDraws: PropTypes.func,
        updateNode: PropTypes.func,
    };

    static defaultProps = {
        map: null,
        drawing: {},
    };

    componentWillReceiveProps(newProps) {
        if (this.props.drawing.geometries.length > newProps.drawing.geometries.length) {
            this.deleteElements();
        }
        if (this.props.drawing.display !== newProps.drawing.display) {
            this.showDrawing(newProps.drawing.geometries[newProps.drawing.display]);
        }
    }

    showDrawing = (geometry) => {
        let feature = new Feature({
            geometry: this.createOLGeometry({ type: geometry.type, coordinates: geometry.coordinates }),
        });

        feature.setId(geometry.id);

        const sourceVector = new VectorSource({
            features: [feature],
        });

        const sourceLayer = new VectorLayer({
            source: sourceVector,
            zIndex: 1000000,
            style: [
                new Style({
                    fill: new Fill({
                        color: 'rgba(0, 0, 255, 0.1)',
                    }),
                    stroke: new Stroke({
                        color: 'blue',
                        width: 2,
                    }),
                }),
                new Style({
                    image: new Circle({
                        radius: 5,
                        fill: new Fill({
                            color: 'orange',
                        }),
                    }),
                }),
            ],
        });

        this.props.map.addLayer(sourceLayer);
    };

    render() {
        return null;
    }

    reprojectCoordinatesToWGS84 = (coordinate, projection) => {
        let reprojectedCoordinate = reproject(coordinate, projection, 'EPSG:4326');
        return [reprojectedCoordinate.x, reprojectedCoordinate.y];
    };

    createOLGeometry = ({ type, coordinates, radius, center, projection, options = {} }) => {
        let geometry;
        switch (type) {
            case 'Point': {
                geometry = new Point(coordinates ? coordinates : []);
                break;
            }
            case 'LineString': {
                geometry = new LineString(coordinates ? coordinates : []);
                break;
            }
            case 'MultiPoint': {
                geometry = new MultiPoint(coordinates ? coordinates : []);
                break;
            }
            case 'MultiLineString': {
                geometry = new MultiLineString(coordinates ? coordinates : []);
                break;
            }
            case 'MultiPolygon': {
                geometry = new MultiPolygon(coordinates ? coordinates : []);
                break;
            }
            // defaults is Polygon
            default: {
                const isCircle =
                    projection &&
                    !isNaN(parseFloat(radius)) &&
                    center &&
                    !isNil(center.x) &&
                    !isNil(center.y) &&
                    !isNaN(parseFloat(center.x)) &&
                    !isNaN(parseFloat(center.y));
                geometry = isCircle
                    ? options.geodesic
                        ? circular(this.reprojectCoordinatesToWGS84([center.x, center.y], projection), radius, 100)
                              .clone()
                              .transform('EPSG:4326', projection)
                        : fromCircle(new CircleGeometry([center.x, center.y], radius), 100)
                    : new Polygon(coordinates && isArray(coordinates[0]) ? coordinates : []);

                // store geodesic center
                if (geometry && isCircle && options.geodesic) {
                    geometry.setProperties({ geodesicCenter: [center.x, center.y] }, true);
                }
            }
        }
        return geometry;
    };

    /**
     * Suppression des features suite à plusieurs mesures réalisées
     */
    deleteElements = () => {
        this.props.map.getLayers().forEach((layer) => {
            let source = layer.getSource();
            if (typeof source.getFeatures === 'function') {
                let features = source.getFeatures();
                features.forEach((feature) => {
                    source.removeFeature(feature);
                });
            }
        });
    };
}

export default DrawingSupport;
