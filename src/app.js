import React, { useState, useEffect } from "react";
import { observer, inject } from "mobx-react";
import {
  readDeviceData,
  getAllType,
  getNetConfig,
  getChannel,
  initUdpSocket
} from "./api/index.api";
import MainRoute from "./route/index.route";
import "./App.css";

const AppLoading = () => {
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: " translate(-50%, -50%)"
        }}
      >
        <div className="spinner spinnerTwo"><span></span></div>
        <div>Loading...</div>
      </div>
    </div>
  );
};

const App = inject(allStore => allStore.appstate)(
  observer(props => {
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      async function asyncFn() {
        let result = await readDeviceData({ key: "*" });
        let data = result["data"].data;
        console.log("%c连接redis[ok]", "color:green;font-weight:bold;");
        props.equipmentstate.dataSource = data;
        // 加载通道信息
        let channel = await getChannel();
        props.appstate.channelDataSource = channel["data"].data;
        console.log("%c加载channel数据[ok]", "color:green;font-weight:bold;");
        // 视图加载完毕后请求数据：获取type文件名
        let type = await getAllType();
        props.appstate.allType = type["data"].data["allFiles"];
        props.appstate.allTypeData = type["data"].data["allFileData"];
        console.log("%cgetAlltype...", "color:green;font-weight:bold;");
        // 获取网络系统的网络配置
        let netConfig = await getNetConfig();
        let netData = netConfig["data"].data;
        props.appstate.netConfig = netData.sysNetConfig || netData.net.en0;
        let netArr = [];
        // 处理net数据，转换为数组，并分离ipv4地址和ipv6地址
        for (const key in netData.net) {
          if (netData.net.hasOwnProperty(key)) {
            const element = netData.net[key];
            const ipv4 = element.filter(item => {
              return item.family !== "IPv6";
            });
            const ipv6 = element.filter(item => {
              return item.family !== "IPv4";
            });
            netArr.push({
              [key]: { ...element },
              name: key,
              ipv4: { ...ipv4 },
              ipv6: { ...ipv6 }
            });
          }
        }
        props.appstate.net = netArr;
        console.log(
          "%cgetAllNet_Config配置...",
          "color:green;font-weight:bold;"
        );
        props.appstate
          .setSelectedChannel()
          .then(data => {
            return initUdpSocket({
              ip: data.NET_CONFIG.MAIN.IP,
              local_port: data.NET_CONFIG.MAIN.LOCAL_PORT["#text"],
              remote_port: data.NET_CONFIG.MAIN.REMOTE_PORT["#text"]
            });
          })
          .then(res => {
            console.log("初始化udp 套接字");
          });
      }
      asyncFn().then(() => {
        setTimeout(() => {
          setLoading(false);
        }, 500);
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return !loading ? <MainRoute key="main" /> : <AppLoading />;
  })
);

export default App;
