/**
 * @author Barret Lee<http://barretlee.com/about/>
 * @license MIT
 */
var Log = new require('log-color');
var path = require('path');
var fs = require('fs');
var ejs = require('ejs');
var mkdirp = require('mkdirp');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var cheerio = require('cheerio');
var util = require('./util');
var crypto = require('crypto');
var request = require('request');
var push2kindle = require('./push2kindle');

var cfg = util.getConfig();
var log = new Log({
  level: 'debug',
  color: true
});

module.exports = {
  /**
   * progress, run with config file
   */
  init: function(verbose, p2k) {
    var self = this;
    log.info('resoving config...');
    this.resolveCfg();
    log.info('resoving datas...');
    this.resoveData();
    log.info('resoving templates...');
    this.renderTpl();
    log.info('Download remote resources...');
    this.donloadResource();

    log.info('OPF book directory rendering...wait a minute. add `-v` see detail.');

    var name = path.join(this.entry, this.data.title + '.opf');
    var gen = spawn('bin/kindlegen', [name]);
    if(verbose) {
      gen.stdout.pipe(process.stdout);
      gen.stderr.pipe(process.stderr);
    }
    gen.on('close', function(code) {
      if (code !== 0) {
        log.warning('something error when generate book, see detail info over.');
      } else {
        // log.info('success: ' + name);
      }
      self.restore(p2k);
    });
  },

  /**
   * restore the origin file structure
   */
  restore: function(p2k) {
    var cfg = this.cfg;
    var entry = this.entry;
    var output = cfg.output || {
      base: entry,
      format: '[name]'
    };
    var cmd = 'rm -rf ' + path.join(entry, 'toc.*') + ' ' + path.join(entry, '*.opf');
    exec(cmd, function(err, stdout, stderr) {
      if (err) {
        log.err(err);
      } else {
        log.info('run cmd: ' + cmd);
      }
    });
    var name = this.data.title;
    var buildName = output.format.replace('[name]', name);
    mkdirp(output.base, function(err) {
      if (err) {
        log.error(err);
      } else {
        var src = path.join(entry, name + '.mobi');
        var build = path.join(__dirname, '../', output.base, buildName + '.mobi');
        if(fs.existsSync(src)) {
          fs.renameSync(src, build);
          log.info('generate book at: ' + build);
        } else {
          log.error('exit(1)');
        }
        // push to kindle
        if(p2k) {
          push2kindle([{
            filename: buildName + '.mobi',
            content: new Buffer(fs.readFileSync(build))
          }]);
        }
      }
    });
  },

  /**
   * resolve config
   */
  resolveCfg: function() {
    var entry = cfg.entry,
      base, list = [];
    switch (typeof entry) {
      case 'string':
        entry = path.join(__dirname, '../', entry);
        break;
      case 'object':
        base = entry.base;
        list = entry.list instanceof Array ? entry.list.map(function(item) {
          return path.join(entry.base, item);
        }) : [];
        entry = path.join(__dirname, '../', base);
        break;
    }
    if (!fs.existsSync(entry) || !fs.statSync(entry).isDirectory()) {
      log.error('The `entry` path got something wrong.');
      process.exit(1);
    }
    if (!list.length) {
      fs.readdirSync(entry).forEach(function(item) {
        if (/\.html$/.test(item)) {
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
    var pages = list.map(function(item) {
      var code = fs.readFileSync(item).toString();
      var $ = cheerio.load(code, {
        xmlMode: true
      });
      var id = path.basename(item);
      var name = $('h1').text();
      var $anchors = ($('h2').length ? $('h2') : $('h3')) || [];
      var anchors = $anchors.map(function(index) {
        var id = $(this).attr('id');
        if (!id) {
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
    dealWithTOC: {
      var toc = {
        id: 'toc.html',
        name: 'TOC'
      };
      for (var i = 0, len = pages.length; i < len; i++) {
        if (pages[i].id === 'toc.html') {
          toc = pages.splice(i, 1)[0];
          break;
        }
      }
      pages.unshift(toc);
    }
    dealWithData: {
      var data = {
        pages: pages
      };
      for (var key in cfg.bookInfo) {
        data[key] = cfg.bookInfo[key];
      }
      data.lang = data.lang === 'zh' ? 'zh' : 'en';
    }
    this.data = data;
  },

  /**
   * render templates
   */
  renderTpl: function() {
    var entry = this.entry;
    var data = this.data;
    var tplPath = path.join(__dirname, './tpl');
    fs.readdirSync(tplPath).forEach(function(item) {
      var file = path.join(tplPath, item);
      if (item === 'content.opf') {
        item = data.title + '.opf';
      }
      var target = path.join(entry, item);
      if (fs.existsSync(target)) {
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
  },

  /**
   * Download Remote Resources
   */
  donloadResource: function() {
    var self = this;
    var entry = this.entry;
    var reImgPath = /<img[\s\S]+?(src|data-src|data-lazyload)=('|")([\s\S]+?)\2/gmi;
    var reFigure = /<\/?figure[^>]*?>/gmi;
    mkdirp.sync(path.join(entry, 'resource'));
    fs.readdirSync(entry).forEach(function(item){
      if(!/\.html$/.test(item)) {
        return;
      }
      var code = fs.readFileSync(path.join(entry, item)).toString();
      code = code.replace(reFigure, '');
      code = code.replace(reImgPath, function() {
        var source = arguments[0];
        var img = arguments[3];
        if(!img || img.indexOf('//') == -1) {
          return source;
        }
        return source.replace(/src=("|')([\s\S]+?)\1/, function(){
          var uri = arguments[2];
          var ext = path.extname(uri);
          if(!uri || uri.indexOf('//') == -1) {
            return uri;
          }
          if(/^\/\/:/.test(uri)) {
            uri = 'http:' + uri;
          }
          var hash = crypto.createHash('sha256');
          hash.update(uri);
          var pos = './resource/' + hash.digest('hex').slice(0, 12) + ext;
          if(!fs.existsSync(path.join(entry, pos))) {
            log.info('download resource: ' + uri);
            request(uri).pipe(fs.createWriteStream(path.join(entry, pos)));
          }
          return 'src="' + pos + '"';
        });
      });
      fs.writeFileSync(path.join(entry, item), code, 'utf-8');
    });
  }
};


