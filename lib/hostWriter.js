const fs = require('fs');
const hostPath = require('../config').hostPath;
const writeHost = (hosts) => {
    fs.writeFileSync(hostPath, hosts);
};

module.exports = {
    writeHost,
};