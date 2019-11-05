const path = require("path");
const join = path.join;
const fs = require("fs");
// 统一获取文件内容的函数
function getFileContent(dir) {
  // 创建读写流
  const file = fs.createReadStream(path.join(__dirname, dir), {
    encoding: "utf8",
    start: 0
  });
  const promise = new Promise((resolve, reject) => {
    let xmlStr = "";
    file.on("data", chunk => {
      xmlStr += chunk.toString();
    });
    file.on("end", () => {
      resolve(xmlStr);
    });
  });
  return promise;
}

// 写入文件内容
function writeFileContent(data, dir, opt) {
  let writeStream = fs.createWriteStream(path.join(__dirname, dir), opt);
  const result = getFileContent(dir)
    .then(redayData => {
      return new Promise((resolve, reject) => {
        // 判断是追加还是重写
        if (opt.flags === "a") {
          // 统一写入XML文件内容, 写入方式：删除末尾根节点然后拼接
          let xml = redayData.replace(/<\/ROOT>/gm, "").trim();
          writeStream.write(`${xml}${data}\n</ROOT>`);
        } else {
          // 否则覆盖写入
          writeStream.write(data);
        }
        writeStream.end();
        writeStream.on("error", err => {
          reject(err);
        });
        writeStream.on("finish", () => {
          resolve({ xmlStr: data });
        });
      });
    })
  return result;
}
function writeFileContent2(data, dir, opt) {
  let writeStream = fs.createWriteStream(path.join(__dirname, dir), opt);
  let promise = new Promise((resolve, reject) => {
    //读取文件发生错误事件
    writeStream.on('error', (err) => {
      console.log('发生异常:', err);
      reject(err)
    });
    //已打开要写入的文件事件
    writeStream.on('open', (fd) => {
      console.log('文件已打开:', fd);
    });
    //文件已经就写入完成事件
    writeStream.on('finish', () => {
      console.log('写入已完成..');
      console.log('读取文件内容:', fs.readFileSync(path.join(__dirname, dir), 'utf8')); //打印写入的内容
      resolve(fs.readFileSync(path.join(__dirname, dir), 'utf8'))
      console.log(writeStream);
    });
    //文件关闭事件
    writeStream.on('close', () => {
      console.log('文件已关闭！');
    });

    writeStream.write(data);
    writeStream.end();
  })
  return promise
}
// 读取多个文件
function readFiles(arr) {
  let _this = this;
  if (typeof arr === "string") {
    _this.getFileContent(arr);
  }
  if (!arr.length) {
    console.error("Cannot set string");
  }
  let allData = arr.map(item => {
    let promise = new Promise((res) => {
      let dir = path.join(__dirname, `../../xmlResources/type/${item}`)
      let file = fs.createReadStream(dir, {
        encoding: "utf8",
        start: 0
      })
      let xmlStr = ''
      file.on("data", chunk => {
        xmlStr += chunk.toString()
      })
      file.on("end", () => {
        res(xmlStr)
      })
    })
    return promise
  })
  return Promise.all(allData);
}

// 读取文件名
function findSync(startPath) {
  let result = [];
  function finder(path) {
    let files = fs.readdirSync(path);
    files.forEach((val, index) => {
      let fPath = join(path, val);
      let stats = fs.statSync(fPath);
      if (stats.isDirectory()) finder(fPath);
      if (stats.isFile()) result.push(fPath);
    });
  }
  finder(startPath);
  return result;
}
module.exports = {
  getFileContent,
  writeFileContent,
  findSync,
  readFiles,
  writeFileContent2
};
