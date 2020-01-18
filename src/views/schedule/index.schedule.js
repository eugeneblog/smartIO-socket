/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useState, useEffect} from "react";
import {observer, inject} from "mobx-react";
import {
  PageHeader,
  Row,
  Col,
  Badge,
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
  Select
} from "antd";
import {Prompt} from "react-router-dom";
import {readDataBaseField, searchSchedule, writeShedule} from "../../api/index.api";
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

const {TreeNode, DirectoryTree} = Tree;
const {RangePicker} = DatePicker;
const {TabPane} = Tabs;

const MyAwesomeMenu = props => (
  <Menu id="scheduleMenu" theme={theme.dark} animation={animation.zoom}>
    <Item onClick={props.deleteEventHandle}>Delete</Item>
    <Separator/>
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
            return {...item, deviceName: res[index]["data"].value};
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
                  <Icon type="file" theme="twoTone"/>
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
        switcherIcon={<Icon type="down"/>}
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
  const {visible, attrData} = props;
  const {start, end} = attrData;
  return visible ? (
    <Descriptions
      title={`${props.title} ${attrData.id ? attrData.id : ""}`}
      bordered
      size="small"
      layout="vertical"
      column={1}
    >
      <Descriptions.Item label="Start time">
        <TimePicker allowClear={false}
                    onChange={(time, timeString) => props.timeChangeHandle(time, timeString, 'start', props.attrData)}
                    format={'HH:mm'} id="startTime"
                    value={moment(start, 'HH:mm:ss')}/>
      </Descriptions.Item>
      <Descriptions.Item label="End time">
        <TimePicker
          onChange={(time, timeString) => props.timeChangeHandle(time, timeString, 'end', props.attrData)}
          allowClear={false} format={'HH:mm'} id="endTime"
          value={moment(end, 'HH:mm:ss')}/>
      </Descriptions.Item>
    </Descriptions>
  ) : null;
};

// 有效周期
const EffectPeriod = (props) => {
  const onPanelChange = (value, mode) => {
    console.log(value, mode);
  };
  
  const onChangeDateHandle = (date, dateString) => {
    console.log(date, dateString);
  };
  
  const headerRender = ({value, type, onChange, onTypeChange}) => {
    const year = value.year();
    const options = [];
    for (let i = year - 10; i < year + 10; i += 1) {
      options.push(
        <Select.Option key={i} value={i} className="year-item">
          {i}
        </Select.Option>,
      );
    }
    return (
      <div style={{padding: 10}}>
        <Row type="flex" justify="space-between">
          <Col>
            <RangePicker onChange={onChangeDateHandle}/>
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
    <Calendar mode={"year"} headerRender={headerRender} onPanelChange={onPanelChange}/>
  )
};

// 右侧视图
const ScheduleContent = inject(allStore => allStore.appstate)(
  observer(props => {
    
    const eventRender = info => {
      info.el.oncontextmenu = e => props.onContextMenu(e, info);
      info.el.ondblclick = e => props.onDblClick(e, info);
      info.el.onclick = e => props.eventOnClick(e, info);
      // tippy(info.el, {
      //   content: info.event.extendedProps.description,
      //   trigger: "click",
      //   animation: "scale"
      // });
    };
    const dayRender = info => {
      info.el.oncontextmenu = e => {
        e.preventDefault();
        console.log(e);
      };
    };
    return !props.panesData ? (
      <div style={{minHeight: "250px"}}>
        <Empty
          description="Please select a schedule"
          style={{paddingTop: "60px"}}
        />
      </div>
    ) : (
      <Tabs defaultActiveKey="1">
        <TabPane
          tab={
            <span>
              <Icon type="calendar"/>
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
              <Icon type="carry-out"/>
              Effect Period
            </span>
          }
          key="2"
        >
          <EffectPeriod selectKey={props.selectKey} />
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
      const {extendedProps} = info.event;
      const primaryKey = extendedProps.primaryKey;
      addActiveEvent(primaryKey, event)
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
          event.push({id: key});
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
          
          let start = new Date(Number(year), Number(month), Number(day), Number(shour), Number(smint), Number(ssec));
          let end = new Date(Number(year), Number(month), Number(day), Number(ehour), Number(emint), Number(esec));
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
        message.warn('You operate too frequently, please wait for the program to load');
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
        const readSchedule = (pram, errIndex) => {
          if (pram.done) {
            setLoading(false);
            setPanesData([{title: key[0], key: "1"}]);
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
              readSchedule(iter.next());
            })
            .catch(err => {
              if (errIndex > 2) {
                return
              }
              readSchedule(values, errIndex += 1);
            });
        };
        readSchedule(values, 0);
      }
    };
    
    // 右侧选项改变事件
    const timeChangeHandle = (time, timeStr, point, allData) => {
      const newTime = time.toString();
      setEvent(event.map(item => {
        if (item.id === allData.id) {
          const newEvent = {
            ...item,
            [point]: new Date(newTime)
          };
          setSelEvent(newEvent);
          return newEvent
        }
        return item
      }));
    };
    
    // 右键删除
    const deleteEventHandle = e => {
      const {info} = e.props;
      const {extendedProps} = info.event;
      const primaryKey = extendedProps.primaryKey;
      setEvent(event.filter(list => list.primaryKey !== primaryKey));
      setSelEvent({});
      setShowAttr(false);
    };
    
    // 拷贝
    const copyEventHandle = e => {
      const {info} = e.props;
      const {start, end, backgroundColor, title, allDay} = info.event;
      const mirrorImg = {start, end, backgroundColor, title, allDay};
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
            }
          }
          setSelEvent(item);
          setShowAttr(true);
          return {
            ...item,
            className: "e-event-selected"
          }
        }
        return {
          ...item,
          className: ""
        }
      });
      setEvent(newEvent);
    };
    
    // 应用到设备
    const applidToDeviceHandle = (e) => {
      const originalKey = e.props.deviceId.split(":");
      const scheduleData = Array.from([1,2,3,4,5,6,7], x => [{}]);
      event.forEach((item) => {
        if (!item.start) {
          return
        }
        const week = item.start.getDay() === 0 ? 6 : item.start.getDay() - 1;
        if (scheduleData[week] && Object.keys(scheduleData[week][0]).length) {
          scheduleData[week].push({
            ...item
          });
          return
        }
        scheduleData[week] = [{
          ...item
        }]
      });
      console.log(scheduleData);
      writeShedule({
        deviceid: originalKey[0],
        objecttype: originalKey[1],
        objectnum: originalKey[2],
        propertyid: 123,
        scheduledata: scheduleData
      }).then(res => {
        console.log(res)
      });
    };
    
    // tree右键点击事件
    const treeRightClickHandle = (e) => {
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
        style={{borderBottom: "1px solid #ebedf0"}}
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
          style={{borderBottom: "1px solid #ebedf0"}}
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
        <TreeRightMenu
          applidToDevice={applidToDeviceHandle}
        />
      </div>
    );
  })
);

export default ScheduleView;