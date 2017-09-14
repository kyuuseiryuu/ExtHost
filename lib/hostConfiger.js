const shell = require('shelljs');
const path = require('path');
const fs = require('fs');
const config = require('../config');
const pathname = config.pathname;
const listFile = path.join(config.pathname, '.list.json');
const usingFile = path.join(config.pathname, '.using.json');
const bootFile = path.join(config.pathname, '.boot.json');
const configLoader = require('./configLoader');

const mkBaseDirIfNotExits = () => {
    if (fs.existsSync(pathname)) return;
    fs.mkdirSync(pathname);
};

const getList = () => {
    const list = fs.existsSync(listFile) ? require(listFile) : {};
    const using = fs.existsSync(usingFile) ? require(usingFile) : {};
    let str = '';
    Object.keys(list).forEach((item) => {
        str += `${using[item] ? '* ' : '  '}${item} -> ${list[item].type}: `;
        str += `${new Date(list[item].time).toISOString().substr(0, 19).replace('T', ' ')}`;
        str += '\n';
    });
    if (!str) {
        str = 'Empty list!\n';
    }
    return str
};

const joinToList = (configName, type) => {
    const listFile = path.join(config.pathname, '.list.json');
    let list = fs.existsSync(listFile) ? require(listFile) : {};
    list[configName] = { time: Date.now(), type };
    fs.writeFileSync(listFile, JSON.stringify(list));
};

const removeFromList = (configName) => {
    const listFile = path.join(config.pathname, '.list.json');
    let list = fs.existsSync(listFile) ? require(listFile) : {};
    delete list[configName];
    fs.writeFileSync(listFile, JSON.stringify(list));
};

const buildConfig = (configName, init) => {
    mkBaseDirIfNotExits();
    const fullFileName = `${pathname}/${configName}${config.suffix}`;
    if (fs.existsSync(fullFileName)) {
        console.log(`The \'${configName}\' config already exist.`);
        return false;
    }
    fs.writeFileSync(fullFileName, JSON.stringify(init));
    joinToList(configName, 'create');
    return true;
};

const removeConfig = (configName) => {
    mkBaseDirIfNotExits();
    const fullFileName = `${pathname}/${configName}${config.suffix}`;
    if (fs.existsSync(fullFileName)) {
        fs.unlinkSync(fullFileName);
        removeFromList(configName);
    }
};

const saveConfig = (configName, ipHosts) => {
    const fullFileName = `${pathname}/${configName}${config.suffix}`;
    const set = {};
    const data = {};
    Object.keys(ipHosts).forEach((ip) => {
        const hosts = [];
        ipHosts[ip].forEach((host) => {
           if (set[host]) return;
           set[host] = true;
           hosts.push(host);
        });
        data[ip] = hosts;
    });
    fs.writeFileSync(fullFileName, JSON.stringify(data));
    joinToList(configName, 'update');
    return true;
};

const createUseFile = (nameArray, isNotUse, isOverwrite) => {
    let set = {};
    if (fs.existsSync(usingFile) && !isOverwrite) {
        set = require(usingFile);
    }
    if (isNotUse) {
        nameArray.forEach((name) => {
            delete set[name];
        });
    } else {
        nameArray.forEach((name) => {
            set[name] = Date.now();
        });
    }
    const array = Object.keys(set);
    fs.writeFileSync(usingFile, JSON.stringify(set));
    fs.writeFileSync(bootFile, JSON.stringify({ use: array }));
};

const apply = ()=> {
    const loader = new configLoader({
        loadFile(filename) {
            const fullFilename = path.join(config.pathname, `${filename}${config.suffix}`);
            if (fs.existsSync(fullFilename)) {
                return require(fullFilename);
            }
            return {};
        }
    });
    return loader.loadConfig(require(bootFile));
};

const loadFromFile = (fullPathName) => {
    if (!fs.existsSync(fullPathName))  return;
    const data = require(fullPathName);
    const name = path.basename(fullPathName, '.json');
    buildConfig(name, JSON.stringify(data));
};

const exportToPath = (pathname) => {
    shell.exec(`rm -rf ${pathname} && cp -R ${config.pathname} ${pathname}`);
    console.log('Completed!');
};

module.exports = {
    getList,
    buildConfig,
    removeConfig,
    saveConfig,
    createUseFile,
    apply,
    loadFromFile,
    exportToPath,
};