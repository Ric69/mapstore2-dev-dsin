/**
 * @author CapGemini
 * Utilities to show the attributes (IMAGES, VIDEOS AND AUTRES)
 */

const React = require('react');
const { isString, isArray } = require('lodash');
const ReactDOMServer = require('react-dom/server');
const iconVid = require('./images/iconVid.png');

const AttributeUtils = {
    renderProperty: (prop) => {
        if (isString(prop)) {
            return prop;
        }
        return JSON.stringify(prop);
    },
    renderAutreProperty: (prop, renderToString) => {
        if (isArray(prop)) {
            let arr = prop.map((elt, idx) => {
                let content = (
                    <a key={idx} target="_blank" href={elt} style={{ margin: 4 }}>
                        {`Lien ${idx + 1}`}
                    </a>
                );
                return renderToString ? ReactDOMServer.renderToString(content) : content;
            });
            return renderToString ? arr.join('') : arr;
        }
    },
    renderImageProperty: (prop, renderToString) => {
        if (isArray(prop)) {
            let arr = prop.map((elt, idx) => {
                let content = (
                    <a target="_blank" href={elt} key={idx}>
                        <img
                            src={elt}
                            alt=""
                            style={{
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                padding: '5px',
                                maxWidth: '300px',
                                display: 'block',
                                margin: 'auto',
                            }}
                        />
                    </a>
                );
                return renderToString ? ReactDOMServer.renderToString(content) : content;
            });
            return renderToString ? arr.join('') : arr;
        }
    },
    renderVideoProperty: (prop, renderToString) => {
        if (isArray(prop)) {
            let arr = prop.map((elt, idx) => {
                let content = (
                    <a key={idx} target="_blank" href={elt} style={{ margin: 4 }}>
                        <img
                            src={iconVid}
                            alt={`Lien ${idx + 1}`}
                            border="0"
                            width="50"
                            height="50"
                        />
                    </a>
                );
                return renderToString ? ReactDOMServer.renderToString(content) : content;
            });
            return renderToString ? arr.join('') : arr;
        }
    },
    renderImageData: (data, renderToString) => {
        if (!!data) {
            let dataimg = data.startsWith('data:image/') ? data : 'data:image/jpg;base64,' + data;
            let content = (
                <img
                    src={dataimg}
                    onClick={() => {
                        var image = new Image();
                        image.src = dataimg;
                        image.style = 'max-width: 100%; max-height: 100%;';
                        var w = window.open('');
                        w.document.write(image.outerHTML);
                    }}
                    alt=""
                    style={{
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        padding: '5px',
                        width: '150px',
                        display: 'block',
                        margin: 'auto',
                    }}
                />
            );
            return renderToString ? ReactDOMServer.renderToString(content) : content;
        }
    },
};

module.exports = AttributeUtils;
