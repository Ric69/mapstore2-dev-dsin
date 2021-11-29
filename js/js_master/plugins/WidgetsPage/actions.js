const GeoStoreDAO = require('../../../MapStore2/web/client/api/GeoStoreDAO');
const axios = require('axios');
const { filterEnabledWidget } = require('../../utils/WidgetUtils');
const ConfigUtils = require('@mapstore/utils/ConfigUtils');
const { error, success } = require('../../../MapStore2/web/client/actions/notifications');

const CATEGORY_WIDGETS = 'WIDGETS';

const SET_WIDGET = 'WIDGETS_PAGE:SET_WIDGET';
const SET_GROUP = 'WIDGETS_PAGE:SET_GROUP';
const SET_USER = 'WIDGETS_PAGE:SET_USER';
const INT_ACCESS_RULES = 'WIDGETS_PAGE:INIT_ACCESS_RULES';
const SET_LIST_USER = 'WIDGETS_PAGE:SET_LIST_USER';
const SET_LIST_GROUP = 'WIDGETS_PAGE:SET_LIST_GROUP';
const SET_CURRENT_USER_WIDGETS = 'WIDGETS_PAGE:SET_CURRENT_USER_WIDGETS';

const emptyRules = {
    groups: {
        1: filterEnabledWidget()
            .filter((w) => !w.key)
            .map((w) => w.key),
    },
    users: {},
};

const setWidgetsCurrentUser = (widgetList) => {
    return {
        type: SET_CURRENT_USER_WIDGETS,
        widgetList,
    };
};

const setWidget = (widgetName, enable) => {
    return {
        type: SET_WIDGET,
        widgetName,
        enable,
    };
};

const setCurrentGroup = (groupId) => {
    return {
        type: SET_GROUP,
        groupId,
    };
};

const setCurrentUser = (user) => {
    return {
        type: SET_USER,
        user,
    };
};

const initRules = (id, accessRules) => {
    return {
        type: INT_ACCESS_RULES,
        id,
        accessRules,
    };
};

const initAccessRules = () => {
    return (dispatch) => {
        const url = 'resources/search/widgets';

        axios.get(url, GeoStoreDAO.addBaseUrl()).then(
            (response) => {
                const id =
                    (response.data &&
                        response.data.ResourceList &&
                        response.data.ResourceList.Resource &&
                        response.data.ResourceList.Resource.id) ||
                    0;

                if (id > 0) {
                    GeoStoreDAO.getData(id).then(
                        (response) => {
                            dispatch(initRules(id, response));
                        },
                        (err) => {
                            dispatch(
                                error({
                                    title: 'customWidgets.loadfail.title',
                                    message: 'customWidgets.loadfail.message',
                                })
                            );
                        }
                    );
                } else {
                    dispatch(initRules(id, emptyRules));
                }
            },
            (err) => {
                dispatch(
                    error({
                        title: 'customWidgets.loadfail.title',
                        message: 'customWidgets.loadfail.message',
                    })
                );
            }
        );
    };
};

const listUsers = (listUsers) => {
    return {
        type: SET_LIST_USER,
        listUsers,
    };
};

const listGroups = (listGroups) => {
    return {
        type: SET_LIST_GROUP,
        listGroups,
    };
};

const saveRules = () => {
    return (dispatch, getState) => {
        const id = getState().widgetsPage.id;
        const rules = getState().widgetsPage.rules;
        if (id === 0) {
            GeoStoreDAO.createResource(
                {
                    name: 'widgets',
                },
                rules,
                CATEGORY_WIDGETS
            )
                .then((response) => {
                    // Edition des permissions
                    GeoStoreDAO.updateResourcePermissions(response.data, {
                        SecurityRuleList: {
                            SecurityRule: {
                                canRead: true,
                                canWrite: false,
                                canDelete: false,
                                group: {
                                    id: ConfigUtils.getConfigProp('groupEveryoneId'),
                                },
                            },
                        },
                    });
                })
                .then(() =>
                    dispatch(
                        success({
                            title: 'customWidgets.editing.title',
                            message: 'customWidgets.editing.message',
                        })
                    )
                )
                .catch(() =>
                    dispatch(
                        error({
                            title: 'customWidgets.noSave.title',
                            message: 'customWidgets.noSave.message',
                        })
                    )
                );
        } else {
            // Mise à jour de la donnée
            GeoStoreDAO.putResource(id, rules)
                .then((response) =>
                    dispatch(
                        success({
                            title: 'customWidgets.editing.title',
                            message: 'customWidgets.editing.message',
                        })
                    )
                )
                .catch(() =>
                    dispatch(
                        error({
                            title: 'customWidgets.noSave.title',
                            message: 'customWidgets.noSave.message',
                        })
                    )
                );
        }
    };
};

const setListUsers = (name) => {
    return (dispatch) => {
        GeoStoreDAO.getUsers((name || '') + '*').then((response) => {
            const users = [];
            if (response.ExtUserList && response.ExtUserList.User) {
                response.ExtUserList.User.filter((user) => user.enabled).map((user) => {
                    users.push({
                        id: user.id,
                        name: user.name,
                        role: user.role,
                        groups:
                            user.groups && user.groups.group
                                ? Array.isArray(user.groups.group)
                                    ? user.groups.group
                                    : [user.groups.group]
                                : [],
                    });
                });
            }
            dispatch(listUsers(users));
        });
    };
};

const setListGroups = () => {
    return (dispatch) => {
        GeoStoreDAO.getGroups('*').then((response) => {
            const groups = [
                {
                    id: ConfigUtils.getConfigProp('groupEveryoneId'),
                    name: 'Tous les Utilisateurs',
                },
            ];
            if (response.ExtGroupList && response.ExtGroupList.Group) {
                response.ExtGroupList.Group.filter((group) => group.enabled).map((group) => {
                    groups.push({
                        id: group.id,
                        name: group.groupName,
                    });
                });
            }
            dispatch(listGroups(groups));
        });
    };
};

module.exports = {
    SET_WIDGET,
    SET_GROUP,
    SET_USER,
    INT_ACCESS_RULES,
    SET_LIST_USER,
    SET_LIST_GROUP,
    SET_CURRENT_USER_WIDGETS,
    setWidget,
    setCurrentGroup,
    setCurrentUser,
    initAccessRules,
    setListUsers,
    setListGroups,
    setWidgetsCurrentUser,
    saveRules,
};
