const zip = require('./zip');
const { downloadCanvasDataURL } = require('../../../../MapStore2/web/client/utils/FileUtils');

module.exports = (gj, options) => {
    zip(gj, options).then((content) => {
        const date = new Date();
        downloadCanvasDataURL(
            'data:application/zip;charset=utf-8;base64,' + content,
            options.zipName ||
                `CNRMaps-${date.getFullYear()}-${
                    date.getMonth() < 9 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
                }-${
                    date.getDate() < 9 ? '0' + date.getDate() : date.getDate()
                }-${date.getHours()}${date.getMinutes()}${date.getSeconds()}.zip`
        );
    });
};
