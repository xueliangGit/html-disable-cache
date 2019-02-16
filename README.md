# html-disable-cache   [HDC]

[[English document]](./ENREADME.md)

![npm version](https://img.shields.io/badge/npm-0.1.6-brightgreen.svg)
####
HDC(html-disable-cache)你的html浏览器缓存的一个处理方案，为你解决浏览器的缓存的问题，让你的应用随你而变.

这是一个处理html浏览器缓存的工具；不管你的页面跑在那个webview中，都会面临着缓存的考验，
让你的网页不能实时根据你更新的内容来显示；这个工具就是再各种浏览器缓存折么中诞生的；

---
`已经集成了Cli，方便在非框架搭建的项目中使用`

---
## 该工具用法：
>该工具已集成Cli命令

 `HDC url [path]` path 是 html文件夹的目录，不传时默认是当前路径


 `HDC config [path]` path 是 HDC 的配置文件路径 不传时 将在当前目录下查找 `HDC.config.js` 文件进行读取。

HDC配置文件如下
````js
const path = require('path')
module.exports={
  distPath:path.join(__dirname,'./dist'),
  floderName:'mine'// js放在目录的名字 默认是 HDC
}
````
>使用Cli方法


全局安装 `html-disable-cache` 

````
npm i html-disable-cache -g
````
 

1、 在 `html` 目录下运行 `HDC url` 命令即可 

2、 在项目目录添加`HDC`配置文件，见上面的文件信息；直接在目录下运行 `HDC config` 命令

>不使用Cli命令，要集成到当前项目

先安装依赖
````
npm i html-disable-cache -S
````
添加 `HDC.js` 文件
````js
// HDC.js
// 用法
let HDC =require('html-disable-cache')
HDC('你的html目录的绝对路径 ');

// 例如

let HDC =require('html-disable-cache')
let path = require('path')
HDC(path.join(__dirname,'./dist'));
````
运行 node命令可以
````
node HDC.js
````
><br>本工具主要用的思想是：<br><br>
加载静态资源时，
例如js，css；若是地址不变，浏览器短时间内只会再第一次加载页面时区请求服务器上的文件，之后的时候会默认从缓存中获取，这是为了加快网页的访问；当地址改变时才会去调用服务器上的资源；<BR>
这个为了让静态文件再有修改的时候去调用服务器的资源，没有修改的时候那就直接走缓存好了；<br>
所以这个时候就需要一个方法去检测，到底该文件是否需要从新从服务器上加载；<br><br><br>
原理：用到的工具-js文件<br><br>
我用js去加载静态文件的方式来加载静态资源；在html中只有一个js加载资源的函数，可以动态设置资源链接例如 `src='./a.js?disCache=123'` ，并且页面加载完毕就用加载一个该页面公共的js，这个js的地址是动态赋值的，所他是不会缓存起来的（充当检测变化接口）；在这个js里就是用加载函数去加载需要加载的静态资源；到这里，具体怎么变就看你的了；<br><br>

