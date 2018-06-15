const XLSX = require('xlsx');

module.exports = (data, sheetName = 'sheet1') => {
    const sheet_from_array_of_arrays = (data2) => {
      const ws = {};
      const range = {s: {c: 10000000, r: 10000000}, e: {c: 0, r: 0 }};
      for (let R = 0; R !== data2.length; ++R) {
        for (let C = 0; C !== data2[R].length; ++C) {
          if (range.s.r > R) range.s.r = R;
          if (range.s.c > C) range.s.c = C;
          if (range.e.r < R) range.e.r = R;
          if (range.e.c < C) range.e.c = C;
          const cell = {v: typeof data2[R][C] === 'object'
            ? JSON.stringify(data2[R][C])
            : data2[R][C]
          };
          if (cell.v == null) continue;
          const cellRef = XLSX.utils.encode_cell({c: C, r: R, t: 's'});
          ws[cellRef] = cell;
        }
      }
      if (range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
      return ws;
    };
  
    function Workbook() {
      if (!(this instanceof Workbook)) return new Workbook();
      this.SheetNames = [];
      this.Sheets = {};
    }
  
    const wb = new Workbook();
    const ws = sheet_from_array_of_arrays(data);
  
    wb.SheetNames.push(sheetName);
    wb.Sheets[sheetName] = ws;
    return XLSX.write(wb, {bookType: 'xlsx', bookSST: false, type: 'binary'});
  };
  