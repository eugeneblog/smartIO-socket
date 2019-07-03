const { SuccessModel } = require('../model/resModel')
const { sendUdpRadio } = require('../controller/udp')
const udpRouteHandle = (req, res) => {
    const method = req.method
    const path = req.path
    
    // 获取udp广播消息
    if (method === 'POST' && path === "/api/udp/send") {
        //解析前端数据，ip，port，msg
        let msg = "\x81\x0B\x00\x0C\x01\x20\xFF\xFF\x00\xFF\x10\x08"
        let ip = '192.168.153.110'
        let port = 47808
        const data = sendUdpRadio(ip, port, msg)
        return new SuccessModel(data, '获取成功')
    }
}

module.exports = udpRouteHandle