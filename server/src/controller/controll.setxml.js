const { XmlToJson } = require('../utils/xmlConJson')
const { getFileContent, writeFileContent } = require('../utils/fs')

// 增加channel xml节点 data: 要写入的数据 filename: 要写入数据的配置文件
const addChannelXml = (data = {}, filename) => {
    const dir = `../../xmlResources/${filename}.xml`
    return Promise.resolve(true)
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
    const dir = `../../xmlResources/${filename}.xml`
    return getFileContent(dir).then((xmlResult) => {
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