/**
 * @author CapGemini
 */
const React = require('react');
const { connect } = require('react-redux');
const Sortable = require('react-sortable-items');
const PropTypes = require('prop-types');
const { Thumbnail, Row, Glyphicon } = require('react-bootstrap');
const { isNil } = require('lodash');
const LayersTool = require('../../../../MapStore2/web/client/components/TOC/fragments/LayersTool');
const Slider = require('../../../../MapStore2/web/client/components/misc/Slider');
const { changeBackgroundProperties, reorderBackground } = require('../actions/BackgroundSwitcher');
const BackgroundSwitcherSortable = require('./BackgroundSwitcherSortable');

require('../styles/background-switcher.less');

/**
 * Surcharge l'affichage des Fond de plan
 *
 * @see /MapStore2/web/client/components/TOC/background/BackgroundSwitcher
 */
class BackgroundSwitcher extends React.Component {
    static propTypes = {
        onSort: PropTypes.func,
        toggleProperties: PropTypes.func,
    };

    static defaultProps = {
        onSort: () => {},
        toggleProperties: () => {},
    };

    /**
     * Permet d'ajouter/retirer le fond de plan
     *
     * @param eventObj
     */
    toggleBackground = (eventObj) => {
        let position = parseInt(eventObj.currentTarget.dataset.position, 10);
        let layer = this.props.layers[position];
        /** On ne traite que les fonds de plan */
        if (layer.group === 'background') {
            if (layer.visibility === true) {
                this.props.toggleProperties(layer, { visibility: false });
            } else {
                this.props.toggleProperties(layer, { visibility: true });
            }
        }
    };

    handleSort = (reorder) => {
        this.props.onSort(reorder);
    };

    renderLayers = (layers, thumbs) => {
        let items = [];
        for (let i = 0; i < layers.length; i++) {
            let layer = layers[i];
            let thumb = (thumbs[layer.source] && thumbs[layer.source][layer.name]) || layer.thumbURL || false;

            if (!layer.invalid) {
                items.push(
                    <div className="switcher-wrapper" key={layer.id}>
                        <h2 className="layer-title">
                            <LayersTool key="grabTool" tooltip="toc.grabLayerIcon" className="toc-grab" ref="target" glyph="menu-hamburger" />
                            &nbsp;
                            {layer.visibility ? (
                                <Glyphicon glyph="eye-open" data-position={i} onClick={this.toggleBackground} />
                            ) : (
                                <Glyphicon glyph="eye-close" data-position={i} onClick={this.toggleBackground} />
                            )}
                            &nbsp;
                            {layer.title}
                        </h2>
                        {thumb ? (
                            <Thumbnail
                                data-position={i}
                                key={'bkg-swicher-item-' + layer.id}
                                bsStyle={layer.visibility ? 'primary' : 'default'}
                                src={thumb}
                                alt={layer.source + ' ' + layer.name}
                                onClick={this.toggleBackground}
                            />
                        ) : (
                            ''
                        )}
                        {layer.visibility ? (
                            <div className="mapstore-slider with-tooltip">
                                <Slider
                                    tooltips={[
                                        {
                                            to: (value) => {
                                                return Math.round(value) + '%';
                                            },
                                        },
                                    ]}
                                    disabled={false}
                                    start={[isNil(layer.opacity) ? 100 : Math.round(layer.opacity * 100)]}
                                    range={{ min: 0, max: 100 }}
                                    onChange={(value) => this.props.toggleProperties(layer, { opacity: parseFloat((value[0] / 100).toFixed(2)) })}
                                />
                            </div>
                        ) : (
                            ''
                        )}
                    </div>
                );
            }
        }

        return items;
    };

    render() {
        const items = this.renderLayers(this.props.layers, this.props.thumbs).map((node, idx) => {
            return (
                <BackgroundSwitcherSortable key={node.key} sortData={idx} isDraggable={true}>
                    {node}
                </BackgroundSwitcherSortable>
            );
        });

        return (
            <Row className="row-fluid">
                <Sortable onSort={this.handleSort}>{items}</Sortable>
            </Row>
        );
    }
}

module.exports = connect(
    null,
    {
        toggleProperties: changeBackgroundProperties,
        onSort: reorderBackground,
    }
)(BackgroundSwitcher);
