const { UdpClient } = require('../utils/UdpClient')
// 获取udp广播消息
const sendUdpRadio = (ip, port, msg) => {
    const udpclient = new UdpClient(ip, port)
    const serverMsg = udpclient.sendMsg(msg, true)
    // console.log(serverMsg)
    return serverMsg
}

module.exports = {
    sendUdpRadio
}