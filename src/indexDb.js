/*
 * @Author: xuxueliang
 * @Date: 2020-04-20 17:35:20
 * @LastEditors: xuxueliang
 * @LastEditTime: 2020-04-21 14:17:35
 */
function indexedDBFactory (config) {
  var dbConfig = {
    name: 'ey',
    table: '',
    version: null
  }
  function log (str) {
    console.log('indexedDB:', str)
  }
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
  function createTable (name, params, cb) { // array
    params = params || { keyPath: 'url', shema: [] }
    dbConfig.version = Date.now()
    initDb(function (db, close) {
      if (!db.objectStoreNames.contains(name)) {
        objectStore = db.createObjectStore(name, params.keyPath ? { keyPath: params.keyPath } : { autoIncrement: true });
        if (params.shema) {
          for (var i = 0; i < params.shema.length; i++) {
            objectStore.createIndex(params.shema[i].name, params.shema[i].name, { unique: !!params.shema[i].unique });
          }
          dbConfig.table = name
        }
        close()
        cb && cb()
      }
    })
  }
  // 添加
  function add (params, cb) {
    dbConfig.version = null
    initDb(function (db, close) {
      var request = db.transaction([dbConfig.table], 'readwrite')
        .objectStore(dbConfig.table)
        .add(params);

      request.onsuccess = function (event) {
        log('数据写入成功');
        close()
        cb && cb()
      };

      request.onerror = function (event) {
        log('数据写入失败');
        close()
        cb && cb(event)
      }
    })
  }
  //读取
  function read (params, cb) {
    dbConfig.version = null
    initDb(function (db, close) {
      var transaction = db.transaction([dbConfig.table])
        .objectStore(dbConfig.table)
        .get(params)
      request.onerror = function (event) {
        cb && cb(event)
      };

      request.onsuccess = function (event) {
        log('index数据读取成功');
        close()
        cb(request.result)
      };
    })
  }
  // 更新
  function update (params, cb) {
    dbConfig.version = null
    initDb(function (db, close) {
      var request = db.transaction([dbConfig.table], 'readwrite')
        .objectStore(dbConfig.table)
        .put(params);
      request.onsuccess = function (event) {
        log('数据更新成功');
        close()
        cb && cb()
      };
      request.onerror = function (event) {
        log('数据更新失败');
        close()
        cb && cb(event)
      }
    })
  }
  function remove () {
    dbConfig.version = null
    initDb(function (db, close) {
      var request = db.transaction([dbConfig.table], 'readwrite')
        .objectStore(dbConfig.table)
        .delete(1);

      request.onsuccess = function (event) {
        log('数据删除成功');
        close()
      };
    })
  }
  function indexDbApi () {
    dbConfig.name = (config || {})['name'] || dbConfig.name
    dbConfig.table = (config || {})['table'] || dbConfig.table
    return {
      createTable: createTable,
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