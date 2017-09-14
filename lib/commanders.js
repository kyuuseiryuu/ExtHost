const path = require('path');
const clear = require('clear');
const hostConfiger = require('./hostConfiger');
const hosts2Config = require('./hosts2Config');
const fs = require('fs');
const config = require('../config');
const hostWriter = require('./hostWriter');

const load = (configName) => {
    const fullPathName = `${config.pathname}/${configName}${config.suffix}`;
    if (fs.existsSync(fullPathName)) {
        return require(fullPathName);
    }
    return `Config '${configName}' not exist`;
};
const create = (yargs) => {
    clear();
    const argv = yargs.reset()
        .option('n', {
            alias: 'name',
            demand: true,
            default: 'default',
            describe: '配置名称。批量添加用英文逗号分隔，批量添加将会忽略 -I,-H 参数',
            type: 'string',
        })
        .option('I', {
            alias: 'IP',
            demand: false,
            describe: '你要设置的 IP',
            type: 'string',
        })
        .option('H', {
            alias: 'host',
            demand: false,
            describe: '域名列表，用英文逗号 \',\' 分隔。',
            type: 'string',
        })
        .help('h')
        .example('a', 'eh a blockBaidu -I=127.0.0.1 -H=map.baidu.com,music.baidu.com')
        .example('a', 'eh a blockBaidu,youkuBlock 将创建多个空的配置')
        .argv;
    const configName = argv._[1] || argv.name;
    const init = {};
    if (configName.indexOf(',') >= 0) {
        configName.split(',').forEach((n) => {
            if (hostConfiger.buildConfig(n, init)) {
                console.log(`create '${n}': OK!`);
            }
        });
        return
    }
    if (argv.I && argv.H) {
        init[argv.I] = argv.H.constructor === Array ? argv.H : argv.H.split(',');
    }
    list();
    if (!hostConfiger.buildConfig(configName, init)) return;
    console.log(`create '${configName}': OK!`);
};

const remove = (yargs) => {
    clear();
    const args = yargs.reset()
        .option('n', {
            alias: 'name',
            demand: false,
            default: '',
            describe: '配置名称',
            type: 'string',
        })
        .help('h')
        .usage('hs del config_name')
        .argv;
    let configNames = (() => {
        const array = args._;
        array.shift();
        return array;
    })();
    if (args.n.indexOf(',') >= 0) {
    } else if (args.n) {
        configNames.push(args.n);
    }
    configNames.forEach((name) => {
        hostConfiger.removeConfig(name);
    });
    list();
};

const show = (yargs) => {
    clear();
    const argv = yargs.reset()
        .option('n', {
            alias: 'name',
            demand: true,
            default: 'default',
            describe: '配置名称',
            type: 'string',
        })
        .help('h')
        .usage('hs s config_name')
        .argv;
    const configName = argv._[1] || argv.name;
    const config =  load(configName);
    console.log(config);
};

