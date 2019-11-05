const path = require("path");
const { XmlToJson } = require(path.join(__dirname, "../utils/xmlConJson"));
const fxp = require("fast-xml-parser");

const {
  getFileContent,
  writeFileContent,
  findSync,
  readFiles,
  writeFileContent2
} = require("../utils/fs");

// 增加channel xml节点 data: 要写入的数据 filename: 要写入数据的配置文件
const addChannelXml = (data = {}, filename) => {
  let opaction = {
    flags: "a",
    encoding: "utf8",
    autoClose: true,
    start: 0
  };
  const dir = `../../xmlResources/${filename}.xml`;
  return writeFileContent(data, dir, opaction).then(result => {
    const jsonData = fxp.parse(result.xmlStr, {
      attributeNamePrefix: "",
      attrNodeName: "attr", //default is 'false'
      textNodeName: "#text",
      ignoreAttributes: false
    });
    return {
      xmlJson: JSON.stringify(jsonData)
    };
  });
};

// 修改channel XML节点
const updateChannelXml = (data, filename) => {
  // json to xml
  let Root = {
    ROOT: { CHANNEL: data }
  };
  const dir = `../../xmlResources/${filename}.xml`;
  const xml = new fxp.j2xParser({
    attributeNamePrefix: "",
    attrNodeName: "attr", //default is false
    textNodeName: "#text",
    ignoreAttributes: true,
    format: true, // 格式化
    tagValueProcessor: val => val.toLocaleUpperCase()
  }).parse(Root);
  console.log(Root)
  return writeFileContent2(xml, dir, {encoding:'utf8'}).then(wResult => {
    return true
  });
};

// 删除delchannel XML 节点
const delchannelXml = (id, filename) => {
  const dir = `../../xmlResources/${filename}.xml`;
  // 获取xml节点
  return getFileContent(dir)
    .then(xmlResult => {
      // xml转json
      let xmlJson = fxp.parse(xmlResult, {
        attributeNamePrefix: "",
        attrNodeName: "attr", //default is 'false'
        textNodeName: "#text",
        ignoreAttributes: false
      });
      // 过滤被删除的节点
      if (xmlJson.ROOT.CHANNEL.length) {
        xmlJson.ROOT.CHANNEL = xmlJson.ROOT.CHANNEL.filter(ele => {
          return ele.attr["key"] !== id;
        });
        return xmlJson;
      } else {
        return {
          ROOT: {}
        };
      }
    })
    .then(xmlJson => {
      // json转xml
      const xml = new fxp.j2xParser({
        attributeNamePrefix: "",
        attrNodeName: "attr", //default is false
        textNodeName: "#text",
        ignoreAttributes: true,
        format: true // 格式化
      }).parse(xmlJson);
      // console.log(xml)
      return xml;
    })
    .then(xmlData => {
      // 存储xml
      let opaction = {
        flags: "w",
        encoding: "utf8",
        autoClose: true
      };
      // 将处理好的xml存储文件
      return writeFileContent(xmlData, dir, opaction);
    });
};

// 获取channel XML节点
const getchannelXml = filename => {
  const dir = `../../xmlResources/${filename}.xml`;
  return getFileContent(dir).then(xmlResult => {
    const jsonData = fxp.parse(xmlResult, {
      attributeNamePrefix: "",
      attrNodeName: "attr", //default is 'false'
      textNodeName: "#text",
      ignoreAttributes: false
    });
    return {
      xmlStr: xmlResult,
      xmlJson: XmlToJson(xmlResult),
      fxpXmlJson: JSON.stringify(jsonData)
    };
  });
};

// 获取所有type xml配置
const getAllType = () => {
  let dir = path.join(__dirname, "../../xmlResources/type");
  let fileNames = findSync(dir);
  let newArr = fileNames.map(item => {
    var newStr;
    item.replace(/[^/]+.xml$/g, function(match) {
      newStr = match;
      return match;
    });
    return newStr;
  });
  // 读取type文件
  return readFiles(newArr).then(result => {
    // xml转json
    let jsonDatas = result.map(item => {
      return fxp.parse(item, {
        ignoreAttributes: false,
        textNodeName: "_text",
        attrValueProcessor: key => {
          return { key };
        }
      });
    });
    return {
      allFiles: newArr,
      allFileData: jsonDatas
    };
  });
};

module.exports = {
  addChannelXml,
  updateChannelXml,
  delchannelXml,
  getchannelXml,
  getAllType
};
