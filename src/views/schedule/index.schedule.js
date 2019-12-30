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
import AddSchedule from "./AddSchedule";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/scale.css";
import "./calendar.scss";
const { TreeNode, DirectoryTree } = Tree;
const { TabPane } = Tabs;

const MyAwesomeMenu = props => (
  <Menu id="scheduleMenu">
    <Item onClick={props.deleteEventHandle}>delete</Item>
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
    const eventRender = info => {
      info.el.oncontextmenu = e => props.onContextMenu(e, info)
      info.el.ondblclick = e => props.onDblClick(e, info)
      info.el.onclick = e => props.eventOnClick(e, info)
      tippy(info.el, {
        content: info.event.extendedProps.description,
        trigger: "click",
        animation: "scale"
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
              editable={true}
              timeZone="local"
              scrollTime="08:00:00"
              dateClick={props.handleDateClick}
              eventResize={props.eventResize}
              eventDrop={props.eventDrop}
              select={props.handleDateSelect}
              businessHours={{
                daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
                startTime: "8:00", // a start time (10am in this example)
                endTime: "22:00"
              }}
              weekNumbers={true}
              weekNumbersWithinDays={true}
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
    const [visible, setVisible] = useState(false);

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

    // 日期格式化, 将 x:x:x 转换为 xx:xx:xx
    const timeFormat = time => {
      let pattern = /^(\d)+:(\d)+:(\d)+$/;
      if (pattern.test(time)) {
        let timeArr = time.split(":");
        let h = timeArr[0].length > 1 ? timeArr[0] : `0${timeArr[0]}`;
        let m = timeArr[1].length > 1 ? timeArr[1] : `0${timeArr[1]}`;
        let s = timeArr[2].length > 1 ? timeArr[2] : `0${timeArr[2]}`;
        return `${h}:${m}:${s}`;
      }
    };

    // 时间点击
    const handleDateClick = arg => {
      return;
      // setVisible(true);
    };

    // event ResizeStop
    const eventResizeHandle = info => {
      const eventData = info.event
      const start = eventData.start
      const end = eventData.end
      const id = eventData.id
      const nowEvent = event.map(list => {
        if (list.id === id) {
          list.start = start
          list.end = end
        }
        return list
      })
      setEvent(nowEvent)
    }

    // event Drop
    const eventDropHandle = info => {
      const eventData = info.event
      const start = eventData.start
      const end = eventData.end
      const id = eventData.id
      const nowEvent = event.map(list => {
        if (list.id === id) {
          list.start = start
          list.end = end
        }
        return list
      })
      setEvent(nowEvent)
    }

    // event ContextMenu
    const onContextMenuHandle = e => {
      const menuId = "scheduleMenu";
      e.preventDefault();
      contextMenu.show({
        id: menuId,
        event: e
      });
    };

    // event DblClick
    const onDblClickHandle = (e, info) => {
      const primaryKey = info.event.extendedProps.primaryKey
      setEvent(event.filter(list => list.primaryKey !== primaryKey))
    }

    // event Click
    const eventOnClickHandle = (e, info) => {
      console.log(info)
    }

    // 时间选择
    const handleDateSelect = info => {
      const start = info.startStr;
      const end = info.endStr;
      // 自定义event 用当前时间戳作为唯一主键
      const now = new Date()
      const primaryKey = `${now.getTime()}`
      setEvent([
        ...event,
        {
          primaryKey,
          title: "Test",
          start,
          end,
          backgroundColor: "red",
          description: "This is a cool event"
        }
      ]);
    };

    const handleCancel = () => {
      setVisible(false);
    };

    const handleCreate = function() {
      const { form } = this.formRef.props;
      form.validateFields((err, values) => {
        if (err) {
          return;
        }
        console.log("Received values of form: ", values);
        form.resetFields();
        setVisible(false);
      });
    };

    // 处理周期时间
    const weekTime = data => {
      const weekData = data.listOfResult;
      let event = [];
      for (const key in weekData) {
        const element = weekData[key];
        let primaryKey;
        let timeGroup = [];
        // 一维数组转换为二维, 每个数组存放四个元素，分别是开始时间，结束时间
        let timeArr = element.reduce((accumulator, currentValue, index) => {
          timeGroup.push(currentValue);
          if ((index + 1) % 4 === 0) {
            accumulator.push(timeGroup);
            timeGroup = [];
          }
          return accumulator;
        }, []);

        // 如果没有设定时间则跳出这次循环
        if (!timeArr.length) {
          event.push({id: key})
          continue;
        }
        let date = getWeekTime(Number(key));
        let year = date.getFullYear();
        let month =
          String(date.getMonth() + 1).length > 1
            ? date.getMonth() + 1
            : `0${date.getMonth() + 1}`;
        let day =
          String(date.getDate()).length > 1
            ? date.getDate()
            : `0${date.getDate()}`;
        
        timeArr.forEach((group, index) => {
          let startTime = timeFormat(group[0])
          let endTime = timeFormat(group[2])
          // 用日期 + 事件index标示唯一的主键
          primaryKey = `${year}-${month}-${day}-${index}`
          event.push({
            primaryKey,
            id: key,
            title: `${year}-${month}-${day}`,
            start: `${year}-${month}-${day}T${startTime}`,
            end: `${year}-${month}-${day}T${endTime}`,
            backgroundColor: "#00afad",
            description: "This is a cool event"
          });
        });
      }
      return event;
    };

    // 点击schedule Tree 事件
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
              console.log(data);
              if (pram.value === 123) {
                let event = weekTime(data);
                console.log(event)
                setEvent(event);
              }
              readSchedule(iter.next());
            })
            .catch(err => {
              console.log(err);
            });
        };
        readSchedule(iter.next());
      }
    };

    const deleteEventHandle = e => {
      console.log("delete");
    };

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
              <ScheduleContent
                panesData={panesData}
                eventSource={event}
                handleDateClick={handleDateClick}
                handleDateSelect={handleDateSelect}
                onContextMenu={onContextMenuHandle}
                onDblClick={onDblClickHandle}
                eventResize={eventResizeHandle}
                eventDrop={eventDropHandle}
                eventOnClick={eventOnClickHandle}
              />
              <AddSchedule
                visible={visible}
                onCancel={handleCancel}
                onCreate={handleCreate}
              />
            </Spin>
          </Col>
        </Row>
        <MyAwesomeMenu deleteEventHandle={deleteEventHandle} />
      </div>
    );
  })
);

export default ScheduleView;
