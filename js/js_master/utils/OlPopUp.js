/**
 * @author Capgemini
 */
require('./olPopUp.css');

let popUp = () => {
    let pop = document.createElement('div');
    pop.setAttribute('class', 'ol-popup');
    pop.setAttribute('id', 'mypopup');
    let popDismis = document.createElement('a');
    popDismis.setAttribute('id', 'close-popup');
    popDismis.setAttribute('class', 'ol-popup-close-btn');
    popDismis.setAttribute('href', '#close');
    popDismis.innerHTML = 'x';
    let popCntWrap = document.createElement('div');
    popCntWrap.setAttribute('class', 'ol-popup-cnt-wrapper');
    let popCnt = document.createElement('div');
    popCnt.setAttribute('class', 'ol-popup-cnt');
    popCnt.setAttribute('id', 'ol-popup-cnt');
    popCntWrap.appendChild(popCnt);
    let popTipWrap = document.createElement('div');
    popTipWrap.setAttribute('class', 'ol-popup-tip-wrapper');
    let popTip = document.createElement('div');
    popTip.setAttribute('class', 'ol-popup-tip');
    popTipWrap.appendChild(popTip);
    pop.appendChild(popDismis);
    pop.appendChild(popCntWrap);
    pop.appendChild(popTipWrap);

    return pop;
};

export default popUp();
