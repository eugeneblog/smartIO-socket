// 192.168.153.110 :: 47808 netstat -anp udp | grep 47808
const dgram = require('dgram')

class UdpClient {
    constructor(ip, port) {
        this.IP = ip
        this.PORT = port
        // 组播ip地址
        this.multicastAddr = '224.100.100.100'
        this.client = dgram.createSocket('udp4')
    }
    sendMsg(msg, isListen = false) {
        // 发送16进制ASCIL码
        let message = Buffer.from(msg, 'ascii')
        this.client.bind(this.PORT, () => {
            console.log(`bind to ${this.PORT}`)
        }) 
        this.client.send(message, 0, message.length, this.PORT, this.IP, function(err, bytes) {
            if (err) {
                console.log(err)
                return
            }
            console.log(`客户端发送了 ${bytes} 字节数据`)
        })
        if (isListen) {
            this.client.on('message', function(msg, rinfo) {
                // 接收的数据做个转换
                let data = new Buffer(msg, 'ascii').toString('hex')
                console.log(`接收到来自${rinfo.address}:${rinfo.port}数据: ${data}`)
            })
        }
    }
}

let udpclient = new UdpClient('192.168.153.110', 47808)
let msg = "\x81\x0B\x00\x0C\x01\x20\xFF\xFF\x00\xFF\x10\x08"
udpclient.sendMsg(msg, true)
// udpclient.addListen()

module.exports = {
    UdpClient
}