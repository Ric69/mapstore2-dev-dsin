import { toggleControl } from "@mapstore/actions/controls";
import { createPlugin } from "@mapstore/utils/PluginsUtils";// Dialog component
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

// const conditionalToggle = on.bind(null, toggleControl('calseisme', null), (state) =>
//     !(state.controls && state.controls.calseisme && state.controls.calseisme.enabled && state.calseisme && state.calseisme.editing)
// , closeAnnotations);

/**
 * Plugin for the "About" window in mapstore.
 * @name CalSeisme
 * @class
 * @memberof plugins
 */
// export default {
//     CalSeismePlugin: assign(CalSeisme,
//         {
//             BurgerMenu: {
//                 name: 'CalSeisme',
//                 position: 2002,
//                 text: "Plugin CalSeisme",
//                 icon: <Glyphicon glyph="asterisk"/>,
//                 action: toggleControl.bind(null, 'calseisme', null),
//                 priority: 2,
//                 doNotHide: true
//             }
//         }),
//     reducers: {}
// };
// export default createPlugin('CalSeisme', {
//     component: assign(CalSeismePlugin, {
//         disablePluginIf: "{state('mapType') === 'cesium'}"
//     }, {
//         BurgerMenu: {
//             name: 'CalSeisme',
//             position: 40,
//              text: "Plugin CalSeisme",
//             icon: <Glyphicon glyph="asterisk"/>,
//             action: toggleControl.bind(null, 'calseisme', null),
//             priority: 2,
//             doNotHide: true
//         }
//     }),
//     reducers: {}
// });

export default createPlugin("Seisme", {
    component: Seisme,
    containers: {
        BurgerMenu: {
            name: "seisme",
            position: 1600,
            text: "Calcul séisme",
            icon: <Glyphicon glyph="asterisk" />,
            action: toggleControl.bind(null, "Seisme", null),
            priority: 1,
            doNotHide: true
        }
    }
});

    //   "CalculSeisme",
    //   {
    //     "name": "CalSeisme",
    //     "showIn": [
    //       "BurgerMenu"
    //     ]
    //   },