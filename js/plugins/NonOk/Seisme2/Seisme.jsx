/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

// import React, { Component } from "react";
import React from "react";
import { connect } from "react-redux";
import { compose, withProps } from "recompose";
import PropTypes from 'prop-types';
import {get} from 'lodash';

// import { ZOOM_TO_POINT } from '../../../MapStore2/web/client/actions/map';
// import seisme from '../../reducers/seisme';

// NOTE: @mapstore is an alias in webpack config for /MapStore2/web/client, to access to the full framework library

// control actions/reducer
// it's useful to store simple setting like open closed dialogs and so on here, in order
// to be reset on map load
import { toggleControl } from "@mapstore/actions/controls";

import { createPlugin } from "@mapstore/utils/PluginsUtils";

// Dialog component
import Dialog from "@mapstore/components/misc/Dialog";

import { Glyphicon } from "react-bootstrap";

// import AppZonetext from "./AppZonetext";
import {SeismePlugin} from "./SeismeContenu";

import { FaJedi } from 'react-icons/fa';

require('./Seisme.css');

const SeismeDialog = ({
    enabled,
    floatingStyle,
    modal,
    draggable,
    onClose
}) => (
    <Dialog
        style={{
            zIndex: 1992,
            display: enabled ? "block" : "none",
            ...floatingStyle
        }}
        modal={modal}
        draggable={draggable}
    >
        <span role="header">
            <span className="settings-panel-title">Calcul impact Séisme sur ouvrages</span>
            <button onClick={onClose} className="settings-panel-close close">
                <Glyphicon glyph="1-close" />
            </button>
        </span>
        <div role="body">
            {/* <AppZonetext/> */}
            <SeismePlugin />
        </div>
    </Dialog>
);

const Seisme = compose(
    // connect the enabled props to the state and the close button to the toggleControl handler
    connect(
        state => ({
            enabled:
                (state.controls &&
                    state.controls.Seisme &&
                    state.controls.Seisme.enabled) ||
                false,
            withButton: false
        }),
        {
            onClose: toggleControl.bind(null, "Seisme", null)
        }
    ),
    // transform the floating option into needed properties for the dialog, to make it draggable, with the possibility to click on the center
    withProps(({ floating }) => ({
        // These are the property changes to apply to the Dialog component to make it a draggable window.
        // TODO: this enhancer could be added to MapStore to allow quick configuration of dialogs.
        modal: floating ? false : true, // modal option, to make the window with a dark background
        draggable: floating ? true : false, // make the dialog draggable
        floatingStyle: floating
            ? { position: "fixed", top: "-75px", left: "35%" }
            : {} // style adjustment to not fix to the center the window, when floating.
    }))

)(SeismeDialog);

export default createPlugin("Seisme", {
    component: Seisme,
    containers: {
        BurgerMenu: {
            name: "seisme",
            position: 60,
            text: "Calcul séisme",
            icon:<FaJedi />,
            // icon: <Glyphicon glyph="wrench" />,
            action: toggleControl.bind(null, "Seisme", null),
            priority: 4,
            doNotHide: true
        }
    }
});
