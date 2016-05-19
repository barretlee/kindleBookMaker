/**
 * @author Barret Lee<http://barretlee.com/about/>
 * @license MIT
 */
var Log = new require('log-color');
var log = new Log({level: 'debug', color: true});
var path = require('path');
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var mkdirp = require('mkdirp');

var originCfgPath = path.join(__dirname, '../config.simple.js');
var cfgPath = path.join(__dirname, '../config.js');
if(!fs.existsSync(cfgPath)) {
  log.warning('Please edit `config.js` in root path. Now using the default config file.');
  var cfg = fs.readFileSync(originCfgPath).toString();
  fs.writeFileSync(cfgPath, cfg);
}
var cfg = require('../config.js');