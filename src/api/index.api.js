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
  });
}

// 初始化udp套接字
export function initUdpSocket(data) {
  return request({
    data,
    url: "/api/socket/udp/init",
    method: "POST"
  })
}

// 获取路由
export function getUdpNetNum(data) {
  return request({
    data,
    url: "/api/socket/udp/getnetnum",
    method: "POST"
  });
}

// 获取who_msg
export function getWhoMsg(data) {
  return request({
    url: "/api/socket/ffi/who",
    method: "POST",
    data
  });
}

// 搜索单个设备对象列表
export function searchEquOneObj(data) {
  return request({
    data,
    url: "/api/socket/udp/searchEquObj",
    method: "POST"
  });
}

export function getEquObjAttribute(data) {
  return request({
    data,
    url: "/api/socket/udp/getattribute",
    method: "POST"
  });
}

// 上传到数据库
export function uploadDataToRedis(data) {
  return request({
    data,
    url: "/api/socket/db/upload",
    method: "POST"
  });
}

// 读取数据库设备信息
export function readDeviceData(data) {
  return request({
    data,
    url: "/api/socket/db/getDevice",
    method: "POST"
  });
}
// 读取多个对象
export function readAllDeviceData(data) {
  return request({
    data,
    url: "/api/socket/db/getAllDevice",
    method: "POST"
  })
}

// 更改数据库hash值
export function setDeviceData(params) {
  return request({
    params,
    url: "/api/socket/db/setDevice",
    method: "GET"
  });
}

// 从数据库中删除数据
export function delDeviceData(params) {
  return request({
    params,
    url: "/api/socket/db/delDevice",
    method: "GET"
  });
}

// 从数据库中增加数据
export function addDeviceData(data) {
  return request({
    data,
    url: "/api/socket/db/addDevice",
    method: "POST"
  });
}

// 从数据库中读取指定字段
export function readDataBaseField(params) {
  return request({
    params,
    url: "/api/socket/db/readField",
    method: "GET"
  })
}

// 清空数据库
export function delAllRedisData() {
  return request({
    url: "/api/socket/db/delAll",
    method: "GET"
  });
}

// 读取扩展模块
export function readExtenModule(params) {
  return request({
    params,
    url: "/api/socket/module/read",
    method: "GET"
  });
}

// 将扩展模块存入redis
export function writeExtenModule(data) {
  return request({
    data,
    url: "/api/socket/module/save",
    method: "POST"
  });
}

// 删除扩展模块
export function delExtenModule(data) {
  return request({
    data,
    url: "/api/socket/module/del",
    method: "POST"
  });
}

// 模块上传
export function uploadModules(data) {
  return request({
    data,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    url: "/api/socket/upload/module",
    method: "POST"
  });
}

// 应用配置文件到设备
export function appliedTOdevice(data) {
  return request({
    data,
    url: "/api/socket/udp/appliedXml",
    method: "POST"
  })
}

// 发送文件大小
export function exportDeviceToXml(data) {
  return request({
    data,
    url: "/api/socket/export/xml",
    method: "POST"
  })
}

// 发送文件
export function sendFilePkg(data) {
  return request({
    data,
    url: "/api/socket/udp/sendFile",
    method: "POST"
  })
}

// 读取schedule属性
export function searchSchedule(data) {
  return request({
    data,
    url: "/api/socket/udp/getschedule",
    method: "POST"
  })
}

// 写入schedule
export function writeShedule(data) {
  return request({
    data,
    url: "/api/socket/udp/setschedule",
    method: "POST"
  })
}