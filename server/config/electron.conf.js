const { app, BrowserWindow, shell } = require("electron");
const handler = require("serve-handler");
const http = require("http");
const server = http.createServer((request, response) => {
  // You pass two more arguments for config and middleware
  // More details here: https://github.com/zeit/serve-handler#options
  return handler(request, response, { public: "build" });
});
// 开启静态服务
server.listen(3000, () => {
  console.log("Running at http://localhost:3000");
});

// 启动本地http-server
// 服务端入口文件
let win;
function createWindow() {
  // 创建浏览器窗口。
  shell.beep();
  win = new BrowserWindow({ backgroundColor: "#2e2c29" });
  win.loadURL("http://localhost:3000/");

  win.once("ready-to-show", () => {
    win.show();
    let event = new Notification({ title: "message" });
    event.show();
  });
  // 打开开发者工具
  win.webContents.openDevTools();

  // 当 window 被关闭，这个事件会被触发。
  win.on("closed", () => {
    // 取消引用 window 对象，如果你的应用支持多窗口的话，
    // 通常会把多个 window 对象存放在一个数组里面，
    // 与此同时，你应该删除相应的元素。
    win = null;
  });
}

if (app) {
  // Electron 会在初始化后并准备
  // 创建浏览器窗口时，调用这个函数。
  // 部分 API 在 ready 事件触发后才能使用。
  app.on("ready", createWindow);

  // 当全部窗口关闭时退出。
  app.on("window-all-closed", () => {
    // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
    // 否则绝大部分应用及其菜单栏会保持激活。
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("activate", () => {
    // 在macOS上，当单击dock图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口。
    if (win === null) {
      createWindow();
    }
  });
}
