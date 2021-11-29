import React from 'react';
import PropTypes from 'prop-types';

class SampletoContainer extends React.Component {
    static propTypes = {
        items: PropTypes.array
    };
    renderItems = () => {
        return this.props.items.map(item => {
            const Item = item.plugin; // item.plugin is the plugin ReactJS component
            return <Item id={item.id} name={item.name} />;
        });
    };

    render() {
        const style = { zIndex: 1000, border: "solid black 1px", width: "200px", height: "200px", position: "absolute", top: "50px", left: "300px", zIndex: 1000000,};
        return <div style={style}>Container component : {this.renderItems()}</div>;
    }
}

export const ContainerPlugin = SampletoContainer;