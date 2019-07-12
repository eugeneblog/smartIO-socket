const { XmlToJson } = require("../utils/xmlConJson");
const fxp = require('fast-xml-parser')

const { getFileContent, writeFileContent } = require("../utils/fs");

// 增加channel xml节点 data: 要写入的数据 filename: 要写入数据的配置文件
const addChannelXml = (data = {}, filename) => {
  let opaction = {
    flags: 'a',
    encoding: 'utf8',
    autoClose: true,
    start: 0
  }
  const dir = `../../xmlResources/${filename}.xml`;
  return writeFileContent(data, dir, opaction).then(result => {
    return {
      xmlJson: XmlToJson(result.xmlStr)
    };
  });
};

// 修改channel XML节点
const updateChannelXml = () => {
  return true;
};

// 删除delchannel XML 节点
const delchannelXml = (id, filename) => {
  const dir = `../../xmlResources/${filename}.xml`;
  // 获取xml节点
  return getFileContent(dir).then(xmlResult => {
    // xml转json
    let xmlJson = fxp.parse(xmlResult, {
      ignoreAttributes: false,
      textNodeName: '_text',
      attrValueProcessor: key => {
        return {key}
      },
    })
    // 删除不需要的节点
    xmlJson.ROOT.CHANNEL.splice(id - 1, 1)
    return xmlJson
  }).then(xmlJson => {
    // json转xml
    const xml = new fxp.j2xParser({
      format: true,
      attrNodeName: "@_key", //default is false
    }).parse(xmlJson)
    return xml
  }).then(xmlData => {
    // 存储xml
    let opaction = {
      flags: 'w',
      encoding: 'utf8',
      autoClose: true
    }
    // 将处理好的xml存储文件
    return writeFileContent(xmlData, dir, opaction)
  }).then(writeResult => {
    return true
  })
};

// 获取channel XML节点
const getchannelXml = filename => {
  const dir = `../../xmlResources/${filename}.xml`;
  return getFileContent(dir).then(xmlResult => {
    return {
      xmlStr: xmlResult,
      xmlJson: XmlToJson(xmlResult)
    };
  });
};

module.exports = {
  addChannelXml,
  updateChannelXml,
  delchannelXml,
  getchannelXml
};
