/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const PropTypes = require('prop-types');
const React = require('react');
const { get, isEmpty, isNumber } = require('lodash');
const ReactQuill = require('react-quill');
const { Grid, Row, Col } = require('react-bootstrap');
const assign = require('object-assign');
const axios = require('axios');
const moment = require('moment');

const { toolbarConfig } = require('@mapstore/components/misc/quillmodules/ResizeModule')(ReactQuill.Quill, { withDivideContent: true });
const Portal = require('@mapstore/components/misc/Portal');
const Modal = require('@mapstore/components/misc/ResizableModal');
const Message = require('@mapstore/components/I18N/Message');
const GridCard = require('@mapstore/components/misc/GridCard');
const FitIcon = require('@mapstore/components/misc/FitIcon');
const thumbUrl = require('@mapstore/components/maps/style/default.jpg');
const ConfirmModal = require('@mapstore/components/maps/modals/ConfirmModal');
const GeoStoreApi = require('@mapstore/api/GeoStoreDAO');
const LocaleUtils = require('@mapstore/utils/LocaleUtils');
const ConfigUtils = require('@mapstore/utils/ConfigUtils');
const StringUtils = require('@js/utils/StringUtils');

class MapCard extends React.Component {
    static propTypes = {
        // props
        style: PropTypes.object,
        map: PropTypes.object,
        showMapDetails: PropTypes.bool,
        detailsSheetActions: PropTypes.object,
        // CALLBACKS
        viewerUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
        onEdit: PropTypes.func,
        onMapDelete: PropTypes.func,
        onUpdateAttribute: PropTypes.func,
        backgroundOpacityStart: PropTypes.number,
        backgroundOpacityEnd: PropTypes.number,
        tooltips: PropTypes.object,
        userEmail: PropTypes.string,
    };

    static contextTypes = {
        iFollowIt: PropTypes.bool || PropTypes.string,
        messages: PropTypes.object,
    };

    static defaultProps = {
        showMapDetails: true,
        style: {
            backgroundImage: 'url(' + thumbUrl + ')',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'repeat-x',
        },
        detailsSheetActions: {
            onToggleDetailsSheet: () => {},
        },
        // CALLBACKS
        onMapDelete: () => {},
        onEdit: () => {},
        onUpdateAttribute: () => {},
        onSuccess: () => {},
        onWarning: () => {},
        backgroundOpacityStart: 0.7,
        backgroundOpacityEnd: 0.3,
        tooltips: {
            deleteResource: 'resources.resource.deleteResource',
            editResource: 'resources.resource.editResource',
            addToFeatured: 'resources.resource.addToFeatured',
            showDetails: 'resources.resource.showDetails',
            removeFromFeatured: 'resources.resource.removeFromFeatured',
        },
    };

    state = {
        iFollowIt: false,
        resourceId: undefined,
        emailOfUser: undefined,
        editWindow: false,
        contentWindow: '',
        contentWindowLoading: true,
        loading: false,
        canDelete: false,
    };

    componentDidMount() {
        this.refreshSubscriptions(this.props.map.id);
        GeoStoreApi.getResourceAttributes(this.props.map.id)
            .then((attributes) => {
                if (!isEmpty(attributes)) {
                    const result = attributes.filter((attr) => attr.name === 'windowId')[0];
                    if (result.value && result.value > 0) {
                        const windowId = result.value;
                        GeoStoreApi.getData(windowId).then((data) => {
                            this.setState({
                                canDelete: true,
                                contentWindowLoading: false,
                                contentWindow: data,
                            });
                        });
                    } else {
                        this.setState({
                            contentWindowLoading: false,
                        });
                    }
                } else {
                    this.setState({
                        contentWindowLoading: false,
                    });
                }
            })
            .catch(() => {
                this.setState({
                    contentWindowLoading: false,
                });
            });
    }

    componentWillReceiveProps(nextProps) {
        this.refreshSubscriptions(nextProps.map.id);
    }

    refreshSubscriptions = (mapId) => {
        if (this.props.userEmail) {
            axios
                .get(`extjs/search/category/SUBSCRIBE/map_${mapId}-user_${this.props.userEmail}/mapId,user,email`, GeoStoreApi.addBaseUrl())
                .then((response) => {
                    this.setState({
                        iFollowIt: response.data.totalCount > 0,
                        resourceId: response.data.results ? response.data.results.id : undefined,
                        emailOfUser: this.props.userEmail,
                    });
                });
        }
    };

