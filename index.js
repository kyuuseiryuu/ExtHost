#!/usr/bin/env node
const commander = require('./lib/commanders');
const argv = require('yargs')
    .command('a', '(add) 创建一个空的 host 配置并追踪，更多额外参数可添加 -h 参数查看', commander.create)
    .command('d', '(delete) 删除一个 host 配置', commander.remove)
    .command('s', '(show) 显示一个 host 的详细配置', commander.show)
    .command('l', '(list) 列出所有的 host 配置', commander.list)
    .command('c', '(choose) 选择一个 host 配置进行操作', commander.choose)
    .command('u', '(use) 启用一个或者多个 host 配置', commander.use)
    .command('init', '初始化一些通用的默认配置', commander.init)
    .command('i', '(import) 导入一个 .json 配置', commander.import)
    .command('e', '(export) 导出所有配置到指定文件夹或用户文件夹', commander.export)
    .usage('Usage: eh [options]')
    .help('h')
    .epilog('By: KyuuSeiryuu 2017/09/14')
    .argv;
