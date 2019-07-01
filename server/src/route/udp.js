const { SuccessModel } = require('../model/resModel')
const { getUdpRadio } = require('../controller/udp')
const udpRouteHandle = (req, res) => {
    const method = req.method
    const path = req.path
    
    // 获取udp广播消息
    if (method === 'POST' && path === "/api/udp/send") {
        const data = getUdpRadio(req.body)
        console.log(req.body)
        return new SuccessModel(data, '获取成功')
    }
}

module.exports = udpRouteHandle