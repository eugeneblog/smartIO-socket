/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from "react";
import { observer, inject } from "mobx-react";
import {
  PageHeader,
  Row,
  Col,
  Badge,
  Icon,
  Tree,
  Tabs,
  Spin,
  Empty
} from "antd";
import { readDataBaseField, searchSchedule } from "../../api/index.api";
import { Menu, Item, contextMenu } from "react-contexify";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import listPlugin from "@fullcalendar/list";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import 'tippy.js/animations/scale.css';
import "./calendar.scss";
const { TreeNode, DirectoryTree } = Tree;
const { TabPane } = Tabs;

const MyAwesomeMenu = props => (
  <Menu id="scheduleMenu">
    <Item onClick={props.searchPropertiesClick}>searchProperties</Item>
  </Menu>
);

// Tree 组件， 左侧视图
const RenderTreeNode = inject(allStore => allStore.appstate)(
  observer(props => {
    const [treeData, setTreeData] = useState(
      props.equipmentstate.getTreeData(
        props.equipmentstate.getConditionsModules({
          "17": true
        })
      )
    );
    useEffect(() => {
      const allPromise = treeData.map(item => {
        return readDataBaseField({
          key: `${item.objectName}:8:${item.objectName}`,
          subKey: "OBJECT_NAME"
        });
      });
      Promise.all(allPromise).then(res => {
        // 写入treeData
        setTreeData(
          treeData.map((item, index) => {
            return { ...item, deviceName: res[index]["data"].value };
          })
        );
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const RecursiveTree = (treeData, prefix) => {
      if (treeData.length) {
        return treeData.map(item => {
          let key;
          let modules;
          let nodeData = {};
          if (!prefix) {
            key = `${item.objectName}`;
          } else {
            key = `${prefix}:${item.objectName}`;
          }
          const pattern = /^(\d)+$/;
          if (pattern.test(key)) {
            const allModules = props.equipmentstate.getModules;
            if (allModules) {
              const uniqu = {};
              const deviceModule = allModules.filter(
                node => node.split(":")[0] === item.objectName
              );
              deviceModule.forEach(item => {
                uniqu[item.split(":")[2][0]] = item;
              });
              modules = Object.keys(uniqu);
              nodeData.modules = modules;
              nodeData.modulesKey = deviceModule;
            }
          }
          let title = (
            <span>
              {item.text
                ? `${item.text} ${
                    item.children.length ? `(${item.children.length})` : ""
                  }`
                : `${item.deviceName}`}
              {modules ? (
                <Badge
                  style={{
                    backgroundColor: "#fff",
                    color: "#999",
                    boxShadow: "0 0 0 1px #d9d9d9 inset",
                    marginLeft: 5
                  }}
                  count={modules.length}
                />
              ) : null}
            </span>
          );

          return (
            <TreeNode
              selectable={item.children.length ? false : true}
              nodeData={nodeData}
              icon={
                item.children.length ? (
                  <Icon
                    type="folder-open"
                    theme="twoTone"
                    twoToneColor="#ffb818"
                  />
                ) : (
                  <Icon type="file" theme="twoTone" />
                )
              }
              title={title}
              key={key}
              isLeaf={!item.children.length ? true : false}
            >
              {RecursiveTree(item.children, key)}
            </TreeNode>
          );
        });
      }
      // prefix = null
      return null;
    };

    const onRightHandle = e => {
      const menuId = "scheduleMenu";
      const { eventKey } = e.node.props;
      e.event.preventDefault();
      // 获取被右击的节点, 只有父节点才能响应右键
      if (eventKey.split(":").length > 2) {
        contextMenu.show({
          id: menuId,
          event: e.event,
          props: {
            key: e.node.props.eventKey,
            nodeData: e.node.props.nodeData,
            children: e.node.props.children
          }
        });
      }
      return;
    };
    return (
      <DirectoryTree
        switcherIcon={<Icon type="down" />}
        multiple
        defaultExpandAll
        onRightClick={onRightHandle}
        onSelect={(selectedKeys, event) => props.onSelect(selectedKeys, event)}
        selectedKeys={props.selectedKeys}
      >
        {RecursiveTree(treeData)}
      </DirectoryTree>
    );
  })
);

// 右侧视图
const ScheduleContent = inject(allStore => allStore.appstate)(
  observer(props => {
    const handleDateClick = arg => {
      console.log(arg);
      // alert(arg.dateStr);
    };
    const eventRender = info => {
      tippy(info.el, {
        content: info.event.extendedProps.description,
        trigger: "hover",
        animation: 'scale'
      });
    };
    return !props.panesData ? (
      <div style={{ minHeight: "250px" }}>
        <Empty
          description="Please select a schedule"
          style={{ paddingTop: "60px" }}
        />
      </div>
    ) : (
      <Tabs defaultActiveKey="1">
        <TabPane
          tab={
            <span>
              <Icon type="calendar" />
              Weekly Schedule
            </span>
          }
          key="1"
        >
          <div style={{ margin: "10px", width: "80%" }}>
            <FullCalendar
              defaultView="timeGridWeek"
              eventLimit="true"
              timeZone="UTC"
              nowIndicator="true"
              views={{
                timeGrid: {
                  eventLimit: 6 // adjust to 6 only for timeGridWeek/timeGridDay
                }
              }}
              plugins={[
                dayGridPlugin,
                interactionPlugin,
                resourceTimelinePlugin,
                timeGridPlugin,
                listPlugin
              ]}
              dateClick={handleDateClick}
              header={{
                left: "today prev,next",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay, listWeek"
              }}
              themeSystem="bootstrap"
              selectable={true}
              eventRender={eventRender}
              events={props.eventSource}
            />
          </div>
        </TabPane>
      </Tabs>
    );
  })
);

// 主视图
const ScheduleView = inject(allStore => allStore.appstate)(
  observer(props => {
    const [panesData, setPanesData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedKeys, setSelectedKeys] = useState([]);
    const [event, setEvent] = useState([]);

    // 获取指定周的时间
    const getWeekTime = day => {
      if (day === 7) {
        day = 0;
      }
      const now = new Date();
      // 当前周，将0转换为7
      const nowWeek = now.getDay();
      now.setDate(now.getDate() + (day - nowWeek));
      return now;
    };

    const onSelectHandle = (key, event) => {
      if (loading) {
        return;
      }
      setLoading(true);
      // 使用正则匹配key格式
      let pattern = /(\d)+:(\d)+:(\d)+$/;
      let match = pattern.test(key[0]);
      if (match) {
        // 读取schedule属性
        setSelectedKeys(key);
        const deviceKey = key[0];
        const deviceId = deviceKey.split(":")[0];
        const objType = deviceKey.split(":")[1];
        const objNum = deviceKey.split(":")[2];
        let propertyIdArr = [105, 54, 123, 38];
        let iter = propertyIdArr[Symbol.iterator]();
        const readSchedule = pram => {
          if (pram.done) {
            setLoading(false);
            setPanesData([{ title: key[0], key: "1" }]);
            return;
          }
          searchSchedule({
            deviceId,
            objType,
            objNum,
            propertyId: pram.value
          })
            .then(res => {
              const data = res["data"].data;
              if (pram.value === 123) {
                // 生成周期时间表
                const weekData = data.listOfResult;
                let event = [];
                for (const key in weekData) {
                  if (weekData.hasOwnProperty(key)) {
                    // const element = weekData[key];
                    let date = getWeekTime(Number(key));
                    event.push({
                      title: "Test",
                      start: `${date.getFullYear()}-${date.getMonth() +
                        1}-${date.getDate()}T14:30:00`,
                      backgroundColor: "green",
                      description: "This is a cool event"
                    });
                  }
                }
                setEvent(event);
                console.log(weekData);
              }
              console.log(data);
              readSchedule(iter.next());
            })
            .catch(err => {
              console.log(err);
            });
        };
        readSchedule(iter.next());
      }
    };

    const searchPropertiesClick = e => {};

    return (
      <div
        className="equipment-divier"
        style={{ borderBottom: "1px solid #ebedf0" }}
      >
        <PageHeader
          title="Schedule"
          style={{ borderBottom: "1px solid #ebedf0" }}
          subTitle="schedule Browser Manager"
        />
        <Row>
          <Col span={4}>
            <div
              style={{
                padding: "10px",
                borderRight: "1px solid #ebedf0",
                maxHeight: "680px",
                overflow: "scroll"
              }}
            >
              <RenderTreeNode
                onSelect={onSelectHandle}
                selectedKeys={selectedKeys}
              />
            </div>
          </Col>
          <Col span={20}>
            <Spin tip="Loading" spinning={loading}>
              <ScheduleContent panesData={panesData} eventSource={event} />
            </Spin>
          </Col>
        </Row>
        <MyAwesomeMenu searchPropertiesClick={searchPropertiesClick} />
      </div>
    );
  })
);

export default ScheduleView;
