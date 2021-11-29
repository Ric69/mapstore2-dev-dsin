import axios from 'axios';

import ConfigUtils from '@mapstore/utils/ConfigUtils';
import GeoStoreApi from '@mapstore/api/GeoStoreDAO';

const replaceTokens = (content, { name }) => {
    content = content.replace('{name}', name);
    // content = content.replace("{name}", moment(map.info.lastUpdate).format());

    return content;
};

export const afterSaveMap = ({ map }) => {
    axios
        .get(
            `extjs/search/category/SUBSCRIBE/map_${map.mapId}-user_***/mapId,user,email`,
            GeoStoreApi.addBaseUrl()
        )
        .then((response) => {
            if (response.data.totalCount > 0) {
                if (response.data.totalCount === 1) {
                    response.data.results = [response.data.results];
                }
                const users = response.data.results.map((user) => user.email);
                const emailConfig = ConfigUtils.getConfigProp('email');
                const tokens = {
                    name: map.info.name,
                };
                axios.post(emailConfig.api, {
                    sender: emailConfig.sender,
                    object: replaceTokens(emailConfig.notify.subject, tokens),
                    content: replaceTokens(emailConfig.notify.content, tokens),
                    receivers: users,
                    // Permet d'inclure un template HTML dans le mail
                    templateData: {},
                });
            }
        });
};
