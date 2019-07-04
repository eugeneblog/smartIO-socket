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

// 获取通道信息
export function getChannel(params) {
    return request({
        params,
        url: '/api/config/getchannel',
        method: 'GET'
    })
}

// 修改通道信息
export function updateChannel(data) {
    return request({
        data,
        url: '/api/config/updatechannel',
        method: 'POST'
    })
}

// 删除通道信息
export function delChannel(id) {
    return request({
        params: id,
        url: '/api/config/delchannel',
        method: 'POST'
    })
}

// 增加通道信息
export function newChannel(data) {
    return request({
        data,
        url: '/api/config/newchannel',
        method: 'POST'
    })
}