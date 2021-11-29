const GeoStoreApi = require('@mapstore/api/GeoStoreDAO');
const { getConfigProp } = require('@mapstore/utils/ConfigUtils');

/**
 * @author CapGemini
 * Utilities pour GeoStore
 */
const GeostoreUtils = {
    /**
     * @returns {*|AxiosPromise}
     */
    updateResourcePermissions: (resourceId) => {
        return GeoStoreApi.updateResourcePermissions(resourceId, {
            SecurityRuleList: {
                SecurityRule: {
                    canRead: true,
                    canWrite: true,
                    canDelete: true,
                    canEdit: true,
                    group: {
                        groupName: 'everyone',
                        id: getConfigProp('groupEveryoneId'),
                    },
                },
            },
        });
    },
};

module.exports = GeostoreUtils;
