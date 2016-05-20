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
var rssParser = require('parse-rss');
var mkdirp = require('mkdirp');
var util = require('./util');

var cfg = util.getConfig();
var log = util.log;
var entry = path.join(__dirname, '../', cfg.entry.base);

module.exports = function(rss) {
  mkdirp.sync(entry);
  return new Promise(function(resolve, reject) {
    log.info('download uri: ' + rss);
    rssParser(rss, function(err, sources) {
      if (err) {
        log.info('parse uri: ' + rss);
        reject(err);
      } else {
        resolve(sources);
      }
    });
  })
  .then(function(data){
    return util.saveFiles(data, entry);
  })
  .catch(function(err) {
    log.error(err);
  });
};
