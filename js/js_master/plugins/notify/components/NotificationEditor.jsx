const React = require('react');
const PropTypes = require('prop-types');
const Select = require('react-select');
const { MultiSelect } = require('react-selectize');
const { isEmpty } = require('lodash');

const GeoStoreApi = require('../../../../MapStore2/web/client/api/GeoStoreDAO');
const Selector = require('./Selector');
const TButton = require('../../../../MapStore2/web/client/components/data/featuregrid/toolbars/TButton');
const Message = require('../../../../MapStore2/web/client/components/I18N/Message');
const OverlayTrigger = require('../../../../MapStore2/web/client/components/misc/OverlayTrigger');
const { FormControl, ButtonGroup, Grid, Row, Col, Button, Glyphicon, Tooltip } = require('react-bootstrap');
const Portal = require('../../../../MapStore2/web/client/components/misc/Portal');
const ConfirmDialog = require('../../../../MapStore2/web/client/components/misc/ConfirmDialog');
const { CATEGORIE_NOTIFY } = require('../actions');
const LocaleUtils = require('../../../../MapStore2/web/client/utils/LocaleUtils');
const { getConfigProp } = require('../../../../MapStore2/web/client/utils/ConfigUtils');
const RuleSelector = require('./RuleSelector');

class NotificationEditor extends React.Component {
    static displayName = 'NotificationEditor';

    static propTypes = {
        modif: PropTypes.number,
        users: PropTypes.array,
        layers: PropTypes.array,
        attributes: PropTypes.array,
        drawing: PropTypes.bool,
        closing: PropTypes.bool,
        support: PropTypes.bool,
        feature: PropTypes.object,
        selectedUsers: PropTypes.array,
        selectedLayer: PropTypes.array,
        selectedLayers: PropTypes.array,
        title: PropTypes.string,
        crs: PropTypes.string,
        filterRules: PropTypes.array,
        content: PropTypes.string,
        selectedAttributes: PropTypes.array,
        frequence: PropTypes.string,
        frequencies: PropTypes.array,
        toggleSupport: PropTypes.func,
        cancelEdit: PropTypes.func,
        disableSupport: PropTypes.func,
        enabledSupport: PropTypes.func,
        onCancelClose: PropTypes.func,
        onConfirmClose: PropTypes.func,
        updateSelectedUsers: PropTypes.func,
        selectLayer: PropTypes.func,
        onTitleChange: PropTypes.func,
        onContentChange: PropTypes.func,
        onSaveNotification: PropTypes.func,
        onDeleteNotification: PropTypes.func,
        updateSelectedRules: PropTypes.func,
        updateSelectedAttributes: PropTypes.func,
        updateSelectedLayers: PropTypes.func,
        selectFrequency: PropTypes.func,
    };

    static defaultProps = {
        modif: null,
        users: [],
        layers: [],
        attributes: [],
        drawing: false,
        closing: false,
        support: false,
        feature: {},
        selectedUsers: [],
        selectedLayers: [],
        selectedLayer: '',
        filterRules: [],
        title: '',
        content: '',
        crs: 'EPSG:2154',
        selectedAttributes: [],
        frequence: 'DAILY',
        frequencies: [
            { label: 'notify.frequencies.daily', value: 'DAILY' },
            { label: 'notify.frequencies.dailyWeekly', value: 'DAILY_WEEK_DAY' },
            { label: 'notify.frequencies.weekly', value: 'WEEKLY' },
            { label: 'notify.frequencies.monthly', value: 'MONTHLY' },
            { label: 'notify.frequencies.mondays', value: 'EVERY_MONDAY' },
            { label: 'notify.frequencies.tuesdays', value: 'EVERY_TUESDAY' },
            { label: 'notify.frequencies.wednesdays', value: 'EVERY_WEDNESDAY' },
            { label: 'notify.frequencies.thursdays', value: 'EVERY_THURSDAY' },
            { label: 'notify.frequencies.fridays', value: 'EVERY_FRIDAY' },
        ],
        toggleSupport: () => {},
        cancelEdit: () => {},
        disableSupport: () => {},
        enabledSupport: () => {},
        onCancelClose: () => {},
        onConfirmClose: () => {},
        updateSelectedUsers: () => {},
        selectLayer: () => {},
        onTitleChange: () => {},
        onContentChange: () => {},
        onSaveNotification: () => {},
        onDeleteNotification: () => {},
        updateSelectedRules: () => {},
        updateSelectedLayers: () => {},
        updateSelectedAttributes: () => {},
        selectFrequency: () => {},
    };

