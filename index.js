var uriSpider = require('./lib/uri-spider');
var rssSpider = require('./lib/rss-spider');
var bookGenerator = require('./lib/book-generator');
var commandLineArgs = require('command-line-args');
var util = require('./lib/util');
var fs = require('fs');
var path = require('path');
var cfg = util.getConfig();

var Log = new require('log-color');
var log = new Log({
  level: 'debug',
  color: true
});
var cli = commandLineArgs([{
  name: 'verbose',
  alias: 'v',
  type: Boolean,
  description: 'detail about kindle generation.'
}, {
  name: 'uri',
  alias: 'u',
  type: String,
  multiple: true,
  description: '`url titleClass ConentClass`, eg: -u http://www.barretlee.com/blog/2016/04/28/javascript-performance-tester/ .post-title .post-content'
}, {
  name: 'rss',
  alias: 'r',
  type: String,
  description: '`rss`, eg: -r http://www.barretlee.com/rss2.xml'
}, {
  name: 'directory',
  alias: 'd',
  type: String,
  description: '`directory`, eg: -d ./simple/KF8-Demo/'
}, {
  name: 'push2kindle',
  alias: 'p',
  type: Boolean,
  description: 'push to kindle'
}]);
var options = cli.parse();

~ function start() {
  if (!options.uri && !options.rss && !options.directory) {
    bookGenerator.init(options.verbose, options.push2kindle);
  }
  // directory detect
  if (options.directory) {
    if(!fs.existsSync(path.join(__dirname, options.directory))) {
      log.error(options.directory + ' is not exist.');
      process.exit(0);
    }
    cfg.entry.base = options.directory;
    if(!options.uri && !options.rss) {
      bookGenerator.init(options.verbose, options.push2kindle);
      return;
    }
  }
  // single page uri detect
  if (options.uri) {
    cfg.singlePage = cfg.singlePage || {};
    cfg.singlePage.uri = options.uri;
    var query = cfg.singlePage.query || {};
    if(!query.title || !query.description) {
      log.error('`config.js` err: `singlePage.query.title` and `singlePage.query.description` are required.');
      process.exit(0);
    }
    uriSpider(cfg.singlePage.uri, cfg.singlePage.query).then(function(data) {
      // console.log(data);
      bookGenerator.init(options.verbose, options.push2kindle);
    });
    return;
  }
  // rss detect
  if (options.rss) {
    rssSpider(options.rss).then(function(data) {
      // console.log(data);
      bookGenerator.init(options.verbose, options.push2kindle);
    });
    return;
  }
}();