const choose = (yargs) => {
    clear();
    const args = yargs.reset()
        .option('I', {
            alias: 'IP',
            demand: false,
            describe: '你要设置的 IP',
            type: 'string',
        })
        .option('H', {
            alias: 'host',
            demand: false,
            describe: '域名列表，用英文逗号 \',\' 分隔。',
            type: 'string',
        })
        .option('a', {
            alias: 'append',
            default: true,
            describe: '将设置追加到此 IP 设置的域名列表后',
            type: 'boolean',
        })
        .option('o', {
            alias: 'overwrite',
            default: false,
            describe: '覆盖此 IP 的域名列表',
            type: 'boolean',
        })
        .option('r', {
            alias: 'reset',
            default: false,
            describe: '重置其他所有 IP 设置，仅保留当前所设置',
            type: 'boolean',
        })
        .usage('eh c your_config -I=127.0.0.1 -H=www.baidu.com,map.baidu.com')
        .argv;
    const configName = args._[1];
    let config = load(configName);
    const kv = {};
    if (args.I && args.H) {
        if (args.H.constructor === Array) {
            kv[args.I] = args.H;
        } else if (args.H.indexOf(',') > -1) {
            kv[args.I] = args.H.split(',');
        } else {
            kv[args.I] = [args.H];
        }
    }
    do {
        if (args.r) {
            hostConfiger.saveConfig(configName, kv);
            console.log(`Reset '${configName}': OK!`);
            break;
        }
        if (args.o) {
            Object.keys(kv).forEach((ip) => {
                config[ip] = kv[ip];
            });
            console.log(`Overwrite '${configName}': OK!`);
            hostConfiger.saveConfig(configName, config);
            break;
        }
        if (args.a) {
            Object.keys(kv).forEach((ip) => {
                config[ip] = (config[ip] && config[ip].length) ? config[ip].concat(kv[ip]) : kv[ip];
            });
            hostConfiger.saveConfig(configName, config);
            console.log(`Append '${configName}': OK!`);
            break;
        }
    } while (false);
    show(yargs);
};

const use = (yargs) => {
    clear();
    const args = yargs.reset()
        .option('r', {
            alias: 'reverse',
            default: false,
            describe: '反选这些配置'
        })
        .option('o', {
            alias: 'overwrite',
            default: false,
            describe: '以当前启用配置覆盖原有启用配置'
        })
        .help('h')
        .example('u', 'eh u config_1 adBlock')
        .example('u', 'eh u config_1 -r')
        .usage('eh u [your_config...]')
        .argv;
    const array = (() => {
        const a = args._;
        a.shift();
        return a;
    })();
    hostConfiger.createUseFile(array, args.r, args.o);
    list();
    const hosts = hostConfiger.apply();
    hostWriter.writeHost(hosts);
    console.log('成功应用新的 host!');
    console.log('你可以使用命令来审查 host 配置是否生效');
    console.log('cat /etc/hosts');
};

const list = () => {
    clear();
    console.log(hostConfiger.getList());
};

const init = () => {
    const defaultConfig = {
        "127.0.0.1": ["localhost"],
        "::1": ["localhost"],
        "255.255.255.255": ["broadcasthost"],
    };
    const oldConfig = hosts2Config.toConfig('/etc/hosts');
    hostConfiger.buildConfig('local', defaultConfig);
    hostConfiger.buildConfig('old', oldConfig);
    list();
    console.log('已初始化基础配置 local, old\n');
};


const importFrom = (yargs) => {
    clear();
    const args = yargs.reset()
        .option('f', {
            alias: 'file',
            describe: '文件绝对路径, 多个文件用英文逗号分隔',
            demand: false,
            type: 'string',
        })
        .example('eh i ~/Desktop/a.json ./a.json /Users/username/path/to/file.json')
        .example('eh i -f=/full/path/to/file.json')
        .argv;
    let paths = (() => {
        const ps = args._;
        ps.shift();
        return ps || [];
    })();
    if (args.f && args.f.indexOf(',')) {
        paths = paths.concat(args.f.split(','));
    } else if (args.f) {
        paths.push(args.f);
    }
    paths.forEach((file) => {
        let success = false;
        if (file.charAt(0) === '.') {
            success = hostConfiger.loadFromFile(path.join(process.cwd(), file));
        } else {
            success = hostConfiger.loadFromFile(file);
        }
        if (!success) return;
        console.log(`导入 ${file}: 成功！`);
    });
};

const exportToPath = (yargs) => {
    clear();
    const args = yargs.reset()
        .option('o', {
            alias: 'output',
            demand: false,
            default: path.join(process.env.HOME, '/ExtHostExport'),
            describe: '导出路径',
        })
        .help('h')
        .argv;
    hostConfiger.exportToPath(args.o);
};

module.exports = {
    create,
    remove,
    show,
    list,
    choose,
    use,
    init,
    import: importFrom,
    export: exportToPath,
};