    static contextTypes = {
        messages: PropTypes.object,
    };

    state = {
        error: null,
    };

    onAddUser = (user) => {
        let users = this.props.selectedUsers.slice().concat(user);
        return this.props.updateSelectedUsers(users);
    };

    onRemoveUser = (user) => {
        let users = (this.props.selectedUsers || []).slice().filter((u) => u.id !== user.id);
        return this.props.updateSelectedUsers(users);
    };

    onAddLayer = (layer) => {
        let layers = this.props.selectedLayers.slice().concat(layer);
        return this.props.updateSelectedLayers(layers);
    };

    addSelectedAttributes = (selectedAttributes) => {
        this.props.updateSelectedAttributes(selectedAttributes.map((attr) => attr.value));
    };

    removeAttribute = (attr) => {
        this.props.updateSelectedAttributes(this.props.selectedAttributes.filter((attribute) => attribute !== attr));
    };

    /**
     * @return string
     */
    getRepository = () => {
        const layer = this.props.layers.filter((element) => element.name === this.props.selectedLayer);

        if (isEmpty(layer) || (!isEmpty(layer) && !layer[0].url)) {
            return getConfigProp('mainNdd') + '/geoserver';
        } else {
            const url = layer[0].url;
            const splitUrl = url.split('/');
            splitUrl.pop();

            return splitUrl.join('/');
        }
    };

    save = () => {
        this.props.disableSupport();
        this.setState({ error: null });
        const data = {
            title: this.props.title,
            content: this.props.content,
            users: this.props.selectedUsers,
            repository: this.getRepository(),
            layer: this.props.selectedLayer,
            geometry: this.props.feature.geometry,
            crs: this.props.crs,
            filters: this.props.filterRules.filter((f) => !!f.operator),
            attributes: this.props.selectedAttributes,
            geoAttributeName: this.props.attributes.filter((attr) => attr.isGeometry).pop().name,
            frequence: this.props.frequence,
        };
        const metadata = {
            name: this.props.title,
            description:
                'Ce mail envoie les élément de la couche ' +
                this.props.selectedLayer +
                '<br/>si les conditions suivantes sont remplies : <br/>' +
                data.filters.map((f) => ' - ' + f.attribute + ' ' + f.operator + ' ' + f.value + '<br/>') +
                'à fréquence de : ' +
                LocaleUtils.getMessageById(this.context.messages, this.props.frequencies.filter((f) => f.value === this.props.frequence).pop().label) +
                '<br/>aux personnes suivantes : ' +
                this.props.selectedUsers.map((u) => u.name).toString(),
        };
        if (!!this.props.modif) {
            GeoStoreApi.putResource(this.props.modif, data).then(
                () => {
                    GeoStoreApi.putResourceMetadata(this.props.modif, metadata.name, metadata.description);
                    this.props.onSaveNotification(this.props.modif, metadata.name, metadata.description);
                },
                () => this.setState({ error: LocaleUtils.getMessageById(this.context.messages, 'pictures.errors.update') })
            );
        } else {
            GeoStoreApi.createResource(metadata, data, CATEGORIE_NOTIFY).then(
                (response) => this.props.onSaveNotification(response.data, metadata.name, metadata.description),
                () => this.setState({ error: LocaleUtils.getMessageById(this.context.messages, 'pictures.errors.noSave') })
            );
        }
    };

