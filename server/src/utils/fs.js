const path = require('path')
const fs = require('fs')
// 统一获取文件内容的函数
function getFileContent(dir) {
  // 创建读写流
  const file = fs.createReadStream(path.join(__dirname, dir), { encoding: "utf8", start: 0 })
  const promise = new Promise((resolve, reject) => {
    let xmlStr = ''
        file.on("data", (chunk) => {
            xmlStr += chunk.toString()
        })
        file.on('end', () => {
          resolve(xmlStr)
        })
  });
  return promise;
}

module.exports = {
  getFileContent
};
