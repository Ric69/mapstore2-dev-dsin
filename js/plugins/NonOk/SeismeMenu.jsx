import React from 'react';

import assign from 'object-assign';
import Button from '../misc/Button';
import PropTypes from 'prop-types';
import { Glyphicon, Tooltip } from 'react-bootstrap';
import OverlayTrigger from '../misc/OverlayTrigger';
import Message from '../../components/I18N/Message';
import ConfirmModal from '../../components/misc/ResizableModal';
import { FaJedi } from 'react-icons/fa';

require('./Seisme.css');


export default {
    HomePlugin: assign(HomeConnected, {
        Toolbar: {
            name: 'home',
            position: 1,
            tooltip: "gohome",
            icon: <Glyphicon glyph="home"/>,
            help: <Message msgId="helptexts.gohome"/>,
            action: (context) => goToPage('/', context.router),
            priority: 1
        },
        BurgerMenu: {
            name: 'home',
            position: 1,
            text: <Message msgId="gohome"/>,
            icon: <Glyphicon glyph="home"/>,
            action: (context) => goToPage('/', context.router),
            priority: 2
        },
        OmniBar: {
            name: 'home',
            position: 4,
            tool: true,
            action: (context) => goToPage('/', context.router),
            priority: 3
        }
    }),
    reducers: {},
    epics: { comparePendingChanges }
};


export default {
    LoginPlugin: assign(LoginTool, {
        OmniBar: {
            name: "login",
            position: 3,
            tool: LoginNav,
            tools: [UserDetails, PasswordReset, Login],
            priority: 1
        }
    }),
    reducers: {security},
    epics: {
        ...epics,
        comparePendingChanges
    }
};

export default createPlugin(
    'BurgerMenu',
    {
        component: connect((state) =>({
            controls: state.controls
        }))(BurgerMenu),
        containers: {
            OmniBar: {
                name: "burgermenu",
                position: 2,
                tool: true,
                priority: 1
            }
        }
    }
);
