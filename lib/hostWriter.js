const fs = require('fs');
const hostPath = '/etc/hosts';
const writeHost = (hosts) => {
    fs.writeFileSync(hostPath, hosts);
};

module.exports = {
    writeHost,
};