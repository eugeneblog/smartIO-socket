const os = require('os')
let SYSTEM
// 定义一些不同操作系统的shell操作

if (os.platform() === 'darwin') {
    SYSTEM = {
        getNetConfig: 'system_profiler SPNetworkDataType'
    }
}
module.exports = {
    SYSTEM
}