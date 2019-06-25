// 后端httpAPI入口函数
const serverHandle = (req, res) => {
    // 设置返回格式
    res.setHeader('Content-type', 'application/json')
    // 获取url
    const url = req.url
    const path = url.split('?')[0]
    req.path = path

    const resData = {
        name: 'aa',
        env: process.env.NODE_ENV
    }

    res.end(
        JSON.stringify(resData)
    )
}

module.exports = serverHandle