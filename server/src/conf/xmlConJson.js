const convert = require('xml-js')
const XmlToJson = function(xml) {
    let result = convert.xml2json(xml, {compact: true, spaces: 4})
    console.log(result, '\n',);
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