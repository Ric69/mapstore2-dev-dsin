const assign = require('object-assign');
const {
    SET_WIDGET,
    SET_GROUP,
    SET_USER,
    INT_ACCESS_RULES,
    SET_LIST_USER,
    SET_LIST_GROUP,
    SET_CURRENT_USER_WIDGETS,
} = require('./actions');
const { getConfigProp } = require('@mapstore/utils/ConfigUtils');

module.exports = (
    state = {
        user: null,
        groupId: getConfigProp('groupEveryoneId'),
        rules: {},
        id: 0,
        listUsers: [],
        listGroups: [],
        currentUserWidgetList: [],
    },
    action
) => {
    switch (action.type) {
        case SET_USER: {
            return { ...state, user: action.user, groupId: null };
        }
        case SET_GROUP: {
            return { ...state, user: null, groupId: action.groupId };
        }
        case INT_ACCESS_RULES: {
            return { ...state, rules: action.accessRules, id: action.id };
        }
        case SET_LIST_USER: {
            return assign({}, state, { listUsers: action.listUsers });
        }
        case SET_LIST_GROUP: {
            return assign({}, state, { listGroups: action.listGroups });
        }
        case SET_CURRENT_USER_WIDGETS: {
            return assign({}, state, { currentUserWidgetList: action.widgetList });
        }
        case SET_WIDGET: {
            if (state.user) {
                let userWidgets = [
                    ...((state.rules && state.rules.users && state.rules.users[state.user.id]) ||
                        []),
                ];
                if (action.enable) {
                    userWidgets.push(action.widgetName);
                } else {
                    _.remove(userWidgets, (w) => w === action.widgetName);
                }
                return {
                    ...state,
                    rules: {
                        ...state.rules,
                        users: { ...state.rules.users, [state.user.id]: userWidgets },
                    },
                };
            } else {
                // Si ce n'est pas un user, c'est un groupe
                let groupWidgets = [
                    ...((state.rules && state.rules.groups && state.rules.groups[state.groupId]) ||
                        []),
                ];
                if (action.enable) {
                    groupWidgets.push(action.widgetName);
                } else {
                    _.remove(groupWidgets, (w) => w === action.widgetName);
                }
                return {
                    ...state,
                    rules: {
                        ...state.rules,
                        groups: { ...state.rules.groups, [state.groupId]: groupWidgets },
                    },
                };
            }
        }
        default:
            return state;
    }
};
