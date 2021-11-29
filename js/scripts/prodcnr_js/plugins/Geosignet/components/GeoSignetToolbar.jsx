const React = require('react');
const PropTypes = require('prop-types');
const assign = require('object-assign');
const { ButtonGroup, Button, Glyphicon, Tooltip } = require('react-bootstrap');
const ConfirmModal = require('../../../../MapStore2/web/client/components/maps/modals/ConfirmModal');
const ReactCSSTransitionGroup = require('react-addons-css-transition-group');
const LocaleUtils = require('../../../../MapStore2/web/client/utils/LocaleUtils');
const Message = require('../../../../MapStore2/web/client/components/I18N/Message');
const OverlayTrigger = require('../../../../MapStore2/web/client/components/misc/OverlayTrigger');
const GroupButton = require('./Group/Button').default;

require('./style.css');

class GeoSignetToolbar extends React.Component {
    static propTypes = {
        addGeoSignet: PropTypes.func,
        addGroup: PropTypes.func,
        deleteGeoSignet: PropTypes.func,
        isOwnerOrAdmin: PropTypes.bool,
        selectedSignet: PropTypes.object,
        selectedGroup: PropTypes.number,
        editEnabled: PropTypes.bool,
    };

    static contextTypes = {
        messages: PropTypes.object,
    };

    static defaultProps = {
        addGeoSignet: () => {},
        addGroup: () => {},
        deleteGeoSignet: () => {},
        isOwnerOrAdmin: false,
        selectedSignet: null,
        selectedGroup: undefined,
        editEnabled: true,
    };

    state = {
        title: '',
        group: undefined,
        showDeleteDialog: false,
        showAddDialog: false,
        showAddGroupDialog: false,
        showDeleteGroupDialog: false,
    };

    componentDidUpdate(prevProps) {
        if (this.props.selectedGroup !== prevProps.selectedGroup) {
            this.displayDeleteGroupDialog();
        }
    }

    render() {
        let tooltip = (
            <Tooltip id="geosignet-add-tooltip">
                {!!this.props.editEnabled ? <Message msgId="geosignet.add" /> : <Message msgId="geosignet.cannotAdd" />}
            </Tooltip>
        );
        return (
            <ButtonGroup>
                <ReactCSSTransitionGroup transitionName="toc-toolbar-btn-transition" transitionEnterTimeout={300} transitionLeaveTimeout={300}>
                    {this.props.isOwnerOrAdmin && (
                        <>
                            <OverlayTrigger placement="right" key={'overlay-trigger.geosignet-add-tooltip'} overlay={tooltip}>
                                <Button
                                    key="addLayer"
                                    bsStyle="primary"
                                    bsSize="small"
                                    onClick={this.displayAddDialog}
                                    disabled={!this.props.editEnabled}>
                                    <Glyphicon glyph="plus" />
                                </Button>
                            </OverlayTrigger>
                            <OverlayTrigger placement="right" key={'overlay-trigger.geosigner-add-group-tooltip'} overlay={tooltip}>
                                <GroupButton onClick={this.displayAddGroupDialog} disabled={!this.props.editEnabled} />
                            </OverlayTrigger>
                        </>
                    )}
                    {this.props.isOwnerOrAdmin &&
                    (!!this.props.selectedSignet && (!!this.props.selectedSignet.name || !!this.props.selectedSignet.id)) ? (
                        <Button
                            active={this.state.showDeleteDialog}
                            bsStyle={'success'}
                            className="square-button-md"
                            onClick={this.displayDeleteDialog}>
                            <Glyphicon glyph="trash" />
                        </Button>
                    ) : null}
                </ReactCSSTransitionGroup>
                <ConfirmModal
                    ref="addGroup"
                    show={this.state.showAddGroupDialog}
                    onHide={this.closeAddGroupDialog}
                    onClose={this.closeAddGroupDialog}
                    onConfirm={this.addGroupDialog}
                    titleText={LocaleUtils.getMessageById(this.context.messages, 'geosignet.group.addTitle')}
                    confirmText={LocaleUtils.getMessageById(this.context.messages, 'geosignet.group.addConfirm')}
                    cancelText={LocaleUtils.getMessageById(this.context.messages, 'geosignet.group.cancel')}
                    body={
                        <input
                            className="form-control geosignet-input"
                            type="text"
                            name="title"
                            placeholder={LocaleUtils.getMessageById(this.context.messages, 'geosignet.group.addBody')}
                            onChange={(e) => this.updateTitle(e.target.value)}
                        />
                    }
                />
                <ConfirmModal
                    ref="removeSignet"
                    show={this.state.showDeleteDialog}
                    onHide={this.closeDeleteDialog}
                    onClose={this.closeDeleteDialog}
                    onConfirm={this.removeSignet}
                    titleText={LocaleUtils.getMessageById(this.context.messages, 'geosignet.delete')}
                    confirmText={LocaleUtils.getMessageById(this.context.messages, 'geosignet.delete')}
                    cancelText={LocaleUtils.getMessageById(this.context.messages, 'geosignet.cancel')}
                    body={LocaleUtils.getMessageById(this.context.messages, 'geosignet.deleteAskConfirm')}
                />
                <ConfirmModal
                    ref="removeGroup"
                    show={this.state.showDeleteGroupDialog}
                    onHide={this.closeDeleteGroupDialog}
                    onClose={this.closeDeleteGroupDialog}
                    onConfirm={this.removeGroup}
                    titleText={LocaleUtils.getMessageById(this.context.messages, 'geosignet.group.delete')}
                    confirmText={LocaleUtils.getMessageById(this.context.messages, 'geosignet.group.delete')}
                    cancelText={LocaleUtils.getMessageById(this.context.messages, 'geosignet.group.cancel')}
                    body={LocaleUtils.getMessageById(this.context.messages, 'geosignet.group.deleteAskConfirm')}
                />
                <ConfirmModal
                    ref="addSignet"
                    show={this.state.showAddDialog}
                    onHide={this.closeAddDialog}
                    onClose={this.closeAddDialog}
                    onConfirm={this.addSignet}
                    titleText={LocaleUtils.getMessageById(this.context.messages, 'geosignet.add')}
                    confirmText={LocaleUtils.getMessageById(this.context.messages, 'geosignet.confirmAdd')}
                    cancelText={LocaleUtils.getMessageById(this.context.messages, 'geosignet.cancel')}
                    body={
                        <div>
                            <input
                                className="form-control geosignet-input"
                                type="text"
                                name="title"
                                placeholder={LocaleUtils.getMessageById(this.context.messages, 'geosignet.addTitle')}
                                onChange={(e) => this.updateTitle(e.target.value)}
                            />
                            <label htmlFor="select-group" className="select-group">
                                <Message msgId="geosignet.group.choose" /> :
                            </label>
                            <select
                                className="form-control geosignet-input"
                                name="select-group"
                                value={this.state.group}
                                onChange={(e) => this.updateGroup(e.target.value)}>
                                <option value="" selected={this.state.group === undefined} disabled>
                                    {LocaleUtils.getMessageById(this.context.messages, 'geosignet.group.choose')}
                                </option>
                                {(this.props.group || [])
                                    .filter((g) => !!g.id)
                                    .map((g) => (
                                        <option selected={this.state.group === g.id} value={g.id}>
                                            {g.name}
                                        </option>
                                    ))}
                                <option value="undefined">{LocaleUtils.getMessageById(this.context.messages, 'geosignet.group.default')}</option>
                            </select>
                        </div>
                    }
                />
            </ButtonGroup>
        );
    }

