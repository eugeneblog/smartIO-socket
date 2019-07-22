const path = require('path')
const { SuccessModel, ErrorModel } = require(path.join(__dirname, "../model/resModel"));
const {
  addChannelXml,
  updateChannelXml,
  delchannelXml,
  getchannelXml
} = require("../controller/controll.setxml");

const xmlRouteHandle = (req, res) => {
  const method = req.method;
  const path = req.path;

  // 增加channel xml 节点
  if (method === "POST" && path === "/api/config/newchannel") {
    const { filename } = req.query
    const { xmlData } = req.body
    const result = addChannelXml(xmlData, filename);
    return result.then(data => {
      if (data) {
        return new SuccessModel(data, '写入成功');
      } else {
        return new ErrorModel("写入失败");
      }
    });
  }

  // 修改channel xml 节点
  if (method === "POST" && path === "/api/config/updatechannel") {
    const result = updateChannelXml(req.body);
    if (result) {
      return new SuccessModel("修改成功");
    } else {
      return new ErrorModel("修改失败");
    }
  }

  // 删除channel xml 节点
  if (method === "GET" && path === "/api/config/delchannel") {
    const { id, filename } = req.query;
    const result = delchannelXml(id, filename);
    return result.then(result => {
      if (result) {
        return new SuccessModel('删除成功')
      } else {
        return new ErrorModel('删除失败')
      }
    })
  }

  // 获取channel xml 节点
  if (method === "GET" && path === "/api/config/getchannel") {
    const { fileName } = req.query;
    const result = getchannelXml(fileName);
    return result.then(data => {
      return new SuccessModel(data, "true");
    });
  }
};

module.exports = xmlRouteHandle;
