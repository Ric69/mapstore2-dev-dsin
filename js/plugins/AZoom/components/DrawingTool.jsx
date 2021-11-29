const React = require('react');
const { Glyphicon, ButtonGroup, Button, Tooltip, Col, Alert } = require('react-bootstrap');
const assign = require('object-assign');
require('../assets/style.css');
const PropTypes = require('prop-types');
const Dialog = require('../../../../MapStore2/web/client/components/misc/Dialog');
const LocaleUtils = require('../../../../MapStore2/web/client/utils/LocaleUtils');
const ExportUtils = require('../../../utils/ExportUtils');
const CoordinatesUtils = require('../../../../MapStore2/web/client/utils/CoordinatesUtils');
const Message = require('../../../../MapStore2/web/client/components/I18N/Message');
const ToggleButton = require('../../../../MapStore2/web/client/components/buttons/ToggleButton');
const { DropdownList } = require('react-widgets');
const { isEqual } = require('lodash');
const I18N = require('../../../../MapStore2/web/client/components/I18N/I18N');

class DrawingTool extends React.Component {
    static propTypes = {
        closeGlyph: PropTypes.string,
        onClose: PropTypes.func,
        show: PropTypes.bool,
        showAddDialog: PropTypes.bool,
        titleGlyph: PropTypes.string,
        geometries: PropTypes.array,
        exportDraw: PropTypes.object,
        features: PropTypes.array,
        inlineGlyph: PropTypes.bool,
        pointGlyph: PropTypes.string,
        pointLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        lineGlyph: PropTypes.string,
        lineLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        polygonGlyph: PropTypes.string,
        polygonLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        circleGlyph: PropTypes.string,
        circleLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        active: PropTypes.bool,
        deactivate: PropTypes.func,
        projections: PropTypes.shape({
            defaultProjection: PropTypes.shape({
                unit: PropTypes.string.isRequired,
                label: PropTypes.string.isRequired,
            }),
        }),
        projectionValues: PropTypes.array,
        onChangeProjection: PropTypes.func,
    };
    static defaultProps = {
        pointLabel: <Message msgId="drawingComponent.pointLabel" />,
        pointGlyph: 'point',
        lineLabel: <Message msgId="drawingComponent.lineLabel" />,
        lineGlyph: 'polyline',
        polygonLabel: <Message msgId="drawingComponent.polygonLabel" />,
        polygonGlyph: 'polygon',
        circleLabel: <Message msgId="drawingComponent.circleLabel" />,
        circleGlyph: '1-circle',
        animated: true,
        chartStyle: {
            margin: {
                top: 5,
                right: 5,
                left: 5,
                bottom: 45,
            },
            width: 400,
            height: 200,
        },
        closeGlyph: '1-close',
        elevations: {
            values: [],
        },
        onClose: () => {},
        onClick: () => {},

        show: false,
        titleGlyph: 'pencil-add',
        geometry: {
            coordinates: [],
        },
        geometries: [],
        features: [],
        active: false,
        deactivate: () => {},
        projections: {
            defaultProjection: { unit: 'EPSG:4326', label: 'WGS84' },
        },
        projectionValues: [{ value: 'EPSG:4326', label: 'WGS84' }, { value: 'EPSG:2154', label: 'Lambert93' }],
        onChangeProjection: () => {},
    };

    static contextTypes = {
        messages: PropTypes.object,
    };

    state = {
        selectedElement: 'drawingTool',
        show: true,
    };

    componentWillReceiveProps(nextProps) {
        if (this.props.active && !nextProps.active) {
            this.props.deactivate();
        }
    }

    onClick = (value) => {
        let status = 'start';
        let method = value;
        let owner = 'drawing';
        let features = [];
        let options = {
            plugin: 'drawingTool',
        };
        this.props.changeDrawingStatus(status, method, owner, features, options);
    };

    onClose = () => {
        this.props.drawSupportReset();
        this.props.hideWindowDrawing();
    };

    displayAddDialog = () => {
        this.setState(
            assign({}, this.state, {
                showAddDialog: true,
            })
        );
    };

    closeAddDialog = () => {
        this.setState(
            assign({}, this.state, {
                showAddDialog: false,
            })
        );
    };

    selectDraws(indexOfGeometry) {
        this.props.displayDraw(indexOfGeometry);
    }

    deleteDraws = () => {
        if (window.confirm('Êtes vous sûr de vouloir supprimer tous les dessins ?')) {
            this.props.removeDraws();
        }
    };

    getToolTips = () => {
        return {
            pointToolTip: <Tooltip id={'tooltip-button.point'}>{this.props.pointLabel}</Tooltip>,
            lineToolTip: <Tooltip id={'tooltip-button.line'}>{this.props.lineLabel}</Tooltip>,
            polygonToolTip: <Tooltip id={'tooltip-button.polygon'}>{this.props.polygonLabel}</Tooltip>,
            circleToolTip: <Tooltip id={'tooltip-button.circle'}>{this.props.circleLabel}</Tooltip>,
        };
    };