    addSignet = () => {
        this.props.addGeoSignet(this.state.title, parseInt(this.state.group));
        this.closeAddDialog();
    };

    removeSignet = () => {
        this.props.deleteGeoSignet(this.props.selectedSignet);
        this.closeDeleteDialog();
    };

    removeGroup = () => {
        this.props.deleteGroup(this.props.selectedGroup);
        this.closeDeleteGroupDialog();
    };

    addGroupDialog = () => {
        this.props.addGroup(this.state.title);
        this.closeAddGroupDialog();
    };

    closeDeleteGroupDialog = () => {
        this.setState(
            assign({}, this.state, {
                showDeleteGroupDialog: false,
                group: undefined,
                text: '',
            })
        );
    };

    closeDeleteDialog = () => {
        this.setState(
            assign({}, this.state, {
                showDeleteDialog: false,
                group: undefined,
                text: '',
            })
        );
    };

    closeAddGroupDialog = () => {
        this.setState({ showAddGroupDialog: false, group: undefined, text: '' });
    };

    displayDeleteDialog = () => {
        this.setState(
            assign({}, this.state, {
                showDeleteDialog: true,
            })
        );
    };

    displayDeleteGroupDialog = () => {
        this.setState(
            assign({}, this.state, {
                showDeleteGroupDialog: true,
            })
        );
    };

    displayAddGroupDialog = () => {
        this.setState({ showAddGroupDialog: true });
    };

    closeAddDialog = () => {
        this.setState(
            assign({}, this.state, {
                showAddDialog: false,
                group: undefined,
                text: '',
            })
        );
    };

    displayAddDialog = () => {
        this.setState(
            assign({}, this.state, {
                showAddDialog: true,
            })
        );
    };

    updateTitle = (text) => {
        this.setState(
            assign({}, this.state, {
                title: text,
            })
        );
    };
    updateGroup = (id) => {
        this.setState({ group: id });
    };
}

module.exports = GeoSignetToolbar;