    /**
     * Affichage/Désaffichage de la modale pour l'édition du contenu
     */
    toggleDialogWindow = () => {
        this.setState({
            editWindow: !this.state.editWindow,
        });
    };

    /**
     * Mise à jour du contenu de la fenêtre modale
     * @param map
     */
    updateWindow = (map) => {
        this._windowRequest(map, this.state.contentWindow);
    };

    /**
     * Suppression du contenu de la fenêtre modale
     * @param map
     */
    deleteWindow = (map) => {
        const windowId = (map.windowId && parseInt(map.windowId)) || 0;
        const metadata = {
            name: map.name,
            description: map.description,
        };
        if (windowId > 0) {
            GeoStoreApi.deleteData(windowId)
                .then(() => {
                    this.setState({ contentWindow: '', canDelete: false });
                    this._updateWindowContentOnMap({ map, metadata, toggleWindow: false, windowId: 0 });
                })
                .catch((e) => {
                    console.log(e);
                    this.props.onWarning({
                        title: 'window.saved.title',
                        message: 'window.saved.errorOnDelete',
                    });
                    this.setState({ loading: false });
                });
        }
    };

    /**
     * @param map
     * @param metadata
     * @param windowId
     * @private
     */
    _updateWindowContentOnMap = ({ map, metadata, toggleWindow = true, windowId }) => {
        if (isNumber(windowId)) {
            /**
             * On donne l'autorisation de lecture à tous les utilisateurs
             */
            GeoStoreApi.updateResourcePermissions(windowId, {
                SecurityRuleList: {
                    SecurityRule: {
                        canRead: true,
                        canWrite: true,
                        canDelete: true,
                        canEdit: true,
                        group: {
                            groupName: 'everyone',
                            id: ConfigUtils.getConfigProp('groupEveryoneId'),
                        },
                    },
                },
            })
                .then(() => {
                    GeoStoreApi.getResourceAttributes(map.id)
                        .then((attributes) => {
                            if (!isEmpty(attributes)) {
                                attributes.map((attr) => {
                                    metadata[attr.name] = attr.value;
                                });
                            }
                            metadata.name = map.name;

                            const time = Math.round(moment().format('x') / 1000);
                            metadata.contentWindowDate = time;
                            // Hack, pour éviter les contenus en doublon
                            metadata.contentWindow = '';
                            metadata.windowId = windowId;

                            GeoStoreApi.putResourceMetadataAndAttributes(map.id, metadata)
                                .then(() => {
                                    this.setState({ loading: false });
                                    this.props.onAttributeUpdate(map.id, 'windowId', metadata.windowId, 'STRING');
                                    this.props.onAttributeUpdate(map.id, 'contentWindowDate', metadata.contentWindowDate, 'STRING');
                                    this.props.onSuccess({
                                        title: 'window.saved.title',
                                        message: 'window.saved.success',
                                    });
                                    if (toggleWindow) {
                                        this.toggleDialogWindow();
                                    }
                                })
                                .catch((e) => {
                                    console.log(e);
                                    this.props.onWarning({
                                        title: 'window.saved.title',
                                        message: 'window.saved.warning',
                                    });
                                    this.setState({ loading: false });
                                });
                        })
                        .catch((e) => {
                            console.log(e);
                            this.props.onWarning({
                                title: 'window.saved.title',
                                message: 'window.saved.error',
                            });
                            this.setState({ loading: false });
                        });
                })
                .catch((e) => {
                    console.log(e);
                });
        }
    };

    /**
     * Request API Geostore pour mise à jour de la resource carte
     * @param map
     * @param contentWindow
     * @private
     */
    _windowRequest = (map, contentWindow) => {
        this.setState({ loading: true });
        const metadata = {
            name: StringUtils.uniqid(),
            description: map.description,
        };
        const editWindowId = (map.windowId && parseInt(map.windowId)) || 0;
        if (editWindowId > 0) {
            GeoStoreApi.putResource(editWindowId, contentWindow)
                .then((response) => {
                    this.setState({ canDelete: true });
                    this._updateWindowContentOnMap({ map, metadata, windowId: response.data });
                })
                .catch((e) => {
                    console.log(e);
                    this.props.onWarning({
                        title: 'window.saved.title',
                        message: 'window.saved.error',
                    });
                    this.setState({ loading: false });
                });
        } else {
            GeoStoreApi.createResource(metadata, contentWindow, 'DETAILS')
                .then((response) => {
                    this.setState({ canDelete: true });
                    this._updateWindowContentOnMap({ map, metadata, windowId: response.data });
                })
                .catch((e) => {
                    console.log(e);
                    this.props.onWarning({
                        title: 'window.saved.title',
                        message: 'window.saved.error',
                    });
                    this.setState({ loading: false });
                });
        }
    };

