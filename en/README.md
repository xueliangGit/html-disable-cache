# html-disable-cache
![npm version](https://img.shields.io/badge/npm-0.1.2-brightgreen.svg)

This is a tool to handle HTML browser caching; no matter where your page runs in the web view, it will face the test of caching, so that your web page can not be displayed in real time according to the content you updated; this tool was born in a variety of browser caching compromise;

----
## Usage of the tool:

`npm i html-disable-cache -D`
````js
// way
let HDC =require('html-disable-cache')
HDC('Absolute path to your HTML directory ');

// case

let HDC =require('html-disable-cache')
let path = require('path')
HDC(path.join(__dirname,'./dist'));
````

><br>The main ideas of this tool are:<br><br>
When loading static resources,
For example, js, css; if the address remains unchanged, the browser will only load the file on the server for the first time in a short time, then it will be retrieved from the cache by default, in order to speed up the access of the web page; when the address changes, it will call the resources on the server; <BR>
In order to call the server's resources when the static files have been modified, it is better to go directly to the cache when there is no modification; <br>
So at this point, a method is needed to detect whether the file needs to be loaded from the server again; <br> <br>after all.
Principle: Used tool - JS file <br> <br>
I use js to load static files to load static resources; in html, there is only one JS function to load resources, which can dynamically set resource links such as `src='. / A. js? DisCache = 123', and when the page is loaded, load a common JS of the page. This JS address is dynamically assigned, so it will not be cached (as a change detection interface); In this js, load function is used to load static resources that need to be loaded; at this point, how to change depends on you; <br> <br> <br>

