# html-disable-cache [HDC]

[[English document]](./ENREADME.md)

![HDC version](https://img.shields.io/npm/v/html-disable-cache.svg?style=flat)

![HDC](https://raw.githubusercontent.com/xueliangGit/html-disable-cache/master/assets/hdc.jpg 'HDC')

HDC(html-disable-cache)你的 html 浏览器缓存的一个处理方案，为你解决浏览器的缓存的问题，让你的应用随你而变.

这是一个处理 html 浏览器缓存的工具；不管你的页面跑在那个 webview 中，都会面临着缓存的考验，
让你的网页不能实时根据你更新的内容来显示；这个工具就是再各种浏览器缓存折么中诞生的；

---

`已经集成了Cli，方便在非框架搭建的项目中使用`

---

**hdc@0.6.0-beta**

增加了处理 hdc 的方式；通过`useFileType`来区分使用的方式，使用文件来分开的

`useFileType`​

1. 使用`indexDb`来缓存配置文件以及静态文件；只要加载一遍，之后的加载不用再请求网络；
2. 使用`localStorage`来储存配置文件，其他静态文件直接走浏览器的缓存机制
3. 使用`indexDb`来储存配置文件，其他静态文件直接走浏览器的缓存机制（可以配合 serviceworker 和 applicationCache 使用）

更改处理方式，不在注入代码，使用外链形式来引入代码

```html
<script hdc="HDC/_index.js" src="./HDC/hdc.min.js"></script>
```

---

## 该工具用法

> 该工具已集成 Cli 命令

`HDC url [path]` path 是 html 文件夹的目录，不传时默认是当前路径

`HDC config [path]` path 是 HDC 的配置文件路径 不传时 将在当前目录下查找 `HDC.config.js` 文件进行读取。

HDC 配置文件如下

```js
const path = require("path");
module.exports = {
  distPath: path.join(__dirname, "./dist"),
  floderName: "mine", // js放在目录的名字 默认是 HDC
  ignoreAttr: "hdc-ignore", //不需要hdc 处理的 js 默认是 hdc-ignore
  removeIgnoreAttr: true, // 是否在程序结束后 移除标识  默认是true
  injectCode:{ // +0.3.0增加注入代码功能
  {
     position:'',// 位置 // head，body，#app
     type:'',// script , style 空时默认直接加入
     code:''//代码
    }
  },
  useFileType:2,//
  loadType:1, //(v0.6.0+) 【1，2】默认是1；加载方式1 是不加随机参数，2加随机参数，； 这个随机参数时 生成hdc加载文件时固定生成的；只限本次处理生成使用，只要重新处理，加载的都是一样的链接
expire:'w2',//(v0.6.0+)【d,w,m,y】[Number]本地配置文件储存过期时间；默认是2周；可以设为年月周日（y,m,w,d）;例如有效期1个月,'m1'即可
loadModeIsSave:window.top!==window.self//（v0.6.0+）【true/flase】 默认是顶级窗口下正常使用，iframe下只是加载；ture只是加载加载，false正常使用
};
```

> 使用 Cli 方法

全局安装 `html-disable-cache`

```
npm i html-disable-cache -g
```

1、 在 `html` 目录下运行 `HDC url` 命令即可

2、 在项目目录添加`HDC`配置文件，见上面的文件信息；直接在目录下运行 `HDC config` 命令

> 不使用 Cli 命令，要集成到当前项目

先安装依赖

```
npm i html-disable-cache -S
```

添加 `HDC.js` 文件

```js
// HDC.js
// 用法
let HDC = require('html-disable-cache')
HDC('你的html目录的绝对路径 ')
/* or
HDC({
  distPath:path.join(__dirname,'./dist'),
  floderName:'mine',// js放在目录的名字 默认是 HDC
  ignoreAttr:'hdc-ignore', //不需要hdc 处理的 js 默认是 hdc-ignore
  removeIgnoreAttr:true, // 是否在程序结束后 移除标识  默认是true
  injectCode:{ // +0.3.0增加注入代码功能
  {
     position:'',// 位置 // head，body，#app
     type:'',// script , style 空时默认直接加入
     code:''//代码
    }
  }
})
*/
// 例如

let HDC = require('html-disable-cache')
let path = require('path')
HDC(path.join(__dirname, './dist'))
```

运行 node 命令可以

```
node HDC.js
```

---

更新

> 0.6.0@HDC 2020-07-10
>
> 1. 修改 hdc 处理的文件为外链形式统一放在 hdc 目录下
> 2. 使用外链形式引入 hdc

> 0.5.23 @HDC
>
> 1. 修改 hdc 主程序 分为 2 种
>    > useFileType:1 是老方法
>    >
>    > useFileType:2 是新方法，会吧代码都放在 indexDb 里，方便下次取

> 0.4.0 @HDC 2020-1-8 更新
>
> 1.优化了加载程序，支持判断是否有新的程序需要加载；使用方法回调；

```js
window.__hdc__checkUpdate(function (isOld) {
  if (isOld) {
    Toast.center('数据已更新即将刷新')
    setTimeout(() => {
      window.location.reload()
    }, 2000)
  }
})
```

> 0.3.3 @HDC 2019-12-21 更新
>
> 1. 增加`script`的`type=module`检测；自动根据原有的 script 的类型（例如 type=module，nomodule）去自动分发资源。
> 2. 修改若页面中存在`modulepreload` 属性，会把处理的 js 同步去处理与加载内容的后缀；避免同一个资源加载两次。

> 0.3.0 @HDC 2019-12-20 更新
>
> 1. 增加可以注入代码的功能`injectCode`
> 2. 修改若页面中存在`preload` 属性，会把处理的 js/css 同步去处理与加载内容的后缀；避免同一个资源加载两次。

> 0.2.8 @HDC 2019-7-18 更新
>
> 1.  优化加载，若是加载 css，先加载 css 再加载 js；

> 0.2.5 @HDC 2019-3-18 更新
>
> 1.  优化加载，避免存在依赖时，无法进行正确顺序执行 js；
>
> 0.2.0 @HDC 2019-2-19 更新
>
> 1.  优化错误，避免重复处理统一文件；
> 2.  优化加载代码
>
> 0.1.7 @HDC 2019-2-17 更新
>
> 1.  调整加载 js；使 js 加载完毕后恢复大致原来的位置；例如在 head 中的；加载完后在 head 中；在有 id 的 div 中的加载完后还在 div 中，其它请况全在 body 中；让 html 开发人员在找 js 位置时不会一头雾水。

> <br>本工具主要用的思想是：<br><br>
> 加载静态资源时，
> 例如 js，css；若是地址不变，浏览器短时间内只会再第一次加载页面时区请求服务器上的文件，之后的时候会默认从缓存中获取，这是为了加快网页的访问；当地址改变时才会去调用服务器上的资源；<BR>
> 这个为了让静态文件再有修改的时候去调用服务器的资源，没有修改的时候那就直接走缓存好了；<br>
> 所以这个时候就需要一个方法去检测，到底该文件是否需要从新从服务器上加载；<br><br><br>
> 原理：用到的工具-js 文件<br><br>
> 我用 js 去加载静态文件的方式来加载静态资源；在 html 中只有一个 js 加载资源的函数，可以动态设置资源链接例如 `src='./a.js?disCache=123'` ，并且页面加载完毕就用加载一个该页面公共的 js，这个 js 的地址是动态赋值的，所他是不会缓存起来的（充当检测变化接口）；在这个 js 里就是用加载函数去加载需要加载的静态资源；到这里，具体怎么变就看你的了；<br><br>
