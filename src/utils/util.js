// 通过value获取对象key
export function getPropertyIdText(obj, id, compare = (a, b) => a === b) {
  return Object.keys(obj)
    .flat()
    .find(k => {
      return compare(obj[k], id);
    });
}

// 根据对象类型输出数据类型
export function objTypeToDataType(objType) {
  if (Number(objType) === (1 || 2)) {
    return 4
  }
  if (Number(objType) === (4 || 5)) {
    return 9
  }
  return 0;
}

/**
 * 防抖函数，返回函数连续调用时，空闲时间必须大于或等于 wait，func 才会执行
 *
 * @param  {function} func        回调函数
 * @param  {number}   wait        表示时间窗口的间隔
 * @param  {boolean}  immediate   设置为ture时，是否立即调用函数
 * @return {function}             返回客户调用函数
 */
export function debounce(func, wait = 50, immediate = true) {
  let timer, context, args;
  
  // 延迟执行函数
  const later = () => setTimeout(() => {
    // 延迟函数执行完毕，清空缓存的定时器序号
    timer = null;
    // 延迟执行的情况下，函数会在延迟函数中执行
    // 使用到之前缓存的参数和上下文
    if (!immediate) {
      func.apply(context, args);
      context = args = null
    }
  }, wait);
  
  // 这里返回的函数是每次实际调用的函数
  return function (...params) {
    // 如果没有创建延迟执行函数（later），就创建一个
    if (!timer) {
      timer = later();
      // 如果是立即执行，调用函数
      // 否则缓存参数和调用上下文
      if (immediate) {
        func.apply(this, params)
      } else {
        context = this;
        args = params
      }
      // 如果已有延迟执行函数（later），调用的时候清除原来的并重新设定一个
      // 这样做延迟函数会重新计时
    } else {
      clearTimeout(timer);
      timer = later()
    }
  }
}

// 对象转数组
export function objConverArray(obj) {
  if (typeof obj !== "object") {
    return;
  }
  let arr = [];
  let objArr = Object.keys(obj);
  arr = objArr.map(item => {
    return {
      name: item,
      value: objConverArray(obj[item]) || obj[item]
    };
  });
  return arr;
}

//格式化xml代码
export function formateXml(xmlStr) {
  //计算头函数 用来缩进
  function setPrefix(prefixIndex) {
    var result = "";
    var span = "  "; //缩进长度
    var output = [];
    for (var i = 0; i < prefixIndex; ++i) {
      output.push(span);
    }
    result = output.join("");
    return result;
  }
  
  let text = xmlStr;
  //使用replace去空格
  text =
    "\n" +
    text
      .replace(/(<\w+)(\s.*?>)/g, function ($0, name, props) {
        return name + " " + props.replace(/\s+(\w+=)/g, " $1");
      })
      .replace(/>\s*?</g, ">\n<");
  //处理注释
  text = text
    .replace(/\n/g, "\r")
    .replace(/<!--(.+?)-->/g, function ($0, text) {
      return "<!--" + escape(text) + "-->";
    })
    .replace(/\r/g, "\n");
  //调整格式  以压栈方式递归调整缩进
  var rgx = /\n(<(([^?]).+?)(?:\s|\s*?>|\s*?(\/)>)(?:.*?(?:(?:(\/)>)|(?:<(\/)\2>)))?)/gm;
  var nodeStack = [];
  var output = text.replace(rgx, function (
    $0,
    all,
    name,
    isBegin,
    isCloseFull1,
    isCloseFull2,
    isFull1,
    isFull2
  ) {
    var isClosed =
      isCloseFull1 === "/" ||
      isCloseFull2 === "/" ||
      isFull1 === "/" ||
      isFull2 === "/";
    var prefix = "";
    if (isBegin === "!") {
      //!开头
      prefix = setPrefix(nodeStack.length);
    } else {
      if (isBegin !== "/") {
        ///开头
        prefix = setPrefix(nodeStack.length);
        if (!isClosed) {
          //非关闭标签
          nodeStack.push(name);
        }
      } else {
        nodeStack.pop(); //弹栈
        prefix = setPrefix(nodeStack.length);
      }
    }
    return "\n" + prefix + all;
  });
  var outputText = output.substring(1);
  //还原注释内容
  outputText = outputText
    .replace(/\n/g, "\r")
    .replace(/(\s*)<!--(.+?)-->/g, function ($0, prefix, text) {
      if (prefix.charAt(0) === "\r") prefix = prefix.substring(1);
      text = unescape(text).replace(/\r/g, "\n");
      return "\n" + prefix + "<!--" + text.replace(/^\s*/gm, prefix) + "-->";
    });
  outputText = outputText.replace(/\s+$/g, "").replace(/\r/g, "\r\n");
  return outputText;
}
