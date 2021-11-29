import React, {Component,  useState, useEffect, useReducer, useContext } from 'react';

import { Glyphicon } from "react-bootstrap";
import { zoomToPoint } from '../../../MapStore2/web/client/actions/map';
import mapReducer from '../../../MapStore2/web/client/reducers/map';

export default () => {
     // map state: center and zoom
    const [map, dispatch] = useReducer(mapReducer, {
        center: { x: 4.5, y: 43.5, crs: 'EPSG:4326' },
        zoom: 13
    });

    useEffect() => {
        dispatch(zoomToPoint({ x: 4.5, y: 43.5 }, 15, 'EPSG:4326'));
    };

    return (
        <>
            {/* <button onClick={() => dispatch(changeZoomLevel(map.zoom + 1))}>Zoom In</button> */}
            <button className="btn btn-info" data-toggle="tooltip" data-placement="top" id="zoomseisme" title="zoom emprise carte" onClick={(center, zoom) => {
                dispatch(zoomToPoint({
                    x: center.x,
                    y: center.y
                }, zoom, center.crs));
            }}>
                    &nbsp;<Glyphicon glyph="globe" />&nbsp;
            </button>
        </>
    );



};
