const {
    INIT_NOTIFICATIONS_LIST,
    CREATE_NEW,
    USER_LIST,
    SELECTED_USERS,
    SELECTED_ATTRIBUTES,
    SELECTED_FREQUENCY,
    SELECTED_LAYER,
    SELECTED_RULES,
    SELECTED_TITLE,
    SELECTED_CONTENT,
    ATTRIBUTES_LIST,
    CANCEL_EDITION,
    CLOSE,
    CANCEL_CLOSE,
    SAVE_NOTIFICATION,
    MODIF_NOTIFICATION,
    DELETE_NOTIFICATION,
    TOGGLE_SUPPORT,
    SET_GEOMETRY,
    DISABLE_SUPPORT,
} = require('./actions');
const assign = require('object-assign');
const uuid = require('uuid');

const initialState = {
    //
    editing: null,
    // Activation du "NotifySupport"
    selection: {
        enabled: false,
    },
};

module.exports = (state = initialState, action) => {
    switch (action.type) {
        case INIT_NOTIFICATIONS_LIST: {
            return assign({}, state, { editing: null, list: action.list });
        }
        case CREATE_NEW: {
            const id = uuid.v1();
            return assign({}, state, {
                editing: {
                    feature: {
                        type: 'Feature',
                        id,
                        geometry: null,
                        newFeature: true,
                        properties: {
                            id,
                        },
                    },
                    selectedUsers: [],
                    selectedLayer: '',
                    attributes: [],
                    drawing: false,
                    filterRules: [],
                },
            });
        }
        case USER_LIST: {
            return assign({}, state, { users: action.users });
        }
        case SELECTED_USERS: {
            return assign({}, state, {
                editing: assign({}, state.editing, { selectedUsers: action.users }),
            });
        }
        case SELECTED_LAYER: {
            return assign({}, state, {
                editing: assign({}, state.editing, { selectedLayer: action.layer }),
            });
        }
        case ATTRIBUTES_LIST: {
            return assign({}, state, {
                editing: assign({}, state.editing, { attributes: action.attributes }),
            });
        }
        case SELECTED_CONTENT: {
            return assign({}, state, {
                editing: assign({}, state.editing, { content: action.content }),
            });
        }
        case SELECTED_TITLE: {
            return assign({}, state, {
                editing: assign({}, state.editing, { title: action.title }),
            });
        }
        case SELECTED_RULES: {
            return assign({}, state, {
                editing: assign({}, state.editing, { filterRules: action.filterRules }),
            });
        }
        case SELECTED_ATTRIBUTES: {
            return assign({}, state, {
                editing: assign({}, state.editing, {
                    selectedAttributes: action.selectedAttributes,
                }),
            });
        }
        case SELECTED_FREQUENCY: {
            return assign({}, state, {
                editing: assign({}, state.editing, { frequence: action.frequence }),
            });
        }
        case SET_GEOMETRY: {
            return assign({}, state, {
                editing: assign({}, state.editing, {
                    feature: {
                        ...state.editing.feature,
                        geometry: action.geometry,
                    },
                }),
            });
        }
        case CLOSE: {
            return assign({}, state, {
                editing: assign({}, state.editing, {
                    closing: true,
                    selection: {
                        enabled: false,
                    },
                }),
            });
        }
        case CANCEL_CLOSE: {
            return assign({}, state, {
                editing: assign({}, state.editing, {
                    closing: false,
                    selection: {
                        enabled: false,
                    },
                }),
            });
        }
        case CANCEL_EDITION: {
            return assign({}, state, {
                editing: null,
                selection: {
                    enabled: false,
                },
            });
        }
        case SAVE_NOTIFICATION: {
            let newlist = (state.list || []).slice();
            let index = newlist.findIndex((el) => el.id === action.id);
            if (index === -1) {
                newlist = newlist.concat({
                    id: action.id,
                    name: action.name,
                    description: action.description,
                });
            } else {
                newlist[index] = assign({}, newlist[index], {
                    id: action.id,
                    name: action.name,
                    description: action.description,
                });
            }
            return assign({}, state, { editing: null, list: newlist });
        }
        case MODIF_NOTIFICATION: {
            return assign({}, state, {
                editing: {
                    modif: action.id,
                    title: action.title,
                    content: action.content,
                    feature: {
                        type: 'Feature',
                        id: action.id,
                        geometry: action.geometry,
                        properties: {
                            id: action.id,
                        },
                    },
                    selectedUsers: action.users,
                    selectedLayer: action.layer,
                    drawing: false,
                },
            });
        }
        case DELETE_NOTIFICATION: {
            let newlist = (state.list || []).slice().filter((el) => el.id !== action.id);
            return assign({}, state, { editing: null, list: newlist });
        }
        /**
         * Active/Désactive le "Support" sur la carte
         * Permet d'activer l'outil de sélection sur la carte
         * Et défini le mode de sélection
         */
        case TOGGLE_SUPPORT: {
            return {
                ...state,
                selection: {
                    ...state.selection,
                    enabled: !state.selection.enabled,
                },
            };
        }
        case DISABLE_SUPPORT: {
            return {
                ...state,
                selection: {
                    ...state.selection,
                    enabled: false,
                },
            };
        }
        default:
            return state;
    }
};