    isEmptyWindowContent = (contentWindow) => {
        return StringUtils.isEmptyContent(contentWindow);
    };

    onEdit = (map, openModalProperties) => {
        this.props.onEdit(map, openModalProperties);
    };

    onConfirmDelete = () => {
        this.props.onMapDelete(this.props.map.id);
        this.close();
    };

    onClick = (evt) => {
        // Users can select Title and Description without triggering the click
        var selection = window.getSelection();
        if (!selection.toString()) {
            this.stopPropagate(evt);
            this.props.viewerUrl(this.props.map);
        }
    };

    getCardStyle = () => {
        if (this.props.map.thumbnail) {
            return assign({}, this.props.style, {
                backgroundImage:
                    'linear-gradient(rgba(0, 0, 0, ' +
                    this.props.backgroundOpacityStart +
                    '), rgba(0, 0, 0, ' +
                    this.props.backgroundOpacityEnd +
                    ') ), url(' +
                    (this.props.map.thumbnail === null || this.props.map.thumbnail === 'NODATA'
                        ? thumbUrl
                        : decodeURIComponent(this.props.map.thumbnail)) +
                    ')',
            });
        }
        return this.props.style;
    };

    follow() {
        let metadata = {
            mapId: this.props.map.id,
            email: this.state.emailOfUser,
            name: `map_${this.props.map.id}-user_${this.state.emailOfUser}`,
        };
        GeoStoreApi.createResource(metadata, null, 'SUBSCRIBE').then((response) => {
            this.setState({ iFollowIt: true, resourceId: response.data });
            const application = LocaleUtils.getMessageById(this.context.messages, 'notification.mail.add.application');
            const name = this.props.map.title || this.props.map.name;
            const description = LocaleUtils.getMessageById(this.context.messages, 'notification.mail.add.description');
            this.props.onSuccess({
                title: 'notification.mail.add.title',
                message: `${application} ${name} ${description}`,
            });
            GeoStoreApi.updateResourcePermissions(response.data, {
                SecurityRuleList: {
                    SecurityRule: {
                        canRead: true,
                        canWrite: true,
                        canDelete: true,
                        canEdit: true,
                        group: {
                            groupName: 'everyone',
                            id: ConfigUtils.getConfigProp('groupEveryoneId'),
                        },
                    },
                },
            });
        });
    }

    unfollow() {
        GeoStoreApi.deleteResource(this.state.resourceId).then(() => {
            this.setState({ iFollowIt: false, resourceId: undefined });
            this.props.onWarning({
                title: 'notification.mail.delete.title',
                message: `notification.mail.delete.description`,
            });
        });
    }

    /**
     * Affichage de la Modal
     * @returns HTML
     */
    renderEditWindowDialog(map) {
        const modules = {
            toolbar: toolbarConfig,
        };

        return (
            <Portal>
                <Modal
                    id="window-panel"
                    draggable={false}
                    show={this.state.editWindow}
                    size="lg"
                    onClose={this.toggleDialogWindow}
                    title={<Message msgId="window.title" msgParams={{ title: map.title || map.name }} />}>
                    <Grid fluid role="body">
                        {this.state.loading ? (
                            <div id="panel-loader">
                                <div className="_ms2_init_spinner _ms2_init_center">
                                    <div className="_ms2_init_text _ms2_init_center" />
                                </div>
                            </div>
                        ) : (
                            ''
                        )}
                        <Row style={{ marginTop: '15px' }}>
                            <Col xs={12}>
                                <div className="alert alert-info">
                                    <Message msgId="window.explain" />
                                </div>
                                <ReactQuill
                                    value={StringUtils.sanitizeContentWindow(this.state.contentWindow)}
                                    onChange={(val) => this.setState({ contentWindow: val })}
                                    modules={modules}
                                />
                                <p>&nbsp;</p>
                                <button className="btn btn-primary" onClick={() => this.updateWindow(map)}>
                                    <i className="fa fa-edit" /> <Message msgId={'window.buttons.save'} />
                                </button>
                                {!this.state.canDelete ? null : (
                                    <button className="btn btn-success" onClick={() => this.deleteWindow(map)}>
                                        <i className="fa fa-trash" /> <Message msgId="window.buttons.delete" />
                                    </button>
                                )}
                            </Col>
                        </Row>
                    </Grid>
                </Modal>
            </Portal>
        );
    }

