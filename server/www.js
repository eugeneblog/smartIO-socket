const http = require('http')
require('./config/electron.conf')
const serverHandle = require('./src/app')

const PORT = 8000
const server = http.createServer(serverHandle)

server.listen(PORT)