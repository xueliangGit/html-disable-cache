# html-disable-cache   

[[English document]](./ENREADME.md)

![npm version](https://img.shields.io/badge/npm-0.1.3-brightgreen.svg)

这是一个处理html浏览器缓存的工具；不管你的页面跑在那个webview中，都会面临着缓存的考验，让你的网页不能实时根据你更新的内容来显示；这个工具就是再各种浏览器缓存折么中诞生的；

----
## 该工具用法：

`npm i html-disable-cache -D`
````js
// 用法
let HDC =require('html-disable-cache')
HDC('你的html目录的绝对路径 ');

// 例如

let HDC =require('html-disable-cache')
let path = require('path')
HDC(path.join(__dirname,'./dist'));
````

><br>本工具主要用的思想是：<br><br>
加载静态资源时，
例如js，css；若是地址不变，浏览器短时间内只会再第一次加载页面时区请求服务器上的文件，之后的时候会默认从缓存中获取，这是为了加快网页的访问；当地址改变时才会去调用服务器上的资源；<BR>
这个为了让静态文件再有修改的时候去调用服务器的资源，没有修改的时候那就直接走缓存好了；<br>
所以这个时候就需要一个方法去检测，到底该文件是否需要从新从服务器上加载；<br><br><br>
原理：用到的工具-js文件<br><br>
我用js去加载静态文件的方式来加载静态资源；在html中只有一个js加载资源的函数，可以动态设置资源链接例如 `src='./a.js?disCache=123'` ，并且页面加载完毕就用加载一个该页面公共的js，这个js的地址是动态赋值的，所他是不会缓存起来的（充当检测变化接口）；在这个js里就是用加载函数去加载需要加载的静态资源；到这里，具体怎么变就看你的了；<br><br>

