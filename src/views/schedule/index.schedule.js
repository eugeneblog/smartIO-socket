/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from "react";
import { observer, inject } from "mobx-react";
import {
  PageHeader,
  Row,
  Col,
  Icon,
  Tree,
  Tabs,
  Spin,
  Empty,
  Descriptions,
  TimePicker,
  message,
  Calendar,
  DatePicker,
  Select,
  Badge,
  Input,
  Progress,
  Modal,
  InputNumber
} from "antd";
import { Prompt } from "react-router-dom";
import {
  readDataBaseField,
  searchSchedule,
  writeShedule
} from "../../api/index.api";
import {
  Menu,
  Item,
  contextMenu,
  theme,
  animation,
  Separator
} from "react-contexify";
import moment from "moment";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import listPlugin from "@fullcalendar/list";
import "./calendar.scss";

const { TreeNode, DirectoryTree } = Tree;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { TextArea } = Input;

const MyAwesomeMenu = props => (
  <Menu id="scheduleMenu" theme={theme.dark} animation={animation.zoom}>
    <Item onClick={props.deleteEventHandle}>Delete</Item>
    <Separator />
    <Item onClick={props.copyEventHandle}>Copy</Item>
    <Item onClick={props.pasteEventHandle}>Paste</Item>
  </Menu>
);

const TreeRightMenu = props => (
  <Menu id="scheduleTreeMenu">
    <Item onClick={props.applidToDevice}>Appled to device</Item>
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
          let nodeData = {};
          key = !prefix ? `${item.objectName}` : `${prefix}:${item.objectName}`;
          const title = (
            <span>
              {item.text
                ? `${item.text} ${
                    item.children.length ? `(${item.children.length})` : ""
                  }`
                : `${item.deviceName}`}
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

    return (
      <DirectoryTree
        switcherIcon={<Icon type="down" />}
        multiple
        onSelect={(selectedKeys, event) => props.onSelect(selectedKeys, event)}
        selectedKeys={props.selectedKeys}
        onRightClick={props.treeRightClick}
      >
        {RecursiveTree(treeData)}
      </DirectoryTree>
    );
  })
);

// 属性视图
const ScheduleAttribute = props => {
  const { visible, attrData } = props;
  const { start, end } = attrData;
  return visible ? (
    <Descriptions
      title={`${props.title} ${attrData.id ? attrData.id : ""}`}
      bordered
      size="small"
      layout="vertical"
      column={1}
    >
      <Descriptions.Item label="Start time">
        <TimePicker
          allowClear={false}
          onChange={(time, timeString) =>
            props.timeChangeHandle(time, timeString, "start", props.attrData)
          }
          format={"HH:mm"}
          id="startTime"
          value={moment(start, "HH:mm:ss")}
        />
      </Descriptions.Item>
      <Descriptions.Item label="End time">
        <TimePicker
          onChange={(time, timeString) =>
            props.timeChangeHandle(time, timeString, "end", props.attrData)
          }
          allowClear={false}
          format={"HH:mm"}
          id="endTime"
          value={moment(end, "HH:mm:ss")}
        />
      </Descriptions.Item>
    </Descriptions>
  ) : null;
};

