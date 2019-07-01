import request from "../utils/request"

// 发送udp广播消息
export function sendUdpMes(mes) {
    return request({
        mes,
        url: '/api/udp/send',
        method: 'post'
    })
}