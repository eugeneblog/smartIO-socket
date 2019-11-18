// 通过value获取对象key
export function getPropertyIdText(obj, id, compare = (a, b) => a === b) {
  let val = Object.keys(obj).flat().find(k => {
    return compare(obj[k], id);
  });
  return val;
}

// 对象转数组
export function objConverArray(obj) {
  if (typeof obj !== 'object') {
    return
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
