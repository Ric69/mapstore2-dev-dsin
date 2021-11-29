import './style.css';

import { Button, Glyphicon } from 'react-bootstrap';

import PropTypes from 'prop-types';
import React from 'react';

class GroupGeoSignets extends React.PureComponent {
    static propTypes = {
        currentSelected: PropTypes.object,
        geosignets: PropTypes.array,
        id: PropTypes.number,
        isOwnerOrAdmin: PropTypes.boolean,
        deleteGroup: PropTypes.func,
    };

    static defaultProps = {
        currentSelected: {},
        geosignets: [],
        id: undefined,
        isOwnerOrAdmin: false,
        deleteGroup: () => {},
    };

    state = {
        display: true,
    };

    toggleChildren = () => {
        this.setState({ display: !this.state.display });
    };

    render() {
        return (
            <div id="GroupGeoSignets">
                <div className="toolbar">
                    <div className="title">{this.props.name}</div>
                    <Glyphicon
                        glyph={this.state.display ? 'folder-open' : 'folder-close'}
                        className="toc-status-icon"
                        onClick={this.toggleChildren}
                    />
                    {this.props.id && this.props.isOwnerOrAdmin && (
                        <Glyphicon glyph={'remove'} className="toc-status-icon" onClick={() => this.props.deleteGroup(this.props.id)} />
                    )}
                </div>
                {this.state.display && this.props.children}
            </div>
        );
    }
}

export default GroupGeoSignets;
