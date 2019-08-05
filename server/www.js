const http = require("http");
const path = require("path");
const serverHandle = require(path.join(__dirname, "./src/app"));

const PORT = 9100;
const server = http.createServer(serverHandle);

server.listen(PORT);

module.exports = {
  server
};