    delete = () => {
        if (!!this.props.modif) {
            GeoStoreApi.deleteResource(this.props.modif).then(
                () => {
                    this.props.onDeleteNotification(this.props.modif);
                },
                () => this.setState({ error: LocaleUtils.getMessageById(this.context.messages, 'pictures.errors.noDelete') })
            );
        }
    };

    renderNoResultsFound = () => {
        return <div className="no-results-found">{LocaleUtils.getMessageById(this.context.messages, 'notify.attributes.noResult')}</div>;
    };

    renderErrors = () => {
        return this.state.error ? (
            <div className="notify-edit-error">
                <Message msgId={this.state.error} />
            </div>
        ) : null;
    };

    renderButtons = () => {
        return (
            <Grid className="mapstore-notify-info-viewer-buttons" fluid>
                <Row>
                    <Col md={'auto'}>
                        <ButtonGroup id="mapstore-notify-info-viewer-edit-buttons" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                bsStyle="primary"
                                disabled={
                                    this.props.drawing ||
                                    !(this.props.feature && this.props.feature.geometry) ||
                                    !(this.props.selectedUsers && this.props.selectedUsers.length > 0) ||
                                    !this.props.selectedLayer ||
                                    !(this.props.selectedAttributes && this.props.selectedAttributes.length > 0) ||
                                    !(this.props.attributes && this.props.attributes.length > 0)
                                }
                                onClick={this.save}>
                                <Glyphicon glyph="floppy-disk" />
                                &nbsp;
                                <Message msgId="notify.save" />
                            </Button>
                            <Button bsStyle="primary" disabled={!this.props.modif} hidden={!this.props.modif} onClick={this.delete}>
                                <Glyphicon glyph="trash" />
                                &nbsp;
                                <Message msgId="notify.remove" />
                            </Button>
                            <Button bsStyle="primary" onClick={this.props.cancelEdit}>
                                <Glyphicon glyph="remove" />
                                &nbsp;
                                <Message msgId="notify.cancel" />
                            </Button>
                        </ButtonGroup>
                    </Col>
                </Row>
            </Grid>
        );
    };

    renderModals = () => {
        if (this.props.closing) {
            return (
                <Portal>
                    <ConfirmDialog
                        show
                        modal
                        onClose={this.props.onCancelClose}
                        onConfirm={this.props.onConfirmClose}
                        confirmButtonBSStyle="default"
                        closeGlyph="1-close"
                        confirmButtonContent={<Message msgId="notify.closing.confirm" />}
                        closeText={<Message msgId="notify.closing.cancel" />}>
                        <Message msgId="notify.closing.undo" />
                    </ConfirmDialog>
                </Portal>
            );
        }

        return null;
    };

