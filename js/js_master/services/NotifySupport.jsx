/**
 * @author CapGemini
 * @type {*|React}
 */
import React from 'react';
import PropTypes from 'prop-types';

import CoordinatesUtils from '@mapstore/utils/CoordinatesUtils';
import { getCustomStyles } from '@mapstore/components/map/openlayers/LegacyVectorStyle';

import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { Draw, Snap } from 'ol/interaction';
import Feature from 'ol/Feature';
import { GeoJSON } from 'ol/format';
import { bbox } from 'ol/loadingstrategy';
import LocaleUtils from '@mapstore/utils/LocaleUtils';
import { Polygon } from 'ol/geom';
import Modify from 'ol/interaction/Modify';
import Collection from 'ol/Collection';
import { Overlay } from 'ol';

class NotifySupport extends React.Component {
    static propTypes = {
        enabled: PropTypes.bool,
        visible: PropTypes.bool,
    };

    static defaultProps = {
        enabled: false,
        visible: false,
    };

    static contextTypes = {
        messages: PropTypes.object,
    };

    /**
     * Activation/Désactivation du mode de sélection sur la carte
     * @param newProps
     */
    componentWillReceiveProps(newProps) {
        this.removeHelpTooltip();
        if (
            newProps.enabled === true &&
            newProps.visible === true &&
            (newProps.editing && newProps.editing.feature && newProps.editing.feature.geometry === null)
        ) {
            this.drawInteraction();
        } else if (newProps.editing && newProps.editing.feature && newProps.editing.feature.geometry) {
            this.modifyAndSnapInteraction(newProps);
        } else {
            this.props.map.removeLayer(this.selectionLayer);
        }
    }

    /**
     * Modification du polygone et snapping
     * @param props
     */
    modifyAndSnapInteraction = (props) => {
        const isModifying = props.enabled === true && props.visible === true;
        if (this.selectionLayer) {
            this.props.map.removeLayer(this.selectionLayer);
            this.selectionLayer = null;
        }
        if (this.modifyInteraction) {
            this.props.map.removeInteraction(this.modifyInteraction);
        }
        if (this.snaping) {
            this.props.map.removeInteraction(this.snaping);
        }

        const featureReprojected = CoordinatesUtils.reprojectGeoJson(props.editing.feature, 'EPSG:2154', 'EPSG:3857');
        const feature = new Feature({
            geometry: new Polygon(featureReprojected.geometry.coordinates),
        });
        const style = getCustomStyles();
        let source = new VectorSource({
            format: new GeoJSON(),
            strategy: bbox,
        });
        source.addFeatures([feature]);
        let vector = new VectorLayer({
            source,
            zIndex: 1000000,
            style,
            visible: true,
        });
        this.selectionLayer = vector;
        this.props.map.addLayer(vector);

        if (isModifying) {
            this.modifyInteraction = new Modify({
                layers: [vector],
                features: new Collection([feature]),
            });
            this.modifyInteraction.on('modifyend', (event) => {
                const feature = event.features.getArray()[0];
                const geometry = feature.getGeometry();
                const featureReprojected = CoordinatesUtils.reprojectGeoJson(
                    {
                        type: 'Feature',
                        geometry: {
                            coordinates: geometry.getCoordinates(),
                            type: geometry.getType(),
                        },
                    },
                    'EPSG:3857',
                    'EPSG:2154'
                );
                this.props.setGeometry(featureReprojected.geometry);
            });
            this.props.map.addInteraction(this.modifyInteraction);

            this.snaping = new Snap({
                source: vector.getSource(),
            });
            this.props.map.addInteraction(this.snaping);

            this.props.map.on('pointermove', this.pointerMoveHandler, this);
            this.createHelpTooltip(LocaleUtils.getMessageById(this.context.messages, 'notify.modifyDrawing'));
        }
    };

    /**
     * Permet de dessiner le Polygon pour effectuer la sélection
     */
    drawInteraction = () => {
        const style = getCustomStyles();
        let source = new VectorSource();
        let vector = new VectorLayer({
            source,
            zIndex: 1000000,
            style,
        });

        const drawOptions = {
            source,
            type: 'Polygon',
            style,
        };

        let draw = new Draw(drawOptions);
        this.props.map.addLayer(vector);

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

        this.createHelpTooltip(LocaleUtils.getMessageById(this.context.messages, 'notify.startDrawing'));
        this.props.map.addInteraction(draw);
        this.onDrawing = draw;
        this.selectionLayer = vector;
    };

    /**
     * Termine l'interaction du dessin
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
     * Au début du dessin, on modifie le tooltip pour expliquer comment valider le dessin
     * @param event
     * @param source
     */
    drawStart = (event, source) => {
        this.sketchFeature = event.feature;
        this.helpTooltipElement.innerHTML = LocaleUtils.getMessageById(this.context.messages, 'notify.finishDrawing');
        source.clear();
    };

    /**
     * Lorsque la sélection est terminée, on effectue la recherche des features
     */
    drawEnd = () => {
        if (!this.sketchFeature) {
            return;
        }
        const geometry = this.sketchFeature.getGeometry();
        const feature = {
            type: 'Feature',
            geometry: {
                coordinates: geometry.getCoordinates(),
                type: geometry.getType(),
            },
        };
        const featureReprojected = CoordinatesUtils.reprojectGeoJson(feature, 'EPSG:3857', 'EPSG:2154');
        this.props.setGeometry(featureReprojected.geometry);
        this.removeHelpTooltip();
        this.finish();
    };

    /**
     * Terminer le dessin
     * On désactive l'outil
     * @return {void}
     */
    finish = () => {
        this.props.enabledSupport();
        this.props.map.removeInteraction(this.onDrawing);
        this.onDrawing = null;
    };

    /**
     * Lorsque le pointer bouge, on modifie la position du tooltip
     * @param {ol.MapBrowserEvent} evt The event.
     */
    pointerMoveHandler = (evt) => {
        if (evt.dragging) {
            return null;
        }

        this.helpTooltip.setPosition(evt.coordinate);
        this.helpTooltipElement.classList.remove('hidden');
    };

    /**
     * Création d'un tooltip au niveau du pointer de dessin
     */
    createHelpTooltip = (language) => {
        this.removeHelpTooltip();
        this.helpTooltipElement = document.createElement('div');
        this.helpTooltipElement.className = 'tooltip hidden';
        this.helpTooltipElement.innerHTML = language;
        this.helpTooltip = new Overlay({
            element: this.helpTooltipElement,
            offset: [15, 0],
            positioning: 'center-left',
        });
        this.props.map.addOverlay(this.helpTooltip);
    };

    /**
     * Suppression du tooltip
     */
    removeHelpTooltip = () => {
        if (this.helpTooltipElement && this.helpTooltipElement.parentNode) {
            this.helpTooltipElement.parentNode.removeChild(this.helpTooltipElement);
        }
    };

    /**
     * Aucun rendu pour un outil de dessin
     */
    render() {
        return null;
    }
}

export default NotifySupport;
