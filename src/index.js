/* eslint-disable */
const fs = require('fs-extra')
var path = require('path')
var glob = require('glob')
const cheerio = require('cheerio');
var minify = require('html-minifier').minify;
let distPath =''// 项目目录  path.join(__dirname,'../../build')
var conf = {
  show:false,
  floderName:'HDC'
}
let jsStr=fs.readFileSync(path.resolve(__dirname,'loadJsTem.js'), 'utf8');
/**
 * distPath 是静态文件html文件夹的路径
 * config{
 * floderName 放js的文件夹
 * }
 * */
module.exports=function(distResolvePath,config={}){
  distPath = distResolvePath
  if (!fs.pathExistsSync(distResolvePath)) {
    console.log('需要保证'+distResolvePath+'目录存在')
    process.exit(0)
  }
  Object.assign(conf,config)
  var cache_html = getMultiEntry(distResolvePath+'/**/**/*.html'); // 获得入口js文件
  console.log(cache_html)
  disCache(cache_html);
}

//---------some fn
function disCache(obj){
  var j=0
  for(let i in obj){
    j++
    var html = fs.readFileSync(obj[i], 'utf8')
    doHtml(html,obj[i],i)
  }
  if(!j){
    console.log('---没有要处理的HTML文件')
    process.exit(0);
  }
}
//-------- 处理html文件
function doHtml(html,htmlUrl,baseName){
  let $ = cheerio.load(html); // 加载一个 html 文本
  let scripts=$('script[src]')
  // 处理js
  let needLoadJs=[]
  scripts.each(function(i,v){
    console.log('--------')
    console.log(v.attribs.src)
    needLoadJs.push({url:v.attribs.src,type:'js'})
  })
  //处理 style
  let styls=$('link[rel="stylesheet"]')
  styls.each(function(i,v){
    console.log('--------')
    console.log(v.attribs.href)
    needLoadJs.push({url:v.attribs.href,type:'css'})
  })
  styls.remove()
  let baseNameUrl=path.normalize(baseName,'/').replace(distPath,'').split(path.sep).join('_')
  let jsName = './'+conf.floderName+'/'+baseNameUrl+'.js'
  // jsName=path.relative(path.normalize(baseName,'../'),path.join(distPath,jsName))
  if(needLoadJs.length){
    $('body').append(`
    <script type='text/javascript' language = 'javascript'>
    ${jsStr.replace("replaceUrl",path.relative(path.join(baseName,'../'),path.join(distPath,jsName)).split(path.sep).join('/'))}
    </script>
    `)
    $('script[src]').remove()
    let htmlData=minify($.html(),{removeComments: true,collapseWhitespace: true,minifyJS:true, minifyCSS:true})
    writeHtml(htmlUrl,htmlData)
    let jsData='__loadFn('+JSON.stringify(needLoadJs)+','+(+new Date())+');'
    writJs(path.join(distPath,jsName),jsData)
  }
}
function writJs(jsPath,data){
  console.log(jsPath)
  fs.exists(path.dirname(jsPath),function(exists){
    if(exists){
      _wJs(jsPath,data)
    }else{
      mkDirSync(distPath,path.relative(distPath,path.dirname(jsPath)))
      _wJs(jsPath,data)
    }
  })
}
function _wJs(jsPath,data){
  fs.writeFile(jsPath,data,function(err){
    if(err) throw err;
    if(conf.show){
      console.log(jsPath+'文件已建立');
    }
  });
}
function writeHtml (filePath,data) {
  fs.writeFile(filePath,data, function(err){
    if(err) throw err;
    if(conf.show){
      console.log(filePath+'文件处理完毕');
    }
  })
}

function mkDirSync (basePath, newPath) {
  let pathArr = newPath.split(path.sep)
  let newPathUrl = basePath
  console.log(pathArr,newPathUrl)
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