const os = require("os");
let exec = require("child_process").exec;

const getOsNetConfig = () => {
  let cmdStr = "system_profiler SPNetworkDataType";
  let promise = new Promise((resolve, reject) => {
    exec(cmdStr, function(err, stdout, srderr) {
      if (err) {
        console.log(srderr);
        reject(srderr);
      }
      let newArr = [];
      let Root = stdout
        .replace(/(\n|\s)([a-zA-Z0-9\u4E00-\u9FA5].*):(\n{2,})/gi, match => {
          newArr.push({
            netName: match
          });
          return ">>>>";
        })
        .split(">>>>");

      Root.shift();

      // console.log(Root);
      let netConfig = Root.map(item => {
        return item;
      });
      // console.log(netConfig.length)
      let sysNetConfig = newArr.map((item, index) => {
        return {
          ...item,
          netConfig: netConfig[index]
        };
      });
      resolve({
        system: os.platform(),
        systemVsersion: os.release(),
        hostName: os.hostname(),
        net: os.networkInterfaces(),
        sysNetConfig
      });
    });
  });
  return promise;
};

module.exports = {
  getOsNetConfig
};
