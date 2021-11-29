/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const assign = require('object-assign');
const { connect } = require('react-redux');
const { Tooltip, Button } = require('react-bootstrap');
const { GrCatalog } = require('react-icons/gr');

const { isLoggedIn } = require('../../MapStore2/web/client/selectors/security');
const { pathnameSelector } = require('../../MapStore2/web/client/selectors/router');

const OverlayTrigger = require('../../MapStore2/web/client/components/misc/OverlayTrigger');
const Message = require('../../MapStore2/web/client/components/I18N/Message');
const { setControlProperty } = require('../../MapStore2/web/client/plugins/../actions/controls');

const Portal = require('../../MapStore2/web/client/components/misc/Portal');
const ConfirmDialog = require('../../MapStore2/web/client/components/misc/ConfirmDialog');

class MapsLink extends React.Component {
    static propTypes = {
        action: PropTypes.func,
        visible: PropTypes.bool,
        confirm: PropTypes.bool,
        showModal: PropTypes.func,
        closing: PropTypes.bool,
    };

    static contextTypes = {
        router: PropTypes.object,
        messages: PropTypes.object,
    };

    static defaultProps = {
        visible: true,
        confirm: false,
        closing: false,
        showModal: () => {},
        action: () => {},
    };

    renderModals = () => {
        if (this.props.closing) {
            return (
                <Portal>
                    <ConfirmDialog
                        show
                        modal
                        onClose={() => this.props.showModal(false)}
                        onConfirm={() => this.action(true)}
                        confirmButtonBSStyle="default"
                        closeGlyph="1-close"
                        title={<Message msgId="maplinks.title" />}
                        confirmButtonContent={<Message msgId="maplinks.confirm" />}
                        closeText={<Message msgId="maplinks.cancel" />}>
                        <Message msgId="maplinks.exitMap" />
                    </ConfirmDialog>
                </Portal>
            );
        }
        return null;
    };

    render() {
        let tooltip = (
            <Tooltip id="maps-link-tooltip">
                <Message msgId={this.props.tooltip} />
            </Tooltip>
        );
        if (this.props.visible) {
            return (
                <div className="mapstore-maplinks-button">
                    <OverlayTrigger overlay={tooltip} placement="left">
                        <Button {...this.props} className="square-button" bsStyle="primary" onClick={() => this.action(false)}>
                            <GrCatalog className="svg-color-white" style={{ fontSize: '2em' }} />
                        </Button>
                    </OverlayTrigger>
                    {this.renderModals()}
                </div>
            );
        }
        return null;
    }

    action = (force) => {
        if (this.props.confirm && !force) {
            return this.props.showModal(true);
        } else {
            this.context.router.history.push('/maps');
            return this.props.showModal(false);
        }
    };
}

const confirmExit = (state) => {
    let map = (state.map && state.map.present) || state.map || (state.config && state.config.map) || null;
    if (pathnameSelector(state).indexOf('widgets') !== -1) return false;
    if (map && map.mapId && state && state.security && state.security.user) {
        if (state.maps && state.maps.results) {
            let mapId = map.mapId;
            let currentMap = state.maps.results.filter((item) => item && '' + item.id === mapId);
            if (currentMap && currentMap.length > 0 && currentMap[0].canEdit) {
                return true;
            }
        }
        if (map.info && map.info.canEdit) {
            return true;
        }
    }
    return false;
};

const MapsLinkPlugin = connect(
    (state) => ({
        visible: isLoggedIn(state),
        confirm: confirmExit(state),
        closing: !!(state.controls && state.controls.maplinks && state.controls.maplinks.confirmmodal),
        tooltip: 'maps.title',
    }),
    {
        showModal: (bool) => setControlProperty('maplinks', 'confirmmodal', bool),
    }
)(MapsLink);

module.exports = {
    MapsLinkPlugin: assign(MapsLinkPlugin, {
        OmniBar: {
            name: 'mapsLink',
            position: 1,
            tool: true,
            tooltip: 'maps.title',
        },
    }),
    reducers: {},
};
