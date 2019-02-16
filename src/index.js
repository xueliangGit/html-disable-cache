/* eslint-disable */
const fs = require('fs-extra')
var path = require('path')
var glob = require('glob')
const cheerio = require('cheerio');
const chalk = require('chalk')
var minify = require('html-minifier').minify;
// let this.conf.distPath =''// 项目目录  path.join(__dirname,'../../build')
var conf = {
  show:false,
  floderName:'HDC'
}
let jsStr=fs.readFileSync(path.resolve(__dirname,'loadJsTem.js'), 'utf8');
let log_=chalk.blueBright('Html-disable-cache:\n    ')
/**
 * distPath 是静态文件html文件夹的路径
 * config{
 * floderName 放js的文件夹
 * }
 * */
function HDC(distResolvePath,config={}){
  this.conf = {
    htmlNum:0,
    staticNum:0,
    isDid:0,
    show:false,
    distPath:'',
    floderName:'HDC'
  }
  if(typeof distResolvePath === 'string'){
    this.conf.distPath=distResolvePath
  }else if(typeof distResolvePath === 'object'){
    Object.assign(this.conf,distResolvePath)
  }
  Object.assign(this.conf,config)
  if (!fs.pathExistsSync(this.conf.distPath)) {
    console.log(log_,chalk.yellow('需要保证 '+this.conf.distPath+'目录存在'))
    process.exit(0)
  }
  console.log(log_,chalk.yellow('HDC处理的目录是 '+this.conf.distPath))
  var cache_html = getMultiEntry(this.conf.distPath+'/**/**/*.html'); // 获得入口js文件
  // console.log(cache_html)
  this.conf.htmlNum=Object.keys(cache_html).length
  disCache.call(this,cache_html);
}
//---------some fn
function disCache(obj){
  var j=0
  for(let i in obj){
    j++
    var html = fs.readFileSync(obj[i], 'utf8')
    doHtml.call(this,html,obj[i],i,j)
  }
  if(!j){
    console.log(log_,chalk.yellow('没有要处理的HTML文件,请确定路径输入正确'))
    process.exit(0);
  }
}
//-------- 处理html文件
function doHtml(html,htmlUrl,baseName,htmlIndex){
  let $ = cheerio.load(html); // 加载一个 html 文本
  let scripts=$('script[src]')
  // 处理js
  let needLoadJs=[]
  scripts.each(function(i,v){
    needLoadJs.push({url:v.attribs.src,type:'js'})
  })
  //处理 style
  let styls=$('link[rel="stylesheet"]')
  styls.each(function(i,v){
    needLoadJs.push({url:v.attribs.href,type:'css'})
  })
  styls.remove()
  let baseNameUrl=path.normalize(baseName,'/').replace(this.conf.distPath,'').split(path.sep).join('_')
  let jsName = './'+this.conf.floderName+'/'+baseNameUrl+'.js'
  // jsName=path.relative(path.normalize(baseName,'../'),path.join(distPath,jsName))
  this.conf.staticNum += needLoadJs.length
  if(needLoadJs.length){
    this.conf.isDid ++
    $('body').append(`
    <script type='text/javascript' language = 'javascript'>
    ${jsStr.replace("replaceUrl",path.relative(path.join(baseName,'../'),path.join(this.conf.distPath,jsName)).split(path.sep).join('/'))}
    </script>
    `)
    $('script[src]').remove()
    let htmlData=minify($.html(),{removeComments: true,collapseWhitespace: true,minifyJS:true, minifyCSS:true})
    writeHtml.call(this,htmlUrl,htmlData)
    let jsData='__loadFn('+JSON.stringify(needLoadJs)+','+(+new Date())+');'
    writJs.call(this,path.join(this.conf.distPath,jsName),jsData)
  }else{
    if(this.conf.isDid==0&&htmlIndex==this.conf.htmlNum){
      console.log(log_,chalk.cyanBright('该文件夹下的HTML没有做处理；可能原因是：\n     1、没有引入外部JS、css \n     2、已经做过处理'))
    }
  }
}
function writJs(jsPath,data){
  // console.log(jsPath)
  fs.exists(path.dirname(jsPath),(exists)=>{
    if(exists){
      _wJs.call(this,jsPath,data)
    }else{
      mkDirSync(this.conf.distPath,path.relative(this.conf.distPath,path.dirname(jsPath)))
      _wJs.call(this,jsPath,data)
    }
  })
}
function _wJs(jsPath,data){
  fs.writeFile(jsPath,data,(err)=>{
    if(err) throw err;
    if(this.conf.show){
      console.log(log_,chalk.green(jsPath+'文件已建立'));
    }
    this.conf.staticNum--
    if(this.conf.staticNum===0){
      console.log()
      console.log(log_,chalk.green(' js文件已建立'));
    }
  });
}
function writeHtml (filePath,data) {
  console.log(filePath)
  fs.writeFile(filePath,data, (err)=>{
    if(err) throw err;
    if(this.conf.show){
      console.log(log_,chalk.green(filePath+'文件处理完毕'));
    }
    this.conf.htmlNum--
    if(this.conf.htmlNum===0){
      console.log()
      console.log(log_,chalk.green(' html文件处理完毕'));
    }
  })
}

function mkDirSync (basePath, newPath) {
  let pathArr = newPath.split(path.sep)
  let newPathUrl = basePath
  // console.log(pathArr,newPathUrl)
  pathArr.forEach(res => {
    newPathUrl = path.join(newPathUrl, res)
    if (!fs.existsSync(newPathUrl)) {
      fs.mkdirSync(newPathUrl)
    }
  })
}
function getMultiEntry (globPath) {
  var entries = {}
  let basename
  let tmp
  let pathname
  // console.log('globPath', globPath)
  glob.sync(globPath).forEach(function (entry) {
    basename = path.basename(entry, path.extname(entry))
    // console.log(entry, basename)
    // tmp = entry.split('/').splice(-4)
    // 优化 多层级页面 路径获取错误
    tmp = entry.split('/')
  var stat = fs.lstatSync(entry);
  if(!stat.isDirectory()){;// true || false 判断是不是文件夹
    tmp.splice(tmp.length - 1)
    // console.log(entry, tmp)
    var pathsrc =tmp.join('/')
    if (tmp[0] == 'src') {
      tmp.shift()
      pathsrc = tmp.join('/')
    }
    // 优化 完毕
    // console.log(pathsrc)
    pathname = pathsrc + '/' + basename // 正确输出js和html的路径
    entries[pathname] = entry
    // console.log(pathname + '-----------' + entry)
  }
  })
  return entries
}
// 处理js
function getUgJs(str){
  return str.replace(/function /g,'__FUN__').replace(/var /g,'__VAR__').replace(/let /g,'__LET__').replace(/const /g,'__CONST__').replace(/else if/g,'__ELSEIF__').replace(/typeof /g,'__TYPEOF__').replace(/\n/g,';').replace(/ /g,'').replace(/{;/g,'{').replace(/;}/g,'}').replace(/__FUN__/g,'function ').replace(/__VAR__/g,'var ').replace(/__LET__/g,'let ').replace(/__CONST__/g,'const ').replace(/__ELSEIF__/g,'else if').replace(/__TYPEOF__/g,'typeof ')
  //恢复 特殊字符
}
module.exports=function(...arry){
  console.log(...arry)
  try{
    new HDC(...arry)
  }catch(e){
    console.log(e)
  }
}
