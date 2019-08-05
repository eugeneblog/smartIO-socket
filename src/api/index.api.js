import request from "../utils/request";

// 获取Net_Config
export function getNetConfig(params) {
  return request({
    params,
    url: "http://localhost:8000/api/socket/net/list",
    method: "GET"
  });
}

// 获取通道信息
export function getChannel(params) {
  return request({
    params,
    url: "http://localhost:8000/api/socket/channel/list",
    method: "GET"
  });
}

// 修改通道信息
export function updateChannel(data) {
  return request({
    data,
    url: "http://localhost:8000/api/socket/channel/update",
    method: "POST"
  });
}

// 获取type
export function getAllType(params) {
  return request({
    params,
    url: "/api/config/alltype",
    method: "GET"
  });
}

// 获取串口信息
export function getSerialPort(params) {
  return request({
    params,
    url: "/api/serial/list",
    method: "GET"
  });
}

// 发送udp广播消息
export function sendUdpMes(mes) {
  return request({
    mes,
    url: "/api/udp/send",
    method: "POST"
  });
}
