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
// 统一写入XML文件内容, 写入方式：删除末尾根节点然后拼接
function writeFileContent(data, dir) {
  let opaction = {
    flags: 'a',
    encoding: 'utf8',
    autoClose: true,
    start: 0
  }
  const writeStream = fs.createWriteStream(path.join(__dirname, dir), opaction)
  const result = getFileContent(dir).then(redayData => {
    return new Promise((resolve, reject) => {
      // 替换内容
      let xml = redayData.replace(/<\/ROOT>/gm, '').trim()
      writeStream.write(`${xml}${data}\n</ROOT>`)
      writeStream.end()
      writeStream.on('error', err => {
        reject(err)
      })
      writeStream.on('finish', () => {
        resolve({xmlStr: `${xml}${data}\n</ROOT>`})
      })
    })
  }).catch(error => {
    console.log(error)
  })
  return result
}
module.exports = {
  getFileContent,
  writeFileContent
};
