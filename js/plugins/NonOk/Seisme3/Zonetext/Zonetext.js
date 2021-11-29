import React from 'react';

const zonetext = (props) => {

    return ( 
        <input 
            className = "form-control"
            type = "text"
            id = {props.id}
            onChange = {props.changed}
        />
    );
};

export default zonetext;
