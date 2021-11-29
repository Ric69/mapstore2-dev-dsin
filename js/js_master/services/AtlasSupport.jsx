/**
 * @author CapGemini
 * @type {*|React}
 */
import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import CoordinatesUtils from '../../MapStore2/web/client/utils/CoordinatesUtils';
import ConfigUtils from '../../MapStore2/web/client/utils/ConfigUtils';
import LocaleUtils from '../../MapStore2/web/client/utils/LocaleUtils';
import WFS from '../../MapStore2/web/client/api/WFS';

import Overlay from 'ol/Overlay';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { Circle, Fill, Stroke, Style } from 'ol/style';
import { Draw } from 'ol/interaction';
import { createBox } from 'ol/interaction/Draw';

const API = {
    WFS,
};

class AtlasSupport extends React.Component {
    static propTypes = {
        map: PropTypes.object,
        toggleVisible: PropTypes.func,
        toggleInserting: PropTypes.func,
        toggleSelection: PropTypes.func,
    };

    static contextTypes = {
        messages: PropTypes.object,
    };

    componentWillReceiveProps(newProps) {
        if (newProps.atlas.selection && newProps.atlas.selection.enabled && !newProps.atlas.visible && this.onDrawing === null) {
            this.drawInteraction(newProps);
        } else {
            this.removeDrawInteraction();
        }
    }

    /**
     * Creates a new help tooltip
     */
    createHelpTooltip = () => {
        this.removeHelpTooltip();
        this.helpTooltipElement = document.createElement('div');
        this.helpTooltipElement.className = 'tooltip hidden';
        this.helpTooltip = new Overlay({
            element: this.helpTooltipElement,
            offset: [15, 0],
            positioning: 'center-left',
        });
        this.props.map.addOverlay(this.helpTooltip);
    };

    /**
     * Permet de dessiner le rectangle pour effectuer la sélection
     */
    drawInteraction = () => {
        let source = new VectorSource();
        let vector = new VectorLayer({
            source: source,
            zIndex: 1000000,
            style: new Style({
                fill: new Fill({
                    color: 'rgba(255, 255, 255, 0.2)',
                }),
                stroke: new Stroke({
                    color: '#ffcc33',
                    width: 2,
                }),
                image: new Circle({
                    radius: 7,
                    fill: new Fill({
                        color: '#ffcc33',
                    }),
                }),
            }),
        });

        this.props.map.addLayer(vector);

        // create an interaction to draw with
        let draw = new Draw({
            source: source,
            type: 'Circle',
            geometryFunction: createBox(),
            style: new Style({
                fill: new Fill({
                    color: 'rgba(255, 255, 255, 0.2)',
                }),
                stroke: new Stroke({
                    color: 'rgba(0, 0, 0, 0.5)',
                    lineDash: [10, 10],
                    width: 2,
                }),
                image: new Circle({
                    radius: 5,
                    stroke: new Stroke({
                        color: 'rgba(0, 0, 0, 0.7)',
                    }),
                    fill: new Fill({
                        color: 'rgba(255, 255, 255, 0.2)',
                    }),
                }),
            }),
        });

        this.props.map.on('pointermove', this.pointerMoveHandler, this);

        draw.on(
            'drawstart',
            (evt) => {
                this.drawStart(evt, source);
            },
            this
        );
        draw.on(
            'drawend',
            () => {
                this.drawEnd();
            },
            this
        );

        this.createHelpTooltip();
        this.props.map.addInteraction(draw);
        this.onDrawing = draw;
        this.selectionLayer = vector;
    };

    /**
     * Action lorsque la sélection est terminée
     */
    drawEnd = () => {
        if (!this.sketchFeature) {
            return;
        }
        const geometry = this.sketchFeature.getGeometry();
        this.findFeatures(geometry)
            .then(() => {
                this.props.toggleLoader();
            })
            .catch(() => {
                this.props.toggleLoader();
            });
        this.finish();
    };

    /**
     *
     * @param event
     * @param source
     */
    drawStart = (event, source) => {
        this.sketchFeature = event.feature;
        source.clear();
    };

    /**
     * Trouve les features présente dans la sélection
     * Effectue une requête WFS
     * @param geometry
     */
    findFeatures = (geometry) => {
        const bbox = geometry.getExtent();
        const searchBbox = CoordinatesUtils.reprojectBbox(bbox, 'EPSG:3857', 'EPSG:2154') || [];
        const url = API.WFS.getUrl(ConfigUtils.getConfigProp('georchestraUrl'), {
            typename: this.props.atlas.layer,
            bbox: searchBbox.join(','),
            srsname: 'EPSG:2154',
        });

        return new Promise((resolve, reject) => {
            this.props.toggleLoader();

            return axios
                .get(url)
                .then((response) => {
                    if (response.status === 200 && typeof response.data === 'object') {
                        if (!response.data.features || response.data.features.length < 1) {
                            return reject();
                        }
                        const featuresLength = response.data.features.length;
                        let i = 0;
                        response.data.features.map((feature) => {
                            if (feature.geometry) {
                                const id = feature.id;
                                let extent = [];
                                if (feature.geometry.type === 'Point') {
                                    const point = feature.geometry.coordinates;
                                    extent[0] = point[0];
                                    extent[1] = point[1];
                                    extent[2] = point[0];
                                    extent[3] = point[1];
                                } else {
                                    extent = CoordinatesUtils.getGeoJSONExtent(feature);
                                }
                                this.props.toggleInserting(id, extent, 'EPSG:2154');
                            }

                            i++;
                            if (i === featuresLength) {
                                return resolve();
                            }
                        });
                    } else {
                        return reject();
                    }
                })
                .catch((err) => {
                    alert('Veuillez vous connecter pour accèder aux données de la couche');
                    return reject();
                });
        });
    };

    /**
     * Terminer le dessin
     * @return {void}
     */
    finish = () => {
        this.props.toggleSelection();
        this.props.toggleVisible();
    };

    /**
     * Handle pointer move.
     * @param {ol.MapBrowserEvent} evt The event.
     */
    pointerMoveHandler = (evt) => {
        if (evt.dragging) {
            return null;
        }

        this.helpTooltipElement.innerHTML = LocaleUtils.getMessageById(this.context.messages, 'atlas.startDrawing');
        this.helpTooltip.setPosition(evt.coordinate);

        this.helpTooltipElement.classList.remove('hidden');
    };

    /**
     *
     */
    removeDrawInteraction = () => {
        if (this.onDrawing !== null) {
            this.props.map.removeInteraction(this.onDrawing);
            this.onDrawing = null;
            this.props.map.removeLayer(this.selectionLayer);
            this.sketchFeature = null;
            this.removeHelpTooltip();
        }
    };

    /**
     * remove help tooltip
     */
    removeHelpTooltip = () => {
        if (this.helpTooltipElement && this.helpTooltipElement.parentNode) {
            this.helpTooltipElement.parentNode.removeChild(this.helpTooltipElement);
        }
    };

    render() {
        return null;
    }
}

export default AtlasSupport;
