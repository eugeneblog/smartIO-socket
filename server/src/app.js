const querystring = require('querystring')
const udpRouteHandle = require('./route/udp')
const osRouteHandle = require('./route/os')
const xmlRouteHandle = require('./route/xml.route')
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
    // 允许跨域访问
    res.setHeader('Access-Control-Allow-Origin', '*')
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

        // 处理os路由
        const osData = osRouteHandle(req, res)
        if (osData) {
            res.end(
                JSON.stringify(osData)
            )
            return
        }

        // 处理xml操作相关路由
        const xmlData = xmlRouteHandle(req, res)
        if (xmlData) {
            xmlData.then(data => {
                res.end(
                    JSON.stringify(data)
                )
            })
            return
        }

        // 未命中路由
        res.writeHead(404, {"Content-type": "text/plain"})
        res.write('404 Not Found')
        res.end()
    })
}

module.exports = serverHandle