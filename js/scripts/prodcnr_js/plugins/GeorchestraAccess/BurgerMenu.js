/**
 * @Author Capgemini
 */
import React from 'react';
import assign from 'object-assign';

import ConfigUtils from '@mapstore/utils/ConfigUtils';

import './burger-menu.css';
import image from '../../../assets/img/georchestra_access.png';

class Empty extends React.Component {
    render() {
        return null;
    }
}

/** Georchestra Menu Access Burger Menu */
export default {
    GeorchestraAccessBurgerMenuPlugin: assign(Empty, {
        disablePluginIf: "{state('mapType') === 'cesium'}",
        BurgerMenu: {
            name: 'georchestraaccessburgermenuplugin',
            priority: 1,
            position: 36,
            tooltip: 'georchestra_access.tooltip',
            icon: <img className="georchestra_access_img" src={image} />,
            action: () => window.open(ConfigUtils.getConfigProp('georchestra_access'), '_blank'),
        },
    }),
};
