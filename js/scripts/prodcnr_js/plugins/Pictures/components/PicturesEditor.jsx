/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const PropTypes = require('prop-types');
const React = require('react');

// import EXIF from 'exif-js';
const EXIF = require('exif-js');

const { Button, Glyphicon } = require('react-bootstrap');
const TButton = require('../../../../MapStore2/web/client/components/data/featuregrid/toolbars/TButton');

const Message = require('../../../../MapStore2/web/client/components/I18N/Message');
const Portal = require('../../../../MapStore2/web/client/components/misc/Portal');
const { FormControl, ButtonGroup, Grid, Row, Col } = require('react-bootstrap');

const ReactQuill = require('react-quill');
require('react-quill/dist/quill.snow.css');
const CoordinatesUtils = require('../../../../MapStore2/web/client/utils/CoordinatesUtils');
const { getMessageById } = require('@mapstore/utils/LocaleUtils');

const ConfirmDialog = require('../../../../MapStore2/web/client/components/misc/ConfirmDialog');
const assign = require('object-assign');

const defaultConfig = require('./PicturesConfig');
const axios = require('axios');
const ConfigUtils = require('../../../../MapStore2/web/client/utils/ConfigUtils');

/**
 * (Default) Viewer / Editor for Pictures.
 * @memberof components.mapControls.pictures
 * @class
 * @prop {string} id identifier of the current picture feature
 * @prop {object} editing feature object of the feature under editing (when editing mode is enabled, null otherwise)
 * @prop {boolean} drawing flag to state status of drawing during editing
 * @prop {object} feature object with the picture properties
 * @prop {bool} showBack shows / hides the back button
 * @prop {function} onSave triggered when the user clicks on the save button
 * @prop {function} onAddGeometry triggered when the user clicks on the add point button
 * @prop {function} onSetStyle triggered when the user changes a style property
 *
 * In addition, as the Identify viewer interface mandates, every feature attribute is mapped as a component property (in addition to the feature object).
 */
class PicturesEditor extends React.Component {
    static displayName = 'PicturesEditor';

    static propTypes = {
        id: PropTypes.string,
        onCancel: PropTypes.func,
        onSave: PropTypes.func,
        onAddGeometry: PropTypes.func,
        onConfirmClose: PropTypes.func,
        onInitGeometry: PropTypes.func,
        editing: PropTypes.object,
        drawing: PropTypes.bool,
        closing: PropTypes.bool,
        showBack: PropTypes.bool,
        mode: PropTypes.string,
        feature: PropTypes.object,
        user: PropTypes.string,
    };

    static defaultProps = {
        showBack: false,
        feature: {},
        user: '',
    };

    static contextTypes = {
        messages: PropTypes.object,
    };

    state = {
        uploading: false,
        fields: {
            picture: null,
            description: null,
        },
        errors: {},
    };

    componentWillReceiveProps(newProps) {
        if (newProps.id !== this.props.id) {
            this.setState({
                fields: {
                    picture: null,
                    description: null,
                },
            });
        }
    }

    getBodyItems = () => {
        return defaultConfig.fields.map((field) => {
            return (
                <span>
                    <p key={field.name} className={'mapstore-pictures-info-viewer-item mapstore-pictures-info-viewer-' + field.name}>
                        {field.showLabel ? (
                            <label>
                                <Message msgId={'pictures.field.' + field.name} />
                            </label>
                        ) : null}
                        {this.renderProperty(field, this.state.fields[field.name] || field.value)}
                        {this.renderErrorOn(field)}
                    </p>
                </span>
            );
        });
    };

    renderButtons = () => {
        return (
            <Grid className="mapstore-pictures-info-viewer-buttons" fluid>
                <Row>
                    <Col xs={7}>
                        <TButton
                            id="edit-geometry"
                            tooltip={<Message msgId="pictures.addMarker" />}
                            onClick={this.props.onAddGeometry}
                            visible
                            className="square-button-md"
                            active={this.props.drawing}
                            glyph="pencil-add"
                        />
                    </Col>
                    <Col xs={5}>
                        <ButtonGroup id="mapstore-pictures-info-viewer-edit-buttons">
                            <Button bsStyle="primary" onClick={this.save}>
                                <Glyphicon glyph="floppy-disk" />
                                &nbsp;
                                <Message msgId="pictures.save" />
                            </Button>
                            <Button bsStyle="primary" onClick={this.cancelEdit}>
                                <Glyphicon glyph="remove" />
                                &nbsp;
                                <Message msgId="pictures.cancel" />
                            </Button>
                        </ButtonGroup>
                    </Col>
                </Row>
            </Grid>
        );
    };

    addPicture = (e) => {
        this.setState({ uploading: true });
        let reader = new FileReader();
        let file = e.target.files[0];
        if (file === undefined) {
            return null;
        }

        reader.readAsDataURL(file);
        return (reader.onloadend = () => {
            this.setState({
                preview: reader.result,
                fields: assign({}, this.state.fields, {
                    picture: reader.result,
                }),
                uploading: false,
            });
            return fetch(reader.result)
                .then((res) => res.blob())
                .then((blob) => {
                    return EXIF.getData(blob, () => {
                        let thumbnail = EXIF.getTag(blob, 'thumbnail');
                        if (!!thumbnail && !!thumbnail.blob) {
                            let pict = URL.createObjectURL(thumbnail.blob);
                            if (pict) {
                                this.setState({
                                    preview: pict,
                                });
                            }
                        }
                        let lat = EXIF.getTag(blob, 'GPSLatitude');
                        let latRef = EXIF.getTag(blob, 'GPSLatitudeRef');
                        let lon = EXIF.getTag(blob, 'GPSLongitude');
                        let lonRef = EXIF.getTag(blob, 'GPSLongitudeRef');
                        if (!!lat && !!lon && lat !== null && lon !== null) {
                            let geometry = {
                                type: 'Point',
                                coordinates: [
                                    this.convertGPSDMStoDD(lon[0], lon[1], lon[2], lonRef),
                                    this.convertGPSDMStoDD(lat[0], lat[1], lat[2], latRef),
                                ],
                            };
                            return this.props.onInitGeometry(geometry);
                        }
                    });
                });
        });
    };

