const { SuccessModel } = require('../model/resModel')
const { getOsNetConfig } = require('../controller/os')
const osRouteHandle = (req, res) => {
    const method = req.method
    const path = req.path

    // 获取网卡配置信息
    if (method && path === '/api/net/getnet') {
        const result = getOsNetConfig()
        return new SuccessModel(result)
    }
}

module.exports = osRouteHandle