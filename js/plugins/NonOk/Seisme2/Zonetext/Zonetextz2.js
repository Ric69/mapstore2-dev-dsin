import React from 'react';

const zonetextz2 = (props) => {
    const style = {
        padding: '16px',
        margin: '16px',
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#0000ff',
        textAlign: 'center'
    };

    return ( 
        <div style={style}>
            {props.z2}
        </div>
    );
};

export default zonetextz2;