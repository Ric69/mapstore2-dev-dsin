const React = require('react');
const PropTypes = require('prop-types');

const ConfirmDialog = require('../../../../MapStore2/web/client/components/misc/ConfirmDialog');
const { Row, Col, ButtonGroup, Tooltip } = require('react-bootstrap');
const Message = require('../../../../MapStore2/web/client/components/I18N/Message');
const TButton = require('../../../../MapStore2/web/client/components/data/featuregrid/toolbars/TButton');
const OverlayTrigger = require('../../../../MapStore2/web/client/components/misc/OverlayTrigger');

class Notifications extends React.Component {
    static propTypes = {
        listNotification: PropTypes.arrayOf(PropTypes.object),
        editing: PropTypes.object,
        mode: PropTypes.string,
        editor: PropTypes.func,
        onAdd: PropTypes.func,
        onCancelClose: PropTypes.func,
        onConfirmClose: PropTypes.func,
        onModification: PropTypes.func,
    };

    static defaultProps = {
        listNotification: [],
        editing: {},
        mode: 'list',
        onAdd: () => {},
        onCancelClose: () => {},
        onConfirmClose: () => {},
        onModification: () => {},
    };

    renderCard = (notification) => {
        return (
            <div className={'mapstore-notify-panel-card ' + notification.id} onClick={() => this.props.onModification(notification.id)}>
                <div className={'mapstore-notify-panel-card-title'}>{notification.name}</div>
                <div className={'mapstore-notify-panel-card-description'}>
                    <span>
                        <p dangerouslySetInnerHTML={{ __html: notification.description }} />
                    </span>
                </div>
            </div>
        );
    };

    /**
     * https://gitlab.com/cnrmaps/cnrmaps/-/compare/d182dd0e...bee928bc#3a47f6735ed302ea2b484ebad4b2f9789c8259e1
     * @returns {*[]|*}
     */
    renderCards = () => {
        if (this.props.mode === 'list') {
            return [
                <div className="mapstore-notify-info-viewer-buttons">
                    <Row style={{ padding: '0px 15px', margin: 0 }}>
                        <Col md={10} style={{ paddingLeft: 0 }}>
                            <h2>
                                <Message msgId="notify.listTitle" />
                            </h2>
                        </Col>
                        <Col md={2} style={{ paddingRight: 0 }} className="text-right">
                            <ButtonGroup id="mapstore-notify-panel-buttons">
                                <OverlayTrigger
                                    placement="left"
                                    overlay={
                                        <Tooltip id="buttonAddNotif">
                                            <strong>
                                                <Message msgId="notify.add" />
                                            </strong>
                                        </Tooltip>
                                    }>
                                    <TButton bsStyle="primary" id="add-mail" onClick={this.props.onAdd} visible glyph="plus" />
                                </OverlayTrigger>
                            </ButtonGroup>
                        </Col>
                    </Row>
                </div>,
                <div className="mapstore-notify-panel-cards">{this.props.listNotification.map((a) => this.renderCard(a))}</div>,
            ];
        }
        const Editor = this.props.editor;

        return this.props.editing && <Editor {...this.props.editing} />;
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
                    confirmButtonContent={<Message msgId="notify.confirm" />}
                    closeText={<Message msgId="notify.cancel" />}>
                    <Message msgId="notify.undo" />
                </ConfirmDialog>
            );
        }
        return <div className="mapstore-notify-panel">{this.renderCards()}</div>;
    }
}

module.exports = Notifications;
