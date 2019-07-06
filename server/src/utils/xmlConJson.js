const convert = require('xml-js')
// xml 转json格式
const XmlToJson = function(xml) {
    let result = convert.xml2json(xml, {compact: true, spaces: 4})
    return result
}

const JsonToXml = function (json){
    let xml = json
    return xml
}

module.exports = {
    XmlToJson,
    JsonToXml
}