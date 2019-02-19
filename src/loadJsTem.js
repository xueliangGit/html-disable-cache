; (function () {
  function loadFn(obj, version) {
    var jsArr = [];
    if (typeof obj === 'string') {
      if (obj !== 'replaceTem') {
        jsArr.push(obj)
      }
    } else if (Array.isArray(obj)) {
      jsArr = obj
    }
    var len = jsArr.length
    for (var i = 0; i < jsArr.length; i++) {
      if (typeof jsArr[i] === 'string') {
        var sufix = /\.[^\\.]+$/.exec(jsArr[i]) + ''
        jsArr[i] = { url: jsArr[i], type: sufix.replace('.', '') }
      }
      _run(jsArr[i], function () {
        len--
        if (len === 0) {
          console.log('load  success.')
        }
      }, version)
    }
  }
  function _run(obj, callback, version) {
    if (obj.type === 'js') {
      laodScript(obj, callback, version)
    } else if (obj.type === 'css') {
      loadStyle(obj, callback, version)
    }
  }
  function loadStyle(cssObj, callback, version) {
    var done = false
    var style = document.createElement('link')
    style.setAttribute('rel', 'stylesheet')
    style.setAttribute('type', 'text/css')
    style.setAttribute('href', cssObj.url + '?HDC=' + version)
    putToHtml(cssObj,style,callback)
  }
  function laodScript(jsObj, callback, version) {
    var script = document.createElement('script')
    script.type = 'text/javascript'
    script.language = 'javascript'
    script.charset = 'utf-8'
    script.src = jsObj.url + '?HDC=' + version
    // script.setAttribute('src', url);
   
    putToHtml(jsObj,script,callback)
  }
  function putToHtml(obj,loadItem,callback){
    var done = false
    loadItem.onload = loadItem.onreadystatechange = function () {
      if (!done && (!loadItem.readyState || loadItem.readyState == 'loaded' || loadItem.readyState == 'compvare')) {
        done = true
        loadItem.onload = loadItem.onreadystatechange = null
        if (callback) {
          callback(loadItem)
        }
      }
    }
    if(obj.id){
      document.getElementById(obj.id).appendChild(loadItem)
    }else if(obj.position){
      document.getElementsByTagName(obj.position)[0].appendChild(loadItem)
    }else{
      document.getElementsByTagName('head')[0].appendChild(loadItem)
    }
  }
  loadFn('replaceUrl', Math.random())
  window.__loadFn = loadFn
})()
