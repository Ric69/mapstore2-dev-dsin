// Geometries
var point = new ol.geom.Point(
    ol.proj.transform([3,50], 'EPSG:4326', 'EPSG:3857')
);
var circle = new ol.geom.Circle(
    ol.proj.transform([2.1833, 41.3833], 'EPSG:4326', 'EPSG:3857'),
    1000000
);

// Features
var pointFeature = new ol.Feature(point);
var circleFeature = new ol.Feature(circle);

// Source and vector layer
var vectorSource = new ol.source.Vector({
    projection: 'EPSG:4326'
});
vectorSource.addFeatures([pointFeature, circleFeature]);

var vectorLayer = new ol.layer.Vector({
    source: vectorSource
});
var ptfeature = new ol.Feature(point);

var circleFeature = new ol.Feature(circle);

 // Create feature overlay
 var featureOverlay = new ol.FeatureOverlay({
    map: map,
    features: [circleFeature,ptfeature],
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(100, 210, 50, 0.3)'
        }),
        stroke: new ol.style.Stroke({
            width: 4,
            color: 'rgba(100, 200, 50, 0.8)'
        })
    })
});
map.addLayer(featureOverlay);