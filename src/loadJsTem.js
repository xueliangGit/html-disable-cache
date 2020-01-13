
; (function () {
  var HDCCONF = {
    url: 'replaceUrl',
    isOld: false,
    checkUpdateCall: function () { }
  }
  // localstroage
  function getStorage (prefix) {
    prefix = (prefix || '_HDC_') + window.location.pathname
    var $localStorage = window.localStorage || {
      getItem: function () {
        return null
      },
      setItem: function () {
      },
      clear: function () {

      }
    }
    function get (key) {
      var value = $localStorage.getItem(prefix + key)
      try {
        return JSON.parse(value)
      } catch (e) {
        return value
      }
    }
    function set (key, value) {
      try {
        $localStorage.setItem(prefix + key, JSON.stringify(value))
      } catch (e) {
        $localStorage.setItem(prefix + key, value)
      }
    }
    function clear () {
      var i = $localStorage.length - 1
      while (i >= 0) {
        if (localStorage.key(i) && ~$localStorage.key(i).indexOf(prefix)) {
          rm($localStorage.key(i), true)
        }
        --i
      }
    }
    function rm (key, ori) {
      $localStorage.removeItem(!!ori ? key : (prefix + key))
    }
    return {
      get: get, set: set, clear: clear, rm: rm
    }
  }
  // XHR
  function createXHR () {
    if (typeof XMLHttpRequest != "undefined") {
      return new XMLHttpRequest();
    } else if (typeof ActiveXObject != "undefined") {
      if (typeof arguments.callee.activeXString != "string") {
        var versions = ["MSXML2.XMLHttp.6.0", "MSXML2.XMLHttp.3.0", "MSXML2.XMLHttp"];
        for (var i = 0, len = versions.length; i < len; i++) {
          try {
            var xhr = new ActiveXObject(versions[i]);
            arguments.callee.activeXString = versions[i];
            return xhr;
          } catch (e) {
            //跳过
          }
        }
      }
      return new ActiveXObject(arguments.callee.activeXString);
    } else {
      throw new Error("No XHR object available")
    }
  }
  var $storage = getStorage()
  function loadFn (obj, version, callback, isPrefetch) {
    callback = callback || function () { }
    var jsArr = []
    if (typeof obj === 'string') {
      if (obj !== 'replaceTem') {
        jsArr.push(obj)
      }
    } else if (Array.isArray(obj)) {
      jsArr = obj
    }
    var newJSarray = []
    for (var i = 0; i < jsArr.length; i++) {
      if (typeof jsArr[i] === 'string') {
        var sufix = /\.[^\\.]+$/.exec(jsArr[i]) + ''
        jsArr[i] = { url: jsArr[i], type: sufix.replace('.', '') }
      }
      if (jsArr[i].type === 'js') {
        newJSarray.push(jsArr[i])
      } else {
        _run(
          jsArr[i],
          (function (j) {
            return function () {
              console.log('load  success.' + jsArr[j].url)
            }
          })(i),
          version, isPrefetch
        )
      }
    }
    __gorunJs(newJSarray, 0, version, callback, isPrefetch)
  }
  function __gorunJs (newJSarray, i, version, callback, isPrefetch) {
    // 修改 避免依赖项存在
    _run(
      newJSarray[i],
      function (jsObj) {
        if (jsObj.skip) {
          console.log(
            '跳过 加载' + ['', 'esModule', 'noModule'][jsObj.moduleType]
          )
        }
        callback.loadItem = callback.loadItem || { error: 0, success: 0, items: [] }
        if (jsObj.e) {
          callback.loadItem.error++
        } else {
          callback.loadItem.success++
        }
        callback.loadItem.items.push(jsObj)
        if (i >= newJSarray.length - 1) {
          console.log('load  success.', callback.loadItem)
          callback(callback.loadItem)
        } else {
          __gorunJs(newJSarray, ++i, version, callback, isPrefetch)
        }
      },
      version,
      isPrefetch
    )
  }
  function _run (obj, callback, version, isPrefetch) {
    if (isPrefetch) {
      _prefetch(obj, callback, version)
    } else {
      if (obj.type === 'js') {
        laodScript(obj, callback, version)
      } else if (obj.type === 'css') {
        loadStyle(obj, callback, version)
      }
    }
  }
  function _prefetch (obj, callback, version) {
    if (
      (!window.__browserHasNotModules && obj.moduleType === 2) ||
      (window.__browserHasNotModules && obj.moduleType === 1)
    ) {
      obj.skip = true
      callback(obj)
      return
    }
    var link = document.createElement('link')
    link.setAttribute('rel', 'prefetch')
    link.setAttribute('href', obj.url + '?HDC=' + version)
    obj.position = 'head'
    putToHtml(obj, link, callback)
  }
  function loadStyle (cssObj, callback, version, isPrefetch) {
    var done = false
    var style = document.createElement('link')
    style.setAttribute('rel', 'stylesheet')
    style.setAttribute('type', 'text/css')
    style.setAttribute('href', cssObj.url + '?HDC=' + version)
    putToHtml(cssObj, style, callback)
  }
  function laodScript (jsObj, callback, version) {
    if (
      (!window.__browserHasNotModules && jsObj.moduleType === 2) ||
      (window.__browserHasNotModules && jsObj.moduleType === 1)
    ) {
      jsObj.skip = true
      callback(jsObj)
      return
    }
    var script = document.createElement('script')
    script.type = 'text/javascript'
    script.language = 'javascript'
    script.charset = 'utf-8'
    script.src = jsObj.url + '?HDC=' + version
    switch (jsObj.moduleType) {
      case 1:
        script.type = 'module'
        break
      case 2:
        script.setAttribute('nomodule', '')
        break
      default:
        break
    }
    // script.setAttribute('src', url);

    putToHtml(jsObj, script, callback)
  }
  function putToHtml (obj, loadItem, callback) {
    var done = false
    loadItem.onload = loadItem.onreadystatechange = function () {
      if (
        !done &&
        (!loadItem.readyState ||
          loadItem.readyState == 'loaded' ||
          loadItem.readyState == 'compvare')
      ) {
        done = true
        loadItem.onload = loadItem.onreadystatechange = null
        if (callback) {
          callback(loadItem)
        }
      }
    }
    loadItem.onerror = function (e) {
      if (callback) {
        loadItem.e = e
        callback(loadItem)
      }
    }
    if (obj.id) {
      document.getElementById(obj.id).appendChild(loadItem)
    } else if (obj.position) {
      document.getElementsByTagName(obj.position)[0].appendChild(loadItem)
    } else {
      document.getElementsByTagName('head')[0].appendChild(loadItem)
    }
  }
  // 通过xhr 去获取文件信息
  function getHDCJS (url, isAsync, ori) {
    var xhr = createXHR()
    xhr.open('get', url + '?HDC=' + Math.random(), !!isAsync)
    xhr.onload = function (e) {
      //同步接受响应
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          //实际操作
          // console.log(xhr.responseText)
          if (ori) {
            if (xhr.responseText !== ori) {
              $storage.set(url, xhr.responseText)
              HDCCONF.isOld = true
              var splitStr = xhr.responseText.split('],')
              splitStr[1] = splitStr[1].replace(')', ',function(obj){if(window.__hdc__checkUpdate__callback){window.__hdc__checkUpdate__callback(true)}},true)')
              insetJs(splitStr.join('],'))
            } else {
              HDCCONF.isOld = false
              HDCCONF.checkUpdateCall(HDCCONF.isOld)
            }
          } else {
            $storage.set(url, xhr.responseText)
            insetJs(xhr.responseText)
          }
        }
      }
    }
    xhr.send(null);
  }
  function insetJs (jsCode) {
    var script = document.createElement('script')
    script.type = 'text/javascript'
    script.innerHTML = jsCode;
    document.body.appendChild(script)
  }
  // 加载hdc配置文件
  function loadHdDCCONF (url) {
    // 先获取缓存
    var hdcConfCode = $storage.get(url)
    if (hdcConfCode) {
      setTimeout(function () {
        // 处理现在过时的问题
        var splitStr = hdcConfCode.split('],')
        splitStr[1] = splitStr[1].replace(')', ',function(loadItem){if(loadItem.error>0){window.__hdc__clearCache();window.location.reload()}})')
        insetJs(splitStr.join('],'))
        setTimeout(function () {
          getHDCJS(url, true, hdcConfCode);
        }, 1000)
      }, 0)
    } else {
      getHDCJS(url, true);
    }
  }
  window.__hdc__loadFn = loadFn;
  window.__loadFn = loadFn;
  window.__hdc__clearCache = function (cb) {
    $storage.clear()
  }
  window.__hdc__checkUpdate = function (cb) {
    if (typeof cb === 'function') {
      HDCCONF.checkUpdateCall = cb
      window.__hdc__checkUpdate__callback = cb
    }
  }
  loadHdDCCONF(HDCCONF.url)
})()
