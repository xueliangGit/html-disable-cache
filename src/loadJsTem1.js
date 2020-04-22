function indexedDBFactory (config) {
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
      createTable: function () { },
      read: get,
      remove: rm,
      add: set,
      update: set,
      clear: clear,
      selectTable: function (name) {
        dbConfig.table = name
      }
    }
  }
  var $storage = {}
  if (!window.indexedDB) {
    $storage = getStorage()
  }
  var dbConfig = {
    name: 'ey',
    table: '',
    version: null
  }
  function log (str) {
    console.log('indexedDB:', str)
  }
  // 初始化数据库
  function initDb (cb) {
    var openRequest = dbConfig.version ? window.indexedDB.open(dbConfig.name, dbConfig.version) : window.indexedDB.open(dbConfig.name);
    var db = null
    openRequest.onupgradeneeded = function (event) {
      log("Upgrading...");//  要更新数据表，schema 时 触发；
      cb(event.target.result, function () {
        event.target.result.close()
      })
    }
    openRequest.onsuccess = function (event) {
      log("Success!");
      cb(event.target.result, function () {
        event.target.result.close()
      })
    }
    openRequest.onerror = function (e) {
      log("Error");
      console.dir(e);
    }
  }
  function setUrl (params) {
    if (params == null) {
      return params
    }
    var typeofStr = typeof params
    if (typeofStr === 'string') {
      return params.indexOf('http') > -1
        ? params
        : '_HDC_' + window.location.pathname + '_' + params
    } else if (typeofStr === 'object') {
      params.url = setUrl(params.url)
      return params
    }
  }
  function createTable (name, params, cb) { // array
    if (!window.indexedDB) {
      cb && cb()
      return
    }
    params = params || { keyPath: 'url', shema: [] }
    dbConfig.version = Date.now()
    initDb(function (db, close) {
      if (!db.objectStoreNames.contains(name)) {
        objectStore = db.createObjectStore(name, params.keyPath ? { keyPath: params.keyPath } : { autoIncrement: true });
        if (params.shema) {
          for (var i = 0; i < params.shema.length; i++) {
            objectStore.createIndex(params.shema[i].name, params.shema[i].name, { unique: !!params.shema[i].unique });
          }
        }
      }
      dbConfig.table = name
      close()
      cb && cb()
    })
  }
  // 添加
  function add (params, cb) {
    params = setUrl(params)
    if (!window.indexedDB) {
      $storage.set(params.url, params.code)
      cb && cb()
      return
    }
    dbConfig.version = null
    initDb(function (db, close) {
      var request = db.transaction([dbConfig.table], 'readwrite')
        .objectStore(dbConfig.table)
        .add(params);

      request.onsuccess = function (event) {
        log(params.url + '数据读取成功')
        close()
        cb && cb()
      };

      request.onerror = function (event) {
        log(params.url + '数据读取成功')
        close()
        cb && cb(event)
      }
    })
  }
  //读取
  function read (params, cb) {
    params = setUrl(params)
    if (!window.indexedDB) {
      var res = $storage.get(params)
      cb && cb(!res || null, res)
      return
    }
    dbConfig.version = null
    initDb(function (db, close) {
      var request = db.transaction([dbConfig.table])
        .objectStore(dbConfig.table)
        .get(params)
      request.onerror = function (event) {
        cb && cb(event)
      };

      request.onsuccess = function (event) {
        log(params + '数据读取成功')
        close()
        cb(!request.result || null, request.result)
      };
    })
  }
  // 更新
  function update (params, cb) {
    params = setUrl(params)
    if (!window.indexedDB) {
      $storage.set(params.url, params.code)
      cb && cb()
      return
    }
    dbConfig.version = null
    initDb(function (db, close) {
      var request = db.transaction([dbConfig.table], 'readwrite')
        .objectStore(dbConfig.table)
        .put(params);
      request.onsuccess = function (event) {
        log(params.url + '数据读取成功')
        close()
        cb && cb()
      };
      request.onerror = function (event) {
        log(params.url + '数据读取成功')
        close()
        cb && cb(event)
      }
    })
  }
  function remove (url, cb) {
    url = setUrl(url)
    if (!window.indexedDB) {
      $storage.rm(url)
      cb && cb()
      return
    }
    dbConfig.version = null
    initDb(function (db, close) {
      var request = db.transaction([dbConfig.table], 'readwrite')
        .objectStore(dbConfig.table)
        .delete(url);

      request.onsuccess = function (event) {
        log(url + '数据读取成功')
        close()
        cb && cb()
      };
    })
  }
  function clear (cb) {
    initDb(function (db, close) {
      var _suffix = setUrl('')
      var request = db
        .transaction([dbConfig.table], 'readwrite')
        .objectStore(dbConfig.table)
        .openCursor()
      var result = []
      request.onsuccess = function (event) {
        var cursor = event.target.result
        if (cursor) {
          // cursor.value就是数据对象
          // 游标没有遍历完，继续
          result.push(cursor.value)
          cursor.continue()
        } else {
          close()
          // 如果全部遍历完毕...
          console.log(_suffix)
          for (var i = 0; i < result.length; i++) {
            if (result[i] && result[i].url.indexOf(_suffix) > -1) {
              console.log(result[i])
              remove(
                result[i].url,
                function () {
                  if (i === result.length - 1) {
                    cb && cb()
                  }
                },
                true
              )
            }
          }
        }
      }
      request.onerror = function (event) {
        log('数据清除成功')
        close()
        cb && cb()
      }
    })
  }

  function indexDbApi () {
    dbConfig.name = (config || {})['name'] || dbConfig.name
    dbConfig.table = (config || {})['table'] || dbConfig.table
    return {
      createTable: createTable,
      clear: clear,
      read: read,
      remove: remove,
      add: add,
      update: update,
      selectTable: function (name) {
        dbConfig.table = name
      }
    }
  }
  return indexDbApi()
}
; (function () {
  var HDCCONF = {
    loadModeIsSave: window.top !== window.self,// 在iframe 中 ，是加载缓存用的 false 直接往常加载
    url: 'replaceUrl',
    isOld: false,
    checkUpdateCall: function () { }
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
  var $storageDb = indexedDBFactory()
  $storageDb.createTable('code', { keyPath: 'url' }, function () {
    console.log('---  初始化成功  ---')
  })
  function loadFn (obj, version, callback_, isPrefetch) {
    callback = function (items) {
      ; (callback_ || function () { })(items)
    }
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
    $storageDb.read(obj.url, function (err, res) {
      if (err) {
        loadAndSave(obj.url, isPrefetch ? false : !HDCCONF.loadModeIsSave, true, obj.type, callback, obj)
        return
      }
      if (isPrefetch) {
        return
      }
      // var newcode = $storageDb.get(obj.url)
      var newcode = res.code
      // 若 已经缓存的code
      if (newcode) {
        if (!HDCCONF.loadModeIsSave) {
          insetCode(newcode, obj.type, obj.position)
        }
        callback({})
      } else {
        loadAndSave(obj.url, isPrefetch ? false : !HDCCONF.loadModeIsSave, true, obj.type, callback, obj)
      }
    })
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
              if (checkIsSuccess(xhr.responseText)) {
                $storageDb.update({ url: url, code: xhr.responseText }, function (err, res) {
                })
                HDCCONF.isOld = true
                var splitStr = xhr.responseText.split('],')
                splitStr[1] = splitStr[1].replace(')', ',function(obj){if(window.__hdc__checkUpdate__callback){window.__hdc__checkUpdate__callback(true)}},true)')
                insetCode(splitStr.join('],'), 'js')
              }
            } else {
              HDCCONF.isOld = false
              HDCCONF.checkUpdateCall(HDCCONF.isOld)
            }
          } else {
            if (checkIsSuccess(xhr.responseText)) {
              $storageDb.add({ url: url, code: xhr.responseText })
              // $storageDb.set(url, xhr.responseText)
              insetCode(xhr.responseText, 'js')
            } else {
            }
          }
        }
      }
    }
    xhr.send(null);
  }
  // xhr loadjs inject js 
  function loadAndSave (url, isRun, isAsync, type, callback, obj) {
    var xhr = createXHR()
    xhr.open('get', url + '?HDC=' + Math.random(), !!isAsync)
    xhr.onload = function (e) {
      //同步接受响应
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          //实际操作
          // console.log(xhr.responseText)
          // if (checkIsSuccess(xhr.responseText)) {
          if (isRun) {
            insetCode(xhr.responseText, type, obj)
          }
          // $storageDb.set(url, xhr.responseText)
          $storageDb.add({ url: url, code: xhr.responseText }, function (err, res) {
            if (err) {
              $storageDb.update({ url: url, code: xhr.responseText })
            }
          })
          callback && callback(xhr)
          // }
        }
      }
    }
    xhr.send(null);
  }
  function insetCode (code, type, obj) {
    var inset = null
    if (type === 'js') {
      inset = document.createElement('script')
      inset.type = 'text/javascript'
      inset.innerHTML = code;
    } else {
      inset = document.createElement('style')
      inset.type = 'text/css'
      inset.isby = 'hdc'
      try {
        inset.appendChild(document.createTextNode(code))
      } catch (ex) {
        inset.styleSheet.cssText = code
      }
    }
    if (obj && obj.id) {
      document.getElementById(obj.id).appendChild(inset)
    } else if (obj && obj.position) {
      document.getElementsByTagName(obj.position)[0].appendChild(inset)
    } else {
      document.body.appendChild(inset)
    }
    if (type === 'js') {
      inset.remove()
    }
  }

  // 加载hdc配置文件
  function loadHdDCCONF (url) {
    // 先获取缓存
    $storageDb.read(url, function (err, res) {
      if (err) {
        getHDCJS(url, true);
        return
      }
      var hdcConfCode = res.code
      // 去处理被劫持的情况
      if (hdcConfCode && checkIsSuccess(hdcConfCode)) {
        setTimeout(function () {
          // 处理现在过时的问题
          try {
            var splitStr = hdcConfCode.split('],')
            splitStr[1] = splitStr[1].replace(')', ',function(loadItem){if(loadItem.error>0){window.__hdc__clearCache();window.location.reload()}})')
            insetCode(splitStr.join('],'), 'js')
            setTimeout(function () {
              getHDCJS(url, true, hdcConfCode);
            }, 3000)
          } catch (e) {
            getHDCJS(url, true);
          }
        }, 0)
      } else {
        getHDCJS(url, true);
      }
    })
  }
  function checkIsSuccess (hdcConfCode) {
    return (hdcConfCode.indexOf('__hdc__loadFn') > -1 || hdcConfCode.indexOf('__loadFn') > -1) && hdcConfCode.indexOf('position') > -1
  }
  window.__hdc__version = "__hdc__version__";
  window.__hdc__loadFn = loadFn;
  window.__loadFn = loadFn;
  window.__hdc__clearCache = function (cb) {
    $storageDb.clear()
  }
  window.__hdc__checkUpdate = function (cb) {
    if (typeof cb === 'function') {
      HDCCONF.checkUpdateCall = cb
      window.__hdc__checkUpdate__callback = cb
    }
  }
  loadHdDCCONF(HDCCONF.url)
})()