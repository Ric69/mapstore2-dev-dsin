const React = require('react');
const PropTypes = require('prop-types');
const GeoStoreApi = require('../../../../MapStore2/web/client/api/GeoStoreDAO');
const LocaleUtils = require('../../../../MapStore2/web/client/utils/LocaleUtils');
const Header = require('../../../../MapStore2/web/client/components/TOC/Header');
const Toolbar = require('./GeoSignetToolbar');
const GeosignetList = require('./GeosignetList');
const Group = require('./Group').default;

require('./style.css');

class Geosignet extends React.Component {
    static propTypes = {
        addGeoSignet: PropTypes.func,
        addGroup: PropTypes.func,
        admin: PropTypes.bool,
        updateGeoSignet: PropTypes.func,
        deleteGeoSignet: PropTypes.func,
        selectSignet: PropTypes.func,
        geosignets: PropTypes.array,
        group: PropTypes.array,
        loggedIn: PropTypes.bool,
        map: PropTypes.object,
        onFilter: PropTypes.func,
        filterText: PropTypes.string,
        selectedSignet: PropTypes.object,
        userName: PropTypes.string,
    };

    static contextTypes = {
        messages: PropTypes.object,
    };

    static defaultProps = {
        addGeoSignet: () => {},
        addGroup: () => {},
        admin: false,
        updateGeoSignet: () => {},
        deleteGeoSignet: () => {},
        selectSignet: () => {},
        onFilter: () => {},
        geosignets: [],
        group: [],
        loggedIn: false,
        map: {},
        filterText: '',
        selectedSignet: {},
        userName: null,
    };

    state = {
        selectedGroup: undefined,
    };

    selectGeoSignet = (signet) => {
        if (!signet.map) {
            GeoStoreApi.getData(signet.id).then((data) => {
                let s = {
                    id: signet.id,
                    name: signet.name,
                    map: data,
                };
                return [this.props.selectSignet(s), this.props.updateGeoSignet(s.name, s.id, s.map)];
            });
        } else {
            return this.props.selectSignet(signet);
        }
    };

    createGeosignet = (title, group) => {
        this.props.addGeoSignet(title, group, this.props.map, this.props.userName);
    };

    addGroup = (title) => {
        this.props.addGroup(title, this.props.map);
    };

    removeGeosignet = (signet) => {
        this.props.deleteGeoSignet(signet.name, signet.id);
    };

    deleteGroup = (id) => {
        this.setState({ selectedGroup: id });
    };

    deleteGroupAndSignets = (id) => {
        this.props.deleteGroup(id, this.props.geosignets.filter((s) => id === parseInt(s.groupId)).map((s) => s.id));
    };

    isOwnerOrAdmin = () => this.props.admin || (this.props.loggedIn && this.props.map && this.props.map.info && this.props.map.info.canEdit);

    render() {
        return (
            <div>
                <Header
                    title={LocaleUtils.getMessageById(this.context.messages, 'geosignet.title')}
                    onFilter={this.props.onFilter}
                    filterText={this.props.filterText}
                    filterPlaceholder={LocaleUtils.getMessageById(this.context.messages, 'geosignet.filter')}
                    toolbar={
                        <Toolbar
                            isOwnerOrAdmin={this.isOwnerOrAdmin()}
                            addGeoSignet={this.createGeosignet}
                            addGroup={this.addGroup}
                            deleteGeoSignet={this.removeGeosignet}
                            selectedSignet={this.props.selectedSignet}
                            selectedGroup={this.state.selectedGroup}
                            deleteGroup={this.deleteGroupAndSignets}
                            map={this.props.map}
                            editEnabled={this.props.map && !!this.props.map.mapId && !!this.props.userName}
                            group={this.props.group}
                        />
                    }
                />
                <div id="listGroup">
                    {this.props.group
                        .filter((g) => !!g.id)
                        .map((g) => (
                            <Group name={g.name} id={g.id} deleteGroup={this.deleteGroup} isOwnerOrAdmin={this.isOwnerOrAdmin()}>
                                <GeosignetList
                                    selectSignet={this.selectGeoSignet}
                                    geosignets={this.props.geosignets
                                        .filter((s) => g.id === parseInt(s.groupId))
                                        .sort((a, b) => {
                                            const nameA = a.name.toLowerCase(),
                                                nameB = b.name.toLowerCase();
                                            if (nameA < nameB) return -1;
                                            if (nameA > nameB) return 1;
                                            return 0;
                                        })}
                                    currentSelected={this.props.selectedSignet}
                                />
                            </Group>
                        ))}
                    <Group name={LocaleUtils.getMessageById(this.context.messages, 'geosignet.group.default')}>
                        <GeosignetList
                            selectSignet={this.selectGeoSignet}
                            geosignets={this.props.geosignets
                                .filter((s) => typeof s.groupId === undefined || s.groupId === null || s.groupId === undefined || isNaN(s.groupId))
                                .sort((a, b) => {
                                    const nameA = a.name.toLowerCase(),
                                        nameB = b.name.toLowerCase();
                                    if (nameA < nameB) return -1;
                                    if (nameA > nameB) return 1;
                                    return 0;
                                })}
                            currentSelected={this.props.selectedSignet}
                        />
                    </Group>
                </div>
            </div>
        );
    }
}

module.exports = Geosignet;