    render() {
        const isFeatured = (this.props.map && this.props.map.featured === 'true') || this.props.map.featured === 'added';
        const mapId = this.props.map.id;

        const availableAction = [
            {
                visible: this.props.map.canEdit === true,
                glyph: 'trash',
                disabled: this.props.map.deleting,
                loading: this.props.map.deleting,
                tooltipId: this.props.tooltips.deleteResource,
                onClick: (evt) => {
                    this.stopPropagate(evt);
                    this.displayDeleteDialog();
                },
            },
            {
                visible: this.props.map.canEdit === true,
                glyph: 'new-window',
                disabled: this.props.map.deleting,
                loading: this.state.contentWindowLoading,
                tooltipId: this.state.contentWindowLoading
                    ? 'window.loading'
                    : this.isEmptyWindowContent(this.state.contentWindow)
                    ? 'window.new'
                    : 'window.update',
                onClick: (evt) => {
                    this.stopPropagate(evt);
                    this.toggleDialogWindow();
                },
            },
            {
                visible: this.props.map.canEdit === true && get(this.props.map, 'category.name') !== 'DASHBOARD',
                glyph: 'wrench',
                disabled: this.props.map.updating,
                loading: this.props.map.updating,
                tooltipId: 'manager.editMapMetadata',
                onClick: (evt) => {
                    this.stopPropagate(evt);
                    this.onEdit(this.props.map, true);
                },
            },
            {
                visible: !!(this.props.showMapDetails && this.props.map.details && this.props.map.details !== 'NODATA'),
                glyph: 'sheet',
                tooltipId: this.props.tooltips.showDetails,
                onClick: (evt) => {
                    this.stopPropagate(evt);
                    this.onEdit(this.props.map, false);
                    this.props.detailsSheetActions.onToggleDetailsSheet(true);
                },
            },
            {
                visible: !!(this.props.map.canEdit === true && this.props.map.featuredEnabled),
                glyph: isFeatured ? 'star' : 'star-empty',
                bsStyle: isFeatured ? 'success' : 'primary',
                tooltipId: isFeatured ? this.props.tooltips.removeFromFeatured : this.props.tooltips.addToFeatured,
                onClick: (evt) => {
                    this.stopPropagate(evt);
                    this.props.onUpdateAttribute(mapId, 'featured', !isFeatured);
                },
            },
        ];

        availableAction.push({
            visible: this.state.emailOfUser,
            glyph: 'pushpin',
            bsStyle: this.state.iFollowIt ? 'success' : 'primary',
            tooltipId: 'manager.subscribeMail',
            onClick: (evt) => {
                this.stopPropagate(evt);
                this.state.iFollowIt ? this.unfollow() : this.follow();
            },
        });

        return (
            <>
                {this.renderEditWindowDialog(this.props.map)}
                <GridCard
                    className="map-thumb"
                    style={this.getCardStyle()}
                    map={this.props.map}
                    header={this.props.map.title || this.props.map.name}
                    actions={availableAction}
                    onClick={this.onClick}>
                    <div className="map-thumb-description">{this.props.map.description}</div>
                    {this.props.map.icon ? (
                        <div
                            key="icon"
                            style={{
                                width: '20px',
                                height: '20px',
                                margin: '5px 10px',
                                color: 'white',
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                            }}>
                            <FitIcon glyph={this.props.map.icon} />
                        </div>
                    ) : null}
                    <ConfirmModal
                        ref="deleteMapModal"
                        show={this.state ? this.state.displayDeleteDialog : false}
                        onHide={this.close}
                        onClose={this.close}
                        onConfirm={this.onConfirmDelete}
                        titleText={<Message msgId="manager.deleteMap" />}
                        confirmText={<Message msgId="manager.deleteMap" />}
                        cancelText={<Message msgId="cancel" />}
                        body={<Message msgId="manager.deleteMapMessage" />}
                    />
                </GridCard>
            </>
        );
    }

    stopPropagate = (event) => {
        // prevent click on parent container
        const e = event || window.event || {};
        if (e.stopPropagation) {
            e.stopPropagation();
        } else {
            e.cancelBubble = true;
        }
    };

    close = () => {
        // TODO Launch an action in order to change the state
        this.setState({
            displayDeleteDialog: false,
        });
    };

    displayDeleteDialog = () => {
        this.setState({
            displayDeleteDialog: true,
        });
    };
}

module.exports = MapCard;
