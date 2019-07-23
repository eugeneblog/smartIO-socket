const SerialPort = require('serialport').SerialPort
const portName = 'COM3'
let serialPort = new SerialPort(
    "COM3", {
        baudRate: 9600,  //波特率
        dataBits: 8,    //数据位
        parity: 'none',   //奇偶校验
        stopBits: 1,   //停止位
        flowControl: false 
    },
    false
)

serialPort.open((errno) => {
    if (errno) {
        console.log(`打开端口${portName}错误: ${errno}`)
        return
    } else {
        console.log("打开端口成功，正在监听数据...")
        serialPort.on('data', data => {
            console.log(data)
        })
    }
})

module.exports = {
    serialPort
}