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
 * Gestion du fichier ./extensions.json
 */
// const extLocalConfig = './extensions.json';
// const extRunConfig = directory.join('/') + '/extensions.json';

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

/**
 * Gestion du fichier web/src/main/resources/sample_users.xml
 */
const geostoreSpringSecuritySampleUsers = 'web/src/main/resources/sample_users.xml';
const geostoreSpringSecurityRunSampleUsers= directory.join('/') + '/sample_users.xml';


// if (fileExists(runConfig) && fileExists(mapRunConfig) && fileExists(extRunConfig) && fileExists(geostoreDatasourceRunConfig) && fileExists(geostoreSpringSecurityRunConfig) && fileExists(geostoreSpringSecurityRunSampleUsers)) {
if (fileExists(runConfig) && fileExists(mapRunConfig) && fileExists(geostoreDatasourceRunConfig) && fileExists(geostoreSpringSecurityRunConfig) && fileExists(geostoreSpringSecurityRunSampleUsers)) {
    createOldVersionOfFile(localConfig);
    updateJSONFile(localConfig, runConfig);

    createOldVersionOfFile(mapLocalConfig);
    replaceFile(mapLocalConfig, mapRunConfig);

    // createOldVersionOfFile(extLocalConfig);
    // replaceFile(extLocalConfig, extRunConfig);

    createOldVersionOfFile(geostoreDatasourceLocalConfig);
    replaceFile(geostoreDatasourceLocalConfig, geostoreDatasourceRunConfig);

    createOldVersionOfFile(geostoreSpringSecurityLocalConfig);
    replaceFile(geostoreSpringSecurityLocalConfig, geostoreSpringSecurityRunConfig);

    createOldVersionOfFile(geostoreSpringSecuritySampleUsers);
    replaceFile(geostoreSpringSecuritySampleUsers, geostoreSpringSecurityRunSampleUsers);
} else {
    console.error('Un fichier de configuration n\'existe pas !');
    return;
}
