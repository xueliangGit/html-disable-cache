# html-disable-cache [HDC]

[[中文文档]](./README.md)

![npm version](https://img.shields.io/badge/npm-0.1.6-brightgreen.svg) 

![HDC](./assets/hdc.jpg)

HDC (html-disable-cache) is a solution for your HTML browser cache. It solves the problem of browser cache for you and lets your application change with you.

This is a tool to handle HTML browser caching; no matter where your page runs in the web view, it will face the test of caching, so that your web page can not be displayed in real time according to the content you updated; this tool was born in a variety of browser caching compromise;

----
`Cli has been integrated to facilitate use in non-framework-built projects`

----
## Usage of the tool:
>The tool has integrated Cli commands

 `HDC url [path]` path is the directory of the HTML folder and defaults to the current path when it is not transferred


 `HDC config [path]` path are HDC configuration file paths that will be read by looking for `HDC.config.js`files in the current directory when they are not transferred.

The HDC configuration file is as follows
````js
const path = require('path')
module.exports={
  distPath:path.join(__dirname,'./dist'),
  floderName:'mine'// The name of JS in the directory defaults to HDC
}
````
>Using Cli method

````
npm i html-disable-cache -g
````
 
 Global installation `html-disable-cache` 
1. Run the `HDC url`command in the `html` directory

2. Add the `HDC` configuration file to the project directory, see the file information above; run the `HDC config` command directly under the directory

> Integrate into the current project without using the Cli command

First install dependencies
````
npm i html-disable-cache -D
````
Add `HDC.js` file
````js
// HDC.js
// way
let HDC =require('html-disable-cache')
HDC('Absolute path to your HTML directory ');

// case

let HDC =require('html-disable-cache')
let path = require('path')
HDC(path.join(__dirname,'./dist'));
````
Run the node command
````
node HDC.js
````


><br>The main ideas of this tool are:<br><br>
When loading static resources,
For example, js, css; if the address remains unchanged, the browser will only load the file on the server for the first time in a short time, then it will be retrieved from the cache by default, in order to speed up the access of the web page; when the address changes, it will call the resources on the server; <BR>
In order to call the server's resources when the static files have been modified, it is better to go directly to the cache when there is no modification; <br>
So at this point, a method is needed to detect whether the file needs to be loaded from the server again; <br> <br>after all.
Principle: Used tool - JS file <br> <br>
I use js to load static files to load static resources; in html, there is only one JS function to load resources, which can dynamically set resource links such as `src='. / A. js? DisCache = 123', and when the page is loaded, load a common JS of the page. This JS address is dynamically assigned, so it will not be cached (as a change detection interface); In this js, load function is used to load static resources that need to be loaded; at this point, how to change depends on you; <br> <br> <br>

