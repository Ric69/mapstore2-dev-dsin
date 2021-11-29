/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const { Grid, Row, Col } = require('react-bootstrap');
const Spinner = require('react-spinkit');
const LocaleUtils = require('@mapstore/utils/LocaleUtils');
const MapCard = require('./MapCard');

class MapGrid extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        panelProps: PropTypes.object,
        bottom: PropTypes.node,
        loading: PropTypes.bool,
        showMapDetails: PropTypes.bool,
        maps: PropTypes.array,
        currentMap: PropTypes.object,
        fluid: PropTypes.bool,
        viewerUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
        mapType: PropTypes.string,
        colProps: PropTypes.object,
        // CALLBACKS
        updateMapMetadata: PropTypes.func,
        editMap: PropTypes.func,
        attributeUpdated: PropTypes.func,
        saveAll: PropTypes.func,
        saveMap: PropTypes.func,
        onDisplayMetadataEdit: PropTypes.func,
        removeThumbnail: PropTypes.func,
        errorCurrentMap: PropTypes.func,
        updateCurrentMap: PropTypes.func,
        detailsSheetActions: PropTypes.object,
        createThumbnail: PropTypes.func,
        deleteThumbnail: PropTypes.func,
        deleteMap: PropTypes.func,
        resetCurrentMap: PropTypes.func,
        updatePermissions: PropTypes.func,
        metadataModal: PropTypes.func,
        onUpdateAttribute: PropTypes.func,
        title: PropTypes.node,
        className: PropTypes.string,
        style: PropTypes.object,
        userEmail: PropTypes.string,
    };

    static defaultProps = {
        id: 'mapstore-maps-grid',
        mapType: 'leaflet',
        bottom: '',
        fluid: true,
        colProps: {
            xs: 12,
            sm: 6,
        },
        currentMap: {},
        maps: [],
        // CALLBACKS
        onChangeMapType: function() {},
        updateMapMetadata: () => {},
        detailsSheetActions: {
            onBackDetails: () => {},
            onUndoDetails: () => {},
            onToggleDetailsSheet: () => {},
            onToggleGroupProperties: () => {},
            onToggleUnsavedChangesModal: () => {},
            onsetDetailsChanged: () => {},
            onUpdateDetails: () => {},
            onDeleteDetails: () => {},
            onSaveDetails: () => {},
        },
        createThumbnail: () => {},
        deleteThumbnail: () => {},
        errorCurrentMap: () => {},
        saveAll: () => {},
        onDisplayMetadataEdit: () => {},
        updateCurrentMap: () => {},
        deleteMap: () => {},
        saveMap: () => {},
        removeThumbnail: () => {},
        editMap: () => {},
        attributeUpdated: () => {},
        resetCurrentMap: () => {},
        updatePermissions: () => {},
        groups: [],
        onUpdateAttribute: () => {},
        onSuccess: () => {},
        onWarning: () => {},
        className: '',
        style: {},
    };

    static contextTypes = {
        messages: PropTypes.object,
    };

    renderMaps = (maps, mapType) => {
        const viewerUrl = this.props.viewerUrl;
        return maps.map((map) => {
            let children = React.Children.count(this.props.children);
            return children === 1 ? (
                React.cloneElement(React.Children.only(this.props.children), { viewerUrl, key: map.id, mapType, map })
            ) : (
                <Col key={map.id} {...this.props.colProps}>
                    <MapCard
                        viewerUrl={viewerUrl}
                        mapType={mapType}
                        map={map}
                        userEmail={this.props.userEmail}
                        onEdit={this.props.editMap}
                        onAttributeUpdate={this.props.attributeUpdated}
                        showMapDetails={this.props.showMapDetails}
                        detailsSheetActions={this.props.detailsSheetActions}
                        onMapDelete={this.props.deleteMap}
                        onUpdateAttribute={this.props.onUpdateAttribute}
                        follow={this.props.follow}
                        unfollow={this.props.unfollow}
                        onSuccess={this.props.onSuccess}
                        onWarning={this.props.onWarning}
                        widgets={this.props.widgets}
                    />
                </Col>
            );
        });
    };

    renderLoading = () => {
        return (
            <div style={{ width: '150px', overflow: 'visible', margin: 'auto' }}>
                {LocaleUtils.getMessageById(this.context.messages, 'loading')}
                <Spinner spinnerName="circle" noFadeIn overrideSpinnerClassName="spinner" />
            </div>
        );
    };

    renderMetadataModal = () => {
        if (this.props.metadataModal) {
            let MetadataModal = this.props.metadataModal;
            return (
                <MetadataModal
                    key="metadataModal"
                    ref="metadataModal"
                    show={this.props.currentMap && this.props.currentMap.displayMetadataEdit}
                    map={this.props.currentMap}
                    onSaveAll={this.props.saveAll}
                    onSave={this.props.saveMap}
                    onResetCurrentMap={this.props.resetCurrentMap}
                    onRemoveThumbnail={this.props.removeThumbnail}
                    onDisplayMetadataEdit={this.props.onDisplayMetadataEdit}
                    onDeleteThumbnail={this.props.deleteThumbnail}
                    detailsSheetActions={this.props.detailsSheetActions}
                    onCreateThumbnail={this.props.createThumbnail}
                    onErrorCurrentMap={this.props.errorCurrentMap}
                    onUpdateCurrentMap={this.props.updateCurrentMap}
                />
            );
        }
    };

    render() {
        return (
            <Grid id={this.props.id} fluid={this.props.fluid} className={'ms-grid-container ' + this.props.className} style={this.props.style}>
                {this.props.title && <Row>{this.props.title}</Row>}
                <Row className="ms-grid">
                    {this.props.loading && this.props.maps.length === 0
                        ? this.renderLoading()
                        : this.renderMaps(this.props.maps || [], this.props.mapType)}
                </Row>
                {this.props.bottom}
                {this.renderMetadataModal()}
            </Grid>
        );
    }
}

module.exports = MapGrid;
