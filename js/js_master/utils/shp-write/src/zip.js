var write = require('./write'),
    geojson = require('./geojson'),
    prj = require('./prj'),
    JSZip = require('jszip');

module.exports = function(gj, options) {
    const zip = new JSZip(),
        layers = zip.folder(options && options.folder ? options.folder : 'layers');

    [
        geojson.point(gj),
        geojson.multipoint(gj),
        geojson.line(gj),
        geojson.multiline(gj),
        geojson.polygon(gj),
        geojson.multipolygon(gj),
    ].forEach((l) => {
        if (l.geometries.length && l.geometries[0].length) {
            write(
                // field definitions
                l.properties,
                // geometry type
                l.type,
                // geometries
                l.geometries,
                function(err, files) {
                    const fileName =
                        options && options.types[l.type.toLowerCase()]
                            ? options.types[l.type.toLowerCase()]
                            : l.type;
                    layers.file(fileName + '.shp', files.shp.buffer, { binary: true });
                    layers.file(fileName + '.shx', files.shx.buffer, { binary: true });
                    layers.file(fileName + '.dbf', files.dbf.buffer, { binary: true });
                    layers.file(fileName + '.prj', prj[options.projection]);
                }
            );
        }
    });

    let generateOptions = { compression: 'STORE', type: 'base64' };

    if (!process.browser) {
        generateOptions.type = 'nodebuffer';
    }

    return zip.generateAsync(generateOptions);
};
