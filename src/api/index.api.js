import request from "../utils/request"

// 获取udp广播消息
export function getUdpRadio(params) {
    return request({
        url: '/api/udp/getradio',
        method: 'post'
    })
}