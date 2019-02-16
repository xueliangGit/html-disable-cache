#!/usr/bin/env node

const program = require('commander');
const chalk = require('chalk')
const HDC =require('../src/index')
const path = require('path')
const fs = require('fs-extra')
const strBy = ['当你遇到难点的时候，你应该庆幸，你又要提高了！','喜欢折腾就开始造吧！','开拓你的思维，没有什么技术难点，只是没有想到而已！','技能是靠经验打磨出来的！','前端发展很快，一不留神就会跟不上的；所以请不断学习']

/**
 * Usage.
 */
program
.command('config [pathUrl]')
.description('Use of links')
// .alias('conf')
.action(function(pathUrl,...other){
  doUrl('config',pathUrl);
}).on('--help', function() {
  showinfo()
});
program
.command('url [pathUrl] [floderName]')
.description('Use configuration files')
// .alias('u')
.action(function(pathUrl,floderName){
  doUrl('url',pathUrl,floderName);
}).on('--help', function() {
  showinfo()
});
if (!process.argv.slice(2).length) {
  program.outputHelp(make_red);
}
program
.command('*')
.action(function(env){
  showinfo('uncaught command : '+env)
});

program.parse(process.argv);
function make_red(txt){
  return chalk.magentaBright(' \n',txt,' \n',getStr())
}
function getStr(){
  return chalk.gray(' \n',strBy[parseInt(Math.random()*strBy.length)],'  --by 无声',' \n')
}
function doUrl(type,paths,floderName){
  let bspath = process.cwd();
  switch (type) {
    case 'url':
      paths = typeof paths ==='string'?paths:''
      HDC(path.join(bspath,paths),floderName?{floderName}:{});
      break;
      case 'config':
      paths = typeof paths ==='string'?paths:'./HDC.config.js'
      let conf =  null
      try{
        conf = require(path.join(bspath,paths))
      }catch(e){
        console.log(chalk.blueBright('Html-disable-cache:\n    '),'没有找到文件',paths);
        process.exit(0)
      }
      HDC(conf);
      break
      default:
      showinfo('uncaught command')
        break;
    }
}
function showinfo(errInfo=''){
  if(errInfo)console.log(chalk.red(`ERROR: ${errInfo}` ))
  console.log()
  console.log(' Examples:')
  console.log()
  console.log(chalk.gray('    # Use of links'))
  console.log('    $ HDC url [path]')
  console.log()
  console.log(chalk.gray('    # Use configuration files'))
  console.log('    $ HDC conf <path>')
  console.log()
  console.log()
}