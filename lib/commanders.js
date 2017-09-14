const clear = require('clear');
const hostConfiger = require('./hostConfiger');
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
            describe: '配置名称',
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
        .example('new', 'hs new blockBaidu -I=127.0.0.1 -H=map.baidu.com,music.baidu.com')
        .example('new', 'hs new blockBaidu 将创建一个空的配置')
        .argv;
    const configName = argv._[1] || argv.name;
    const init = {};
    if (argv.I && argv.H) {
        init[argv.I] = argv.H.constructor === Array ? argv.H : argv.H.split(',');
    }
    hostConfiger.buildConfig(configName, init);
    console.log(`create '${configName}': OK!`);
    list();
};

const remove = (yargs) => {
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
        .usage('hs del config_name')
        .argv;
    const configName = argv._[1] || argv.name;
    hostConfiger.removeConfig(configName);
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
    list();
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
        .example('u', 'hs u config_1 adBlock')
        .example('u', 'hs u config_1 -r')
        .usage('hs us [your_config...]')
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

module.exports = {
    create,
    remove,
    show,
    list,
    choose,
    use,
};