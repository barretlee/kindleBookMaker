/**
 * @author Barret Lee<http://barretlee.com/about/>
 * @license MIT
 */
var Log = new require('log-color');
var log = new Log({level: 'debug', color: true});
var path = require('path');
var fs = require('fs');
var ejs = require('ejs');
var spawn = require('child_process').spawn;
var cheerio = require('cheerio');

var originCfgPath = path.join(__dirname, '../config.simple.js');
var cfgPath = path.join(__dirname, '../config.js');

module.exports = {
  /**
   * process, run with config file
   */
  init: function() {
    var self = this;
    log.info('resoving config...');
    this.resolveCfg();
    log.info('resoving datas...');
    this.resoveData();
    log.info('resoving templates...');
    this.renderTpl();
    log.info('OPF book directory rendered.');

    var gen = spawn('bin/kindlegen', [this.entry + this.data.title + '.opf']);
    gen.stdout.pipe(process.stdout);
    gen.stderr.pipe(process.stderr);
    gen.on('close', function(code){
      if(code !== 0) {
        log.error('something error when generate book, see detail info over.')
      } else {
        log.info('success: ' + self.entry + self.data.title + '.opf');
      }
    });
  },

  /**
   * resolve config
   */
  resolveCfg: function() {
    if(!fs.existsSync(cfgPath)) {
      log.info('Please edit `config.js` in root path. Now using the default config file.');
      var cfg = fs.readFileSync(originCfgPath).toString();
      fs.writeFileSync(cfgPath, cfg);
    }
    var cfg = require('../config.js');
    var entry = cfg.entry, base, list = [];
    switch(typeof entry) {
      case 'string':
        entry = path.join(__dirname, '../', entry);
        break;
      case 'object':
        base = entry.base;
        list = entry.list;
        entry = path.join(__dirname, '../', base);
        break;
    }
    if(!fs.existsSync(entry) || !fs.statSync(entry).isDirectory()) {
      log.error('The `entry` path got something wrong.');
      process.exit(1);
    }
    if(!list.length) {
      fs.readdirSync(entry).forEach(function(item){
        if(/\.html$/.test(item)) {
          list.push(path.join(entry, item));
        }
      });
    }
    this.entry = entry;
    this.list = list;
    this.cfg = cfg;
  },

  /**
   * resolve config and pages data
   * automatic generate all page's toc
   */
  resoveData: function() {
    var list = this.list;
    var cfg = this.cfg;
    var pages = list.map(function(item){
      var code = fs.readFileSync(item).toString();
      var $ = cheerio.load(code, {
        xmlMode: true
      });
      var id = path.basename(item);
      var name = $('h1').text();
      var $anchors = ($('h2').length ? $('h2') : $('h3')) || [];
      var anchors = $anchors.map(function(index){
        var id = $(this).attr('id');
        if(!id) {
          var id = 'sid-' + (index + 1);
          $(this).attr('id', id);
        }
        return {
          id: id,
          name: $(this).text()
        }
      });
      (code != $.html()) && fs.writeFileSync(item, $.html(), 'utf-8');
      return {
        id: id,
        name: name,
        anchors: [].slice.call(anchors)
      }
    });
    var toc = [{
      id: 'toc.html',
      name: 'TOC'
    }];
    for(var i = 0, len = pages.length; i < len; i++) {
      if(pages[i].id === 'toc.html') {
        toc = pages.splice(i, 1);
        break;
      }
    }
    pages.unshift(toc[0]);
    var data = {
      pages: pages
    };
    for(var key in cfg.bookInfo) {
      data[key] = cfg.bookInfo[key];
    }
    this.data = data;
  },

  /**
   * render templates
   */
  renderTpl: function() {
    var entry = this.entry;
    var data = this.data;
    var tplPath = path.join(__dirname, '../tpl');
    fs.readdirSync(tplPath).forEach(function(item){
      var file = path.join(tplPath, item);
      if(item === 'content.opf') {
        item = data.title + '.opf';
      }
      var target = path.join(entry, item);
      if(fs.existsSync(target)) {
        log.info('rm: ' + target);
        fs.unlinkSync(target);
      }
      var str = ejs.render(fs.readFileSync(file).toString(), data);
      $ = cheerio.load(str, {
        xmlMode: true
      })
      $('meta').remove();
      str = $.html();
      fs.writeFileSync(target, str, 'utf-8');
    });
  }
};
