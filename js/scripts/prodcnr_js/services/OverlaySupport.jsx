/**
 * @author CapGemini
 */

import './overlay.css';

import { DragPan } from 'ol/interaction';
import { Overlay } from 'ol';
import PropTypes from 'prop-types';
import React from 'react';
import { fromLonLat } from 'ol/proj';

class OverlaySupport extends React.Component {
    static propTypes = {
        isActive: PropTypes.boolean,
        map: PropTypes.object,
        zoom: PropTypes.number,
        annotations: PropTypes.array,
    };

    static contextTypes = {
        messages: PropTypes.object,
    };

    static defaultProps = {
        map: {},
        annotations: [],
        zoom: 0,
        isActive: false,
    };

    state = {
        elements: [],
    };

    componentDidMount() {
        if (this.props.annotations && this.props.annotations[0] && this.props.annotations[0].features) {
            this.createOverlay(this.props.annotations[0].features, this.props.zoom);
        }
    }

    componentWillReceiveProps(newProps) {
        if (!!newProps && !!newProps.annotations && newProps.annotations.length !== this.props.annotations.length) {
            this.deleteOverlay();
        } else if (!!newProps && !!newProps.annotations && !!newProps.annotations[0] && !!this.props.annotations && !!this.props.annotations[0]) {
            if (newProps.annotations[0].visibility !== this.props.annotations[0].visibility && newProps.annotations[0].visibility === false) {
                this.deleteOverlay();
            } else if (
                !!newProps.annotations[0].features &&
                !!this.props.annotations[0].features &&
                newProps.annotations[0].visibility &&
                (document.getElementsByClassName('overlay').length === 0 ||
                    newProps.annotations[0].features.length !== this.props.annotations[0].features.length ||
                    newProps.annotations[0].features
                        .filter((feature) => feature && feature.properties)
                        .map((feature) => this.generateFeaturePropId(feature.properties))
                        .toString() !==
                        this.props.annotations[0].features
                            .filter((feature) => feature && feature.properties)
                            .map((feature) => this.generateFeaturePropId(feature.properties))
                            .toString())
            ) {
                this.createOverlay(newProps.annotations[0].features, newProps.zoom || 0, newProps.isActive);
            } else if (newProps.isActive !== this.props.isActive) {
                this.updateOverlay(newProps.isActive);
            } else if (newProps.zoom !== this.props.zoom) {
                this.updateZoom(newProps.zoom || 0, this.props.zoom || 0);
            }
        }
    }

    render() {
        return null;
    }

    updateZoom = (newZoom, oldZoom) => {
        this.state.elements.map((element) => {
            element.classList.remove(`zoom-${oldZoom}`);
            element.classList.add(`zoom-${newZoom}`);
        });
    };

    updateOverlay = (isActive) => {
        this.state.elements.map((element) => {
            isActive ? element.classList.add('isActive') : element.classList.remove('isActive');
            element.setAttribute('isactive', isActive);
        });
    };

    deleteOverlay = () => {
        const oldTooltips = document.getElementsByClassName('overlay') || [];
        [...oldTooltips].map((element) => element.remove());
    };

    /**
     * @param properties
     * @returns {string}
     */
    generateFeaturePropId = (properties) => {
        let content = '';

        if (properties && properties.title) {
            content += properties.title;
        }
        if (properties && properties.description) {
            content += properties.description;
        }

        return content;
    };

    /**
     * @param properties
     * @returns {string}
     */
    createInnerHTML = (properties) => {
        let html = '';
        if (properties && properties.title) {
            html += `<b>${properties.title}</b>`;
        }
        if (properties && properties.description) {
            if (properties.title) {
                html += `<br />`;
            }
            html += `${properties.description}`;
        }

        return html;
    };

    createOverlay = (annotations, zoom, isActive) => {
        this.deleteOverlay();
        /**
         * Creates a new help tooltip
         */
        const elements = annotations
            .filter((feature) => feature && feature.properties && feature.properties.description && feature.properties.description !== '')
            .map((feature) => {
                const element = document.createElement('div');
                element.id = 'Overlay';
                element.className = `overlay zoom-${zoom}`;
                element.innerHTML = this.createInnerHTML(feature.properties);
                element.setAttribute('isactive', isActive);
                const overlay = new Overlay({
                    position: this.position(feature.features[0]),
                    element: element,
                    offset: [15, 0],
                    stopEvent: false,
                    className: 'overlay',
                });
                this.props.map.addOverlay(overlay);
                let dragPan;
                this.props.map.getInteractions().forEach(function(interaction) {
                    if (interaction instanceof DragPan) {
                        dragPan = interaction;
                    }
                });

                element.addEventListener('click', function() {
                    if (element.getAttribute('isactive') === 'true') {
                        dragPan.setActive(false);
                        overlay.set('dragging', true);
                    }
                });

                this.props.map.on('pointermove', function(evt) {
                    if (overlay.get('dragging') === true) {
                        overlay.setPosition(evt.coordinate);
                    }
                });

                this.props.map.on('pointerup', function() {
                    if (overlay.get('dragging') === true) {
                        dragPan.setActive(true);
                        overlay.set('dragging', false);
                    }
                });
                return element;
            });
        this.setState({ elements: elements });
    };

    position = (feature) => {
        switch (feature.geometry.type) {
            case 'Point':
                return fromLonLat(feature.geometry.coordinates);
            case 'Polygon':
                return fromLonLat(feature.geometry.coordinates[0][feature.geometry.coordinates[0].length - 1]);
            default:
                return fromLonLat(feature.geometry.coordinates[feature.geometry.coordinates.length - 1]);
        }
    };
}

export default OverlaySupport;
