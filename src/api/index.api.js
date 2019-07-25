import request from "../utils/request"

// 发送udp广播消息
export function sendUdpMes(mes) {
    return request({
        mes,
        url: '/api/udp/send',
        method: 'POST'
    })
}

// 获取Net_Config
export function getNetConfig(params) {
    return request({
        params,
        url: '/api/net/getnet',
        method: 'GET'
    })
}

// 获取type
export function getAllType(params) {
    return request({
        params,
        url: '/api/config/alltype',
        method: 'GET'
    })
}

// 获取串口信息
export function getSerialPort(params) {
    return request({
        params,
        url: '/api/serial/list',
        method: 'GET'
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
export function updateChannel(data, filename) {
    return request({
        data,
        params: filename,
        url: '/api/config/updatechannel',
        method: 'POST'
    })
}

// 删除通道信息
export function delChannel(id) {
    return request({
        params: id,
        url: '/api/config/delchannel',
        method: 'GET'
    })
}

// 增加通道信息
export function newChannel(data, filename) {
    return request({
        params: filename,
        data,
        url: '/api/config/newchannel',
        method: 'POST'
    })
}