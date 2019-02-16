#!/usr/bin/env node

process.title = 'html-disable-cache';
require('commander')
.version(require('../package').version, '-v, --version')
.usage('<command> [options]')
// .command('url',' Use of links')
// .command('config','Use configuration files')
.parse(process.argv)

require('./generate');