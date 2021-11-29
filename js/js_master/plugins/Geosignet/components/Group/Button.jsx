import { Button, Glyphicon } from 'react-bootstrap';

import PropTypes from 'prop-types';
import React from 'react';

class GroupButton extends React.Component {
    static propTypes = {
        onClick: PropTypes.func,
        disabled: PropTypes.bool,
    };

    static defaultProps = {
        onClick: () => {},
        disabled: true,
    };

    render() {
        return (
            <Button key="addGroup" bsStyle="primary" bsSize="small" onClick={this.props.onClick} disabled={this.props.disabled}>
                <Glyphicon glyph="folder-open" />
            </Button>
        );
    }
}

export default GroupButton;
