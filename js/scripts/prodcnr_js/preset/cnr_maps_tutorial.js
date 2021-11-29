/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const I18N = require('../../MapStore2/web/client/components/I18N/I18N');
const CesiumTooltip = require('../../MapStore2/web/client/components/tutorial/steps/CesiumTooltip');

module.exports = [
    {
        translation: 'introCesium',
        selector: '#map .cesium-viewer',
    },
    {
        title: <I18N.Message msgId="tutorial.cesium.title" />,
        text: <CesiumTooltip />,
        selector: '#map',
        position: 'bottom',
    },
];
