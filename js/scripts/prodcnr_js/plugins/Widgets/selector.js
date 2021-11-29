const WidgetUtils = require('../../utils/WidgetUtils');

const getListActivePlugins = (state) => {
    let optionalPlugins = WidgetUtils.checkDependencies(
        (state.widgetsPage && state.widgetsPage.currentUserWidgetList) || []
    );
    return WidgetUtils.getMinimalWidgetList().concat(optionalPlugins);
};
const getListMapActivePlugins = (state) => {
    let optionalUserPlugins = (state.widgetsPage && state.widgetsPage.currentUserWidgetList) || [];
    let optionalMapPlugins = (state.widgets && state.widgets.currentMapWidgets) || [];
    let optionalPlugins = optionalUserPlugins.filter((w) => optionalMapPlugins.includes(w));
    return WidgetUtils.getMinimalWidgetList().concat(optionalPlugins);
};

module.exports = {
    getListActivePlugins,
    getListMapActivePlugins,
};
