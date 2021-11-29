const { createOldVersionOfFile, fileExists, updateJSONFile, replaceFile } = require('./utils');

const args = process.argv.slice(2);
const directory = ['js', 'scripts'];
if (['qualif', 'production'].includes(args[0])) {
    directory.push(args[0]);
} else {
    console.error('Argument en erreur.');
    return;
}

/**
 * Gestion du fichier js/localConfig.json
 */
const localConfig = 'js/localConfig.json';
const runConfig = directory.join('/') + '/localConfig.json';

/**
 * Gestion du fichier ./config.json
 */
const mapLocalConfig = './config.json';
const mapRunConfig = directory.join('/') + '/config.json';

/**
 * Gestion du fichier web/src/main/resources/geostore-datasource-ovr.properties
 */
const geostoreDatasourceLocalConfig = 'web/src/main/resources/geostore-datasource-ovr.properties';
const geostoreDatasourceRunConfig = directory.join('/') + '/geostore-datasource-ovr.properties';

/**
 * Gestion du fichier web/src/main/resources/geostore-spring-security.xml
 */
const geostoreSpringSecurityLocalConfig = 'web/src/main/resources/geostore-spring-security.xml';
const geostoreSpringSecurityRunConfig = directory.join('/') + '/geostore-spring-security.xml';

if (fileExists(runConfig) && fileExists(mapRunConfig) && fileExists(geostoreDatasourceRunConfig) && fileExists(geostoreSpringSecurityRunConfig)) {
    createOldVersionOfFile(localConfig);
    updateJSONFile(localConfig, runConfig);

    createOldVersionOfFile(mapLocalConfig);
    replaceFile(mapLocalConfig, mapRunConfig);

    createOldVersionOfFile(geostoreDatasourceLocalConfig);
    replaceFile(geostoreDatasourceLocalConfig, geostoreDatasourceRunConfig);

    createOldVersionOfFile(geostoreSpringSecurityLocalConfig);
    replaceFile(geostoreSpringSecurityLocalConfig, geostoreSpringSecurityRunConfig);
} else {
    console.error('Un fichier de configuration n\'existe pas !');
    return;
}
