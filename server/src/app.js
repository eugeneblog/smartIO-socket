// 后端httpAPI入口函数
const serverHandle = (rep, res) => {
    // 设置返回格式
    res.setHeader('Content-type', 'application/json')

    const resData = {
        name: 'aa',
        env: process.env.NODE_ENV
    }

    res.end(
        JSON.stringify(resData)
    )
}

module.exports = serverHandle