    render() {
        const editGeometryButton = (
            <OverlayTrigger
                placement="top"
                overlay={
                    <Tooltip id="buttonAddMarker">
                        <strong>
                            <Message msgId="notify.filters.addMarker" />
                        </strong>
                    </Tooltip>
                }>
                <TButton
                    id="edit-geometry"
                    onClick={() => this.props.enabledSupport()}
                    visible
                    className="square-button-md"
                    active={this.props.support}
                    glyph="pencil-add"
                />
            </OverlayTrigger>
        );
        const self = this;

        const listLayers = this.props.layers
            .filter((element) => element.url && element.url.includes(getConfigProp('mainNdd')))
            .map((element) => ({ label: element.title, value: element.name }));

        return (
            <div className="mapstore-notify-info-viewer">
                {this.renderButtons()}
                {this.renderErrors()}
                {this.renderModals()}
                <div className="mapstore-pictures-info-viewer-items">
                    <div>
                        <div key="title" className={'mapstore-notify-info-viewer-item mapstore-notify-info-viewer-title'}>
                            <label>
                                <Message msgId={'notify.field.title'} />
                            </label>
                            <FormControl
                                disabled={this.props.drawing}
                                value={this.props.title || ''}
                                onChange={(e) => this.props.onTitleChange(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <div key="content" className={'mapstore-notify-info-viewer-item mapstore-notify-info-viewer-content'}>
                            <label>
                                <Message msgId={'notify.field.content'} />
                            </label>
                            <FormControl
                                componentClass="textarea"
                                disabled={this.props.drawing}
                                value={this.props.content || ''}
                                onChange={(e) => this.props.onContentChange(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <div key="users" className={'mapstore-notify-info-viewer-item mapstore-notify-info-viewer-users'}>
                            <Selector
                                disabled={this.props.drawing}
                                availablesElements={this.props.users}
                                selectedElements={this.props.selectedUsers}
                                titleSelected="notify.users.titleSelected"
                                noSelected="notify.users.noSelected"
                                titleAvailable="notify.users.titleAvailable"
                                noResult="notify.users.noResult"
                                selectPlaceholder="notify.users.selectPlaceholder"
                                onRemoveElement={this.onRemoveUser}
                                onAddElement={this.onAddUser}
                            />
                        </div>
                    </div>
                    <div>
                        <div key="frequency" className={'mapstore-notify-info-viewer-item mapstore-notify-info-viewer-frequency'}>
                            <label>
                                <Message msgId={'notify.frequency'} />
                            </label>
                            <Select
                                disabled={this.props.drawing}
                                value={this.props.frequence || 'DAILY'}
                                onChange={(e) => this.props.selectFrequency(e.value)}
                                options={this.props.frequencies.map((f) => {
                                    return {
                                        label: LocaleUtils.getMessageById(this.context.messages, f.label),
                                        value: f.value
                                    };
                                })}
                            />
                        </div>
                    </div>
                    <div>
                        <div key="layer" className={'mapstore-notify-info-viewer-item mapstore-notify-info-viewer-layer'}>
                            <label>
                                <Message msgId={'notify.layer.titleSelected'} />
                            </label>
                            <Select
                                disabled={this.props.drawing}
                                value={this.props.selectedLayer || ''}
                                onChange={(e) => this.props.selectLayer(e.value)}
                                options={listLayers}
                                selectPlaceholder={LocaleUtils.getMessageById(this.context.messages, 'notify.layer.selectPlaceholder')}
                            />
                        </div>
                    </div>
                    <div>
                        <p key="rules" className={'mapstore-notify-info-viewer-item mapstore-notify-info-viewer-rules'}>
                            <RuleSelector
                                disabled={this.props.drawing || !this.props.selectedLayer}
                                availablesElements={this.props.attributes}
                                selectedElements={this.props.filterRules}
                                updateElements={this.props.updateSelectedRules}
                                geometryFilterButton={editGeometryButton}
                            />
                        </p>
                    </div>
                    <div>
                        <p key="attributes" className={'mapstore-notify-info-viewer-item mapstore-notify-info-viewer-attributes'}>
                            <label>
                                <Message msgId={'notify.attributes.title'} />
                            </label>
                            <MultiSelect
                                style={{ width: '100%' }}
                                disabled={this.props.drawing || !this.props.selectedLayer}
                                placeholder={LocaleUtils.getMessageById(this.context.messages, 'notify.attributes.selectPlaceholder')}
                                options={this.props.attributes.filter((att) => !att.isGeometry).map((att) => ({ label: att.name, value: att.name }))}
                                values={this.props.selectedAttributes.map((att) => ({ label: att, value: att }))}
                                onValuesChange={this.addSelectedAttributes}
                                renderValue={(item) => {
                                    return (
                                        <div className="simple-value">
                                            <span>{item.label}</span>
                                            <span onClick={() => self.removeAttribute(item.value)} style={{ color: 'grey' }}>
                                                x
                                            </span>
                                        </div>
                                    );
                                }}
                                renderNoResultsFound={this.renderNoResultsFound}
                            />
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = NotificationEditor;
