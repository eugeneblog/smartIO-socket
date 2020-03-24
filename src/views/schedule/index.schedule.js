/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useState, useEffect} from "react";
import {observer, inject} from "mobx-react";
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
  DatePicker,
  Select,
  Badge,
  Input,
  Progress,
  Modal,
  InputNumber,
  Radio,
  Button,
  Table
} from "antd";
import {Prompt} from "react-router-dom";
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
import Moment from "moment";
import {extendMoment} from "moment-range";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import listPlugin from "@fullcalendar/list";
import {BACNET_OBJECT_TYPE} from '../../utils/BAC_DECODE_TEXT'
import {getPropertyIdText} from '../../utils/util';
import './index.scss'
import "./calendar.scss";

const InputGroup = Input.Group;

const moment = extendMoment(Moment);
const {TreeNode, DirectoryTree} = Tree;
const {RangePicker} = DatePicker;
const {TabPane} = Tabs;
const {TextArea} = Input;

const MyAwesomeMenu = props => (
  <Menu id="scheduleMenu" theme={theme.dark} animation={animation.zoom}>
    <Item onClick={props.deleteEventHandle}>Delete</Item>
    <Separator/>
    <Item onClick={props.copyEventHandle}>Copy</Item>
    <Item onClick={props.pasteEventHandle}>Paste</Item>
  </Menu>
);

const TreeRightMenu = props => {
  return (
    <Menu id="scheduleTreeMenu">
      <Item onClick={props.applidToDevice} disabled={props.isDisabled}>
        Appled to device
      </Item>
    </Menu>
  );
};

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
              selectable={!item.children.length}
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
              isLeaf={!item.children.length}
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
const EffectPeriod = inject(allStore => allStore.appstate)(
  observer(props => {
    const [startTime, setStartTime] = useState(
      moment(new Date(Date.now()), "HH:mm:ss")
    );
    const [endTime, setEndTime] = useState(
      moment(new Date(2012, 4, 23), "HH:mm:ss")
    );
    const [radioVal, setRadioVal] = useState(1);
    const [disabled, setDisabled] = useState(true);
    
    // 更新props有效周期数据
    const setPropsEffectPeriod = () => {
      const startYear = startTime.year();
      const startMonth = startTime.month();
      const startDay = startTime.day();
      const endYear = endTime.year();
      const endMonth = endTime.month();
      const endDay = endTime.day();
      
      props.schedulestate.effectPeriod = [
        `${startYear}-${startMonth}-${startDay}`,
        `${endYear}-${endMonth}-${endDay}`
      ];
    };
    // 创建时长 (有效期)
    const radioChange = e => {
      const val = e.target.value;
      if (val === 1) {
        props.schedulestate.effectPeriod = ["2155-255-255", "2155-255-255"];
      } else {
        setPropsEffectPeriod();
      }
      // 自定义
      setRadioVal(val);
      setDisabled(val === 1);
    };
    
    // 日期改变事件
    const onChangeDateHandle = date => {
      setPropsEffectPeriod();
      setStartTime(date[0]);
      setEndTime(date[1]);
    };
    
    return (
      <div>
        <Radio.Group onChange={radioChange} value={radioVal}>
          <Radio value={1}>Infinity</Radio>
          <Radio value={2}>The custom</Radio>
        </Radio.Group>
        <RangePicker
          disabled={disabled}
          onChange={onChangeDateHandle}
          defaultValue={[startTime, endTime]}
          showTime={{
            hideDisabledOptions: true,
            defaultValue: [startTime, endTime]
          }}
          ranges={{
            Today: [moment(), moment()],
            "This Month": [moment().startOf("month"), moment().endOf("month")],
            "This Year": [moment().startOf("year"), moment().endOf("year")]
          }}
          format="YYYY-MM-DD HH:mm:ss"
        />
      </div>
    );
  })
);

