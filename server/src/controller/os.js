const os = require('os')
const getOsNetConfig = () => {
    return {
        system: os.platform(),
        systemVsersion: os.release(),
        hostName: os.hostname(),
        net: os.networkInterfaces()
    }
}

module.exports = {
    getOsNetConfig
}