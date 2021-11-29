/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const PropTypes = require('prop-types');
const { connect } = require('react-redux');
const { ButtonToolbar, Button: ButtonB, Grid, Col, Glyphicon } = require('react-bootstrap');

const brandImg = require('../../assets/img/cnr_logo.jpg');
const tooltip = require('../../MapStore2/web/client/components/misc/enhancers/tooltip');
const Button = tooltip(ButtonB);
const LocaleUtils = require('../../MapStore2/web/client/utils/LocaleUtils');
const { mapTypeSelector } = require('../../MapStore2/web/client/selectors/maptype');

class CreateNewMap extends React.Component {
    static propTypes = {
        mapType: PropTypes.string,
        showNewDashboard: PropTypes.bool,
        colProps: PropTypes.object,
        isLoggedIn: PropTypes.bool,
        allowedRoles: PropTypes.array,
        user: PropTypes.object,
        fluid: PropTypes.bool,
    };

    static contextTypes = {
        router: PropTypes.object,
        messages: PropTypes.object,
    };

    static defaultProps = {
        mapType: 'openlayers',
        showNewDashboard: true,
        isLoggedIn: false,
        allowedRoles: ['ADMIN', 'USER'],
        colProps: {
            xs: 8,
            sm: 8,
            lg: 8,
            md: 8,
        },
        fluid: true,
    };

    render() {
        return (
            <Grid id="topbar" fluid={this.props.fluid} style={{ marginBottom: '30px', padding: 0 }}>
                <Col {...this.props.colProps}>
                    <img id="logo" src={brandImg} alt={LocaleUtils.getMessageById(this.context.messages, 'brand')} />
                    {this.isAllowed() ? (
                        <ButtonToolbar>
                            <Button
                                tooltipId="newMap"
                                tooltipPosition="right"
                                className="square-button"
                                bsStyle="primary"
                                onClick={() => {
                                    this.context.router.history.push('/map/new');
                                }}>
                                <Glyphicon glyph="add-map" />
                            </Button>
                            {this.props.showNewDashboard ? (
                                <Button
                                    tooltipId="resources.dashboards.newDashboard"
                                    tooltipPosition="right"
                                    className="square-button"
                                    bsStyle="primary"
                                    onClick={() => {
                                        this.context.router.history.push('/dashboard/');
                                    }}>
                                    <Glyphicon glyph="add-dashboard" />
                                </Button>
                            ) : null}
                        </ButtonToolbar>
                    ) : null}
                </Col>
            </Grid>
        );
    }
    isAllowed = () => this.props.isLoggedIn && this.props.allowedRoles.indexOf(this.props.user && this.props.user.role) >= 0;
}

/**
 * Button bar to create a new map or dashboard.
 * @memberof plugins
 * @class CreateNewMap
 * @static
 * @prop {boolean} cfg.showNewDashboard show/hide th create new dashboard button.
 * @prop {string[]} cfg.allowedRoles array of users roles allowed to create maps and/or dashboards. default: `["ADMIN", "USER"]`. Users that don't have these roles will never see the buttons.
 */
module.exports = {
    CreateNewMapPlugin: connect((state) => ({
        mapType: mapTypeSelector(state),
        isLoggedIn:
            (state && state.security && state.security.user && state.security.user.enabled && !(state.browser && state.browser.mobile) && true) ||
            false,
        user: state && state.security && state.security.user,
    }))(CreateNewMap),
};
