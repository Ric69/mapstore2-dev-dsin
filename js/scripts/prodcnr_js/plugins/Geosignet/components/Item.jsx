import React from 'react';
import { Tooltip } from 'react-bootstrap';
import OverlayTrigger from '../../../../MapStore2/web/client/components/misc/OverlayTrigger';

function Item({ currentSelected, signet, selectSignet }) {
    let className =
        ((currentSelected.id !== null && currentSelected.id === signet.id) || (currentSelected.id === null && currentSelected.name === signet.name)
            ? ' selected'
            : '') + (signet.id === null ? ' italic' : '');
    let classStyle = 'layer-collapsed toc-default-layer';

    const tooltip = (
        <Tooltip id="toolbar-geosignet-button">
            <span>{signet.name}</span>
        </Tooltip>
    );

    return (
        <OverlayTrigger overlay={tooltip} placement="right">
            <div key={signet.id} className={classStyle + className}>
                <div className="toc-default-layer-head geosignet-band" style={{ cursor: 'pointer' }} onClick={() => selectSignet(signet)}>
                    <div className="toc-title geosignet-name">{signet.name}</div>
                </div>
            </div>
        </OverlayTrigger>
    );
}

export default Item;
