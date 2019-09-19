const dgram = require("dgram");
const server = dgram.createSocket("udp4");

server.on("error", err => {
  console.log(`服务器异常：\n${err.stack}`);
  server.close();
});

server.on("message", (msg, rinfo) => {
  console.log(`服务器收到：${msg} 来自 ${rinfo.address}:${rinfo.port}`);
});

server.on("listening", () => {
  const address = server.address();
  console.log(`服务器监听 ${address.address}:${address.port}`);
});

let message = Buffer.from([0x20]);
// server.send(
//   message,
//   0,
//   message.length,
//   47808,
//   "192.192.255.255",
//   (err, bytes) => {
//     if (err) {
//       console.log(err);
//       return;
//     }
//     console.log(`客户端发送了 ${bytes} 字节数据`);
//   }
// );

server.bind({
  address: "192.168.153.105",
  port: 47808,
  exclusive: true
});
