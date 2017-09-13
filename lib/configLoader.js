class ConfigLoader {
    constructor (props = {}) {
        const { loadFile } = props;
        if (!loadFile || loadFile.constructor !== Function) {
            throw 'Oh, Must have loadFile function';
        }
        this.loadFile = loadFile;
    }
    loadConfig(config) {
        let strings = '';
        const keys = Object.keys(config);
        const me = this;
        keys.forEach(function (key) {
            if (key === 'use') {
                strings += me.loadParentConfig(config['use']);
            } else {
                strings += me.buildLine(config, key);
            }
        });
        return strings;
    }

    loadParentConfig(uses) {
        let str = '';
        if (uses.constructor === Array) {
            uses.forEach((use) => {
                const cfg = this.loadFile(use);
                str += this.loadConfig(cfg);
            });
        } else {
            const cfg = this.loadFile(uses);
            str += this.loadConfig(cfg);
        }
        return str;
    }

    buildLine(config, key) {
        let str = '';
        const record = config[key];
        if (record.constructor === Array) {
            record.forEach((hostname) => {
                str += this.getLine(key, hostname);
            });
        } else {
            str += this.getLine(key, record);
        }
        return str;
    }

    getLine(ip, hostname) {
        return `${ip}\t\t${hostname}\n`;
    }
}

module.exports = ConfigLoader;