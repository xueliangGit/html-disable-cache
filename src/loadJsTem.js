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
    var obj = document.createElement('link')
    obj.setAttribute('rel', 'stylesheet')
    obj.setAttribute('type', 'text/css')
    obj.setAttribute('href', cssObj.url + '?HDC=' + version)
    obj.onload = obj.onreadystatechange = function () {
      if (!done && (!obj.readyState || obj.readyState == 'loaded' || obj.readyState == 'compvare')) {
        done = true
        obj.onload = obj.onreadystatechange = null
        if (callback) {
          callback(obj)
        }
      }
    }
    putToHtml(cssObj,obj)
  }
  function laodScript(obj, callback, version) {
    var done = false
    var script = document.createElement('script')
    script.type = 'text/javascript'
    script.language = 'javascript'
    script.charset = 'utf-8'
    script.src = obj.url + '?HDC=' + version
    // script.setAttribute('src', url);
    script.onload = script.onreadystatechange = function () {
      if (!done && (!script.readyState || script.readyState == 'loaded' || script.readyState == 'compvare')) {
        done = true
        script.onload = script.onreadystatechange = null
        if (callback) {
          callback(script)
        }
      }
    }
    putToHtml(obj,script)
  }
  function putToHtml(obj,scriptObj){
    if(obj.id){
      document.getElementById(obj.id).appendChild(scriptObj)
    }else if(obj.position){
      document.getElementsByTagName(obj.position)[0].appendChild(scriptObj)
    }else{
      document.getElementsByTagName('head')[0].appendChild(scriptObj)
    }
  }
  loadFn('replaceUrl', Math.random())
  window.__loadFn = loadFn
})()
