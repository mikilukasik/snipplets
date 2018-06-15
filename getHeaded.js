module.exports = (arrOfObjs, { headers } = {}) => {
  const result = headers ? [headers] : [[]];
  (arrOfObjs || []).forEach((obj, index) => {
    Object.keys(obj).forEach(key => {
      let keyIndex = result[0].indexOf(key);
      if (keyIndex < 0 && headers) return;
      if (keyIndex < 0) keyIndex = result[0].push(key) - 1;
      if (!result[index + 1]) result[index + 1] = [];
      result[index + 1][keyIndex] = obj[key];
    });
  });
  return result;
};