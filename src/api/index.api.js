import request from "../utils/request";

// 获取Net_Config
export function getNetConfig(params) {
  return request({
    params,
    url: "/api/socket/net/list",
    method: "GET"
  });
}

// 获取通道信息
export function getChannel(params) {
  return request({
    params,
    url: "/api/socket/channel/list",
    method: "GET"
  });
}

// 修改通道信息
export function updateChannel(data) {
  return request({
    data,
    url: "/api/socket/channel/update",
    method: "POST"
  });
}

// 获取type
export function getAllType(params) {
  return request({
    params,
    url: "/api/socket/config/alltype",
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

// 设备存储生成xml
export function generateEquXml(data) {
  return request({
    data,
    url: "/api/socket/genequxml",
    method: "POST"
  })
}

// 发送udp广播消息
export function sendUdpMes(data) {
  return request({
    data,
    url: "/api/socket/udp/send",
    method: "POST"
  });
}

// 获取路由
export function getUdpNetNum(data) {
  return request({
    data,
    url: "/api/socket/udp/getnetnum",
    method: "POST"
  })
}

// 获取who_msg
export function getWhoMsg() {
  return request({
    url: "/api/socket/ffi/who",
    method: "GET"
  })
}

// 开启websocket连接
export function startWebsocket() {
  return request({
    url: "/api/socket/websocket/start",
    method: "GET"
  })
}

// 搜索设备对象属性
export function searchEquObjProperties(data) {
  return request({
    data,
    url: "/api/socket/udp/searchEquObjAll",
    method: "POST"
  })
}

// 搜索单个设备对象列表
export function searchEquOneObj(data) {
  return request({
    data,
    url: "/api/socket/udp/searchEquObj",
    method: "POST"
  })
}