// 时间表基础信息
const ScheduleBase = inject(allStore => allStore.appstate)(
  observer(props => {
    const [useComp, setUseComp] = useState(null);
    const {
      OBJECT_NAME,
      PRIORITY_FOR_WRITING,
      PRESENT_VALUE,
      SCHEDULE_DEFAULT,
      DESCRIPTION
    } = props.schedulestate.infoSchedule.data;
    const priorityList = [
      {name: "Manual-Life Safety", val: "1"},
      {name: "Automatic-Life Safety", val: "2"},
      {name: "Available", val: "3"},
      {name: "Available", val: "4"},
      {name: "Critical Equipment Control", val: "5"},
      {name: "Minimum On/Off", val: "6"},
      {name: "Available", val: "7"},
      {name: "Manual Operator", val: "8"},
      {name: "Available", val: "9"},
      {name: "Available", val: "10"},
      {name: "Available", val: "11"},
      {name: "Available", val: "12"},
      {name: "Available", val: "13"},
      {name: "Available", val: "14"},
      {name: "Available", val: "15"},
      {name: "Available", val: "16"}
    ];
    const defaultValList = [
      {name: "TAG_NULL", val: "0"},
      {name: "TAG_BOOLEAN", val: "1"},
      {name: "TAG_UNSIGNED_INT", val: "2"},
      {name: "TAG_SIGNED_INT", val: "3"},
      {name: "TAG_REAL", val: "4"},
      {name: "TAG_DOUBLE", val: "5"},
      {name: "TAG_ENUMERATED", val: "9"}
    ];
    
    const selectOnChange = (e, target) => {
      props.schedulestate.infoSchedule.data[target] = e;
    };
    
    const textAreaChangeHand = ({target: {value}}) => {
      props.schedulestate.infoSchedule.data["DESCRIPTION"] = value;
    };
    
    const conditionsCom = (type, val) => {
      switch (Number(type)) {
        case 0: // 只能是null
          return (
            <Input
              disabled
              style={{width: 100}}
              onChange={e => selectOnChange(e, "SCHEDULE_DEFAULT")}
              value="null"
              placeholder="Ban on input"
            />
          );
        case 1:
          return (
            <Select
              style={{width: 100}}
              onChange={e => selectOnChange(e, "SCHEDULE_DEFAULT")}
              value={val ? 1 : 0}
              defaultValue={1}
            >
              <Select.Option value={1}>True</Select.Option>
              <Select.Option value={0}>False</Select.Option>
            </Select>
          );
        default:
          return (
            <InputNumber
              onChange={e => selectOnChange(e, "SCHEDULE_DEFAULT")}
              style={{width: 100}}
              value={val}
              min={0}
              defaultValue={0}
            />
          );
      }
    };
    
    return (
      <Descriptions bordered>
        <Descriptions.Item label="Object Name">{OBJECT_NAME}</Descriptions.Item>
        <Descriptions.Item label="priority" span={2}>
          <Select
            style={{width: 200}}
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
              style={{width: 200}}
              onChange={val => {
                setUseComp(val);
                props.schedulestate.defaultType = val;
              }}
              value={props.schedulestate.defaultType}
              defaultValue={null}
            >
              {defaultValList.map((item, key) => (
                <Select.Option key={key} value={item.val}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
            {conditionsCom(useComp, SCHEDULE_DEFAULT)}
          </Input.Group>
        </Descriptions.Item>
        <Descriptions.Item label="Status" span={3}>
          <Badge status="processing" text="Running"/>
        </Descriptions.Item>
        <Descriptions.Item label="Describe">
          <TextArea
            value={DESCRIPTION || ""}
            placeholder="Controlled autosize"
            autoSize={{minRows: 3, maxRows: 5}}
            onChange={textAreaChangeHand}
          />
        </Descriptions.Item>
      </Descriptions>
    );
  })
);

// 例外时间表
const Execption = inject(allStore => allStore.appstate)(
  observer(props => {
    const [event, setEvent] = useState([]);
    const [dataRange, setDateRange] = useState([]);
    const [selectedIndex, setSelEvent] = useState('');
    const [isShowAttr, setShowAttr] = useState(false);
    const [repetitionType, setRepetitionType] = useState("costom");
    const {
      execptionTab,
      selectExecption,
      getSeleExecpTabDate,
      getExecptionTimes
    } = props.schedulestate;
    
    useEffect(() => {
      timeToView(getSeleExecpTabDate.segment1);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getSeleExecpTabDate]);
    
    const timeType = (dates) => {
      if (!dates.length) {
        return [
          {
            type: 'disposable',
            text: 'disposable'
          }, {
            type: 'everyday',
            text: 'everyday'
          }, {
            type: 'weekly',
            text: 'weekly'
          }, {
            type: 'monthly',
            text: 'monthly'
          }, {
            type: 'monthlyOf',
            text: 'monthlyOf'
          }, {
            type: 'custom',
            text: 'custom'
          }]
      }
      const weekStr = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return [
        {
          type: 'disposable',
          text: 'disposable'
        }, {
          type: 'everyday',
          text: 'everyday'
        }, {
          type: 'weekly',
          text: `${weekStr[dates[0].weekday()]} of the week`
        }, {
          type: 'monthly',
          text: `${dates[0].date()} a month`
        }, {
          type: 'monthlyOf',
          text: `The ${Math.ceil(dates[0].date() / 7)} (${weekStr[dates[0].weekday()]})of each month`
        }, {
          type: 'custom',
          text: 'custom'
        }];
    };
    
    // 时间单元格渲染, 利用穷举法显示法定节假日
    const dateRangeRender = (current) => {
      const style = {};
      if (current.date() === 1) {
        style.border = '1px solid #1890ff';
        style.borderRadius = '50%';
        return <div className="ant-calendar-date" style={style}>
          <Badge color="#87d068">
            {current.date()}
          </Badge>
        </div>
      }
      return (
        <div className="ant-calendar-date" style={style}>
          {current.date()}
        </div>
      );
    };
    
    // 根据时间类型生成不同的时间格式，用于返回后端
    const timeTypeTranstion = function (type, time) {
      const [start] = time;
      switch (type) {
        case "disposable":
          return time.map(date => {
            return {
              val: `${date.year()}-${date.month() + 1}-${date.date()}(${date.weekday()})`
            }
          });
        case "everyday":
          return [{val: '2155-255-255(255)'}];
        case "weekly":
          return [{val: `0-255-255(${start.weekday()})`}];
        case "monthly":
          return [{val: `0-255-${start.date()}(${start.weekday()})`}];
        case "monthlyOf":
          const howWeek = Math.floor(start.date() / 7);
          return [{val: `0-${start.month() + 1}-${howWeek}(${start.weekday()})`}];
        default:
          return time;
      }
    };
    
    // 时间转换为类型
    const timeToType = function (time) {
      // 每一天
      if (/^(2155)-(255)-(255)(\(255\))/.test(time)) {
        return 'everyday'
      }
      // weekly 每一周
      if (/^(0)-(255)-(255)\([0-6]\)/.test(time)) {
        return 'weekly'
      }
      // monthly 每一月
      if (/^(0)-(255)-([0-9])(\([0-6]\))/.test(time)) {
        return 'monthly'
      }
      // monthlyOf 一个月之间， 例如(n月n个星期n天)
      if (/^(0)-(\d{1,2})-(\d)(\([0-5]\))/.test(time)) {
        return 'monthlyOf'
      } else {
        return null;
      }
    };
    
    // 根据时间格式改变视图
    const timeToView = function (segment) {
      // 区分有时间范围的时间格式和其他格式
      if (segment.length < 2) {
        const date = segment[0].val;
        setDateRange([moment(Date.now()), moment(Date.now())]);
        setRepetitionType(timeToType(date))
      } else {
        const [start, end] = segment;
        setRepetitionType('disposable');
        setDateRange([moment(start.val, 'YYYY-M-D'), moment(end.val, 'YYYY-M-D')]);
      }
    };
    
    // 时间范围选择
    const onChangeDateHandle = (date) => {
      setDateRange(date);
      props.schedulestate.setExecptioDate(timeTypeTranstion(repetitionType, date));
    };
    
    // 重复形式选择
    const repetitionHandle = type => {
      const transtionDate = timeTypeTranstion(type, dataRange);
      setRepetitionType(type);
      props.schedulestate.setExecptioDate(transtionDate);
      console.log(transtionDate);
    };
    
    // 创建新的例外时间表
    const createTab = () => {
      props.schedulestate.createExecption();
      message.success('New success')
    };
    
    // 读取优先级
    const readpriority = (segment) => {
      const priorityData = [1, 2, 3, 4, 5];
      const selectPriorityChange = val => {
        // props
        getSeleExecpTabDate.segment3 = [{tag: 10, val}];
      };
      return <Select style={{width: 200}} value={segment[0].val} onChange={selectPriorityChange}>
        {
          priorityData.map((item) => (<Select.Option key={item} value={item}>{item}</Select.Option>))
        }
      </Select>;
    };
    
    const tabSelOnChange = target => {
      // 读取该表下的所有内容
      props.schedulestate.selectExecption = target;
    };
    
    // 日历单元点击事件
    const calendarDateClick = e => {
      console.log(e)
    };
    
    // 日历event改变事件
    const calendarResize = info => {
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
    };
    
    // 日历event拖拽事件
    const calendarDrop = info => {
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
    };
    
    // 日历event选择事件
    const calendarDateSelect = info => {
      const start = info.start;
      const end = info.end;
      // 自定义event 用当前时间戳作为唯一主键
      const now = new Date();
      const primaryKey = `${now.getTime()}`;
      const newEvent = {
        id: primaryKey,
        primaryKey,
        title: "Test",
        type: "boolean",
        value: true,
        start,
        end,
        backgroundColor: "#e0edf9",
        textColor: "#5392da",
        description: "This is a cool event"
      };
      setEvent([...event, newEvent]);
    };
    
    const eventRender = info => {
      // info.el.oncontextmenu = e => props.onContextMenu(e, info);
      info.el.ondblclick = e => eventDblClick(e, info);
      info.el.onclick = e => eventOnClick(e, info);
    };
    
    // 日历单机事件
    const eventOnClick = (e, info) => {
      const {extendedProps} = info.event;
      const primaryKey = extendedProps.primaryKey;
      addActiveEvent(primaryKey, event);
    };
    
    // 添加选中样式
    const addActiveEvent = (primaryKey, events) => {
      // 删除所有event样式
      const newEvent = events.map((item, ind) => {
        if (item.primaryKey === primaryKey) {
          if (item.className) {
            setSelEvent('');
            setShowAttr(false);
            return {
              ...item,
              className: ""
            };
          }
          setSelEvent(ind);
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
    
    // 日历event双击事件
    const eventDblClick = (e, info) => {
      const primaryKey = info.event.extendedProps.primaryKey;
      setEvent(event.filter(list => list.primaryKey !== primaryKey));
    };
    
    // 时间改变事件
    const timeChangeHandle = (moment, node) => {
      setEvent(event.map((item, ind) => {
        if (Number(selectedIndex) === ind) {
          return {
            ...item,
            [node]: moment.toDate()
          };
        }
        return item
      }))
    };
    
    return (
      <Descriptions bordered>
        <Descriptions.Item label="Select Table" span={3}>
          <InputGroup compact>
            <Select
              onChange={tabSelOnChange}
              style={{width: 200}}
              defaultValue={selectExecption}
              value={selectExecption}
            >
              {execptionTab.slice(0).map((item, key) => (
                <Select.Option value={item} key={key}>
                  {item}
                </Select.Option>
              ))}
            </Select>
            <Button onClick={createTab}>New Table</Button>
          </InputGroup>
        </Descriptions.Item>
        <Descriptions.Item label="Period" span={3}>
          <RangePicker
            onChange={onChangeDateHandle}
            defaultValue={dataRange}
            dateRender={dateRangeRender}
            value={dataRange}
            ranges={{
              Today: [moment(), moment()],
              "This Month": [
                moment().startOf("month"),
                moment().endOf("month")
              ],
              "This Year": [moment().startOf("year"), moment().endOf("year")]
            }}
            format="YYYY-MM-DD"
          />
        </Descriptions.Item>
        <Descriptions.Item label="Repetition" span={3}>
          <Select onChange={repetitionHandle} style={{width: 250}} defaultValue="disposable" value={repetitionType}>
            {
              timeType(dataRange)
                .map(
                  (item, key) =>
                    <Select.Option key={key} value={item.type}>{item.text}</Select.Option>
                )
            }
          </Select>
        </Descriptions.Item>
        <Descriptions.Item label="priority" span={3}>
          {readpriority(getSeleExecpTabDate.segment3)}
        </Descriptions.Item>
        <Descriptions.Item label="Config Info">
          {
            isShowAttr ? (
              <InputGroup compact>
                <TimePicker onChange={(val) => timeChangeHandle(val, "start")} format="HH:mm" placeholder="Start Time"
                            value={moment(event[selectedIndex] ? event[selectedIndex].start : '0-0', 'HH:mm')}/>
                <TimePicker onChange={(val) => timeChangeHandle(val, "end")} format="HH:mm" placeholder="end Time"
                            value={moment(event[selectedIndex] ? event[selectedIndex].end : '0-0', 'HH:mm')}/>
                <Select defaultValue={1}>
                  <Select.Option value={1}>Open</Select.Option>
                  <Select.Option value={0}>Shut down</Select.Option>
                </Select>
              </InputGroup>
            ) : null
          }
          <FullCalendar
            defaultView="timeGridDay"
            events={getExecptionTimes}
            views={{
              timeGrid: {
                eventLimit: 6 // adjust to 6 only for timeGridWeek/timeGridDay
              }
            }}
            plugins={[
              timeGridPlugin,
              interactionPlugin
            ]}
            editable={true}
            selectable={true}
            timeZone="local"
            dateClick={calendarDateClick}
            eventResize={calendarResize}
            eventDrop={calendarDrop}
            select={calendarDateSelect}
            header={{
              left: " ",
              center: " ",
              right: " "
            }}
            themeSystem="bootstrap"
            eventRender={eventRender}
          />
        </Descriptions.Item>
      </Descriptions>
    );
  })
);

// 绑定的对象列表
const BindObject = inject(allStore => allStore.appstate)(
  observer(props => {
    const {selectKey} = props;
    const {setBindObject, bindObjects} = props.schedulestate;
    const [selObj, setSelObj] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const deviceName = selectKey[0].split(':')[0];
    
    // 增加绑定对象
    const addObjHandle = (e) => {
      setModalVisible(true);
    };
    
    // modal确认
    const modalOkHandle = e => {
      setBindObject([...bindObjects, {
        key: bindObjects.length,
        propertyVal: 85,
        propertyName: "PRESENT_VALUE",
        objectType: Number(selObj.split(":")[1]),
        objectInstance: Number(selObj.split(":")[2]),
        objectName: getPropertyIdText(BACNET_OBJECT_TYPE, Number(selObj.split(":")[1]))
      }]);
      setModalVisible(false);
      setSelObj(null);
    };
    
    // 删除对象
    const deleteObjHandl = (e, record) => {
      setBindObject(bindObjects.filter(item => item.key !== record.key))
    };
    
    const columns = [
      {
        title: 'objectName',
        dataIndex: 'objectName',
        key: 'objectName',
        render: text => <a>{text}</a>,
      },
      {
        title: 'Value',
        dataIndex: 'propertyVal',
        key: 'propertyVal',
        render: text => <a>{text}</a>,
      },
      {
        title: 'Action',
        key: 'action',
        render: (text, record) => <span onClick={(e) => deleteObjHandl(e, record)}><a>Delete</a></span>,
      },
    ];
    
    // 对象选择框change事件
    const selObjHandle = (val) => {
      setSelObj(val)
    };
    
    const renderSelObj = (data) => {
      if (!data.length) {
        return null
      }
      return data.map((item, key) => {
        const objType = Number(item.split(":")[1]);
        const objInstance = Number(item.split(":")[2]);
        const objTypeText = getPropertyIdText(BACNET_OBJECT_TYPE, objType);
        // 查找匹配, 不能重复添加，添加过的对象将被禁用
        const isExist = bindObjects.findIndex(ele => ((ele.objectType === objType) && (ele.objectInstance === objInstance)));
        if (isExist !== -1) {
          return <Select.Option disabled key={key} value={item}>{objTypeText} {objInstance}</Select.Option>
        }
        return <Select.Option key={key} value={item}>{objTypeText} {objInstance}</Select.Option>
      })
    };
    
    return (
      <React.Fragment>
        <Button onClick={addObjHandle} type="primary" style={{marginBottom: 16}}>
          Add
        </Button>
        <Modal
          title="Select the object"
          visible={modalVisible}
          onOk={modalOkHandle}
          onCancel={() => setModalVisible(false)}
        >
          <span style={{marginRight: 10}}>Select Object</span>
          <Select placeholder="Please select object" value={selObj} style={{width: "80%"}} onChange={selObjHandle}>
            {
              renderSelObj(props.equipmentstate.getDeviceObjKey(deviceName, {
                "1": true,
                "2": true,
                "4": true,
                "5": true,
              }))
            }
          </Select>
        </Modal>
        <Table columns={columns} dataSource={bindObjects}/>
      </React.Fragment>
    )
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
          <EffectPeriod selectKey={props.selectKey}/>
        </TabPane>
        <TabPane
          tab={
            <span>
              <Icon type="container"/>
              The basic information
            </span>
          }
          key="3"
        >
          <ScheduleBase/>
        </TabPane>
        <TabPane
          tab={
            <span>
              <Icon type="container"/>
              Execption
            </span>
          }
          key="4"
        >
          <Execption/>
        </TabPane>
        <TabPane
          tab={
            <span>
              <Icon type="container"/>
               Object of property
            </span>
          }
          key="5"
        >
          <BindObject selectKey={props.selectKey}/>
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
    const [selectDevice, setSelDevice] = useState(undefined);
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
        const readSchedule = (pram, errIndex = 0) => {
          if (pram.done) {
            setLoading(false);
            setPanesData([{title: deviceKey, key: "1"}]);
            setSelDevice(deviceKey);
            props.schedulestate.selectDevice = deviceId;
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
              // 基础信息
              if (pram.value === 105) {
                data.listOfResult.forEach(list => {
                  const attrName = list["object_type_text"];
                  // 有效周期
                  if (list.propertyId === 32) {
                    const effectDate = list.val.replace(/\(.*?\)/g, "");
                    props.schedulestate.effectPeriod.push(effectDate);
                  }
                  props.schedulestate.infoSchedule.data[attrName] = list.val;
                });
              }
              // 绑定的对象列表
              if (pram.value === 54) {
                props.schedulestate.bindObjects = data.listOfResult.map((item, key) => {
                  return {
                    key,
                    propertyVal: item.Property,
                    propertyName: item.object_type_text,
                    objectType: item.Object.object_type,
                    objectInstance: item.Object.value,
                    objectName: item.Object.object_type_text
                  }
                });
              }
              // 例外时间表
              if (pram.value === 38) {
                props.schedulestate.execption = Object.keys(data.listOfResult).length ? data.listOfResult : {
                  table1: {
                    segment1: [{tag: 10, val: "2020-1-1(255)"}, {tag: 10, val: "2020-3-2(0)"}],
                    segment2: [],
                    segment3: [{tag: 2, val: 5}]
                  }
                };
              }
              readSchedule(iter.next());
            })
            .catch(err => {
              console.log(errIndex);
              if (errIndex > 2) {
                message.warn("Please checke you device");
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
      if (e.props.deviceId !== selectDevice) {
        message.warn(
          "The device applied is not consistent with the one selected"
        );
        return;
      }
      
      const startDate = props.schedulestate.effectPeriod[0].split("-");
      const endDate = props.schedulestate.effectPeriod[1].split("-");
      const startYear = startDate[0];
      const startMonth = startDate[1];
      const startDay = startDate[2];
      const endYear = endDate[0];
      const endMonth = endDate[1];
      const endDay = endDate[2];
      
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
          scheduleData[week].push({...item});
          return;
        }
        scheduleData[week] = [{...item}];
      });
      
      const datas = [
        // 周期时间
        {propertyid: 123, data: scheduleData},
        {
          // 优先级
          propertyid: 88,
          data: props.schedulestate.infoSchedule.data["PRIORITY_FOR_WRITING"]
        },
        {
          // 对象名
          propertyid: 77,
          data: `schedule${originalKey[2]}`
        },
        {
          // 描述
          propertyid: 28,
          data: props.schedulestate.infoSchedule.data["DESCRIPTION"]
        },
        {
          // 默认值
          propertyid: 174,
          data: {
            type: Number(props.schedulestate.defaultType),
            val: props.schedulestate.infoSchedule.data["SCHEDULE_DEFAULT"]
          }
        },
        {
          // 有效周期
          propertyid: 32,
          data: {
            startYear,
            startMonth,
            startDay,
            endYear,
            endMonth,
            endDay
          }
        },
        {
          propertyid: 38,
          data: props.schedulestate.execption
        },
        {
          propertyid: 54,
          data: props.schedulestate.bindObjects
        }
      ];
      
      const iter = datas[Symbol.iterator]();
      const recursiveWrite = function (iter) {
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
                  percent={Math.ceil((now / datas.length) * 100)}
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
          });
      };
    };
    
    // tree右键点击事件
    const treeRightClickHandle = e => {
      const menuId = "scheduleTreeMenu";
      const {eventKey} = e.node.props;
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
          isDisabled={!selectDevice}
        />
      </div>
    );
  })
);

export default ScheduleView;
