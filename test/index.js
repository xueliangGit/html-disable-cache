let HDC =require('../src/index')
let path = require('path')
const fs = require('fs-extra')
fs.copyFileSync(path.join(__dirname,'./demo/index.html'),path.join(__dirname,'./dist/index.html'))
HDC(path.join(__dirname,'./dist'));