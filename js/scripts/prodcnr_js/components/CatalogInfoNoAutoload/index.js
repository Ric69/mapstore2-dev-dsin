const React = require('react');

require('./style.css');

const CatalogInfoNoAutoload = ({ content, buttonPlus }) => {
    return (
        <div id="CatalogInfoNoAutoload">
            <p>{content.title}</p>
            <ul>
                {content.list.map((element) => (
                    <li>{element}</li>
                ))}
            </ul>
            <p>{content.content}</p>
            <p>{content.content2}</p>
            <p className="lastElement">
                {content.footer} {buttonPlus}
            </p>
        </div>
    );
};

module.exports = CatalogInfoNoAutoload;
