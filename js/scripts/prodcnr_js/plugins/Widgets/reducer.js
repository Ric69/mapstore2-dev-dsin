const assign = require('object-assign');
const { union } = require('lodash');

const config = require('../../localConfig.json').plugins;
const {
    ADD_WIDGET,
    REMOVE_WIDGET,
    UPDATE_WIDGETS,
    SET_MAP_WIDGETS,
    RESET_MAP_WIDGETS,
} = require('./actions');
const WidgetUtils = require('../../utils/WidgetUtils');

WidgetUtils.setWidgets([...config.desktop, ...config.maps, ...config.mobile]);

const initialState = {
    enabled: WidgetUtils.checkDependencies(WidgetUtils.getMinimalWidgetList()),
    currentMapWidgets: [],
};

module.exports = (state = initialState, action) => {
    switch (action.type) {
        case SET_MAP_WIDGETS: {
            return { ...state, currentMapWidgets: action.widgets };
        }
        case ADD_WIDGET: {
            let newWidgets;
            const haveWidgets = WidgetUtils.haveWidgets(action.widget);

            if (haveWidgets.length > 0) {
                newWidgets = state.currentMapWidgets.concat(haveWidgets);
            } else {
                newWidgets = state.currentMapWidgets.concat(action.widget);
            }

            return { ...state, currentMapWidgets: newWidgets };
        }
        case REMOVE_WIDGET: {
            const haveWidgets = WidgetUtils.haveWidgets(action.widget);

            const newWidgets = state.currentMapWidgets.filter((widget) => {
                if (haveWidgets.length > 0) {
                    if (!haveWidgets.includes(widget)) {
                        return widget;
                    }
                } else {
                    if (action.widget !== widget) {
                        return widget;
                    }
                }
            });

            return { ...state, currentMapWidgets: newWidgets };
        }
        case RESET_MAP_WIDGETS: {
            return {
                ...state,
                currentMapWidgets: WidgetUtils.checkDependencies(WidgetUtils.getDefaultListArray()),
            };
        }
        case UPDATE_WIDGETS: {
            return {
                ...state,
                enabled: WidgetUtils.checkDependencies(
                    WidgetUtils.getMinimalWidgetList().concat(
                        WidgetUtils.processMixins(action.widgets)
                    )
                ),
            };
        }
        default: {
            return state;
        }
    }
};
