import fs from 'fs';
import path from 'path';
import { ERR_BAD_REQUEST, ERR_INTERNAL_SERVER_ERROR, CNC_CONFIG_SUBCATEGORY } from '../../constants';
import DataStorage from '../../DataStorage';


/**
 * Get definition
 */
export const getToolListDefinition = (req, res) => {
    const { definitionId } = req.params;
    const name = req.query.name;
    if (!definitionId) {
        res.status(ERR_BAD_REQUEST).send({
            err: 'Parameter "definitionId" is required.'
        });
        return;
    }

    const filePath = path.join(`${DataStorage.configDir}`, CNC_CONFIG_SUBCATEGORY, `${definitionId}.def.json`);

    const data = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(data);
    res.send({ definition: json });
};

export const changeActiveToolListDefinition = (req, res) => {
    const { definitionId } = req.params;
    const name = req.query.name;
    if (!definitionId) {
        res.status(ERR_BAD_REQUEST).send({
            err: 'Parameter "definitionId" is required.'
        });
        return;
    }

    const filePath = path.join(`${DataStorage.configDir}`, CNC_CONFIG_SUBCATEGORY, `${definitionId}.def.json`);
    const activeFilePath = path.join(`${DataStorage.configDir}`, CNC_CONFIG_SUBCATEGORY, 'active.def.json');
    const data = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(data);
    fs.writeFile(activeFilePath, data, 'utf8', (err) => {
        if (err) {
            res.status(ERR_INTERNAL_SERVER_ERROR).send({ err });
        } else {
            res.send({ definition: json });
        }
    });
};

export const getToolDefinitions = (req, res) => {
    const regex = /([A-Za-z0-9_]+).def.json$/;

    const configDir = `${DataStorage.configDir}/${CNC_CONFIG_SUBCATEGORY}`;
    const filenames = fs.readdirSync(configDir);

    // // Load pre-defined definitions first
    const definitions = [];

    for (const filename of filenames) {
        if (regex.test(filename) && filename.substr(0, filename.length - 9) !== 'active') {
            const filePath = path.join(configDir, filename);
            const data = fs.readFileSync(filePath, 'utf8');
            const json = JSON.parse(data);
            definitions.push(json);
        }
    }
    res.send({ definitions });
};
// TODO
export const createToolCategoryDefinition = (req, res) => {
    const { activeToolCategory } = req.body;
    const definitionId = activeToolCategory.definitionId;
    const filename = `${definitionId}.def.json`;

    const destPath = path.join(`${DataStorage.configDir}`, CNC_CONFIG_SUBCATEGORY, filename);

    fs.writeFile(destPath, JSON.stringify(activeToolCategory, null, 2), 'utf8', (err) => {
        if (err) {
            res.status(ERR_INTERNAL_SERVER_ERROR).send({ err });
        } else {
            // load definition using new loader to avoid potential settings override issues
            res.send({ definition: activeToolCategory });
        }
    });
};
export const createToolListDefinition = (req, res) => {
    const { activeToolList } = req.body;
    const newActiveToolDefinition = JSON.parse(JSON.stringify(activeToolList));
    const definitionId = activeToolList.definitionId;
    const filename = `${definitionId}.def.json`;

    const destPath = path.join(`${DataStorage.configDir}`, CNC_CONFIG_SUBCATEGORY, filename);

    fs.writeFile(destPath, JSON.stringify(newActiveToolDefinition, null, 2), 'utf8', (err) => {
        if (err) {
            res.status(ERR_INTERNAL_SERVER_ERROR).send({ err });
        } else {
            // load definition using new loader to avoid potential settings override issues
            res.send({ definition: newActiveToolDefinition });
        }
    });
};
// TODO
export const removeToolCategoryDefinition = (req, res) => {
    const { definitionId } = req.body;

    const filePath = path.join(`${DataStorage.configDir}/${CNC_CONFIG_SUBCATEGORY}`, `${definitionId}.def.json`);
    fs.unlink(filePath, (err) => {
        if (err) {
            res.status(ERR_INTERNAL_SERVER_ERROR).send({ err });
        } else {
            res.send({ status: 'ok' });
        }
    });
};
export const removeToolListDefinition = (req, res) => {
    const { activeToolList } = req.body;
    const definitionId = activeToolList.definitionId;
    const filename = `${definitionId}.def.json`;
    const filePath = path.join(`${DataStorage.configDir}`, CNC_CONFIG_SUBCATEGORY, filename);

    fs.unlink(filePath, (err) => {
        if (err) {
            res.status(ERR_INTERNAL_SERVER_ERROR).send({ err });
        } else {
            res.send({ status: 'ok' });
        }
    });
};

// TODO param changed
export const updateToolDefinition = (req, res) => {
    const { activeToolList } = req.body;
    const filePath = path.join(`${DataStorage.configDir}/${CNC_CONFIG_SUBCATEGORY}`, `${activeToolList.definitionId}.def.json`);
    fs.writeFile(filePath, JSON.stringify(activeToolList, null, 2), 'utf8', (err) => {
        if (err) {
            res.status(ERR_INTERNAL_SERVER_ERROR).send({ err });
        } else {
            // load definition using new loader to avoid potential settings override issues
            res.send({ status: 'ok' });
        }
    });
};

export const uploadToolDefinition = (req, res) => {
    const { uploadName, toolDefinitions } = req.body;
    const readFileSync = fs.readFileSync(`${DataStorage.tmpDir}/${uploadName}`, 'utf-8');
    const obj = JSON.parse(readFileSync);
    const newDefinitionId = uploadName.substr(0, uploadName.length - 9);
    obj.definitionId = newDefinitionId;
    if (!obj.settings) {
        const defaultToolList = toolDefinitions.find((d) => d.definitionId === 'DefaultCVbit');
        obj.settings = defaultToolList.settings;
    }

    if (!obj.category) {
        obj.category = newDefinitionId;
    }
    while (toolDefinitions.find(d => d.definitionId === obj.definitionId)) {
        obj.definitionId = `n${obj.definitionId}`;
    }
    while (toolDefinitions.find(d => d.category === obj.category)) {
        obj.category = `#${obj.category}`;
    }
    // try {
    const newFilePath = path.join(`${DataStorage.configDir}`, CNC_CONFIG_SUBCATEGORY, `${obj.definitionId}.def.json`);
    fs.writeFile(newFilePath, JSON.stringify(obj, null, 2), 'utf8', (err) => {
        if (err) {
            res.status(ERR_INTERNAL_SERVER_ERROR).send({ err });
        } else {
            res.send({ status: 'ok', definition: obj });
        }
    });
    // } catch (e) {
    //     res.status(ERR_INTERNAL_SERVER_ERROR).send({ err: e });
    // }
};
