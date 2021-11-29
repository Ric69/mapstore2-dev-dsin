/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import assign from 'object-assign';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { GoDatabase } from 'react-icons/go';

import ConfigUtils from '@mapstore/utils/ConfigUtils';
import Button from '@js/plugins/BarButton';
import { isLoggedIn } from '@mapstore/selectors/security';

const selector = createSelector(
    [
        (state) => isLoggedIn(state) || false
    ],
    (visible) => ({
        action: () => window.open(ConfigUtils.getConfigProp('georchestra_access'), '_blank'),
        icon: <GoDatabase color="#fff" style={{ fontSize: '2em' }} />,
        tooltip: 'georchestra_access.tooltip',
        visible,
    })
);

const GeorchestraAccessOmniBarPlugin = connect(selector)(Button);

/** Georchestra Menu Access Burger Menu */
export default {
    GeorchestraAccessOmniBarPlugin: assign(GeorchestraAccessOmniBarPlugin, {
        disablePluginIf: "{state('mapType') === 'cesium'}",
        OmniBar: {
            name: 'GeorchestraAccessOmniBarPlugin',
            position: 2,
            tooltip: 'georchestra_access.tooltip',
            tool: true,
            priority: 1,
            doNotHide: true,
        },
    }),
};
