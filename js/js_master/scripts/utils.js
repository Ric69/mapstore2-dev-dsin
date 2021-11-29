const fs = require('fs');
const assign = require('object-assign');

/**
 * Vérifie l'existance d'une fichier
 * @param path
 * @returns {boolean}
 */
const fileExists = (path) => fs.existsSync(path);

/**
 * Permet de supprimer un fichier
 * @param {String} path Le chemin du fichier à supprimer
 */
const deleteFile = (path) => {
    if (fileExists(path)) {
        fs.unlinkSync(path);
    }
};

/**
 * Permet de créer une version .old du fichier
 * @param {*} path  Le chemin du fichier
 */
const createOldVersionOfFile = (path) => {
    deleteFile(path + '.old');
    fs.copyFileSync(path, path + '.old');
};

/**
 * Récupération d'un fichier
 * @param {String} path Le chemin pour y accéder
 * @return {*} Le fichier
 */
const getFile = (path) => {
    return fs.readFileSync(path);
};

/**
 * Permet d'insérer le contenu du second fichier dans  le premier fichier
 * @param {String} first Le chemin du premier fichier
 * @param {String} second Le chemin du second fichier
 */
const replaceFile = (first, second) => {
    const secondFile = getFile(second);

    fs.writeFileSync(first, secondFile, 'utf-8');
};

/**
 * Les nouveautés du second fichier viennent mettre à jour le premier fichier
 * @param {String} firstPath Le premier chemin de fichier. C'est ce fichier qui va être modifié
 * @param {String} secondPath Le second chemin de fichier. Il va permettre la mise à jour.
 */
const updateJSONFile = (firstPath, secondPath) => {
    const firstFileJSON = JSON.parse(getFile(firstPath));
    const secondFileJSON = JSON.parse(getFile(secondPath));

    const firstPathName = firstPath.split('/').reverse()[0];
    const secondPathName = firstPath.split('/').reverse()[0];

    /**
     * Petit hack pour mettre à jour les plugins
     * Différence de cfg sur le plugin StyleEditor
     */
    if (firstPathName === 'localConfig.json' && secondPathName === 'localConfig.json') {
        if (secondFileJSON.rasterOptions) {
            secondFileJSON.rasterOptions = assign(
                {},
                firstFileJSON.rasterOptions,
                secondFileJSON.rasterOptions
            );
        }

        if (secondFileJSON.plugins && secondFileJSON.plugins.desktop) {
            /**
             * On stocke dans une variable puis on supprime la clé plugins pour éviter un override
             */
            const productionAddPlugins = secondFileJSON.plugins.desktop;
            delete secondFileJSON.plugins.desktop;
            delete secondFileJSON.plugins;

            /**
             * On filtre sur le plugin StyleEditor qui a une configuration différente en production
             */
            let allPlugins = firstFileJSON.plugins.desktop.filter((plugin) => {
                if (!(plugin === 'StyleEditor' || (plugin.name && plugin.name === 'StyleEditor'))) {
                    return plugin;
                }

                return false;
            });

            /**
             * Ajout des plugins modifié pour la production
             */
            if (productionAddPlugins) {
                productionAddPlugins.map((addPlugin) => {
                    allPlugins.push(addPlugin);
                });
            }

            firstFileJSON.plugins.desktop = allPlugins;
        }
    }
    const newObject = assign({}, firstFileJSON, secondFileJSON);

    fs.writeFileSync(firstPath, JSON.stringify(newObject, undefined, 2), 'utf-8');
};

module.exports = {
    createOldVersionOfFile,
    deleteFile,
    fileExists,
    getFile,
    replaceFile,
    updateJSONFile,
};
