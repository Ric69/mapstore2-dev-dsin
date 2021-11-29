const React = require('react');
const { connect } = require('react-redux');
const assign = require('object-assign');
const { createSelector } = require('reselect');
const WidgetUtils = require('../../utils/WidgetUtils');

const {
    setWidget,
    setCurrentGroup,
    setCurrentUser,
    initAccessRules,
    setListUsers,
    setListGroups,
    saveRules,
} = require('./actions');

const { error, success } = require('../../../MapStore2/web/client/actions/notifications');
const WidgetPageComponent = require('./components/WidgetsPage');

const selector = createSelector(
    [(state) => state.security, (state) => state.widgetsPage],
    (security, widgetsPage) => {
        const canEdit =
            security && security.user && security.user.role && security.user.role === 'ADMIN';
        return {
            visible: canEdit || false,
            widgetsSelector: getWidgetSelector(widgetsPage),
            loading: !(widgetsPage.rules && widgetsPage.rules.groups),
            selectedUser: widgetsPage.user,
            selectedGroup: widgetsPage.groupId,
            listUsers: widgetsPage.listUsers.sort((a, b) => a.name.localeCompare(b.name)),
            listGroups: widgetsPage.listGroups.sort((a, b) => a.name.localeCompare(b.name)),
        };
    }
);

const getWidgetSelector = (widgetPageState) => {
    if (!(widgetPageState.rules && widgetPageState.rules.groups)) return null;
    return WidgetUtils.filterEnabledWidget().map((widget) => {
        let selected = false;
        let enabled = true;
        let tooltip = null;

        if (widgetPageState.groupId !== 1) {
            if (widgetPageState.rules.groups[1].indexOf(widget.key) !== -1) {
                selected = true;
                enabled = false;
                tooltip = 'ce widget est actif pour tous le monde';
            }
        }
        if (widgetPageState.user) {
            widgetPageState.user.groups
                .filter((g) => g.id !== 1)
                .forEach((group) => {
                    if (
                        widgetPageState.rules.groups[group.id] &&
                        widgetPageState.rules.groups[group.id].indexOf(widget.key) !== -1
                    ) {
                        selected = true;
                        enabled = false;
                        tooltip = 'ce widget est actif pour ' + group.groupName;
                    }
                });
            if (!selected) {
                if (
                    widgetPageState.rules.users[widgetPageState.user.id] &&
                    widgetPageState.rules.users[widgetPageState.user.id].indexOf(widget.key) !== -1
                ) {
                    selected = true;
                }
            }
        } else {
            if (
                widgetPageState.rules.groups[widgetPageState.groupId] &&
                widgetPageState.rules.groups[widgetPageState.groupId].indexOf(widget.key) !== -1
            ) {
                selected = true;
            }
        }

        return {
            ...widget,
            selected,
            enabled,
            tooltip,
        };
    });
};

/**
 * Liste des actions à inclure
 * @type Object
 */
const mapDispatchToProps = {
    error,
    success,
    setCurrentGroup,
    setCurrentUser,
    setWidget,
    initAccessRules,
    setListUsers,
    setListGroups,
    saveRules,
};

const WidgetsPagePlugin = connect(
    selector,
    mapDispatchToProps
)(WidgetPageComponent);

module.exports = {
    WidgetsPagePlugin: assign(WidgetsPagePlugin, {
        ContentTabs: {
            name: 'widgetspage',
            position: 1,
            tool: true,
            priority: 1,
        },
    }),
    reducers: { widgetsPage: require('./reducer') },
    epics: require('./epics'),
};
