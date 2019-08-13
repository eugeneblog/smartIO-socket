const querystring = require('querystring')
const path = require('path')
const udpRouteHandle = require(path.join(__dirname, './route/udp'))
const osRouteHandle = require(path.join(__dirname, './route/os'))
const xmlRouteHandle = require(path.join(__dirname, './route/xml.route'))
// 解析post数据
const getPostData = (req) => {
    const promise = new Promise((resolve,reject) => {
        if(req.method !== 'POST') {
            resolve({})
            return
        }
        if(req.headers['content-type'] !== 'application/json;charset=UTF-8') {
            reject(new Error('content-type not application/json;charset=UTF-8'))
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
    // 允许跨域访问
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
    // 允许的header类型
    res.setHeader("Access-Control-Allow-Headers","content-type")
    res.setHeader("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS")
    // 处理CORS发送过来OPTIONS预检请求
    if (req.method === 'OPTIONS') {
        res.writeHead(200, {"Content-type": "text/plain"})
        res.write('200')
        res.end()
        return
    }
    // 设置返回格式
    res.setHeader('Content-type', 'application/json;charset=utf-8')
    // 获取url
    const url = req.url
    const path = url.split('?')[0]
    req.path = path

    // 解析get请求参数
    req.query = querystring.parse(url.split('?')[1])

    getPostData(req).then((postData) => {
        req.body = postData
        console.log(`收到来自${req.url}的请求，请求方式是${req.method}, 请求的数据:`, postData)
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
            osData.then(osResult => {
                res.end(
                    JSON.stringify(osResult)
                )
            }).catch(err => {
                console.log(err)
            })
            return
        }

        // 处理xml操作相关路由
        const xmlData = xmlRouteHandle(req, res)
        if (xmlData) {
            xmlData.then(data => {
                res.end(
                    JSON.stringify(data)
                )
            }).catch(err => {
                console.log(err)
            })
            return
        }

        // 未命中路由
        res.writeHead(404, {"Content-type": "text/plain"})
        res.write('404 Not Found')
        res.end()
    }).catch(error => {
        console.log(error)
    })
}

module.exports = serverHandle
