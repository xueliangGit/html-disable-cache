/*
 * @Author: xuxueliang
 * @Date: 2019-03-25 17:54:00
 * @LastEditors  : xuxueliang
 * @LastEditTime : 2019-12-21 16:53:24
 */
;(function () {
  function loadFn (obj, version) {
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
          version
        )
      }
    }
    __gorunJs(newJSarray, 0, version)
  }
  function __gorunJs (newJSarray, i, version) {
    // 修改 避免依赖项存在
    _run(
      newJSarray[i],
      function (jsObj) {
        if (jsObj.skip) {
          console.log(
            '跳过 加载' + ['', 'esModule', 'noModule'][jsObj.moduleType]
          )
        }
        if (i >= newJSarray.length - 1) {
          console.log('load  success.')
        } else {
          __gorunJs(newJSarray, ++i, version)
        }
      },
      version
    )
  }
  function _run (obj, callback, version) {
    if (obj.type === 'js') {
      laodScript(obj, callback, version)
    } else if (obj.type === 'css') {
      loadStyle(obj, callback, version)
    }
  }
  function loadStyle (cssObj, callback, version) {
    var done = false
    var style = document.createElement('link')
    style.setAttribute('rel', 'stylesheet')
    style.setAttribute('type', 'text/css')
    style.setAttribute('href', cssObj.url + '?HDC=' + version)
    putToHtml(cssObj, style, callback)
  }
  function laodScript (jsObj, callback, version) {
    if (
      (window.__browserHasModules && jsObj.moduleType === 2) ||
      (!window.__browserHasModules && jsObj.moduleType === 1)
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
    if (obj.id) {
      document.getElementById(obj.id).appendChild(loadItem)
    } else if (obj.position) {
      document.getElementsByTagName(obj.position)[0].appendChild(loadItem)
    } else {
      document.getElementsByTagName('head')[0].appendChild(loadItem)
    }
  }
  loadFn('replaceUrl', Math.random())
  window.__loadFn = loadFn
})()
