const fs = require('fs');
const path = require('path');

const spaceBreak = (str) => {
    str = str.replace(/\s/g, ' ').trim();
    while (str.indexOf('  ') >= 0) {
        str = str.replace('  ', ' ');
    }
    return str.split(' ');
};

const toConfig = (hostsFile) => {
    const filePath = path.join(hostsFile);
    if (!fs.existsSync(filePath)) return {};
    const data = fs.readFileSync(filePath);
    return read(data);
};

const read = (data) => {
    const array = data.toString().split('\n');
    const obj = {};
    array.forEach((line) => {
        if (!line) return;
        const iphost = spaceBreak(line);
        if (iphost[0].charAt(0) === '#') return;
        const ip = iphost[0], host = iphost[1];
        obj[ip] = !(obj[ip] && obj[ip].length) ? [] : obj[ip];
        obj[ip].push(host);
    });
    return obj;
};

module.exports = {
    toConfig,
};