    convertGPSDMStoDD = (deg, min, sec, direction) => {
        // conversion dmsToDD
        let dd = deg + min / 60 + sec / (60 * 60);

        // this change is needed you have 0 as degrees and a negative minutes or seconds i.e direction swapping side is caused by minutes or seconds being negative
        if ((dd > 0 && (direction === 'S' || direction === 'W')) || (dd < 0 && (direction === 'N' || direction === 'E'))) {
            dd = dd * -1;
        } // Don't do anything for N or E
        return dd;
    };

    renderProperty = (field, prop) => {
        const fieldValue = this.state.fields[field.name] === undefined ? prop : this.state.fields[field.name];
        switch (field.type) {
            case 'img':
                let preview = this.state.fields.picture ? (
                    <img
                        style={{ maxWidth: '100%', maxHeight: '70%', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
                        src={this.state.fields.picture}
                    />
                ) : (
                    <Glyphicon glyph="picture" style={{ fontSize: 20 + 'em', color: '#c8102e' }} />
                );
                return (
                    <div>
                        <label htmlFor="uploadFile" style={{ width: '100%', cursor: 'pointer' }}>
                            <div className="imgPreview" style={{ textAlign: 'center' }}>
                                {preview}
                            </div>
                        </label>
                        <input className="fileInput" type="file" id="uploadFile" onChange={(e) => this.addPicture(e)} style={{ display: 'none' }} />
                    </div>
                );
            case 'html':
                return <ReactQuill readOnly={this.props.drawing} value={fieldValue || ''} onChange={(val) => this.change(field.name, val)} />;
            case 'component':
                const Component = fieldValue;
                return <prop editing value={<Component picture={this.props.feature} />} onChange={(e) => this.change(field.name, e.target.value)} />;
            default:
                return (
                    <FormControl disabled={this.props.drawing} value={fieldValue || ''} onChange={(e) => this.change(field.name, e.target.value)} />
                );
        }
    };

    renderErrorOn = (field) => {
        return this.state.errors[field] ? (
            <div className="pictures-edit-error">
                <Message msgId={this.state.errors[field]} />
            </div>
        ) : null;
    };

    renderBody = () => {
        const items = this.getBodyItems();
        if (items.length === 0) {
            return null;
        }
        return <div className="mapstore-pictures-info-viewer-items">{items}</div>;
    };

    renderModals = () => {
        if (this.props.closing) {
            return (
                <Portal>
                    <ConfirmDialog
                        show
                        modal
                        onClose={this.props.onCancel}
                        onConfirm={this.props.onConfirmClose}
                        confirmButtonBSStyle="default"
                        closeGlyph="1-close"
                        confirmButtonContent={<Message msgId="pictures.confirm" />}
                        closeText={<Message msgId="pictures.cancel" />}>
                        <Message msgId="pictures.undo" />
                    </ConfirmDialog>
                </Portal>
            );
        }
    };

    renderError = () => {
        return Object.keys(this.state.errors).map((field) => this.renderErrorOn(field));
    };

    render() {
        const editing = this.props.editing && this.props.editing.properties.id === this.props.id;
        return (
            <div className="mapstore-pictures-info-viewer">
                {this.renderButtons(editing)}
                {this.renderError(editing)}
                {this.renderModals()}
                {this.renderBody(editing)}
            </div>
        );
    }
    cancelEdit = () => {
        this.setState({
            editedFields: {},
        });
        this.props.onCancel();
    };

    change = (field, value) => {
        this.setState({
            fields: assign({}, this.state.fields, {
                [field]: value,
            }),
        });
    };

    getWKTGeometry = (geometry) => {
        let coordinates = CoordinatesUtils.reproject(geometry.coordinates, 'EPSG:4326', 'EPSG:2154');
        return 'POINT(' + coordinates.x + ' ' + coordinates.y + ')';
    };

    save = () => {
        if (!this.state.fields.picture) {
            this.setState({
                errors: { picture: getMessageById(this.context.messages, 'pictures.errors.picture') },
            });
            return;
        }
        if (!this.props.editing.geometry) {
            this.setState({
                errors: { geometry: getMessageById(this.context.messages, 'pictures.errors.geometry') },
            });
            return;
        }

        return axios({
            method: 'post',
            url: ConfigUtils.getConfigProp('georchestraUrlRest') + '/cnr/importPicture',
            data: {
                userId: this.props.user,
                geometryWkt: this.props.editing.geometry && this.getWKTGeometry(this.props.editing.geometry),
                ...this.state.fields,
                projection: this.props.editing.geometry.projection,
            },
            headers: {
                'Content-Type': 'application/text',
            },
        })
            .then((response) => {
                if (response.data.result === 'OK') {
                    return this.props.onSave(this.props.id, this.props.editing.geometry, this.state.preview, this.state.fields.description);
                } else {
                    this.setState({
                        errors: { api: response.data.description || getMessageById(this.context.messages, 'pictures.errors.service') },
                    });
                }
            })
            .catch((response) => {
                this.setState({
                    errors: { api: response.data.description || getMessageById(this.context.messages, 'pictures.errors.service') },
                });
            });
    };
}
module.exports = PicturesEditor;
