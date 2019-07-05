const path = require('path')
const fs = require('fs')
const { XmlToJson } = require('../conf/xmlConJson')
// 解析post数据
const getfsData = (file) => {
    const promise = new Promise((resolve, reject) => {
        let xmlStr = ''
        file.on("data", (chunk) => {
            xmlStr += chunk.toString()
        })
    
        file.on('end', () => {
            resolve(xmlStr)
        })
    })
    return promise
}

// 增加channel xml节点
const addChannelXml = () => {
    return true
}

// 修改channel XML节点
const updateChannelXml = () => {
    return true
}

// 删除delchannel XML 节点
const delchannelXml = (id) => {
    return true
}

// 获取channel XML节点
const getchannelXml = (filename) => {
    const dir = '../../xmlResources/channel.xml'
    // 读取目标文件, 创建读写流
    let file = fs.createReadStream(path.join(__dirname, dir), { encoding: "utf8", start: 0 })

    return getfsData(file).then((xmlResult) => {
        return {
            xmlStr: xmlResult,
            xmlJson: XmlToJson(xmlResult)
        }
    })
}

module.exports = {
    addChannelXml,
    updateChannelXml,
    delchannelXml,
    getchannelXml
}