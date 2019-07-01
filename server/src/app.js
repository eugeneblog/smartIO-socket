const querystring = require('querystring')
const udpRouteHandle = require('./route/udp')
// 解析post数据
const getPostData = (req) => {
    const promise = new Promise((resolve) => {
        if(req.method !== 'POST') {
            resolve({})
            return
        }
        if(req.headers['content-type'] !== 'application/json') {
            resolve({})
            return
        }
        let postData = ''
        req.on('data', chunk => {
            postData += chunk
        })
        req.on('end', () => {
            if(!postData) {
                resolve({})
            }
            resolve(
                JSON.parse(postData)
            )
        })
    })
    return promise
}
// 后端httpAPI入口函数
const serverHandle = (req, res) => {
    // 设置返回格式
    res.setHeader('Content-type', 'application/json')
    // 获取url
    const url = req.url
    const path = url.split('?')[0]
    req.path = path

    // 解析get请求参数
    req.query = querystring.parse(url.split('?')[1])

    getPostData(req).then((postData) => {
        req.body = postData

        // 处理udp路由
        const udpData = udpRouteHandle(req, res)
        if (udpData) {
            res.end(
                JSON.stringify(udpData)
            )
            return
        }
        // 未命中路由
        res.writeHead(404, {"Content-type": "text/plain"})
        res.write('404 Not Found')
        res.end()
    })
}

module.exports = serverHandle