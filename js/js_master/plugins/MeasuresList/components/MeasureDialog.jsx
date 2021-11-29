const PropTypes = require('prop-types');
/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const { DropdownList } = require('react-widgets');
const { ButtonGroup, Button, Glyphicon, DropdownButton, MenuItem } = require('react-bootstrap');
const MeasureComponent = require('./MeasureComponent');
const Message = require('../../../../MapStore2/web/client/components/I18N/Message');
const Dialog = require('../../../../MapStore2/web/client/components/misc/Dialog');
const localeUtils = require('../../../../MapStore2/web/client/utils/LocaleUtils');
const ExportUtils = require('../../../utils/ExportUtils');
const DrawUtils = require('../../../utils/DrawUtils').default;
const CoordinatesUtils = require('../../../../MapStore2/web/client/utils/CoordinatesUtils');
require('./style.css');

class MeasureDialog extends React.Component {
    static propTypes = {
        show: PropTypes.bool,
        closeGlyph: PropTypes.string,
        onClose: PropTypes.func,
        geometries: PropTypes.array,
        changeMeasurementState: PropTypes.func,
        changeGeometry: PropTypes.func,
        clickOnMap: PropTypes.func,
        removeGeometries: PropTypes.func,
        projections: PropTypes.shape({
            defaultProjection: PropTypes.shape({
                unit: PropTypes.string.isRequired,
                label: PropTypes.string.isRequired,
            }),
        }),
        projectionValues: PropTypes.array,
    };

    static defaultProps = {
        show: false,
        closeGlyph: '1-close',
        measurement: [],
        projections: {
            defaultProjection: { unit: 'EPSG:4326', label: 'WGS84' },
        },
        projectionValues: [{ value: 'EPSG:4326', label: 'WGS84' }, { value: 'EPSG:2154', label: 'Lambert93' }],
    };

    static contextTypes = {
        messages: PropTypes.object,
    };

    onClose = () => {
        this.props.onClose(false);
    };

    selectGeometry(indexOfGeometry) {
        this.props.displayGeometry(indexOfGeometry);
    }

    deleteGeometries = () => {
        if (window.confirm(localeUtils.getMessageById(this.context.messages, 'measureDialog.deleteAllConfirm'))) {
            this.props.removeGeometries();
        }
    };

    getGeometries = (type) => {
        return ((this.props.measurement && this.props.measurement.geometries) || []).filter((geometry) => {
            if (geometry.geometry.type === type) {
                return geometry;
            }
        });
    };

    getGeometryName = (id) => {
        const geometryLayer = (this.props.layers || []).filter((layer) => layer.id === id);

        if (geometryLayer.length > 0) {
            return geometryLayer[0].title;
        } else {
            return localeUtils.getMessageById(this.context.messages, 'measureDialog.shape') + id;
        }
    };

    exportGeometries = () => {
        if (this.props.projections.defaultProjection.unit !== 'EPSG:3857') {
            const reprojectedGeometries = CoordinatesUtils.reprojectGeoJson(
                {
                    crs: {
                        properties: { name: 'EPSG:3857' },
                        type: 'name',
                    },
                    type: 'FeatureCollection',
                    features: this.props.measurement.geometries,
                },
                'EPSG:3857',
                this.props.projections.defaultProjection.unit
            );
            ExportUtils.toShape(reprojectedGeometries.features, 'measures');
        } else {
            ExportUtils.toShape(this.props.measurement.geometries, 'measures');
        }
    };

    deleteGeometry = (geometry) => {
        this.props.removeGeometry(geometry.id);
        this.props.removeLayer(geometry.id, DrawUtils.groupMeasure);
    };

    renderGeometriesList = () => {
        let results = [];
        if (this.props.measurement && this.props.measurement.geometries.length > 0) {
            this.props.measurement.geometries.map((element, key) => {
                let classNames = 'btn btn-default btn-geometry';
                if (this.props.measurement.active === key) {
                    classNames += ' active';
                }
                results.push(
                    <button key={'geometry-' + key} onClick={() => this.selectGeometry(key)} className={classNames}>
                        {(() => {
                            switch (element.geometry.type) {
                                case 'LineString':
                                    return <span className="glyphicon glyphicon-1-measure-lenght" />;
                                case 'Polygon':
                                    return <span className="glyphicon glyphicon-1-measure-area" />;
                                case 'Bearing':
                                    return <span className="glyphicon glyphicon-1-bearing" />;
                            }
                        })()}
                        &nbsp;{this.getGeometryName(element.id)}
                        <div
                            className="measure-remove"
                            onClick={() =>
                                window.confirm(localeUtils.getMessageById(this.context.messages, 'measureComponent.confirm'))
                                    ? this.deleteGeometry(element)
                                    : undefined
                            }>
                            <span className="glyphicon glyphicon-trash" />
                        </div>
                    </button>
                );
            });

            results.push(
                <div key={'measure-shape-buttons'} className="measure-shape-buttons">
                    <ButtonGroup>
                        <div id="drawingtool-projection-panel">
                            <label>{localeUtils.getMessageById(this.context.messages, 'measureDialog.projection')} : </label>
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
                        <Button bsStyle="info" className="btn-export-geometries" onClick={this.exportGeometries}>
                            <Glyphicon glyph="export" />
                            {localeUtils.getMessageById(this.context.messages, 'measureDialog.exportAll')}
                        </Button>
                    </ButtonGroup>
                </div>
            );
        }
        return results;
    };

    render() {
        return this.props.show ? (
            <Dialog id="mapstore-measure-panel">
                <div key="header" role="header">
                    <Glyphicon glyph="1-ruler" />
                    &nbsp;
                    <Message key="title" msgId="measureComponent.Measure" />
                    <button key="close" onClick={this.onClose} className="close">
                        {this.props.closeGlyph ? <Glyphicon glyph={this.props.closeGlyph} /> : <span>×</span>}
                    </button>
                </div>
                <div key="body" className="panel-body" role="body">
                    <MeasureComponent
                        id="measure-panel"
                        style={{
                            minWidth: '500px',
                        }}
                        {...this.props}
                    />
                    <div className="measure-list">{this.renderGeometriesList()}</div>
                </div>
            </Dialog>
        ) : null;
    }
}

module.exports = MeasureDialog;
