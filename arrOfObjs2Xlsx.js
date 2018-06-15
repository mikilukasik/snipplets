const getHeaded = require('./getHeaded');
const array2xlsx = require('./array2xlsx');
const fs = require('fs');
const path = require('path');

const arrOfObjs = require('./arrOfObjs.json');

const headed = getHeaded(arrOfObjs);
const binaryData = array2xlsx(headed);

fs.writeFileSync(path.resolve('./words.xlsx'), binaryData, 'binary');
