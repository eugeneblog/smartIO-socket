export function getPropertyIdText(obj, id, compare = (a, b) => a === b) {
  let val = Object.keys(obj).find(k => {
    return compare(obj[k], id);
  });
  return val;
}
