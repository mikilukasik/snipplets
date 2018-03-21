const http = ['get', 'post'].reduce((obj, method) => {
  obj[method] = (url, data = null) => new Promise((resolve, reject) => {
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = () => {
      if (xmlHttp.readyState === 4) {
        if (xmlHttp.status < 400) return resolve(JSON.parse(xmlHttp.responseText));
        reject(new Error(`HTTP status ${xmlHttp.status}, url: ${url}`));
      }
    };
    xmlHttp.open(method.toUpperCase(), url, true);
    xmlHttp.send(JSON.stringify(data));
  });
  return obj;
}, {});
