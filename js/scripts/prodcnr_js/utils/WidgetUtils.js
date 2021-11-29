const { union, isEmpty } = require('lodash');
const axios = require('@mapstore/libs/ajax');
const GeoStoreDAO = require('@mapstore/api/GeoStoreDAO');

const allWidgets = [];
let cacheWidgets = {};

const WidgetUtils = {
    findUserWidgets: (user) => {
        const userId = user.id || 0;
        const userGroups =
            (user.groups &&
                user.groups.group &&
                (Array.isArray(user.groups.group) ? user.groups.group : [user.groups.group])) ||
            [];
        const url = 'resources/search/widgets';
        return axios.get(url, GeoStoreDAO.addBaseUrl()).then((response) => {
            const id =
                (response.data &&
                    response.data.ResourceList &&
                    response.data.ResourceList.Resource &&
                    response.data.ResourceList.Resource.id) ||
                0;
            if (id > 0) {
                return GeoStoreDAO.getData(id).then(
                    (data) => {
                        let widgetsList = data.users[userId] || [];
                        userGroups.forEach((group) => {
                            if (data.groups[group.id] !== undefined) {
                                widgetsList = widgetsList.concat(data.groups[group.id]);
                            }
                        });
                        return [...new Set(widgetsList)];
                    },
                    (err) => []
                );
            } else {
                return [];
            }
        });
    },
    /**
     * On vérifie/met à jour la liste des widgets par rapport aux dépendances
     * @param selectedWidgets
     * @returns {Array|*}
     */
    checkDependencies: (selectedWidgets) => {
        const dependencies = WidgetUtils.getDependencies();
        const includeDependencies = [];

        selectedWidgets.map((widget) => {
            if (WidgetUtils.isInWidgets(widget)) {
                const infoWidget = allWidgets.filter((w) => w.name === widget)[0];
                if (infoWidget.widget && infoWidget.widget.dependencies) {
                    infoWidget.widget.dependencies.map((dependency) => {
                        if (!includeDependencies.includes(dependency)) {
                            includeDependencies.push(dependency);
                        }
                    });
                }
            }
        });

        // On ajoute l'ensemble des dépendances, puis on les filtres
        selectedWidgets = union(selectedWidgets, dependencies);
        if (dependencies.length !== includeDependencies.length) {
            dependencies.map((dependency) => {
                if (!includeDependencies.includes(dependency)) {
                    let index = selectedWidgets.indexOf(dependency);
                    if (index >= 0) {
                        selectedWidgets.splice(index, 1);
                    }
                }
            });
        }

        return selectedWidgets;
    },

    processMixins: (selectedWidgets) => {
        let returnList = [];
        selectedWidgets.map((widget) => {
            if (WidgetUtils.isInWidgets(widget)) {
                const detailWidget = allWidgets.filter((w) => w.name === widget)[0];
                if (detailWidget.widget && detailWidget.widget.widgets) {
                    returnList.push(...detailWidget.widget.widgets);
                } else {
                    returnList.push(widget);
                }
            }
        });
        return returnList;
    },

    /**
     * Liste les widgets activables
     * @returns {any[]}
     */
    filterEnabledWidget: () => {
        return allWidgets
            .filter((widget) => widget.widget && !widget.widget.auto)
            .map((widget) => {
                return {
                    key: widget.name,
                    title: widget.widget.name !== '' ? widget.widget.name : widget.name,
                };
            });
    },

    getAutoWidgets: () => {
        return allWidgets
            .filter((widget) => widget.widget && widget.widget.auto)
            .map((widget) => {
                return widget.name;
            });
    },

    /**
     * Retourne l'ensemble des widgets configuré
     * @returns {Array}
     */
    getDefaultList: () => {
        return allWidgets;
    },

    /**
     * Retourne l'ensemble des widgets configuré sous forme de tableau simple
     * @returns {Array}
     */
    getDefaultListArray: () => {
        if (isEmpty(allWidgets)) {
            return [];
        }

        return allWidgets.map((widget) => {
            return widget.name;
        });
    },

    /**
     * Retourne l'ensemble des widgets considéré comme dépendance
     * @returns {Array}
     */
    getDependencies: () => {
        const dependencies = [];

        allWidgets
            .filter((widget) => widget.widget && widget.widget.dependencies)
            .map((widget) => {
                widget.widget.dependencies.map((dependency) => {
                    if (!dependencies.includes(dependency)) {
                        dependencies.push(dependency);
                    }
                });
            });

        return dependencies;
    },

    getParent: (name) => {
        let parent;

        allWidgets
            .filter((widget) => widget && widget.widget && widget.widget.widgets)
            .map((widget) => {
                widget.widget.widgets.map((w) => {
                    if (w === name) {
                        parent = widget.name;
                    }
                });
            });

        return parent;
    },

    /**
     * Récupère les widgets compris avec un autre widget
     * @param widgetName
     * @returns {Array}
     */
    haveWidgets: (widgetName) => {
        if (cacheWidgets[widgetName]) {
            return cacheWidgets[widgetName];
        }

        const list = [];

        allWidgets.map((widget) => {
            const name = widget.name;
            if (widgetName === name) {
                const widgets = (widget.widget && widget.widget.widgets) || [];
                if (widgets.length > 0) {
                    list.push(name);
                    widgets.map((w) => {
                        list.push(w);
                    });
                }
            }
        });
        cacheWidgets[widgetName] = list;

        return list;
    },

    /**
     *
     * @param name
     * @returns {boolean}
     */
    isInWidgets: (name) => {
        return allWidgets.filter((widget) => widget === name || widget.name === name).length > 0;
    },

    /**
     * On créé le tableau des widgets
     * @param widgets
     */
    setWidgets: (widgets) => {
        widgets
            .filter((widget) => {
                const name = widget.name || widget;

                return !WidgetUtils.isInWidgets(name);
            })
            .filter((widget) => widget.widget)
            .map((widget) => {
                const config = widget.widget || [];
                allWidgets.push(widget.name ? widget : { name: widget });

                if (config.dependencies) {
                    config.dependencies.map((dependency) => {
                        if (!WidgetUtils.isInWidgets(dependency)) {
                            allWidgets.push({
                                name: dependency,
                            });
                        }
                    });
                }

                if (config.widgets) {
                    config.widgets.map((w) => {
                        if (!WidgetUtils.isInWidgets(w)) {
                            allWidgets.push({
                                name: w,
                            });
                        }
                    });
                }
            });
    },

    getMinimalWidgetList: () => {
        return allWidgets
            .filter((widget) => widget.widget && widget.widget.auto)
            .map((widget) => {
                return widget.name;
            });
    },
};

module.exports = WidgetUtils;
