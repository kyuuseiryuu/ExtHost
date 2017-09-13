const path =  require('path');
const dirName = '.ExtHost';
const pathname = path.join(process.env.HOME, dirName);
module.exports = {
    pathname,
    suffix: '.json',
    hostPath: '/etc/hosts',
};