// 有效周期
const EffectPeriod = props => {
  const [startTime, setStartTime] = useState(moment("00:00:00", "HH:mm:ss"));
  const [endTime, setEndTime] = useState(moment("11:59:59", "HH:mm:ss"));

  const onPanelChange = (value, mode) => {
    console.log(value, mode);
  };

  // 日期改变事件
  const onChangeDateHandle = date => {
    setStartTime(date[0]);
    setEndTime(date[1]);
  };

  const getMonthData = value => {
    if (value.month() === 8) {
      return 1394;
    }
  };

  // 自定义月渲染
  const monthCellRender = value => {
    const num = getMonthData(value);
    return num ? (
      <div className="notes-month">
        <section>{num}</section>
        <span>Backlog number</span>
      </div>
    ) : null;
  };

  // 自定义头渲染
  const headerRender = ({ value, type, onChange, onTypeChange }) => {
    const year = value.year();
    const options = [];
    for (let i = year - 10; i < year + 10; i += 1) {
      options.push(
        <Select.Option key={i} value={i} className="year-item">
          {i}
        </Select.Option>
      );
    }
    return (
      <div style={{ padding: 10 }}>
        <Row type="flex" justify="space-between">
          <Col>
            <RangePicker
              onChange={onChangeDateHandle}
              defaultValue={[startTime, endTime]}
              showTime={{
                hideDisabledOptions: true,
                defaultValue: [startTime, endTime]
              }}
              format="YYYY-MM-DD HH:mm:ss"
            />
          </Col>
          <Col>
            <Select
              size="small"
              dropdownMatchSelectWidth={false}
              className="my-year-select"
              onChange={newYear => {
                const now = value.clone().year(newYear);
                onChange(now);
              }}
              value={String(year)}
            >
              {options}
            </Select>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <Calendar
      mode={"year"}
      headerRender={headerRender}
      onPanelChange={onPanelChange}
      monthCellRender={monthCellRender}
    />
  );
};

// 时间表基础信息
const ScheduleBase = inject(allStore => allStore.appstate)(
  observer(props => {
    const [useComp, setUseComp] = useState(null)
    const {
      OBJECT_NAME,
      PRIORITY_FOR_WRITING,
      PRESENT_VALUE,
      SCHEDULE_DEFAULT,
      DESCRIPTION
    } = props.schedulestate.infoSchedule.data;
    const priorityList = [
      { name: "Manual-Life Safety", val: "1" },
      { name: "Automatic-Life Safety", val: "2" },
      { name: "Available", val: "3" },
      { name: "Available", val: "4" },
      { name: "Critical Equipment Control", val: "5" },
      { name: "Minimum On/Off", val: "6" },
      { name: "Available", val: "7" },
      { name: "Manual Operator", val: "8" },
      { name: "Available", val: "9" },
      { name: "Available", val: "10" },
      { name: "Available", val: "11" },
      { name: "Available", val: "12" },
      { name: "Available", val: "13" },
      { name: "Available", val: "14" },
      { name: "Available", val: "15" },
      { name: "Available", val: "16" }
    ];
    const defaultValList = [
      { name: "TAG_NULL", val: "0" },
      { name: "TAG_BOOLEAN", val: "1" },
      { name: "TAG_UNSIGNED_INT", val: "2" },
      { name: "TAG_SIGNED_INT", val: "3" },
      { name: "TAG_REAL", val: "4" },
      { name: "TAG_DOUBLE", val: "5" },
      { name: "TAG_ENUMERATED", val: "9" }
    ];

    const selectOnChange = (e, target) => {
      props.schedulestate.infoSchedule.data[target] = e;
    };

    const textAreaChangeHand = ({ target: { value } }) => {
      props.schedulestate.infoSchedule.data["DESCRIPTION"] = value;
    };

    const conditionsCom = (type) => {
      switch (Number(type)) {
        case 0:
          return (
            <Input
              disabled
              style={{ width: 100 }}
              value="null"
              placeholder="Ban on input"
            />
          );
        case 1:
          return (
            <Select style={{ width: 100 }} defaultValue="true">
              <Select.Option value="true">True</Select.Option>
              <Select.Option value="false">False</Select.Option>
            </Select>
          );
        default:
          return (
            <InputNumber style={{ width: 100 }} min={0} defaultValue={0} />
          );
      }
    }

    return (
      <Descriptions bordered>
        <Descriptions.Item label="Object Name">{OBJECT_NAME}</Descriptions.Item>
        <Descriptions.Item label="priority" span={2}>
          <Select
            style={{ width: 200 }}
            value={PRIORITY_FOR_WRITING}
            onChange={e => selectOnChange(e, "PRIORITY_FOR_WRITING")}
            defaultValue={PRIORITY_FOR_WRITING}
          >
            {priorityList.map((item, key) => (
              <Select.Option key={key} value={item.val}>
                {`${item.val}.${item.name}`}
              </Select.Option>
            ))}
          </Select>
        </Descriptions.Item>
        <Descriptions.Item label="The current value">
          {PRESENT_VALUE}
        </Descriptions.Item>
        <Descriptions.Item label="The default value" span={2}>
          <Input.Group compact>
            <Select
              style={{ width: 200 }}
              onChange={val => {
                setUseComp(val);
                return selectOnChange(val, "SCHEDULE_DEFAULT");
              }}
              value={SCHEDULE_DEFAULT || null}
              defaultValue={SCHEDULE_DEFAULT || null}
            >
              {defaultValList.map((item, key) => (
                <Select.Option key={key} value={item.val}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
            {conditionsCom(useComp)}
          </Input.Group>
        </Descriptions.Item>
        <Descriptions.Item label="Status" span={3}>
          <Badge status="processing" text="Running" />
        </Descriptions.Item>
        <Descriptions.Item label="Describe">
          <TextArea
            value={DESCRIPTION || ""}
            placeholder="Controlled autosize"
            autosize={{ minRows: 3, maxRows: 5 }}
            onChange={textAreaChangeHand}
          />
        </Descriptions.Item>
      </Descriptions>
    );
  })
);

// 右侧视图
const ScheduleContent = inject(allStore => allStore.appstate)(
  observer(props => {
    const eventRender = info => {
      info.el.oncontextmenu = e => props.onContextMenu(e, info);
      info.el.ondblclick = e => props.onDblClick(e, info);
      info.el.onclick = e => props.eventOnClick(e, info);
    };
    const dayRender = info => {
      info.el.oncontextmenu = e => {
        e.preventDefault();
        console.log(e);
      };
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
          <Row>
            <Col span={20}>
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
                dayRender={dayRender}
                events={props.eventSource}
              />
            </Col>
            <Col span={4}>
              <ScheduleAttribute
                visible={props.visible}
                attrData={props.attrData || {}}
                timeChangeHandle={props.timeChangeHandle}
                title="Event"
              />
            </Col>
          </Row>
        </TabPane>
        <TabPane
          tab={
            <span>
              <Icon type="carry-out" />
              Effect Period
            </span>
          }
          key="2"
        >
          <EffectPeriod selectKey={props.selectKey} />
        </TabPane>
        <TabPane
          tab={
            <span>
              <Icon type="container" />
              The basic information
            </span>
          }
          key="3"
        >
          <ScheduleBase />
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
    const [selectedEvent, setSelEvent] = useState([]);
    const [cache, setCache] = useState({});
    const [isShowAttr, setShowAttr] = useState(false);

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
      const eventData = info.event;
      const start = eventData.start;
      const end = eventData.end;
      const id = eventData.id;
      const nowEvent = event.map(list => {
        if (list.id === id) {
          return {
            ...list,
            start,
            end
          };
        }
        return list;
      });
      setEvent(nowEvent);
      props.appstate.isBlocking = true;
    };

    // event Drop
    const eventDropHandle = info => {
      const eventData = info.event;
      const start = eventData.start;
      const end = eventData.end;
      const id = eventData.id;
      const nowEvent = event.map(list => {
        if (list.id === id) {
          list.start = start;
          list.end = end;
        }
        return list;
      });
      setEvent(nowEvent);
      props.appstate.isBlocking = true;
    };

    // event ContextMenu
    const onContextMenuHandle = (e, info) => {
      const menuId = "scheduleMenu";
      e.preventDefault();
      contextMenu.show({
        id: menuId,
        event: e,
        props: {
          info
        }
      });
    };

    // event DblClick
    const onDblClickHandle = (e, info) => {
      const primaryKey = info.event.extendedProps.primaryKey;
      setEvent(event.filter(list => list.primaryKey !== primaryKey));
      props.appstate.isBlocking = true;
      setSelEvent({});
      setShowAttr(false);
    };

    // event Click
    const eventOnClickHandle = (e, info) => {
      const { extendedProps } = info.event;
      const primaryKey = extendedProps.primaryKey;
      addActiveEvent(primaryKey, event);
    };

    // 时间选择
    const handleDateSelect = info => {
      const start = info.start;
      const end = info.end;
      // 自定义event 用当前时间戳作为唯一主键
      const now = new Date();
      const primaryKey = `${now.getTime()}`;
      const newEvent = {
        id: primaryKey,
        primaryKey,
        title: "Test",
        start,
        end,
        backgroundColor: "red",
        description: "This is a cool event"
      };
      addActiveEvent(primaryKey, [...event, newEvent]);
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
          event.push({ id: key });
          continue;
        }
        let date = getWeekTime(Number(key));
        let year = date.getFullYear();
        let month = date.getMonth();
        let day =
          String(date.getDate()).length > 1
            ? date.getDate()
            : `0${date.getDate()}`;

        timeArr.forEach((group, index) => {
          let startTime = timeFormat(group[0]);
          let startVal = group[1];
          let endTime = timeFormat(group[2]);
          let endVal = group[3];
          let shour = startTime.split(":")[0];
          let smint = startTime.split(":")[1];
          let ssec = startTime.split(":")[2];

          let ehour = endTime.split(":")[0];
          let emint = endTime.split(":")[1];
          let esec = endTime.split(":")[2];

          let start = new Date(
            Number(year),
            Number(month),
            Number(day),
            Number(shour),
            Number(smint),
            Number(ssec)
          );
          let end = new Date(
            Number(year),
            Number(month),
            Number(day),
            Number(ehour),
            Number(emint),
            Number(esec)
          );
          // 用日期 + 事件index标示唯一的主键
          primaryKey = `${year}-${month}-${day}-${index}`;

          event.push({
            primaryKey,
            id: key,
            title: `${year}-${month}-${day}`,
            start,
            startVal,
            endVal,
            end,
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
        message.warn(
          "You operate too frequently, please wait for the program to load"
        );
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
        let propertyIdArr = [123, 38, 54, 105]; // 38, 54
        let iter = propertyIdArr[Symbol.iterator]();
        let values = iter.next();
        // 检查设备是否在线

        // 读取该设备下的时间表
        const readSchedule = (pram, errIndex) => {
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
              console.log(data, pram.value);
              // 周期时间表
              if (pram.value === 123) {
                let event = weekTime(data);
                setEvent(event);
              }
              if (pram.value === 105) {
                data.listOfResult.forEach(list => {
                  const attrName = list["object_type_text"];
                  props.schedulestate.infoSchedule.data[attrName] = list.val;
                });
              }
              readSchedule(iter.next());
            })
            .catch(err => {
              if (errIndex > 2) {
                return;
              }
              readSchedule(values, (errIndex += 1));
            });
        };
        readSchedule(values, 0);
      }
    };

    // 右侧选项改变事件
    const timeChangeHandle = (time, timeStr, point, allData) => {
      const newTime = time.toString();
      setEvent(
        event.map(item => {
          if (item.id === allData.id) {
            const newEvent = {
              ...item,
              [point]: new Date(newTime)
            };
            setSelEvent(newEvent);
            return newEvent;
          }
          return item;
        })
      );
    };

    // 右键删除
    const deleteEventHandle = e => {
      const { info } = e.props;
      const { extendedProps } = info.event;
      const primaryKey = extendedProps.primaryKey;
      setEvent(event.filter(list => list.primaryKey !== primaryKey));
      setSelEvent({});
      setShowAttr(false);
    };

    // 拷贝
    const copyEventHandle = e => {
      const { info } = e.props;
      const { start, end, backgroundColor, title, allDay } = info.event;
      const mirrorImg = { start, end, backgroundColor, title, allDay };
      setCache(mirrorImg);
    };

    // 粘贴
    const pasteEventHandle = e => {
      // 判断cache是否有值
      const isNullCache = JSON.stringify(cache) === "{}";
      if (!isNullCache) {
        console.log(cache);
      }
      return;
    };

    // 添加选中样式
    const addActiveEvent = (primaryKey, events) => {
      // 删除所有event样式
      const newEvent = events.map(item => {
        if (item.primaryKey === primaryKey) {
          if (item.className) {
            setSelEvent({});
            setShowAttr(false);
            return {
              ...item,
              className: ""
            };
          }
          setSelEvent(item);
          setShowAttr(true);
          return {
            ...item,
            className: "e-event-selected"
          };
        }
        return {
          ...item,
          className: ""
        };
      });
      setEvent(newEvent);
    };

    // 应用到设备
    const applidToDeviceHandle = e => {
      console.log(e);
      const modal = Modal.info({
        title: "Click the start button to apply to the device",
        okText: "Start",
        content: (
          <Progress
            strokeColor={{
              from: "#108ee9",
              to: "#87d068"
            }}
            percent={0}
            status="active"
          />
        ),
        maskClosable: true,
        okButtonProps: {
          onClick: () => {
            recursiveWrite(iter);
          }
        }
      });
      let now = 0;
      const originalKey = e.props.deviceId.split(":");
      const scheduleData = Array.from([1, 2, 3, 4, 5, 6, 7], x => [{}]);
      event.forEach(item => {
        if (!item.start) {
          return;
        }
        const week = item.start.getDay() === 0 ? 6 : item.start.getDay() - 1;
        if (scheduleData[week] && Object.keys(scheduleData[week][0]).length) {
          scheduleData[week].push({ ...item });
          return;
        }
        scheduleData[week] = [{ ...item }];
      });
      const datas = [
        { propertyid: 123, data: scheduleData },
        {
          propertyid: 88,
          data: props.schedulestate.infoSchedule.data["PRIORITY_FOR_WRITING"]
        },
        {
          propertyid: 77,
          data: `schedule${originalKey[2]}`
        },
        {
          propertyid: 28,
          data: props.schedulestate.infoSchedule.data["DESCRIPTION"]
        },
        {
          propertyid: 174,
          data: {
            type: "",
            val: 3
          }
        }
      ];
      const iter = datas[Symbol.iterator]();
      const recursiveWrite = function(iter) {
        const nextVal = iter.next();
        if (nextVal.done) {
          return;
        }
        writeShedule({
          deviceid: originalKey[0],
          objecttype: originalKey[1],
          objectnum: originalKey[2],
          propertyid: nextVal["value"].propertyid,
          scheduledata: nextVal["value"]
        })
          .then(res => {
            now += 1;
            if (now === datas.length) {
              setTimeout(() => {
                modal.destroy();
              }, 1000);
            }
            recursiveWrite(iter);
            modal.update({
              content: (
                <Progress
                  strokeColor={{
                    from: "#108ee9",
                    to: "#87d068"
                  }}
                  percent={(now / datas.length) * 100}
                  status="active"
                />
              ),
              okButtonProps: {
                loading: now < datas.length
              }
            });
            console.log(res);
          })
          .catch(err => {
            console.log(err);
            return;
          });
      };
    };

    // tree右键点击事件
    const treeRightClickHandle = e => {
      const menuId = "scheduleTreeMenu";
      const { eventKey } = e.node.props;
      e.event.preventDefault();
      // 获取被右击的节点, 只有父节点才能响应右键
      if (eventKey.split(":").length > 2) {
        contextMenu.show({
          id: menuId,
          event: e.event,
          props: {
            deviceId: e.node.props.eventKey,
            nodeData: e.node.props.nodeData
          }
        });
      }
    };

    return (
      <div
        className="equipment-divier"
        style={{ borderBottom: "1px solid #ebedf0" }}
      >
        <Prompt
          message={location => {
            if (props.appstate.isBlocking) {
              let leave = window.confirm(
                "You have not applied the modification, leaving the data will be lost, are you sure to continue?"
              );
              if (leave) {
                props.appstate.isBlocking = false;
                return;
              }
              props.appstate.isBlocking = true;
              return false;
            }
          }}
        />
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
                treeRightClick={treeRightClickHandle}
              />
            </div>
          </Col>
          <Col span={20}>
            <Spin tip="Loading" spinning={loading}>
              <ScheduleContent
                selectKey={selectedKeys}
                panesData={panesData}
                eventSource={event}
                handleDateClick={handleDateClick}
                handleDateSelect={handleDateSelect}
                onContextMenu={onContextMenuHandle}
                onDblClick={onDblClickHandle}
                eventResize={eventResizeHandle}
                eventDrop={eventDropHandle}
                eventOnClick={eventOnClickHandle}
                visible={isShowAttr}
                attrData={selectedEvent}
                timeChangeHandle={timeChangeHandle}
              />
            </Spin>
          </Col>
        </Row>
        <MyAwesomeMenu
          deleteEventHandle={deleteEventHandle}
          copyEventHandle={copyEventHandle}
          pasteEventHandle={pasteEventHandle}
        />
        <TreeRightMenu applidToDevice={applidToDeviceHandle} />
      </div>
    );
  })
);

export default ScheduleView;
