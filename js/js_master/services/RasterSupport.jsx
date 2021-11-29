/**
 * @author CapGemini
 * @type {*|React}
 */

import CoordinatesUtils from '../../MapStore2/web/client/utils/CoordinatesUtils';
import { Draw } from 'ol/interaction';
import LocaleUtils from '../../MapStore2/web/client/utils/LocaleUtils';
import { Overlay } from 'ol';
import PropTypes from 'prop-types';
import RasterUtils from '../plugins/Raster/utils';
import React from 'react';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { createBox } from 'ol/interaction/Draw';
import { getStyle } from '../../MapStore2/web/client/components/map/openlayers/LegacyVectorStyle';

class RasterSupport extends React.Component {
    static propTypes = {
        addLayer: PropTypes.func,
        addTile: PropTypes.func,
        changeExportFormat: PropTypes.func,
        changeExportGap: PropTypes.func,
        changeVisibleState: PropTypes.func,
        map: PropTypes.object,
        raster: PropTypes.object,
        resetEnabledStatus: PropTypes.func,
        toggleLoading: PropTypes.func,
        toggleSupport: PropTypes.func,
    };

    static defaultProps = {
        addLayer: () => {},
        addTile: () => {},
        changeExportFormat: () => {},
        changeExportGap: () => {},
        changeVisibleState: () => {},
        map: {},
        raster: {},
        resetEnabledStatus: () => {},
        toggleLoading: () => {},
        toggleSupport: () => {},
    };

    static contextTypes = {
        messages: PropTypes.object,
    };

    /**
     * Activation/Désactivation du mode de sélection sur la carte
     * @param newProps
     */
    componentWillReceiveProps(newProps) {
        if (newProps.raster.selection.enabled === true && newProps.raster.visible === false) {
            this.drawInteraction(newProps, newProps.raster.selection.type);
        } else {
            this.removeDrawInteraction();
        }
    }

    /**
     * Permet de dessiner le Polygon/Point pour effectuer la sélection
     */
    drawInteraction = (props, type) => {
        const styleOptions = {
            style: {
                type,
            },
        };
        const style = getStyle(styleOptions);
        let source = new VectorSource();
        let vector = new VectorLayer({
            source,
            zIndex: 1000000,
            style,
        });

        this.props.map.addLayer(vector);

        const drawOptions = {
            source,
            type: styleOptions.style.type,
            style,
        };
        if (styleOptions.style.type === 'Polygon') {
            drawOptions['type'] = 'Circle';
            drawOptions['geometryFunction'] = createBox();
        }
        // create an interaction to draw with
        let draw = new Draw(drawOptions);

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
     * Lorsque la sélection est terminée, on effectue la recherche des features
     */
    drawEnd = () => {
        if (!this.sketchFeature) {
            return;
        }
        this.loader();
        const geometry = this.sketchFeature.getGeometry();

        this.findFeatures(geometry)
            .then(() => {
                this.loader();
            })
            .catch(() => {
                this.loader();
            });
        this.finish();
    };

    /**
     * Au début du dessin, on modifie le tooltip pour expliquer comment valider le dessin
     * @param event
     * @param source
     */
    drawStart = (event, source) => {
        this.sketchFeature = event.feature;
        this.helpTooltipElement.innerHTML = LocaleUtils.getMessageById(this.context.messages, 'raster.finishDrawing');
        source.clear();
    };

    /**
     * Terminer le dessin
     * On désactive l'outil, puis on affiche le plugin
     * @return {void}
     */
    finish = () => {
        this.props.changeVisibleState();
        this.props.toggleSupport();
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
    createHelpTooltip = () => {
        this.removeHelpTooltip();
        this.helpTooltipElement = document.createElement('div');
        this.helpTooltipElement.className = 'tooltip hidden';
        this.helpTooltipElement.innerHTML = LocaleUtils.getMessageById(this.context.messages, 'raster.startDrawing');
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
     * Trouve les features présente dans la sélection
     * Effectue une requête WFS
     * @param geometry
     */
    findFeatures = (geometry) => {
        let bbox = [];
        if (geometry.getType() === 'Point') {
            const point = geometry.getCoordinates();

            bbox[0] = point[0];
            bbox[1] = point[1];
            bbox[2] = point[0];
            bbox[3] = point[1];
        } else {
            bbox = geometry.getExtent();
        }
        const searchBbox = CoordinatesUtils.reprojectBbox(bbox, 'EPSG:3857', 'EPSG:2154');

        return RasterUtils.findFeatures({
            request: {
                typename: this.props.raster.layerName,
                bbox: searchBbox.join(','),
                srsname: 'EPSG:2154',
            },
            layerName: this.props.raster.layerName,
            addLayer: this.props.addLayer,
            addTile: this.props.addTile,
        }).then(() => {
            this.props.changeExportFormat('');
            this.props.changeExportGap(false);
            this.props.resetEnabledStatus();
        });
    };

    /**
     * Fonction pour modifier le statut du chargement
     * @bug J'ai mis un timeout, sinon le dessin de sélection a des erreurs
     */
    loader = () => {
        setTimeout(this.props.toggleLoading, 100);
    };

    /**
     * Aucun rendu pour un outil de dessin
     */
    render() {
        return null;
    }
}

export default RasterSupport;
