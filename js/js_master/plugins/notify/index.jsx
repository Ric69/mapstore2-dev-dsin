const React = require('react');
const assign = require('object-assign');
const PropTypes = require('prop-types');
const { connect } = require('../../../MapStore2/web/client/utils/PluginsUtils');

const { Panel } = require('react-bootstrap');
const ContainerDimensions = require('react-container-dimensions').default;
const Dock = require('react-dock').default;

const { Glyphicon } = require('react-bootstrap');
const Message = require('../../../MapStore2/web/client/components/I18N/Message');

//ACTIONS
const { toggleControl, on } = require('../../../MapStore2/web/client/actions/controls');
const {
    updateSelectedUsers,
    updateListAttributes,
    selectLayer,
    initNotifications,
    createNewNotification,
    onTitleChange,
    onContentChange,
    onAddGeometry,
    cancelEdit,
    closeNotify,
    onCancelClose,
    onConfirmClose,
    onSaveNotification,
    onDeleteNotification,
    onModification,
    updateSelectedRules,
    updateSelectedAttributes,
    selectFrequency,
    enabledSupport,
    disableSupport,
} = require('./actions');

const NotificationEditor = connect(
    (state) => ({
        users: (state.notify && state.notify.users && state.notify.users.map((u) => ({ id: u.id, name: u.name, email: u.email }))) || [],
        support: state.notify.selection.enabled || false,
        layers:
            (state.layers &&
                state.layers.flat &&
                state.layers.flat
                    .filter((l) => l.group !== 'background')
                    .map((l) => ({ id: l.id, name: l.name, title: l.title, url: l.url, type: l.type }))) ||
            [],
    }),
    {
        onAddGeometry,
        cancelEdit,
        updateSelectedUsers,
        updateListAttributes,
        selectLayer,
        onTitleChange,
        onContentChange,
        onConfirmClose,
        onCancelClose,
        onSaveNotification,
        onDeleteNotification,
        updateSelectedRules,
        updateSelectedAttributes,
        selectFrequency,
        enabledSupport,
        disableSupport,
    }
)(require('./components/NotificationEditor'));

const Notifications = connect(
    (state) => ({
        listNotification: (state.notify && state.notify.list) || [],
        editor: NotificationEditor,
        mode: !!state.notify && !!state.notify.editing ? 'editing' : 'list',
        editing: state.notify && state.notify.editing,
    }),
    {
        onConfirmClose: toggleControl.bind(null, 'notify', null),
        onCancel: () => {},
        onSave: () => {},
        onAdd: createNewNotification,
        onModification,
    }
)(require('./components/Notifications'));

class NotifyPanel extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        active: PropTypes.bool,
        panelStyle: PropTypes.object,
        panelClassName: PropTypes.string,
        toggleControl: PropTypes.func,
        closeGlyph: PropTypes.string,
        buttonStyle: PropTypes.object,
        style: PropTypes.object,
        dockProps: PropTypes.object,
        initList: PropTypes.func,
        // side panel properties
        width: PropTypes.number,
    };

    static defaultProps = {
        id: 'mapstore-notify-panel',
        active: false,
        panelStyle: {
            zIndex: 100,
        },
        panelClassName: 'notify-panel',
        toggleControl: () => {},
        closeGlyph: '1-close',

        // side panel properties
        width: 660,
        dockProps: {
            dimMode: 'none',
            size: 0.3,
            fluid: true,
            position: 'right',
            zIndex: 1030,
        },
        dockStyle: {},
    };

    componentWillReceiveProps(nextProps) {
        if (!this.props.active && nextProps.active) {
            return this.props.initList();
        }
    }

    render() {
        const panel = <Notifications {...this.props} />;
        const panelHeader = (
            <span>
                <Glyphicon glyph="envelope" />{' '}
                <span className="notify-panel-title">
                    <Message msgId="notify.title" />
                </span>
                <button onClick={this.props.toggleControl} className="notify-close close">
                    {this.props.closeGlyph ? <Glyphicon glyph={this.props.closeGlyph} /> : <span>×</span>}
                </button>
            </span>
        );
        return this.props.active ? (
            <ContainerDimensions>
                {({ width }) => (
                    <Dock
                        dockStyle={this.props.dockStyle}
                        {...this.props.dockProps}
                        isVisible={this.props.active}
                        size={this.props.width / width > 1 ? 1 : this.props.width / width}>
                        <Panel id={this.props.id} header={panelHeader} style={this.props.panelStyle} className={this.props.panelClassName}>
                            {panel}
                        </Panel>
                    </Dock>
                )}
            </ContainerDimensions>
        ) : null;
    }
}

const conditionalToggle = on.bind(
    null,
    toggleControl('notify', null),
    (state) => !(state.controls && state.controls.notify && state.controls.notify.enabled && state.notify && state.notify.editing),
    closeNotify
);

const { mapLayoutValuesSelector } = require('../../../MapStore2/web/client/selectors/maplayout');

const NotifyPlugin = connect(
    (state) => ({
        active: !!state.controls && state.controls.notify && state.controls.notify.enabled,
        dockStyle: (state) => mapLayoutValuesSelector(state, { height: true }),
    }),
    {
        toggleControl: conditionalToggle,
        initList: initNotifications,
    }
)(NotifyPanel);

module.exports = {
    NotifyPlugin: assign(NotifyPlugin, {
        disablePluginIf: "{state('mapType') === 'cesium'}",
        BurgerMenu: {
            name: 'notify',
            position: 2,
            text: <Message msgId="notify.title" />,
            tooltip: 'notify.tooltip',
            icon: <Glyphicon glyph="envelope" />,
            action: toggleControl.bind(null, 'notify', null),
            selector: (state) =>
                !!(state.security && state.security.user && state.security.user.role && state.security.user.role === 'ADMIN')
                    ? {}
                    : { style: { display: 'none' } },
            priority: 2,
            doNotHide: true,
        },
        OmniBar: {
            name: 'notify',
            position: 1,
            tooltip: 'notify.tooltip',
            tool: connect(
                (state) => ({
                    active: state.controls && state.controls.notify && state.controls.notify.enabled,
                    icon: <Glyphicon glyph="envelope" />,
                    tooltip: 'notify.tooltip',
                    bsStyle: state.controls && state.controls.notify && state.controls.notify.enabled ? 'success' : 'primary',
                    visible: !!(state.security && state.security.user && state.security.user.role && state.security.user.role === 'ADMIN'),
                }),
                {
                    action: toggleControl.bind(null, 'notify', null),
                }
            )(require('../BarButton')),
            priority: 1,
            doNotHide: true,
        },
    }),
    reducers: {
        notify: require('./reducer'),
    },
};
