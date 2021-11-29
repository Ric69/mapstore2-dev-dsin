/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const ConfirmDialog = require('../../../../MapStore2/web/client/components/misc/ConfirmDialog');
const Message = require('../../../../MapStore2/web/client/components/I18N/Message');
const { Glyphicon, Button, ButtonGroup } = require('react-bootstrap');
const { head } = require('lodash');
const defaultConfig = require('./PicturesConfig');
require('./style.css');

/**
 * pictures panel component.
 * It can be in different modes:
 *  - list: when showing the current list of pictures on the map
 *  - detail: when showing a detail of a specific picture
 *  - editing: when editing an picture
 * When in list mode, the list of current map pictures is shown, with:
 *  - summary card for each picture, with full detail show on click
 *  - new picture Button
 *  - filtering widget
 * When in detail mode the configured editor is shown on the selected picture, in viewer mode.
 * When in editing mode the configured editor is shown on the selected picture, in editing mode.
 *
 * @memberof components.mapControls.pictures
 * @class
 * @prop {boolean} closing user asked for closing panel when editing
 * @prop {object} editing picture object currently under editing (null if we are not in editing mode)
 * @prop {string} mode current mode of operation (list, editing, detail)
 * @prop {object} editor editor component, used in detail and editing modes
 * @prop {object[]} pictures list of pictures objects to list
 * @prop {string} current id of the picture currently shown in the editor (when not in list mode)
 * @prop {object} config configuration object, where overridable stuff is stored (fields config for pictures, marker library, etc.) {@link #components.mapControls.pictures.picturesConfig}
 * @prop {string} filter current filter entered by the user
 * @prop {function} onCancelClose triggered when the user cancels closing
 * @prop {function} onConfirmClose triggered when the user confirms closing
 * @prop {function} onAdd triggered when the user clicks on the new picture button
 * @prop {function} onHighlight triggered when the mouse hovers an picture card
 * @prop {function} onCleanHighlight triggered when the mouse is out of any picture card
 * @prop {function} onDetail triggered when the user clicks on an picture card
 * @prop {function} onFilter triggered when the user enters some text in the filtering widget
 * @prop {function} classNameSelector optional selector to assign custom a CSS class to pictures, based on
 * the picture's attributes.
 */
class Pictures extends React.Component {
    static propTypes = {
        closing: PropTypes.bool,
        editing: PropTypes.object,
        onCancelClose: PropTypes.func,
        onConfirmClose: PropTypes.func,
        onAdd: PropTypes.func,
        onHighlight: PropTypes.func,
        onCleanHighlight: PropTypes.func,
        onDetail: PropTypes.func,
        mode: PropTypes.string,
        editor: PropTypes.func,
        pictures: PropTypes.array,
        current: PropTypes.string,
        classNameSelector: PropTypes.func,
    };

    static contextTypes = {
        messages: PropTypes.object,
    };

    static defaultProps = {
        closing: false,
        editing: false,
        onCancelClose: () => {},
        onConfirmClose: () => {},
        onAdd: () => {},
        onHighlight: () => {},
        onCleanHighlight: () => {},
        onDetail: () => {},
        mode: 'list',
        editor: () => {},
        pictures: [],
        current: '',
        classNameSelector: () => {},
    };

    getConfig = () => {
        return defaultConfig;
    };

    renderFieldValue = (field, picture) => {
        const fieldValue = picture[field.name] || '';
        switch (field.type) {
            case 'img':
                return (
                    <img style={{ maxWidth: '100%', maxHeight: '70%', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} src={fieldValue} />
                );
            case 'html':
                return <span dangerouslySetInnerHTML={{ __html: fieldValue }} />;
            default:
                return fieldValue;
        }
    };

    renderField = (field, picture) => {
        return <div className={'mapstore-pictures-panel-card-' + field.name}>{this.renderFieldValue(field, picture)}</div>;
    };

    renderCard = (picture) => {
        return (
            <div
                className={'mapstore-pictures-panel-card ' + this.props.classNameSelector(picture)}
                onMouseOver={() => this.props.onHighlight(picture.id)}
                onMouseOut={this.props.onCleanHighlight}
                onClick={() => this.props.onDetail(picture.id)}>
                {this.getConfig().fields.map((f) => this.renderField(f, picture))}
            </div>
        );
    };

    renderCards = () => {
        const picture = this.props.pictures && head(this.props.pictures.filter((a) => a.id === this.props.current));
        if (this.props.mode === 'list') {
            return [
                <ButtonGroup id="mapstore-pictures-panel-buttons">
                    <Button bsStyle="primary" onClick={() => this.props.onAdd('Point')}>
                        <Glyphicon glyph="plus" />
                        &nbsp;
                        <Message msgId="pictures.add" />
                    </Button>
                </ButtonGroup>,
                <div className="mapstore-pictures-panel-cards">{this.props.pictures.map((a) => this.renderCard(a))}</div>,
            ];
        }
        const Editor = this.props.editor;
        if (this.props.mode === 'detail') {
            return <Editor feature={picture} showBack id={this.props.current} {...picture.properties} />;
        }
        // mode = editing
        return this.props.editing && <Editor feature={picture} id={this.props.editing.properties.id} {...this.props.editing.properties} />;
    };

    render() {
        if (this.props.closing) {
            return (
                <ConfirmDialog
                    show
                    modal
                    onClose={this.props.onCancelClose}
                    onConfirm={this.props.onConfirmClose}
                    confirmButtonBSStyle="default"
                    closeGlyph="1-close"
                    confirmButtonContent={<Message msgId="pictures.confirm" />}
                    closeText={<Message msgId="pictures.cancel" />}>
                    <Message msgId="pictures.undo" />
                </ConfirmDialog>
            );
        }
        return <div className="mapstore-pictures-panel">{this.renderCards()}</div>;
    }
}

module.exports = Pictures;