    exportGeometries = () => {
        if (this.props.geometries && this.props.geometries.length > 0) {
            const drawExport = this.props.geometries.map((geometry) => {
                return {
                    geometry: {
                        coordinates: geometry.coordinates,
                        type: geometry.type,
                    },
                    type: 'Feature',
                };
            });

            let features = Object.assign([], drawExport);
            let reprojectDraw = [];
            for (let i = 0; i < features.length; i++) {
                reprojectDraw.push(CoordinatesUtils.reprojectGeoJson(features[i], 'EPSG:3857', this.props.projections.defaultProjection.unit));
            }
            ExportUtils.toShape(reprojectDraw, 'draw');
        }
    };

    renderOptions = () => {
        let results = [];

        if (this.props.geometries && this.props.geometries.length > 0) {
            results.push(
                <div key="draw-shape-buttons" className="draw-shape-buttons">
                    <div id="drawingtool-projection-panel">
                        <label>{LocaleUtils.getMessageById(this.context.messages, 'drawingComponent.projection')} : </label>
                        <DropdownList
                            value={this.props.projections.defaultProjection.label}
                            onChange={(value) => {
                                this.props.onChangeProjection('defaultProjection', value, this.props.projections);
                            }}
                            data={this.props.projectionValues}
                            textField="label"
                            valueField="value"
                        />
                    </div>
                    <ButtonGroup>
                        <Button bsStyle={'primary'} className="btn-export-geometries" onClick={() => this.exportGeometries()}>
                            <Glyphicon glyph="export" /> {LocaleUtils.getMessageById(this.context.messages, 'drawingComponent.export')}
                        </Button>
                    </ButtonGroup>
                </div>
            );
        }

        return results;
    };

    renderDrawsList = () => {
        let results = [];
        if (this.props.geometries && this.props.geometries.length > 0) {
            this.props.geometries.map((element, key) => {
                let classNames = 'btn btn-default btn-geometry';
                if (this.props.geometries.active === key) {
                    classNames += ' active';
                }
                results.push(
                    <button key={'draw-' + key} onClick={() => this.selectDraws(key)} className={classNames}>
                        {() => {
                            switch (element.type) {
                                case 'Point':
                                    return <span className="glyphicon glyphicon-point" />;
                                case 'LineString':
                                    return <span className="glyphicon glyphicon-polyline" />;
                                case 'Polygon':
                                    return <span className="glyphicon glyphicon-polygon" />;
                                case 'Circle':
                                    return <span className="glyphicon glyphicon-1-circle" />;
                            }
                        }}
                        &nbsp;{LocaleUtils.getMessageById(this.context.messages, 'Dessin')} {element.id}
                    </button>
                );
            });
            results.push(
                <div className="drawe-shape-buttons">
                    <ButtonGroup>
                        <Button bsStyle={'primary'} className="btn-export-geometries" onClick={() => this.exportGeometries()}>
                            <Glyphicon glyph="export" />
                        </Button>
                        <Button bsStyle={'primary'} className="btn-delete-draw" onClick={() => this.deleteDraws()}>
                            <Glyphicon glyph="trash" />
                        </Button>
                    </ButtonGroup>
                </div>
            );
        }
        return <div>{results}</div>;
    };

    render() {
        if (this.props.show) {
            let { lineToolTip, pointToolTip, polygonToolTip, circleToolTip } = this.getToolTips();
            return (
                <Dialog id="drawingtool-dialog">
                    <div key="header" role="header" id="drawingtool-header">
                        <Glyphicon glyph={this.props.titleGlyph} />
                        &nbsp;{LocaleUtils.getMessageById(this.context.messages, 'drawingComponent.title')}
                        <button key="close" onClick={() => this.props.onClose()} className="close">
                            {this.props.closeGlyph ? <Glyphicon glyph={this.props.closeGlyph} /> : <span>×</span>}
                        </button>
                    </div>
                    <div key="body" className="panel-body" role="body" id="drawingtool-panel">
                        <Alert className="alert alert-success">
                            <I18N.HTML msgId="drawing.explain" />
                        </Alert>
                        <label>{LocaleUtils.getMessageById(this.context.messages, 'drawingComponent.shapeType')}&nbsp;</label>
                        <ButtonGroup id="type">
                            <ToggleButton
                                tooltip={pointToolTip}
                                bsStyle={'primary'}
                                className="square-button-md"
                                glyphicon={!this.props.inlineGlyph && this.props.pointGlyph}
                                onClick={() => this.onClick('Point')}
                            />
                            <ToggleButton
                                tooltip={lineToolTip}
                                bsStyle={'primary'}
                                className="square-button-md"
                                glyphicon={!this.props.inlineGlyph && this.props.lineGlyph}
                                onClick={() => this.onClick('LineString')}
                            />
                            <ToggleButton
                                tooltip={polygonToolTip}
                                bsStyle={'primary'}
                                className="square-button-md"
                                glyphicon={!this.props.inlineGlyph && this.props.polygonGlyph}
                                onClick={() => this.onClick('Polygon')}
                            />
                            <ToggleButton
                                tooltip={circleToolTip}
                                bsStyle={'primary'}
                                className="square-button-md"
                                glyphicon={!this.props.inlineGlyph && this.props.circleGlyph}
                                onClick={() => this.onClick('Circle')}
                            />
                        </ButtonGroup>
                        <div className="draw-options">{this.renderOptions()}</div>
                    </div>
                </Dialog>
            );
        }

        return null;
    }
}

module.exports = DrawingTool;
