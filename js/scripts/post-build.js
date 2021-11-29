const { replaceFile, deleteFile } = require('./utils');

/**
 * Gestion du fichier js/localConfig.json
 */
const localConfig = 'js/localConfig.json';
replaceFile(localConfig, localConfig + '.old');
deleteFile(localConfig + '.old');

/**
 * Gestion du fichier ./config.json
 */
const mapLocalConfig = './config.json';
replaceFile(mapLocalConfig, mapLocalConfig + '.old');
deleteFile(mapLocalConfig + '.old');
/**
 * Gestion du fichier ./config.json
 */
// const extLocalConfig = './extensions.json';
// replaceFile(extLocalConfig, extLocalConfig + '.old');
// deleteFile(extLocalConfig + '.old');

/**
 * Gestion du fichier web/src/main/resources/geostore-datasource-ovr.properties
 */
const geostoreDatasourceLocalConfig = 'web/src/main/resources/geostore-datasource-ovr.properties';
replaceFile(geostoreDatasourceLocalConfig, geostoreDatasourceLocalConfig + '.old');
deleteFile(geostoreDatasourceLocalConfig + '.old');

/**
 * Gestion du fichier web/src/main/resources/geostore-spring-security.xml
 */
const geostoreSpringSecurityLocalConfig = 'web/src/main/resources/geostore-spring-security.xml';
replaceFile(geostoreSpringSecurityLocalConfig, geostoreSpringSecurityLocalConfig + '.old');
deleteFile(geostoreSpringSecurityLocalConfig + '.old');

/**
 * Gestion du fichier web/src/main/resources/sample_users.xml
 */
const geostoreSpringSecuritySampleUsers = 'web/src/main/resources/sample_users.xml';
replaceFile(geostoreSpringSecuritySampleUsers, geostoreSpringSecuritySampleUsers + '.old');
deleteFile(geostoreSpringSecuritySampleUsers + '.old');