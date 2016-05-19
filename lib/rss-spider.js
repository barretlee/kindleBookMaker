/**
 * @author Barret Lee<http://barretlee.com/about/>
 * @license MIT
 *
 * @example
 *    rssLoader('https://imququ.com/rss.html').then(function(data){
 *      console.log(data[0]);
 *    }).catch(function(err){
 *      console.log(err);
 *    });
 */

var Log = new require('log-color');
var path = require('path');
var fs = require('fs');
var ejs = require('ejs');
var rssParser = require('parse-rss');
var mkdirp = require('mkdirp');
var util = require('./util');
var cheerio = require('cheerio');

var cfg = util.getConfig();
var log = new Log({
  level: 'debug',
  color: true
});
var entry = path.join(__dirname, '../', cfg.entry.base);

module.exports = function(rss) {
  mkdirp.sync(entry);
  return new Promise(function(resolve, reject) {
    rssParser(rss, function(err, sources) {
      if (err) {
        reject(err);
      } else {
        resolve(sources);
      }
    });
  })
  .then(saveFiles)
  .catch(function(err) {
    log.error(err);
  });
};

/**
 * save files
 */
function saveFiles(sources) {
  mkdirp.sync(path.join(entry, 'style'));
  var s = path.join(__dirname, './view/style/styles.css');
  var d = path.join(entry, 'style/styles.css');
  fs.createReadStream(s).pipe(fs.createWriteStream(d));
  var tpl = fs.readFileSync(path.join(__dirname, './view/layout.html')).toString();
  sources.forEach(function(item, index){
    var code = ejs.render(tpl, item);
    var $ = cheerio.load(code);
    $('script,link,meta').remove();
    $('.code span.line').wrap($('<div></div>'));
    code = $.html();
    fs.writeFileSync(path.join(entry, 'article-' + (index + 1) + '.html'), code, 'utf-8');
  });
  return sources;
}

