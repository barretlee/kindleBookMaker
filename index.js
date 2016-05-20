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
  name: 'help',
  alias: 'h',
  type: Boolean,
  description: 'help'
}, {
  name: 'verbose',
  alias: 'v',
  type: Boolean,
  description: 'detail about kindle generation.'
}, {
  name: 'uri',
  alias: 'u',
  type: String,
  multiple: true,
  description: '`url titleClass ConentClass RegExp`, eg: -u http://www.barretlee.com/blog/2016/04/28/javascript-performance-tester/ .post-title .post-content /<(link|meta)[^>]+?>/g'
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
  if(options.help) {
    console.log(cli.getUsage());
    process.exit(0);
  }
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
    if([1, 3, 4].indexOf(options.uri.length) === -1) {
      console.log(cli.getUsage());
      process.exit(0);
    }
    cfg.singlePage = cfg.singlePage || {};
    cfg.singlePage.uri = options.uri[0];
    if(options.uri.length >= 3) {
      cfg.singlePage.query = {
        title: options.uri[1],
        description: options.uri[2]
      };
    }
    if(options.uri[3]) {
      cfg.singlePage.query.reg = new Function('data', 'return data.replace(' + options.uri[3] + ', "");');
    }
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