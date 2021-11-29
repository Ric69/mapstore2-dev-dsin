import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import moment from 'moment';
import { Grid, Row, Col } from 'react-bootstrap';
import { Parser } from 'html-to-react';
import SwipeableViews from 'react-swipeable-views';

import { createPlugin } from '@mapstore/utils/PluginsUtils';
import StringUtils from '@js/utils/StringUtils';
import Message from '@mapstore/components/I18N/Message';
import Portal from '@mapstore/components/misc/Portal';
import ResizableModal from '@mapstore/components/misc/ResizableModal';
import SwipeHeader from '@mapstore/components/data/identify/SwipeHeader';
import { disableMapWindow, disableWindow, enableMapWindow } from '@js/plugins/WindowModal/actions';

class WindowModal extends Component {
    static propTypes = {
        disableMapWindow: PropTypes.func,
        disableWindow: PropTypes.func,
        enableMapWindow: PropTypes.func,
        infos: PropTypes.object,
        mapId: PropTypes.number,
    };

    static defaultProps = {
        disableMapWindow: () => {},
        disableWindow: () => {},
        enableMapWindow: () => {},
        infos: {},
        mapId: 1,
    };

    state = {
        swipeIndex: 0,
        swipeIndexMin: 0,
        swipeIndexMax: 0,
    };

    componentWillReceiveProps() {
        const contentDivided = this.getDividedContent();
        if (contentDivided.length > 1) {
            this.setState({
                swipeIndexMax: contentDivided.length,
            });
        } else {
            this.setState({
                swipeIndexMin: 0,
                swipeIndexMax: 0,
            });
        }
    }

    /**
     * Fermer la modale d'affichage d'informations
     */
    closeModal = () => {
        this.props.disableWindow();
    };

    /**
     * Vérification supplémentaire
     * - On vérifie que la carte n'a pas été désactivé dans le localStorage
     * - On vérifie la dernière date de modification par rapport à la date de désactivation
     * @returns {boolean}
     */
    isEnable = () => {
        const storage = this.getStorage();
        const exists = (storage.maps || []).filter((map) => map.mapId === this.props.mapId);
        if (exists.length > 0) {
            if (this.getDateMapUpdated() > exists[0].timestamp) {
                this.props.enableMapWindow(this.props.mapId);

                return true;
            }

            return false;
        }

        return true;
    };

    /**
     * Le timestamp de la modification de la variable window
     * @returns {integer}
     */
    getDateMapUpdated = () => {
        if (this.props.infos.updated > 0) {
            return this.props.infos.updated;
        }

        return -1;
    };

    /**
     * Le timestamp de l'instant T
     * @returns {integer}
     */
    getDateNow = () => {
        return Math.round(moment().format('x') / 1000);
    };

    /**
     * Divise le contenu par rapport au séparateur
     * @returns {string[]}
     */
    getDividedContent = () => {
        return this.props.infos.content.split('<p>' + StringUtils.dividerCharacter() + '</p>');
    };

    /**
     * Le localStorage correspondant aux cartes désactivées
     * @returns {any}
     */
    getStorage = () => {
        return JSON.parse(localStorage.getItem('mapstore2.persist.windowMaps'));
    };

    /**
     * Slide suivante
     */
    nextSlide = () => {
        if (this.state.swipeIndex < this.state.swipeIndexMax) {
            this.setState({
                swipeIndex: this.state.swipeIndex + 1,
            });
        }
    };

    /**
     * Parsage en HTML
     * @returns {*}
     */
    parseStringToHtml = (string) => {
        const htmlToReactParser = new Parser();

        return htmlToReactParser.parse(string.replace(StringUtils.dividerCharacter(), ''));
    };

    /**
     * Slide précèdente
     */
    previousSlide = () => {
        if (this.state.swipeIndex > -1) {
            this.setState({
                swipeIndex: this.state.swipeIndex - 1,
            });
        }
    };

    /**
     * Désactivé l'affichage de la model
     */
    toggleDisplay = (e) => {
        const isChecked = e.target.checked;

        if (isChecked) {
            this.props.disableMapWindow(this.props.mapId, this.getDateNow());
        } else {
            this.props.enableMapWindow(this.props.mapId);
        }
    };

    /**
     * Affichage de la navigation par slide
     * @returns {null|*}
     */
    renderSlidesHeader() {
        if (this.state.swipeIndexMin === this.state.swipeIndexMax) {
            return null;
        }

        return (
            <Row>
                <Col xs={12} style={{ marginTop: '10px' }}>
                    <SwipeHeader
                        title={
                            <b>
                                <Message
                                    msgId="window.swipeTitle"
                                    msgParams={{
                                        index: parseInt(this.state.swipeIndex) + 1,
                                        total: this.state.swipeIndexMax,
                                    }}
                                />
                            </b>
                        }
                        index={this.state.swipeIndex}
                        size={this.state.swipeIndexMax}
                        onNext={this.nextSlide}
                        onPrevious={this.previousSlide}
                    />
                </Col>
            </Row>
        );
    }

    /**
     * Affichage du contenu, si besoin en slides
     * @returns {*}
     */
    renderSlides() {
        const checkBoxName = 'window-disable';
        let content;
        if (this.state.swipeIndexMax > 0) {
            const contentDivided = this.getDividedContent();
            content = (
                <SwipeableViews index={this.state.swipeIndex}>
                    {contentDivided.map((slideContent, index) => (
                        <div className={'slide-' + index}>
                            {this.parseStringToHtml(slideContent)}
                        </div>
                    ))}
                </SwipeableViews>
            );
        } else {
            content = this.parseStringToHtml(this.props.infos.content);
        }

        return (
            <>
                <Row>
                    <Col xs={12} style={{ marginTop: '10px' }}>
                        {content}
                    </Col>
                </Row>
                <Row>
                    <Col xs={12} style={{ marginTop: '10px' }}>
                        <label htmlFor={checkBoxName}>
                            <input
                                type="checkbox"
                                onClick={this.toggleDisplay}
                                name={checkBoxName}
                                id={checkBoxName}
                            />
                            &nbsp;
                            <Message msgId="window.checkboxLabel" />
                        </label>
                    </Col>
                </Row>
            </>
        );
    }

    /**
     * Affichage de la Modal
     * @returns HTML
     */
    renderDialog() {
        return (
            <Portal>
                <ResizableModal
                    id="window-modal"
                    show
                    size="md"
                    onClose={this.closeModal}
                    title={<Message msgId="window.mapTitle" />}>
                    <Grid fluid role="body">
                        {this.renderSlidesHeader()}
                        {this.renderSlides()}
                    </Grid>
                </ResizableModal>
            </Portal>
        );
    }

    render() {
        if (this.props.infos.enabled && this.isEnable()) {
            return this.renderDialog();
        }

        return null;
    }
}

const selector = createSelector(
    [
        (state) => state.windowModal,
        (state) => state.map && state.map.present && state.map.present.mapId,
    ],
    (modal, mapId) => {
        return {
            infos: modal || {},
            mapId: mapId || 1,
        };
    }
);

const WindowModalPlugin = connect(
    selector,
    { disableMapWindow, disableWindow, enableMapWindow }
)(WindowModal);

export default createPlugin('WindowModal', {
    component: WindowModalPlugin,
    reducers: {
        windowModal: require('./reducers/modal'),
        windowMaps: require('./reducers/map'),
    },
    epics: require('./epics'),
});
