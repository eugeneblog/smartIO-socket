import request from "../utils/request"

// 发送udp广播消息
export function sendUdpMes(mes) {
    return request({
        mes,
        url: '/api/udp/send',
        method: 'POST'
    })
}

// 获取网卡信息
export function getNetConfig() {
    return request({
        url: '/api/net/getnet',
        method: 'POST'
    })
}